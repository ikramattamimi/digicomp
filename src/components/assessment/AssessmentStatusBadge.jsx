// Assessment Status Badge Component - Displays status with appropriate styling
// Shows different colors and icons based on assessment status

import React from 'react';
import { useEffect, useState } from 'react';
import { Badge } from 'flowbite-react';
import { Edit, Users, CheckCircle } from 'lucide-react';
import { ASSESSMENT_STATUS, STATUS_STYLES } from '../../constants/assessmentConstants';

const AssessmentStatusBadge = ({ status, size = 'sm' }) => {
  // Detect dark mode using 'dark' class on html or body
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const checkDark = () => {
      setIsDark(
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark')
      );
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Get status configuration with dark mode support
  const getStatusConfig = () => {
    const config = STATUS_STYLES[status];
    let bgColor, textColor;
    if (!config) {
      bgColor = isDark ? 'bg-gray-700' : 'bg-gray-100';
      textColor = isDark ? 'text-gray-200' : 'text-gray-800';
      return {
        bgColor,
        textColor,
        label: 'Unknown',
        icon: null
      };
    }
    // Custom color for each status
    switch (status) {
      case ASSESSMENT_STATUS.DRAFT:
        bgColor = isDark ? 'bg-gray-800' : 'bg-gray-100';
        textColor = isDark ? 'text-gray-200' : 'text-gray-800';
        break;
      case ASSESSMENT_STATUS.IN_PROGRESS:
        bgColor = isDark ? 'bg-blue-900' : 'bg-blue-100';
        textColor = isDark ? 'text-blue-200' : 'text-blue-800';
        break;
      case ASSESSMENT_STATUS.DONE:
        bgColor = isDark ? 'bg-green-900' : 'bg-green-100';
        textColor = isDark ? 'text-green-200' : 'text-green-800';
        break;
      default:
        bgColor = isDark ? 'bg-gray-700' : 'bg-gray-100';
        textColor = isDark ? 'text-gray-200' : 'text-gray-800';
    }
    // Add icons based on status
    let icon = null;
    switch (status) {
      case ASSESSMENT_STATUS.DRAFT:
        icon = <Edit className="w-3 h-3 mr-1" />;
        break;
      case ASSESSMENT_STATUS.IN_PROGRESS:
        icon = <Users className="w-3 h-3 mr-1" />;
        break;
      case ASSESSMENT_STATUS.DONE:
        icon = <CheckCircle className="w-3 h-3 mr-1" />;
        break;
      default:
        icon = null;
    }
    return { ...config, bgColor, textColor, icon };
  };

  const statusConfig = getStatusConfig();

  // Determine badge color based on status
  const getBadgeColor = () => {
    switch (status) {
      case ASSESSMENT_STATUS.DRAFT:
        return 'gray';
      case ASSESSMENT_STATUS.IN_PROGRESS:
        return 'blue';
      case ASSESSMENT_STATUS.DONE:
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Badge
      color={getBadgeColor()}
      size={size}
      className="w-fit"
    >
      <div
        className={`flex items-center transition-colors duration-200`}
        data-testid="assessment-status-badge"
      >
        {statusConfig.icon && <span className="mr-1">{statusConfig.icon}</span>}
        <span className="capitalize">{statusConfig.label}</span>
      </div>
    </Badge>
  );
};

export default AssessmentStatusBadge;
