// banner.service.jsx
import { banner_APIs } from "../utills/apis";
import axiosInstance from "../utills/axiosInstance";

export const saveBanner = async (banner) => {
  const formData = new FormData();

  formData.append(
    "banners",
    new Blob(
      [JSON.stringify(banner)],
      { type: "application/json" }
    )
  );

  if (banner.media instanceof File) {
    formData.append("document", banner.media);
  }

  return axiosInstance.post(banner_APIs.SAVE_BANNERS, formData);
};

export const getAllBanners = async () => {
  const response = await axiosInstance.get(banner_APIs.GET_ALL_BANNERS);
  return response.data;
};

export const getBannerById = async (id) => {
  const res = await axiosInstance.get(
    `${banner_APIs.GET_BANNERS_BY_ID}?id=${id}`
  );
  return res.data;
};

export const deleteBannerById = async (id) => {
  return axiosInstance.delete(`${banner_APIs.DELETE_BANNER}?id=${id}`);
};