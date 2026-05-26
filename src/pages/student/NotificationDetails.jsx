import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import { useGetNotificationById } from "../../services/sendNotification.services";
import { dateFormaterWithTime } from "../../utils";

export default function NotificationDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const notifiId = searchParams.get("notificationId");

  const { data, isLoading } = useGetNotificationById(notifiId);

  // fallback if opened directly
  const notification = data && {
    title: data.notificationTitle,
    message: data.notificationMessage,
    type: data.notificationType,
    date: data.createdAt || data.sentDate, // choose what you want to show
  };

  return (
    <div className="container">
      {/* HEADER */}
      {/* <div className="nd-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h3>Notification</h3>
      </div> */}

      {/* CONTENT */}
      {isLoading && <span>Loading...</span>}
      {notification && (
        <div className="nd-card">
          <div className="nd-icon">
            <Bell size={26} />
          </div>

          <div className="nd-content">
            <h4 className="nd-title">{notification.title}</h4>

            <p className="nd-date">{dateFormaterWithTime(notification.date)}</p>

            <div
              className="nd-message"
              dangerouslySetInnerHTML={{ __html: notification.message }}
            />

            {/* {notification.type && (
              <span className={`nd-tag ${notification.type.toLowerCase()}`}>
                {notification.type}
              </span>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
}
