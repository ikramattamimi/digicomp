import React from 'react';
import { Progress } from 'flowbite-react';

const AssessmentProgress = ({ total, filled }) => {
  const percent = total > 0 ? Math.round((filled / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>Progress</span>
        <span>{filled}/{total} ({percent}%)</span>
      </div>
      <Progress progress={percent} size="sm" />
    </div>
  );
};

export default AssessmentProgress;