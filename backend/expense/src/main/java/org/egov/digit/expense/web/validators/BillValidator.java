package org.egov.digit.expense.web.validators;

import static org.egov.digit.expense.config.Constants.BUSINESS_SERVICE_MASTERNAME;
import static org.egov.digit.expense.config.Constants.CODE_FILTER;
import static org.egov.digit.expense.config.Constants.HEADCODE_MASTERNAME;
import static org.egov.digit.expense.config.Constants.TENANT_MASTERNAME;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.egov.digit.expense.config.Configuration;
import org.egov.digit.expense.config.Constants;
import org.egov.digit.expense.repository.BillRepository;
import org.egov.digit.expense.util.MdmsUtil;
import org.egov.digit.expense.web.models.Bill;
import org.egov.digit.expense.web.models.BillCriteria;
import org.egov.digit.expense.web.models.BillDetail;
import org.egov.digit.expense.web.models.BillRequest;
import org.egov.digit.expense.web.models.BillSearchRequest;
import org.egov.digit.expense.web.models.LineItem;
import org.egov.digit.expense.web.models.enums.Status;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import com.jayway.jsonpath.JsonPath;

import digit.models.coremodels.Workflow;
import net.minidev.json.JSONArray;

@Service
public class BillValidator {

    @Autowired
    private MdmsUtil mdmsUtil;

    @Autowired
    private Configuration configs;
    
    @Autowired
    private BillRepository billRepository;

    public void validateCreateRequest(BillRequest billRequest) {

    	Map<String, String> errorMap = new HashMap<>();
    	
        Bill bill = billRequest.getBill();
        
        List<Bill> billsFromSearch = getBillsForValidation(billRequest, true);
        if(!CollectionUtils.isEmpty(billsFromSearch))
        	throw new CustomException("EG_EXPENSE_DUPLICATE_BILL","Active bill exists for the given combination of "
        			+ " businessService : " + bill.getBusinessService() + " and refernceId : " + bill.getReferenceId());
        
        validateWorkflow(billRequest, errorMap);
        
		Map<String, Map<String, JSONArray>> mdmsData = getMasterDataForValidation(billRequest, bill);
        validateBillAmountAndDate(bill, errorMap);
        validateTenantId(billRequest, mdmsData);
        validateMasterData(billRequest, errorMap, mdmsData);

        if (!CollectionUtils.isEmpty(errorMap))
            throw new CustomException(errorMap);

    }

    public List<Bill> validateUpdateRequest(BillRequest billRequest) {

        Map<String, String> errorMap = new HashMap<>();
        Bill bill = billRequest.getBill();
        
        validateWorkflow(billRequest, errorMap);
        
        List<Bill> billsFromSearch = getBillsForValidation(billRequest, false);
        if(CollectionUtils.isEmpty(billsFromSearch))
        	throw new CustomException("EG_EXPENSE_INVALID_BILL","The bill does not exists for the given combination of "
        			+ " businessService : " + bill.getId() + " and refernceId : " + bill.getTenantId());
        
        if(null == billRequest.getBill().getStatus())
        	billRequest.getBill().setStatus(billsFromSearch.get(0).getStatus());
        
		Map<String, Map<String, JSONArray>> mdmsData = getMasterDataForValidation(billRequest, bill);
        validateTenantId(billRequest, mdmsData);
        validateMasterData(billRequest, errorMap, mdmsData);

        if (!CollectionUtils.isEmpty(errorMap))
            throw new CustomException(errorMap);
        
        return billsFromSearch;
    }

    public void validateSearchRequest(BillSearchRequest billSearchRequest) {
    	
    	BillCriteria billCriteria = billSearchRequest.getBillCriteria();
        if (StringUtils.isEmpty(billCriteria.getBusinessService())
                && CollectionUtils.isEmpty(billCriteria.getReferenceIds())
                && CollectionUtils.isEmpty(billCriteria.getIds())
                && CollectionUtils.isEmpty(billCriteria.getBillNumbers()))
            throw new CustomException("EG_EXPENSE_BILL_SEARCH_ERROR",
                    "One of ids OR (referenceIds & businessService) OR (billNumbers & businessService) should be provided for a bill search");
        boolean isRefIdOrBillNoProvided = (!CollectionUtils.isEmpty(billCriteria.getReferenceIds())
				|| !CollectionUtils.isEmpty(billCriteria.getBillNumbers()));
        boolean isBusinessServiceProvided = !StringUtils.isEmpty(billCriteria.getBusinessService());
		
		if ((isRefIdOrBillNoProvided && !isBusinessServiceProvided)
				|| (isBusinessServiceProvided && !isRefIdOrBillNoProvided))
            throw new CustomException("EG_EXPENSE_BILL_SEARCH_ERROR",
                    "The values of referenceIds or billNumbers should be provided along with businessService for a bill search");
    }

    private void validateMasterData(BillRequest billRequest, Map<String, String> errorMap, Map<String, Map<String, JSONArray>> mdmsData) {

        Bill bill = billRequest.getBill();
        
        /* validating head code master data */
        List<String> BusinessCodeList = JsonPath.read(mdmsData.get(Constants.EXPENSE_MODULE_NAME).get(BUSINESS_SERVICE_MASTERNAME),CODE_FILTER);
        
		if (!BusinessCodeList.contains(bill.getBusinessService())) {
			errorMap.put("EG_EXPENSE_INVALID_BUSINESSSERVICE",
					"The business service value : " + bill.getBusinessService() + " is invalid");
		}
        
		List<String> headCodeList = JsonPath.read(mdmsData.get(Constants.EXPENSE_MODULE_NAME).get(HEADCODE_MASTERNAME),CODE_FILTER);

        Set<String> missingHeadCodes = new HashSet<>();
        BigDecimal billAmount = BigDecimal.ZERO;
        BigDecimal billPaidAmount = BigDecimal.ZERO;
        
		for (BillDetail billDetail : bill.getBillDetails()) {

			BigDecimal billDetailAmount = BigDecimal.ZERO;
			BigDecimal billDetailPaidAmount = BigDecimal.ZERO;

			for (LineItem item : billDetail.getLineItems()) {

				BigDecimal amount = item.getAmount();
				BigDecimal paidAmount = item.getPaidAmount();

				if (!headCodeList.contains(item.getHeadCode()))
					missingHeadCodes.add(item.getHeadCode());

                if (amount.compareTo(paidAmount) < 0)
					errorMap.put("EG_EXPENSE_LINEITEM_INVALID_AMOUNT",
							"The tax amount : " + amount + " cannot be lesser than the paid amount : " + paidAmount);
			}

			for (LineItem item : billDetail.getPayableLineItems()) {

				BigDecimal amount = item.getAmount();
				BigDecimal paidAmount = item.getPaidAmount();
				billDetailAmount = billDetailAmount.add(amount);
				billDetailPaidAmount = billDetailPaidAmount.add(paidAmount);

				if (!headCodeList.contains(item.getHeadCode()))
					missingHeadCodes.add(item.getHeadCode());

				if (amount.compareTo(paidAmount) < 0)
					errorMap.put("EG_EXPENSE_LINEITEM_INVALID_AMOUNT",
							"The tax amount : " + amount + " cannot be lesser than the paid amount : " + paidAmount);
			}

			billDetail.setTotalAmount(billDetailAmount);
			billDetail.setTotalPaidAmount(billDetailPaidAmount);
			billAmount = billAmount.add(billDetailAmount);
			billPaidAmount = billPaidAmount.add(billDetailPaidAmount);
		}
		bill.setTotalAmount(billAmount);
		bill.setTotalPaidAmount(billPaidAmount);

		if (!CollectionUtils.isEmpty(missingHeadCodes))
			errorMap.put("EG_EXPENSE_INVALID_HEADCODES", "The following head codes are invalid : " + missingHeadCodes);
	}

    private void validateTenantId(BillRequest billRequest, Map<String, Map<String, JSONArray>> mdmsData2) {

        Bill bill = billRequest.getBill();
        String rootTenantId = bill.getTenantId().split("\\.")[0];
        Map<String, Map<String, JSONArray>> mdmsData = mdmsUtil.fetchMdmsData(billRequest.getRequestInfo(),
                rootTenantId, Constants.TENANT_MODULE_NAME, Constants.TENANT_MDMS_MASTER_NAMES);


        List<String> tenantIdList=null;
        try {
            /* validating head code master data */
            tenantIdList = JsonPath.read(mdmsData.get(Constants.TENANT_MODULE_NAME).get(TENANT_MASTERNAME), CODE_FILTER);
        } catch (Exception e) {
            throw new CustomException("INVALID_TENANT", "Invalid tenantId [" + bill.getTenantId() + "]");
        }

        if (!tenantIdList.contains(bill.getTenantId())){
            throw new CustomException("INVALID_TENANT", "Invalid tenantId [" + bill.getTenantId() + "]");
        }
    }

	private void validateBillAmountAndDate( Bill bill, Map<String, String> errorMap) {
		
		Long billDate = null != bill.getBillDate() ? bill.getBillDate() : 0l;
		Long dueDate = null != bill.getDueDate() ? bill.getDueDate() : Long.MAX_VALUE;
        
        if(dueDate.compareTo(billDate) < 0)
        	errorMap.put("EG_EXPENSE_BILL_INVALID_DATE",
					"The due Date : " + billDate + " cannot be greater than the due Date : " + dueDate);
	}
    
	/**
     * check whether the workflow is enabled for the given business type
     *
     * @param businessServiceName
     * @return
     */
    public boolean isWorkflowActiveForBusinessService(String businessServiceName) {
        Map<String, Boolean> workflowActiveMap = configs.getBusinessServiceWorkflowStatusMap();
        boolean isWorkflowActiveForBusinessService = null != workflowActiveMap.get(businessServiceName)
                ? workflowActiveMap.get(businessServiceName)
                : false;
        return isWorkflowActiveForBusinessService;
    }
    
    private List<Bill> getBillsForValidation(BillRequest billRequest, Boolean isCreate){

    	Bill bill = billRequest.getBill();
    	BillCriteria billCriteria = BillCriteria.builder()
    			.statusNot(Status.INACTIVE.toString())
				.tenantId(bill.getTenantId())
				.build();
    	
		if (isCreate) {

			billCriteria.setReferenceIds(Stream.of(bill.getReferenceId()).collect(Collectors.toSet()));
			billCriteria.setBusinessService(bill.getBusinessService());
		} else {
			
			billCriteria.setIds(Stream.of(bill.getId()).collect(Collectors.toSet()));
		}
		
		
		
		BillSearchRequest billSearchRequest = BillSearchRequest.builder()
				.requestInfo(billRequest.getRequestInfo())
				.billCriteria(billCriteria)
				.build();
		
		return billRepository.search(billSearchRequest);
    }
    
	private void validateWorkflow(BillRequest billRequest, Map<String, String> errorMap) {
		
		Bill bill = billRequest.getBill();
		boolean isWorkflowActiveForBusinessService = isWorkflowActiveForBusinessService(bill.getBusinessService());

        if (isWorkflowActiveForBusinessService) {

            Workflow workflow = billRequest.getWorkflow();

			if (null == workflow)
				throw new CustomException("EG_BILL_WF_ERROR", "workflow is mandatory when worflow is active");

            if (null == workflow.getAction())
                errorMap.put("EG_BILL_WF_FIELDS_ERROR",
                        "workflow action is mandatory when worflow is active");
        }
	}

	private Map<String, Map<String, JSONArray>> getMasterDataForValidation(BillRequest billRequest, Bill bill) {
		
		Map<String, Map<String, JSONArray>> mdmsData = mdmsUtil.fetchMdmsData(billRequest.getRequestInfo(),
				bill.getTenantId().split("\\.")[0], Constants.EXPENSE_MODULE_NAME, Constants.MDMS_MASTER_NAMES);
        
		if(CollectionUtils.isEmpty(mdmsData)) {
			throw new CustomException("EG_EXPENSE_MDMS_ERROR", "MDMS Data not found for the tenantid : " + bill.getTenantId());
		}
		return mdmsData;
	}

}