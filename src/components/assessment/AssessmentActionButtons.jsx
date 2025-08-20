import React from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from "flowbite-react";
import {
  Eye,
  Edit,
  Users,
  Play,
  CheckCircle,
  MoreHorizontal,
} from "lucide-react";
import { ASSESSMENT_STATUS } from "../../constants/assessmentConstants";

const AdminActionButtons = ({
  assessment,
  onDelete,
  onPublish,
  onComplete,
}) => {
  // Check if assessment can be published
  const canPublish = (assessment) => {
    return assessment.status === ASSESSMENT_STATUS.DRAFT;
  };

  // Check if assessment can be completed
  const canComplete = (assessment) => {
    return assessment.status === ASSESSMENT_STATUS.IN_PROGRESS;
  };

  return (
    <>
      <Link to={`/penilaian/${assessment.id}`}>
        <Button
          size="xs"
          color="gray"
          className="flex items-center gap-1"
          title="View Details"
        >
          <Eye className="w-3 h-3" />
        </Button>
      </Link>
      
      {assessment.status === ASSESSMENT_STATUS.DRAFT && (
        <Link to={`/penilaian/${assessment.id}/edit`}>
          <Button
            size="xs"
            color="blue"
            className="flex items-center gap-1"
            title="Edit Assessment"
          >
            <Edit className="w-3 h-3" />
          </Button>
        </Link>
      )}
      <Dropdown
        label=""
        dismissOnClick={false}
        renderTrigger={() => (
          <Button
            size="xs"
            color="gray"
            className="flex items-center gap-1"
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        )}
      >
        {canPublish(assessment) && (
          <DropdownItem
            icon={Play}
            onClick={() => onPublish?.(assessment)}
          >
            Publish Assessment
          </DropdownItem>
        )}

        {canComplete(assessment) && (
          <DropdownItem
            icon={CheckCircle}
            onClick={() => onComplete?.(assessment)}
          >
            Complete Assessment
          </DropdownItem>
        )}

        {assessment.status === ASSESSMENT_STATUS.DONE && (
          <DropdownItem icon={Eye}>
            <Link to={`/penilaian/${assessment.id}/reports`}>
              View Reports
            </Link>
          </DropdownItem>
        )}

        <DropdownDivider />

        <DropdownItem
          color="red"
          onClick={() => onDelete?.(assessment)}
        >
          Delete Assessment
        </DropdownItem>
      </Dropdown>
    </>
  );
};

export const SubordinateActionButtons = ({
  assessment
}) => {

  return (
    <>
      <Link to={`/penilaian/${assessment.id}`}>
        <Button
          size="xs"
          color="gray"
          className="flex items-center gap-1"
          title="View Details"
        >
          <Eye className="w-3 h-3" />
        </Button>
      </Link>
      
      {assessment.status === ASSESSMENT_STATUS.DRAFT && (
        <Link to={`/penilaian/${assessment.id}/edit`}>
          <Button
            size="xs"
            color="blue"
            className="flex items-center gap-1"
            title="Edit Assessment"
          >
            <Edit className="w-3 h-3" />
          </Button>
        </Link>
      )}

      <Link to={`/penilaian/${assessment.id}/participants`}>
        <Button
          size="xs"
          color="gray"
          className="flex items-center gap-1"
          title="Manage Participants"
        >
          <Users className="w-3 h-3" />
        </Button>
      </Link>

      <Dropdown
        label=""
        dismissOnClick={false}
        renderTrigger={() => (
          <Button
            size="xs"
            color="gray"
            className="flex items-center gap-1"
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        )}
      >
        {canPublish(assessment) && (
          <DropdownItem
            icon={Play}
            onClick={() => onPublish?.(assessment)}
          >
            Publish Assessment
          </DropdownItem>
        )}

        {canComplete(assessment) && (
          <DropdownItem
            icon={CheckCircle}
            onClick={() => onComplete?.(assessment)}
          >
            Complete Assessment
          </DropdownItem>
        )}

        {assessment.status === ASSESSMENT_STATUS.DONE && (
          <DropdownItem icon={Eye}>
            <Link to={`/penilaian/${assessment.id}/reports`}>
              View Reports
            </Link>
          </DropdownItem>
        )}

        <DropdownDivider />

        <DropdownItem
          color="red"
          onClick={() => onDelete?.(assessment)}
        >
          Delete Assessment
        </DropdownItem>
      </Dropdown>
    </>
  );
};

export default AdminActionButtons;