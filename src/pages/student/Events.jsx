import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import useEvents from "../../hooks/useEvents";

const Events = () => {
  const { events, loading, error } = useEvents();
  const [selectedDate, setSelectedDate] = useState(new Date());


  const formatTime = (time) => {
    if (!time) return "";
    return time;
  };

  const formatLocalDate = (date) =>
    date.toLocaleDateString("en-CA");

  /* ================= DATE HELPERS ================= */

  const expandEventDates = (start, end) => {
    const dates = [];
    let current = new Date(start + "T00:00:00");

    while (current <= new Date(end + "T00:00:00")) {
      dates.push(formatLocalDate(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  /* ================= CALENDAR HIGHLIGHTS ================= */

  const eventDates = events.flatMap((e) =>
    expandEventDates(e.startDate, e.endDate)
  );

  /* ================= GROUP EVENTS ================= */

  const groupedEvents = events.reduce((acc, event) => {
    const start = new Date(event.startDate + "T00:00");
    const end = new Date(event.endDate + "T00:00");

    let d = new Date(start);

    while (d <= end) {
      const y = d.getFullYear();
      const m = d.toLocaleString("default", { month: "long" });
      const dateStr = formatLocalDate(d);

      if (!acc[y]) acc[y] = {};
      if (!acc[y][m]) acc[y][m] = {};
      if (!acc[y][m][dateStr]) acc[y][m][dateStr] = [];

      acc[y][m][dateStr].push(event);

      d.setDate(d.getDate() + 1);
    }

    return acc;
  }, {});

  const selectedYear = selectedDate.getFullYear();
  const yearEvents = groupedEvents[selectedYear] || {};

  /* ================= UI ================= */

  if (loading) return <p className="text-center">Loading events...</p>;
  if (error) return <p className="text-center text-danger">Failed to load events</p>;

  return (
    <div className="mainpro">
      <div className="container">

        {/* CALENDAR */}
        <div className="event-calendar">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={({ date }) =>
              eventDates.includes(formatLocalDate(date)) ? "event-day" : ""
            }
          />
        </div>

        {/* EVENTS LIST */}
        <div className="mt-8">
          <h3>All Upcoming Events ({selectedYear})</h3>

          {Object.keys(yearEvents).length === 0 ? (
            <p className="text-gray-400 text-sm text-center">
              No events available for {selectedYear}
            </p>
          ) : (
            Object.keys(yearEvents)
              .sort(
                (a, b) =>
                  new Date(`${a} 1, ${selectedYear}`) -
                  new Date(`${b} 1, ${selectedYear}`)
              )
              .map((month) => (
                <div key={month} className="mb-2 teaching-activity commonevent-list">
                  <h5 className="mb-1">
                    {month}
                  </h5>

                  {/* <ul className="class-row up-events">
                    {Object.keys(yearEvents[month])
                      .sort((a, b) => new Date(a) - new Date(b))
                      .map((date) => (
                        <li key={date} className={`status-box senior-kg event-box ${yearEvents[month][date][0]?.type || "event"} `}>
                          <div className="teacher-info">

                            <div className="date-badge blue">
                              <span>
                                {new Date(date).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                })}
                              </span>
                              <small>
                                {new Date(date).toLocaleDateString("en-GB", {
                                  month: "short",
                                })}
                              </small>
                            </div>

                            {yearEvents[month][date].map((event, i) => (
                              <div key={i} className={`info ${event.color || ""}`} >
                                <p className="teacher-name">{event.title}</p>

                                {event.location && (
                                  <p className="teacher-class">{event.location}</p>
                                )}

                                {(event.startTime || event.endTime) && (
                                  <p className="teacher-class">
                                    {event.startTime && formatTime(event.startTime)}
                                    {event.startTime && event.endTime && " → "}
                                    {event.endTime && formatTime(event.endTime)}
                                  </p>
                                )}

                              </div>
                            ))}
                          </div>
                        </li>
                      ))}
                  </ul> */}

                  <ul className="class-row up-events">
                    {Object.keys(yearEvents[month])
                      .sort((a, b) => new Date(a) - new Date(b))
                      .reduce((acc, date, i, arr) => {
                        const eventsToday = yearEvents[month][date];
                        const prevDate = arr[i - 1];

                        if (
                          prevDate &&
                          new Date(date) - new Date(prevDate) === 86400000 && // 1 day difference
                          yearEvents[month][prevDate][0]?.title === eventsToday[0]?.title
                        ) {
                          // extend previous range
                          acc[acc.length - 1].end = date;
                        } else {
                          acc.push({
                            start: date,
                            end: date,
                            event: eventsToday[0],
                          });
                        }

                        return acc;
                      }, [])
                      .map((range, i) => {
                        const startDay = new Date(range.start).toLocaleDateString("en-GB", {
                          day: "2-digit",
                        });

                        const endDay = new Date(range.end).toLocaleDateString("en-GB", {
                          day: "2-digit",
                        });

                        return (
                          <li
                            key={i}
                            className={`status-box senior-kg event-box ${range.event.type || "event"
                              }`}
                          >
                            <div className="teacher-info">

                              <div className="date-badge blue">
                                <span>
                                  {startDay === endDay ? startDay : `${startDay}-${endDay}`}
                                </span>
                                <small>
                                  {new Date(range.start).toLocaleDateString("en-GB", {
                                    month: "short",
                                  })}
                                </small>
                              </div>

                              <div className={`info ${range.event.color || ""}`}>
                                <p className="teacher-name">{range.event.title}</p>

                                {range.event.location && (
                                  <p className="teacher-class">{range.event.location}</p>
                                )}

                                {(range.event.startTime || range.event.endTime) && (
                                  <p className="teacher-class">
                                    {range.event.startTime && formatTime(range.event.startTime)}
                                    {range.event.startTime && range.event.endTime && " → "}
                                    {range.event.endTime && formatTime(range.event.endTime)}
                                  </p>
                                )}
                              </div>

                            </div>
                          </li>
                        );
                      })}
                  </ul>

                </div>
              ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Events;
