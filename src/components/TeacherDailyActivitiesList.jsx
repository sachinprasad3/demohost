import React, { useEffect, useState } from "react";
import axiosInstance from "../utills/axiosInstance";

export default function TeacherDailyActivitiesList() {
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get(
          "/api/v1/daily-activities/teacher"
        );

        setActivities(res.data?.data || null);
        
      } catch (err) {
        console.error("Teacher activities error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
        <p>Loading activities...</p>
      </div>
    );
  }

  if (!activities?.topics?.length) {
    return (
      <div className="text-center mt-5 text-muted">
        No activities assigned yet
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-4">My Daily Activities</h3>

      <div className="accordion-wrapper">
        {activities.topics.map(topic => (
          <div key={topic.topicId} className="topic-wrapper">

            <h5 className="mb-3">{topic.topicName}</h5>

            {topic.weeks.map(week => (
              <div key={week.weekNumber} className="week-accordion">

                <div className="week-header">
                  <strong>Week {week.weekNumber}</strong>
                </div>

                {week.days.map(day => (
                  <TopicAccordion
                    key={day.dayNumber}
                    topic={day}
                  />
                ))}
              </div>
            ))}

          </div>
        ))}
      </div>
    </div>
  );
}
