import React, { useState } from "react";

export default function AdmissionEnquiryLog() {
  const [followupMain, setFollowupMain] = useState("");
  const [followupSub, setFollowupSub] = useState("");
  const [message, setMessage] = useState("");

  const formatDate = () =>
    new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  // ✅ DEFAULT 3 FOLLOW-UPS (OLDEST → NEWEST)
  const [logs, setLogs] = useState([
    {
      main: "First Contact",
      sub: "Initial contact after enquiry",
      message: "Spoke with parent and shared basic school details.",
      time: formatDate(),
    },
    {
      main: "Reminder",
      sub: "Gentle reminder call / WhatsApp",
      message: "Sent WhatsApp reminder for school visit.",
      time: formatDate(),
    },
    {
      main: "School Visit",
      sub: "Campus visit scheduling",
      message: "Visit scheduled for Friday at 11:00 AM.",
      time: formatDate(),
    },
  ]);

  const followupMap = {
    "First Contact": [
      "Initial contact after enquiry",
      "Welcome call / message",
      "Requirement understanding",
    ],
    Reminder: [
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
    Admission: [
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

  const saveEntry = () => {
    if (!followupMain || !followupSub) {
      alert("Please select follow-up type and action");
      return;
    }
    if (!message.trim()) {
      alert("Please enter message");
      return;
    }

    // ✅ ADD TO END → ASCENDING ORDER
    setLogs([
      ...logs,
      {
        main: followupMain,
        sub: followupSub,
        message,
        time: formatDate(),
      },
    ]);

    // reset
    setFollowupMain("");
    setFollowupSub("");
    setMessage("");
  };

  return (
    <div className="mainpro">
      <div className="container"> 
        <div className="card header">
          <h3>Admission Enquiry Log</h3>
          <span className="status">FORM REQUESTED</span>
        </div>
        <div className="card">
          <h4>Follow-Up Entries</h4>
          <div className="log">
            {logs.map((l, i) => (
              <div key={i} className="entry followup">
                <div className="meta">
                  <span className="type">Follow-Up · {l.main}</span>
                  <span>{l.time}</span>
                </div>
                <div className="content">
                  <strong>{l.sub}</strong><br />
                  {l.message}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h4>Add Follow-Up</h4> 
          <div className="form-group">
            <select className="form-control" value={followupMain} onChange={(e) => { setFollowupMain(e.target.value); setFollowupSub(""); }} >
              <option value="">-- Select Enquiry Type --</option>
              {Object.keys(followupMap).map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </div>

          {followupMain && (
            <div className="form-group" style={{ marginTop: 12 }}>
              <label>Follow-Up Action</label>
              <select className="form-control" value={followupSub} onChange={(e) => setFollowupSub(e.target.value)} >
                <option value="">-- Select Action --</option>
                {followupMap[followupMain].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter follow-up note..." />
          </div> 
          <button className="saveBtn" onClick={saveEntry}>
            Save Follow-Up
          </button>
        </div>
      </div>
    </div>
  );
}
