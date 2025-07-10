
import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  startTime: number;
  timeLimit?: number;
  onTimeUp?: () => void;
  isActive: boolean;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({
  startTime,
  timeLimit,
  onTimeUp,
  isActive,
  className = ''
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
  const remainingSeconds = timeLimit ? Math.max(0, timeLimit - elapsedSeconds) : null;

  useEffect(() => {
    if (timeLimit && remainingSeconds === 0 && onTimeUp && isActive) {
      onTimeUp();
    }
  }, [remainingSeconds, timeLimit, onTimeUp, isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isUrgent = timeLimit && remainingSeconds !== null && remainingSeconds <= 10;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="w-4 h-4" />
      <span className={`font-mono text-lg ${isUrgent ? 'text-red-500 timer-urgent' : ''}`}>
        {timeLimit && remainingSeconds !== null
          ? formatTime(remainingSeconds)
          : formatTime(elapsedSeconds)
        }
      </span>
    </div>
  );
};
