import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader.jsx';
import AssessmentFormContainer from '../components/assessment/form/AssessmentFormContainer';
import { Card, Button, Badge, Spinner, Alert } from 'flowbite-react';
import { Home, ClipboardCheck, Users } from 'lucide-react';
import ProfileService from '../services/ProfileService';
import AuthService from '../services/AuthService';
import { useUserContext } from '../contexts/UserContext.js';

const SupervisorAssessmentFormPage = () => {
  const { id, subjectId } = useParams();
  const { state } = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subject, setSubject] = useState(null);
  const [supervisor, setSupervisor] = useState(null);

  const currentUser = useUserContext();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user (supervisor)
        if (!currentUser) {
          throw new Error('User not authenticated'); 
        }

        // Load supervisor data (current user's profile)
        const supervisorData = await ProfileService.getMyAccount(currentUser.id);
        setSupervisor(supervisorData);

        // Load subject data (person being assessed)
        if (subjectId) {
          const subjectData = await ProfileService.getById(subjectId);
          setSubject(subjectData);
          console.log(subjectData)
        }
      } catch (err) {
        setError(err?.message || 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [subjectId]);

  const InfoRow = ({ label, value }) => (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 dark:text-white">{value ?? '-'}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="page">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
            <span className="ml-2">Memuat data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          breadcrumbs={[
            { label: 'Dashboard', href: '/', icon: Home },
            { label: 'Penilaian', href: '/penilaian', icon: ClipboardCheck },
            { label: 'Penilaian Atasan' }
          ]}
          title={`Penilaian Atasan`}
          subtitle={subject ? `Menilai: ${subject.name}` : 'Penilaian Supervisor'}
          customActions={[
            {
              type: 'button',
              label: 'Penilaian Atasan',
              icon: Users,
              color: 'blue',
              onClick: () => {},
              disabled: true
            }
          ]}
          showExportButton={false}
        />

        {error && (
          <Alert color="failure" className="mb-6" onDismiss={() => setError(null)}>
            {error} 
          </Alert>
        )}

        {/* Informasi Supervisor & Subject */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 my-6">
          <div className="space-y-6">
            {/* Subject Information */}
            {subject && (
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Informasi Personel yang Dinilai
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <InfoRow label="Nama Personel" value={subject?.name} />
                  <InfoRow label="NRP" value={subject?.nrp} />
                  <InfoRow label="Posisi" value={subject?.position} />
                  <InfoRow 
                    label="Sub Direktorat" 
                    value={subject?.subdirectorats?.name || subject?.subdirectorat_name} 
                  />
                </div>
              </div>
            )}

            {/* Supervisor Information */}
            {supervisor && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Informasi Penilai (Atasan)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <InfoRow label="Nama Atasan" value={supervisor?.name} />
                  <InfoRow label="NRP" value={supervisor?.nrp} />
                  <InfoRow label="Posisi" value={supervisor?.position} />
                  <InfoRow 
                    label="Sub Direktorat" 
                    value={supervisor?.subdirectorats?.name || supervisor?.subdirectorat_name} 
                  />
                </div>
              </div>
            )}

            {!subject && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Data personel yang dinilai tidak ditemukan
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Form penilaian (accordion/section akan diatur oleh container) */}
        {subject && (
          <AssessmentFormContainer
            assessmentId={id}
            subjectProfileId={subjectId}
            mode="supervisor"
          />
        )}
      </div>
    </div>
  );
};

export default SupervisorAssessmentFormPage;