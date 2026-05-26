// src/components/FeeBreakdown.jsx
import React from "react";
import { Table, Button } from "react-bootstrap";

export default function FeeBreakdown({ student, onPayCategory }) {
  return (
    <div>
      <h5 className="fw-bold text-primary">{student.name}</h5>
      <p className="text-muted mb-3">Class: {student.class}</p>

      <Table striped bordered hover responsive>
        <thead className="table-primary">
          <tr>
            <th>Category</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Due</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {student.fees.map((fee, i) => {
            const due = fee.total - fee.paid;
            return (
              <tr key={i}>
                <td>{fee.category}</td>
                <td>₹{fee.total}</td>
                <td>₹{fee.paid}</td>
                <td className={due > 0 ? "text-danger fw-bold" : "text-success"}>
                  ₹{due}
                </td>
                <td>
                  {due > 0 ? (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => onPayCategory(student.id, fee.category)}
                    >
                      Pay Now
                    </Button>
                  ) : (
                    <span className="text-muted small">Cleared</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
