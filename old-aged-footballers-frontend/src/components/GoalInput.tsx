import React, { useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';

interface GoalInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function GoalInput({ value, onChange, max = 99 }: GoalInputProps) {
  const [isDecrementTapped, setIsDecrementTapped] = useState(false);
  const [isIncrementTapped, setIsIncrementTapped] = useState(false);

  const handleIncrement = () => {
    if (value < max) {
      setIsIncrementTapped(true);
      onChange(value + 1);
      setTimeout(() => setIsIncrementTapped(false), 200);
    }
  };

  const handleDecrement = () => {
    if (value > 0) {
      setIsDecrementTapped(true);
      onChange(value - 1);
      setTimeout(() => setIsDecrementTapped(false), 200);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value === 0}
        className={`w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center touch-manipulation
          ${value === 0 
            ? 'bg-gray-100 text-gray-400' 
            : `bg-indigo-100 text-indigo-600 ${isDecrementTapped ? 'animate-tap' : ''}`}`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <FaMinus className="w-2.5 h-2.5" />
      </button>
      <span className="w-6 text-center text-base font-semibold select-none">{value}</span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value === max}
        className={`w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center touch-manipulation
          ${value === max 
            ? 'bg-gray-100 text-gray-400' 
            : `bg-indigo-100 text-indigo-600 ${isIncrementTapped ? 'animate-tap' : ''}`}`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <FaPlus className="w-2.5 h-2.5" />
      </button>
    </div>
  );
} 