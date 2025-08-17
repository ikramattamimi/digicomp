import React from 'react';
import { Accordion, Table, TableHead, TableHeadCell, TableRow, TableBody, TableCell, AccordionPanel, AccordionTitle, AccordionContent } from 'flowbite-react';
import Input from '../../ui/forms/Input';

const CompetencySection = ({ competency, responses, supervisorResponses, onChange, mode, disabled }) => {
  const handleScoreChange = (indicatorId, e) => {
    const value = e.target.value;
    let numericValue = value === '' ? null : parseInt(value);
    if (numericValue > 5) numericValue = 5;
    onChange(indicatorId, numericValue);
  };

  // Determine which column is editable based on mode
  const isSelfMode = mode === 'self';
  // const isSupervisorMode = mode === 'supervisor';

  return (
    <div className="space-y-6">
      {/* Competency Assessment */}
      <Accordion className="border border-gray-200 dark:border-gray-700">
        <AccordionPanel>
          <AccordionTitle className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 py-4">
            <div className="flex justify-between items-center w-full">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">{competency.name}</h4>
                {competency.description && (
                  <p className="text-base text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{competency.description}</p>
                )}
              </div>
            </div>
          </AccordionTitle>
          <AccordionContent className="p-0">
            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow className="bg-gray-50 dark:bg-gray-700">
                    <TableHeadCell className="w-20 text-center text-base font-semibold py-4">No</TableHeadCell>
                    <TableHeadCell className="min-w-40 text-base font-semibold py-4">Sub Dimensi</TableHeadCell>
                    <TableHeadCell className="min-w-96 text-base font-semibold py-4">Indikator</TableHeadCell>
                    <TableHeadCell className="w-32 text-center text-base font-semibold py-4">
                      {isSelfMode ? 'Penilaian Anda' : 'Penilaian Personel'}
                    </TableHeadCell>
                    <TableHeadCell className="w-32 text-center text-base font-semibold py-4">
                      {isSelfMode ? 'Penilaian Atasan' : 'Penilaian Anda'}
                    </TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody className="divide-y">
                  {(competency.indicators || []).map((indicator, index) => {
                    const currentResponse = responses[indicator.id] || {};
                    const otherResponse = supervisorResponses[indicator.id] || {};
                    
                    return (
                      <TableRow key={indicator.id} className="bg-white dark:bg-gray-800">
                        <TableCell className="text-center text-lg font-medium text-gray-900 dark:text-white py-6">
                          {index + 1}
                        </TableCell>
                        <TableCell className="py-6">
                          <div>
                            <h5 className="text-base font-medium text-gray-900 dark:text-white leading-relaxed">
                              {indicator.name}
                            </h5>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          {indicator.statement_text && (
                            <p className="text-base font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                              {indicator.statement_text}
                            </p>
                          )}
                        </TableCell>
                        
                        {/* First Column - Editable for current mode */}
                        <TableCell className="py-6">
                          {isSelfMode ? (
                            // Self mode: User can edit their own assessment
                            <Input
                              type="number"
                              value={currentResponse.value || ''}
                              onChange={(e) => handleScoreChange(indicator.id, e)}
                              placeholder="1-5"
                              min="1"
                              max="5"
                              step="1"
                              disabled={disabled}
                              className="text-center text-lg h-12"
                              size="md"
                            />
                          ) : (
                            // Supervisor mode: Show self assessment as read-only
                            <div className="text-center">
                              {otherResponse.value ? (
                                <span className="inline-flex items-center px-4 py-2 text-base font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                  {otherResponse.value}
                                </span>
                              ) : (
                                <span className="text-base text-gray-500 dark:text-gray-400">Belum dinilai</span>
                              )}
                            </div>
                          )}
                        </TableCell>

                        {/* Second Column - Different behavior based on mode */}
                        <TableCell className="py-6">
                          {isSelfMode ? (
                            // Self mode: Show supervisor assessment as read-only
                            <div className="text-center">
                              {otherResponse.value ? (
                                <span className="inline-flex items-center px-4 py-2 text-base font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
                                  {otherResponse.value}
                                </span>
                              ) : (
                                <span className="text-base text-gray-500 dark:text-gray-400">Belum dinilai</span>
                              )}
                            </div>
                          ) : (
                            // Supervisor mode: User can edit supervisor assessment
                            <Input
                              type="number"
                              value={currentResponse.value || ''}
                              onChange={(e) => handleScoreChange(indicator.id, e)}
                              placeholder="1-5"
                              min="1"
                              max="5"
                              step="1"
                              disabled={disabled}
                              className="text-center text-lg h-12"
                              size="md"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {(!competency.indicators || competency.indicators.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-base text-gray-500 dark:text-gray-400">
                        Tidak ada indikator untuk kompetensi ini
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden space-y-6 p-6">
              {(competency.indicators || []).map((indicator, index) => {
                const currentResponse = responses[indicator.id] || {};
                const otherResponse = supervisorResponses[indicator.id] || {};
                
                return (
                  <div key={indicator.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-5">
                    {/* Header */}
                    <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
                      <div className="flex items-start space-x-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 text-base font-semibold text-black bg-white ring ring-gray-300 rounded-full flex-shrink-0">
                          {index + 1}
                        </span>
                        <h5 className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">
                          {indicator.name}
                        </h5>
                      </div>
                    </div>

                    {/* Statement */}
                    {indicator.statement_text && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-base font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                          {indicator.statement_text}
                        </p>
                      </div>
                    )}

                    {/* Assessment Scores */}
                    <div className="space-y-5">
                      {/* First Assessment */}
                      <div className="space-y-3">
                        <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                          {isSelfMode ? 'Penilaian Anda' : 'Penilaian Personel'}
                        </label>
                        {isSelfMode ? (
                          <Input
                            type="number"
                            value={currentResponse.value || ''}
                            onChange={(e) => handleScoreChange(indicator.id, e)}
                            placeholder="1-5"
                            min="1"
                            max="5"
                            step="1"
                            disabled={disabled}
                            className="text-center w-full text-lg h-12"
                            size="md"
                          />
                        ) : (
                          <div className="text-center py-3">
                            {otherResponse.value ? (
                              <span className="inline-flex items-center px-4 py-2 text-base font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                {otherResponse.value}
                              </span>
                            ) : (
                              <span className="text-base text-gray-500 dark:text-gray-400">Belum dinilai</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Second Assessment */}
                      <div className="space-y-3">
                        <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                          {isSelfMode ? 'Penilaian Atasan' : 'Penilaian Anda'}
                        </label>
                        {isSelfMode ? (
                          <div className="text-center py-3">
                            {otherResponse.value ? (
                              <span className="inline-flex items-center px-4 py-2 text-base font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
                                {otherResponse.value}
                              </span>
                            ) : (
                              <span className="text-base text-gray-500 dark:text-gray-400">Belum dinilai</span>
                            )}
                          </div>
                        ) : (
                          <Input
                            type="number"
                            value={currentResponse.value || ''}
                            onChange={(e) => handleScoreChange(indicator.id, e)}
                            placeholder="1-5"
                            min="1"
                            max="5"
                            step="1"
                            disabled={disabled}
                            className="text-center w-full text-lg h-12"
                            size="md"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {(!competency.indicators || competency.indicators.length === 0) && (
                <div className="text-center py-12 text-base text-gray-500 dark:text-gray-400">
                  Tidak ada indikator untuk kompetensi ini
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>
  );
};

export default CompetencySection;