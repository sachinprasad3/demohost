// import { AnimatePresence, motion } from "framer-motion";

export const PageSlide = ({ children }) => {
  return (
    <div
      initial={{ x: 80, opacity: 0 }}     // start from right
      animate={{ x: 0, opacity: 1 }}      // slide into position
      exit={{ x: -80, opacity: 0 }}       // slide out to left
      transition={{ duration: 0.35, ease: "easeInOut" }} // smoothness
      style={{ height: "100%", width: "100%" }}
    >
      {children}
    </div>
  );
};
