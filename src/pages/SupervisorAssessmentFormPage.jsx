import React from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader.jsx';
import AssessmentFormContainer from '../components/assessment/form/AssessmentFormContainer';

const SupervisorAssessmentFormPage = () => {
  const { id, subjectId } = useParams();
  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          breadcrumbs={[
            { label: 'Dashboard', href: '/', icon: null },
            { label: 'Penilaian', href: '/penilaian', icon: null },
          ]}
          title="Supervisor Assessment"
        />
        <AssessmentFormContainer
          assessmentId={id}
          subjectProfileId={subjectId}
          mode="supervisor"
        />
      </div>
    </div>
  );
};

export default SupervisorAssessmentFormPage;