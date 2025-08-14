// Assessment Header Component - Reusable header component for assessment pages
// Features: breadcrumbs, action buttons, stats, and responsive layout

import React from 'react';
import {
  Button,
  Breadcrumb,
  BreadcrumbItem,
  Badge,
  Dropdown,
  DropdownItem
} from 'flowbite-react';
import {
  Plus,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Home,
  ChevronRight,
  FileText,
  Users,
  Target,
  Calendar,
  Settings,
  Play,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PageHeader = ({
  // Page Configuration
  title,
  subtitle,
  breadcrumbs = [],
  
  // Action Buttons
  showCreateButton = false,
  createButtonText = "Create Assessment",
  onCreateClick,
  
  showFilterButton = false,
  onFilterClick,
  
  showExportButton = false,
  onExportClick,
  
  showImportButton = false,
  onImportClick,
  
  // Additional Actions
  customActions = [],
  
  // Statistics
  stats = [],
  
  // Status Badge
  status,
  statusConfig,
  
  // Loading State
  loading = false,
  
  // Permissions
  canCreate = true,
  canExport = true,
  canImport = true
}) => {
  // Default breadcrumb if none provided
  const defaultBreadcrumbs = [
    { label: 'Dashboard', href: '/', icon: Home },
    { label: 'Penilaian', href: '/penilaian', icon: FileText }
  ];

  const finalBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs;

  // Render breadcrumb item
  const renderBreadcrumbItem = (breadcrumb, isLast) => {
    const IconComponent = breadcrumb.icon;

    return (
      <BreadcrumbItem
        key={breadcrumb.href || breadcrumb.label}
        className={isLast ? 'text-gray-500 dark:text-gray-400' : ''}
      >
        <div className="flex items-center">
          {IconComponent && <IconComponent className="w-4 h-4 mr-1" />}
          {!isLast && breadcrumb.href ? (
            <Link to={breadcrumb.href} className="hover:underline">
              {breadcrumb.label}
            </Link>
          ) : (
            breadcrumb.label
          )}
        </div>
      </BreadcrumbItem>
    );
  };

  // Render action buttons
  const renderActionButtons = () => {
    const buttons = [];

    // Create Button
    if (showCreateButton && canCreate) {
      buttons.push(
        <Button
          key="create"
          onClick={onCreateClick}
          disabled={loading}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          {createButtonText}
        </Button>
      );
    }

    // Filter Button
    if (showFilterButton) {
      buttons.push(
        <Button
          key="filter"
          color="gray"
          onClick={onFilterClick}
          disabled={loading}
          className="flex items-center"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      );
    }

    // Export Button
    if (showExportButton && canExport) {
      buttons.push(
        <Button
          key="export"
          color="gray"
          onClick={onExportClick}
          disabled={loading}
          className="flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      );
    }

    // Import Button
    if (showImportButton && canImport) {
      buttons.push(
        <Button
          key="import"
          color="gray"
          onClick={onImportClick}
          disabled={loading}
          className="flex items-center"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>
      );
    }

    // Custom Actions
    customActions.forEach((action, index) => {
      if (action.type === 'button') {
        buttons.push(
          <Button
            key={`custom-${index}`}
            color={action.color || 'gray'}
            onClick={action.onClick}
            disabled={loading || action.disabled}
            className="flex items-center"
          >
            {action.icon && <action.icon className="w-4 h-4 mr-2" />}
            {action.label}
          </Button>
        );
      }
    });

    return buttons;
  };

  // Render dropdown actions (for mobile responsiveness)
  const renderDropdownActions = () => {
    const actions = [];

    if (showFilterButton) {
      actions.push({
        label: 'Filter',
        icon: Filter,
        onClick: onFilterClick
      });
    }

    if (showExportButton && canExport) {
      actions.push({
        label: 'Export',
        icon: Download,
        onClick: onExportClick
      });
    }

    if (showImportButton && canImport) {
      actions.push({
        label: 'Import',
        icon: Upload,
        onClick: onImportClick
      });
    }

    // Add custom dropdown actions
    customActions
      .filter(action => action.type === 'dropdown')
      .forEach(action => {
        actions.push(action);
      });

    if (actions.length === 0) return null;

    return (
      <Dropdown
        arrowIcon={false}
        inline
        label={
          <Button color="gray" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        }
      >
        {actions.map((action, index) => (
          <DropdownItem
            key={index}
            icon={action.icon}
            onClick={action.onClick}
            disabled={loading || action.disabled}
            className={action.className}
          >
            {action.label}
          </DropdownItem>
        ))}
      </Dropdown>
    );
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <Breadcrumb>
        {finalBreadcrumbs.map((breadcrumb, index) => 
          renderBreadcrumbItem(breadcrumb, index === finalBreadcrumbs.length - 1)
        )}
      </Breadcrumb>

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            
            {/* Status Badge */}
            {status && statusConfig && (
              <Badge color={statusConfig.color} className="flex items-center gap-1">
                {statusConfig.icon && <statusConfig.icon className="w-3 h-3" />}
                {statusConfig.label || status}
              </Badge>
            )}
          </div>
          
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {renderActionButtons()}
          </div>
          
          {/* Mobile Create Button + Dropdown */}
          <div className="flex lg:hidden items-center gap-2">
            {showCreateButton && canCreate && (
              <Button
                onClick={onCreateClick}
                disabled={loading}
                size="sm"
                className="flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create
              </Button>
            )}
            {renderDropdownActions()}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`
                p-4 rounded-lg border
                ${stat.bgColor || 'bg-white dark:bg-gray-800'}
                ${stat.borderColor || 'border-gray-200 dark:border-gray-700'}
              `}
            >
              <div className="flex items-center">
                {stat.icon && (
                  <stat.icon 
                    className={`w-5 h-5 mr-3 ${stat.iconColor || 'text-gray-600 dark:text-gray-400'}`} 
                  />
                )}
                <div>
                  <p className={`text-sm ${stat.labelColor || 'text-gray-600 dark:text-gray-400'}`}>
                    {stat.label}
                  </p>
                  <p className={`text-lg font-semibold ${stat.valueColor || 'text-gray-900 dark:text-white'}`}>
                    {loading ? (
                      <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
              </div>
              
              {stat.change && (
                <div className={`text-xs mt-1 ${stat.changeColor || 'text-gray-500'}`}>
                  {stat.change}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Pre-configured header variants for common use cases
export const AssessmentListHeader = (props) => (
  <PageHeader
    title="Penilaian"
    subtitle="Kelola periode penilaian dan pantau progres"
    showCreateButton={true}
    showFilterButton={false}
    showExportButton={false}
    createButtonText="Buat Penilaian"
    stats={[
      {
        label: 'Total Penilaian',
        value: props.totalAssessments || 0,
        icon: FileText,
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        iconColor: 'text-blue-600 dark:text-blue-400',
        labelColor: 'text-blue-600 dark:text-blue-400',
        valueColor: 'text-blue-900 dark:text-blue-300'
      },
      {
        label: 'Aktif',
        value: props.activeAssessments || 0,
        icon: Target,
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        iconColor: 'text-green-600 dark:text-green-400',
        labelColor: 'text-green-600 dark:text-green-400',
        valueColor: 'text-green-900 dark:text-green-300'
      },
      {
        label: 'Peserta',
        value: props.totalParticipants || 0,
        icon: Users,
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        borderColor: 'border-purple-200 dark:border-purple-800',
        iconColor: 'text-purple-600 dark:text-purple-400',
        labelColor: 'text-purple-600 dark:text-purple-400',
        valueColor: 'text-purple-900 dark:text-purple-300'
      },
      {
        label: 'Segera Berakhir',
        value: props.dueSoon || 0,
        icon: Calendar,
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        labelColor: 'text-yellow-600 dark:text-yellow-400',
        valueColor: 'text-yellow-900 dark:text-yellow-300'
      }
    ]}
    {...props}
  />
);

// Staff-specific header variant
export const StaffAssessmentListHeader = (props) => (
  <PageHeader
    breadcrumbs={[
      { label: 'Dashboard', href: '/', icon: Home },
      { label: 'Penilaian Saya', icon: FileText }
    ]}
    title="Penilaian Saya"
    subtitle="Lihat dan isi penilaian kompetensi yang ditugaskan kepada Anda"
    showCreateButton={false}
    showFilterButton={true}
    showExportButton={false}
    stats={[
      {
        label: 'Total Penilaian',
        value: props.totalAssessments || 0,
        icon: FileText,
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        iconColor: 'text-blue-600 dark:text-blue-400',
        labelColor: 'text-blue-600 dark:text-blue-400',
        valueColor: 'text-blue-900 dark:text-blue-300'
      },
      {
        label: 'Aktif',
        value: props.activeAssessments || 0,
        icon: Play,
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        iconColor: 'text-green-600 dark:text-green-400',
        labelColor: 'text-green-600 dark:text-green-400',
        valueColor: 'text-green-900 dark:text-green-300'
      },
      {
        label: 'Selesai',
        value: props.completedAssessments || 0,
        icon: CheckCircle,
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        borderColor: 'border-purple-200 dark:border-purple-800',
        iconColor: 'text-purple-600 dark:text-purple-400',
        labelColor: 'text-purple-600 dark:text-purple-400',
        valueColor: 'text-purple-900 dark:text-purple-300'
      },
      {
        label: 'Jatuh Tempo',
        value: props.dueSoon || 0,
        icon: Clock,
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        iconColor: 'text-orange-600 dark:text-orange-400',
        labelColor: 'text-orange-600 dark:text-orange-400',
        valueColor: 'text-orange-900 dark:text-orange-300'
      }
    ]}
    {...props}
  />
);

export const AssessmentDetailHeader = (props) => (
  <PageHeader
    breadcrumbs={[
      { label: 'Dashboard', href: '/', icon: Home },
      { label: 'Penilaian', href: '/penilaian', icon: FileText },
      { label: props.assessmentTitle || 'Detail Penilaian', icon: Settings }
    ]}
    title={props.assessmentTitle || 'Detail Penilaian'}
    subtitle={props.assessmentSubtitle}
    status={props.status}
    statusConfig={props.statusConfig}
    showExportButton={false}
    customActions={[
      {
        type: 'button',
        label: 'Edit',
        icon: Settings,
        onClick: props.onEdit,
        disabled: props.status === 'completed'
      }
    ]}
    {...props}
  />
);

export const AssessmentCreateHeader = (props) => (
  <PageHeader
    breadcrumbs={[
      { label: 'Dashboard', href: '/', icon: Home },
      { label: 'Penilaian', href: '/penilaian', icon: FileText },
      { label: 'Buat Penilaian', icon: Settings }
    ]}
    title='Buat Penilaian'
    subtitle='Buat penilaian baru untuk tim Anda'
    showExportButton={false}
    {...props}
  />
);

export const AssessmentEditHeader = (props) => (
  <PageHeader
    breadcrumbs={[
      { label: 'Dashboard', href: '/', icon: Home },
      { label: 'Penilaian', href: '/penilaian', icon: FileText },
      { label: props.assessmentTitle || 'Edit Penilaian', icon: Settings }
    ]}
    title='Edit Penilaian'
    subtitle='Ubah detail penilaian dan kompetensi'
    showExportButton={false}
    {...props}
  />
);

export default PageHeader;
