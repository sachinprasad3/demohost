
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import axiosInstance from '../../utills/axiosInstance'
import { useStudent } from '../../context/StudentContext'
import axios from 'axios';
import useAdmissionFormContext from '../../hooks/useAdmissionFormContext';
import { useNavigate } from 'react-router-dom';
import useStudentCandidateIds from '../../hooks/useStudentCandidateIds';
import { useAuth } from '../../context/AuthContext';
import { Button, Modal } from 'react-bootstrap';
import { FaCheckCircle } from "react-icons/fa";
import Popup from '../Popup'; 
import { usePopup } from '../../context/PopupContext';
import { formatDateDDMMYYYY } from '../../utills/constants';
import { Mail, Phone, MapPin, Home, CheckCircle, BadgeCheck, Pencil, Download } from "lucide-react";
import { useNotification } from '../../context/NotificationContext';
const Step4ProceedToPayment = React.memo(forwardRef((props, ref) => {
  // const {candidateId} = useStudent();
  const { candidateId,formData } = useAdmissionFormContext();
  // const candidateId = 1;
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN" || user?.role === "OWNER";
  const [invoiceDetails, setInvoiceDetails] = useState([])
  const [feePayer, setFeePayer] = useState([])
  const [candidateInvoiceDetails, setCandidateInvoiceDetails] = useState({})
  const [proceedToPaymentRes, setProceedToPaymentRes] = useState(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [selectedFeeItem, setSelectedFeeItem] = useState(null);
  const [tempDiscount, setTempDiscount] = useState(0);
  const [tempNet, setTempNet] = useState(0);
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [isOfflineProcessing, setIsOfflineProcessing] = useState(false);
  const [showOfflineConfirm, setShowOfflineConfirm] = useState(false);
  const navigate = useNavigate();
  const {
    candidateIdInfos,
    loading:loadingCandidate,
    error,
    refetch
  } = useStudentCandidateIds(user?.userId);
  const { propagateCandidates } = useStudent()
  let paymentData = proceedToPaymentRes
  const { openPopup, activeModal, closePopup } = usePopup();

const [loading, setLoading] = useState(false);
const { showNotification } = useNotification();


  const startPayment = async () => {
    try {
      const razorpayPayload = {
        amount: candidateInvoiceDetails?.totalAmountDue,
        candidateId,
        email: feePayer?.email
      };
      console.log("Creating order payload:", razorpayPayload);
      const orderRes = await axiosInstance.post(`/payment/create-order`, razorpayPayload);
      const orderData = orderRes.data;

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Play School",
        description: `Invoice ${candidateInvoiceDetails?.invoiceNo}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          await verifyPayment(response, orderData);
        },
        prefill: {
          name: feePayer?.payerName,
          email: feePayer?.email,
          contact: feePayer?.phonePrimary
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Razorpay error:", error);
    }
  };

  const handleOfflinePayment = async () => {
    // if (!window.confirm(`Confirm OFFLINE payment of ₹${candidateInvoiceDetails?.netAmountDue}?`)) return;

    setIsOfflineProcessing(true);
    try {
      const paymentPayload = {
        invoiceId: candidateInvoiceDetails?.invoiceId,
        amountPaid: candidateInvoiceDetails?.netAmountDue,
        payMethodId: "CASH",
        paymentInstrumentNumber: "OFFLINE-ADM-" + Date.now(),
        paymentInstrumentDate: new Date().toISOString().split('T')[0],
        remarks: `Admission Fee - Offline Payment by Admin'}`
      };

      const res = await axiosInstance.post(`/api/payments/receivePayment`, paymentPayload);

      setProceedToPaymentRes(res?.data?.data);
      const updatedCandidates = await refetch();
      await propagateCandidates(updatedCandidates);

      setShowOfflineConfirm(false);
      setShowPaymentSelection(false); // Close selection view
      openPopup("Payment success");
    } catch (error) {
      console.error("Offline payment error:", error);
      showNotification({
      message: error.response?.data?.message || "Failed to record offline payment. Please try again later.",
      type: "error",
    });
    } finally {
      setIsOfflineProcessing(false);
    }
  };




  const completePayment = async (paymentId, orderId) => {
    setLoading(true)
  try {
    const paymentPayload = {
      invoiceId: candidateInvoiceDetails?.invoiceId,
      amountPaid: candidateInvoiceDetails?.totalAmountDue,
      // Dynamic values from Razorpay
      payMethodId: "RAZORPAY", 
      paymentInstrumentNumber: paymentId, // Use the Razorpay Payment ID
      paymentInstrumentDate: new Date().toISOString().split('T')[0], // Today's date (YYYY-MM-DD)
      remarks: `Razorpay Order ID: ${orderId}`
    }


      const res = await axiosInstance.post(`/api/payments/receivePayment`, paymentPayload);


      setProceedToPaymentRes(res?.data?.data);
      const updatedCandidates = await refetch();
      await propagateCandidates(updatedCandidates);

    openPopup("Payment success");
  } catch (error) {
    console.error("error in proceeding to payment", error);
  }finally{
    setLoading(false)

  }
}

  const verifyPayment = async (response, orderData) => {
    console.log("verifyPayment response", response)
    try {
      const verifyPayload = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        candidateId: candidateId,
        email: feePayer?.email,
        amount: orderData.amount
      };

      const verifyRes = await axiosInstance.post(`/payment/verify`, verifyPayload);

      if (verifyRes.data.status === "SUCCESS") {
        console.log("Payment verified successfully");

        completePayment(response.razorpay_payment_id, response.razorpay_order_id);

      }

    } catch (error) {
      console.error("Payment record error:", error);
      openPopup("Payment failed");
    }
  };



  useImperativeHandle(ref, () => ({
    startPayment,
  }));


  useEffect(() => {
    const fetchCandidateInvoice = async () => {
      if (formData?.studentId || !candidateId) return

      try {
        const res = await axiosInstance.get(


          `/api/invoice/getAdmissionInvoice?candidateId=${candidateId}`
        );

        const data = res?.data?.data;

        if (!data) {
          console.warn("No invoice data found");
          return;
        }

        setCandidateInvoiceDetails(data);
        setInvoiceDetails(data.invoiceDetails || []);
        setFeePayer(data.feePayer || null);




      } catch (error) {
        console.error("Error in fetchCandidateInvoice:", error);
      }
    };
    fetchCandidateInvoice()
  }, [candidateId, formData?.studentId]);
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log(' Razorpay loaded');
    };
    document.head.appendChild(script);

    return () => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        document.head.removeChild(script);
      }
    };
  }, []);



  const handleOpenEditPopup = (item) => {
    setSelectedFeeItem(item);
    setTempDiscount(item.discountAmount || 0);
    setTempNet(item.netAmountDue || item.feesAmount);
    setIsEditPopupOpen(true);
  };

  const handleDiscountChange = (e) => {
    const newDiscount = Number(e.target.value);
    const fees = selectedFeeItem?.feesAmount || 0;

    // Guard: Prevent discount from being higher than the fee
    if (newDiscount > fees) {
      setTempDiscount(fees);
      setTempNet(0);
    } else {
      setTempDiscount(newDiscount);
      setTempNet(fees - newDiscount);
    }
  };

  const handleClosePopup = () => {
    setIsEditPopupOpen(false);
    setSelectedFeeItem(null);
  };

  const handleSaveDiscount = async () => {
    try {
      setLoading(true);
      const payload = {
        invoiceId: candidateInvoiceDetails.invoiceId,
        invLineId: selectedFeeItem.invLineId,
        newDiscountAmount: tempDiscount,
        updatedBy: user?.userId?.toString() || "ADMIN"
      };

      const res = await axiosInstance.put(`/api/invoice/update-line-discount`, payload);

      if (res.data.status === "Success") {
        // Close the edit popup first
        handleClosePopup();

        // Re-fetch the invoice data to refresh the main screen UI
        const updatedInvoiceRes = await axiosInstance.get(
          `/api/invoice/getAdmissionInvoice?candidateId=${candidateId}`
        );

        const updatedData = updatedInvoiceRes?.data?.data;
        if (updatedData) {
          setCandidateInvoiceDetails(updatedData);
          setInvoiceDetails(updatedData.invoiceDetails || []);
        }

        openPopup("Discount updated successfully");
      } else {
        openPopup("Failed to update discount. Please try again.");
      }
    } catch (error) {
      console.error("Error updating discount:", error);
      const errorMessage = error.response?.data?.message || "An error occurred while updating the discount.";
      openPopup(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (paymentId) => {
  try {
    const response = await axiosInstance.get(`/api/v1/pdf/download/fee-receipt`, {
      params: { paymentId },
      responseType: 'blob', 
    });

    // 1. Extract filename from the Content-Disposition header (Backend Choice)
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `Fee_Receipt_${paymentId}.pdf`; // Dynamic Fallback

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
  } catch (error) {
    console.error("Download error:", error);
    openPopup("Failed to download receipt");
  }
};

  if (loading) return <div className="text-center mt-4">
    Loading payment...
  </div>
  return (
    <div className="addpayment">
      <div className="halfbox">
        <div className="additional-section">
          <h4>Student Details</h4>
          <div className="detail-row">
            <strong>
              {[
                candidateInvoiceDetails.candidateFirstName,
                candidateInvoiceDetails.candidateMiddleName,
                candidateInvoiceDetails.candidateLastName
              ]
                .filter(Boolean)
                .join(" ")}
            </strong>
          </div>

          <div className="detail-row"><span>Admission No</span><span>{candidateInvoiceDetails.admissionRegistrationNumber}</span></div>
          <div className="detail-row"><span>Class</span><span>{candidateInvoiceDetails.className}</span></div>
          <div className="detail-row"><span>Academic Year</span><span>{candidateInvoiceDetails.academicYear}</span></div>
        </div>
        <div className="additional-section">
          <h4>Billed To</h4>
          <div className="detail-row"><strong>{feePayer.payerName}</strong></div>
          {feePayer?.PayerCode && (
            <div className="detail-row">Payer Code: {feePayer.PayerCode}</div>
          )}
          {feePayer?.email && (
            <div className="detail-row"><span><Mail size={16} /> {feePayer.email}</span></div>
          )}
          {feePayer?.phonePrimary && (
            <div className="detail-row"><span><Phone size={16} /> {feePayer.phonePrimary}</span></div>
          )}
          <div className="detail-row">
            <span><MapPin size={16} /> {feePayer?.resAddress1 && (<>{feePayer.resAddress1},</>)}
              {feePayer?.resAddress2 && (<>{feePayer.resAddress2},</>)} {feePayer?.resCity && (<>{feePayer.resCity},</>)}
              {feePayer?.resCity && (<>{feePayer.resState},</>)} {feePayer?.resCity && (<>{feePayer.resCountry}</>)} {feePayer.resPinCode}</span>
          </div>
        </div>
      </div>

      <div className="halfbox additional-section">
        <h4>Payment Summary</h4>
        {/* <div className="detail-row"><span>Invoice No.:- {candidateInvoiceDetails?.invoiceNo}</span></div> */}
        <div className="total-row"><span>Due Date:</span> <span>{formatDateDDMMYYYY(candidateInvoiceDetails?.dueDate)}</span> </div>
        {/* <p><strong>Amount Due:</strong> ₹{candidateInvoiceDetails?.totalAmountDue}</p> */}
        <div className="bg-light p-2 rounded mb-3 border-start border-primary border-4">
        <div className="detail-row small"><span>Sub-Total (Gross)</span> <span>₹{candidateInvoiceDetails?.grossAmount}</span></div>
        <div className="detail-row small text-danger"><span>Total Discount</span> <span>- ₹{candidateInvoiceDetails?.totalDiscountAmount}</span></div>
    </div>
        {invoiceDetails.map((item) => {
          const hasDiscount = Number(item.discountAmount) > 0;

  return (
    <div key={item.invLineId} className="detail-row">
      {/* Left Side: Name + Optional Discount Label */}
      <span className="d-flex flex-column">
        {item.feeHeadName}
        {hasDiscount && (
          <small className="text-danger d-flex align-items-center gap-1" style={{ fontSize: '11px', marginTop: '-4px' }}>
            <BadgeCheck size={12} /> Discount: ₹{item.discountAmount}
          </small>
        )}
      </span>

      {/* Right Side: Pricing + Edit Action */}
      <span className="text-end">
        {hasDiscount ? (
          <>
            <small className="text-muted text-decoration-line-through me-2">₹{item.feesAmount}</small>
            <span className="fw-bold">₹{item.netAmountDue}</span>
          </>
        ) : (
          <span>₹{item.feesAmount}</span>
        )}
        
        {/* Inline Edit Button for Admins */}
        {/* {isAdmin && (
          <button 
            className="btn btn-link btn-sm p-0 ms-2 text-primary" 
            onClick={() => handleOpenEditPopup(item)}
            style={{ textDecoration: 'none', verticalAlign: 'middle' }}
          >
            <Pencil size={14} />
          </button>
        )} */}
      </span>
    </div>
  );
})}

        <div className="total-row">
          <span>Total Payable</span>
          <span className="text-success">
            ₹{candidateInvoiceDetails?.netAmountDue}
          </span>
        </div>
        <div className="mt-4">
  {!showPaymentSelection ? (
    <Button
      variant="success"
      className="btn btn-primary w-100"
      onClick={() => setShowPaymentSelection(true)}
      disabled={!candidateInvoiceDetails?.netAmountDue || loading}
    >
      Proceed to Payment (₹{candidateInvoiceDetails?.netAmountDue})
    </Button>
  ) : (
    <div className="payment-options border p-3 rounded bg-light shadow-sm text-center">
      
      {/* VIEW A: Confirmation View for Offline */}
      {showOfflineConfirm ? (
        <>
          <h5 className="mb-2 text-success">Confirm Cash Payment</h5>
          <p className="small mb-3">
            Registering admission for <strong>₹{candidateInvoiceDetails?.netAmountDue}</strong> via manual/cash mode?
          </p>
          <div className="d-grid gap-2">
            <Button
              variant="success"
              onClick={handleOfflinePayment}
              disabled={isOfflineProcessing}
            >
              {isOfflineProcessing ? "Processing..." : "Yes, Confirm Payment"}
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowOfflineConfirm(false)}
            >
              Back to methods
            </Button>
          </div>
        </>
      ) : (
        /* VIEW B: Method Selection View */
        <>
          <h5 className="mb-3">Select Method</h5>
          <div className="d-grid gap-2">
            <Button
              variant="primary"
              onClick={startPayment}
              disabled={loading || isOfflineProcessing}
            >
              {loading ? "Processing..." : "Online (Razorpay)"}
            </Button>

            <Button
              variant="outline-success"
              onClick={() => setShowOfflineConfirm(true)} // Set confirm state instead of triggering API
              disabled={loading || isOfflineProcessing}
            >
              Offline (Cash/Manual)
            </Button>

            <Button
              variant="link"
              size="sm"
              className="text-muted"
              onClick={() => setShowPaymentSelection(false)}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  )}
</div>
      </div>
      {/* {activeModal === "Payment success" &&
        <Popup

          onClose={() => {
            closePopup()
            navigate("/student/dashboard")
          }}
          paymentData={proceedToPaymentRes}
          closeOnOutsideClick={false}
        >

      <div className='text-center'>
      <h2> <BadgeCheck  size={72} className="text-success mb-1" />  <div>Admission Successful</div> </h2>
          <p className=' mb-3'>
            Welcome <strong>{paymentData.candidateFirstName} {paymentData.candidateLastName}</strong>, your admission has been confirmed.
          </p> 
      </div>

      
      <div className="text-start  ">
        <Detail label="Payment ID" value={paymentData.paymentId} />
        <Detail label="Invoice ID" value={paymentData.invoiceId} />
        <Detail
          label="Amount Paid"
          value={`₹${paymentData.amountPaid}`}
          highlight
        />
        <Detail label="Payment Method" value={paymentData.payMethodName} />
        <Detail label="Payment Date" value={paymentData.paymentDate} />
        <Detail
          label="Payment Status"
          value={paymentData.paymentStatus}
          status
        />
      </div>


          <div className="text-center">
            <Button
              variant="success"
              className="btn btn-primary"
              onClick={() => {
                closePopup();
                if (isAdmin) {
                  navigate(-1); // Go back one step in history
                } else {
                  navigate("/student/dashboard");
                }
              }}
            >
              {isAdmin ? "Go Back" : "Go to Dashboard"}
            </Button>
          </div>


    </Popup>} */}
    {activeModal === "Payment success" &&
        <Popup

          onClose={() => {
            closePopup()
            navigate("/admin/all-parents")
          }}
          paymentData={proceedToPaymentRes}
          closeOnOutsideClick={false}
        >

      <div className='text-center'>
      <h2> <BadgeCheck  size={72} className="text-success mb-1" />  <div>Admission Successful</div> </h2>
          <p className=' mb-3'>
            Welcome <strong>{paymentData.candidateFirstName} {paymentData.candidateLastName}</strong>, your admission has been confirmed.
          </p> 
      </div>

      
      <div className="text-start  ">
        <Detail label="Payment ID" value={paymentData.paymentId} />
        <Detail label="Invoice ID" value={paymentData.invoiceId} />
        <Detail
          label="Amount Paid"
          value={`₹${paymentData.amountPaid}`}
          highlight
        />
        <Detail label="Payment Method" value={paymentData.payMethodName} />
        <Detail label="Payment Date" value={paymentData.paymentDate} />
        <Detail
          label="Payment Status"
          value={paymentData.paymentStatus}
          status
        />
        {paymentData.parentUsername && <Detail label="User Name: " value={paymentData.parentUsername} />}
        {paymentData.parentPassword && <Detail label="Password: " value={paymentData.parentPassword} />}
            {/* --- ADD DOWNLOAD SECTION HERE --- */}
            <div className="mt-3 p-2 border rounded d-flex justify-content-between align-items-center bg-light">
              <div>
                <span className="fw-bold d-block">Official Fee Receipt</span>
                <small className="text-muted">Digital Copy (PDF)</small>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                className="d-flex align-items-center gap-2"
                onClick={() => handleDownloadReceipt(paymentData.paymentId)}
              >
                <Download size={18} /> Download
              </Button>
            </div>
            {/* ---------------------------------- */}
          </div>

          <div className="text-center">
            <Button
              variant="success"
              className="btn btn-primary"
              onClick={() => {
                closePopup();
                if (isAdmin) {
                  navigate(-1); // Go back one step in history
                } else {
                  navigate("/student/dashboard");
                }
              }}
            >
              {isAdmin ? "Go Back" : "Go to Dashboard"}
            </Button>
          </div>
        </Popup>
      }

      {isEditPopupOpen && (
        <Popup
          title="Edit Fee Discount"
          onClose={handleClosePopup}
          onSave={handleSaveDiscount}
          saveText={loading ? "Updating..." : "Ok"}
        >
          <div className="p-2">
            <div className="mb-3">
              <label className="form-label fw-bold">Fee Head</label>
              <div className="form-control-plaintext">{selectedFeeItem?.feeHeadName}</div>
            </div>

            <div className="row">
              <div className="col-6 mb-3">
                <label className="form-label fw-bold">Base Fee</label>
                <div className="form-control-plaintext">₹{selectedFeeItem?.feesAmount}</div>
              </div>
              <div className="col-6 mb-3">
                <label className="form-label fw-bold text-success">Net Amount</label>
                <div className="form-control-plaintext fw-bold text-success">₹{tempNet}</div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Discount Amount</label>
              <input
                type="number"
                className="form-control"
                value={tempDiscount}
                onChange={handleDiscountChange}
                placeholder="Enter discount"
                min="0"
                max={selectedFeeItem?.feesAmount}
              />
              <small className="text-muted">Adjusting this will update the Net Amount.</small>
            </div>
          </div>
        </Popup>
      )}
    </div>
  )
}))

export default Step4ProceedToPayment





/*  Reusable row */
const Detail = ({ label, value, highlight, status }) => (
  <div className="detail-row">
    <span >{label}</span>
    <span className={`fw-semibold ${highlight ? "text-success" : "" } ${status === true ? "text-success" : ""}`} >
      {value}
    </span>
  </div>
);