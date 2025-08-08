// Enhanced Loading Spinner Component - Multiple variants for different contexts
// Features: different sizes, colors, and layouts for various use cases

import React from 'react';
import { Loader2, Clock, FileText, Users } from 'lucide-react';

const LoadingSpinner = ({ 
  message = "Loading...",
  size = "md",
  variant = "default",
  fullScreen = false,
  icon: CustomIcon,
  className = ""
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      spinner: "w-4 h-4",
      text: "text-xs",
      container: "min-h-[100px]"
    },
    md: {
      spinner: "w-8 h-8",
      text: "text-sm",
      container: "min-h-[200px]"
    },
    lg: {
      spinner: "w-12 h-12",
      text: "text-base",
      container: "min-h-[300px]"
    }
  };

  // Variant configurations
  const variantConfig = {
    default: {
      spinnerColor: "border-blue-600 border-t-transparent",
      textColor: "text-gray-600 dark:text-gray-400",
      bgColor: ""
    },
    light: {
      spinnerColor: "border-white border-t-transparent",
      textColor: "text-white",
      bgColor: ""
    },
    card: {
      spinnerColor: "border-blue-600 border-t-transparent",
      textColor: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
    },
    overlay: {
      spinnerColor: "border-white border-t-transparent",
      textColor: "text-white",
      bgColor: "bg-black bg-opacity-50"
    }
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  // Icon component selection
  const IconComponent = CustomIcon || Loader2;

  const containerClasses = `
    flex flex-col items-center justify-center p-6
    ${fullScreen ? 'fixed inset-0 z-50' : currentSize.container}
    ${currentVariant.bgColor}
    ${className}
  `;

  const spinnerClasses = `
    ${currentSize.spinner}
    border-4 rounded-full animate-spin mb-4
    ${currentVariant.spinnerColor}
  `;

  const textClasses = `
    ${currentSize.text}
    ${currentVariant.textColor}
    font-medium
  `;

  return (
    <div className={containerClasses}>
      {CustomIcon ? (
        <IconComponent className={`${currentSize.spinner} ${currentVariant.textColor} animate-pulse mb-4`} />
      ) : (
        <div className={spinnerClasses}></div>
      )}
      
      {message && (
        <p className={textClasses}>
          {message}
        </p>
      )}
    </div>
  );
};

// Pre-configured loading variants for specific contexts
export const TableLoadingSpinner = ({ message = "Loading data..." }) => (
  <LoadingSpinner
    message={message}
    size="sm"
    variant="default"
    className="py-8"
  />
);

export const PageLoadingSpinner = ({ message = "Loading page..." }) => (
  <LoadingSpinner
    message={message}
    size="lg"
    variant="default"
    fullScreen={true}
  />
);

export const CardLoadingSpinner = ({ message = "Loading..." }) => (
  <LoadingSpinner
    message={message}
    size="md"
    variant="card"
    className="m-4"
  />
);

export const OverlayLoadingSpinner = ({ message = "Processing..." }) => (
  <LoadingSpinner
    message={message}
    size="lg"
    variant="overlay"
    fullScreen={true}
  />
);

// Context-specific loading components
export const AssessmentLoadingSpinner = ({ message = "Loading assessments..." }) => (
  <LoadingSpinner
    message={message}
    size="md"
    variant="default"
    icon={FileText}
  />
);

export const ParticipantLoadingSpinner = ({ message = "Loading participants..." }) => (
  <LoadingSpinner
    message={message}
    size="md"
    variant="default"
    icon={Users}
  />
);

export const ProcessingLoadingSpinner = ({ message = "Processing request..." }) => (
  <LoadingSpinner
    message={message}
    size="md"
    variant="default"
    icon={Clock}
  />
);

export default LoadingSpinner;