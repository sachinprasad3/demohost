import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utills/axiosInstance";
import { FaChevronDown, FaChevronUp, FaSpinner } from "react-icons/fa";
import EnquiryGraph from "../../components/EnquiryGraph";
// import Popup from "../../components/Popup"; 
const STATUS_OPTIONS = [
  "ENQUIRY",  "FORM_REQUESTED",  "ADMISSION_REQUESTED",  "CLOSED",  "ADMITTED"
];

// const handleEnquiryClick = (id) => {
//   setSelectedEnquiryId(id);
//   setShowDetailPopup(true);
//   fetchEnquiryDetails(id);
// };
const DetailRow = ({ details, enquiryId, handleStatusUpdate, newStatus, setNewStatus, schoolResponseText, setSchoolResponseText, isUpdating, updateMessage }) => {
    if (!details) return null;
    const detailToRespondTo = details.enquiryDetails && details.enquiryDetails.find(det => !det.schoolResponse) ||
        (details.enquiryDetails && details.enquiryDetails[0]);

    const canRespond = detailToRespondTo && detailToRespondTo.parentEnquiry && !detailToRespondTo.schoolResponse;
    const enquiryDetSlno = detailToRespondTo ? detailToRespondTo.enquiryDetSlno : 1;
    return (       
            <>
                <div className="row gap-0"> 
                    <div className="col-md-3">
                        <label>Student's Name:</label>
                        <div>{details.studentFirstName} {details.studentMiddleName} {details.studentLastName} </div>
                    </div>
                    <div className="col-md-3">
                        <label>Inquired By:</label>
                        <div>{details.inquiryBy} </div>
                    </div>
                    <div className="col-md-3">
                        <label>DOB:</label>
                        <div>{details.dateOfBirth}</div>
                    </div>
                    <div className="col-md-3">
                        <label>Academic Year:</label>
                        <div>{details.academicYear} </div>
                    </div>
 
                    <div className="col-md-3">
                        <label className="form-label fw-bold text-success">Mark as:</label>
                        <select className="form-select"  value={newStatus || details.inquiryStatus} onChange={(e) => setNewStatus(e.target.value)}>
                            {STATUS_OPTIONS.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div> 
                    <div className="col-md-12">
                        <h6 className="text-secondary">Enquiry Notes:</h6>
                        <ul className="list-unstyled mb-3">
                            {details.enquiryDetails && details.enquiryDetails.map((det, index) => (
                                <li key={index} className="border-bottom pb-2 mb-2">
                                    <small className="text-muted d-block">Query (SL No: {det.enquiryDetSlno}):</small>
                                    <p className="mb-1">{det.parentEnquiry}</p>
                                    {det.schoolResponse && (
                                        <div className="alert alert-success py-1 mt-1">
                                            <small className="d-block">School Response: {det.schoolResponse}</small>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
 
                        {canRespond && (
                            <div className="mb-3">
                                <label htmlFor="schoolResponse" className="form-label fw-bold">Add School Response for SL No: {enquiryDetSlno}</label>
                                <textarea id="schoolResponse"  className="form-control" rows="3" value={schoolResponseText} onChange={(e) => setSchoolResponseText(e.target.value)}
                                    placeholder="Enter response or notes here..." ></textarea>
                            </div>
                        )}
                    </div>
                </div>

                {/* Update Button and Feedback */}
                {/* <div className="d-flex justify-content-end align-items-center mt-3 pt-3 border-top">
                    {updateMessage && (
                        <span className={`me-3 fw-bold ${updateMessage.includes('successfully') ? 'text-success' : 'text-danger'}`}>
                            {updateMessage}
                        </span>
                    )}

                    <button
                        className="btn btn-success"
                        onClick={() => handleStatusUpdate(enquiryId, enquiryDetSlno)}
                        disabled={isUpdating || (!newStatus && !schoolResponseText)} // Disable if nothing changed or if loading
                    >
                        {isUpdating ? (
                            <> <FaSpinner className="spin me-2" /> Updating...</>
                        ) : (
                            'Update Status & Response'
                        )}
                    </button>
                </div> */}
            </>
        
    );
};

 
const PAGE_SIZE = 10;
const API_URL = '/api/enquiry/getList'; 
export default function EnquiryListPage() { 
//   const [showDetailPopup, setShowDetailPopup] = useState(false);
//   const [selectedEnquiryId, setSelectedEnquiryId] = useState(null);

  const [enquiries, setEnquiries] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [expandedId, setExpandedId] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  const [newStatus, setNewStatus] = useState(null);
  const [schoolResponseText, setSchoolResponseText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

// const getRowClassByDate = (dateStr) => {
//   if (!dateStr) return "";

//   const rowDate = new Date(dateStr.split(" ")[0]);
//   const today = new Date();

//   rowDate.setHours(0, 0, 0, 0);
//   today.setHours(0, 0, 0, 0);

//   if (rowDate.getTime() === today.getTime()) return "row-today";
//   if (rowDate > today) return "row-future";
//   return "row-past";
// };
const getRowClassByInquiryStatus = (status = "") => {
  const statusToRowClassMap = {
    ENQUIRY: "row-today",
    IN_PROGRESS: "row-today",

    FOLLOW_UP: "row-future",
    CALLBACK: "row-future",

    ADMITTED: "row-past",
    REJECTED: "row-past",
  };

  return statusToRowClassMap[status] || "";
};


 
    const fetchEnquiries = useCallback(async (pageToLoad) => { 
        if (pageToLoad === 0) setInitialLoading(true);
        else setLoadingMore(true); 
        try {
            const response = await axiosInstance.get(API_URL, {
                params: {
                    page: pageToLoad,
                    size: PAGE_SIZE,
                }
            }); 
            const data = response.data.data;  
            console.log('data fetching enquiries:', data);

            if (Array.isArray(data)) {
                setEnquiries(prevEnquiries =>
                    pageToLoad === 0 ? data : [...prevEnquiries, ...data]
                ); 
                setCurrentPage(pageToLoad);
                setHasMore(data.length === PAGE_SIZE);
            } else {
                setError("Invalid API response structure received.");
            }
        } catch (err) {
            console.error('Error fetching enquiries:', err);
            setError('Failed to load enquiries list from the server.');
        } finally {
            if (pageToLoad === 0) setInitialLoading(false);
            else setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchEnquiries(0);
    }, [fetchEnquiries]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchEnquiries(currentPage + 1);
        }
    };
    const navigate = useNavigate();
const handleEnquiryClick = (inquiryId) => {
  navigate(`/admin/enquiries/${inquiryId}`);
};
//  const handleEnquiryClick = async (inquiryId) => {
//   setNewStatus(null);
//   setSchoolResponseText("");
//   setUpdateMessage(null);

//   setSelectedEnquiryId(inquiryId);
//   setShowDetailPopup(true);

//   try {
//     setFetchingDetails(true);
//     const response = await axiosInstance.get(`/api/enquiry/getDetailsById/${inquiryId}`);

//     if (response.data?.data) {
//       setExpandedDetails(response.data.data);
//       setExpandedId(inquiryId);
//       setNewStatus(response.data.data.inquiryStatus);
//     }
//   } catch (err) {
//     alert("Error fetching details");
//   } finally {
//     setFetchingDetails(false);
//   }
// };

    // -----------------------------------------------------------
    // 🟢 2.1. HELPER FOR REFRESHING DETAILS (NEW)
    // -----------------------------------------------------------
    const refreshExpandedDetails = async (inquiryId) => {
        try {
            setFetchingDetails(true);
            const response = await axiosInstance.get(`/api/enquiry/getDetailsById/${inquiryId}`);

            if (response.data && response.data.data) {
                const details = response.data.data;
                setExpandedDetails(details); 
                setNewStatus(details.inquiryStatus);
            } else {
                console.error("No detailed data received during refresh.");
            }
        } catch (err) {
            console.error('Error refreshing details:', err);
        } finally {
            setFetchingDetails(false);
        }
    };

 
    const handleStatusUpdate = async (enquiryId, enquiryDetSlno) => {
        if (isUpdating || (!newStatus && !schoolResponseText)) return; 
        if (!newStatus) {
            setUpdateMessage("Please select a new status.");
            return;
        }
 
        if (schoolResponseText && schoolResponseText.trim().length < 5) {
            setUpdateMessage("Response must be at least 5 characters long.");
            return;
        }

        setIsUpdating(true);
        setUpdateMessage(null);

        try {
            const requestBody = {
                newInquiryStatus: newStatus,
                responseBy: "ADMIN_USER",
                detailUpdate: schoolResponseText.trim() ? {
                    enquiryDetSlno: enquiryDetSlno,
                    schoolResponse: schoolResponseText.trim()
                } : null
            };

            const response = await axiosInstance.put(`/api/enquiry/updateEnquiryStatus/${enquiryId}`, requestBody);

            if (response.data.data.success) {
                const msg = response.data.data.message || "Status and/or response updated successfully!";
                setUpdateMessage(msg);
                refreshExpandedDetails(enquiryId);
                setSchoolResponseText('');
                setEnquiries(prev => prev.map(e =>
                    e.inquiryId === enquiryId ? { ...e, inquiryStatus: newStatus } : e
                ));
                setTimeout(() => setUpdateMessage(null), 5000);

            } else {
                const msg = response.data.data.message || "Update failed due to an unknown error.";
                setUpdateMessage(msg);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            setUpdateMessage(`Update failed: ${errorMsg}`);
            console.error('Update API Error:', err.response || err);
        } finally {
            setIsUpdating(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="mainpro"><div className="container"><div className="loading-container text-center py-5">
                <FaSpinner className="spin me-2" /> Loading Enquiries...
            </div></div></div>
        );
    }

    if (error) {
        return (
            <div className="mainpro"><div className="container"><div className="error-container text-danger alert alert-danger mt-3">Error: {error}</div></div></div>
        );
    }

    return (
        <div className="mainpro">
            <div className="container">
                <div className="enquiry-list-page mt-4">
                     <h3>All Admission Enquiries ({enquiries.length} loaded) </h3>
                    {enquiries.length === 0 ? (
                        <div className="alert alert-info mt-3">No enquiries found.</div>
                    ) : (
                        <>
      {/* ================= DESKTOP TABLE ================= */}
      <div className="box d-none d-md-block">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Reg. No.</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Date</th>
              <th>Inquirer</th>
              <th>Status</th>
              <th>Follow Up</th>
              <th>Contact</th>
            </tr>
          </thead>
         <tbody>
  {enquiries.map((enquiry) => {
    const rowClass = getRowClassByInquiryStatus(enquiry.inquiryStatus);
    const followupClass = enquiry.followupType ? "has-followup" : "";

    return (
      <tr
        key={enquiry.inquiryId}
        className={`${rowClass} ${followupClass}`}
        onClick={() => handleEnquiryClick(enquiry.inquiryId)}
        style={{ cursor: "pointer" }}
      >
        <td>{enquiry.inquiryRegistrationNo}</td>
        <td><strong>{enquiry.studentName}</strong></td>
        <td>{enquiry.className}</td>
        <td>{enquiry.inquiryDate?.split(" ")[0]}</td>
        <td>{enquiry.inquiryBy}</td>
        <td>
          <span className="bg-secondary badge">
            {enquiry.inquiryStatus}
          </span>
        </td>
        <td>{enquiry.followupType || "-"}</td>
        <td>{enquiry.phonePrimary}</td>
      </tr>
    );
  })}
</tbody>

        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="d-block d-md-none mt-3">
        {enquiries.map((enquiry) => {
        //   const rowClass = getRowClassByDate(enquiry.inquiryDate);
           const rowClass = getRowClassByInquiryStatus(enquiry.inquiryStatus);


          return (
            <div
              key={enquiry.inquiryId}
              className={`enquiry-card ${rowClass}`}
              onClick={() => handleEnquiryClick(enquiry.inquiryId)}
            >
              <div className="card-header">
                <strong>{enquiry.studentName}</strong>
                <span className="badge bg-secondary">
                  {enquiry.inquiryStatus}
                </span>
              </div>

              <div className="card-body">
                <div><b>Reg No:</b> {enquiry.inquiryRegistrationNo}</div>
                <div><span><b>Date:</b> {enquiry.inquiryDate?.split(" ")[0]}</span> <span><b>Class:</b> {enquiry.className}</span></div>
                
                <div><b>Inquirer:</b> {enquiry.inquiryBy}</div>
                <div><b>Contact:</b> {enquiry.phonePrimary}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
                    )}

                    {/* LOAD MORE BUTTON */}
                    {hasMore && (
                        <div className="d-flex justify-content-center py-3">
                            <button
                                className="btn btn-primary"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                            >
                                {loadingMore ? (
                                    <>
                                        <FaSpinner className="spin me-2" /> Loading...
                                    </>
                                ) : (
                                    'Load More Enquiries'
                                )}
                            </button>
                        </div>
                    )}

                    {/* OPTIONAL: End of results message */}
                    {!hasMore && enquiries.length > 0 && (
                        <div className="text-center text-muted py-3 border-top mt-3">
                            End of Enquiry List. ({enquiries.length} total)
                        </div>
                    )}

                </div>
                <EnquiryGraph enquiries={enquiries} />
            </div>

              
 
        </div>
    );
}