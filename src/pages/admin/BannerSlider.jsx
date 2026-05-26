import React, { useState, useRef, useEffect } from "react";
import { Pause, Pencil, Play, Trash2, Upload, X } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useNotification } from "../../context/NotificationContext";
import { deleteBannerById, getAllBanners, getBannerById, saveBanner } from "../../services/banner.service";
import { useLoader } from "../../context/LoaderContext";
import { useVideoControls } from "../../hooks/useVideoControls";
import Popup from "../../components/Popup";

export default function BannerSlider() {

  const [preview, setPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const swiperRef = useRef(null);
  const formRef = useRef(null);
  const titleInputRef = useRef(null);
  const { showNotification } = useNotification();
  const [banners, setBanners] = useState([]);
  const fileInputRef = useRef(null);
  const { showLoader, hideLoader } = useLoader();
  const [allBanners, setAllBanners] = useState([]);
  const { toggleVideo, onPlay, onPause, onEnded, } = useVideoControls(swiperRef);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedBannerId, setSelectedBannerId] = useState(null);



  const [formData, setFormData] = useState({
    id: null,
    title: "",
    discription: "",
    status: "Active",

    fileName: null,
    filePath: null,
    fileType: null,
    mediaType: null,

    media: null,
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const MAX_FILE_SIZE = 100 * 1024 * 1024;

 



  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      showNotification({
        message: "Only image or video files are allowed",
        type: "error",
      });
      e.target.value = "";
      return;
    }

    // max size check (100MB)
    if (file.size > MAX_FILE_SIZE) {
      showNotification({
        message: "Media size must be less than 100 MB",
        type: "error",
      });
      e.target.value = "";
      return;
    }

     if (preview) {
    URL.revokeObjectURL(preview);
  }
    setFormData((prev) => ({
      ...prev,
      media: file,
      fileName: file.name,
      filePath: null,
      fileType: file.type,
      mediaType: isVideo ? "VIDEO" : "IMAGE",
    }));

    setPreview(URL.createObjectURL(file));
     e.target.value = "";
  };


  const resetForm = () => {
    setFormData({
      id: null,
      title: "",
      discription: "",
      media: null,
      mediaUrl: "",
      type: "image",
      status: "Active",
      removeMedia: false,
    });

    setPreview(null);
    setIsEditing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };



 
  const saveBannerToServer = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      showNotification({ message: "Title is required", type: "error" });
      return;
    }

    try {
      showLoader(isEditing ? "Updating banner..." : "Saving banner...");

      const payload = {
        id: formData.id || 0,
        title: formData.title,
        discription: formData.discription,
        status: formData.status,

        fileName: formData.fileName,
        filePath: formData.filePath,
        fileType: formData.fileType,
        mediaType: formData.mediaType,
      };

      if (formData.media) {
        payload.media = formData.media;
      }

      await saveBanner(payload);
      await fetchBanners();
      showNotification({
        message: isEditing
          ? "Banner updated successfully!"
          : "Banner saved successfully!",
        type: "success",
      });

      resetForm();

    }
    catch (err) {
      showNotification({ message: "Operation failed", type: "error" });
    }
    finally {
      hideLoader();
    }
  };

  const fetchBanners = async () => {
    try {
      showLoader("Loading banners...");

      const data = await getAllBanners();

      const normalized = data.map(item => ({
        id: item.id,
        title: item.title,
        discription: item.discription,
        status: item.status,

        fileName: item.fileName,
        filePath: item.filePath,
        fileType: item.fileType,
        mediaType: item.mediaType,

        mediaUrl: item.filePath,
      }));

      setAllBanners(normalized);

      setBanners(normalized.filter(b => b.status === "Active"));

    } catch (err) {
      showNotification({
        message: "Failed to load banners",
        type: "error",
      });
    } finally {
      hideLoader();
    }
  };


  useEffect(() => {
    fetchBanners();
  }, []);



  const handleToggleStatus = async (banner) => {
    const newStatus = banner.status === "Active" ? "Inactive" : "Active";

    try {
      showLoader("Updating status...");

      await saveBanner({
        id: banner.id,
        title: banner.title,
        discription: banner.discription,
        status: newStatus,
        fileName: banner.fileName,
        filePath: banner.mediaUrl,
        fileType: banner.fileType,
        mediaType: banner.mediaType,
      });

      setAllBanners((prev) =>
        prev.map((b) =>
          b.id === banner.id ? { ...b, status: newStatus } : b
        )
      );

      setBanners((prev) => {
        if (newStatus === "Active") {
          return [...prev, { ...banner, status: "Active" }];
        }
        return prev.filter((b) => b.id !== banner.id);
      });

      showNotification({
        message: "Status updated successfully",
        type: "success",
      });
    } finally {
      hideLoader();
    }
  };

  const handleEdit = async (banner) => {
    try {
      showLoader("Loading banner...");
      const data = await getBannerById(banner.id);

      setFormData({
        id: data.id,
        title: data.title,
        discription: data.discription,
        status: data.status,

        fileName: data.fileName,
        filePath: data.filePath,
        fileType: data.fileType,
        mediaType: data.mediaType,

        media: null,
      });

      setPreview(data.filePath);
      setIsEditing(true);
      fileInputRef.current.value = "";

      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);

      titleInputRef.current?.focus();

    } finally {
      hideLoader();
    }
  };

  const confirmDeleteBanner = async () => {
    if (!selectedBannerId) return;

    try {
      showLoader("Deleting banner...");
      await deleteBannerById(selectedBannerId);

      setAllBanners(prev => prev.filter(b => b.id !== selectedBannerId));
      setBanners(prev => prev.filter(b => b.id !== selectedBannerId));

      showNotification({
        message: "Banner deleted successfully",
        type: "success",
      });
    } catch (err) {
      showNotification({
        message: "Failed to delete banner",
        type: "error",
      });
    } finally {
      hideLoader();
      setShowDeletePopup(false);
      setSelectedBannerId(null);
    }
  };

  const closeDeletePopup = () => {
    setShowDeletePopup(false);
    setSelectedBannerId(null);
  };

  const removeSelectedMedia = () => {
    setFormData((prev) => ({
      ...prev,
      media: null,
      fileName: null,
      filePath: null,
      fileType: null,
      mediaType: null,
      removeMedia: true,
    }));
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  return (
    <div className="mainpro">
      <div className="container" ref={formRef}>
        {/* {isSaving && <Loader text="Saving banner..." type="full" />} */}
        <h3>{isEditing ? "Edit Banner" : "Add New Banner"}</h3>
        <div className="bannersec">
          <div className="bannerform whitebox">
            <form onSubmit={saveBannerToServer}>
              <ul>
                <li>
                  <div className="form-group">
                    <label>Title</label>
                    <input ref={titleInputRef} type="text" className="form-control" name="title" placeholder="Banner Title" value={formData.title} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>discription</label>
                    <textarea name="discription" className="form-control" placeholder="Banner Description" value={formData.discription} onChange={handleChange} />
                  </div>
                </li>
                <li>
                  <div className="form-group">
                    <div className="preview-mainbox">
                      <div className="uploadbox">
                        <label>Upload Image/Video</label>
                       <div className="input-with-icon" onClick={() => fileInputRef.current.click()}>
    <Upload size={18} className="upload-icon" />
    
    <input
      type="text"
      className="form-control"
      value={formData.fileName || "Choose Image or Video..."}
      readOnly
    />

    <input
      ref={fileInputRef}
      type="file"
      hidden
      accept="image/*,video/*"
      onChange={handleFileChange}
    />
  </div>
                        {/* <input ref={fileInputRef} type="file" className="form-control" accept="image/*,video/*" onChange={handleFileChange} /> */}
                        {/* {isEditing && formData.fileName && (
                          <small className="media-path" title={formData.fileName}>
                            file: {formData.fileName}
                          </small>
                        )} */}
                      </div>

                      {preview && (
                        <div className="preview-box" style={{ position: "relative" }}>
                          <button
                            type="button"
                            className="deletebtn"
                            onClick={removeSelectedMedia}
                          >
                            <X size={16} />
                          </button>

                          {formData.mediaType === "VIDEO" ? (
                            <video src={preview} controls muted playsInline />
                          ) : (
                            <img src={preview} alt="preview" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" className="form-control" value={formData.status} onChange={handleChange} >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="form-group">

                    <button type="submit" className="btn btn-secondary">
                      {isEditing ? "Update Banner" : "Save Banner"}
                    </button>

                  </div>
                </li>

              </ul>
            </form>
          </div>

          <div className="bannerslider whitebox">
            {/* <div style={{ marginBottom: "10px" }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (!swiperRef.current) return;

                  if (swiperRef.current.autoplay.running) {
                    swiperRef.current.autoplay.stop();
                    setIsAutoplay(false);
                  } else {
                    swiperRef.current.autoplay.start();
                    setIsAutoplay(true);
                  }
                }}
              >
                {isAutoplay ? "Pause Autoplay" : "Start Autoplay"}
              </button>
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
        </div>



        {/* 🔹 Banner List */}
        <div className="table-box listsec syllabus-master">
          <div className="listbox studentlist theading">
            <div>Sl.</div>
            <div className="img-width">Preview</div>
            <div>Title</div>
            <div>Description</div>
            <div width="120">Status/Action</div>
          </div>
          <ul>
            {allBanners.length === 0 ? (
              <div align="center">
                No banners added
              </div>
            ) : (
              allBanners.map((banner, index) => (
                <li key={banner.id}>
                  <div className="listbox studentlist">
                    <div>{index + 1}</div>

                    <div data-head="Preview" className="scheckbox img-width">
                      <label><div className="simg">
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
                          <img src={banner.mediaUrl} alt={banner.title} className="slider-media" />
                        )}
                      </div>
                      </label>
                    </div>

                    <div data-head="Title">{banner.title}</div>
                    <div data-head="Description">{banner.discription}</div>
                    <div className="actionbtns">
                      <div
                        className={`defaultbtn ${banner.status === "Active" ? "on" : "off"}`}
                        onClick={() => handleToggleStatus(banner)}
                      >
                        <div className="toggle-circle">
                          {banner.status === "Active" ? "✓" : "✕"}
                        </div>
                      </div>
                      <button className="editbtn" onClick={() => handleEdit(banner)}>
                        <Pencil size={16} />
                      </button>
                      <button
                        className="crossbtn"
                        onClick={() => {
                          setSelectedBannerId(banner.id);
                          setShowDeletePopup(true);
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
        {showDeletePopup && (
          <Popup
            closeOnOutsideClick={false}
            title="Delete Banner"
            onClose={closeDeletePopup}
            onSave={confirmDeleteBanner}
            saveText="Delete"
            submitClass="dangerBtn"
          >
            <p>Are you sure you want to delete this banner?</p>
          </Popup>
        )}
      </div>

    </div>
  );
}