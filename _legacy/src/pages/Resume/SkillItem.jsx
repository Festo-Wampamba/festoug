import React, { useEffect, useRef, useState } from 'react';

const SkillItem = ({ title, value }) => {
  const progressRef = useRef(null);
  const [displayedValue, setDisplayedValue] = useState(0);

  useEffect(() => {
    const progressBar = progressRef.current;
    const duration = 5000; // Duration of the animation in milliseconds

    const handleAnimation = () => {
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const currentValue = Math.floor(progress * value);
        setDisplayedValue(currentValue);
        progressBar.style.width = `${currentValue}%`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          handleAnimation();
        } else {
          setDisplayedValue(0);
          progressBar.style.width = '0%'; // Reset to 0 when not in view
        }
      },
      { threshold: 0.5 } // Adjust threshold as needed
    );

    if (progressBar) {
      observer.observe(progressBar);
    }

    return () => {
      if (progressBar) {
        observer.unobserve(progressBar);
      }
    };
  }, [value]);

  return (
    <li className="skills-item">
      <div className="title-wrapper1">
        <h5 className="h5">{title}</h5>
        <data value={displayedValue}>{displayedValue}%</data>
      </div>
      <div className="skill-progress-bg">
        <div ref={progressRef} className="skill-progress-fill"></div>
      </div>
    </li>
  );
};

export default SkillItem;
