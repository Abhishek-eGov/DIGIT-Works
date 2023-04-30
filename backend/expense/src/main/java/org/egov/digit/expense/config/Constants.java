package org.egov.digit.expense.config;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Constants {

	public static final String TENANT_MODULE_NAME = "tenant";

	public static final String TENANT_CODE_FILTER = "$.*.code";

	public static final String TENANT_MASTERNAME = "tenants";
	
	
	public static final String EXPENSE_MODULE_NAME = "expense";
	
	public static final String CODE_FILTER = "$.*.code";
	
	public static final String HEADCODE_MASTERNAME = "HeadCodes";
	
	public static final String BUSINESS_SERVICE_MASTERNAME = "BusinessService";
	
	public static final String BILL_ID_FORMAT_SUFFIX = ".bill.number";
	
	public static final List<String> MDMS_MASTER_NAMES = Collections
			.unmodifiableList(Arrays.asList(HEADCODE_MASTERNAME, BUSINESS_SERVICE_MASTERNAME));

	public static final List<String> TENANT_MDMS_MASTER_NAMES = Collections
			.unmodifiableList(Arrays.asList(TENANT_MASTERNAME));
	
	
	private static final String INNER_JOIN = "INNER JOIN";

	public static final String PAYMENT_QUERY = "SELECT "
			
			
			+ " payment.id as p_id, payment.tenantid as p_tenantid, netpayableamount, netpaidamount,"
			+ " payment.status as p_status, payment.createdby as p_createdby, payment.createdtime as p_createdtime,"
			+ " payment.lastmodifiedby as p_lastmodifiedby, payment.lastmodifiedtime as p_lastmodifiedtime,"
			+ " payment.additionaldetails as p_additionaldetails, "
			
			+ " paymentbill.id as b_id, paymentbill.tenantid as b_tenantid, paymentid, billid, paymentbill.totalamount as b_totalAmount,"
			+ " paymentbill.totalpaidamount as b_totalpaidAmount, paymentbill.status as b_status, "
			
			+ " paymentbd.id as bd_id, paymentbd.tenantid as bd_tenantid, billDetailId, paymentbillid, paymentbd.totalamount as bd_totalAmount, "
			+ " paymentbd.totalpaidamount as bd_totalpaidAmount, paymentbd.status as bd_status, "
			
			+ " li.id as li_id, li.tenantid as li_tenantid, paymentbilldetailid, lineitemid, "
			+ " paidAmount, li.status as li_status"

			
			+ " FROM eg_expense_payment payment "
			
			+ INNER_JOIN + " eg_expense_payment_bill paymentbill ON paymentbill.paymentid = payment.id AND paymentbill.tenantid = payment.tenantid "
			
			+ INNER_JOIN + " eg_expense_payment_billdetail paymentbd ON paymentbd.paymentbillid = paymentbill.id AND paymentbd.tenantid = paymentbill.tenantid "
			
			+ INNER_JOIN + " eg_expense_payment_lineitem li ON li.paymentbilldetailid = paymentbd.id AND li.tenantid=paymentbd.tenantid ";
			
	
	public static final Set<String> SORTABLE_BILL_COLUMNS = Collections.unmodifiableSet(
			Stream.of("billdate", "duedate", "b_paymentstatus", "bill_status").collect(Collectors.toSet()));
	
	public static final String BILL_QUERY = "SELECT "
			
			+ " bill.id as b_id, bill.tenantid as b_tenantid, billdate, duedate, bill.totalamount as b_totalamount, bill.totalpaidamount as b_totalpaidamount, "
			+ " businessservice, bill.referenceid as b_referenceid, bill.fromperiod as b_fromperiod, bill.toperiod as b_toperiod, bill.status as b_status, "
			+ " bill.paymentstatus as b_paymentstatus, bill.createdby as b_createdby, bill.createdtime as b_createdtime, bill.lastmodifiedby as b_lastmodifiedby,"
			+ " bill.lastmodifiedtime as b_lastmodifiedtime, bill.additionaldetails as b_additionaldetails,"
			
			+ " bd.id as bd_id, bd.tenantid as bd_tenantid, bd.totalamount as bd_totalamount, bd.totalpaidamount as bd_totalpaidamount, "
			+ " bd.referenceid as bd_referenceid, billid, bd.paymentstatus as bd_paymentstatus, bd.status as bd_status, bd.fromperiod as bd_fromperiod, "
			+ " bd.toperiod as bd_toperiod, bd.createdby as bd_createdby, bd.createdtime as bd_createdtime, bd.lastmodifiedby as bd_lastmodifiedby,"
			+ " bd.lastmodifiedtime as bd_lastmodifiedtime, bd.additionaldetails as bd_additionaldetails,"
			
			+ " li.id as line_id, li.billdetailid as line_billdetailid, li.tenantid as line_tenantid, li.paymentstatus as li_paymentstatus,"
			+ " headcode, amount, paidamount, li.type as line_type, li.status as line_status, islineitempayable, li.createdby as line_createdby, li.createdtime as line_createdtime,"
			+ " li.lastmodifiedby as line_lastmodifiedby, li.lastmodifiedtime as line_lastmodifiedtime, li.additionaldetails as line_additionaldetails, "
			
			+ " payee.id as payee_id, payee.tenantid as payee_tenantid, payee.type as payee_type, payee.identifier as payee_identifier, payee.parentid as payee_parentid, "
			+ " payee.createdby as payee_createdby, payee.createdtime as payee_createdtime, payee.lastmodifiedby as payee_lastmodifiedby,"
			+ " payee.lastmodifiedtime as payee_lastmodifiedtime, payee.additionaldetails as payee_additionaldetails, payee.status as payee_status, "
			
			+ " payer.id as payer_id, payer.tenantid as payer_tenantid, payer.type as payer_type, payer.identifier as payer_identifier, payer.parentid as payer_parentid, "
			+ " payer.createdby as payer_createdby, payer.createdtime as payer_createdtime, payer.lastmodifiedby as payer_lastmodifiedby, "
			+ "	payer.lastmodifiedtime as payer_lastmodifiedtime, payer.additionaldetails as payer_additionaldetails, payer.status as payer_status "
			
			+ "	FROM eg_expense_bill bill "
			
			+ INNER_JOIN + " EG_EXPENSE_PARTY PAYER 	ON bill.id = payer.parentid AND bill.tenantid = payer.tenantid "
			
			+ INNER_JOIN + " EG_EXPENSE_BILLDETAIL BD 	ON bill.id = bd.billid AND bd.tenantid = bill.tenantid "
			
			+ INNER_JOIN + " EG_EXPENSE_LINEITEM LI 	ON bd.id = li.billdetailid AND bd.tenantid = li.tenantid "
			
			+ INNER_JOIN + " EG_EXPENSE_PARTY PAYEE 	ON bd.id = payee.parentid AND bd.tenantid = payee.tenantid ";
	
	
}
