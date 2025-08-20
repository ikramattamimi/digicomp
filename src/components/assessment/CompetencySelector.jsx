// Competency Selector Component - Multi-select component for choosing competencies
// Features: search, select all, visual indicators, and validation

import React, { useState } from 'react';
import {
  Card,
  TextInput,
  Checkbox,
  Button,
  Badge,
  Alert
} from 'flowbite-react';
import {
  Search,
  Award,
  CheckCircle2,
  Circle,
  X,
  Plus
} from 'lucide-react';

const CompetencySelector = ({
  availableCompetencies = [],
  selectedCompetencies = [],
  onChange,
  error = null,
  disabled = false,
  maxSelections = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter competencies based on search term
  const filteredCompetencies = availableCompetencies.filter(competency =>
    competency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (competency.description && competency.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Check if competency is selected
  const isSelected = (competency) => {
    return selectedCompetencies.some(selected => selected.id === competency.id);
  };

  // Handle individual competency selection
  const handleCompetencyToggle = (competency) => {
    if (disabled) return;

    let updated = [...selectedCompetencies];

    if (isSelected(competency)) {
      // Remove from selection
      updated = updated.filter(selected => selected.id !== competency.id);
    } else {
      // Check max selection limit
      if (maxSelections && updated.length >= maxSelections) {
        return; // Don't add if max reached
      }
      // Add to selection
      updated.push(competency);
    }

    onChange(updated);
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    if (disabled) return;

    if (selectedCompetencies.length === filteredCompetencies.length) {
      // Deselect all filtered
      const remainingSelected = selectedCompetencies.filter(selected =>
        !filteredCompetencies.some(filtered => filtered.id === selected.id)
      );
      onChange(remainingSelected);
    } else {
      // Select all filtered (respecting max limit)
      let newSelections = [...selectedCompetencies];
      
      filteredCompetencies.forEach(competency => {
        if (!isSelected(competency)) {
          if (!maxSelections || newSelections.length < maxSelections) {
            newSelections.push(competency);
          }
        }
      });
      
      onChange(newSelections);
    }
  };

  // Remove selected competency
  const handleRemoveCompetency = (competencyToRemove) => {
    if (disabled) return;

    const updated = selectedCompetencies.filter(
      competency => competency.id !== competencyToRemove.id
    );
    onChange(updated);
  };

  // Clear all selections
  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  // Check if all filtered competencies are selected
  const allFilteredSelected = filteredCompetencies.length > 0 &&
    filteredCompetencies.every(competency => isSelected(competency));

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="space-y-3">
        <TextInput
          icon={Search}
          placeholder="Cari kompetensi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={disabled}
        />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              size="xs"
              color="gray"
              onClick={handleSelectAll}
              disabled={disabled || filteredCompetencies.length === 0}
              className="flex items-center gap-1"
            >
              {allFilteredSelected ? (
                <>
                  <Circle className="w-3 h-3" />
                  Batalkan Pilih Semua
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Pilih Semua
                </>
              )}
            </Button>

            {selectedCompetencies.length > 0 && (
              <Button
                size="xs"
                color="gray"
                onClick={handleClearAll}
                disabled={disabled}
                className="flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Hapus Semua
              </Button>
            )}
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedCompetencies.length} dari {availableCompetencies.length} dipilih
            {maxSelections && (
              <span className="ml-1">(maks: {maxSelections})</span>
            )}
          </div>
        </div>
      </div>

      {/* Selected Competencies Display */}
      {selectedCompetencies.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 flex items-center">
              <Award className="w-4 h-4 mr-1" />
              Kompetensi Terpilih ({selectedCompetencies.length})
            </h4>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedCompetencies.map((competency) => (
              <Badge
                key={competency.id}
                color="blue"
                className="flex items-center gap-1 px-2 py-1"
              >
                <span>{competency.name}</span>
                {!disabled && (
                  <button
                    onClick={() => handleRemoveCompetency(competency)}
                    className="ml-1 hover:bg-blue-600 hover:text-white rounded-full p-0.5"
                    title="Remove competency"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert color="red">
          {error}
        </Alert>
      )}

      {/* Available Competencies List */}
      <div className="max-h-96 overflow-y-auto">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
            <Award className="w-4 h-4 mr-1" />
            Daftar Kompetensi ({filteredCompetencies.length})
          </h4>

          {filteredCompetencies.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm ? (
                <>
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Tidak ada kompetensi yang cocok dengan "{searchTerm}"</p>
                </>
              ) : (
                <>
                  <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Tidak ada kompetensi tersedia</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCompetencies.map((competency) => {
                const selected = isSelected(competency);
                const canSelect = !maxSelections || selectedCompetencies.length < maxSelections || selected;

                return (
                  <div
                    key={competency.id}
                    className={`
                      flex items-start p-3 rounded-lg border transition-all cursor-pointer
                      ${selected
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                      ${disabled || !canSelect ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={() => handleCompetencyToggle(competency)}
                  >
                    <Checkbox
                      checked={selected}
                      onChange={() => handleCompetencyToggle(competency)}
                      disabled={disabled || !canSelect}
                      className="mt-0.5 mr-3"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                          {competency.name}
                        </h5>
                        {selected && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      
                      {competency.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {competency.description}
                        </p>
                      )}

                      {/* Show indicator count if available */}
                      {competency.indicators && (
                        <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <Plus className="w-3 h-3 mr-1" />
                          {competency.indicators.length} indikator
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Max Selection Warning */}
      {maxSelections && selectedCompetencies.length >= maxSelections && (
        <Alert color="warning">
          <span className="font-medium">Batas pilihan tercapai!</span> Anda hanya dapat memilih hingga {maxSelections} kompetensi.
        </Alert>
      )}
    </div>
  );
};

export default CompetencySelector;
