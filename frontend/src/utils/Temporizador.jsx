import { useEffect, useState } from "react";

export const useCountdown = (targetDate) => {
  const calculate = () => {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const diff = Math.max(0, target - now);

    return {
      total: diff,
      minutes: Math.floor(diff / 1000 / 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(
    targetDate ? calculate() : null
  );

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      setTimeLeft(calculate());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};

export default useCountdown;
