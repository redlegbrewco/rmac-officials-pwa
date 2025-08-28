import React, { useState } from 'react';

interface IntelligenceFormProps {
  onSubmit: (data: { type: string; details: string }) => void;
  onCancel: () => void;
}

export function IntelligenceForm({ onSubmit, onCancel }: IntelligenceFormProps) {
  const [type, setType] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !details.trim()) {
      // Form validation - user can see required fields  
      return;
    }
    onSubmit({ 
      type, 
      details: details.trim()
    });
  };

  const intelligenceTypes = [
    'Player Tendency',
    'Coach Behavior', 
    'Team Pattern',
    'Equipment Issue',
    'Weather/Field Condition',
    'Other Observation'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white font-medium mb-2">Intelligence Type *</label>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          required
        >
          <option value="">Select Type</option>
          {intelligenceTypes.map(intelligenceType => (
            <option key={intelligenceType} value={intelligenceType}>{intelligenceType}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Intelligence Details *</label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Describe what you observed that other crews should know about..."
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          rows={4}
          required
        />
      </div>

      <div className="text-sm text-gray-400">
        <p>This intelligence will be shared with all RMAC crews to help improve officiating consistency and awareness.</p>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-medium"
        >
          Share Intelligence
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
