import { useContext } from "react";
import { AdmissionFormContext } from "../context/AdmissionFormContext";

export default function useAdmissionFormContext() {
  return useContext(AdmissionFormContext);
}
