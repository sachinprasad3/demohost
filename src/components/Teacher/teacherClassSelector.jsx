const ClassSelector = ({
  classes = [],
  activeClassId,
  setActiveClassId,
  onChange,
}) => {
  if (!classes.length) return null;

  return (
    <>
      {/* <div className="class-label">Switch Class</div> */}
 
        {classes.map((cls) => (
          <div
            key={cls.classId}
            data-status={cls.assignmentStatus}
            className={`class-pill ${activeClassId === cls.classId ? "active" : ""
              }`}
            onClick={() => {
              setActiveClassId(cls.classId);
              localStorage.setItem("activeClassId", cls.classId)

              onChange?.(cls);
            }}
          >
            <span>{cls.className}</span>

            <span className={`status-badge ${cls.assignmentStatus === "Permanent" ? "status-permanent" : "status-temporary" }`} >
              {cls.assignmentStatus}
            </span>
          </div>
        ))} 
    </>
  );
};

export default ClassSelector;
