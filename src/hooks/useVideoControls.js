import { useCallback } from "react";

export const useVideoControls = (swiperRef) => {
  const toggleVideo = useCallback( (e) => {
      const wrapper = e.currentTarget;
      const video = wrapper.querySelector("video");
      if (!video) return;

      if (video.paused) {
        video.play();
        swiperRef?.current?.autoplay?.stop();
        wrapper.classList.add("playing");
        wrapper.classList.remove("paused");
      } else {
        video.pause();
        swiperRef?.current?.autoplay?.start();
        wrapper.classList.add("paused");
        wrapper.classList.remove("playing");
      }
    },
    [swiperRef]
  );

  const onPlay = useCallback((e) => {
    const wrapper = e.currentTarget.parentElement;
    wrapper.classList.add("playing");
    wrapper.classList.remove("paused");
  }, []);

  const onPause = useCallback((e) => {
    const wrapper = e.currentTarget.parentElement;
    wrapper.classList.add("paused");
    wrapper.classList.remove("playing");
  }, []);

  const onEnded = useCallback(
    (e) => {
      const wrapper = e.currentTarget.parentElement;
      wrapper.classList.remove("playing");
      wrapper.classList.add("paused");
      swiperRef?.current?.autoplay?.start();
    },
    [swiperRef]
  );

  return {
    toggleVideo,
    onPlay,
    onPause,
    onEnded,
  };
};