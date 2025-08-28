import React, { useState } from 'react';

interface NotesFormProps {
  onSubmit: (data: { type: string; note: string; timestamp: string }) => void;
  onCancel: () => void;
}

export function NotesForm({ onSubmit, onCancel }: NotesFormProps) {
  const [type, setType] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !note.trim()) {
      // Form validation - user can see required fields
      return;
    }
    onSubmit({ 
      type, 
      note: note.trim(), 
      timestamp: new Date().toISOString() 
    });
  };

  const noteTypes = [
    'Game Note',
    'Player Note',
    'Coach Note',
    'Equipment Issue',
    'Weather Condition',
    'Facility Issue',
    'Injury Note',
    'Technical Issue',
    'Crowd Behavior',
    'Other'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white font-medium mb-2">Note Type *</label>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          required
        >
          <option value="">Select Type</option>
          {noteTypes.map(noteType => (
            <option key={noteType} value={noteType}>{noteType}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-white font-medium mb-2">Note Details *</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter your note details here..."
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          rows={4}
          required
        />
      </div>

      <div className="text-sm text-gray-400">
        Note will be timestamped: {new Date().toLocaleString()}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium"
        >
          Add Note
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
