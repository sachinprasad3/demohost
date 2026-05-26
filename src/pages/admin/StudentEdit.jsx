import React, { useEffect, useState } from "react";
import axios from "axios"; 
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../config";

export default function StudentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState({
  // Admission
  admissionNumber: "",
  admissionDate: "",
  className: "",

  // Student Details
  firstName: "",
  surname: "",
  gender: "",
  dob: "",
  placeOfBirth: "",
  nationality: "",
  religion: "",
  bloodGroup: "",
  height: "",
  weight: "",
  homeLanguage: "",
  previousSchool: "",
  studentImage: null,

  // Contact
  mobile: "",
  email: "",
  homeAddress: "",
  address: "",

  // Father
  fatherName: "",
  fatherOccupation: "",
  fatherContact: "",
  fatherPhoto: null,
  fatherAadhaar: null,

  // Mother
  motherName: "",
  motherOccupation: "",
  motherContact: "",
  motherPhoto: null,
  motherAadhaar: null,

  // Emergency
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelation: "",

  // Medical
  medicalInfo: "",
  medication: "",

  // Login
  username: "",
  password: "",
});


const [preview, setPreview] = useState(null);
useEffect(() => {
axios
.get(`${API_URL}/students/${id}`)
.then((res) => {
const cleaned = Object.fromEntries(
Object.entries(res.data).map(([key, value]) => [
key,
value === null ? "" : value
])
);

setStudent(cleaned);

if (res.data.studentImage) {
setPreview(`${API_URL}/uploads/${res.data.studentImage}`);
}
})
.catch((err) => console.log("Error loading student:", err));
}, [id]);

  // Handle Input Change
  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  // Handle Student Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setStudent({ ...student, studentImage: file }); // FIX
    setPreview(URL.createObjectURL(file));
  };

  // Submit Update
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await axios.put(`${API_URL}/students/${id}`, student, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    alert("Student Updated Successfully!");
    navigate("/admin/students");
  } catch (error) {
    console.log(error);
    alert("Error updating student!");
  }
};


  return (
    <div className="mainpro">
      <div className="container student-edit "> 
        <form onSubmit={handleSubmit} className="student-form">
          
<h4 className="section-title">Admission Details</h4>
  <div className="whitebox formbox">
     
  <div className="col-md-6">
    <label className="form-label">Admission Number</label>
    <input type="text" name="admissionNumber" className="form-control" value={student.admissionNumber} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Admission Date</label>
    <input type="date" name="admissionDate" className="form-control" value={student.admissionDate} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Class</label>
    <select name="className" className="form-control" value={student.className} onChange={handleChange}>
      <option value="">Select Class</option>
      <option value="Playgroup">Playgroup / Toddler</option>
      <option value="Nursery">Nursery</option>
      <option value="UKG">Jr. KG</option>
      <option value="1st">Sr. KG</option> 
    </select>
  </div>
</div>
 
 <div className="whitebox">
    <h4 className="form-label">Student Details</h4>
  <div className="formbox">
  <div className="col-md-6">
    <label className="form-label">First Name</label>
    <input type="text" name="firstName" className="form-control"
      value={student.firstName} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Surname</label>
    <input type="text" name="surname" className="form-control"
      value={student.surname} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Gender</label>
    <select name="gender" className="form-control" value={student.gender} onChange={handleChange}>
      <option value="">Select</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
    </select>
  </div>

  <div className="col-md-6">
    <label className="form-label">Date of Birth</label>
    <input type="date" name="dob" className="form-control"
      value={student.dob} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Place of Birth</label>
    <input type="text" name="placeOfBirth" className="form-control"
      value={student.placeOfBirth} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Nationality</label>
    <input type="text" name="nationality" className="form-control"
      value={student.nationality} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Religion</label>
    <input type="text" name="religion" className="form-control"
      value={student.religion} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Blood Group</label>
    <input type="text" name="bloodGroup" className="form-control"
      value={student.bloodGroup} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Height</label>
    <input type="text" name="height" className="form-control"
      value={student.height} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Weight</label>
    <input type="text" name="weight" className="form-control"
      value={student.weight} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Home Language</label>
    <input type="text" name="homeLanguage" className="form-control"
      value={student.homeLanguage} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Previous School</label>
    <input type="text" name="previousSchool" className="form-control"
      value={student.previousSchool} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Student Photo</label>




    <input type="file" name="studentImage" className="form-control" onChange={(e) => handleImageChange(e, "studentImage")} />
  </div>
</div>
</div>
  {/* =====================
      CONTACT DETAILS
  ====================== */}
  <div className="whitebox"> 
    <h4 className="section-title">Contact Details</h4>
  <div className="formbox">
  <div className="col-md-6">
    <label className="form-label">Mobile</label>
    <input type="text" name="mobile" className="form-control"
      value={student.mobile} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Email</label>
    <input type="text" name="email" className="form-control"
      value={student.email} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Home Address</label>
    <textarea name="homeAddress" className="form-control"
      value={student.homeAddress} onChange={handleChange}></textarea>
  </div>

  <div className="col-md-6">
    <label className="form-label">Address</label>
    <textarea name="address" className="form-control"
      value={student.address} onChange={handleChange}></textarea>
  </div>
</div>
</div>
  {/* =====================
      FATHER DETAILS
  ====================== */}
  <div className="whitebox"> 
    <h4 className="section-title">Father Information</h4>
  <div className="formbox">
  <div className="col-md-6">
    <label className="form-label">Father Name</label>
    <input type="text" name="fatherName" className="form-control"
      value={student.fatherName} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Occupation</label>
    <input type="text" name="fatherOccupation" className="form-control"
      value={student.fatherOccupation} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Contact</label>
    <input type="text" name="fatherContact" className="form-control"
      value={student.fatherContact} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Father Photo</label>
    <input type="file" name="fatherPhoto" className="form-control" onChange={(e) => handleFileChange(e, "fatherPhoto")} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Father Aadhaar</label>
    <input type="file" name="fatherAadhaar" className="form-control" onChange={(e) => handleFileChange(e, "fatherAadhaar")} />
  </div>
</div> 
  </div> 
  
  <div className="whitebox">
    <h4 className="section-title">Mother Information</h4>
  <div className="formbox">
  <div className="col-md-6">
    <label className="form-label">Mother Name</label>
    <input type="text" name="motherName" className="form-control"
      value={student.motherName} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Occupation</label>
    <input type="text" name="motherOccupation" className="form-control"
      value={student.motherOccupation} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Contact</label>
    <input type="text" name="motherContact" className="form-control"
      value={student.motherContact} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Mother Photo</label>
    <input type="file" name="motherPhoto" className="form-control" onChange={(e) => handleFileChange(e, "motherPhoto")} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Mother Aadhaar</label>
    <input type="file" name="motherAadhaar" className="form-control" onChange={(e) => handleFileChange(e, "motherAadhaar")} />
  </div>
</div>
</div>
<div className="whitebox">
<h4 className="section-title">Emergency Contact</h4>
<div className="formbox"> 
  <div className="col-md-6">
    <label className="form-label">Emergency Name</label>
    <input type="text" name="emergencyName" className="form-control"
      value={student.emergencyName} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Emergency Phone</label>
    <input type="text" name="emergencyPhone" className="form-control"
      value={student.emergencyPhone} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Relation</label>
    <input type="text" name="emergencyRelation" className="form-control"
      value={student.emergencyRelation} onChange={handleChange} />
  </div>
</div>
</div>


<div className="whitebox">
  <h4 className="section-title">Medical Information</h4> 
<div className="formbox">
  <div className="col-md-6">
    <label className="form-label">Medical Info</label>
    <textarea name="medicalInfo" className="form-control"
      value={student.medicalInfo} onChange={handleChange}></textarea>
  </div>

  <div className="col-md-6">
    <label className="form-label">Medication</label>
    <input type="text" name="medication" className="form-control"
      value={student.medication} onChange={handleChange} />
  </div>
</div>
</div>
<div className="whitebox">
<h4 className="section-title">Login Information</h4>
<div className="formbox">
  <div className="col-md-6">
    <label className="form-label">Username</label>
    <input type="text" name="username" className="form-control"
      value={student.username} onChange={handleChange} />
  </div>

  <div className="col-md-6">
    <label className="form-label">Password</label>
    <input type="text" name="password" className="form-control"
      value={student.password} onChange={handleChange} />
  </div>
</div>
</div>
  <button type="submit" className="submit-btn">Update Student</button>

</form>

      </div>
    </div>
  );
}
