import React, { useMemo } from "react";

export default function EnquiryClassGraph({ enquiries = [] }) {

  const getClassName = (enquiry) => {
    return (
      enquiry.className ||
      enquiry.studentClass ||
      enquiry.class?.name ||
      enquiry.classDto?.name ||
      "Unknown"
    );
  };

  const classData = useMemo(() => {
    const map = {};
    enquiries.forEach(enquiry => {
      const cls = getClassName(enquiry);
      map[cls] = (map[cls] || 0) + 1;
    });
    return map;
  }, [enquiries]);

  return (
    <div className="whitebox">
      <h3>Enquiries by Class</h3>

      <div className="card-body">
        {Object.keys(classData).length === 0 ? (
          <p>No enquiries available.</p>
        ) : (
          <ul className="enquiry-list">
            {Object.entries(classData).map(([className, count]) => (
              <li key={className}>
                <strong>{className}</strong> : {count}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
