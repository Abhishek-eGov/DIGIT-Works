package org.egov.config;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.egov.tracer.config.TracerConfiguration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Import;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.TimeZone;

@Component
@Data
@Import({TracerConfiguration.class})
@NoArgsConstructor
@AllArgsConstructor
public class MusterRollServiceConfiguration {

    @Value("${app.timezone}")
    private String timeZone;

    //MDMS
    @Value("${egov.mdms.host}")
    private String mdmsHost;
    @Value("${egov.mdms.search.endpoint}")
    private String mdmsEndPoint;

    //Idgen Config
    @Value("${egov.idgen.host}")
    private String idGenHost;
    @Value("${egov.idgen.path}")
    private String idGenPath;

    //Idgen name
    @Value("${egov.idgen.musterroll.number.name}")
    private String idgenMusterRollNumberName;

    //Workflow config
    @Value("${musterroll.workflow.module.name}")
    private String musterRollWFModuleName;
    @Value("${musterroll.workflow.business.service}")
    private String musterRollWFBusinessService;
    @Value("${egov.workflow.host}")
    private String wfHost;
    @Value("${egov.workflow.transition.path}")
    private String wfTransitionPath;
    @Value("${egov.workflow.businessservice.search.path}")
    private String wfBusinessServiceSearchPath;
    @Value("${egov.workflow.processinstance.search.path}")
    private String wfProcessInstanceSearchPath;

    //Topic
    @Value("${musterroll.kafka.create.topic}")
    private String saveMusterRollTopic;
    @Value("${musterroll.kafka.update.topic}")
    private String updateMusterRollTopic;
    @Value("${musterroll.kafka.calculate.topic}")
    private String calculateMusterRollTopic;

    //search config
    @Value("${musterroll.default.offset}")
    private Integer musterDefaultOffset;
    @Value("${musterroll.default.limit}")
    private Integer musterDefaultLimit;
    @Value("${musterroll.search.max.limit}")
    private Integer musterMaxLimit;
    @Value("${muster.restricted.search.roles}")
    private String restrictedSearchRoles;

    //Attendance service
    @Value("${works.attendance.log.host}")
    private String attendanceLogHost;
    @Value("${works.attendance.log.search.endpoint}")
    private String attendanceLogEndpoint;
    @Value("${works.attendance.register.search.endpoint}")
    private String attendanceRegisterEndpoint;
    @Value("${works.attendance.register.search.limit}")
    private String attendanceRegisterSearchLimit;


    //Individual service
    @Value("${works.individual.host}")
    private String individualHost;
    @Value("${works.individual.search.endpoint}")
    private String individualSearchEndpoint;

    //Bankaccounts service
    @Value("${works.bankaccounts.host}")
    private String bankaccountsHost;
    @Value("${works.bankaccounts.search.endpoint}")
    private String bankaccountsSearchEndpoint;

    //contract service code
    @Value("${works.contract.service.code}")
    private String contractServiceCode;

    @PostConstruct
    public void initialize() {
        TimeZone.setDefault(TimeZone.getTimeZone(timeZone));
    }

}
