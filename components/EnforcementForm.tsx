import React, { useState } from 'react';

interface EnforcementFormProps {
  onSubmit: (data: { type: string; player: string; details: string; quarter: string }) => void;
  onCancel: () => void;
}

export function EnforcementForm({ onSubmit, onCancel }: EnforcementFormProps) {
  const [type, setType] = useState('');
  const [player, setPlayer] = useState('');
  const [details, setDetails] = useState('');
  const [quarter, setQuarter] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !player || !quarter) {
      // Could use a toast here too, but alert is OK for forms
      return;
    }
    onSubmit({ type, player, details, quarter });
  };

  const enforcementTypes = [
    'Player Warning',
    'Player Ejection',
    'Coach Warning',
    'Coach Ejection',
    'Bench Warning',
    'Technical Foul',
    'Flagrant Foul',
    'Unsporting Conduct'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white font-medium mb-2">Enforcement Type *</label>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          required
        >
          <option value="">Select Type</option>
          {enforcementTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Player/Coach *</label>
        <input
          type="text"
          value={player}
          onChange={(e) => setPlayer(e.target.value)}
          placeholder="Enter name or number"
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          required
        />
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Quarter/Half *</label>
        <select 
          value={quarter} 
          onChange={(e) => setQuarter(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          required
        >
          <option value="">Select Period</option>
          <option value="1st Quarter">1st Quarter</option>
          <option value="2nd Quarter">2nd Quarter</option>
          <option value="3rd Quarter">3rd Quarter</option>
          <option value="4th Quarter">4th Quarter</option>
          <option value="1st Half">1st Half</option>
          <option value="2nd Half">2nd Half</option>
          <option value="Overtime">Overtime</option>
        </select>
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Details</label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Additional details about the enforcement action"
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium"
        >
          Submit Enforcement
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
