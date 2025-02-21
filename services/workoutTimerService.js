import { useState, useEffect } from 'react';

export const useWorkoutTimer = () => {
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    let intervalId;
    if (isActive && startTime) {
      intervalId = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setDuration(elapsed);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isActive, startTime]);

  const startTimer = () => {
    setStartTime(Date.now());
    setIsActive(true);
    setDuration(0);
  };

  const stopTimer = () => {
    setIsActive(false);
    return duration;
  };

  return { startTimer, stopTimer, duration };
};

export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${remainingSeconds.toString().padStart(2, '0')}s`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
