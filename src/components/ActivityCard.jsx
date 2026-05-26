import React from "react";

const ActivityCard = React.memo(({ activity }) => {
    const show = v => v !== null && v !== undefined && v !== "";

    return (
        <div className="activity-card">
            <div className="activity-header">
                <h5>{activity.activityTitle}</h5>
                {show(activity.activityType) && (
                    <span className="badge">{activity.activityType}</span>
                )}
            </div>

            {show(activity.activityDetails) && (
                <p className="activity-desc">{activity.activityDetails}</p>
            )}

            <ul className="activity-info">
                {[
                    { label: "Teacher", value: activity.teacherFullName },
                    { label: "Subject", value: activity.subjectName },
                    { label: "Text Book", value: activity.textBookName },
                    { label: "Class", value: activity.className },
                    { label: "Section", value: activity.sectionName },

                    { label: "Start Time", value: activity.startTime },
                    { label: "End Time", value: activity.endTime },
                    { label: "Duration", value: activity.durationInMins && `${activity.durationInMins} mins` },

                    { label: "Materials Required", value: activity.materialsRequired },
                    { label: "Reference Materials", value: activity.referenceMaterials },
                    { label: "Reference Pages", value: activity.referencePages },

                    { label: "Session Theme", value: activity.sessionPlanOverallTheme },
                    { label: "Sequence Order", value: activity.sequenceOrder },

                    {
                        label: "Visible to Parents",
                        value: activity.visibleToParents === "Y" ? "Yes" : activity.visibleToParents === "N" ? "No" : null
                    },

                    { label: "Visible Till", value: activity.visibleTill },

                    {
                        label: "Completed",
                        value: activity.completionDate ? "Yes" : null
                    }
                ]
                    .filter(item => show(item.value))
                    .map((item, index) => (
                        <li key={index}>
                            <strong>{item.label}:</strong> {item.value}
                        </li>
                    ))}
            </ul>

        </div>
    );
});

export default ActivityCard;
