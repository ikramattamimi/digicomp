import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader.jsx';
import AssessmentFormContainer from '../components/assessment/form/AssessmentFormContainer';
import { Card, Button, Badge, Spinner, Alert } from 'flowbite-react';
import { Home, ClipboardCheck } from 'lucide-react';
import ProfileService from '../services/ProfileService';
import AuthService from '../services/AuthService';
import { useUserContext } from '../contexts/UserContext.js';

const SelfAssessmentFormPage = () => {
  const { id } = useParams();
  const { state } = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [supervisor, setSupervisor] = useState(null);

  const currentUser = useUserContext();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        if (!currentUser) {
          throw new Error('User not authenticated'); 
        }

        // Load participant data (current user's profile)
        const participantData = await ProfileService.getMyAccount(currentUser.id);
        setParticipant(participantData);

        // Load supervisor data
        if (participantData) {
          const supervisorData = await ProfileService.getSupervisor(participantData.id);
          setSupervisor(supervisorData);
        }
      } catch (err) {
        setError(err?.message || 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const InfoRow = ({ label, value }) => (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</span>
      <span className="text-base text-gray-900 dark:text-white">{value ?? '-'}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="page">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
            <span className="ml-3 text-base">Memuat data...</span>
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
            { label: 'Pengisian Nilai' }
          ]}
          title={`Pengisian Nilai`}
          showExportButton={false}
        />

        {error && (
          <Alert color="failure" className="mb-6 text-base" onDismiss={() => setError(null)}>
            {error} 
          </Alert>
        )}

        {/* Informasi Personel & Supervisor */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 my-6">
          <div className="space-y-8 p-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informasi Personel
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoRow label="Nama Personel" value={participant?.name} />
                <InfoRow 
                  label="Sub Direktorat" 
                  value={participant?.subdirectorats?.name || participant?.subdirektorat_name} 
                />
              </div>
            </div>

            {supervisor && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Informasi Atasan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InfoRow label="Nama Atasan" value={supervisor?.name} />
                  <InfoRow 
                    label="Sub Direktorat" 
                    value={supervisor?.subdirectorats?.name || supervisor?.subdirectorat_name} 
                  />
                </div>
              </div>
            )}

            {!supervisor && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center py-6">
                  <p className="text-base text-gray-500 dark:text-gray-400">
                    Tidak ada supervisor yang ditetapkan
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Form penilaian (accordion/section akan diatur oleh container) */}
        {/* <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"> */}
          <AssessmentFormContainer assessmentId={id} mode="self" subjectProfileId={participant.id} />
        {/* </Card> */}

      </div>
    </div>
  );
};

export default SelfAssessmentFormPage;