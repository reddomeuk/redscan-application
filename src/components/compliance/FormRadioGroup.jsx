import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const FormRadioGroup = ({ 
  name, 
  value, 
  onChange, 
  options = ['Yes', 'No', 'Partially', 'Not applicable'],
  disabledReason,
  helpText,
  requiresNote = false,
  note = '',
  onNoteChange
}) => {
  const needsNote = (value === 'No' || value === 'Partially' || value === 'Not applicable') && requiresNote;
  
  return (
    <div className="space-y-3">
      <div 
        role="radiogroup" 
        aria-labelledby={`${name}-label`}
        className="flex gap-6 flex-wrap"
      >
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value)}
              disabled={!!disabledReason}
              className="w-4 h-4 text-[#B00020] border-slate-300 focus:ring-[#B00020] focus:ring-2"
            />
            <span className={`text-sm ${disabledReason ? 'text-slate-400' : 'text-white'}`}>
              {option}
            </span>
          </label>
        ))}
      </div>
      
      {disabledReason && (
        <p className="text-xs text-slate-400 italic">{disabledReason}</p>
      )}
      
      {helpText && (
        <p className="text-xs text-slate-400">{helpText}</p>
      )}
      
      {needsNote && (
        <div className="mt-3">
          <Label htmlFor={`${name}-note`} className="text-xs text-slate-300 mb-1 block">
            {value === 'Not applicable' ? 'Why is this not applicable?' : 'Please explain:'}
          </Label>
          <Textarea
            id={`${name}-note`}
            value={note}
            onChange={(e) => onNoteChange?.(e.target.value)}
            placeholder={value === 'Not applicable' ? 
              'Explain why this control is not in scope...' : 
              'Describe the current state and what needs to be improved...'
            }
            className="bg-slate-900/50 border-slate-700 text-white"
            rows={2}
          />
        </div>
      )}
    </div>
  );
};

export default FormRadioGroup;