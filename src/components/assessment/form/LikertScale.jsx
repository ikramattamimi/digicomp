import React from 'react';
import { RATING_SCALE } from '../../../constants/assessmentConstants';

const LikertScale = ({ name, value, onChange, disabled }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {RATING_SCALE.map((opt) => (
        <label
          key={opt.value}
          className={`cursor-pointer select-none px-3 py-1 rounded border text-sm ${
            value === opt.value
              ? `bg-${opt.bgColor?.replace('bg-', '') || 'blue-100'} ${opt.textColor || 'text-blue-800'} border-blue-300`
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            disabled={disabled}
            className="hidden"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
};

export default LikertScale;