import React, { useState, useEffect } from "react";
import { API_URL } from "../../config";
import { Pencil, X, Clock } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import Popup from "../../components/Popup";

export default function Events() {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ type: "event", startDate: "", endDate: "", startTime: "", endTime: "", title: "", location: "", color: "", });
  const [events, setEvents] = useState([]);
  const [editId, setEditId] = useState(null);
  const { showNotification } = useNotification();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filterType, setFilterType] = useState("all");


  const formatTime = (time) => {
    if (!time) return "-";
    return time;
  };
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  useEffect(() => {
    loadEvents();
  }, []);
  const loadEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/events`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Error loading events:", err);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type" && value === "holiday") {
      setForm({
        ...form,
        type: value,
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        location: "",
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const resetForm = () => {
    setForm({
      type: "event",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      title: "",
      location: "",
      color: "",
    });

    setEditId(null);
  };

  const handleEdit = (ev) => {
    setEditId(ev.id);

    setForm({
      type: ev.type || "event",
      startDate: ev.startDate,
      endDate: ev.endDate || "",
      startTime: ev.startTime || "",
      endTime: ev.endTime || "",
      title: ev.title,
      location: ev.location || "",
      color: ev.color || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveEvent = async (e) => {
    e.preventDefault();

    if (!form.startDate && form.endDate) {
      showNotification({
        message: "Start date is required if end date is selected.",
        type: "error",
      });
      return;
    }

    if (form.type === "event" && !form.startTime && form.endTime) {
      showNotification({
        message: "Start time is required if end time is selected.",
        type: "error",
      });
      return;
    }

    if (form.endDate && form.endDate < form.startDate) {
      showNotification({
        message: "End date cannot be earlier than start date.",
        type: "error",
      });
      return;
    }

    if (
      form.type === "event" &&
      form.startDate === form.endDate &&
      form.startTime &&
      form.endTime &&
      form.endTime <= form.startTime
    ) {
      showNotification({
        message: "End time must be greater than start time.",
        type: "error",
      });
      return;
    }

    try {
      const res = await fetch(
        editId ? `${API_URL}/api/events/${editId}` : `${API_URL}/api/events`,
        {
          method: editId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error("Save failed");

      showNotification({
        message: editId
          ? `${form.type === "holiday" ? "Holiday" : "Event"} updated successfully!`
          : `${form.type === "holiday" ? "Holiday" : "Event"} added successfully!`,
        type: "success",
      });

      setForm({
        type: "event",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        title: "",
        location: "",
        color: "",
      });

      setEditId(null);
      loadEvents();
    } catch (err) {
      alert("Error saving event");
    }
  };
  const deleteEvent = async () => {
    try {
      await fetch(`${API_URL}/api/events/${deleteId}`, {
        method: "DELETE",
      });

      showNotification({
        message: "Event deleted successfully!",
        type: "success",
      });

      setShowDeletePopup(false);
      setDeleteId(null);
      loadEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const timeOptions = [];

  for (let h = 1; h <= 12; h++) {
    timeOptions.push(`${h}:00 AM`);
    timeOptions.push(`${h}:30 AM`);
  }
  for (let h = 1; h <= 12; h++) {
    timeOptions.push(`${h}:00 PM`);
    timeOptions.push(`${h}:30 PM`);
  }

  const filteredEvents = events.filter((ev) => {
    const type = ev.type || "event";
    if (filterType === "all") return true;
    return type === filterType;
  });

  return (
    <div className="mainpro">
      <div className="container">

        <div className="form-group">
          {/* <label>Type</label> */}

          <div className="tabs">
            <button
              type="button"
              className={`tab ${form.type === "event" ? "activeTab" : ""}`}
              onClick={() =>
                !editId &&
                setForm({ ...form, type: "event" })
              }
              disabled={!!editId}
            >
              Event
            </button>

            <button
              type="button"
              className={`tab ${form.type === "holiday" ? "activeTab" : ""}`}
              onClick={() =>
                !editId &&
                setForm({
                  ...form,
                  type: "holiday",
                  startTime: "",
                  endTime: "",
                  location: ""
                })
              }
              disabled={!!editId}
            >
              Holiday
            </button>
          </div>
        </div>
        <div className="whitebox">
          <h4>
            {editId
              ? `Edit ${form.type === "holiday" ? "Holiday" : "Event"}`
              : `Add New ${form.type === "holiday" ? "Holiday" : "Event"}`
            }
          </h4>
          <form onSubmit={saveEvent}>
            <div className="formbox stapform">
              <ul>
                <li>
                  <div className="form-group">
                    <label>Title <span className="text-danger">*</span></label>
                    <input type="text" placeholder="Enter Title" name="title" className="form-control" value={form.title} onChange={handleChange} required />
                  </div>
                </li>
                <li>
                  <div className="form-group">
                    <label>
                      Start Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      className="form-control"
                      value={form.startDate}
                      min={today}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </li>

                <li>
                  <div className="form-group">
                    <label>
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      className="form-control"
                      value={form.endDate}
                      min={form.startDate || today}
                      onChange={handleChange}
                    />
                  </div>
                </li>
                {form.type === "event" && (
                  <>
                    <li>
                      <div className="form-group">
                        <label>Start Time</label>
                        <select
                          name="startTime"
                          className="form-control"
                          value={form.startTime}
                          onChange={handleChange}
                        >
                          <option value="">Select Time</option>
                          {timeOptions.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </li>

                    <li>
                      <div className="form-group">
                        <label>End Time</label>
                        <select
                          name="endTime"
                          className="form-control"
                          value={form.endTime}
                          onChange={handleChange}
                        >
                          <option value="">Select Time</option>
                          {timeOptions.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </li>
                  </>
                )}

                {form.type === "event" && (
                  <li>
                    <div className="form-group">
                      <label>
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Location"
                        name="location"
                        className="form-control"
                        value={form.location}
                        onChange={handleChange}
                      />
                    </div>
                  </li>
                )}
                <li className="fullsec form-actions">
                  <button className="btn btn-primary">
                    {editId
                      ? `Update ${form.type === "holiday" ? "Holiday" : "Event"}`
                      : `Save ${form.type === "holiday" ? "Holiday" : "Event"}`
                    }
                  </button>

                  {editId && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={resetForm}
                    >
                      Cancel Edit
                    </button>
                  )}
                </li>
              </ul>
            </div>
          </form>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Event List</h4>

          <select
            className="form-control"
            style={{ width: "180px" }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="event">Events</option>
            <option value="holiday">Holidays</option>
          </select>
        </div>
        <div className="listsec syllabus-master">

          {filteredEvents.length === 0 ? (
            <div className="alert alert-warning text-center">
              No {filterType === "all" ? "events or holidays" : filterType + "s"} found.
            </div>
          ) : (
            <>
              <div className="listbox eventlist theading studentlist">
                <div>Sl.</div>
                <div>Title</div>
                <div className="event-type">Type</div>
                {filterType !== "holiday" && <div>Location</div>}
                <div>Date</div>
                {filterType !== "holiday" && <div>Time</div>}
                <div>Action</div>
              </div>

              <ul>
                {filteredEvents.map((ev, index) => {
                  const type = ev.type || "event";

                  return (
                    <li key={ev.id}>
                      <div className="listbox eventlist studentlist">
                        <div>{index + 1}</div>

                        <div data-head="Title">
                          <strong>{ev.title}</strong>
                        </div>

                        <div data-head="Type" className={`event-type ${type}`}>
                          {type === "holiday" ? "Holiday" : "Event"}
                        </div>

                        {filterType !== "holiday" && (
                          <div data-head="Location">{ev.location || "-"}</div>
                        )}

                        <div data-head="Date">
                          {ev.endDate
                            ? (ev.startDate === ev.endDate
                              ? formatDate(ev.startDate)
                              : `${formatDate(ev.startDate)} → ${formatDate(ev.endDate)}`)
                            : formatDate(ev.startDate)
                          }
                        </div>

                        {filterType !== "holiday" && (
                          <div data-head="Time" className="fullsec">
                            {ev.startTime ? (
                              <>
                                <Clock size={16} /> {formatTime(ev.startTime)}
                                {ev.endTime && ` → ${formatTime(ev.endTime)}`}
                              </>
                            ) : (
                              "-"
                            )}
                          </div>
                        )}


                        <div className={`${type === "holiday" ? "fullsec" : ""} actionbtns`}>
                          <button className="editbtn" onClick={() => handleEdit(ev)}>
                            <Pencil size={16} />
                          </button>

                          <button
                            className="crossbtn"
                            onClick={() => {
                              setDeleteId(ev.id);
                              setShowDeletePopup(true);
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {showDeletePopup && (
          <Popup
            title="Delete Event"
            closeOnOutsideClick={false}
            onClose={() => {
              setShowDeletePopup(false);
              setDeleteId(null);
            }}
            onSave={deleteEvent}
            saveText="Delete"
            submitClass="dangerBtn"
          >
            <p>Are you sure you want to delete this event?</p>
          </Popup>
        )}

      </div>
    </div>
  );
}
