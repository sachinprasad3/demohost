import React, { useState, useEffect, useCallback } from "react";
import { Eye, Pencil, Loader2, Search, X, ChevronLeft, ChevronRight, Trash2, AlertTriangle } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utills/axiosInstance";
import Popup from "../../components/Popup";

export default function StudentDiscountList() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    // --- STATE ---
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKey, setSearchKey] = useState("");
    const [pagination, setPagination] = useState({
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        lastPage: true,
    });
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: "" });
    const [deactivating, setDeactivating] = useState(false);
    const [firstLoadDone, setFirstLoadDone] = useState(false);


    // --- 1. FETCH DATA ---
    const fetchDiscounts = useCallback(async (key = "", page = 0) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/api/v1/student-discounts/getAll", {
                params: {
                    searchKey: key || null,
                    pageNumber: page,
                    pageSize: pagination.pageSize || 10,
                },
            });

            if (response.data.status === "Success") {
                const { content, ...pageData } = response.data.data;
                setDiscounts(content || []);
                setPagination(pageData);
            } else {
                // Using your specific notification context structure
                showNotification({
                    message: response.data.message || "Failed to fetch discounts",
                    type: "error",
                });
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            const errorMsg = error.response?.data?.metadata?.error || "Internal Server Error. Please try again.";
            showNotification({
                message: errorMsg,
                type: "error",
            });
        } finally {
            setLoading(false);
            setFirstLoadDone(true);
        }
    }, [pagination.pageSize, showNotification]);

    // --- 2. DEBOUNCE SEARCH LOGIC ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchDiscounts(searchKey, 0); // Reset to page 0 on new search
        }, 600);

        return () => clearTimeout(delayDebounceFn);
    }, [searchKey, fetchDiscounts]);

    // --- DEACTIVATION LOGIC ---
    const handleDeactivate = async () => {
        setDeactivating(true);
        try {
            const payload = {
                discountId: deleteModal.id,
                active: "N" // Triggers the deactivation logic in your Spring Boot service
            };

            const response = await axiosInstance.post("/api/v1/student-discounts/apply", payload);

            if (response.data.status === "Success") {
                showNotification({
                    message: `Discount for ${deleteModal.name} deactivated successfully`,
                    type: "success",
                });
                setDeleteModal({ show: false, id: null, name: "" });
                fetchDiscounts(searchKey, pagination.pageNumber); // Refresh list
            }
        } catch (error) {
            showNotification({ message: "Failed to deactivate record", type: "error" });
        } finally {
            setDeactivating(false);
        }
    };

    // --- HANDLERS ---
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchDiscounts(searchKey, newPage);
        }
    };

    const handleEdit = (id) => {
        navigate(`/admin/student-discounts/edit/${id}`);
    };

    const handleView = (id) => {
        navigate(`/admin/student-discounts/view/${id}`);
    };

    return (
        <div className="mainpro">
            <div className="container">
                {/* --- SEARCH HEADER --- */}
                <div className="whitebox mb-4">
                    <div className="d-flex align-items-center justify-content-between">
                        {/* Left Side: Search Bar */}
                        <div className="searchbar position-relative flex-grow-1" style={{ maxWidth: "600px" }}>
                            <input
                                type="text"
                                className="form-control ps-5"
                                placeholder="Search by Name, Phone or Email..."
                                value={searchKey}
                                onChange={(e) => setSearchKey(e.target.value)}
                            />
                            <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" size={18} />
                            {searchKey && (
                                <X
                                    className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer text-secondary"
                                    size={18}
                                    onClick={() => setSearchKey("")}
                                />
                            )}
                        </div>

                        {/* Right Side: Add Button */}
                        <div>
                            <button
                                className="btn btn-primary d-flex align-items-center gap-2"
                                onClick={() => navigate("/admin/add-student-discount")}
                            >
                                + Add Discount
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- LIST SECTION --- */}
                <div className="whitebox p-0 overflow-hidden">
                    {loading ? (
                        <div className="p-5 text-center">
                            <Loader2 className="animate-spin mx-auto mb-2 text-primary" size={40} />
                            <p className="text-muted">Loading...</p>
                        </div>
                    ) : discounts.length > 0 ? (
                        <ul>
                            {discounts.map((item, index) => (
                                <li key={item.discountId}>
                                    <div className="listbox paymentbox">
                                        <div data-head="Sl.">{pagination.pageNumber * pagination.pageSize + index + 1}</div>
                                        <div data-head="Student" className="fw-bold">{item.studentName}</div>
                                        <div data-head="Guardian">{item.guardianName}</div>
                                        <div data-head="Contact">{item.mobileNo}</div>
                                        <div data-head="Email" className="text-truncate">{item.contactEmail}</div>
                                        <div data-head="Amount" className="text-success fw-bold">₹{item.discountAmount}</div>
                                        <div data-head="Status">
                                            <span className={`badge-status ${item.discStatus.toLowerCase()}`}>
                                                {item.discStatus}
                                            </span>
                                        </div>
                                        <div className="actionbtns">
                                            <button onClick={() => navigate(`/admin/student-discounts/view/${item.discountId}`)} title="View" className="btn-action view">
                                                <Eye size={18} />
                                            </button>

                                            <button
                                                onClick={() => navigate(`/admin/student-discounts/edit/${item.discountId}`)}
                                                disabled={item.discStatus === "UTILIZED" || item.discStatus === "APPROVED"}
                                                title="Edit"
                                                className="btn-action edit"
                                            >
                                                <Pencil size={18} />
                                            </button>

                                            {/* --- DELETE / DEACTIVATE BUTTON --- */}
                                            <button
                                                onClick={() => setDeleteModal({ show: true, id: item.discountId, name: item.studentName })}
                                                disabled={item.discStatus === "UTILIZED" || item.discStatus === "APPROVED"}
                                                title="Deactivate"
                                                className="btn-action delete"
                                            >
                                                <Trash2 size={18} className={item.discStatus === "UTILIZED" || item.discStatus === "APPROVED" ? "text-secondary opacity-25" : "text-danger"} />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : firstLoadDone ? (
                        /* --- EMPTY STATE UI --- */
                        <div className="p-5 text-center">
                            <p className="text-muted small">
                                {searchKey
                                    ? `We couldn't find any results matching "${searchKey}"`
                                    : "No discount records have been created yet."}
                            </p>
                            {!searchKey && (
                                <button
                                    className="btn btn-outline-primary btn-sm mt-2"
                                    onClick={() => navigate("/admin/add-student-discount")}
                                >
                                    Create First Discount
                                </button>
                            )}
                        </div>
                    ): null}

                    {/* --- PAGINATION CONTROLS --- */}
                    {pagination.totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-4 px-3">
                            <div className="text-muted small">
                                Showing {discounts.length} of {pagination.totalElements} records
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                                    disabled={pagination.pageNumber === 0}
                                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>
                                <div className="px-3 fw-bold small">
                                    Page {pagination.pageNumber + 1} of {pagination.totalPages}
                                </div>
                                <button
                                    className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                                    disabled={pagination.lastPage}
                                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- CONFIRMATION POPUP --- */}
            {deleteModal.show && (
                <Popup
                    title="Confirm Deactivation"
                    onClose={() => !deactivating && setDeleteModal({ show: false, id: null, name: "" })}
                    onSave={handleDeactivate}
                    saveText={deactivating ? "Deactivating..." : "Yes, Deactivate"}
                    submitClass="btn-danger"
                >
                    <div className="text-center p-3">
                        <AlertTriangle size={48} className="text-danger mb-3 mx-auto" />
                        <h5>Deactivate Discount?</h5>
                        <p className="text-muted small">
                            Are you sure you want to deactivate the discount for <strong>{deleteModal.name}</strong>?
                            This record will no longer be visible in active lists.
                        </p>
                    </div>
                </Popup>
            )}
        </div>
    );
}