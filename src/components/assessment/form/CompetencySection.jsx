import React from 'react';
import { Accordion, Table, TableHead, TableHeadCell, TableRow, TableBody, TableCell, AccordionPanel, AccordionTitle, AccordionContent } from 'flowbite-react';
import Input from '../../ui/forms/Input';

const CompetencySection = ({ competency, responses, onChange, disabled }) => {
  const handleScoreChange = (indicatorId, e) => {
    const value = e.target.value;
    let numericValue = value === '' ? null : parseInt(value);
    if (numericValue > 10) numericValue = 10;
    onChange(indicatorId, numericValue);
  };

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
                    <TableHeadCell className="min-w-96">Indikator</TableHeadCell>
                    <TableHeadCell className="w-32 text-center">Nilai</TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody className="divide-y">
                  {(competency.indicators || []).map((indicator, index) => {
                    const response = responses[indicator.id] || {};
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
                        <TableCell className="w-32">
                          <Input
                            type="number"
                            value={response.value || ''}
                            onChange={(e) => handleScoreChange(indicator.id, e)}
                            placeholder="0-10"
                            min="0"
                            max="10"
                            step="1"
                            disabled={disabled}
                            className="text-center"
                            size="sm"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {(!competency.indicators || competency.indicators.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
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