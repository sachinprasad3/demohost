import { useState } from "react";
import MessageEditor from "../components/MessageEditor";
import {
  useGetTemplateByCodeName,
  useGetTemplates,
} from "../services/sendNotification.services";

export default function SendMessage() {
  const [selectedTempCode, setSelectedTempCode] = useState("");

  const { data } = useGetTemplates();

  const { data: template, isLoading: isTemplateLoading } =
    useGetTemplateByCodeName(selectedTempCode);

  const handleTemplateSelect = (e) => {
    setSelectedTempCode(e.target.value);
  };

  return (
    <div className="sendbox">
      <h4>Send WhatsApp Fee Message</h4>

      <select
        className="selectbox"
        value={selectedTempCode}
        onChange={handleTemplateSelect}
      >
        <option value="">Select Template</option>
        {data?.map((template) => (
          <option key={template.template_code} value={template.template_code}>
            {template.template_name} - {template.template_subject}
          </option>
        ))}
      </select>

      {/* Editor that shows & edits the template */}
      <MessageEditor value={template?.templateBody} onChange={setMessage} />
    </div>
  );
}
