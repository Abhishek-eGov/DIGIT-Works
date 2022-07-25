import { useQuery } from "react-query";
import { WSService } from "../../services/elements/WS";
import { PTService } from "../../services/elements/PT";

const getDate = (epochdate) => {
return ( epochdate ?
new Date(epochdate).getDate() + "/" + (new Date(epochdate).getMonth() + 1) + "/" + new Date(epochdate).getFullYear().toString() : "NA")
}
const getBillingPeriod = (fromPeriod, toPeriod) => {
  let from = new Date(fromPeriod).getFullYear().toString();
  let to = new Date(toPeriod).getFullYear().toString();
  return fromPeriod && toPeriod ? "FY " + from + "-" + to : "NA";
}

const getAddress = (address, t) => {
  return `${address?.doorNo ? `${address?.doorNo}, ` : ""} ${address?.street ? `${address?.street}, ` : ""}${
    address?.landmark ? `${address?.landmark}, ` : ""
  }${t(address?.locality.code)}, ${t(address?.city.code || address?.city)}${t(address?.pincode) ? `, ${address.pincode}` : " "}`
} 

const combineResponse = (WaterConnections, properties, billData, t) => {
  if(WaterConnections?.length >= 0 && properties?.length >= 0 && billData?.length >= 0)
  return WaterConnections.map((app) => ({
    ConsumerNumber : app?.connectionNo,
    ConsumerName : app?.connectionHolders ? app?.connectionHolders.map((owner) => owner?.name).join(",") : properties.filter((prop) => prop.propertyId === app?.propertyId)[0]?.owners?.map((ow) => ow.name).join(","),
    Address: getAddress((properties.filter((prop) => prop.propertyId === app?.propertyId)[0]).address, t),
    AmountDue : billData ? (billData?.filter((bill) => bill?.consumerCode === app?.connectionNo)[0]?.totalAmount ? billData?.filter((bill) => bill?.consumerCode === app?.connectionNo)[0]?.totalAmount : "NA")  : "NA",
    DueDate : billData ? getDate(billData?.filter((bill) => bill?.consumerCode === app?.connectionNo)[0]?.billDetails?.[0]?.expiryDate) : "NA",
    BillingPeriod : billData ?  getBillingPeriod(billData?.filter((bill) => bill?.consumerCode === app?.connectionNo)[0]?.billDetails?.[0]?.fromPeriod , billData?.filter((bill) => bill?.consumerCode === app?.connectionNo)[0]?.billDetails?.[0]?.toPeriod) : "NA",
    ServiceName: billData ?  (t(`WS_SERVICE_TYPE_${billData?.filter((bill) => bill?.consumerCode === app?.connectionNo)[0]?.businessService}`)) : "NA",
    privacy: {
      Address : {
        uuid: properties.filter((prop) => prop.propertyId === app?.propertyId)[0]?.propertyId, 
        fieldName: ["doorNo" , "street" , "landmark"], 
        model: "Property"
      }
    }
    }))
  else
  return [];
}

const useMyBillsWaterSearch = ({tenantId, filters = {}, BusinessService="WS", t }, config = {}) => {
  const response = useQuery(['WS_SEARCH', tenantId, filters, BusinessService], async () => await WSService.search({tenantId, filters: { ...filters }, businessService:BusinessService})
  , config)
    let propertyids = "";
    let consumercodes = "";
    if(BusinessService === "WS")
    response?.data?.WaterConnection?.forEach( item => {
        propertyids=propertyids+item?.propertyId+(",");
        consumercodes=consumercodes+item?.connectionNo+",";
    })
    else
    response?.data?.SewerageConnections?.forEach( item => {
      propertyids=propertyids+item?.propertyId+(",");
      consumercodes=consumercodes+item?.connectionNo+",";
    })
    let propertyfilter = { propertyIds : propertyids.substring(0, propertyids.length-1),}
    if(propertyids !== "" && filters?.locality) propertyfilter.locality = filters?.locality;
    config={enabled:propertyids!==""?true:false}
  const properties = useQuery(['WSP_SEARCH', tenantId, propertyfilter,BusinessService], async () => await PTService.search({ tenantId: null , filters:propertyfilter, auth:filters?.locality?false:true })
  , config)
  const billData = useQuery(['BILL_SEARCH', tenantId, consumercodes,BusinessService ], async () => await Digit.PaymentService.fetchBill(tenantId, {
    businessService: BusinessService,
    consumerCode: consumercodes.substring(0, consumercodes.length-1),
  })
  , config)

  return (response?.isLoading || properties?.isLoading || billData?.isLoading) ? undefined : ( billData?.data?.Bill?.length === 0 || billData?.data?.Bill === undefined ? [] : combineResponse(response?.data?.WaterConnection,properties?.data?.Properties,billData?.data?.Bill, t));
}

export default useMyBillsWaterSearch;