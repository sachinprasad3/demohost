import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Loader2, User, ShieldCheck, CreditCard, Calendar, X, AlertTriangle } from "lucide-react";
import axiosInstance from "../../utills/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import Popup from "../../components/Popup";

export default function StudentDiscountView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showNotification } = useNotification();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ show: false, status: "" });

    const isOwner = user?.role === "OWNER";

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const res = await axiosInstance.get(
                `/api/v1/student-discounts/getById/${id}`
            );
            if (res.data.status === "Success") {
                setData(res.data.data);
            }
        } catch (err) {
            showNotification({
                message: "Error fetching discount details",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const triggerConfirm = (status) => {
        setConfirmModal({ show: true, status });
    };

    const handleConfirmUpdate = async () => {
        setActionLoading(true);
        const newStatus = confirmModal.status;

        // Prepare payload as per your specific requirement
        const payload = {
            ...data,
            discountId: id,
            discStatus: newStatus,
            active: "Y"
        };

        try {
            const response = await axiosInstance.post(`/api/v1/student-discounts/apply`, payload);
            if (response.data.status === "Success") {
                showNotification({
                    message: `Discount ${newStatus === 'APPROVED' ? 'Approved' : 'Rejected'} successfully!`,
                    type: "success"
                });
                setConfirmModal({ show: false, status: "" });
                fetchDetails(); // Refresh view
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to update discount status.";
            showNotification({ message: errorMsg, type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "---";
        const [year, month, day] = dateStr.split("-");
        return `${day}-${month}-${year}`;
    };

    if (loading)
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );

    const statusColor =
        data?.discStatus === "APPROVED" || data?.discStatus === "UTILIZED"
            ? "bg-success"
            : data?.discStatus === "REJECTED"
                ? "bg-danger"
                : "bg-info";
    

    const getStatusStyles = (status) => {
        switch (status) {
            case "APPROVED":
            case "UTILIZED":
                return { bg: "bg-success text-white", label: "Approved" };
            case "REJECTED":
                return { bg: "bg-danger text-white", label: "Rejected" };
            case "FORWARDED":
                return { bg: "bg-info text-dark", label: "Pending Approval" };
            case "CANCELLED":
                return { bg: "bg-secondary text-white", label: "Cancelled" };
            default:
                return { bg: "bg-light text-dark", label: status };
        }
    };

    const currentStatus = getStatusStyles(data?.discStatus);

    return (
        <div className="container py-4 mt-5" style={{ maxWidth: 1100 }}>

            {/* Card */}
            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-5 border-bottom pb-3">
                <div>
                    <h4 className="fw-bold mb-1 text-dark">
                        {data?.studentFirstName} {data?.studentLastName}
                    </h4>
                    <div className="text-muted small">
                        Reference ID: <span className="fw-bold">#DISC-{id}</span>
                    </div>
                </div>

                {/* Status Badge moved INSIDE the main box */}
                <div className="text-end">
                    <span className="text-muted small d-block fw-bold text-uppercase mb-1" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                        Current Status
                    </span>
                    <span className={`badge ${statusColor} px-4 py-2 shadow-sm rounded-pill`} style={{ fontSize: '13px fw-600' }}>
                        {data?.discStatus}
                    </span>
                </div>
            </div>
                    {/* Student */}
                    <Section title="Student Information" icon={<User size={18} />}>
                        <InfoGrid
                            items={[
                                {
                                    label: "Full Name",
                                    value: `${data?.studentFirstName || ""} ${data?.studentMiddleName || ""
                                        } ${data?.studentLastName || ""}`,
                                },
                                { label: "Gender", value: data?.gender },
                                { label: "Date of Birth", value: formatDate(data?.dateOfBirth) },
                            ]}
                        />
                    </Section>

                    {/* Guardian */}
                    <Section
                        title="Guardian Information"
                        icon={<ShieldCheck size={18} />}
                    >
                        <InfoGrid
                            items={[
                                { label: "Guardian Name", value: data?.guardianName },
                                {
                                    label: "Relationship",
                                    value: data?.guardianRelationName,
                                },
                                { label: "Contact No", value: data?.mobileNo },
                                { label: "Email", value: data?.contactEmail || "---" },
                            ]}
                        />
                    </Section>

                    {/* Discount */}
                    <Section
                        title="Discount Configuration"
                        icon={<CreditCard size={18} />}
                    >
                        <InfoGrid
                            items={[
                                {
                                    label: "Discount Value",
                                    value: data?.discountAmount
                                        ? `₹${data.discountAmount}`
                                        : `${data?.discountPerc}%`,
                                    highlight: true,
                                },
                                {
                                    label: (
                                        <span className="d-flex align-items-center gap-1">
                                            <Calendar size={14} /> Valid From
                                        </span>
                                    ),
                                    value: formatDate(data?.validFrom),
                                },
                                {
                                    label: (
                                        <span className="d-flex align-items-center gap-1">
                                            <Calendar size={14} /> Valid To
                                        </span>
                                    ),
                                    value: formatDate(data?.validTo),
                                },
                            ]}
                        />
                    </Section>
                </div>
            </div>

            {/* Actions */}
            <div className="border-top">
                {isOwner && data?.discStatus === "FORWARDED" ? (
                    <div className="d-flex flex-column align-items-center gap-3">
                        <button
                            className="btn d-flex align-items-center shadow-sm px-5 py-2"
                            style={{
                                backgroundColor: "#f1f3f5",
                                color: "#495057",
                                border: "1px solid #dee2e6"
                            }}
                            onClick={() => navigate(-1)}
                            disabled={actionLoading}
                        >
                            <X size={18} /> Cancel
                        </button>

                        <div className="d-flex flex-wrap justify-content-center gap-3">
                            <button
                                className="btn btn-danger px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                                onClick={() => triggerConfirm("REJECTED")}
                                disabled={actionLoading}
                            >
                                <XCircle size={18} /> Reject Discount
                            </button>

                            <button
                                className="btn btn-success px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                                onClick={() => triggerConfirm("APPROVED")}
                                disabled={actionLoading}
                            >
                                <CheckCircle size={18} /> Approve Discount
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <button
                            className="btn btn-outline-secondary px-5 py-2 shadow-sm"
                            style={{
                                backgroundColor: "#f1f3f5",
                                color: "#495057",
                                border: "1px solid #dee2e6"
                            }}
                            onClick={() => navigate(-1)}
                        >
                            Close View
                        </button>
                    </div>
                )}
            </div>

            {/* --- CONFIRMATION POPUP --- */}
            {confirmModal.show && (
                <Popup
                    title="Confirm Action"
                    onClose={() => !actionLoading && setConfirmModal({ show: false, status: "" })}
                    onSave={handleConfirmUpdate}
                    /* Dynamic button text: "Yes, Approve" or "Yes, Reject" */
                    saveText={actionLoading ? "Processing..." : `Yes, ${confirmModal.status === "APPROVED" ? "Approve" : "Reject"}`}
                    submitClass={confirmModal.status === "APPROVED" ? "bg-success" : "bg-danger"}
                >
                    <div className="text-center p-3">
                        <AlertTriangle size={48} className={confirmModal.status === "APPROVED" ? "text-success mb-3" : "text-danger mb-3"} />
                        <h5>Are you sure?</h5>
                        <p className="text-muted">
                            {/* Logic: If status is 'APPROVED', show 'approve'. 
                   If status is 'REJECTED', show 'reject'. 
                */}
                            You are about to <strong>{confirmModal.status === "APPROVED" ? "approve" : "reject"}</strong> the discount for
                            <br /> <strong>{data?.studentFirstName} {data?.studentLastName}</strong>.
                        </p>
                    </div>
                </Popup>
            )}
        </div>
    );
}

/* ---------- Reusable UI (Outside Component) ---------- */

function Section({ title, icon, children }) {
    return (
        <div className="mb-4">
            <h6 className="text-primary fw-bold mb-3 d-flex align-items-center gap-2">
                {icon} {title}
            </h6>
            {children}
        </div>
    );
}

function InfoGrid({ items }) {
    return (
        <div className="row g-3">
            {items.map((item, idx) => (
                <div key={idx} className="col-md-6 col-lg-3">
                    <div className="border rounded p-3 h-100 bg-light-subtle">
                        <div className="text-muted small fw-semibold text-uppercase mb-1">
                            {item.label}
                        </div>
                        <div
                            className={`fs-6 ${item.bold ? "fw-bold" : ""} ${item.highlight ? "text-success fw-bold fs-5" : ""
                                }`}
                        >
                            {item.value || "---"}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}