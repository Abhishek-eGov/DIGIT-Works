import AttendanceService from "../../elements/Attendance";

const attendanceTypes = {
  0 : 'zero',
  1 : 'full',
  0.5 : 'half'
 }

const getWeekDates = (data) => {
  let weekDates = {}
  if(data?.individualEntries.length > 0) {
    const attendanceEntry = data?.individualEntries[0]?.attendanceEntries
    attendanceEntry.forEach(item => {
      weekDates[`${Digit.DateUtils.getDayfromTimeStamp(item?.time)}`] = Digit.DateUtils.ConvertTimestampToDate(item?.time, 'MMM d')
    })
  }
  return weekDates
}

const getWeekAttendance = (data) => {
  let weekAttendance = {}
  if(data.length > 0) {
    data.forEach(item => {
      weekAttendance[`${Digit.DateUtils.getDayfromTimeStamp(item?.time)}`] = attendanceTypes[item.attendance]
    })
  }
  return weekAttendance
}

const getAttendanceTableData = (data) => {
  let tableData = {}
  if(data?.individualEntries.length > 0) {
    data?.individualEntries.forEach((item, index) => {
      let tableRow = {}
      tableRow.id = item.id
      tableRow.sno = index + 1
      tableRow.registerId = data?.registerId
      tableRow.actualWorkingDays = item?.totalAttendance
      tableRow.nameOfIndividual = item?.additionalDetails?.userName || 'Piyush HarjitPal'
      tableRow.guardianName = item?.additionalDetails?.fatherName  || 'HarjitPal'
      tableRow.skill = item?.additionalDetails?.skillCode || 'SKILL_1'
      tableRow.amount = 2000 //get this amount from mdms data
      tableRow.modifiedAmount = 2000 //get this amount from mdms data
      tableRow.modifiedWorkingDays = item?.totalAttendance
      tableRow.bankAccountDetails = {
        accountNo : '880182873839-SBIN0001237', //item?.additionalDetails?.bankDetails, split by - and assign to account and ifsc
        ifscCode : null
      }
      tableRow.aadharNumber = item?.additionalDetails?.aadharNumber|| '9099-1234-1234' 
      tableRow.attendence = getWeekAttendance(item?.attendanceEntries)
      tableData[item.id] = tableRow
    });

    //Add row to show Total data
    let totalRow = {}
    totalRow.type = "total"
    totalRow.sno = "ATM_TOTAL"
    totalRow.registerId = "DNR"
    totalRow.nameOfIndividual = "DNR"
    totalRow.guardianName = "DNR"
    totalRow.skill = ""
    totalRow.amount = 0
    totalRow.modifiedAmount = 0
    totalRow.actualWorkingDays = 0
    totalRow.modifiedWorkingDays = 0
    totalRow.bankAccountDetails = ""
    totalRow.aadharNumber = "DNR"
    totalRow.attendence = { Sun: 0, Sat: 0, Fri: 0, Thu: 0, Wed: 0, Tue: 0, Mon: 0 }
            
    tableData['total'] = totalRow
  }
  return tableData
}

const transformViewDataToApplicationDetails = (t, data, workflowDetails) => {
  const musterRoll = data.musterRolls[0]
  const attendanceTableData = getAttendanceTableData(musterRoll)
  const weekDates = getWeekDates(musterRoll)
  const registrationDetails = {
    title: "ATM_REGISTRATION_DETAILS",
    asSectionHeader: true,
    values: [
      { title: "WORKS_ORG_NAME", value: musterRoll?.additionalDetails?.orgName || t("NA") },
      { title: "REGISTER_ID", value: musterRoll?.additionalDetails?.attendanceRegisterNo || t("NA")},
      { title: "REGISTER_NAME", value: musterRoll?.additionalDetails?.attendanceRegisterName || t("NA") },
    ],
    additionalDetails: {
      table: {
        weekTable: {
          tableHeader: "ATM_ENROLLED_USERS",
          renderTable: true,
          tableData: attendanceTableData,
          weekDates: weekDates
        },
      },
      dateRange: {
        title: "ATM_ATTENDENCE_FOR_WEEK",
        epochStartDate: musterRoll?.startDate,
        epochEndDate: musterRoll?.endDate,
        disabled: true
      },
    },
  };
  
  const applicationDetails = { applicationDetails: [registrationDetails] };

  return {
    applicationDetails,
    applicationData: musterRoll,
    processInstancesDetails: workflowDetails?.ProcessInstances,
    workflowDetails
  }
};

const workflowDataDetails = async (tenantId, businessIds) => {
    const response = await Digit.WorkflowService.getByBusinessId(tenantId, businessIds);
    return response;
}

export const fetchAttendanceDetails = async (t, tenantId, searchParams) => {
  try {
    const response = await AttendanceService.search(tenantId, searchParams);
    const workflowDetails = await workflowDataDetails(tenantId, searchParams.musterRollNumber);
    return transformViewDataToApplicationDetails(t, response, workflowDetails)
  } catch (error) {
      console.log('error', error);
      throw new Error(error?.response?.data?.Errors[0].message);
  }
};