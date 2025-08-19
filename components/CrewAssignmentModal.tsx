import React, { useState } from 'react';
import { Users, Calendar, MapPin, Clock } from 'lucide-react';

interface CrewAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    time: string;
    venue: string;
  };
  availableCrews: Array<{
    id: string;
    name: string;
    crewChief: string;
    officials: Record<string, string>;
    rating: number;
    availability: 'available' | 'unavailable' | 'tentative';
    conflicts?: string[];
  }>;
  onAssignCrew: (gameId: string, crewId: string) => void;
}

const CrewAssignmentModal: React.FC<CrewAssignmentModalProps> = ({
  isOpen,
  onClose,
  game,
  availableCrews,
  onAssignCrew
}) => {
  const [selectedCrew, setSelectedCrew] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAssign = () => {
    if (selectedCrew) {
      onAssignCrew(game.id, selectedCrew);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">
          Assign Crew to Game
        </h2>

        {/* Game Info */}
        <div className="bg-gray-700 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-white mb-2">
            {game.awayTeam} @ {game.homeTeam}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {game.date}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {game.time}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {game.venue}
            </div>
          </div>
        </div>

        {/* Available Crews */}
        <div className="space-y-3 mb-6">
          <h4 className="font-medium text-white">Available Crews</h4>
          {availableCrews.map((crew) => (
            <div
              key={crew.id}
              onClick={() => setSelectedCrew(crew.id)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedCrew === crew.id
                  ? 'bg-blue-600/30 border-2 border-blue-500'
                  : crew.availability === 'available'
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : crew.availability === 'tentative'
                  ? 'bg-yellow-600/20 border border-yellow-500'
                  : 'bg-red-600/20 border border-red-500 opacity-50 cursor-not-allowed'
              }`}
              style={{ pointerEvents: crew.availability === 'unavailable' ? 'none' : 'auto' }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h5 className="font-bold text-white">{crew.name}</h5>
                  <p className="text-sm text-gray-300">Chief: {crew.crewChief}</p>
                  <p className="text-sm text-gray-400">
                    Rating: <span className="text-yellow-400">{crew.rating.toFixed(1)}★</span>
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  crew.availability === 'available' 
                    ? 'bg-green-600 text-white'
                    : crew.availability === 'tentative'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-red-600 text-white'
                }`}>
                  {crew.availability.toUpperCase()}
                </span>
              </div>

              {/* Full Crew Roster */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(crew.officials).map(([position, name]) => (
                  <div key={position} className="flex items-center gap-2">
                    <span className="bg-gray-600 px-2 py-1 rounded text-xs font-bold w-8 text-center">
                      {position}
                    </span>
                    <span className="text-gray-300 truncate">{name}</span>
                  </div>
                ))}
              </div>

              {/* Conflicts */}
              {crew.conflicts && crew.conflicts.length > 0 && (
                <div className="mt-3 p-2 bg-red-600/20 rounded">
                  <p className="text-red-400 text-xs font-bold">Conflicts:</p>
                  <p className="text-red-300 text-xs">{crew.conflicts.join(', ')}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedCrew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Assign Crew
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrewAssignmentModal;
