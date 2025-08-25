import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Alert } from 'flowbite-react';
import { Home, FileText, ArrowLeft, User, Users } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { LoadingSpinner, ErrorAlert } from '../components/common';
import AssessmentService from '../services/AssessmentService';
import AssessmentResponseService from '../services/AssessmentResponseService';
import ProfileService from '../services/ProfileService';

const AssessmentResultPage = () => {
  const { id } = useParams(); // assessment ID
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get('subject');
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [subject, setSubject] = useState(null);
  const [selfResponse, setSelfResponse] = useState(null);
  const [supervisorResponse, setSupervisorResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load assessment details
        const assessmentData = await AssessmentService.getById(id);
        setAssessment(assessmentData);

        if (subjectId) {
          // Load subject profile
          const subjectData = await ProfileService.getById(subjectId);
          setSubject(subjectData);

          // Load self assessment response
          try {
            const selfData = await AssessmentResponseService.getByAssessmentAndAssessor({
              assessmentId: id,
              subjectProfileId: subjectId,
              assessorProfileId: subjectId
            });
            setSelfResponse(selfData);
          } catch (err) {
            console.error('No self assessment found', err);
          }

          // Load supervisor assessment response
          if (subjectData.supervisor_id) {
            try {
              const supervisorData = await AssessmentResponseService.getByAssessmentAndAssessor({
                assessmentId: id,
                subjectProfileId: subjectId,
                assessorProfileId: subjectData.supervisor_id
              });
              setSupervisorResponse(supervisorData);
            } catch (err) {
              console.error('No supervisor assessment found', err);
            }
          }
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat data hasil penilaian');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, subjectId]);

  const handleBack = () => {
    navigate(`/penilaian/${id}`);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner message="Memuat hasil penilaian..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="max-w-7xl mx-auto">
          <ErrorAlert message={error} />
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
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
            { label: 'Penilaian', href: '/penilaian', icon: FileText },
            { label: assessment?.name || 'Detail Penilaian', href: `/penilaian/${id}` },
            { label: 'Hasil Penilaian' }
          ]}
          title="Hasil Penilaian"
          subtitle={subject ? `Hasil penilaian untuk ${subject.name}` : 'Lihat hasil penilaian'}
          customActions={[
            {
              type: 'button',
              label: 'Kembali',
              icon: ArrowLeft,
              color: 'gray',
              onClick: handleBack,
            }
          ]}
          showExportButton={false}
        />

        {/* Subject Information */}
        {subject && (
          <Card className="mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {subject.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {subject.email} • {subject.position || 'Posisi tidak diketahui'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Assessment Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Self Assessment Results */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <User className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Penilaian Diri
              </h3>
            </div>

            {selfResponse ? (
              <div className="space-y-4">
                <Badge color="green" className="flex items-center gap-1 w-fit">
                  Status: {selfResponse.status === 'submitted' ? 'Selesai' : 'Draft'}
                </Badge>
                
                {selfResponse.responses && Object.keys(selfResponse.responses).length > 0 ? (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Jawaban:
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {Object.entries(selfResponse.responses).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Indikator {key}:
                          </span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {typeof value === 'object' ? value.value || value.score : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Belum ada jawaban
                  </p>
                )}
              </div>
            ) : (
              <Alert color="warning">
                Penilaian diri belum dikerjakan
              </Alert>
            )}
          </Card>

          {/* Supervisor Assessment Results */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Penilaian Atasan
              </h3>
            </div>

            {supervisorResponse ? (
              <div className="space-y-4">
                <Badge color="blue" className="flex items-center gap-1 w-fit">
                  Status: {supervisorResponse.status === 'submitted' ? 'Selesai' : 'Draft'}
                </Badge>
                
                {supervisorResponse.responses && Object.keys(supervisorResponse.responses).length > 0 ? (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Jawaban:
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {Object.entries(supervisorResponse.responses).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Indikator {key}:
                          </span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {typeof value === 'object' ? value.value || value.score : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Belum ada jawaban
                  </p>
                )}
              </div>
            ) : (
              <Alert color="warning">
                Penilaian atasan belum dikerjakan
              </Alert>
            )}
          </Card>
        </div>

        {/* Summary Card */}
        {(selfResponse || supervisorResponse) && (
          <Card className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ringkasan Penilaian
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selfResponse?.status === 'submitted' ? '✓' : '○'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Penilaian Diri
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {supervisorResponse?.status === 'submitted' ? '✓' : '○'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Penilaian Atasan
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(selfResponse?.status === 'submitted' && supervisorResponse?.status === 'submitted') ? '100%' : 
                   (selfResponse?.status === 'submitted' || supervisorResponse?.status === 'submitted') ? '50%' : '0%'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Progress Keseluruhan
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AssessmentResultPage;