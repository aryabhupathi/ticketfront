import React, { useEffect, useState } from 'react';
import '../constants/loadme.css';

const LoaderAnimation = () => {
  const [visibleIndex, setVisibleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loader-container">
      <div className="circle">
        <div className={`vehicle ${visibleIndex === 0 ? 'visible' : ''}`}>
          <img src="../../image1.png" alt="bus" />
        </div>
        <div className={`vehicle ${visibleIndex === 1 ? 'visible' : ''}`}>
          <img src="../../image2.png" alt="train" />
        </div>
        <div className={`vehicle ${visibleIndex === 2 ? 'visible' : ''}`}>
          <img src="../../image.png" alt="flight" />
        </div>
      </div>
    </div>
  );
};

export default LoaderAnimation;
