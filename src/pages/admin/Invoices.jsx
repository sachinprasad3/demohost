
import React from "react"; 

export default function FeeReceipt() { 
  // TODO: replace with real data / props
  const school = {
    name: "Play School",
    address:
      'Karamtoli Chowk, Bariatu Rd, Beside Rahul Hero Showroom, Ranchi-834001',
  };

  const receipt = {
    studentName: "Keshu Raj",
    className: "Toddler",
    date: "07.11.25",
    month: "October",
    paymentMode: "Online",
    transactionId: "95621",
 
    monthlyFee: 4300,
    lateFine: 0,
    advancePay: 0,

    vanFee: 0,
    canteenFee: 1200,
    kitFee: 0,
    extraAdvancePay: 0,
  };

  const totalA =
    receipt.monthlyFee + receipt.lateFine + receipt.advancePay;
  const totalB =
    receipt.vanFee +
    receipt.canteenFee +
    receipt.kitFee +
    receipt.extraAdvancePay;
  const dueAmount = 0; // TODO: calculate if needed
  const grandTotal = totalA + totalB;

  return (
    <div className="mainpro">
      <div className="container">
        {/* HEADER */}
        <div className="invoicesec">
        <header className="receipt-header">
          <h1 className="school-name">{school.name}</h1>
          <div className="school-address">{school.address}</div>
          <h2 className="receipt-title">SCHOOL FEE RECEIPT</h2>
        </header>

        {/* STUDENT INFO TABLE */}
        <table className="receipt-table info-table">
          <tbody>
            <tr>
              <th>Student Name</th>
              <td>{receipt.studentName}</td>
              <th>Date</th>
              <td>{receipt.date}</td>
            </tr>
            <tr>
              <th>Class</th>
              <td>{receipt.className}</td>
              <th>For the month</th>
              <td>{receipt.month}</td>
            </tr>
            <tr>
              <th>Payment Mode</th>
              <td>{receipt.paymentMode}</td>
              <th>Tr. Id</th>
              <td>{receipt.transactionId}</td>
            </tr>
          </tbody>
        </table>

        {/* MAIN FEE TABLE */}
        <table className="receipt-table main-fee-table">
          <thead>
            <tr>
              <th colSpan={2} className="text-center">
                Monthly Fee Structure
              </th>
              <th colSpan={2} className="text-center">
                Extras
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Monthly Fee</td>
              <td className="text-right">{receipt.monthlyFee}</td>
              <td>Van Fee</td>
              <td className="text-right">{receipt.vanFee}</td>
            </tr>
            <tr>
              <td>Late Fine</td>
              <td className="text-right">{receipt.lateFine}</td>
              <td>Canteen Fee</td>
              <td className="text-right">{receipt.canteenFee}</td>
            </tr>
            <tr>
              <td>Advance Pay</td>
              <td className="text-right">{receipt.advancePay}</td>
              <td>Kit Fee</td>
              <td className="text-right">{receipt.kitFee}</td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td>(+) Advance Pay</td>
              <td className="text-right">{receipt.extraAdvancePay}</td>
            </tr>

            {/* TOTALS A & B */}
            <tr>
              <th>Total (A)</th>
              <td className="text-right">{totalA}</td>
              <th>Total (B)</th>
              <td className="text-right">{totalB}</td>
            </tr>

            {/* DUE AMOUNT */}
            <tr>
              <th>Due Amount</th>
              <td className="text-right">{dueAmount}</td>
              <td></td>
              <td></td>
            </tr>

            {/* GRAND TOTAL */}
            <tr>
              <th colSpan={3}>Total Amount (A+B)</th>
              <td className="text-right">{grandTotal}</td>
            </tr>
          </tbody>
        </table>

        {/* FOOTER */}
        <div className="receipt-footer">
          <div>School Stamp</div>
          <div>Receiver&apos;s Signature</div>
        </div>

        <div className="receipt-note">
          *All amounts displayed in this receipt are in <b>INR</b>.
        </div>

       <div className="print-actions no-print">
        <button onClick={() => window.print()}>Print Receipt</button>
      </div>
      </div> 
     </div> 
    </div>
  );
}
