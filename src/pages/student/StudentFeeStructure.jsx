import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { formatINR } from "../../utils";
import { useStudent } from "../../context/StudentContext";
import axiosInstance from "../../utills/axiosInstance";
import { useSearchParams } from "react-router-dom";
import Accordion from "../../components/Accordion";
import FeeReceiptPopup from "../../components/FeeReceiptPopup";
import { Download, FileDown, FileText, BadgeCheck } from "lucide-react";
import Popup from '../../components/Popup';
import { Button } from "react-bootstrap";
import { usePopup } from "../../context/PopupContext";
import { useAuth } from "../../context/AuthContext";
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
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "OWNER";
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openIndex, setOpenIndex] = useState(-1);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [searchParams] = useSearchParams();
  const [showReceipt, setShowReceipt] = useState(null);
  const [activeInvoiceIndex, setActiveInvoiceIndex] = useState(0);
  const [paymentSelection, setPaymentSelection] = useState(null);
  const [showOfflineConfirm, setShowOfflineConfirm] = useState(false);

  const [proceedToPaymentRes, setProceedToPaymentRes] = useState(null);
  const { openPopup, activeModal, closePopup } = usePopup();

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
          academicYear: effectiveAcademicYear, studentId: effectiveStudentId, page: 0, size: 10
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

  useEffect(() => {
    // Check if script already exists
    const existingScript = document.getElementById('razorpay-checkout-js');
    if (existingScript) return;

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js'; // Add ID to prevent duplicates
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      console.log('Razorpay SDK loaded successfully');
    };

    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
    };

    document.head.appendChild(script);

    return () => {
      // Generally, for Razorpay, we keep it loaded to avoid re-fetching
      // but if you must clean up:
      // document.head.removeChild(script);
    };
  }, []);

  const sortedInvoices = useMemo(() => {
    if (!studentData?.issuedInvoices) return [];
    return [...studentData.issuedInvoices].sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA - dateB;
    });
  }, [studentData]);

  // Step 1: The Trigger (Triggered by the Accordion Button)
  const handlePayNow = (invoice) => {
    setPaymentSelection(invoice); // Opens the Choice Popup
  };

  // Step 2: The Online Flow (Razorpay Integration)
  const handleOnlineRazorpay = async (invoice) => {
    try {
      setProcessingPayment(true);

      // Defensive check: ensure SDK is actually loaded
      if (!window.Razorpay) {
        alert("Payment gateway is still loading. Please try again in a second.");
        return;
      }

      const emailToUse = studentData.contactEmail || "";
      const razorpayPayload = {
        amount: invoice.netAmountDue,
        studentId: effectiveStudentId,
        email: emailToUse
      };

      const orderRes = await axiosInstance.post(`/payment/create-order`, razorpayPayload);
      const orderData = orderRes.data;

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Play School",
        // Use studentData directly for safety
        description: `${invoice.billingPeriod} Fee - ${studentData.firstName}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          await verifyPayment(response, orderData, invoice);
        },
        prefill: {
          name: `${studentData.firstName} ${studentData.lastName}`,
          email: emailToUse,
          contact: studentData.contactNo // Good practice to prefill phone too
        },
        theme: { color: "#3399cc" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      alert("Could not initiate online payment.");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Step 3: The Offline Flow (New logic for Admins)
  const handleOfflinePayment = async () => {
    const invoice = paymentSelection;
    // if (!window.confirm(`Process Cash payment for ${invoice.billingPeriod}?`)) return;

    try {
      setProcessingPayment(true);
      const payload = {
        invoiceId: invoice.invoiceId,
        amountPaid: invoice.netAmountDue,
        payMethodId: "CASH", // Ensure this code exists in your PayMethods table
        paymentInstrumentNumber: "OFFLINE-" + Date.now(),
        paymentInstrumentDate: new Date().toISOString().split('T')[0],
        remarks: `Offline Payment received by Admin`
      };

      const res = await axiosInstance.post('/api/payments/receivePayment', payload);
      if (res.data.status === "Success") {
        setProceedToPaymentRes(res.data.data);
        setPaymentSelection(null); // Close the choice popup
        setShowOfflineConfirm(false);
        openPopup("Payment success");
        await fetchStudentData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Offline payment failed.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const verifyPayment = async (response, orderData, invoice) => {
    try {
      const verifyPayload = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        studentId: effectiveStudentId,
        amount: orderData.amount,
        email: studentData.contactEmail || ""
      };

      const verifyRes = await axiosInstance.post(`/payment/verify`, verifyPayload);

      if (verifyRes.data.status === "SUCCESS") {
        await completePayment(response.razorpay_payment_id, response.razorpay_order_id, invoice);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      alert("Payment verification failed.");
    }
  };

  const completePayment = async (paymentId, orderId, invoice) => {
    try {
      const paymentPayload = {
        invoiceId: invoice.invoiceId,
        amountPaid: invoice.netAmountDue,
        payMethodId: "RAZORPAY",
        paymentInstrumentNumber: paymentId,
        paymentInstrumentDate: new Date().toISOString().split('T')[0],
        remarks: `Razorpay Order ID: ${orderId}`
      };

      const res = await axiosInstance.post(`/api/payments/receivePayment`, paymentPayload);

      // Store response to show in the success popup
      setProceedToPaymentRes(res.data.data);
      openPopup("Payment success"); // Using your global popup context
      await fetchStudentData();
    } catch (error) {
      console.error("Finalizing payment error:", error);
    }
  };

  // Helper for Downloading via Header (as discussed previously)
  // Helper for Downloading with Android Support and Dynamic Filename
  const handleDownloadReceipt = async (paymentId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/pdf/download/fee-receipt`, {
        params: { paymentId },
        responseType: 'blob',
      });

      // 1. Extract filename from the Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `Receipt_${paymentId}.pdf`; // Fallback
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch && fileNameMatch.length > 1) {
          fileName = fileNameMatch[1];
        }
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });

      // 2. Check for Android WebView Bridge
      if (window.AndroidDownloader) {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Convert blob to base64 string for the Android interface
          const base64Data = reader.result.split(',')[1];
          window.AndroidDownloader.downloadFile(base64Data, fileName, 'application/pdf');
        };
        reader.readAsDataURL(blob);
      } else {
        // 3. Standard Browser Download Logic
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Download error:", e);
      alert("Download failed. Please try again.");
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

  const { firstName, lastName, className, registrationNo, admissionPayment, recurringPaymentsReceived, issuedInvoices = [] } = studentData;

  const feeConfig = {
    baseFeeLabel: "Monthly Fee"
  };

  const Detail = ({ label, value, highlight, status }) => (
    <div className="detail-row">
      <span >{label}</span>
      <span className={`fw-semibold ${highlight ? "text-success" : ""} ${status === true ? "text-success" : ""}`} >
        {value}
      </span>
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="mainpro">
      <div className="container">
        <div className="whitebox sthead">
          <h3>{firstName} {lastName}</h3>
          <div><span><strong>Class:</strong> {className}</span> <span><strong>Reg No:</strong> {registrationNo}</span></div>
        </div>
        {issuedInvoices.length > 0 ? <h3 className="mt-4">Pay in Advance?</h3> : null}
        {sortedInvoices.length > 0 && sortedInvoices.map((inv, index) => {
          const itemKey = `inv-${index}`;
          const hasTotalLateFee = inv.totalLateFeeAmount > 0;
          const isPayable = index === 0;
          const isBtnDisabled = !isPayable || processingPayment;
          const isThisOpen = activeInvoiceIndex === index;
          return (
            <Accordion key={inv.invoiceId} defaultOpen={index === 0} title={inv.billingPeriod}
              isOpen={isThisOpen}
              onToggle={() => setActiveInvoiceIndex(isThisOpen ? null : index)}
              subhead={
                <button className={`pay-now-small ${!isPayable ? 'btn-locked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPayable) handlePayNow(inv);
                  }}
                  disabled={isBtnDisabled}
                  title={!isPayable ? "Please clear previous dues first" : ""}
                >
                  {processingPayment && isPayable ? "Processing..." : `Pay ${formatINRHelper(inv.netAmountDue)}`}
                </button>
              }>
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
              <button className="search-btn paynow-btn"
                onClick={() => handlePayNow(inv)}
                disabled={isBtnDisabled}
                style={{ opacity: processingPayment ? 0.7 : 1, cursor: isBtnDisabled ? 'not-allowed' : 'pointer' }}>
                {processingPayment && isPayable ? "Processing..." : `Pay Now ${formatINRHelper(inv.netAmountDue)}`}
              </button>
              {!isPayable && (
                <p className="text-muted small mt-2">
                  * This invoice will become payable once the previous month's fee is cleared.
                </p>
              )}
            </Accordion>
          );
        })}

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
        <div className="month-list">
          <h3 className="mt-4">Payment History</h3>
          {recurringPaymentsReceived.length === 0 && <p>No history available.</p>}
          {recurringPaymentsReceived.map((payment, index) => (
            <Accordion key={payment.paymentId} defaultOpen={index === 0}
              title={payment.billingPeriod || "Fee Payment"}
              subhead={
                <div className="flex items-center gap-2">
                  <span className="status-badge status-paid">
                    Paid on {formatPrettyDate(payment.paymentDate)}
                  </span>
                  {/* 3. Add the Download/View Icon Button */}
                  <button
                    className="pdfbtn"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent accordion from toggling
                      setShowReceipt({
                        payment: payment,
                        period: payment.billingPeriod
                      });
                    }}
                    title="View Receipt"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 5px' }}
                  >
                    <FileText size={14} />
                  </button>
                </div>
              }>
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
              <div className="text-right mt-2">
                <button
                  className="btn-sm btn-outline"
                  onClick={() => setShowReceipt({ payment: payment, period: payment.billingPeriod })}
                >
                  View Receipt
                </button>
              </div>
            </Accordion>
          ))}
        </div>
      </div>
      {/* 4. Render the Popup if state is set */}
      {showReceipt && (
        <FeeReceiptPopup
          feeConfig={feeConfig}
          period={showReceipt.period}
          selected={studentData} // Passing the whole student object
          onClose={() => setShowReceipt(null)}
          // These props are required by your Popup logic but may not be needed for history
          currentYear={effectiveAcademicYear}
          onAddPayment={() => { }}
        />
      )}

      {/* Add this inside the main return div, similar to your Step4 component */}
      {activeModal === "Payment success" && proceedToPaymentRes && (
        <Popup
          onClose={() => closePopup()}
          paymentData={proceedToPaymentRes}
          closeOnOutsideClick={false}
        >
          <div className='text-center'>
            <h2> <BadgeCheck size={72} className="text-success mb-1" /> <div>Payment Successful</div> </h2>
            <p className='mb-3'>
              Fee for<strong>{proceedToPaymentRes.billingPeriod}</strong>has been received.
            </p>
          </div>

          <div className="text-start">
            <Detail label="Payment Instrument ID" value={proceedToPaymentRes.paymentInstrumentNumber} />
            <Detail label="Payment Method" value={proceedToPaymentRes.payMethodName} />
            <Detail label="Amount Paid" value={formatINRHelper(proceedToPaymentRes.amountPaid)} highlight />
            <Detail label="Date" value={formatDate(proceedToPaymentRes.paymentDate)} />

            <div className="mt-3 p-2 border rounded d-flex justify-content-between align-items-center bg-light">
              <div>
                <span className="fw-bold d-block">Fee Receipt</span>
                <small className="text-muted">PDF Document</small>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                className="d-flex align-items-center gap-2"
                onClick={() => handleDownloadReceipt(proceedToPaymentRes.paymentId)}
              >
                <Download size={18} /> Download
              </Button>
            </div>
          </div>
          <div className="text-center mt-4">
            <Button variant="success" onClick={() => closePopup()}>Close</Button>
          </div>
        </Popup>
      )}

      {/* Payment Method Choice Popup */}
      {paymentSelection && (
        <Popup
          title={showOfflineConfirm ? "Confirm Cash Payment" : "Select Payment Method"}
          onClose={() => {
            setPaymentSelection(null);
            setShowOfflineConfirm(false);
          }}
        >
          <div className="p-4 text-center">
            {/* --- VIEW 1: Confirmation View --- */}
            {showOfflineConfirm ? (
              <>
                <p className="mb-4">
                  Are you sure you want to process a <strong>Cash Payment</strong> of
                  <span className="text-success d-block h4 mt-2">
                    {formatINRHelper(paymentSelection.netAmountDue)}
                  </span>
                  for {paymentSelection.billingPeriod}?
                </p>
                <div className="d-flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-fill"
                    onClick={() => setShowOfflineConfirm(false)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="success"
                    className="flex-fill"
                    onClick={handleOfflinePayment}
                    disabled={processingPayment}
                  >
                    {processingPayment ? "Processing..." : "Confirm & Pay"}
                  </Button>
                </div>
              </>
            ) : (
              /* --- VIEW 2: Selection View --- */
              <>
                <h4 className="mb-3">{paymentSelection.billingPeriod} Fee Payment</h4>
                <p className="text-muted mb-4">Amount to be paid: <strong>{formatINRHelper(paymentSelection.netAmountDue)}</strong></p>

                <div className="d-grid gap-3">
                  <Button
                    variant="primary"
                    className="py-3 fw-bold"
                    onClick={() => {
                      const inv = paymentSelection;
                      setPaymentSelection(null);
                      handleOnlineRazorpay(inv);
                    }}
                  >
                    Pay Online (Razorpay)
                  </Button>

                  {isAdmin && (
                    <Button
                      variant="outline-success"
                      className="py-3 fw-bold"
                      onClick={() => setShowOfflineConfirm(true)} // Toggle confirmation view
                    >
                      Pay Offline (Cash/Cheque)
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </Popup>
      )}
    </div>
  );
}
