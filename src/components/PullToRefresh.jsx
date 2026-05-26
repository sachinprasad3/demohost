import React, { useState, useEffect } from "react"; 

const PullToRefresh = ({ children }) => {
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [iconRotation, setIconRotation] = useState(0);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e) => {
      if (startY === 0 || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      if (distance > 100) {
        e.preventDefault();
        const pull = distance > 150 ? 150 : distance;
        setPullDistance(pull); 
        setIconRotation(pull > 100 ? 360 : (pull / 100) * 360);
      }

      if (distance > 100 && !isRefreshing) {
        setIsRefreshing(true);
        document.body.classList.add("refresh-loading");
 
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    };

    const handleTouchEnd = () => {
      setStartY(0);
      setPullDistance(0);
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [startY, isRefreshing]);

  return (
    <div style={{ transform: `translateY(${pullDistance / 2}px)`, transition: isRefreshing ? "transform 0.3s ease-out" : "none", }} >
      <div className="pull-refresh-header" style={{ height: pullDistance > 0 ? 60 : 0, }}> </div>

      {children}
    </div>
  );
};

export default PullToRefresh;
