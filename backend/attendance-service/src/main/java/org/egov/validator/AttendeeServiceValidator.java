package org.egov.validator;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.egov.tracer.model.CustomException;
import org.egov.web.models.AttendanceRegister;
import org.egov.web.models.AttendeeCreateRequest;
import org.egov.web.models.AttendeeDeleteRequest;
import org.egov.web.models.IndividualEntry;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class AttendeeServiceValidator {
    public void validateAttendeeCreateRequestParameters(AttendeeCreateRequest attendeeCreateRequest) {
            List<IndividualEntry> attendeeList = attendeeCreateRequest.getAttendees();

            if (attendeeList == null || attendeeList.size() == 0) {
                throw new CustomException("ATTENDEES", "ATTENDEE object is mandatory");
            }

            String tenantId = attendeeList.get(0).getTenantId();
            for (IndividualEntry attendee : attendeeList) {

                //validate request parameters for each attendee object

                if (ObjectUtils.isEmpty(attendee)) {
                    throw new CustomException("ATTENDEE", "ATTENDEE is mandatory");
                }
                if (StringUtils.isBlank(attendee.getRegisterId())) {
                    throw new CustomException("REGISTER_ID", "Register id is mandatory");
                }

                if (StringUtils.isBlank(attendee.getIndividualId())) {
                    throw new CustomException("INDIVIDUAL_ID", "Individual id is mandatory");
                }

                if (StringUtils.isBlank(attendee.getTenantId())) {
                    throw new CustomException("TENANT_ID", "Tenant id is mandatory");
                }

                //validate if all attendee in the list have the same tenant id
                if (!attendee.getTenantId().equals(tenantId)) {
                    throw new CustomException("TENANT_ID", "All Attendees to be enrolled or de enrolled must have the same tenant id. Please raise new request for different tenant id");
                }

            }
        }


    public void validateAttendeeDeleteRequestParameters(AttendeeDeleteRequest attendeeDeleteRequest) {
    {
        List<IndividualEntry> attendeeList = attendeeDeleteRequest.getAttendees();

        if(attendeeList==null || attendeeList.size()==0){
            throw new CustomException("ATTENDEES", "ATTENDEE object is mandatory");
        }

        String tenantId = attendeeList.get(0).getTenantId();
        for (IndividualEntry attendee : attendeeList) {

            //validate request parameters for each attendee object

            if (ObjectUtils.isEmpty(attendee)) {
                throw new CustomException("ATTENDEE", "ATTENDEE is mandatory");
            }
            if (StringUtils.isBlank(attendee.getRegisterId())) {
                throw new CustomException("REGISTER_ID", "Register id is mandatory");
            }

            if (StringUtils.isBlank(attendee.getIndividualId())) {
                throw new CustomException("INDIVIDUAL_ID", "Individual id is mandatory");
            }

            if (StringUtils.isBlank(attendee.getTenantId())) {
                throw new CustomException("TENANT_ID", "Tenant id is mandatory");
            }

            //validate if all attendee in the list have the same tenant id
            if (!attendee.getTenantId().equals(tenantId)) {
                throw new CustomException("TENANT_ID", "All Attendees to be enrolled or de enrolled must have the same tenant id. Please raise new request for different tenant id");
            }

        }

            //check for duplicate attendee objects (with same registerId and individualId)
            //1. create unique identity list
            //2. check for duplicate entries
            List<String> uniqueIds = new ArrayList<>();
            for (IndividualEntry attendee : attendeeList) {
                uniqueIds.add(attendee.getRegisterId() + " " + attendee.getIndividualId());
            }
            for (String id : uniqueIds) {
                long count = uniqueIds.stream().filter(uniqueId -> id.equals(uniqueId)).count();
                if (count > 1) {
                    throw new CustomException("ATTENDEE", "Duplicate Attendee Objects present in request");
                }
            }
        }
    }


    public void validateCreateAttendee(AttendeeCreateRequest attendeeCreateRequest
            , List<IndividualEntry> attendeeListFromDB, List<AttendanceRegister> attendanceRegisterListFromDB) {

        List<IndividualEntry> attendeeListFromRequest = attendeeCreateRequest.getAttendees();


        // attendee cannot be added to register if register's end date has passed
        BigDecimal currentDate = new BigDecimal(System.currentTimeMillis());
        for (AttendanceRegister attendanceRegister : attendanceRegisterListFromDB) {
            int dateComparisonResult = attendanceRegister.getEndDate().compareTo(currentDate);
            if (dateComparisonResult < 0) {
                throw new CustomException("END_DATE", "Attendee cannot be enrolled as END_DATE of register id " + attendanceRegister.getId() + " has already passed.");
            }
        }

        //attendee enrollment date, if present in request should be after start date and before end date of register
        for (AttendanceRegister attendanceRegister : attendanceRegisterListFromDB) {
            for (IndividualEntry attendeeFromRequest : attendeeListFromRequest) {
                if (attendanceRegister.getId().equals(attendeeFromRequest.getRegisterId())) {
                    if (attendeeFromRequest.getEnrollmentDate() != null) {
                        int startDateCompare = attendeeFromRequest.getEnrollmentDate().compareTo(attendanceRegister.getStartDate());
                        int endDateCompare = attendanceRegister.getEndDate().compareTo(attendeeFromRequest.getEnrollmentDate());
                        if (startDateCompare < 0 || endDateCompare < 0) {
                            throw new CustomException("ENROLLMENT_DATE"
                                    , "Enrollment date for attendee : " + attendeeFromRequest.getIndividualId() + " must be within start and end date of the register");
                        }
                    }
                }
            }
        }

        //check if attendee is already enrolled to the register
        currentDate = new BigDecimal(System.currentTimeMillis());
        for (IndividualEntry attendeeFromRequest : attendeeListFromRequest) {
            for (IndividualEntry attendeeFromDB : attendeeListFromDB) {
                if (attendeeFromRequest.getRegisterId().equals(attendeeFromDB.getRegisterId())
                        && attendeeFromRequest.getIndividualId().equals(attendeeFromDB.getIndividualId())) {//attendee present in db
                    if (attendeeFromDB.getDenrollmentDate() == null) { // already enrolled to the register
                        throw new CustomException("INDIVIDUAL_ID", "Attendee " + attendeeFromRequest.getIndividualId() + " is already enrolled in the register " + attendeeFromRequest.getRegisterId());

                    }
                }
            }
        }

    }

    public void validateDeleteAttendee(AttendeeDeleteRequest attendeeDeleteRequest,
                                       List<IndividualEntry> attendeeListFromDB, List<AttendanceRegister> attendanceRegisterListFromDB) {

        List<IndividualEntry> attendeeListFromRequest = attendeeDeleteRequest.getAttendees();


        //attendee de-enrollment date, if present in request should be before end date and after start date of register
        for (AttendanceRegister attendanceRegister : attendanceRegisterListFromDB) {
            for (IndividualEntry attendeeFromRequest : attendeeListFromRequest) {
                if (attendeeFromRequest.getDenrollmentDate() != null) {
                    int startDateCompare = attendeeFromRequest.getDenrollmentDate().compareTo(attendanceRegister.getStartDate());
                    int endDateCompare = attendanceRegister.getEndDate().compareTo(attendeeFromRequest.getDenrollmentDate());
                    if (startDateCompare < 0 || endDateCompare < 0) {
                        throw new CustomException("DE ENROLLMENT_DATE"
                                , "De enrollment date for attendee : " + attendeeFromRequest.getIndividualId() + " must be between start date and end date of the register");
                    }
                }
            }
        }

        //check if attendee is already de-enrolled from the register
        boolean attendeeDeEnrolled = true;
        BigDecimal currentDate = new BigDecimal(System.currentTimeMillis());
        for (IndividualEntry attendeeFromRequest : attendeeListFromRequest) {
            for (IndividualEntry attendeeFromDB : attendeeListFromDB) {
                if (attendeeFromRequest.getRegisterId().equals(attendeeFromDB.getRegisterId()) && attendeeFromDB.getIndividualId().equals(attendeeFromRequest.getIndividualId())) { //attendee present in db
                    if (attendeeFromDB.getDenrollmentDate() == null) {
                        attendeeDeEnrolled = false;
                        break;
                    }
                }
            }
            if (attendeeDeEnrolled) {
                throw new CustomException("INDIVIDUAL_ID", "Attendee " + attendeeFromRequest.getIndividualId() + " is already de enrolled from the register " + attendeeFromRequest.getRegisterId());
            }
        }

    }
}

