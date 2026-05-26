import React, { useState, useRef, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../../context/StudentContext";
import { getImageUrl, getInitials } from "../../utills/constants";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { getAllBanners } from "../../services/banner.service";
import { Pause, Play } from "lucide-react";
import { useVideoControls } from "../../hooks/useVideoControls";
import Loader from "../../components/Loader";


export default function StudentDashboard() {
  const navigate = useNavigate();
  const { candidates, activeStudent, switchStudent, loadingCandidates } = useStudent();
  // const { studentsData } = useAuth();
  const studentName = [
    activeStudent?.data?.studentFirstName,
    activeStudent?.data?.studentMiddleName,
    activeStudent?.data?.studentLastName,
  ]
    .filter(Boolean)
    .join(" ");

  const [showDropdown, setShowDropdown] = useState(false);
  const [banners, setBanners] = useState([]);
  const swiperRef = useRef(null);
  const { toggleVideo, onPlay, onPause, onEnded, } = useVideoControls(swiperRef);

  const startNewAdmission = () => {
    localStorage.removeItem("candidateId");
    navigate("/student/admission-form?mode=new");
  };


  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getAllBanners();

        const normalized = data
          .filter((b) => b.status === "Active")
          .map((item) => ({
            id: item.id,
            title: item.title,
            discription: item.discription,
            mediaUrl: item.filePath,
            mediaType: item.mediaType,
          }));

        setBanners(normalized);
      } catch (err) {
        console.error("Failed to load banners", err);
      }
    };

    fetchBanners();
  }, []);


  // const [activeStudent, setActiveStudent] = useState(student?.name || "Student");
  const hour = new Date().getHours();
  let greet = "";
  const user = JSON.parse(localStorage.getItem("user"));
  const displayName = user?.name || user?.firstName || "User";
  if (hour < 12) greet = "Good Morning";
  else if (hour < 18) greet = "Good Afternoon";
  else greet = "Good Evening";
  
  const profiles = [
    { name: displayName, image: "/images/profileimg/ravi.jpg" },
    { name: "Neha Sharma", image: "/images/profileimg/neha.jpg" },
  ];
  // console.log("activeStudent", activeStudent);

  const editAdmissionForm = () => {
    const candidateId = activeStudent?.candidateId;

    if(!candidateId) return
    localStorage.setItem("candidateId", candidateId)
    navigate("/student/admission-form?mode=edit")
  }






  const admittedStudentModules = [
    {
      title: "Profile",
      icon: "/images/icon/profile.png",
      path: "/student/profile",
    },
    {
      title: "Events",
      icon: "/images/icon/events.png",
      path: "/student/events",
    },
    { title: "Fees", icon: "/images/icon/fees.png", path: "/student/fees" },
    // { title: "Teachers", icon: "/images/icon/teacher.png", path: "#" },
    {
      title: "Attendance",
      icon: "/images/icon/roll-call.png",
      path: "/student/attendance",
    },
    {
      title: "Syllabus",
      icon: "/images/icon/syllabus.png",
      path: "/student/syllabus",
    },
    // {
    //   title: "Time Table",
    //   icon: "/images/icon/timetable.png",
    //  path: "#",
    // },
    {
      title: "Home Work",
      icon: "/images/icon/assignment.png",
      path: "/student/homework-list",
    },
    // { title: "Exam", icon: "/images/icon/exam.png", path: "#" },
    // { title: "Results", icon: "/images/icon/good-score.png", path: "#" },
    // { title: "Inbox", icon: "/images/icon/inbox.png", path: "#" },
    // { title: "Ask Doubt", icon: "/images/icon/doubt.png", path: "#" },
    // {
    //   title: "Apply for admission",
    //   icon: "/images/icon/profile.png",
    //   path: "/student/admission-form",
    // },
  ];
  const nonAdmittedStudentModules = [
 
    {
      title: "Complete Your admission Process",
      icon: activeStudent?.studentImage , 
      handler: editAdmissionForm
    },
  ];


  const handleCardClick = (mod) => {
  if (mod.handler) {
    mod.handler();
  } else if (mod.path) {
    navigate(mod.path);
  }
};


  // if (!activeStudent) {
  //   return <div>Loading student...</div>;
  // }

  let modules = [];

  if (activeStudent?.status === "ADMITTED") {
    modules = admittedStudentModules;
  } else {
    modules = nonAdmittedStudentModules;
  }

  // if (loadingCandidates) return <Loader text="Loading students" type="full"/>
  // console.log("loading candidates",loadingCandidates)
  const MAX_VISIBLE = 2;
  const visibleStudents = candidates.slice(0, MAX_VISIBLE);
  const extraStudents = candidates.slice(MAX_VISIBLE);
const isExtraStudentActive = extraStudents.some(
  (c) => c.candidateId === activeStudent?.candidateId
);

  const isInactive = activeStudent?.data.status === "INACTIVE"

  return (
    <div className="mainpro">
      {candidates.length !== 0 && (
        <div className="studentsbox">
          <div className="student-greet">
            <h4 className="fw-bold mb-0">
              Hi, {activeStudent?.data?.studentFirstName || "Student"}!
            </h4>
            <p>{greet}</p>
            {isInactive && <p className="mt-4">Please Contact to your principle</p>}
          </div>
          <div className="profile-pic ">
            {visibleStudents.map((c) => {
              const isActive = activeStudent?.candidateId === c.candidateId;
              // {candidates.map((c) => { const isActive = activeStudent?.candidateId === c.candidateId;
              return (
                <div className={`spic ${isActive ? "active" : ""}`} key={c.candidateId} onClick={() => switchStudent(c.candidateId, c?.studentId)}>
                  {c?.studentImage ? (
                    <img src={getImageUrl(c.studentImage)} alt="student" />
                  ) : (
                    <span>{getInitials(c?.studentName)}</span>
                  )}
                </div>
              );
            })}
            {extraStudents.length > 0 && (
              <div className={`plusadd ${isExtraStudentActive ? "active" : ""}`} onClick={() => setShowDropdown(!showDropdown)}>+{extraStudents.length}

                {showDropdown && (
                  <div className="student-dropdown">
                    {extraStudents.map((c) => (
                      <div className="withname" key={c.candidateId} onClick={() => {
                        switchStudent(c.candidateId, c?.studentId);
                        setShowDropdown(false);
                      }} >
                        <div className={`spic ${activeStudent?.candidateId === c.candidateId ? "active" : ""}`} >
                          {c?.studentImage ? (
                            <img src={getImageUrl(c.studentImage)} alt="student" />
                          ) : (
                            <span>{getInitials(c?.studentName)}</span>
                          )}
                        </div>
                        <small>{c.studentName}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="student-dashboard container ">
        {candidates.length > 0 ? (
          <>
            {banners.length > 0 &&  (<div className="bannerslider">
              {/* <div>
                {banners.length > 0 && (
                  <button
                    className="btn btn-secondary mb-2"
                    onClick={() => {
                      if (!swiperRef.current) return;
                      isAutoplay
                        ? swiperRef.current.autoplay.stop()
                        : swiperRef.current.autoplay.start();
                      setIsAutoplay(!isAutoplay);
                    }}
                  >
                    {isAutoplay ? "Pause" : "Play"}
                  </button>
                )}
              </div> */}

              
                <Swiper
                  modules={[Autoplay, Pagination, Navigation]}
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                  }}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                    waitForTransition: false,
                  }}
                  pagination={{ clickable: true }}
                  loop={banners.length > 1}
                  observer
                  observeParents
                  watchSlidesProgress
                  className="banner-swiper"
                >
                  {banners.map((banner) => (
                    <SwiperSlide key={banner.id}>
                      <div className="slider-wrapper">
                        {banner.mediaType === "VIDEO" ? (
                          <div className="video-wrapper" onClick={toggleVideo}>
                            <video
                              src={banner.mediaUrl}
                              className="slider-media"
                              muted
                              playsInline
                              preload="metadata"
                              onPlay={onPlay}
                              onPause={onPause}
                              onEnded={onEnded}
                            />

                            <div className="video-overlay">
                              <span className="play-icon">
                                <Play size={28} />
                              </span>
                              <span className="pause-icon">
                                <Pause size={28} />
                              </span>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={banner.mediaUrl}
                            alt={banner.title}
                            className="slider-media"
                          />
                        )}

                        <div className="slider-content">
                          <h3>{banner.title}</h3>
                          <p>{banner.discription}</p>
                        </div>

                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
            </div>
              )}
            {!isInactive && <div className="dashboard-grid">
              <ul>
                {modules.map((mod, i) => (
                  <li
                    key={i}
                    className={`fullsec ${modules === nonAdmittedStudentModules ? "nonadmited" : ""
                      }`}
                    onClick={() => handleCardClick(mod)}
                  >
                    <Card className="dashboard-card" style={{ cursor: mod.path ? "pointer" : "default" }} >
                      <Card.Body className="cardbody">
                        <div className="icon-wrapper mb-2">
                          <img src={getImageUrl(mod?.icon) || "/images/icon/profile.png"} alt={"studentImage"} className="dashboard-icon" style={{ objectFit: "contain" }} />
                        </div>
                        <p className="fw-semibold mb-0">{mod.title}</p>
                      </Card.Body>
                    </Card>
                  </li>
                ))}

              </ul>
            </div>}
          </>
        ) : (
          <div className="box">
            <h5 className="fw-semibold mb-2">Apply for Admission</h5>
            <p>
              You haven’t applied for any admission yet. Start by submitting
              your first application.
            </p>
            {/* <Button size="lg" className="saveBtn" onClick={startNewAdmission}>
              Apply Now
            </Button> */}
          </div>
        )}
      </div>
    </div>
  );
}
