import React, { useState } from "react";
import Accordion from "../../components/Accordion";

const CLASSES = ["Nursery", "KG1", "KG2", "Class1"];

const WEEK = {
  Nursery: [
    {
      day: 'Monday',
      slots: [
        ['09:00 - 09:20', 'Free Play & Settling Time'],
        ['09:20 - 09:30', 'Prayer & Rhymes'],
        ['09:30 - 10:00', 'English (Letters / Phonics)'],
        ['10:00 - 10:30', 'Maths (Numbers / Counting)'],
        ['10:30 - 10:45', 'Snack Break'],
        ['10:45 - 11:15', 'Art & Craft'],
        ['11:15 - 11:45', 'Outdoor Games / Physical Activity'],
        ['11:45 - 12:30', 'Story Time / Pack Up'],
      ],
    },
    {
      day: 'Tuesday',
      slots: [
        ['09:00 - 09:20', 'Free Play & Settling Time'],
        ['09:20 - 09:30', 'Prayer & Rhymes'],
        ['09:30 - 10:00', 'EVS / GK (Animals, Plants, Family)'],
        ['10:00 - 10:30', 'English (Phonics / Reading)'],
        ['10:30 - 10:45', 'Snack Break'],
        ['10:45 - 11:15', 'Craft / Coloring'],
        ['11:15 - 11:45', 'Music & Dance'],
        ['11:45 - 12:30', 'Story Time'],
      ],
    },
    {
      day: 'Wednesday',
      slots: [
        ['09:00 - 09:20', 'Free Play & Settling Time'],
        ['09:20 - 09:30', 'Prayer & Rhymes'],
        ['09:30 - 10:00', 'Maths (Shapes / Patterns)'],
        ['10:00 - 10:30', 'English (Speaking / Rhymes)'],
        ['10:30 - 10:45', 'Snack Break'],
        ['10:45 - 11:15', 'EVS Activity / Nature Study'],
        ['11:15 - 11:45', 'Yoga / Physical Activity'],
        ['11:45 - 12:30', 'Story / Worksheet'],
      ],
    },
    {
      day: 'Thursday',
      slots: [
        ['09:00 - 09:20', 'Free Play & Settling Time'],
        ['09:20 - 09:30', 'Prayer & Rhymes'],
        ['09:30 - 10:00', 'English (Writing Practice)'],
        ['10:00 - 10:30', 'Maths (Counting / Games)'],
        ['10:30 - 10:45', 'Snack Break'],
        ['10:45 - 11:15', 'Science / Simple Experiments'],
        ['11:15 - 11:45', 'Outdoor Games'],
        ['11:45 - 12:30', 'Story / Pack Up'],
      ],
    },
    {
      day: 'Friday',
      slots: [
        ['09:00 - 09:20', 'Free Play & Settling Time'],
        ['09:20 - 09:30', 'Prayer & Rhymes'],
        ['09:30 - 10:00', 'Maths (Revision / Games)'],
        ['10:00 - 10:30', 'English (Reading / Conversation)'],
        ['10:30 - 10:45', 'Snack Break'],
        ['10:45 - 11:15', 'Art & Craft / Coloring'],
        ['11:15 - 11:45', 'Music & Movement'],
        ['11:45 - 12:30', 'Story / Revision'],
      ],
    },
    {
      day: 'Saturday',
      slots: [
        ['09:00 - 09:20', 'Free Play & Settling Time'],
        ['09:20 - 09:30', 'Prayer & Rhymes'],
        ['09:30 - 10:00', 'Revision - English'],
        ['10:00 - 10:30', 'Revision - Maths'],
        ['10:30 - 10:45', 'Snack Break'],
        ['10:45 - 11:15', 'Fun Activities / Games'],
        ['11:15 - 11:45', 'Drawing / Craft'],
        ['11:45 - 12:30', 'Story / Early Dispersal'],
      ],
    },
  ],

  KG1: [
    {
      day: 'Monday',
      slots: [
        ['09:00 - 09:20', 'Free Play & Settling Time'],
        ['09:20 - 09:30', 'Prayer & Moral Talk'],
        ['09:30 - 10:00', 'English – Phonics / Letter Writing'],
        ['10:00 - 10:30', 'Maths – Counting / Shapes'],
        ['10:30 - 10:45', 'Snack Break'],
        ['10:45 - 11:15', 'Art & Craft / Coloring'],
        ['11:15 - 11:45', 'Outdoor Games'],
        ['11:45 - 12:30', 'Story Time / Pack Up'],
      ],
    },
    {
      day: 'Tuesday',
      slots: [
        ['09:00 - 09:20', 'Free Play & Settling Time'],
        ['09:20 - 09:30', 'Prayer & Rhymes'],
        ['09:30 - 10:00', 'EVS – Family / Plants'],
        ['10:00 - 10:30', 'English – Reading Practice'],
        ['10:30 - 10:45', 'Snack Break'],
        ['10:45 - 11:15', 'Craft Activity'],
        ['11:15 - 11:45', 'Music & Dance'],
        ['11:45 - 12:30', 'Story Time'],
      ],
    },
    {
      day: 'Wednesday',
      slots: [
        ['09:00 - 09:20', 'Yoga / Warmup'],
        ['09:20 - 09:30', 'Prayer & Rhymes'],
        ['09:30 - 10:00', 'Maths – Number Writing'],
        ['10:00 - 10:30', 'English – Speaking / Vocabulary'],
        ['10:30 - 10:45', 'Snack Break'],
        ['10:45 - 11:15', 'Nature Study / EVS'],
        ['11:15 - 11:45', 'Outdoor Games'],
        ['11:45 - 12:30', 'Story / Worksheet'],
      ],
    },
    {
      day: 'Thursday',
      slots: [
        ['09:00 - 09:20', 'Indoor Free Play'],
        ['09:20 - 09:30', 'Prayer'],
        ['09:30 - 10:00', 'English – Writing Practice'],
        ['10:00 - 10:30', 'Maths – Game Based Learning'],
        ['10:30 - 10:45', 'Snack Break'],
        ['10:45 - 11:15', 'Science – Simple Experiments'],
        ['11:15 - 11:45', 'Outdoor Games'],
        ['11:45 - 12:30', 'Story / Pack Up'],
      ],
    },
    {
      day: 'Friday',
      slots: [
        ['09:00 - 09:20', 'Free Play'],
        ['09:20 - 09:30', 'Prayer'],
        ['09:30 - 10:00', 'Maths – Revision'],
        ['10:00 - 10:30', 'English – Conversation'],
        ['10:30 - 10:45', 'Snack Break'],
        ['10:45 - 11:15', 'Art & Craft'],
        ['11:15 - 11:45', 'Music & Movement'],
        ['11:45 - 12:30', 'Story / Revision'],
      ],
    },
    {
      day: 'Saturday',
      slots: [
        ['09:00 - 09:20', 'Free Play'],
        ['09:20 - 09:30', 'Prayer'],
        ['09:30 - 10:00', 'Revision – English'],
        ['10:00 - 10:30', 'Revision – Maths'],
        ['10:30 - 10:45', 'Snack Break'],
        ['10:45 - 11:15', 'Fun Games'],
        ['11:15 - 11:45', 'Drawing / Craft'],
        ['11:45 - 12:30', 'Story / Early Dispersal'],
      ],
    },
  ],

  KG2: [
    {
      day: 'Monday',
      slots: [
        ['09:00 - 09:15', 'Morning Assembly / Prayer'],
        ['09:15 - 09:45', 'English – Cursive Writing'],
        ['09:45 - 10:15', 'Maths – Number Concepts'],
        ['10:15 - 10:30', 'Snack Break'],
        ['10:30 - 11:00', 'EVS – Animals & Birds'],
        ['11:00 - 11:30', 'Music / Dance'],
        ['11:30 - 12:30', 'Story / Pack Up'],
      ],
    },
    {
      day: 'Tuesday',
      slots: [
        ['09:00 - 09:15', 'Free Play'],
        ['09:15 - 09:45', 'English – Reading Practice'],
        ['09:45 - 10:15', 'Maths – Shapes / Patterns'],
        ['10:15 - 10:30', 'Snack Break'],
        ['10:30 - 11:00', 'Craft Activity'],
        ['11:00 - 11:30', 'Yoga'],
        ['11:30 - 12:30', 'Story Time'],
      ],
    },
    {
      day: 'Wednesday',
      slots: [
        ['09:00 - 09:15', 'Morning Assembly'],
        ['09:15 - 09:45', 'Hindi – Letter Practice'],
        ['09:45 - 10:15', 'Maths – Counting'],
        ['10:15 - 10:30', 'Snack Break'],
        ['10:30 - 11:00', 'Science Activity'],
        ['11:00 - 11:30', 'Outdoor Games'],
        ['11:30 - 12:30', 'Worksheet Practice'],
      ],
    },
    {
      day: 'Thursday',
      slots: [
        ['09:00 - 09:15', 'Prayer / Exercise'],
        ['09:15 - 09:45', 'English – Story Reading'],
        ['09:45 - 10:15', 'Maths – Game Based Learning'],
        ['10:15 - 10:30', 'Snack Break'],
        ['10:30 - 11:00', 'EVS – Nature Study'],
        ['11:00 - 11:30', 'Music'],
        ['11:30 - 12:30', 'Story Pack Up'],
      ],
    },
    {
      day: 'Friday',
      slots: [
        ['09:00 - 09:15', 'Prayer'],
        ['09:15 - 09:45', 'Hindi – Rhymes'],
        ['09:45 - 10:15', 'English – Word Building'],
        ['10:15 - 10:30', 'Snack Break'],
        ['10:30 - 11:00', 'Art & Craft'],
        ['11:00 - 11:30', 'Movement Games'],
        ['11:30 - 12:30', 'Story / Revision'],
      ],
    },
    {
      day: 'Saturday',
      slots: [
        ['09:00 - 09:15', 'Free Play'],
        ['09:15 - 09:45', 'Revision – English'],
        ['09:45 - 10:15', 'Revision – Maths'],
        ['10:15 - 10:30', 'Snack Break'],
        ['10:30 - 11:15', 'Drawing'],
        ['11:15 - 11:45', 'Games'],
        ['11:45 - 12:30', 'Early Dispersal'],
      ],
    },
  ],

  Class1: [
    {
      day: 'Monday',
      slots: [
        ['09:00 - 09:20', 'Assembly & Prayer'],
        ['09:20 - 09:50', 'English – Grammar / Reading'],
        ['09:50 - 10:20', 'Maths – Addition / Subtraction'],
        ['10:20 - 10:35', 'Snack Break'],
        ['10:35 - 11:05', 'Hindi – Writing / Reading'],
        ['11:05 - 11:35', 'EVS – My School / Community'],
        ['11:35 - 12:30', 'Story / Pack Up'],
      ],
    },
    {
      day: 'Tuesday',
      slots: [
        ['09:00 - 09:20', 'Prayer'],
        ['09:20 - 09:50', 'Maths – Mental Calculations'],
        ['09:50 - 10:20', 'English – Comprehension'],
        ['10:20 - 10:35', 'Snack Break'],
        ['10:35 - 11:05', 'Hindi – Poems / Dictation'],
        ['11:05 - 11:35', 'Science / Activity'],
        ['11:35 - 12:30', 'Story Time'],
      ],
    },
    {
      day: 'Wednesday',
      slots: [
        ['09:00 - 09:20', 'Prayer'],
        ['09:20 - 09:50', 'EVS – Plants & Animals'],
        ['09:50 - 10:20', 'Maths – Tables'],
        ['10:20 - 10:35', 'Snack Break'],
        ['10:35 - 11:05', 'English – Writing Skills'],
        ['11:05 - 11:35', 'Games / PT'],
        ['11:35 - 12:30', 'Worksheet Practice'],
      ],
    },
    {
      day: 'Thursday',
      slots: [
        ['09:00 - 09:20', 'Yoga'],
        ['09:20 - 09:50', 'English – Story Reading'],
        ['09:50 - 10:20', 'Maths – Revision'],
        ['10:20 - 10:35', 'Snack Break'],
        ['10:35 - 11:05', 'Hindi – Grammar'],
        ['11:05 - 11:35', 'Computer – Basics'],
        ['11:35 - 12:30', 'Story Pack Up'],
      ],
    },
    {
      day: 'Friday',
      slots: [
        ['09:00 - 09:20', 'Prayer'],
        ['09:20 - 09:50', 'Science Activity'],
        ['09:50 - 10:20', 'English – Speaking Skills'],
        ['10:20 - 10:35', 'Snack Break'],
        ['10:35 - 11:05', 'Maths – Game Based Learning'],
        ['11:05 - 11:35', 'Art & Craft'],
        ['11:35 - 12:30', 'Story / Revision'],
      ],
    },
    {
      day: 'Saturday',
      slots: [
        ['09:00 - 09:20', 'Free Play'],
        ['09:20 - 09:50', 'Revision – All Subjects'],
        ['09:50 - 10:20', 'General Knowledge'],
        ['10:20 - 10:35', 'Snack Break'],
        ['10:35 - 11:15', 'Drawing / Craft'],
        ['11:15 - 11:45', 'Outdoor Games'],
        ['11:45 - 12:30', 'Early Dispersal'],
      ],
    },
  ], 

};

// ✔ FIX: WEEK_DATA MUST POINT TO WEEK DIRECTLY
const WEEK_DATA = WEEK;

export default function PlaySchoolTimetable() {
  const [selectedClass, setSelectedClass] = useState("Nursery");

  return (
    <div className="mainpro">
      <div className="container">

        {/* Header */}
        <header className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm text-gray-600">
              Monday — Saturday | 09:00 AM – 12:30 PM
            </p>
          </div>
        </header>

        {/* CLASS DROPDOWN */}
        <div className="mb-4 flex gap-2 items-center">
          <label className="font-semibold">Select Class:</label>
          <select
            className="border px-3 py-2 rounded"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Choose Class --</option>
            {CLASSES.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        {/* MESSAGE */}
        {!selectedClass && (
          <p className="text-gray-500 mb-4">
            Please select a class to view the timetable.
          </p>
        )}

        {/* TIMETABLE */}
        {selectedClass && (
          <div className="timetable">
            {WEEK_DATA[selectedClass].map((dayObj, idx) => (
              <Accordion
                key={dayObj.day}
                title={dayObj.day}
                defaultOpen={idx === 0}   // ⭐ FIRST ONE OPENS
              >
                <table className="table">
                  <tbody>
                    {dayObj.slots.map((slot, i) => (
                      <tr key={i}>
                        <td>{slot[0]}</td>
                        <td>{slot[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Accordion>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}
