import React, { useState, useRef, useEffect } from "react";
import Accordion from "./Accordion";
import {Play, Pause, Rewind,  FastForward,} from "lucide-react";

// ================= SAMPLE AUDIO DATA =================
const sampleAudioData = {
  "2026-01-05": [
    {
      id: 1,
      title: "English Lesson PDF",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      time: "10:30 AM",
    },
    {
      id: 2,
      title: "Homework Image OCR",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      time: "12:15 PM",
    },
  ],
  "2026-01-04": [
    {
      id: 3,
      title: "Math Notes",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      time: "09:00 AM",
    },
  ],
  "2026-01-03": [
    {
      id: 4,
      title: "English Lesson",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      time: "10:30 AM",
    },
  ],
};


const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}-${mm}-${yyyy}`;
};


export default function AudioDayList({
  data = {},
  title = "Audio List",
  showDate = true,
}) {
  const audioRef = useRef(null);

  const [playingId, setPlayingId] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioData =
    Object.keys(data).length > 0 ? data : sampleAudioData;

 
const playAudio = (audioUrl, id) => { 
  if (playingId === id && audioRef.current?.paused) {
    audioRef.current.play();
    return;
  }
 
  if (playingId === id && !audioRef.current?.paused) {
    audioRef.current.pause();
    return;
  }
 
  if (audioRef.current) {
    audioRef.current.pause();
  }

  const audio = new Audio(audioUrl);
  audioRef.current = audio;
  setPlayingId(id);

  audio.onloadedmetadata = () =>
    setDuration(audio.duration || 0);

  audio.ontimeupdate = () =>
    setCurrentTime(audio.currentTime || 0);

  audio.onended = () => {
    setPlayingId(null);
    setCurrentTime(0);
  };

  audio.play();
};
 
  const backward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      audioRef.current.currentTime - 5
    );
  };
 
  const forward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(
      duration,
      audioRef.current.currentTime + 5
    );
  };
 
  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };
 
  const formatTime = (sec) => {
    if (!sec && sec !== 0) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="audio-list-container">
      <h2>{title}</h2> 
      {Object.keys(audioData).map((date) => (
        <Accordion key={date} title={showDate ? formatDateDDMMYYYY(date) : ""} defaultOpen={false} >
          {audioData[date].map((item) => (
            <div key={item.id} className="audio-item">
              <div className="audio-info">
                <strong>{item.title}</strong>
                {item.time && <span className="time">{item.time}</span>}
              </div>

              <div className="audiobtns">
                {playingId === item.id && (
                  <div className="time-bar">
                    <span>{formatTime(currentTime)}</span>
                    <input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek} />
                    <span>{formatTime(duration)}</span>
                  </div>
                )}

                <div className="audio-controls">
                  <button className="backwordbtn" onClick={backward} title="Rewind 5s" ><Rewind size={18} /></button> 
                  <button className="playbtn" onClick={() => playAudio(item.audioUrl, item.id)} title={playingId === item.id && !audioRef.current?.paused ? "Pause" : "Play"} >
                    {playingId === item.id && !audioRef.current?.paused ? (
                      <Pause size={20} />
                    ) : (
                      <Play size={20} />
                    )}
                  </button> 
                  <button className="forwardbtn" onClick={forward} title="Forward 5s" ><FastForward size={18} /></button>
                </div>
              </div>
            </div>
          ))} 
        </Accordion>
      ))}
    </div>
  );
}