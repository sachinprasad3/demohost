import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { formatINR } from "../utils";

export default function InvoiceModal({ student, onClose, onPay }) {
  const [amount, setAmount] = useState("");
  if (!student) return null;
  const due = student.totalFee - student.paid;

  return (
    <Modal show={!!student} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Invoice — {student.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row g-2">
          <div className="col-6">
            <div className="text-muted small">Total Fee</div>
            <div className="fw-semibold">{formatINR(student.totalFee)}</div>
          </div>
          <div className="col-6">
            <div className="text-muted small">Paid</div>
            <div className="fw-semibold">{formatINR(student.paid)}</div>
          </div>
          <div className="col-12 mt-2">
            <div className="text-muted small">Due</div>
            <div className="fw-semibold text-danger">{formatINR(due)}</div>
          </div>
        </div>

        <div className="mt-3">
          <input type="number" className="form-control" placeholder={`Max ${due}`} value={amount} onChange={e=>setAmount(e.target.value)} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
        <Button variant="primary" onClick={()=>{ onPay(Number(amount)||0); setAmount(""); }}>Pay</Button>
      </Modal.Footer>
    </Modal>
  );
}
