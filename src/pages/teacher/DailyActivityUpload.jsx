import React, { useState,useEffect  } from "react";
import "../../css/dailyactivityupload.css";

export default function DailyActivityUpload() {
  const [images, setImages] = useState([]);
  const [history, setHistory] = useState([]);
  const [className, setClassName] = useState("");
const [subject, setSubject] = useState("");
const [title, setTitle] = useState("");
const [desc, setDesc] = useState("");
const [dateValue, setDateValue] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("activityHistory")) || [];
    setHistory(saved);
  }, []);

  // 👉 handle multiple image uploads
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...previews]);
  };

  const newEntry = {
  id: Date.now(),
  date: dateValue || new Date().toLocaleDateString(),
  className,
  subject,
  title,
  desc,
  images,
};


  const handlePublish = () => {
    const date = new Date().toLocaleDateString();
    const newEntry = {
      id: Date.now(),
      date,
      images,
    };

    const updated = [newEntry, ...history];
    setHistory(updated);

    localStorage.setItem("activityHistory", JSON.stringify(updated));
    setImages([]); // clear after publish
    alert("Activity published!");
  };

  return (
    <div className="mainpro activity-page fadeIn">

        {/* PAGE HEADER */}
        <div className="td-headcard">
          <div>
            <p className="td-greet">Upload Today's Activity</p>
            <h2 className="td-name">Daily Classroom Activity</h2>
            <p className="td-section">Share what your kids learned today</p>
          </div>
          <div className="td-avatar">
            <img src="/images/icon/assignment.png" alt="" />
          </div>
        </div>

      <div className="container">
        {/* FORM CARD */}
        <div className="dash-card upload-card bounceIn">
          <h3 className="card-title">Activity Details</h3>

          <div className="form-grid">

            <div className="form-group">
              <label>Class</label>
              <select onChange={(e) => setClassName(e.target.value)}>
                <option>Nursery · Blossom</option>
                <option>LKG · A</option>
                <option>LKG · B</option>
                <option>UKG · A</option>
              </select>
            </div>

            <div className="form-group">
              <label>Subject</label>
              <select onChange={(e) => setSubject(e.target.value)}>
                <option>Art & Craft</option>
                <option>Maths</option>
                <option>English</option>
                <option>Music</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date</label>
              <input type="date" onChange={(e) => setDateValue(e.target.value)} />
            </div>

            <div className="form-group full">
              <label>Activity Title</label>
              <input type="text" onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="form-group full">
              <label>Description</label>
              <textarea onChange={(e) => setDesc(e.target.value)} />
            </div>
          </div>
        </div>

        {/* IMAGE UPLOAD SECTION */}
        <div className="dash-card upload-card bounceIn">
          <h3 className="card-title">Upload Photos / Videos</h3>
          <p className="upload-note">Parents love to see moments from class</p>

          <label className="upload-box">
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
            <span>Tap to upload</span>
          </label>

          <div className="preview-grid">
            {images.map((img, i) => (
              <div key={i} className="preview-img">
                <img src={img} alt="" />
              </div>
            ))}
          </div>

          <button className="upload-btn" onClick={handlePublish}>
            Publish Activity
          </button>
        </div>

        {history.length > 0 && (
          <div className="dash-card upload-card bounceIn">
            <h3 className="card-title">Previous Activities</h3>

            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id}>
  <div className="hist-head">
    <h4>{item.title}</h4>
    <span className="hist-date">📅 {item.date}</span>
  </div>

  <p className="hist-meta">
    Class: {item.className} · Subject: {item.subject}
  </p>

  {item.desc && <p className="hist-desc">{item.desc}</p>}

  <div className="hist-images">
    {item.images.slice(0, 3).map((img, i) => (
      <img key={i} src={img} alt="" />
    ))}

    {item.images.length > 3 && (
      <span className="more">+{item.images.length - 3} more</span>
    )}
  </div>
</li>

              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
