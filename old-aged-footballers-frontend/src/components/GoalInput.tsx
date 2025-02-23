import React from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';

interface GoalInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function GoalInput({ value, onChange, max = 99 }: GoalInputProps) {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > 0) {
      onChange(value - 1);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value === 0}
        className={`w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-colors
          ${value === 0 
            ? 'bg-gray-100 text-gray-400' 
            : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 active:bg-indigo-300'}`}
      >
        <FaMinus className="w-2.5 h-2.5" />
      </button>
      <span className="w-6 text-center text-base font-semibold">{value}</span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value === max}
        className={`w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-colors
          ${value === max 
            ? 'bg-gray-100 text-gray-400' 
            : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 active:bg-indigo-300'}`}
      >
        <FaPlus className="w-2.5 h-2.5" />
      </button>
    </div>
  );
} 