import React from "react";
import { FaSpinner } from "react-icons/fa";

const STATUS_OPTIONS = [
  "ENQUIRY",
  "FORM_REQUESTED",
  "ADMISSION_REQUESTED",
  "CLOSED",
  "ADMITTED"
];

export default function DetailRow({
  details,
  enquiryId,
  handleStatusUpdate,
  newStatus,
  setNewStatus,
  schoolResponseText,
  setSchoolResponseText,
  isUpdating,
  updateMessage
}) {
  if (!details) return null;

  const detailToRespondTo =
    details.enquiryDetails?.find(d => !d.schoolResponse) ||
    details.enquiryDetails?.[0];

  const canRespond =
    detailToRespondTo &&
    detailToRespondTo.parentEnquiry &&
    !detailToRespondTo.schoolResponse;

  const enquiryDetSlno = detailToRespondTo?.enquiryDetSlno || 1;

  return (
    <>
    <div className="enqdt">
        <ul>
            <li>
                <div>
                    <label>Student Name</label>
                    <div>
                        {details.studentFirstName}{" "}
                        {details.studentMiddleName}{" "}
                        {details.studentLastName}
                    </div>
                </div>
            </li>
            <li>
                <div>
                    <label>Inquired By</label>
                    <div>{details.inquiryBy}</div>
                </div>
            </li>
            <li>
                <div>
                    <label>DOB</label>
                    <div>{details.dateOfBirth}</div>
                </div>
            </li>
            <li>
                <div>
                    <label>Academic Year</label>
                    <div>{details.academicYear}</div>
                </div>
            </li>
            <li>
                
            </li>
        </ul>
    </div>
      {/* <div className="row"> 

        <div className="col-md-3 mt-3">
          <label className="fw-bold text-success">Mark As</label>
          <select
            className="form-select"
            value={newStatus || details.inquiryStatus}
            onChange={e => setNewStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-12 mt-3">
          <h6 className="text-secondary">Enquiry Notes</h6>
          <ul className="list-unstyled">
            {details.enquiryDetails?.map((det, i) => (
              <li key={i} className="border-bottom pb-2 mb-2">
                <small className="text-muted">
                  Query (SL No: {det.enquiryDetSlno})
                </small>
                <p>{det.parentEnquiry}</p>

                {det.schoolResponse && (
                  <div className="alert alert-success py-1">
                    <small>School Response: {det.schoolResponse}</small>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {canRespond && (
            <div className="mt-3">
              <label className="fw-bold">
                School Response (SL No: {enquiryDetSlno})
              </label>
              <textarea
                className="form-control"
                rows="3"
                value={schoolResponseText}
                onChange={e => setSchoolResponseText(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-end mt-3">
        {updateMessage && (
          <span className="me-3 fw-bold text-success">
            {updateMessage}
          </span>
        )}

        <button
          className="btn btn-success"
          disabled={isUpdating}
          onClick={() =>
            handleStatusUpdate(enquiryId, enquiryDetSlno)
          }
        >
          {isUpdating ? (
            <>
              <FaSpinner className="spin me-2" /> Updating...
            </>
          ) : (
            "Update Status"
          )}
        </button>
      </div> */}
    </>
  );
}
