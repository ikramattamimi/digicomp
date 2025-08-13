import React from 'react';
import { Label, Textarea } from 'flowbite-react';
import LikertScale from './LikertScale';

const IndicatorRating = ({ indicator, value, comment, onChange, disabled }) => {
  return (
    <div className="p-3 border rounded-lg bg-white dark:bg-gray-800">
      <div className="mb-2">
        <Label className="text-sm font-medium">{indicator.name}</Label>
        {indicator.statement_text && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{indicator.statement_text}</p>
        )}
      </div>

      <LikertScale
        name={`indicator-${indicator.id}`}
        value={value || null}
        onChange={(v) => onChange({ score: v, comment })}
        disabled={disabled}
      />

      <div className="mt-3">
        <Label className="text-sm">Catatan (opsional)</Label>
        <Textarea
          rows={2}
          placeholder="Tambahkan catatan..."
          value={comment || ''}
          onChange={(e) => onChange({ score: value, comment: e.target.value })}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default IndicatorRating;