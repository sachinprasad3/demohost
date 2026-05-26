import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Input from '../../components/AmissionFormComponents/customField/Input'
import { yupResolver } from '@hookform/resolvers/yup'
import { filterSchema } from '../../validations/filterSchema'
import { Eye, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGetAllCandidateWithoutUserId, useGetAllParentsUserId } from '../../services/admission.services'
import RhfInput from '../../components/AmissionFormComponents/customField/RhfInput'
import { useDebounceValue } from '../../hooks/useDebounce'


const AllParents = () => {
  const { control, watch, reset } = useForm({
    resolver: yupResolver(filterSchema),
    defaultValues: {
      mobileNo: "",
      userId: "",
      emailId: "",
      fullName: "",
      admissionRegistrationNo: "",
      dateOfBirth: ""
    }
  });


  const mobileNo = watch("mobileNo");
  const userId = watch("userId");
  const emailId = watch("emailId");
  const fullName = watch("fullName");
  const admissionRegistrationNo = watch("admissionRegistrationNo");
  const dateOfBirth = watch("dateOfBirth");
  const filters = React.useMemo(() => ({
    mobileNo,
    userId,
    emailId,
    fullName,
    admissionRegistrationNo,
    dateOfBirth
  }), [mobileNo, userId, emailId, fullName, admissionRegistrationNo, dateOfBirth]);
  const debouncedFilters = useDebounceValue(filters, 400);
  const [activeTab, setActiveTab] = useState("enrolled");
  const candidateFilters = {
    admissionRegistrationNo: debouncedFilters.admissionRegistrationNo, // if used for search
    studentName: debouncedFilters.fullName,
    dateOfBirth: debouncedFilters.dateOfBirth
  };
  const { data: unenrolledUsers } = useGetAllCandidateWithoutUserId(candidateFilters, {
    enabled: activeTab === "unenrolled"
  });
  const { data: allParentsUserId } = useGetAllParentsUserId(debouncedFilters, {
    enabled: activeTab === "enrolled"
  });

  
  const navigate = useNavigate()
  const enrollParent = () => {
    localStorage.removeItem("candidateId");
    localStorage.removeItem("studentId");
    localStorage.removeItem("appUserId")

    navigate("/admin/admission-form?mode=new");
  };


  const handleClearFilters = () => {
    reset({
      mobileNo: "",
      userId: "",
      emailId: "",
      fullName: "",
      admissionRegistrationNo: "",
      dateOfBirth: ""
    });
  };

  return (
    <>
      <style>
        {`
      .action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}


      `}
      </style>


      <div className='mainpro'>
        <div className='container'>

          <div className="action-bar">
            <button className="btn btn-primary" onClick={enrollParent}>
              Enroll Parent
            </button>
          </div>



          <div className="whitebox">
            <div className='formbox searchsec'>
              <ul>
                {activeTab === "unenrolled" && <li>
                  <Controller
                    name="admissionRegistrationNo"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <RhfInput
                        {...field}
                        label="Filter by Registeration No.."
                        placeholder="Enter Registration No."

                        error={error?.message}
                        onChange={(e) => {

                          field.onChange(e.target.value);
                        }}
                      />
                    )}
                  />
                </li>}
                {activeTab === "unenrolled" && <li>
                  <Controller
                    name="dateOfBirth"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <RhfInput
                        {...field}
                        label="Filter by DOB"
                        type="date"
                        error={error?.message}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                </li>}
                {activeTab === "enrolled" && <li>
                  <Controller
                    name="mobileNo"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <RhfInput
                        {...field}
                        label="Filter by Phone No."
                        placeholder="Enter Phone No."
                        inputMode="numeric"
                        maxLength={10}
                        error={error?.message}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                      />
                    )}
                  />
                </li>}
                {activeTab === "enrolled" && <li>
                  <Controller
                    name="userId"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <RhfInput
                        {...field}
                        label="Filter by user Id"
                        placeholder="Enter UserId"
                        // inputMode="numeric"
                        // maxLength={10}
                        error={error?.message}
                        onChange={(e) => {
                          // const value = e.target.value.replace(/\D/g, "");
                          field.onChange(e.target.value);
                        }}
                      />
                    )}
                  />
                </li>}
                {activeTab === "enrolled" && <li>
                  <Controller
                    name="emailId"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <RhfInput
                        {...field}
                        label="Filter by Email Id"
                        placeholder="Enter Email Id"
                        error={error?.message}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                </li>}

                <li>
                  <Controller
                    name="fullName"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <RhfInput
                        {...field}
                        label="Filter by Name"
                        placeholder="Enter Name"


                        error={error?.message}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                </li>

              <div class="form-group"><button class="searchbtn btn btn-primary" type="button" onClick={handleClearFilters}>Clear Filters</button></div>
              </ul>
            </div>
          </div>

          <div className="tabs ">
            <button className={`tab ${activeTab === "enrolled" ? "activeTab" : ""}`} onClick={() => { setActiveTab("enrolled"); handleClearFilters() }}>Enrolled user</button>
            <button className={`tab ${activeTab === "unenrolled" ? "activeTab" : ""}`} onClick={() => { setActiveTab("unenrolled"); handleClearFilters() }}>Un-Enrolled user</button>
          </div>

          {activeTab === "enrolled" &&
            <div className="listsec syllabus-master">
              <div className="listbox studentlist theading">
                <div>Sl.</div>
                <div>User Id</div>
                <div>User Name</div>
                <div>Parent Name</div>
                <div>Email Id</div>
                <div>Phone No.</div>
                <div>Action</div>
              </div>
              {!allParentsUserId?.length ?(
                <div className='d-flex justify-content-center'>User Not found</div>
              ):(<ul>
                {allParentsUserId?.map((user, index) => (
                  <li key={user?.userId}>
                    <div className="listbox studentlist">
                      <div data-head="Sl.">{index + 1}</div>
                      <div data-head="User Id">{user?.userId}</div>
                      <div data-head="User Name">{user?.username}</div>
                      <div data-head="Name">{user?.fullName}</div>
                      <div data-head="Email Id">{user?.emailId}</div>
                      <div data-head="Phone No.">{user?.mobileNo}</div>
                      {/* <div data-head="Once">₹{CLASS_FEES[cls].once}</div>
                        <div data-head="Kit">₹{CLASS_FEES[cls].kit}</div> */}

                      <div className="actionbtns">
                        <button className="viewbtn" onClick={() => { navigate("students", { state: { userId: user?.userId } }) }}><Eye size={18} /></button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>)}
            </div>}
          {activeTab === "unenrolled" && <div className="listsec syllabus-master">
            <div className="listbox studentlist theading">
              <div>Sl.</div>
              <div>Admission No</div>
              <div>Student Name</div>
              <div>Class</div>
              <div>Dob</div>
              <div>Action</div>

            </div>
            {!unenrolledUsers?.length?(
              <div className='d-flex justify-content-center'>
                User Not found
              </div>
            ):(<ul>
              {unenrolledUsers?.map((user, index) => (
                <li key={user?.userId}>
                  <div className="listbox studentlist">
                    <div data-head="Sl.">{index + 1}</div>
                    <div data-head="User Id">{user?.admissionRegistrationNo}</div>
                    <div data-head="Name">{user?.studentName}</div>
                    <div data-head="Email Id">{user?.className}</div>
                    <div data-head="Phone No.">{user?.dateOfBirth}</div>
                    {/* <div data-head="Once">₹{CLASS_FEES[cls].once}</div>
                        <div data-head="Kit">₹{CLASS_FEES[cls].kit}</div> */}

                    <div className="actionbtns">
                      <button className="editbtn" onClick={() => {
                        localStorage.setItem("candidateId", user?.candidateId)
                        localStorage.removeItem("studentId");
                        navigate("/admin/admission-form?mode=edit")
                      }}><Pencil size={18} /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>)}
          </div>}

        </div>

      </div>
    </>
  )
}

export default AllParents
