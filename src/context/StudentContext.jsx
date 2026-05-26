import { createContext, useContext, useState } from "react";

// export const StudentContext = createContext();



// // usage shortcut
// export const useStudent = () => useContext(StudentContext);

export const StudentContext = createContext(null);


export const useStudent = () => {
  const context = useContext(StudentContext);
  // if (!context) {
  //   throw new Error("useStudent must be used within StudentProvider");
  // }
  return context;
};