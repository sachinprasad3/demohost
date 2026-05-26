import { useEffect, useState } from "react";
import axiosInstance from "../utills/axiosInstance";

export default function useEvents(autoFetch = true) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ================= FETCH EVENTS ================= */

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosInstance.get("/api/events");
      setEvents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch events", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= AUTO LOAD ================= */

  useEffect(() => {
    if (autoFetch) {
      fetchEvents();
    }
  }, [autoFetch]);

  /* ================= RETURN ================= */

  return {
    events,
    loading,
    error,
    refetchEvents: fetchEvents,
  };
}
