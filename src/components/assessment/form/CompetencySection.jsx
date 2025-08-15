import React from 'react';
import { Accordion, Table, TableHead, TableHeadCell, TableRow, TableBody, TableCell, AccordionPanel, AccordionTitle, AccordionContent } from 'flowbite-react';
import Input from '../../ui/forms/Input';

const CompetencySection = ({ competency, responses, supervisorResponses, onChange, mode, disabled }) => {
  const handleScoreChange = (indicatorId, e) => {
    const value = e.target.value;
    let numericValue = value === '' ? null : parseInt(value);
    if (numericValue > 10) numericValue = 10;
    onChange(indicatorId, numericValue);
  };

  // Determine which column is editable based on mode
  const isSelfMode = mode === 'self';
  const isSupervisorMode = mode === 'supervisor';

  return (
    <div className="space-y-4">
      {/* Competency Assessment */}
      <Accordion className="border border-gray-200 dark:border-gray-700">
        <AccordionPanel>
          <AccordionTitle className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className="flex justify-between items-center w-full">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{competency.name}</h4>
                {competency.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{competency.description}</p>
                )}
              </div>
            </div>
          </AccordionTitle>
          <AccordionContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow className="bg-gray-50 dark:bg-gray-700">
                    <TableHeadCell className="w-16 text-center">No</TableHeadCell>
                    <TableHeadCell className="min-w-32">Sub Dimensi</TableHeadCell>
                    <TableHeadCell className="min-w-84">Indikator</TableHeadCell>
                    <TableHeadCell className="w-24 text-center">
                      {isSelfMode ? 'Penilaian Anda' : 'Penilaian Personel'}
                    </TableHeadCell>
                    <TableHeadCell className="w-24 text-center">
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
                        <TableCell className="text-center font-medium text-gray-900 dark:text-white">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                              {indicator.name}
                            </h5>
                          </div>
                        </TableCell>
                        <TableCell>
                          {indicator.statement_text && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {indicator.statement_text}
                            </p>
                          )}
                        </TableCell>
                        
                        {/* First Column - Editable for current mode */}
                        <TableCell>
                          {isSelfMode ? (
                            // Self mode: User can edit their own assessment
                            <Input
                              type="number"
                              value={currentResponse.value || ''}
                              onChange={(e) => handleScoreChange(indicator.id, e)}
                              placeholder="0-10"
                              min="0"
                              max="10"
                              step="1"
                              disabled={disabled}
                              className="text-center"
                              size="sm"
                            />
                          ) : (
                            // Supervisor mode: Show self assessment as read-only
                            <div className="text-center">
                              {otherResponse.value ? (
                                <span className="inline-flex items-center px-2 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                  {otherResponse.value}
                                </span>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">Belum dinilai</span>
                              )}
                            </div>
                          )}
                        </TableCell>

                        {/* Second Column - Different behavior based on mode */}
                        <TableCell>
                          {isSelfMode ? (
                            // Self mode: Show supervisor assessment as read-only
                            <div className="text-center">
                              {otherResponse.value ? (
                                <span className="inline-flex items-center px-2 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
                                  {otherResponse.value}
                                </span>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">Belum dinilai</span>
                              )}
                            </div>
                          ) : (
                            // Supervisor mode: User can edit supervisor assessment
                            <Input
                              type="number"
                              value={currentResponse.value || ''}
                              onChange={(e) => handleScoreChange(indicator.id, e)}
                              placeholder="0-10"
                              min="0"
                              max="10"
                              step="1"
                              disabled={disabled}
                              className="text-center"
                              size="sm"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {(!competency.indicators || competency.indicators.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Tidak ada indikator untuk kompetensi ini
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>
  );
};

export default CompetencySection;