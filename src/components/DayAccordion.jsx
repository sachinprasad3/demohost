import React from "react";
import TopicAccordion from "./TopicAccordion";
import Accordion from "../components/Accordion"; // adjust path

export default function DayAccordion({ day,syllabusThemeName  }) {
const formatDate = (dateStr) => {
  if (!dateStr) return "-";

  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
  const isDayCompleted =
    day.activities.length > 0 &&
    day.activities.every(a => a.completionStatus === "COMPLETED");

  const dayStatus = isDayCompleted ? "COMPLETED" : "PENDING";

  return (
    <Accordion
      title={`Day ${day.dayNumber} - ${formatDate(day.planDate)}`}
      subhead={
        <span
          className={`badge ${
            dayStatus === "COMPLETED" ? "bg-success" : "bg-warning"
          }`}
        >
          {dayStatus}
        </span>
      }
      defaultOpen={false}
    >
      <TopicAccordion
        topic={{
          dayNumber: day.dayNumber,
          activities: day.activities,
          syllabusThemeName,
        }}
      />
    </Accordion>
  );
}
