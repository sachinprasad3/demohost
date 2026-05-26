import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utills/axiosInstance";
import { FaSpinner } from "react-icons/fa";
import DetailRow from "./DetailRow";
import FollowUp from "./FollowUp";

export default function EnquiryDetailPage() {

  const formatDate = (dateStr) => {
  if (!dateStr) return "--";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
  const { enquiryId } = useParams();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newStatus, setNewStatus] = useState(null);
  const [schoolResponseText, setSchoolResponseText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [followUp, setFollowup] = useState({})
  // 🔹 Store name for BackHeader
useEffect(() => {
  if (details?.studentFirstName) {
    const name = `${details?.studentFirstName} ${details?.studentLastName || ""}`;
    sessionStorage.setItem("enquiryHeaderName", name);

    // ✅ trigger header update
    window.dispatchEvent(new Event("enquiryHeaderUpdate"));
  }
}, [details]);



  useEffect(() => {
    loadDetails();
  }, [enquiryId]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/enquiry/getDetailsById/${enquiryId}`);
console.log("followUp",res)

      setFollowup({enquiryDetails:res.data.data?.enquiryDetails,enquiryStatus:res.data.data?.inquiryStatus})
      setDetails(res.data.data);
      setNewStatus(res.data.data.inquiryStatus);
    } catch (err) {
   console.error("Failed to load enquiry details",err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, enquiryDetSlno) => {
    if (!newStatus) return;

    setIsUpdating(true);
    try {
      await axiosInstance.put(
        `/api/enquiry/updateEnquiryStatus/${id}`,
        {
          newInquiryStatus: newStatus,
          responseBy: "ADMIN",
          detailUpdate: schoolResponseText
            ? { enquiryDetSlno, schoolResponse: schoolResponseText }
            : null,
        }
      );
      setSchoolResponseText("");
      loadDetails();
    } catch (err) {
      alert("Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <FaSpinner className="spin me-2" /> Loading Enquiry...
      </div>
    );
  }

  return (
    <div className="mainpro">
      <div className="container mt-4">
 
        <div className="card ">
          {/* <DetailRow
            details={details}
            enquiryId={enquiryId}
            handleStatusUpdate={handleStatusUpdate}
            newStatus={newStatus}
            setNewStatus={setNewStatus}
            schoolResponseText={schoolResponseText}
            setSchoolResponseText={setSchoolResponseText}
            isUpdating={isUpdating}
            updateMessage={updateMessage}
          /> */}

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
                    <div>{formatDate(details.dateOfBirth)}</div>
                </div>
            </li>
            <li>
                <div>
                    <label>Academic Year</label>
                    <div>{details.academicYear}</div>
                </div>
            </li>
            <li>
                <div>
                    <label>Phone No.</label>
                    <div>{details.phonePrimary}</div>
                </div>
            </li>
            <li>
                {details.addressLine1 && 
                <div>
                    <label>Address</label>
                    <div>{details.addressLine1}</div>
                </div>}
            </li>
        </ul>
    </div>
       
        {/* 🔹 FOLLOW-UP LOG */}
        <FollowUp followupMap={followUp} enquiryId ={enquiryId} reloadDetails={loadDetails}/>
 </div>

      </div>
    </div>
  );
}
