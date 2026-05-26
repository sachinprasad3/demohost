import React from "react"; 

export default function Teachers({ user }) {       // ✅ FIX: accept user here
  const nursery = [
    { name: "Mrs. Priya Sharma", qualification: "B.Ed, M.A", exp: "5 Years", contact: "9876543210" },
    { name: "Mrs. Anjali Verma", qualification: "B.A, D.El.Ed", exp: "3 Years", contact: "9876543221" },
  ];

  const lkg = [
    { name: "Ms. Ritu Singh", qualification: "B.Ed", exp: "4 Years", contact: "9876543234" },
    { name: "Mrs. Neha Khanna", qualification: "B.A", exp: "2 Years", contact: "9876543245" },
  ];

  const ukg = [
    { name: "Mrs. Swati Gupta", qualification: "B.Sc, B.Ed", exp: "6 Years", contact: "9876543256" },
    { name: "Ms. Meera Patra", qualification: "B.A", exp: "1.5 Years", contact: "9876543267" },
  ];

  const activity = [
    { name: "Mr. Anand Kumar", subject: "Music", exp: "7 Years", contact: "9876543278" },
    { name: "Ms. Kavita Mishra", subject: "Dance", exp: "5 Years", contact: "9876543289" },
    { name: "Mrs. Rachna Prasad", subject: "Art & Craft", exp: "4 Years", contact: "9876543290" },
    { name: "Mr. Rajesh Kumar", subject: "Sports", exp: "6 Years", contact: "9876543301" },
  ];

  const support = [
    { name: "Suman Devi", role: "Aaya / Helper", contact: "9876543311" },
    { name: "Mahesh Thakur", role: "Peon / Support", contact: "9876543322" },
  ];

  return (
    <div className="mainpro">
      <div className="container">
        <div className="teacher-page">

          {/* pass user */}
          <CardSection title="Nursery Section" data={nursery} user={user} />
          <CardSection title="LKG Section" data={lkg} user={user} />
          <CardSection title="UKG Section" data={ukg} user={user} />

          {/* these do NOT need user unless you want conditional contact */}
          <ActivitySection title="Activity Teachers" data={activity} />
          <SupportSection title="Supporting Staff" data={support} />

        </div>
      </div>
    </div>
  );
}

const CardSection = ({ title, data, user }) => (
  <div className="card-section">
    <h3>{title}</h3>
    {data.map((t, i) => (
      <div key={i} className="teacher-card">
        <p><strong>Name:</strong> {t.name}</p>
        <p><strong>Qualification:</strong> {t.qualification}</p>
        <p><strong>Experience:</strong> {t.exp}</p> 
        {(user?.role === "admin" || user?.role === "student") && (
        <p><strong>Contact:</strong> {t.contact}</p>
        )}
        {user?.role === "admin" && (
        <button>Edit</button>
        )}
      </div>
    ))}
  </div>
);

const ActivitySection = ({ title, data }) => (
  <div className="card-section">
    <h3>{title}</h3>
    {data.map((t, i) => (
      <div key={i} className="teacher-card">
        <p><strong>Name:</strong> {t.name}</p>
        <p><strong>Activity:</strong> {t.subject}</p>
        <p><strong>Experience:</strong> {t.exp}</p>
        <p><strong>Contact:</strong> {t.contact}</p>
      </div>
    ))}
  </div>
);

const SupportSection = ({ title, data }) => (
  <div className="card-section">
    <h3>{title}</h3>
    {data.map((t, i) => (
      <div key={i} className="teacher-card">
        <p><strong>Name:</strong> {t.name}</p>
        <p><strong>Role:</strong> {t.role}</p>
        <p><strong>Contact:</strong> {t.contact}</p>
      </div>
    ))}
  </div>
);
