import React, { useState } from "react";
import axiosInstance from "../../utills/axiosInstance";

export default function FollowUp({followupMap,enquiryId,reloadDetails}) {

  const [followupType, setFollowupType] = useState("");

  const [enquiryStatus, setEnquiryStatus] = useState(followupMap?.enquiryStatus)
  const [followupAction, setFollowupAction] = useState("");
const [errors, setErrors] = useState({});

  const [followUpNote, setFollowUpNote] = useState("");
  const [callbackDateTime, setCallbackDateTime] = useState("");
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };
  const formatDateTime = (d) => new Date(d).toLocaleString("en-IN", {day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true, });

  const enquiryStatusOption = [
    {label:"Enquiry",value:"ENQUIRY"},
    {label:"School Followup",value:"SCHOOL_FOLLOWUP"},
    {label:"Form Requested",value:"FORM_REQUESTED"},
    {label:"Admission Requested",value:"ADMISSION_REQUESTED"},
    {label:"Admitted",value:"ADMITTED"},
    {label:"Closed",value:"CLOSED"},


  ]
  console.log("errors",errors)
  const validateFollowUp = () => {
  const newErrors = {};

  if (!enquiryStatus) {
    newErrors.enquiryStatus = "Please select enquiry status";
  }

  if (!followupType) {
    newErrors.followupType = "Please select follow-up type";
  }

  if (followupType === "Call Back Later" && !callbackDateTime) {
    newErrors.callbackDateTime = "Please select callback date & time";
  }

  if (followupType && followupType !== "Call Back Later" && !followupAction) {
    newErrors.followupAction = "Please select follow-up action";
  }

  if (!followUpNote.trim()) {
    newErrors.followUpNote = "Please enter follow-up note";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

  

  // Follow-up options
  const followupOptions = {
    "First Contact": [
      "Initial contact after enquiry",
      "Welcome call / message",
      "Requirement understanding",
    ],
    "Call Back Later": [],
    "Reminder": [
      "No response earlier",
      "Gentle reminder call / WhatsApp",
      "Re-sharing details",
    ],
    "School Visit": [
      "Campus visit scheduling",
      "Demo class confirmation",
      "Visit reminder",
    ],
    "Post Visit": [
      "Feedback after visit",
      "Address parent doubts",
      "Admission guidance",
    ],
    "Fee Discussion": [
      "Fee explanation",
      "Payment options discussion",
      "Discount clarification",
    ],
    "Admission": [
      "Admission form shared",
      "Document verification",
      "Seat availability confirmation",
    ],
    "Pending Decision": [
      "Parent thinking time",
      "Comparison with other schools",
      "Soft nudging",
    ],
    "Not Interested": [
      "Parent declined",
      "Future session",
      "Reason captured",
    ],
    Cold: [
      "Long no response",
      "Re-engagement attempt",
      "Last contact attempt",
    ],
    Referral: ["Reference based", "Trust-based conversation"],
    "Re-Open": [
      "Parent came back later",
      "Session reopened",
      "Fresh discussion",
    ],
    Closure: [
      "Admission completed",
      "Enquiry closed",
      "Thank-you message",
    ],
  };
console.log("followUpmap",followupMap)
  
  const saveFollowUp = async()=>{
      if (!validateFollowUp()) return; 
    const payload = {
    newInquiryStatus: followupMap?.enquiryStatus === "ENQUIRY"?"SCHOOL_FOLLOWUP":enquiryStatus, // or map this if backend expects enum
    detailUpdate: {
      // enquiryDetSlno: "enquiryDetSlno", //  you must already have this value
      schoolResponse: followUpNote,
      reminderDate: followupType === "Call Back Later"? callbackDateTime: null,
      followupType: followupType,
      followupAction:
        followupType === "Call Back Later"
          ? null
          : followupAction,
    },
  };
console.log("followUpmap payload",payload)


    try {
      const res = await axiosInstance.put(`/api/enquiry/updateStatus/${enquiryId}`,payload)
      reloadDetails()
      setCallbackDateTime("")
      setFollowUpNote("")
      setFollowupAction("")
      setFollowupType("")
      console.log("res from saveFollowUp",res)
    } catch (error) {
      console.error("error in saving followup",error)
      
    }

  }
  return (
    <> 
      
  {followupMap.enquiryDetails?.length !== 0 && <h4>
    Follow-Up <span className="badge bg-secondary">{followupMap.enquiryDetails?.length}</span>
  </h4>}

  

  {followupMap.enquiryDetails?.map((l, i) => (
    <div key={i} className="entry followup">
      <div className="meta">
        <span className="type">{l.followupType}</span>
        <span>{formatDateTime(l.responseDate)}</span>
      </div>
      <div className="content">
        {l.followupAction && (
          <>
            <strong>{l.followupAction}</strong><br />
          </>
        )}
        {l.schoolResponse}
        {l.reminderDate && (
          <>
            <br />
            <small>Call Back On: {formatDateTime(l.reminderDate)}</small>
          </>
        )}
      </div>
    </div>
  ))}
 
        <div className="addfollowup">
        {/* <h3>Enquiry Status</h3> 
        <div className="form-group">
          <select className={`form-control ${errors.enquiryStatus ? "is-invalid" : ""}`} value={enquiryStatus}  onChange={(e) => { setEnquiryStatus(e.target.value);  }} >
            <option value="">-- Select Enquiry Status --</option>
            {enquiryStatusOption.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          </div> */}
          {errors.enquiryStatus && (
  <div className="invalid-feedback">{errors.enquiryStatus}</div>
)}



        <h3>Add Follow-Up</h3> 
        <div className="form-group">
        <select className={`form-control ${errors.followupType ? "is-invalid" : ""}`} value={followupType}  onChange={(e) => { setFollowupType(e.target.value);setErrors((p) => ({ ...p, followupType: null })); setFollowupAction(""); }} >
        <option value="">-- Select Follow-Up Type --</option>
        {Object.keys(followupOptions).map((k) => (
        <option key={k}>{k}</option>
        ))}
        </select>
        {errors.followupType && (<div className="invalid-feedback">{errors.followupType}</div>)}
        </div>

        {followupType && followupType !== "Call Back Later" && followupOptions[followupType].length > 0 && (
        <div className="form-group">
        <select className={`form-control ${errors.followupAction ? "is-invalid" : ""}`} value={followupAction} onChange={(e) => {
        setFollowupAction(e.target.value);
        setErrors((p) => ({ ...p, followupAction: null }));}}  >
        <option value="">-- Select Action --</option>
        {followupOptions[followupType].map((v) => (
        <option key={v}>{v}</option>
        ))}
        </select>
        </div>
        )}
        {errors.followupAction && (
        <div className="invalid-feedback">{errors.followupAction}</div>
        )}


        {followupType === "Call Back Later" && (
        <div className="form-group">
        <input type="datetime-local"  className={`form-control ${errors.callbackDateTime ? "is-invalid" : ""}`} value={callbackDateTime} min={getMinDateTime()} onChange={(e) => {
        setCallbackDateTime(e.target.value);
        setErrors((p) => ({ ...p, callbackDateTime: null }));
        }} /></div>
        )}
        {errors.callbackDateTime && (
        <div className="invalid-feedback">{errors.callbackDateTime}</div>
        )}


        <div className="form-group"><textarea className={`form-control ${errors.followUpNote ? "is-invalid" : ""}`} value={followUpNote} onChange={(e) => {
        setFollowUpNote(e.target.value);
        setErrors((p) => ({ ...p, followUpNote: null }));
        }} placeholder="Enter follow-up note..." /></div>
        {errors.followUpNote && (
        <div className="invalid-feedback">{errors.followUpNote}</div>
        )}

          <button className="btn btn-primary" onClick={saveFollowUp}>
            Save Follow-Up
          </button>
        </div>
     

    </>
  );
}
