import React, { useState, useEffect } from "react";
import { Pencil, PlusCircle } from "lucide-react";
import Popup from "../../components/Popup";
import axiosInstance from "../../utills/axiosInstance";

export default function TransportSlabSection({ formatDate, onSuccess }) {
  const [slabs, setSlabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlab, setSelectedSlab] = useState(null);
  const [errors, setErrors] = useState({});
  const [editData, setEditData] = useState({
    minDistanceKm: "",
    maxDistanceKm: "",
    fareAmount: "",
    validFrom: "",
    validTo: "",
    active: "Y"
  });

  const fetchSlabs = async () => {
    try {
      setLoading(true);
      // Fetching from the endpoint you provided
      const response = await axiosInstance.get("/api/v1/transport-slabs/all");
      if (response.data.status === "Success") {
        setSlabs(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching transport slabs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlabs();
  }, []);

  const openModal = (slab = null) => {
    if (slab) {
      setSelectedSlab(slab);
      setEditData({
        minDistanceKm: slab.minDistanceKm,
        maxDistanceKm: slab.maxDistanceKm,
        fareAmount: slab.fareAmount,
        validFrom: slab.validFrom || "",
        validTo: slab.validTo || "",
        active: slab.active || "Y"
      });
    } else {
      setSelectedSlab(null);
      setEditData({
        minDistanceKm: "",
        maxDistanceKm: "",
        fareAmount: "",
        validFrom: new Date().toISOString().split("T")[0],
        validTo: "",
        active: "Y"
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSave = async () => {
    let newErrors = {};

    if (editData.minDistanceKm === "" || parseFloat(editData.minDistanceKm) < 0) {
      newErrors.minDistanceKm = "Min distance is required.";
    }
    if (!editData.maxDistanceKm || parseFloat(editData.maxDistanceKm) <= parseFloat(editData.minDistanceKm)) {
      newErrors.maxDistanceKm = "Max distance must be > Min distance.";
    }
    if (!editData.fareAmount || parseFloat(editData.fareAmount) <= 0) {
      newErrors.fareAmount = "Fare must be > 0.";
    }
    if (!editData.validFrom) {
      newErrors.validFrom = "Date is required.";
    }

    setErrors(newErrors);
    const errorFields = Object.keys(newErrors);
    if (errorFields.length > 0) {
      document.getElementsByName(errorFields[0])[0]?.focus();
      return;
    }

    try {
      const payload = {
        slabId: selectedSlab?.slabId || null,
        minDistanceKm: parseFloat(editData.minDistanceKm),
        maxDistanceKm: parseFloat(editData.maxDistanceKm),
        fareAmount: parseFloat(editData.fareAmount),
        validFrom: editData.validFrom,
        validTo: editData.validTo || null,
        active: editData.active 
      };

      const response = await axiosInstance.post("/api/v1/transport-slabs/save", payload);
      
      if (response.data.status === "Success") {
        setIsModalOpen(false);
        fetchSlabs(); 
        onSuccess(response.data.data); 
      }
    } catch (error) {
      console.error("Error saving transport slab:", error);
      const errorMsg = error.response?.data?.metadata?.error || "Failed to save.";
      alert(errorMsg);
    }
  };

  return (
    <div className="listsec syllabus-master" >
      <h3 >
        Transport Fare Slabs
      </h3>

      <div
        className="listbox theading"
        style={{
          display: "grid",
          // Adjusted grid to include the Status column (1fr)
          gridTemplateColumns: "0.5fr 2fr 1.5fr 1.5fr 1.5fr 1fr 1fr",
          gap: "10px",
          width: "100%",
        }}
      >
        <div>Sl.</div>
        <div>Distance (Min - Max KM)</div>
        <div>Fare (₹)</div>
        <div>Valid From</div>
        <div>Valid To</div>
        <div>Status</div>
        <div style={{ textAlign: "center" }}>Action</div>
      </div>

      {loading ? (
        <p style={{ padding: "20px" }}>Loading slabs...</p>
      ) : (
        <ul>
          {slabs.map((slab, index) => (
            <li key={slab.slabId}>
              <div
                className="listbox"
                style={{
                  display: "grid",
                  gridTemplateColumns: "0.5fr 2fr 1.5fr 1.5fr 1.5fr 1fr 1fr",
                  gap: "10px",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <div>{index + 1}</div>
                <div>{slab.minDistanceKm} - {slab.maxDistanceKm} KM</div>
                <div>₹{slab.fareAmount}</div>
                <div>{formatDate(slab.validFrom)}</div>
                <div>{formatDate(slab.validTo)}</div>
                
                {/* --- STATUS COLUMN --- */}
                <div style={{ color: slab.active === 'Y' ? '#28a745' : '#dc3545', fontWeight: '500' }}>
                  {slab.active === 'Y' ? 'Active' : 'Inactive'}
                </div>

                <div className="actionbtns" style={{ justifyContent: "center" }}>
                  <button className="editbtn" title="Edit Slab" onClick={() => openModal(slab)}>
                    <Pencil size={16} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={18} /> Add New Slab
        </button>
      </div>

      {isModalOpen && (
        <Popup
          title={selectedSlab ? "Edit Transport Slab" : "Create New Transport Slab"}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          saveText={selectedSlab ? "Update" : "Save"}
        >
          <div className="formbox searchsec transport-slab">
            <ul>
              <li>
                <div className="form-group" >
                  <label style={{ display: "block", fontWeight: "bold" }}>Min Distance (KM)</label>
                  <input
                    name="minDistanceKm"
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="Enter Min Distance"
                    style={{ borderColor: errors.minDistanceKm ? 'red' : '' }}
                    value={editData.minDistanceKm}
                    onChange={handleInputChange}
                  />
                  {errors.minDistanceKm && <small style={{ color: 'red' }}>{errors.minDistanceKm}</small>}
                </div>
              </li>

              <li>
                <div className="form-group" >
                  <label style={{ display: "block", fontWeight: "bold" }}>Max Distance (KM)</label>
                  <input
                    name="maxDistanceKm"
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="Enter Max Distance"
                    style={{ borderColor: errors.maxDistanceKm ? 'red' : '' }}
                    value={editData.maxDistanceKm}
                    onChange={handleInputChange}
                  />
                  {errors.maxDistanceKm && <small style={{ color: 'red' }}>{errors.maxDistanceKm}</small>}
                </div>
              </li>

              <li>
                <div className="form-group" >
                  <label style={{ display: "block", fontWeight: "bold" }}>Fare Amount (₹)</label>
                  <input
                    name="fareAmount"
                    type="number"
                    className="form-control"
                    placeholder="Enter Amount"
                    style={{ borderColor: errors.fareAmount ? 'red' : '' }}
                    value={editData.fareAmount}
                    onChange={handleInputChange}
                  />
                  {errors.fareAmount && <small style={{ color: 'red' }}>{errors.fareAmount}</small>}
                </div>
              </li>

              <li>
                <div className="form-group" >
                  <label style={{ display: "block", fontWeight: "bold" }}>Valid From</label>
                  <input
                    name="validFrom"
                    type="date"
                    className="form-control"
                    value={editData.validFrom}
                    onChange={handleInputChange}
                  />
                  {errors.validFrom && <small style={{ color: 'red' }}>{errors.validFrom}</small>}
                </div>
              </li>

              <li>
                <div className="form-group" >
                  <label style={{ display: "block", fontWeight: "bold" }}>Valid To (Optional)</label>
                  <input
                    name="validTo"
                    type="date"
                    className="form-control"
                    style={{ borderColor: errors.validTo ? 'red' : '' }}
                    value={editData.validTo}
                    onChange={handleInputChange}
                  />
                  {errors.validTo && <small style={{ color: 'red' }}>{errors.validTo}</small>}
                </div>
              </li>

              <li>
                <div className="form-group" >
                  <label style={{ display: "block", fontWeight: "bold" }}>Status</label>
                  <select
                    name="active"
                    className="form-control"
                    value={editData.active}
                    onChange={handleInputChange}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Y">Active</option>
                    <option value="N">Inactive</option>
                  </select>
                </div>
              </li>
            </ul>
          </div>
        </Popup>
      )}
    </div>
  );
}