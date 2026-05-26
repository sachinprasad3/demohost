
import { monthlySyllabus_APIs } from "../utills/apis";
import axiosInstance from "../utills/axiosInstance";

export const createMonthlySyllabus = async (payload) => {
  const response = await axiosInstance.post(
    monthlySyllabus_APIs.CREATE_MONTHLY_SYLLABUS,
    payload
  );

  return response.data;
};

export const getAllMonthlySyllabus = async () => {
  const res = await axiosInstance.get(monthlySyllabus_APIs.GET_ALL);
  return res.data;
};
 
export const deleteMonthlySyllabusById = async (id) => {
  const res = await axiosInstance.delete(
    `${monthlySyllabus_APIs.DELETE_MONTHLY_PLAN}/${id}`
  );
  return res.data;
};


