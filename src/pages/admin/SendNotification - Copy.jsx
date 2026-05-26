import React, { useState } from "react";
import SendMessage from "../../components/SendMessage";

const studentsData = [
  { id: 1, name: "Suman Kumari", className: "Playgroup", phone: "9334818304", roll: 12 },
  { id: 2, name: "Ranjan Singh", className: "Nursery", phone: "9065927066", roll: 5 },
  { id: 3, name: "Neha Kumari", className: "Playgroup", phone: "9470317358", roll: 3 },
];

export default function SendNotification() {
  const [selected, setSelected] = useState([]);

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // ✅ ADD THIS FUNCTION
  const sendSelectedReminders = () => {
    if (selected.length === 0) {
      alert("Please select at least one student");
      return;
    }

    const selectedStudents = studentsData.filter(st =>
      selected.includes(st.id)
    );

    console.log("Sending reminders to:", selectedStudents);
    alert(`Reminder sent to ${selectedStudents.length} students`);
  };

  const sendSingleReminder = (student) => {
    console.log("Sending reminder to:", student);
    alert(`Reminder sent to ${student.name}`);
  };

  return (
     <div className="mainpro">
          <div className="container">
            <div className="whitebox"> 
                <SendMessage />
                <button className="btn btn-primary" onClick={sendSelectedReminders}>Send Message</button>
            </div>

            <div className="listsec">
                <div className="listbox sendinglist theading">
                    <div>S.No</div>
                    <div>Roll</div>
                    <div>Name</div>
                    <div>Class</div>
                    <div>Contact</div>
                </div>
                <ul>
                     
              

      {studentsData.map((st, index) => (

        <li key={st.id}>
            <div class="listbox sendinglist">
                <div>{index + 1} </div>
                <div data-head="Roll">{st.roll}</div>
                <div data-head="Name">{st.name}</div>
                <div data-head="Class" className="classname">{st.className}</div>
                <div data-head="Contact">{st.phone} </div>
            </div> 
        </li>
 
      ))}
        </ul>
            </div>
    </div>
     </div>
  );
}
