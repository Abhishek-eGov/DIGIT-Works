import { Link } from "react-router-dom";

//create functions here based on module name set in mdms(eg->SearchProjectConfig)
//how to call these -> Digit?.Customizations?.[masterName]?.[moduleName]
// these functions will act as middlewares
var Digit = window.Digit || {};

const businessServiceMap = {
  estimate: "estimate-approval-2",
};

export const UICustomizations = {
  updatePayload: (applicationDetails, data, action, businessService) => {
    if (businessService === businessServiceMap.estimate) {
      const workflow = {
        comment: data.comments,
        documents: data?.documents?.map((document) => {
          return {
            documentType: action?.action + " DOC",
            fileName: document?.[1]?.file?.name,
            fileStoreId: document?.[1]?.fileStoreId?.fileStoreId,
            documentUid: document?.[1]?.fileStoreId?.fileStoreId,
            tenantId: document?.[1]?.fileStoreId?.tenantId,
          };
        }),
        assignees: data?.assignees?.uuid ? [data?.assignees?.uuid] : null,
        action: action.action,
      };
      //filtering out the data
      Object.keys(workflow).forEach((key, index) => {
        if (!workflow[key] || workflow[key]?.length === 0) delete workflow[key];
      });

      return {
        estimate: applicationDetails,
        workflow,
      };
    }
  },
  enableHrmsSearch: (businessService, action) => {
    if (businessService === businessServiceMap.estimate) {
      return (
        action.action.includes("CHECK") ||
        action.action.includes("ADMIN") ||
        action.action.includes("APPROVE") ||
        action.action.includes("VERIFYANDFORWARD")
      );
    }
    return false;
  },
  getBusinessService: (moduleCode) => {
    if (moduleCode.includes("estimate")) {
      return businessServiceMap?.estimate;
    }

    return null;
  },
  SearchProjectConfig: {
    preProcess: (data) => {
      const createdFrom = Digit.Utils.pt.convertDateToEpoch(data.body.Projects[0]?.createdFrom);
      const createdTo = Digit.Utils.pt.convertDateToEpoch(data.body.Projects[0]?.createdTo);
      const projectType = data.body.Projects[0]?.projectType?.code;
      data.params = { ...data.params, tenantId: Digit.ULBService.getCurrentTenantId(), includeAncestors: true, createdFrom, createdTo };
      let name = data.body.Projects[0]?.name;
      name = name?.trim();
      delete data.body.Projects[0]?.createdFrom;
      delete data.body.Projects[0]?.createdTo;
      data.body.Projects[0] = { ...data.body.Projects[0], tenantId: Digit.ULBService.getCurrentTenantId(), projectType, name };

      return data;
    },
    postProcess: (responseArray) => {
      const listOfUuids = responseArray?.map((row) => row.auditDetails.createdBy);
      const uniqueUuids = listOfUuids?.filter(function (item, i, ar) {
        return ar.indexOf(item) === i;
      });
      const tenantId = Digit.ULBService.getCurrentTenantId();
      const reqCriteria = {
        url: "/user/_search",
        params: {},
        body: { tenantId, pageSize: 100, uuid: [...uniqueUuids] },
        config: {
          enabled: responseArray?.length > 0 ? true : false,
          select: (data) => {
            const usersResponse = data?.user;
            responseArray?.forEach((row) => {
              const uuid = row?.auditDetails?.createdBy;
              const user = usersResponse?.filter((user) => user.uuid === uuid);
              row.createdBy = user?.[0].name;
            });
            return responseArray;
          },
        },
      };
      const { isLoading: isPostProcessLoading, data: combinedResponse, isFetching: isPostProcessFetching } = Digit.Hooks.useCustomAPIHook(
        reqCriteria
      );

      return {
        isPostProcessFetching,
        isPostProcessLoading,
        combinedResponse,
      };
    },
    additionalCustomizations: (row, column, columnConfig, value, t) => {
      //here we can add multiple conditions
      //like if a cell is link then we return link
      //first we can identify which column it belongs to then we can return relevant result

      if (column.label === "WORKS_PRJ_SUB_ID") {
        return (
          <span className="link">
            <Link to={`/${window.contextPath}/employee/project/project-details?tenantId=${row.tenantId}&projectNumber=${value}`}>
              {String(value ? (column.translate ? t(column.prefix ? `${column.prefix}${value}` : value) : value) : t("ES_COMMON_NA"))}
            </Link>
          </span>
        );
      }

      if (column.label === "WORKS_PARENT_PROJECT_ID") {
        return value ? (
          <span className="link">
            <Link to={`/${window.contextPath}/employee/project/project-details?tenantId=${row.tenantId}&projectNumber=${value}`}>
              {String(value ? (column.translate ? t(column.prefix ? `${column.prefix}${value}` : value) : value) : t("ES_COMMON_NA"))}
            </Link>
          </span>
        ) : (
          t("ES_COMMON_NA")
        );
      }

      if (column.label === "WORKS_PROJECT_NAME") {
        return (
          <div class="tooltip">
            <span class="textoverflow" style={{ "--max-width": `${column.maxLength}ch` }}>
              {String(t(value))}
            </span>
            {/* check condtion - if length greater than 20 */}
            <span class="tooltiptext" style={{ whiteSpace: "nowrap" }}>
              {String(t(value))}
            </span>
          </div>
        );
      }
    },
    additionalCustomizationForMobile : (value, key, t) => {
      if(key === t("WORKS_PRJ_SUB_ID") || key === t("WORKS_PARENT_PROJECT_ID"))
          return `/works-ui/employee/project/project-details?tenantId=${Digit.ULBService.getCurrentTenantId() }&projectNumber=${value}`
    },
    getLink: (row,key) => {
       return `/${window.contextPath}/employee/project/project-details?tenantId=${Digit.ULBService.getCurrentTenantId() }&projectNumber=${row[key]}`
   },
    MobileDetailsOnClick : (row, t) =>{
      let link;
      Object.keys(row).map(key => {
          if(key === t("WORKS_PRJ_SUB_ID"))
             link = `/works-ui/employee/project/project-details?tenantId=${Digit.ULBService.getCurrentTenantId()}&projectNumber=${row[key]}`
      })
      return link
    },
    additionalValidations: (type, data, keys) => {
      if (type === "date") {
        return data[keys.start] && data[keys.end] ? () => new Date(data[keys.start]).getTime() < new Date(data[keys.end]).getTime() : true;
      }
    },
  },
  AttendanceInboxConfig: {
    preProcess: (data) => {
      const convertedStartDate = Digit.DateUtils.ConvertTimestampToDate(
        data.body.inbox?.moduleSearchCriteria?.musterRolldateRange?.range?.startDate,
        "yyyy-MM-dd"
      );
      const convertedEndDate = Digit.DateUtils.ConvertTimestampToDate(
        data.body.inbox?.moduleSearchCriteria?.musterRolldateRange?.range?.endDate,
        "yyyy-MM-dd"
      );
      const startDate = Digit.Utils.pt.convertDateToEpoch(convertedStartDate, "dayStart");
      const endDate = Digit.Utils.pt.convertDateToEpoch(convertedEndDate, "dayStart");
      const attendanceRegisterName = data.body.inbox?.moduleSearchCriteria?.attendanceRegisterName?.trim();
      const musterRollStatus = data.body.inbox?.moduleSearchCriteria?.musterRollStatus?.code;
      data.body.inbox = {
        ...data.body.inbox,
        tenantId: Digit.ULBService.getCurrentTenantId(),
        processSearchCriteria: { ...data.body.inbox.processSearchCriteria, tenantId: Digit.ULBService.getCurrentTenantId() },
        moduleSearchCriteria: { tenantId: Digit.ULBService.getCurrentTenantId(), startDate, endDate, musterRollStatus, attendanceRegisterName },
      };
      return data;
    },
    postProcess: (responseArray, uiConfig) => {
      const statusOptions = responseArray?.statusMap
        ?.filter((item) => item.applicationstatus)
        ?.map((item) => ({ code: item.applicationstatus, i18nKey: `COMMON_MASTERS_${item.applicationstatus}` }));
      if (uiConfig?.type === "filter") {
        let fieldConfig = uiConfig?.fields?.filter((item) => item.type === "dropdown" && item.populators.name === "musterRollStatus");
        if (fieldConfig.length) {
          fieldConfig[0].populators.options = statusOptions;
        }
      }
    },
    additionalCustomizations: (row, column, columnConfig, value, t) => {
      if (column.label === "ATM_MUSTER_ROLL_ID") {
        return (
          <span className="link">
            <Link
              to={`/works-ui/employee/attendencemgmt/view-attendance?tenantId=${Digit.ULBService.getCurrentTenantId()}&musterRollNumber=${value}`}
            >
              {String(value ? (column.translate ? t(column.prefix ? `${column.prefix}${value}` : value) : value) : t("ES_COMMON_NA"))}
            </Link>
          </span>
        );
      }
      if (column.label === "ATM_ATTENDANCE_WEEK") {
        const week = `${Digit.DateUtils.ConvertTimestampToDate(value?.startDate, "dd/MM/yyyy")}-${Digit.DateUtils.ConvertTimestampToDate(
          value?.endDate,
          "dd/MM/yyyy"
        )}`;
        return <div>{week}</div>;
      }
      if (column.label === "ATM_NO_OF_INDIVIDUALS") {
        return <div>{value?.length}</div>;
      }
      if (column.label === "ATM_SLA") {
        return parseInt(value) > 0 ? (
          <span className="sla-cell-success">{t(value) || ""}</span>
        ) : (
          <span className="sla-cell-error">{t(value) || ""}</span>
        );
      }
    },
    additionalCustomizationForMobile : (value, key, t) => {
      if(key === t("ATM_MUSTER_ROLL_ID"))
          return `/${window.contextPath}/employee/attendencemgmt/view-attendance?tenantId=${Digit.ULBService.getCurrentTenantId()}&musterRollNumber=${value}`
    },
    getLink: (row,key) => {
       return `/${window.contextPath}/employee/attendencemgmt/view-attendance?tenantId=${Digit.ULBService.getCurrentTenantId()}&musterRollNumber=${row[key]}`
   },
    MobileDetailsOnClick : (row, t) =>{
      let link;
      Object.keys(row).map(key => {
          if(key === t("ATM_MUSTER_ROLL_ID"))
             link = `/${window.contextPath}/employee/attendencemgmt/view-attendance?tenantId=${Digit.ULBService.getCurrentTenantId()}&musterRollNumber=${row[key]}`
      })
      return link
    },
    },
  SearchEstimateConfig: {
    preProcess: (data) => {
      const fromProposalDate = Digit.Utils.pt.convertDateToEpoch(data?.params?.fromProposalDate);
      const toProposalDate = Digit.Utils.pt.convertDateToEpoch(data?.params?.toProposalDate);
      const department = data?.params?.department?.code;
      data.params = { ...data.params, tenantId: Digit.ULBService.getCurrentTenantId(), fromProposalDate, toProposalDate, department };
      return data;
    },
    additionalCustomizations: (row, column, columnConfig, value, t) => {
      //here we can add multiple conditions
      //like if a cell is link then we return link
      //first we can identify which column it belongs to then we can return relevant result

      const getAmount = (item) => {
        return item.amountDetail.reduce((acc, row) => acc + row.amount, 0);
      };
      if (column.label === "WORKS_ESTIMATE_ID") {
        return (
          <span className="link">
            <Link
              to={`/${
                window.contextPath
              }/employee/estimate/estimate-details?tenantId=${Digit.ULBService.getCurrentTenantId()}&estimateNumber=${value}`}
            >
              {String(value ? (column.translate ? t(column.prefix ? `${column.prefix}${value}` : value) : value) : t("ES_COMMON_NA"))}
            </Link>
          </span>
        );
      }
      if (column.label === "WORKS_ESTIMATED_AMOUNT") {
        return row?.estimateDetails?.reduce((totalAmount, item) => totalAmount + getAmount(item), 0);
      }
    },
    additionalCustomizationForMobile : (value, key, t) => {
      if(key === t("WORKS_ESTIMATE_ID"))
          return `/${window.contextPath}/employee/estimate/estimate-details?tenantId=${Digit.ULBService.getCurrentTenantId()}&estimateNumber=${value}`
    },
    getLink: (row,key) => {
       return `/${window.contextPath}/employee/estimate/estimate-details?tenantId=${Digit.ULBService.getCurrentTenantId()}&estimateNumber=${row[key]}`
   },
    MobileDetailsOnClick : (row, t) =>{
      let link;
      Object.keys(row).map(key => {
          if(key === t("WORKS_ESTIMATE_ID"))
             link = `/${window.contextPath}/employee/estimate/estimate-details?tenantId=${Digit.ULBService.getCurrentTenantId()}&estimateNumber=${row[key]}`
      })
      return link
    },
  },
  SearchAttendanceConfig: {
    preProcess: (data) => {
      const fromDate = Digit.Utils.pt.convertDateToEpoch(data?.params?.fromDate);
      const toDate = Digit.Utils.pt.convertDateToEpoch(data?.params?.toDate);
      const musterRollStatus = data?.params?.musterRollStatus?.code;
      const status = data?.params?.status?.code;
      data.params = { ...data.params, tenantId: Digit.ULBService.getCurrentTenantId(), fromDate, toDate, musterRollStatus, status };
      return data;
    },
    additionalCustomizations: (row, column, columnConfig, value, t) => {
      if (column.label === "ATM_MUSTER_ROLL_NUMBER") {
        return (
          <span className="link">
            <Link
              to={`/${window.contextPath}/employee/attendencemgmt/view-attendance?tenantId=${Digit.ULBService.getCurrentTenantId()}&musterRollNumber=${value}`}
            >
              {String(value ? (column.translate ? t(column.prefix ? `${column.prefix}${value}` : value) : value) : t("ES_COMMON_NA"))}
            </Link>
          </span>
        );
      }
      if (column.label === "ATM_NO_OF_INDIVIDUALS") {
        return <div>{value?.length}</div>;
      }
    },
    additionalCustomizationForMobile : (value, key, t) => {
      if(key === t("ATM_MUSTER_ROLL_NUMBER"))
          return `/${window.contextPath}/employee/attendencemgmt/view-attendance?tenantId=${Digit.ULBService.getCurrentTenantId()}&musterRollNumber=${value}`
    },
    getLink: (row,key) => {
       return `/${window.contextPath}/employee/attendencemgmt/view-attendance?tenantId=${Digit.ULBService.getCurrentTenantId()}&musterRollNumber=${row[key]}`
   },
    MobileDetailsOnClick : (row, t) =>{
      let link;
      Object.keys(row).map(key => {
          if(key === t("ATM_MUSTER_ROLL_NUMBER"))
             link = `/${window.contextPath}/employee/attendencemgmt/view-attendance?tenantId=${Digit.ULBService.getCurrentTenantId()}&musterRollNumber=${row[key]}`
      })
      return link
    },
  },
  ProjectInboxConfig: {
    preProcess: (data) => {
      const createdFrom = Digit.Utils.pt.convertDateToEpoch(data.body.Projects[0]?.createdFrom);
      const createdTo = Digit.Utils.pt.convertDateToEpoch(data.body.Projects[0]?.createdTo);
      const projectType = data.body.Projects[0]?.projectType?.code;
      data.params = { ...data.params, tenantId: Digit.ULBService.getCurrentTenantId(), includeAncestors: true, createdFrom, createdTo };
      let name = data.body.Projects[0]?.name;
      name = name?.trim();
      delete data.body.Projects[0]?.createdFrom;
      delete data.body.Projects[0]?.createdTo;
      delete data.body.Projects[0]?.department;
      delete data.body.Projects[0]?.createdBy;
      delete data.body.Projects[0]?.status;
      data.body.Projects[0] = { ...data.body.Projects[0], tenantId: Digit.ULBService.getCurrentTenantId(), projectType, name };

      return data;
    },
    postProcess: (responseArray) => {
      const listOfUuids = responseArray?.map((row) => row.auditDetails.createdBy);
      const uniqueUuids = listOfUuids?.filter(function (item, i, ar) {
        return ar.indexOf(item) === i;
      });
      const tenantId = Digit.ULBService.getCurrentTenantId();
      const reqCriteria = {
        url: "/user/_search",
        params: {},
        body: { tenantId, pageSize: 100, uuid: [...uniqueUuids] },
        config: {
          enabled: responseArray?.length > 0 ? true : false,
          select: (data) => {
            const usersResponse = data?.user;
            responseArray?.forEach((row) => {
              const uuid = row?.auditDetails?.createdBy;
              const user = usersResponse?.filter((user) => user.uuid === uuid);
              row.createdBy = user?.[0].name;
            });
            return responseArray;
          },
        },
      };
      const { isLoading: isPostProcessLoading, data: combinedResponse, isFetching: isPostProcessFetching } = Digit.Hooks.useCustomAPIHook(
        reqCriteria
      );
      return {
        isPostProcessFetching,
        isPostProcessLoading,
        combinedResponse,
      };
    },
    additionalCustomizations: (row, column, columnConfig, value, t) => {
      if (column.label === "WORKS_PRJ_SUB_ID") {
        return (
          <span className="link">
            <Link to={`/${window.contextPath}/employee/project/project-details?tenantId=${row.tenantId}&projectNumber=${value}`}>
              {String(value ? (column.translate ? t(column.prefix ? `${column.prefix}${value}` : value) : value) : t("ES_COMMON_NA"))}
            </Link>
          </span>
        );
      }

      if (column.label === "WORKS_PARENT_PROJECT_ID") {
        return value ? (
          <span className="link">
            <Link to={`/${window.contextPath}/employee/project/project-details?tenantId=${row.tenantId}&projectNumber=${value}`}>
              {String(value ? (column.translate ? t(column.prefix ? `${column.prefix}${value}` : value) : value) : t("ES_COMMON_NA"))}
            </Link>
          </span>
        ) : (
          t("ES_COMMON_NA")
        );
      }
    },
    additionalCustomizationForMobile : (value, key, t) => {
      if(key === t("WORKS_PRJ_SUB_ID") || key === t("WORKS_PARENT_PROJECT_ID"))
          return `/works-ui/employee/project/project-details?tenantId=${Digit.ULBService.getCurrentTenantId() }&projectNumber=${value}`
    },
    getLink: (row,key) => {
       return `/${window.contextPath}/employee/project/project-details?tenantId=${Digit.ULBService.getCurrentTenantId() }&projectNumber=${row[key]}`
   },
    MobileDetailsOnClick : (row, t) =>{
      let link;
      Object.keys(row).map(key => {
          if(key === t("WORKS_PRJ_SUB_ID"))
             link = `/works-ui/employee/project/project-details?tenantId=${Digit.ULBService.getCurrentTenantId()}&projectNumber=${row[key]}`
      })
      return link
    },
    additionalValidations: (type, data, keys) => {
      if (type === "date") {
        return data[keys.start] && data[keys.end] ? () => new Date(data[keys.start]).getTime() < new Date(data[keys.end]).getTime() : true;
      }
    },
  },
  SearchWageSeekerConfig: {
    additionalCustomizations: (row, column, columnConfig, value, t) => {
      //here we can add multiple conditions
      //like if a cell is link then we return link
      //first we can identify which column it belongs to then we can return relevant result

      if (column.label === "MASTERS_WAGESEEKER_ID") {
        return (
          <span className="link">
            <Link to={`/${window.contextPath}/employee/masters/view-wageseeker?tenantId=${row.tenantId}&wageseekerId=${value?.[0]}`}>
              {value?.[0] && t("ES_COMMON_NA")}
            </Link>
          </span>
        );
      }
      if (column.label === "MASTERS_SOCIAL_CATEGORY") {
        return value ? <span style={{ whiteSpace: "nowrap" }}>{String(t(`MASTERS_${value}`))}</span> : t("ES_COMMON_NA");
      }
      if (column.label === "MASTERS_ULB") {
        return value ? <span style={{ whiteSpace: "nowrap" }}>{String(t(Digit.Utils.locale.getCityLocale(value)))}</span> : t("ES_COMMON_NA");
      }
      if (column.label === "MASTERS_WARD") {
        return value ? (
          <span style={{ whiteSpace: "nowrap" }}>{String(t(Digit.Utils.locale.getMohallaLocale(value, row?.tenantId)))}</span>
        ) : (
          t("ES_COMMON_NA")
        );
      }
    },
    additionalValidations: (type, data, keys) => {
      if (type === "date") {
        return data[keys.start] && data[keys.end] ? () => new Date(data[keys.start]).getTime() < new Date(data[keys.end]).getTime() : true;
      }
    },
  },
  SearchOrganisationConfig: {
    additionalCustomizations: (row, column, columnConfig, value, t) => {
      //here we can add multiple conditions
      //like if a cell is link then we return link
      //first we can identify which column it belongs to then we can return relevant result

      if (column.label === "MASTERS_ORGANISATION_ID") {
        return (
          <span className="link">
            <Link to={`/${window.contextPath}/employee/masters/view-organisation?tenantId=${row.tenantId}&orgId=${value?.[0]}`}>
              {value?.[0] && t("ES_COMMON_NA")}
            </Link>
          </span>
        );
      }
      if (column.label === "MASTERS_STATUS") {
        return value ? <span style={{ whiteSpace: "nowrap" }}>{String(t(`MASTERS_${value}`))}</span> : t("ES_COMMON_NA");
      }
      if (column.label === "MASTERS_ORGANISATION_TYPE") {
        return value ? <span style={{ whiteSpace: "nowrap" }}>{String(t(`MASTERS_${value}`))}</span> : t("ES_COMMON_NA");
      }
      if (column.label === "MASTERS_ORGANISATION_SUB_TYPE") {
        return value ? <span style={{ whiteSpace: "nowrap" }}>{String(t(`MASTERS_${value}`))}</span> : t("ES_COMMON_NA");
      }
      if (column.label === "MASTERS_LOCATION") {
        return value ? (
          <span style={{ whiteSpace: "nowrap" }}>
            {String(`${t(Digit.Utils.locale.getCityLocale(value))} ${t(Digit.Utils.locale.getMohallaLocale(value, row?.tenantId))}`)}
          </span>
        ) : (
          t("ES_COMMON_NA")
        );
      }
    },
    additionalValidations: (type, data, keys) => {
      if (type === "date") {
        return data[keys.start] && data[keys.end] ? () => new Date(data[keys.start]).getTime() < new Date(data[keys.end]).getTime() : true;
      }
    },
  },
};
