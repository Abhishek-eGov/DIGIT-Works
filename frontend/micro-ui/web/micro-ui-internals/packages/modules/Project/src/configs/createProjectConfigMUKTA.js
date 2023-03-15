export const createProjectConfigMUKTA = {
    "tenantId" : "pg",
    "moduleName" : "commonUiConfig",
    "CreateProjectConfig" : [
      {
        "defaultValues" : {
          basicDetails_dateOfProposal : "",
          noSubProject_ulb : ""
        },
        "metaData" : {
          showNavs : false,
          currentFormCategory : false,
        },
        "form" : [
          {
          head: "",
          subHead: "",
          body: [
              {
                  inline: true,
                  label: "ES_COMMON_PROPOSAL_DATE",
                  isMandatory: false,
                  key: "basicDetails_dateOfProposal",
                  type: "date",
                  disable: false,
                  preProcess : {
                    updateDependent : ["populators.max"]
                  },
                  populators: { name: "basicDetails_dateOfProposal", max : "currentDate" },
              },
              {
                  inline: true,
                  label: "ES_COMMON_PROJECT_NAME",
                  isMandatory: true,
                  key: "basicDetails_projectName",
                  type: "text",
                  disable: false,
                  preProcess : {
                    convertStringToRegEx : ["populators.validation.pattern"]
                  },
                  populators: { name: "basicDetails_projectName", error: "PROJECT_PATTERN_ERR_MSG_PROJECT_NAME", validation: { pattern: /^[a-zA-Z0-9\/{ \/ .\- _$@#\' } ]*$/i, minlength : 2, maxlength : 32 }}
              },
              {
                  inline: true,
                  label: "PROJECT_PROJECT_DESC",
                  isMandatory: true,
                  key: "basicDetails_projectDesc",
                  type: "text",
                  disable: false,
                  preProcess : {
                    convertStringToRegEx : ["populators.validation.pattern"]
                  },
                  populators: { name: "basicDetails_projectDesc", error: "PROJECT_PATTERN_ERR_MSG_PROJECT_DESC", validation: { pattern: /^[a-zA-Z0-9\/{ \/ .\- _$@#\'() } ]*$/i, minlength : 2, maxlength : 256 }}
              }
              ]
          },
          {
            navLink:"Project_Details",
            head: ("WORKS_PROJECT_DETAILS"),
            body: [
              {
                inline: true,
                label: ("WORKS_LOR"),
                isMandatory: false,
                key: "noSubProject_letterRefNoOrReqNo",
                type: "text",
                disable: false,
                preProcess : {
                  convertStringToRegEx : ["populators.validation.pattern"]
                },
                populators: { name: "noSubProject_letterRefNoOrReqNo", error: ("PROJECT_PATTERN_ERR_MSG_PROJECT_LOR"), validation: { pattern: /^[a-zA-Z0-9\/{ \/ .\- _$@#\' } ]*$/i, minlength : 2, maxlength : 32 }}
              },
              {
                isMandatory: true,
                key: "noSubProject_typeOfProject",
                type: "radioordropdown",
                label: "WORKS_PROJECT_TYPE",
                disable: false,
                populators: {
                  name: "noSubProject_typeOfProject",
                  optionsKey: "name",
                  error: ("WORKS_REQUIRED_ERR"),
                  required: true,
                  optionsCustomStyle : {
                    top : "2.5rem"
                  },
                  mdmsConfig: {
                    masterName: "ProjectType",
                    moduleName: "works",
                    localePrefix: "COMMON_MASTERS",
                  },
                },
              },
              {
                isMandatory: false,
                key: "noSubProject_targetDemography",
                type: "radioordropdown",
                label: ("PROJECT_TARGET_DEMOGRAPHY"),
                disable: false,
                populators: {
                  name: "noSubProject_targetDemography",
                  optionsKey: "name",
                  error: ("WORKS_REQUIRED_ERR"),
                  required: false,
                  optionsCustomStyle : {
                    top : "2.5rem"
                  },
                  mdmsConfig: {
                    masterName: "TargetDemography",
                    moduleName: "works",
                    localePrefix: "COMMON_MASTERS",
                  },
                },
              },
              {
                inline: true,
                label: ("PROJECT_ESTIMATED_COST_IN_RS"),
                isMandatory: false,
                key: "noSubProject_estimatedCostInRs",
                type: "number",
                disable: false,
                preProcess: {
                  convertStringToRegEx: [
                    populators.validation.pattern
                  ]
                },
                populators: {
                    name: noSubProject_estimatedCostInRs,
                    error: PROJECT_PATTERN_ERR_MSG_PROJECT_ESTIMATED_COST,
                    validation: {
                      pattern: /^(?:0|[1-9]\d*)(?:\.(?!.*000)\d+)?$/,
                      maxlength : 32
                    }
                  }
              },
            ]
          },
          {
            navLink:"Project_Details",
            head: ("ES_COMMON_LOCATION_DETAILS"),
            body: [
              {
                inline: true,
                label: "WORKS_GEO_LOCATION",
                isMandatory: false,
                key: "noSubProject_geoLocation",
                type: "text",
                disable: false,
                populators: { name: "noSubProject_geoLocation", customIcon : "geolocation", error: ("WORKS_REQUIRED_ERR") }
              },
              {
                isMandatory: false,
                key: "noSubProject_ulb",
                type: "radioordropdown",
                label: ("ES_COMMON_ULB"),
                disable: true,
                preProcess : {
                  updateDependent : ["populators.options"]
                },
                populators: {
                  name: "noSubProject_ulb",
                  optionsKey: "i18nKey",
                  options: [],
                  error: "WORKS_REQUIRED_ERR",
                  required: true,
                  optionsCustomStyle : {
                    top : "2.5rem"
                  }
                },
              },
              {
                isMandatory: true,
                key: "noSubProject_ward",
                type: "radioordropdown",
                label: "PDF_STATIC_LABEL_ESTIMATE_WARD",
                disable: false,
                preProcess : {
                  updateDependent : ["populators.options"]
                },
                populators: {
                  name: "noSubProject_ward",
                  optionsKey: "i18nKey",
                  error: "WORKS_REQUIRED_ERR",
                  required: false,
                  optionsCustomStyle : {
                    top : "2.5rem"
                  },
                  options: []
                },
              },
              {
                isMandatory: true,
                key: "noSubProject_locality",
                type: "radioordropdown",
                label: "WORKS_LOCALITY",
                disable: false,
                preProcess : {
                  updateDependent : ["populators.options"]
                },
                populators: {
                  name: "noSubProject_locality",
                  optionsKey: "i18nKey",
                  error: "WORKS_REQUIRED_ERR",
                  required: false,
                  optionsCustomStyle : {
                    top : "2.5rem"
                  },
                  options: []
                },
              },
            ]
          },
          {
            navLink : "Project_Details",
            head: ("WORKS_FINANCIAL_DETAILS"),
            body: [
              {
                isMandatory: false,
                key: "noSubProject_fund",
                type: "radioordropdown",
                label: "WORKS_FUND",
                disable: false,
                populators: {
                  name: "noSubProject_fund",
                  optionsKey: "name",
                  error: ("WORKS_REQUIRED_ERR"),
                  required: false,
                  optionsCustomStyle : {
                    top : "2.5rem"
                  },
                  mdmsConfig: {
                    masterName: "Fund",
                    moduleName: "finance",
                    localePrefix: "COMMON_MASTERS_FUND",
                  },
                },
              },
              {
                isMandatory: false,
                key: "noSubProject_function",
                type: "radioordropdown",
                label: "WORKS_FUNCTION",
                disable: false,
                populators: {
                  name: "noSubProject_function",
                  optionsKey: "name",
                  error: ("WORKS_REQUIRED_ERR"),
                  required: false,
                  optionsCustomStyle : {
                    top : "2.5rem"
                  },
                  mdmsConfig: {
                    masterName: "Functions",
                    moduleName: "finance",
                    localePrefix: "COMMON_MASTERS_FUN",
                  },
                },
              },
              {
                isMandatory: false,
                key: "noSubProject_budgetHead",
                type: "radioordropdown",
                label: "WORKS_BUDGET_HEAD",
                disable: false,
                populators: {
                  name: "noSubProject_budgetHead",
                  optionsKey: "name",
                  error: ("WORKS_REQUIRED_ERR"),
                  required: false,
                  optionsCustomStyle : {
                    top : "2.5rem"
                  },
                  mdmsConfig: {
                    masterName: "BudgetHead",
                    moduleName: "finance",
                    localePrefix: "COMMON_MASTERS_BUDGET_HEAD",
                  },
                },
              },
              {
                isMandatory: false,
                key: "noSubProject_scheme",
                type: "radioordropdown",
                label: "WORKS_SCHEME",
                disable: false,
                populators: {
                  name: "noSubProject_scheme",
                  optionsKey: "name",
                  error: ("WORKS_REQUIRED_ERR"),
                  required: false,
                  optionsCustomStyle : {
                    top : "2.5rem"
                  },
                  mdmsConfig: {
                    masterName: "Scheme",
                    moduleName: "finance",
                    localePrefix: "COMMON_MASTERS_SCHEME",
                  },
                },
              },
              {
                isMandatory: false,
                key: "noSubProject_subScheme",
                type: "radioordropdown",
                label: "WORKS_SUB_SCHEME",
                disable: false,
                populators: {
                  name: "noSubProject_subScheme",
                  optionsKey: "code",
                  error: "WORKS_REQUIRED_ERR",
                  required: false,
                  optionsCustomStyle : {
                    top : "2.5rem"
                  },
                  options : []
                },
              },
            ]
          },
          {
            navLink : "Project_Details",
            head: "",
            body: [
                {
                    type: "documentUpload",
                    withoutLabel: true,
                    module: "Project",
                    populators:{
                        error: "WORKS_REQUIRED_ERR",
                        name: "noSubProject_docs",
                        customClass: "",
                        localePrefix: "PROJECT",
                    }
                }
            ]
          }
        ]
        }
    ]
  }