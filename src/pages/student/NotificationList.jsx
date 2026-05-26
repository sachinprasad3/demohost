import { useNavigate } from "react-router-dom";

const NotificationList = () => {
  const navigate = useNavigate();
  const notifications = [
    {
      id: 110,
      title: "Title for notification",
      subject: "Subject for the notification",
      message: "Message for the notification",
    },
    {
      id: 2,
      title: "Title for notification",
      subject: "Subject for the notification",
      message: "Message for the notification",
    },
  ];

  const handleView = (notification) => {
    const kababCase = notification.title.split(" ").join("-");
    navigate(
      `/student/notifications/${kababCase}?notificationId=${notification.id}`,
    );
  };

  return (
    <div className="mainpro">
      <div className="container">
        <div className="listsec">
          <div className="listbox sendinglist theading">
            <div>S.No</div>
            <div>Title</div>
            <div>Subject</div>
            <div>Message</div>
            <div>Action</div>
          </div>
          <ul>
            {notifications.map((notifi, index) => (
              <li key={notifi.id}>
                <div class="listbox sendinglist">
                  <div>{index + 1} </div>
                  <div data-head="Title">{notifi.title}</div>
                  <div data-head="Subject">{notifi.subject}</div>
                  <div data-head="Message" className="classname">
                    {notifi.message}
                  </div>
                  <div>
                    <button
                      onClick={() => handleView(notifi)}
                      className="viewbtn"
                    >
                      View
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationList;
