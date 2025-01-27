package org.egov.digit.expense.calculator.web.models;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import digit.models.coremodels.ProcessInstance;
import org.springframework.validation.annotation.Validated;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A Object which holds the info about the expense details
 */
@Schema(description = "A Object which holds the info about the expense details")
@Validated
@javax.annotation.Generated(value = "org.egov.codegen.SpringBootCodegen", date = "2023-04-11T13:19:59.852+05:30[Asia/Kolkata]")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PurchaseBill {
	@JsonProperty("id")
	@Valid
	private String id;

	@JsonProperty("tenantId")
	@NotNull
	@Size(min = 2, max = 64)
	private String tenantId = null;

	@JsonProperty("invoiceDate")
	@Valid
	private Long invoiceDate;

	@JsonProperty("invoiceNumber")
	@Valid
	private String invoiceNumber;

	@JsonProperty("referenceId")
	@Size(min = 2, max = 128)
	private String referenceId;

	@JsonProperty("billNumber")
	private String billNumber;
	
	@JsonProperty("contractNumber")
	@Valid
	private String contractNumber;
	
	@JsonProperty("projectId")
	@Valid
	private String projectId;
	
	@JsonProperty("status")
	@Size(min = 2, max = 64)
	private String status;

	@JsonProperty("billDetails")
	@NotNull
	@Valid
	private List<BillDetail> billDetails;

	@JsonProperty("additionalDetails")
	private Object additionalDetails;

	@JsonProperty("auditDetails")

	@Valid
	private AuditDetails auditDetails;
	@JsonProperty("documents")
	@Valid
	private List<Document> documents = null;

	@JsonProperty("workflow")
	private Workflow workflow;

	public PurchaseBill addDocumentsItem(Document documentsItem) {
		if (this.documents == null) {
			this.documents = new ArrayList<>();
		}
		this.documents.add(documentsItem);
		return this;
	}

	public PurchaseBill addBillDetailsItem(BillDetail billDetailsItem) {

		if (null == this.billDetails)
			this.billDetails = new ArrayList<>();

		this.billDetails.add(billDetailsItem);
		return this;
	}

}
