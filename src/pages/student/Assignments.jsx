import React from "react"; 

export default function Assignments() {
  const data = [
    {
      day: "Day 1",
      english: [
        "Articles (a, an)",
        "My Second Reader book",
        "CA → Pg. 36, 37",
        "HA → Pg. 38"
      ],
      hindi: [
        "३ की मात्रा वाले शब्द",
        "Happiness → Pg. 32 (CA)",
        "HA → Pg. 33",
        "Reading from पुस्तक"
      ],
      math: [
        "Happiness → Pg. 49",
        "Enjoying → Pg. 37",
        "Count & Add (objects)"
      ]
    },
    {
      day: "Day 2",
      english: [
        "Articles",
        "Little Hands (Pg. 39, 95)",
        "CA",
        "HA → Pg. 94, 96"
      ],
      hindi: [
        "३ की मात्रा जोड़कर लिखें",
        "Hindi copy (CA + HA)"
      ],
      math: [
        "Number Line (2,3)",
        "Addition Concept",
        "Enjoying → Pg. 44, 45 (CA)",
        "Pg. 48, 49 (HA)"
      ]
    },
    {
      day: "Day 3",
      english: [
        "English copy",
        "Articles (CA + HA)"
      ],
      hindi: [
        "३ की मात्रा वाले शब्द",
        "Happiness → Pg. 34 (CA)",
        "Pg. 35 (HA)"
      ],
      math: [
        "Happiness → Pg. 50 (CA)",
        "Pg. 51 (HA)",
        "Oral – 41 to 45 number names"
      ]
    },
    {
      day: "Day 4",
      english: [
        "Days of the Week",
        "Write in copy (CA + HA)"
      ],
      hindi: [
        "३ से मिलते जुलते शब्द",
        "Hindi copy (CA + HA)"
      ],
      math: [
        "Enjoying Maths → Pg. 47 (CA)",
        "Pg. 46 (HA)",
        "Happiness → Pg. 46 (Extra)"
      ]
    },
    {
      day: "Day 5",
      english: [
        "Little Hands",
        "Pg. 99 (HA)",
        "Pg. 100 (CA)",
        "Maths Happiness → Pg. 76, 77 (CA + HA)"
      ],
      hindi: [
        "३ की मात्रा से वाक्य लिखें",
        "Hindi copy (CA + HA)"
      ],
      math: [
        "Happiness → Pg. 47 (CA)",
        "Maths copy → Number Names 41 to 45 (HA)"
      ]
    }
  ];

  return (
    <div className="mainpro">
    <div className="container"> 
    <div className="syllabus-mobile">
      {data.map((item, index) => (
        <div className="additional-section" key={index}>
          <h3 className="day-title">{item.day}</h3>

          <div className="subject-box">
            <h4>English</h4>
            <ul>{item.english.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>

          <div className="subject-box">
            <h4>Hindi</h4>
            <ul>{item.hindi.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>

          <div className="subject-box">
            <h4>Math</h4>
            <ul>{item.math.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        </div>
      ))}
    </div>
    </div>
    </div>
  );
}
