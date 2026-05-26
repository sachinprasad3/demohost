import { useEffect, useState } from "react";
import { useKeyPairSelector } from "../../context/KeyPairSelectorContext";
import {
  uploadNotificationImage,
  useGetTemplateByCodeName,
  useGetTemplates,
  useSendReminder,
} from "../../services/sendNotification.services";
import MessageEditor from "../../components/MessageEditor";
import { useLocation, useNavigate } from "react-router-dom";
import * as yup from "yup";
import useValidateFields from "../../hooks/useValidateFields";
import Select from "../../components/AmissionFormComponents/customField/Select";
import { useNotification } from "../../context/NotificationContext";
import { useLoader } from "../../context/LoaderContext";

const messageSchema = yup.object({
  title: yup.string().required("Title is required"),
  message: yup.string().required("Message is required"),
});

const base64ToFile = (base64, fileName) => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], fileName, { type: mime });
};

const processImagesBeforeSend = async (htmlContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  const images = Array.from(doc.querySelectorAll("img")).filter((img) =>
    img.src.startsWith("data:"),
  );

  const uploadPromises = images.map(async (img) => {
    const fileName = img.getAttribute("data-filename") || "image.png";
    const file = base64ToFile(img.src, fileName);
    const uploadedUrl = await uploadNotificationImage(file);

    return { img, uploadedUrl };
  });

  const results = await Promise.all(uploadPromises);

  results.forEach(({ img, uploadedUrl }) => {
    img.src = uploadedUrl;
    img.removeAttribute("data-filename");
    img.removeAttribute("data-temp-id");
  });

  return doc.body.innerHTML;
};

export default function SendNotification() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location?.state;
  const { showLoader, hideLoader } = useLoader();
  const {
    selectedData: studentsData,
    size,
    isAllSelectActive,
    unSelectedData,
  } = useKeyPairSelector();

  const [selectedTempCode, setSelectedTempCode] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [broadcastMedium, setBroadcastMedium] = useState("");
  const [message, setMessage] = useState("");

  // NEW STATES
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customTitle, setCustomTitle] = useState("");

  const { errors, validate } = useValidateFields();
  const sendNotificationMutate = useSendReminder();
  const { showNotification } = useNotification();

  const { data } = useGetTemplates();
  const { data: template } = useGetTemplateByCodeName(selectedTempCode);

  useEffect(() => {
    if (sendNotificationMutate.isPending) {
      showLoader("Sending notification...");
    } else {
      hideLoader();
    }
  }, [sendNotificationMutate.isPending]);

  useEffect(() => {
    if (template && !isOtherSelected) {
      setMessage(template?.templateBody);
    }
  }, [template, isOtherSelected]);

  const handleValidate = async ({ title, msg }) => {
    return await validate({
      initialValue: {
        title,
        message: msg,
      },
      validateSchema: messageSchema,
    });
  };

  const handleTemplateSelect = (e) => {
    const value = e.target.value;

    if (value === "OTHER") {
      setIsOtherSelected(true);
      setSelectedTempCode("");
      setSelectedTitle("");
      setCustomTitle("");
      setMessage("");
    } else {
      const title = e.target.selectedOptions[0].getAttribute("data-title");
      setIsOtherSelected(false);
      setSelectedTempCode(value);
      setSelectedTitle(title);
      setCustomTitle("");
    }
  };

  const sendSelectedReminders = async () => {
    if (!size) {
      showNotification({
        message: "Please select at least one student",
        type: "info",
        duration: 2000,
      });
      return;
    }

    if (!message?.trim()) {
      showNotification({
        message: "Please enter a message",
        type: "info",
        duration: 2000,
      });
      return;
    }

    const finalTitle = isOtherSelected ? customTitle : selectedTitle;

    const { isError } = await handleValidate({
      title: finalTitle,
      msg: message,
    });

    if (isError) return;

    try {
      showLoader("Processing message...");
      const processedMessage = await processImagesBeforeSend(message);

      sendNotificationMutate.mutate(
        {
          selectedData: studentsData,
          isAllSelectActive,
          unSelectedData,
          filter: state,
          title: finalTitle,
          message: processedMessage,
          medium: broadcastMedium,
        },
        {
          onSuccess: () => {
            showNotification({
              message: `Reminder sent to ${size} students`,
              type: "success",
              duration: 2000,
            });
            navigate("/admin/students");
          },
          onError: () => {
            showNotification({
              message: "Failed to send reminder. Please try again.",
              type: "error",
              duration: 2000,
            });
          },
        },
      );
    } catch (err) {
      hideLoader();
      showNotification({
        message:
          "An error occurred while sending notification. Please try again.",
        type: "error",
        duration: 2000,
      });
    }
  };

  return (
    <div className="mainpro">
      <div className="container">
        <div className="whitebox">
          <div className="sendbox">
            <h4>Send Notification</h4>
            <ul>
              <li className="fullwidth">
                <Select
                  label={"Select Broadcast Medium"}
                  value={broadcastMedium}
                  required
                  placeholder="Select medium"
                  options={[
                    { label: "Whats App", value: "Whatsapp" },
                    { label: "App Notification", value: "Appnotification" },
                  ]}
                  onChange={(e) => {
                    setBroadcastMedium(e.target.value);
                    setMessage("");
                    setSelectedTempCode("");
                    setSelectedTitle("");
                    setIsOtherSelected(false);
                    setCustomTitle("");
                  }}
                />

                {broadcastMedium === "Appnotification" && (
                  <div className="form-group">
                    <label className="form-label">Select Template</label>
                    <select
                      className={`form-control ${
                        errors?.title ? "is-invalid" : ""
                      }`}
                      value={isOtherSelected ? "OTHER" : selectedTempCode}
                      onChange={handleTemplateSelect}
                    >
                      <option value="">Select Template</option>
                      {data?.map((template) => (
                        <option
                          key={template.template_code}
                          value={template.template_code}
                          data-title={`${template.template_name} - ${template.template_subject}`}
                        >
                          {template.template_name} - {template.template_subject}
                        </option>
                      ))}
                      <option value="OTHER">Other</option>
                    </select>

                    {errors?.title && !isOtherSelected && (
                      <div className="invalid-feedback d-block">
                        {errors?.title}
                      </div>
                    )}

                    {/* OTHER TITLE INPUT */}
                    {isOtherSelected && (
                      <div className="form-group mt-2">
                        <label className="form-label">Enter Title</label>
                        <input
                          type="text"
                          className={`form-control ${
                            errors?.title ? "is-invalid" : ""
                          }`}
                          value={customTitle}
                          onChange={(e) => {
                            setCustomTitle(e.target.value);
                            handleValidate({
                              title: e.target.value,
                              msg: message,
                            });
                          }}
                          placeholder="Enter title"
                        />
                        {errors?.title && (
                          <div className="invalid-feedback d-block">
                            {errors?.title}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </li>

              <li className="fullwidth">
                <div className="form-group">
                  <MessageEditor
                    value={message}
                    onChange={(value) => {
                      setMessage(value);
                      handleValidate({
                        title: isOtherSelected ? customTitle : selectedTitle,
                        msg: value,
                      });
                    }}
                  />
                </div>
              </li>
            </ul>
          </div>

          <button
            disabled={sendNotificationMutate.isPending}
            className="btn btn-primary"
            onClick={sendSelectedReminders}
          >
            Send Message
          </button>
        </div>

        {isAllSelectActive ? (
          <div>
            <p>Total selected students: {size}</p>
          </div>
        ) : (
          <div className="listsec">
            <div className="listbox sendinglist theading">
              <div>S.No</div>
              <div>Roll</div>
              <div>Name</div>
              <div>Class</div>
              <div>Contact</div>
            </div>
            <ul>
              {studentsData.map((st, index) => (
                <li key={st.studentId}>
                  <div className="listbox sendinglist">
                    <div>{index + 1}</div>
                    <div>{st.rollNumber}</div>
                    <div>{st.studentName}</div>
                    <div className="classname">{st.className}</div>
                    <div>{st.primaryContactPhone || "---"}</div>
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
