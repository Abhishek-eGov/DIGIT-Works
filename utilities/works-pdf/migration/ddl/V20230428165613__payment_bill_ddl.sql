CREATE TABLE eg_payments_excel
(
  id character varying(100) NOT NULL,
  paymentid character varying(100) NOT NULL,
  tenantId character varying(50) NOT NULL,
  status character varying(50) NOT NULL,
  numberofbills bigint,
  numberofbeneficialy bigint,
  totalamount bigint,
  filestoreid character varying(100),
  createdby character varying(100),
  lastmodifiedby character varying(100),
  createdtime bigint,
  lastmodifiedtime bigint,
  CONSTRAINT eg_payments_excel_pkey PRIMARY KEY (paymentid)
)