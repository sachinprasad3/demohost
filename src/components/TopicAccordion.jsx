import React, { useState, useEffect } from "react";
import { Book, Clock, Package,Palette , FileText, Bookmark, Users, Eye, ListOrdered, CalendarCheck, AlignLeft } from "lucide-react";

export default function TopicAccordion({ topic }) {

  const syllabusTheme = topic?.syllabusThemeName || "-";

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";


  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
  const grouped = Object.values(
    topic.activities.reduce((acc, act) => {
      const key = `${act.subjectId}-${act.topicId}`;

      if (!acc[key]) {
        acc[key] = {
          subjectName: act.subjectName,
          topicName: act.topicName,
          activities: [],
        };
      }

      acc[key].activities.push(act);
      return acc;
    }, {})
  );

  return (
    <>

          {grouped.map((group, idx) => (
            <div key={idx} className="activity-space">

              <div className="activity-head">
                <div>Subject : <span>{group.subjectName}</span></div>
                <div>Topic : <span>{group.topicName}</span></div>
              </div>

              {group.activities.map(act => (
                <div key={act.activityId} className="activity-card">

                  <h5> <strong>{act.activityTitle}</strong> <span className="textmuted"> ({act.activityType})</span> </h5>


              <ul className="activity-details-list topics">
                {act.topicThemeName && (<li><strong><Palette size={14} /> Topic Theme</strong> {act.topicThemeName}</li>)}
               {syllabusTheme && syllabusTheme !== "-" && (
                  <li>
                    <strong><Palette size={14} /> Theme</strong>{" "}
                    {syllabusTheme}
                  </li>
                )}
                <li><strong><Book size={14} /> Textbook</strong> {act.textBookName}</li>

                    <li className="fullsec"><strong><Clock size={14} /> Duration</strong> {/* {act.startTime} - {act.endTime} */} {act.durationInMins}mins</li>

                    <div className="borderdiv"></div>
                    {act.materialsRequired && (<li><strong><Package size={14} /> Materials</strong> {act.materialsRequired || "-"}</li>)}
                    {act.referencePages && (<li><strong><FileText size={14} /> Pages</strong> {act.referencePages || "-"}</li>)}
                    {act.referenceMaterials && (<li><strong><Bookmark size={14} /> References</strong> {act.referenceMaterials || "-"}</li>)}

                    <li>
                      <strong><Users size={14} /> Parent View</strong>{" "}
                      {act.visibleToParents === "Y" ? "Yes" : "No"}
                    </li>
                    <div className="borderdiv"></div>

                    {act.visibleTill && (<li><strong><Eye size={14} /> Visible Till</strong> {formatDate(act.visibleTill)}{" "}</li>)}
                    {act.sequenceOrder && (<li><strong><ListOrdered size={14} /> Sequence</strong> {act.sequenceOrder}</li>)}
                    <div className="borderdiv"></div>
                    {act.completionDate && (<li><strong><CalendarCheck size={14} /> Completed On</strong> {formatDate(act.completionDate)}{" "} at {act.completionTime || "-"} </li>)}



                  </ul>
                   {act.activityDetails && (<div className="textmuted"> <strong><AlignLeft size={14} /> Description :</strong> {act.activityDetails || "-"} </div>)}
                  <div
                        className={`view-status badge ${act.completionStatus === "COMPLETED"
                            ? "bg-success"
                            : "bg-warning"
                          }`}
                      >
                        {act.completionStatus}
                      </div>
                 

                </div>
              ))}

            </div>
          ))}

        </>
  );
}
