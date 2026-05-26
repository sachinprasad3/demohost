import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { formatINR } from "../../utils"; 
import { useStudent } from "../../context/StudentContext";
import axiosInstance from "../../utills/axiosInstance";
import { useSearchParams } from "react-router-dom";
import Accordion from "../../components/Accordion";

// --- Helpers ---
const formatINRHelper = (amount) => {
  if (amount === null || amount === undefined) return "₹0";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatPrettyDate = (dateString) => {
  if (!dateString) return "-";
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export default function StudentFeeStructure() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openIndex, setOpenIndex] = useState(-1);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [searchParams] = useSearchParams(); 

  const queryStudentId = searchParams.get("studentId");
  const queryAcademicYear = searchParams.get("academicYear");

  const { activeStudent } = useStudent();
  const effectiveStudentId = queryStudentId || activeStudent?.studentId;  
  const effectiveAcademicYear = queryAcademicYear || activeStudent?.data?.admissionYear;

  const fetchStudentData = useCallback(async () => {
    if (!effectiveStudentId || !effectiveAcademicYear) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/api/v1/finance/data', {
        params: {
          academicYear: effectiveAcademicYear,
          studentId: effectiveStudentId,
          page: 0,
          size: 10
        }
      });

      const json = response.data; 

      if (json.status === "Success" && json.data?.students?.length > 0) {
        setStudentData(json.data.students[0]);
      } else {
        setError("Student data not found.");
      }
    } catch (err) {
      console.error("Error fetching financial data:", err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [effectiveStudentId, effectiveAcademicYear]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  // --- SIMPLIFIED SORT LOGIC ---
  const sortedInvoices = useMemo(() => {
    if (!studentData?.issuedInvoices) return [];
    
    // Create a shallow copy and sort by Due Date (Ascending)
    return [...studentData.issuedInvoices].sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA - dateB;
    });
  }, [studentData]);

  const handlePayNow = async (invoice) => {
    const confirmMsg = `Confirm payment of ${formatINRHelper(invoice.netAmountDue)} for ${invoice.billingPeriod}?`;
    if (!window.confirm(confirmMsg)) return;

    setProcessingPayment(true); 
    const payload = {
      invoiceId: invoice.invoiceId,
      amountPaid: invoice.netAmountDue,
      payMethodId: "UPI", 
      paymentInstrumentNumber: "UPI-TEST-123", 
      paymentInstrumentDate: new Date().toISOString().split('T')[0],
      remarks: "Online Payment"
    };

    try { 
      const response = await axiosInstance.post('/api/payments/receivePayment', payload);
      const json = response.data;
      if (json.status === "Success") {
        alert(`Payment Successful! Receipt #${json.data.paymentId} generated.`);        
        await fetchStudentData(); 
      } else {
        alert(`Payment Failed: ${json.message || "Unknown error occurred"}`);
      }
    } catch (err) {
      console.error("Payment API Error:", err); 
      const errorMsg = err.response?.data?.message || "Network error while processing payment.";
      alert(errorMsg);
    } finally {
      setProcessingPayment(false);
    }
  };

  const renderInvoiceDetails = (detailsArray) => {
    return detailsArray?.map((item, idx) => {
      const hasLateFee = item.lateFeeAmount > 0;
      return (
        <div key={idx}>
          <div className="detail-row">
            <span>{item.feeHeadName}</span>
            <span>{formatINRHelper(item.netAmountDue)}</span>
          </div>

           {hasLateFee && (
            <div className="detail-row">
             <span className="text-danger">Includes Late Fee </span>
              <span className="text-danger">(Base: {formatINRHelper(item.feesAmount)} + Fine: {formatINRHelper(item.lateFeeAmount)})</span>
            </div>
          )}

          {/* ({item.lateFeePerc ? `${item.lateFeePerc}%` : formatINRHelper(item.lateFeeAmount)}) */}
         
        </div>
      );
    });
  };

  const renderSimpleDetails = (detailsArray) => {
    return detailsArray?.map((item, idx) => (
      <div className="detail-row" key={idx}>
        <span>{item.feeHeadName}</span>
        <span>{formatINRHelper(item.amountPaid || item.netAmountDue)}</span>
      </div>
    ));
  };

  if (loading && !studentData) return <div className="p-4">Loading financial data...</div>;
  if (error) return <div className="p-4 text-danger">{error}</div>;
  if (!studentData) return <div className="p-4">No student record found.</div>;

  const { firstName, lastName, className, registrationNo, admissionPayment, recurringPaymentsReceived = [] } = studentData;

  return (
    <div className="mainpro">
      <div className="container"> 
        <div className="whitebox sthead">
          <h3>{firstName} {lastName}</h3>
          <div><span><strong>Class:</strong> {className}</span> <span><strong>Reg No:</strong> {registrationNo}</span></div> 
        </div>

      <h3>Pay in Advance?</h3>

{sortedInvoices.length > 0 &&
  sortedInvoices.map((inv, index) => {
    const hasTotalLateFee = inv.totalLateFeeAmount > 0;

    return (
      <Accordion key={inv.invoiceId} defaultOpen={index === 0} title={inv.billingPeriod}
  subhead={ 
      <button className=" " onClick={(e) => { e.stopPropagation();  handlePayNow(inv); }} disabled={processingPayment}>
        {processingPayment ? "Processing..." : `Pay Now ${formatINRHelper(inv.netAmountDue)}`}
      </button>
    
  } >

        {/* 🔹 Accordion Body */}
        <div className="student-fee-group">
           <div className={`detail-row ${hasTotalLateFee ? "" : ""}`}>
    <span></span>
    <span className="status-unpaid">{hasTotalLateFee ? "Overdue:" : "Due:"} {formatPrettyDate(inv.dueDate)}</span>
  </div>
          {renderInvoiceDetails(inv.invoiceDetails)}

          {hasTotalLateFee && (
            <div className="detail-row text-danger fw-bold">
              <span>Total Late Fee Applied</span>
              <span>(+ {formatINRHelper(inv.totalLateFeeAmount)})</span>
            </div>
          )}

          <div className="total-row">
            <span>Total Amount Due</span>
            <span>{formatINRHelper(inv.netAmountDue)}</span>
          </div>
        </div>

        <button
          className="search-btn paynow-btn"
          onClick={() => handlePayNow(inv)}
          disabled={processingPayment}
          style={{ opacity: processingPayment ? 0.7 : 1 }}
        >
          {processingPayment
            ? "Processing..."
            : `Pay Now ${formatINRHelper(inv.netAmountDue)}`}
        </button>
      </Accordion>
    );
  })}



      
        {sortedInvoices.length > 0 ? (
          sortedInvoices.map((inv) => {
            const hasTotalLateFee = inv.totalLateFeeAmount > 0;
            return ( 
              <div className="additional-section" key={inv.invoiceId} style={{border: hasTotalLateFee ? ' ' : ' '}}>
                  {/* <h4 className="section-title mb-3">Pending Dues</h4> */} 
                <div className="unpaid-header">
                  <span>Billing Period: {inv.billingPeriod}</span>
                  <span className="status-badge status-unpaid">
                    <span className={`${hasTotalLateFee ? '' : ''}`}>
                      {hasTotalLateFee ? 'Overdue:' : 'DUE:'} {formatPrettyDate(inv.dueDate)}
                    </span>
                  </span>
                </div>

              <div className="student-fee-group">
                  {renderInvoiceDetails(inv.invoiceDetails)}
                  {hasTotalLateFee && (
                      <div className="detail-row text-danger fw-bold">
                        <span>Total Late Fee Applied </span> <span>(+ {formatINRHelper(inv.totalLateFeeAmount)})</span> 
                      </div>
                    )}
                <div className="total-row">
                  <span>Total Amount Due</span>
                      <span>{formatINRHelper(inv.netAmountDue)}</span>
                  </div>
                </div>
                <button 
                  className="search-btn paynow-btn" 
                    onClick={() => handlePayNow(inv)}
                    disabled={processingPayment}
                    style={{ opacity: processingPayment ? 0.7 : 1 }}
                  >
                    {processingPayment ? "Processing..." : `Pay Now ${formatINRHelper(inv.netAmountDue)}`}
                  </button>
               
              </div>
              
            );
          })
        ) : (
          <></>
          // <div className="alert alert-success mt-3">No Pending Dues!</div>
        )}

        {/* -------- SECTION 2: ADMISSION PAYMENT -------- */}
        {admissionPayment && (
          <div className="additional-section">
            <h4>Admission Payment</h4>
            <div className="detail-row">
              <span>Paid on: {formatPrettyDate(admissionPayment.paymentDate)}</span>
              <span>Mode: {admissionPayment.payMethodName}</span>
            </div> 
            {renderSimpleDetails(admissionPayment.paymentDetails)}
            <div className="total-row">
              <span>Total Paid</span>
              <span>{formatINRHelper(admissionPayment.amountPaid)}</span>
            </div>
          </div>
        )}

        {/* -------- SECTION 3: RECURRING PAYMENTS HISTORY -------- */}
        <div className="month-list">
          <h3 className="mt-4 mb-2">Payment History</h3>

          {recurringPaymentsReceived.length === 0 && <p>No history available.</p>}

         {recurringPaymentsReceived.map((payment, index) => (
  <Accordion key={payment.paymentId} defaultOpen={index === 0}
    title={payment.billingPeriod || "Fee Payment"}
    subhead={
      <span className="status-badge status-paid">
        Paid on {formatPrettyDate(payment.paymentDate)}
      </span>
    }
  > 
      <div className="detail-row">
        <span>Receipt No</span>
        <span>#{payment.paymentId}</span>
      </div>

      <div className="detail-row">
        <span>Payment Mode</span>
        <span>{payment.payMethodName}</span>
      </div>

      <div className="detail-row">
        <span>Instrument No</span>
        <span>{payment.paymentInstrumentNumber || "-"}</span>
      </div>

      {renderSimpleDetails(payment.paymentDetails)}

      <div className="total-row text-success ">
        <span>Amount Paid</span>
        <span>{formatINRHelper(payment.amountPaid)}</span>
      </div> 
  </Accordion>
))}

        </div>

      </div>
    </div>
  );
}
