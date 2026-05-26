// FeeReceiptPopup.jsx
import Popup from "./Popup";
import { useRef, useContext, useState } from "react";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { LogoContext } from "../context/LogoContext";
import { SCHOOL_DEFAULT } from "../context/themeRoles";
import axiosInstance from "../utills/axiosInstance";
const formatDate = (dateStr) => {
  if (!dateStr) return "---";

  const date = new Date(dateStr);
  if (isNaN(date)) return "---";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const FeeReceiptPopup = ({
  type,
  selected,
  period,
  currentYear,
  onClose,
  onAddPayment,
  feeConfig
}) => {

  if (!selected) return null;

  const receiptRef = useRef(null);

 
const school = {
  name: SCHOOL_DEFAULT.NAME,
  address: SCHOOL_DEFAULT.ADDRESS,
};
 
  const paidInfo = selected?.recurringPaymentsReceived?.find(
    p => p.billingPeriod?.toLowerCase() === period?.toLowerCase()
  );

  const getAmount = (headName) => {
    if (!paidInfo.paymentDetails) return 0; 
    const item = paidInfo.paymentDetails.find(d => 
      d.feeHeadName.toLowerCase().includes(headName.toLowerCase())
    );
    return item ? item.amountPaid : 0;
  };

  if (!paidInfo) {
    return (
      // <Popup onClose={onClose} overlayClass="receiptsec">
      //   <p style={{ color: "red", fontWeight: 700 }}>NOT Paid ✗</p>
      //   <button className="saveBtn" onClick={onAddPayment}>
      //     Add Payment
      //   </button>
      // </Popup>
      console.log("No payment info available for the selected period.")
    );
  }
 
  const receipt = {
    // baseFee: getAmount("Tuition") + getAmount("Admission Fee") || 0,
    baseFee: getAmount("Tuition")  || 0,
   vanFee: getAmount("Transport") || 0,
    lateFine: getAmount("Late") || 0,
    canteenFee: getAmount("Canteen") || 0,
    advancePay: 0,
    kitFee: getAmount("Student Kit") || 0,
    formFee: getAmount("Admission Form"),
    extraAdvancePay: paidInfo.extraAdvancePay || 0,
    cautionMoney: getAmount("Caution"),
    admissionFee: getAmount("Admission Fee") || 0,
    totalDiscount: paidInfo.totalDiscount || 0
  };

  const totalA =
    receipt.baseFee +
    receipt.lateFine +
    receipt.formFee +
    receipt.advancePay+
    receipt.admissionFee;

  const totalB =
    receipt.vanFee +
    receipt.canteenFee +
    receipt.cautionMoney +
    receipt.kitFee +
    receipt.extraAdvancePay;

  const dueAmount = paidInfo.dueAmount || 0;
  const grandTotal = totalA + totalB; 

  const { logoUrl } = useContext(LogoContext);
  const [isDownloading, setIsDownloading] = useState(false);
  // const downloadReceipt = async () => {
  //   const element = receiptRef.current;
  //   if (!element) return;

  //   const clone = element.cloneNode(true);

  //   const wrapper = document.createElement("div");
  //   wrapper.style.position = "fixed";
  //   wrapper.style.left = "-9999px";
  //   wrapper.style.width = "650px";
  //   wrapper.style.background = "#fff";

  //   clone.style.width = "90%";
  //   wrapper.appendChild(clone);
  //   document.body.appendChild(wrapper);

  //   const canvas = await html2canvas(wrapper, {
  //     scale: 1.5,
  //     useCORS: true,
  //     backgroundColor: "#ffffff",
  //     ignoreElements: el => el.classList?.contains("no-print")
  //   });

  //   document.body.removeChild(wrapper);

  //   const imgData = canvas.toDataURL("image/jpeg", 0.75);

  //   const pdf = new jsPDF("p", "mm", "a4");
  //   const pageWidth = pdf.internal.pageSize.getWidth();
  //   const pageHeight = pdf.internal.pageSize.getHeight();

  //   const imgRatio = canvas.width / canvas.height;
  //   let renderWidth = pageWidth;
  //   let renderHeight = pageWidth / imgRatio;

  //   if (renderHeight > pageHeight) {
  //     renderHeight = pageHeight;
  //     renderWidth = pageHeight * imgRatio;
  //   }

  //   const x = (pageWidth - renderWidth) / 2;
  //   pdf.addImage(imgData, "JPEG", x, 10, renderWidth, renderHeight, undefined, 'FAST');

  //   const fileName = `Fee_Receipt_${selected.firstName}_${period || currentYear}.pdf`;
  //   const mimeType = "application/pdf";

  //   const pdfBase64 = pdf.output("datauristring");
  //   const base64Data = pdfBase64.split(",")[1];

  //   if (window.AndroidDownloader) {
  //     window.AndroidDownloader.downloadFile(base64Data, fileName, mimeType);
  //   } else {
  //     pdf.save(fileName);
  //   }
  // };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const paymentId = paidInfo.paymentId;

      const response = await axiosInstance.get(`/api/v1/pdf/download/fee-receipt`, {
        params: { paymentId },
        responseType: 'blob',
      });

      // 1. Extract dynamic filename
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `Receipt_${selected.firstName}_${period}.pdf`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) fileName = fileNameMatch[1];
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });

      // 2. Android App vs Browser Logic
      if (window.AndroidDownloader) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result.split(',')[1];
          window.AndroidDownloader.downloadFile(base64Data, fileName, 'application/pdf');
        };
        reader.readAsDataURL(blob);
      } else {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download failed:", error);
      alert("Could not download the official receipt. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Popup onClose={onClose}  overlayClass="receiptsec">
      <div className="invoicesec" ref={receiptRef}>
        <header className="receipt-header">
          <div className="logos"><img src={logoUrl} alt="Logo" style={{ height: 60 }} onError={(e) => { e.target.onerror = null; e.target.src = "/images/default-logo.png";}} /></div>
          {/* <h1 className="school-name">{school.name}</h1> */}
          <div className="school-address">{school.address}</div>
          <h2 className="receipt-title">SCHOOL FEE RECEIPT</h2>
        </header>
        <div className="receiptbox">
          <table className="receipt-table info-table">
            <tbody>
              <tr>
                <td><strong>Student Name</strong></td> 
                <td>{selected?.firstName || selected?.lastName ? `${selected.firstName || ""} ${selected.lastName || ""}`.trim() : "-"}</td>
                <td><strong>Date</strong></td>
                <td>{formatDate(paidInfo.paymentDate|| "---")}</td> 
              </tr>
              <tr>
                <td><strong>Class</strong></td>
                <td>{selected.className || "-"}</td>
                <td><strong>Period</strong></td>
                <td>{period || "-"}</td>
              </tr>
              <tr>
                <td><strong>Payment Mode</strong></td>
                <td>{paidInfo.payMethodName || "-"}</td>
                <td><strong>Transaction Id</strong></td>
                <td>{paidInfo.paymentInstrumentNumber || "-"}</td>
              </tr>
            </tbody>
          </table>

          <table className="receipt-table main-fee-table">
            <thead>
              <tr>
                <th colSpan={2} className="text-center">
                  {feeConfig.baseFeeLabel} Structure
                </th>
                <th colSpan={2} className="text-center">
                  Extras
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{feeConfig.baseFeeLabel}</td>
                <td className="text-left">{receipt.baseFee || "-"}</td>
                <td>Van Fee</td>
                <td className="text-left">{receipt.vanFee || "-"}</td>
              </tr>
              <tr>
                <td>Admission Fee</td>    
                <td className="text-left">{receipt.admissionFee || "-"}</td>
                <td>Canteen Fee</td>
                <td className="text-left">{receipt.canteenFee || "-"}</td>
              </tr>
              <tr>
                <td>Admission Form Fee</td>
                <td className="text-left">{receipt.formFee || "-"}</td>
                <td>Caution Money</td>
                <td className="text-left">{receipt.cautionMoney || "-"}</td>
              </tr>
              <tr>
                <td>Late Fee</td>
                <td className="text-left">{receipt.lateFine || "-"}</td>
                <td>Kit Fee</td>
                <td className="text-left">{receipt.kitFee || "-"}</td>
              </tr>
              <tr>
                <td>Advance Pay</td>
                <td className="text-left">{receipt.advancePay || "-"}</td>
                {/* <td>(+) Extra Advance</td>
                <td className="text-left">{receipt.extraAdvancePay || "-"}</td> */}

                 <td> Total Discount</td>
                <td>{receipt.totalDiscount > 0 ? `-${receipt.totalDiscount}` : "-"}</td>
              </tr>
              <tr className="nodata">
                <td><strong>Total (A)</strong></td>
                <td className="text-left">{totalA || "-"}</td>
                <td><strong>Total (B)</strong></td>
                <td className="text-left">{totalB || "-"}</td>
              </tr>
              <tr>
                <td><strong>Due Amount</strong></td>
                <td className="text-left">{dueAmount || "-"}</td>
                <td className="nodata"></td>
                <td className="nodata"></td>
              </tr>
              <tr>
                <td colSpan={3}>
                  <strong>Total Amount <span>(A+B)</span></strong>
                </td>
                <td className="text-left">{grandTotal || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <small>*All amounts are in <b>INR</b></small>
        </div>

        <div className="print-actions no-print">
          <button onClick={handleDownload}>
            Download Receipt
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default FeeReceiptPopup;
