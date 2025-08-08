// Enhanced Error Alert Component - Multiple variants for different error contexts
// Features: different types, auto-dismiss, retry actions, and detailed error handling

import React, { useState, useEffect } from 'react';
import { Alert, Button } from 'flowbite-react';
import { 
  AlertCircle, 
  X, 
  XCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const ErrorAlert = ({ 
  message,
  title,
  type = "error",
  variant = "default",
  onClose,
  onRetry,
  autoCloseTimeout,
  dismissible = true,
  showRetry = false,
  retryText = "Try Again",
  details,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-close functionality
  useEffect(() => {
    if (autoCloseTimeout && autoCloseTimeout > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoCloseTimeout);

      return () => clearTimeout(timer);
    }
  }, [autoCloseTimeout, onClose]);

  // Type configurations
  const typeConfig = {
    error: {
      color: "failure",
      icon: XCircle,
      iconColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      textColor: "text-red-800 dark:text-red-300"
    },
    warning: {
      color: "warning",
      icon: AlertTriangle,
      iconColor: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      textColor: "text-yellow-800 dark:text-yellow-300"
    },
    info: {
      color: "info",
      icon: Info,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      textColor: "text-blue-800 dark:text-blue-300"
    },
    success: {
      color: "success",
      icon: CheckCircle,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      textColor: "text-green-800 dark:text-green-300"
    }
  };

  const config = typeConfig[type] || typeConfig.error;
  const IconComponent = config.icon;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleRetry = () => {
    setIsVisible(false);
    onRetry?.();
  };

  const handleCopyDetails = async () => {
    if (details) {
      try {
        await navigator.clipboard.writeText(
          typeof details === 'string' ? details : JSON.stringify(details, null, 2)
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy details:', err);
      }
    }
  };

  if (!isVisible) return null;

  // Flowbite Alert variant
  if (variant === "flowbite") {
    return (
      <Alert
        color={config.color}
        onDismiss={dismissible ? handleClose : undefined}
        className={className}
      >
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <IconComponent className="w-5 h-5 mr-2" />
            <div className="flex-1">
              {title && <h4 className="font-medium">{title}</h4>}
              <p className={title ? "text-sm mt-1" : ""}>{message}</p>
            </div>
          </div>
          
          {(showRetry || details) && (
            <div className="flex items-center gap-2">
              {showRetry && (
                <Button
                  size="xs"
                  color={config.color}
                  onClick={handleRetry}
                  className="flex items-center"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  {retryText}
                </Button>
              )}
              
              {details && (
                <Button
                  size="xs"
                  color="gray"
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center"
                >
                  {showDetails ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" />
                      Show Details
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
          
          {showDetails && details && (
            <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded border">
              <div className="flex justify-between items-start mb-2">
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Error Details
                </h5>
                <Button
                  size="xs"
                  color="gray"
                  onClick={handleCopyDetails}
                  className="flex items-center"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-auto max-h-32">
                {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Alert>
    );
  }

  // Custom variant
  return (
    <div className={`
      ${config.bgColor} 
      ${config.borderColor} 
      border rounded-lg p-4 mb-4
      ${className}
    `}>
      <div className="flex items-start">
        <IconComponent className={`h-5 w-5 ${config.iconColor} mt-0.5 mr-3 flex-shrink-0`} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-medium ${config.textColor} mb-1`}>
              {title}
            </h4>
          )}
          <p className={`${config.textColor} text-sm`}>
            {message}
          </p>
          
          {(showRetry || details) && (
            <div className="flex items-center gap-2 mt-3">
              {showRetry && (
                <button
                  onClick={handleRetry}
                  className={`
                    inline-flex items-center px-3 py-1 rounded text-xs font-medium
                    ${config.textColor} border ${config.borderColor}
                    hover:bg-opacity-80 transition-colors
                  `}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  {retryText}
                </button>
              )}
              
              {details && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className={`
                    inline-flex items-center px-3 py-1 rounded text-xs font-medium
                    ${config.textColor} border ${config.borderColor}
                    hover:bg-opacity-80 transition-colors
                  `}
                >
                  {showDetails ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" />
                      Show Details
                    </>
                  )}
                </button>
              )}
            </div>
          )}
          
          {showDetails && details && (
            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Error Details
                </h5>
                <button
                  onClick={handleCopyDetails}
                  className="inline-flex items-center px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-auto max-h-32">
                {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {dismissible && (
          <button
            onClick={handleClose}
            className={`ml-3 ${config.iconColor} hover:opacity-80 flex-shrink-0`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Pre-configured alert variants for common use cases
export const ApiErrorAlert = ({ error, onRetry, ...props }) => (
  <ErrorAlert
    type="error"
    title="API Error"
    message={error?.message || "An unexpected error occurred"}
    details={error?.details || error?.stack}
    showRetry={!!onRetry}
    onRetry={onRetry}
    {...props}
  />
);

export const ValidationErrorAlert = ({ errors, ...props }) => {
  const message = Array.isArray(errors) 
    ? errors.join(', ')
    : typeof errors === 'string' 
      ? errors 
      : "Please check your input and try again";
      
  return (
    <ErrorAlert
      type="warning"
      title="Validation Error"
      message={message}
      details={Array.isArray(errors) ? errors : undefined}
      {...props}
    />
  );
};

export const NetworkErrorAlert = ({ onRetry, ...props }) => (
  <ErrorAlert
    type="error"
    title="Network Error"
    message="Unable to connect to the server. Please check your internet connection."
    showRetry={!!onRetry}
    onRetry={onRetry}
    retryText="Retry Connection"
    {...props}
  />
);

export const SuccessAlert = ({ message, ...props }) => (
  <ErrorAlert
    type="success"
    message={message}
    autoCloseTimeout={5000}
    {...props}
  />
);

export const WarningAlert = ({ message, ...props }) => (
  <ErrorAlert
    type="warning"
    message={message}
    {...props}
  />
);

export const InfoAlert = ({ message, ...props }) => (
  <ErrorAlert
    type="info"
    message={message}
    {...props}
  />
);

export default ErrorAlert;