'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, WifiOff, Upload, Cloud, Check, CheckCircle, Copy, Trash2, Save, Undo2, 
  Users, Mic, MicOff, BarChart3, MapPin, Clock, TrendingUp,
  AlertCircle, Radio, Settings, Volume2, Eye, Calculator,
  ClipboardList, UserCheck, MessageSquare, Target, Award,
  Calendar, FileText, Thermometer
} from 'lucide-react';

// Interfaces
interface Penalty {
  id: number;
  code: string;
  name: string;
  yards: number;
  team: string;
  player: string;
  description: string;
  quarter: string;
  time: string;
  down: string;
  callingOfficial: string;
  fieldPosition?: number;
  voiceNote?: string;
  timestamp: string;
}

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  penalties: Penalty[];
  events?: GameEvent[];
  notes?: CrewNote[];
}

interface CrewMember {
  id: string;
  name: string;
  position: string;
  experience: number;
  totalCalls: number;
  positionHistory: { position: string; gameDate: string; gameId: string }[];
  strengths: string[];
  developmentAreas: string[];
}

interface GameEvent {
  id: string;
  type: 'timeout' | 'injury' | 'measurement' | 'review' | 'weather' | 'substitution';
  team?: string;
  player?: string;
  time: string;
  quarter: string;
  notes: string;
  duration?: number;
  timestamp: string;
}

interface PenaltyEnforcement {
  newDown: number;
  newDistance: number;
  newFieldPosition: number;
  lossOfDown: boolean;
  automaticFirstDown: boolean;
  safetyScored: boolean;
  halfDistance: boolean;
  explanation: string;
}

interface CrewNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  gameTime: string;
  quarter: string;
  priority: 'low' | 'medium' | 'high';
  category: 'penalty' | 'situation' | 'communication' | 'general';
}

interface WeeklyTrends {
  mostCommonPenalties: { code: string; count: number; percentage: number }[];
  busyQuarters: { quarter: string; count: number }[];
  officialWorkload: { official: string; count: number; average: number }[];
  situationalTrends: {
    thirdDownPenalties: number;
    redZonePenalties: number;
    twoMinutePenalties: number;
    overtimePenalties: number;
  };
  consistencyMetrics: {
    crewVariance: number;
    positionBalance: number;
    callAccuracy: number;
  };
}

interface PreGameChecklist {
  id: string;
  category: 'equipment' | 'communication' | 'review' | 'assignments';
  item: string;
  completed: boolean;
  assignedTo?: string;
  notes?: string;
}

// OFFICIAL RMAC TEAM COLORS DATABASE
interface TeamColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
}

const RMACTeamColors: Record<string, TeamColors> = {
  'Adams State': {
    primary: '#005829',    // Green
    secondary: '#FFFFFF',  // White
    accent: '#FFD700',     // Gold accent
    text: '#FFFFFF'
  },
  'Black Hills State': {
    primary: '#005F3B',    // Green  
    secondary: '#FFD700',  // Gold
    accent: '#000000',     // Black
    text: '#FFFFFF'
  },
  'Chadron State': {
    primary: '#003366',    // Navy Blue
    secondary: '#FFD700',  // Gold
    accent: '#FFFFFF',     // White
    text: '#FFFFFF'
  },
  'Colorado Mesa': {
    primary: '#860037',    // Maroon (Mavroon)
    secondary: '#FFFFFF',  // White
    accent: '#FFD200',     // Athletic Gold
    text: '#FFFFFF'
  },
  'Colorado School of Mines': {
    primary: '#033A62',    // Blue
    secondary: '#C0C0C0',  // Silver
    accent: '#FFFFFF',     // White
    text: '#FFFFFF'
  },
  'Colorado State Pueblo': {
    primary: '#CE1126',    // Red
    secondary: '#002147',  // Navy
    accent: '#FFFFFF',     // White
    text: '#FFFFFF'
  },
  'Fort Lewis': {
    primary: '#003F7F',    // Blue
    secondary: '#FFB300',  // Gold
    accent: '#FFFFFF',     // White
    text: '#FFFFFF'
  },
  'New Mexico Highlands': {
    primary: '#4B0082',    // Purple
    secondary: '#FFFFFF',  // White
    accent: '#FFD700',     // Gold
    text: '#FFFFFF'
  },
  'South Dakota Mines': {
    primary: '#003F87',    // Blue
    secondary: '#FFCC00',  // Yellow/Gold
    accent: '#FFFFFF',     // White
    text: '#FFFFFF'
  },
  'Western Colorado': {
    primary: '#8B2332',    // Crimson
    secondary: '#000000',  // Black
    accent: '#FFFFFF',     // White
    text: '#FFFFFF'
  }
};

// Constants
const penaltyTypes: Record<string, { name: string; yards: number }> = {
  'FST': { name: 'False Start', yards: 5 },
  'DOG': { name: 'Delay of Game', yards: 5 },
  'HLD': { name: 'Holding', yards: 10 },
  'DPI': { name: 'Defensive Pass Interference', yards: 15 },
  'OPI': { name: 'Offensive Pass Interference', yards: 15 },
  'PF': { name: 'Personal Foul', yards: 15 },
  'RPS': { name: 'Roughing the Passer', yards: 15 },
  'IFP': { name: 'Intentional Forward Pass', yards: 5 },
  'IGS': { name: 'Intentional Grounding', yards: 10 },
  'ITP': { name: 'Illegal Touch Pass', yards: 5 },
  'IUH': { name: 'Illegal Use of Hands', yards: 10 },
  'OFF': { name: 'Offside', yards: 5 },
  'ENC': { name: 'Encroachment', yards: 5 },
  'DOF': { name: 'Defensive Offside', yards: 5 },
  'ILP': { name: 'Illegal Procedure', yards: 5 },
  'CLG': { name: 'Clipping', yards: 15 },
  'BIB': { name: 'Block in the Back', yards: 10 },
  'CHB': { name: 'Chop Block', yards: 15 },
  'TRP': { name: 'Tripping', yards: 10 },
  'KCI': { name: 'Kick Catch Interference', yards: 15 },
  'ILS': { name: 'Illegal Shift', yards: 5 },
  'SUB': { name: 'Illegal Substitution', yards: 5 },
  'ILF': { name: 'Illegal Formation', yards: 5 },
  'IBK': { name: 'Illegal Block', yards: 10 }
};

const rmacTeams = [
  'Adams State',
  'Black Hills State', 
  'Chadron State',
  'Colorado Mines',
  'Colorado State Pueblo',
  'Dixie State',
  'Fort Lewis',
  'New Mexico Highlands',
  'South Dakota Mines',
  'Western Colorado'
];

const RMACOfficialsPWA: React.FC = () => {
  // State
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [selectedPenalty, setSelectedPenalty] = useState<string>('');
  const [playerNumber, setPlayerNumber] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [team, setTeam] = useState<string>('O');
  const [quarter, setQuarter] = useState<string>('1st');
  const [gameTime, setGameTime] = useState<string>('15:00');
  const [down, setDown] = useState<string>('1');
  const [distance, setDistance] = useState<string>('10');
  const [fieldPosition, setFieldPosition] = useState<number>(50);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [savedGames, setSavedGames] = useState<Game[]>([]);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [showNumberPad, setShowNumberPad] = useState<boolean>(false);
  const [callingOfficial, setCallingOfficial] = useState<string>('R');
  const [lastDeletedPenalty, setLastDeletedPenalty] = useState<Penalty | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [showFieldView, setShowFieldView] = useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [crewSync, setCrewSync] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceCommand, setVoiceCommand] = useState<string>('');
  const [penaltyPredictions, setPenaltyPredictions] = useState<Record<string, number>>({});
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const [crewNotes, setCrewNotes] = useState<CrewNote[]>([]);
  const [currentNote, setCurrentNote] = useState<string>('');
  const [noteCategory, setNoteCategory] = useState<'penalty' | 'situation' | 'communication' | 'general'>('general');
  const [notePriority, setNotePriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [preGameChecklist, setPreGameChecklist] = useState<PreGameChecklist[]>([]);
  const [weatherConditions, setWeatherConditions] = useState<{
    temperature: number;
    conditions: string;
    windSpeed: number;
    windDirection: string;
    humidity: number;
  }>({ temperature: 72, conditions: 'Clear', windSpeed: 0, windDirection: 'N', humidity: 50 });
  const [showCrewManagement, setShowCrewManagement] = useState<boolean>(false);
  const [showEnforcementCalc, setShowEnforcementCalc] = useState<boolean>(false);
  const [showCrewNotes, setShowCrewNotes] = useState<boolean>(false);
  const [showPreGameChecklist, setShowPreGameChecklist] = useState<boolean>(false);
  const [showWeeklyTrends, setShowWeeklyTrends] = useState<boolean>(false);
  const [sidelineMode, setSidelineMode] = useState<boolean>(false);
  
  // Add these new state variables
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const officials = ['R', 'CJ', 'U', 'HL', 'LJ', 'SJ', 'FJ', 'BJ'];

  // Functions
  const playSound = (type: 'whistle' | 'ding') => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'whistle') {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
      } else {
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
      }
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Audio error:', error);
    }
  };

  const startNewGame = (homeTeam: string, awayTeam: string) => {
    const newGame: Game = {
      id: Date.now().toString(),
      homeTeam,
      awayTeam,
      date: new Date().toISOString(),
      penalties: []
    };
    setCurrentGame(newGame);
    setPenalties([]);
    setGameEvents([]);
    setCrewNotes([]);
  };

  const saveGameOffline = () => {
    if (currentGame) {
      const gameToSave = {
        ...currentGame,
        penalties,
        events: gameEvents,
        notes: crewNotes
      };
      
      const updatedGames = savedGames.filter(g => g.id !== currentGame.id);
      updatedGames.push(gameToSave);
      
      setSavedGames(updatedGames);
      localStorage.setItem('rmac_saved_games', JSON.stringify(updatedGames));
      localStorage.setItem('rmac_current_game', JSON.stringify(gameToSave));
    }
  };

  const syncToCloud = () => {
    alert('Sync to cloud feature coming soon');
  };

  const undoDelete = () => {
    if (lastDeletedPenalty) {
      setPenalties(prev => [lastDeletedPenalty, ...prev]);
      setLastDeletedPenalty(null);
    }
  };

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition not supported in this browser');
      return;
    }
    
    try {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
        setVoiceCommand('Listening...');
      }
    } catch (error) {
      console.error('Voice recognition error:', error);
      setIsListening(false);
      setVoiceCommand('');
      alert('Voice recognition failed. Please try again.');
    }
  };

  const parseVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    Object.entries(penaltyTypes).forEach(([code, data]) => {
      if (lowerCommand.includes(data.name.toLowerCase()) || lowerCommand.includes(code.toLowerCase())) {
        setSelectedPenalty(code);
      }
    });
    
    const numberMatch = lowerCommand.match(/number (\d+)/);
    if (numberMatch) {
      setPlayerNumber(numberMatch[1]);
    }
    
    if (lowerCommand.includes('offense') || lowerCommand.includes('offensive')) {
      setTeam('O');
    } else if (lowerCommand.includes('defense') || lowerCommand.includes('defensive')) {
      setTeam('D');
    }
  };

  const addPenalty = (): void => {
    if (!selectedPenalty || !playerNumber) {
      alert('Please select penalty type and enter player number');
      return;
    }

    const playerNum = parseInt(playerNumber);
    if (isNaN(playerNum) || playerNum < 0 || playerNum > 99) {
      alert('Please enter a valid player number (0-99)');
      return;
    }

    const penalty: Penalty = {
      id: Date.now(),
      code: selectedPenalty,
      name: penaltyTypes[selectedPenalty].name,
      yards: penaltyTypes[selectedPenalty].yards,
      team: team,
      player: playerNumber,
      description: description,
      quarter: quarter,
      time: gameTime,
      down: `${down} & ${distance}`,
      callingOfficial: callingOfficial,
      fieldPosition: fieldPosition,
      voiceNote: voiceCommand,
      timestamp: new Date().toISOString()
    };

    setPenalties([penalty, ...penalties]);
    playSound('whistle');
    
    setSelectedPenalty('');
    setPlayerNumber('');
    setDescription('');
    setShowNumberPad(false);
    setVoiceCommand('');
  };

  const handleNumberPadClick = (num: string): void => {
    if (num === 'C') {
      setPlayerNumber('');
    } else if (num === 'OK') {
      if (playerNumber) {
        const playerNum = parseInt(playerNumber);
        if (isNaN(playerNum) || playerNum < 0 || playerNum > 99) {
          alert('Please enter a valid player number (0-99)');
          return;
        }
        addPenalty();
      } else {
        alert('Please enter a player number');
      }
    } else {
      const newNumber = playerNumber + num;
      const numValue = parseInt(newNumber);
      if (numValue <= 99) {
        setPlayerNumber(newNumber);
      }
    }
  };

  const generateQwikRefFormat = (): string => {
    return penalties.map(p => 
      `${p.quarter} ${p.time} - ${p.code} ${p.name} #${p.player} ${p.team === 'O' ? 'OFF' : 'DEF'} (${p.callingOfficial})`
    ).join('\n');
  };

  const copyQwikRefData = async (): Promise<void> => {
    const data = generateQwikRefFormat();
    try {
      await navigator.clipboard.writeText(data);
      setCopiedIndex('qwikref');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      const textArea = document.createElement('textarea');
      textArea.value = data;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedIndex('qwikref');
        setTimeout(() => setCopiedIndex(null), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        alert('Copy failed. Please select and copy the text manually.');
      }
      document.body.removeChild(textArea);
    }
  };

  // Enhanced penalty enforcement calculator
  const calculatePenaltyEnforcement = (
    penalty: Penalty,
    currentDown: number,
    currentDistance: number,
    currentFieldPos: number
  ): PenaltyEnforcement => {
    const penaltyYards = penalty.yards;
    const isOffensive = penalty.team === 'O';
    let newDown = currentDown;
    let newDistance = currentDistance;
    let newFieldPosition = currentFieldPos;
    let lossOfDown = false;
    let automaticFirstDown = false;
    let safetyScored = false;
    let halfDistance = false;
    let explanation = '';

    if (isOffensive) {
      newFieldPosition = Math.max(0, currentFieldPos - penaltyYards);
      
      if (newFieldPosition <= 0) {
        safetyScored = true;
        newFieldPosition = 0;
        explanation = 'Safety scored due to penalty in end zone';
      }
      
      if (['IFP', 'IGS', 'ITP'].includes(penalty.code)) {
        lossOfDown = true;
        newDown = Math.min(4, currentDown + 1);
        explanation += lossOfDown ? ' Loss of down.' : '';
      } else {
        newDown = currentDown;
      }
      
      if (penaltyYards > currentFieldPos / 2) {
        halfDistance = true;
        newFieldPosition = Math.floor(currentFieldPos / 2);
        explanation += ' Half-distance penalty.';
      }
      
    } else {
      newFieldPosition = Math.min(100, currentFieldPos + penaltyYards);
      
      if (['DPI', 'RPS', 'PF', 'HLD', 'IUH'].includes(penalty.code)) {
        automaticFirstDown = true;
        newDown = 1;
        newDistance = 10;
        explanation = 'Automatic first down';
      } else {
        newDistance = Math.max(1, currentDistance - penaltyYards);
        if (newDistance <= 0) {
          automaticFirstDown = true;
          newDown = 1;
          newDistance = 10;
        }
      }
      
      if (penaltyYards > (100 - currentFieldPos) / 2) {
        halfDistance = true;
        newFieldPosition = currentFieldPos + Math.floor((100 - currentFieldPos) / 2);
        explanation += ' Half-distance penalty.';
      }
    }

    if (newFieldPosition >= 100) {
      newFieldPosition = 99;
      explanation += ' Penalty enforced to the 1-yard line.';
    }

    return {
      newDown,
      newDistance,
      newFieldPosition,
      lossOfDown,
      automaticFirstDown,
      safetyScored,
      halfDistance,
      explanation: explanation.trim()
    };
  };

  const addCrewNote = () => {
    if (currentNote.trim()) {
      const note: CrewNote = {
        id: Date.now().toString(),
        author: callingOfficial,
        content: currentNote,
        timestamp: new Date().toISOString(),
        gameTime,
        quarter,
        priority: notePriority,
        category: noteCategory
      };
      setCrewNotes(prev => [note, ...prev]);
      setCurrentNote('');
      playSound('ding');
    }
  };

  const addGameEvent = (type: GameEvent['type'], notes: string = '', team?: string, player?: string) => {
    const event: GameEvent = {
      id: Date.now().toString(),
      type,
      team,
      player,
      time: gameTime,
      quarter,
      notes,
      timestamp: new Date().toISOString()
    };
    setGameEvents(prev => [event, ...prev]);
  };

  const getWeeklyTrends = (): WeeklyTrends => {
    const allPenalties = savedGames.flatMap(game => game.penalties || []);
    
    const penaltyCounts = allPenalties.reduce((acc, p) => {
      acc[p.code] = (acc[p.code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonPenalties = Object.entries(penaltyCounts)
      .map(([code, count]) => ({ 
        code, 
        count, 
        percentage: Math.round((count / allPenalties.length) * 100) 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const quarterCounts = allPenalties.reduce((acc, p) => {
      acc[p.quarter] = (acc[p.quarter] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const busyQuarters = Object.entries(quarterCounts)
      .map(([quarter, count]) => ({ quarter, count }))
      .sort((a, b) => b.count - a.count);

    const officialCounts = allPenalties.reduce((acc, p) => {
      acc[p.callingOfficial] = (acc[p.callingOfficial] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgCallsPerOfficial = allPenalties.length / officials.length;
    const officialWorkload = Object.entries(officialCounts)
      .map(([official, count]) => ({ 
        official, 
        count, 
        average: Math.round((count / avgCallsPerOfficial) * 100) 
      }))
      .sort((a, b) => b.count - a.count);

    const situationalTrends = {
      thirdDownPenalties: allPenalties.filter(p => p.down?.startsWith('3')).length,
      redZonePenalties: allPenalties.filter(p => (p.fieldPosition || 50) > 80).length,
      twoMinutePenalties: allPenalties.filter(p => {
        const mins = parseInt(p.time.split(':')[0]);
        return mins < 2;
      }).length,
      overtimePenalties: allPenalties.filter(p => p.quarter === 'OT').length
    };

    const crewVariance = Math.round(
      Object.values(officialCounts).reduce((sum, count) => 
        sum + Math.pow(count - avgCallsPerOfficial, 2), 0
      ) / officials.length
    );

    return {
      mostCommonPenalties,
      busyQuarters,
      officialWorkload,
      situationalTrends,
      consistencyMetrics: {
        crewVariance,
        positionBalance: 85,
        callAccuracy: 92
      }
    };
  };

  // Component definitions
  const NumberPad = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowNumberPad(false)}>
      <div className="bg-gray-800 p-6 rounded-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4 text-center text-white">Enter Player Number</h3>
        <div className="text-center mb-4">
          <input 
            type="text" 
            value={playerNumber} 
            readOnly 
            className="text-2xl font-bold bg-gray-700 text-white p-2 rounded w-20 text-center"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1,2,3,4,5,6,7,8,9,'C',0,'OK'].map(num => (
            <button
              key={num}
              onClick={() => handleNumberPadClick(num.toString())}
              className={`p-4 rounded font-bold text-xl transition-colors ${
                num === 'OK' ? 'bg-green-600 hover:bg-green-700' : 
                num === 'C' ? 'bg-red-600 hover:bg-red-700' : 
                'bg-gray-700 hover:bg-gray-600'
              } text-white`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const AnalyticsDashboard = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAnalytics(false)}>
      <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-white">Game Analytics</h2>
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded">
            <h3 className="font-bold mb-2">Penalty Summary</h3>
            <p>Total Penalties: {penalties.length}</p>
            <p>Offensive: {penalties.filter(p => p.team === 'O').length}</p>
            <p>Defensive: {penalties.filter(p => p.team === 'D').length}</p>
          </div>
        </div>
        <button
          onClick={() => setShowAnalytics(false)}
          className="w-full bg-gray-600 hover:bg-gray-700 p-3 rounded font-bold text-white transition-colors mt-4"
        >
          Close
        </button>
      </div>
    </div>
  );

  const FieldView = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowFieldView(false)}>
      <div className="bg-gray-800 p-6 rounded-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-white">Field Position</h2>
        <div className="space-y-4">
          <input
            type="range"
            min="0"
            max="100"
            value={fieldPosition}
            onChange={(e) => setFieldPosition(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-center text-white">{fieldPosition} yard line</p>
        </div>
        <button
          onClick={() => setShowFieldView(false)}
          className="w-full bg-gray-600 hover:bg-gray-700 p-3 rounded font-bold text-white transition-colors mt-4"
        >
          Close
        </button>
      </div>
    </div>
  );

  const EnforcementCalculator = () => {
    const [calcPenalty, setCalcPenalty] = useState<string>('');
    const [calcDown, setCalcDown] = useState<number>(1);
    const [calcDistance, setCalcDistance] = useState<number>(10);
    const [calcFieldPos, setCalcFieldPos] = useState<number>(50);
    const [enforcement, setEnforcement] = useState<PenaltyEnforcement | null>(null);

    const calculateEnforcement = () => {
      if (!calcPenalty) return;
      
      const penalty: Penalty = {
        id: 0,
        code: calcPenalty,
        name: penaltyTypes[calcPenalty].name,
        yards: penaltyTypes[calcPenalty].yards,
        team: team,
        player: '00',
        description: '',
        quarter: quarter,
        time: gameTime,
        down: `${calcDown} & ${calcDistance}`,
        callingOfficial: callingOfficial,
        fieldPosition: calcFieldPos,
        timestamp: new Date().toISOString()
      };

      const result = calculatePenaltyEnforcement(penalty, calcDown, calcDistance, calcFieldPos);
      setEnforcement(result);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowEnforcementCalc(false)}>
        <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Penalty Enforcement Calculator
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Current Situation</label>
              <div className="space-y-2">
                <input
                  type="number"
                  value={calcDown}
                  onChange={(e) => setCalcDown(Number(e.target.value))}
                  placeholder="Down"
                  min="1" max="4"
                  className="w-full p-2 bg-gray-700 rounded text-white"
                />
                <input
                  type="number"
                  value={calcDistance}
                  onChange={(e) => setCalcDistance(Number(e.target.value))}
                  placeholder="Distance"
                  className="w-full p-2 bg-gray-700 rounded text-white"
                />
                <input
                  type="number"
                  value={calcFieldPos}
                  onChange={(e) => setCalcFieldPos(Number(e.target.value))}
                  placeholder="Field Position"
                  min="0" max="100"
                  className="w-full p-2 bg-gray-700 rounded text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Penalty</label>
              <select
                value={calcPenalty}
                onChange={(e) => setCalcPenalty(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded text-white mb-2"
              >
                <option value="">Select Penalty</option>
                {Object.entries(penaltyTypes).map(([code, data]) => (
                  <option key={code} value={code}>
                    {code} - {data.name} ({data.yards} yards)
                  </option>
                ))}
              </select>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTeam('O')}
                  className={`p-2 rounded font-bold ${team === 'O' ? 'bg-red-600' : 'bg-gray-700'}`}
                >
                  Offense
                </button>
                <button
                  onClick={() => setTeam('D')}
                  className={`p-2 rounded font-bold ${team === 'D' ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  Defense
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={calculateEnforcement}
            className="w-full p-3 bg-green-600 hover:bg-green-700 rounded font-bold mb-4 transition-colors"
          >
            Calculate Enforcement
          </button>
          
          {enforcement && (
            <div className="bg-gray-700 p-4 rounded mb-4">
              <h3 className="font-bold text-green-400 mb-2">Enforcement Result:</h3>
              <div className="space-y-2 text-sm">
                <div>Next Down: <span className="font-bold">{enforcement.newDown} & {enforcement.newDistance}</span></div>
                <div>Field Position: <span className="font-bold">{enforcement.newFieldPosition} yard line</span></div>
                {enforcement.automaticFirstDown && <div className="text-green-400">✓ Automatic First Down</div>}
                {enforcement.lossOfDown && <div className="text-red-400">✓ Loss of Down</div>}
                {enforcement.halfDistance && <div className="text-yellow-400">✓ Half Distance Penalty</div>}
                {enforcement.safetyScored && <div className="text-red-400">✓ Safety Scored</div>}
                {enforcement.explanation && (
                  <div className="text-blue-400 mt-2 italic">{enforcement.explanation}</div>
                )}
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowEnforcementCalc(false)}
            className="w-full bg-gray-600 hover:bg-gray-700 p-3 rounded font-bold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  const CrewNotesPanel = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCrewNotes(false)}>
      <div className="bg-gray-800 p-6 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Crew Communication
        </h2>
        
        <div className="bg-gray-700 p-4 rounded mb-4">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <select
              value={noteCategory}
              onChange={(e) => setNoteCategory(e.target.value as any)}
              className="p-2 bg-gray-600 rounded text-white"
            >
              <option value="general">General</option>
              <option value="penalty">Penalty Related</option>
              <option value="situation">Game Situation</option>
              <option value="communication">Communication</option>
            </select>
            
            <select
              value={notePriority}
              onChange={(e) => setNotePriority(e.target.value as any)}
              className="p-2 bg-gray-600 rounded text-white"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          
          <textarea
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            placeholder="Enter crew note..."
            className="w-full p-2 bg-gray-600 rounded text-white mb-2"
            rows={2}
          />
          
          <button
            onClick={addCrewNote}
            className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded font-bold transition-colors"
          >
            Add Note
          </button>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {crewNotes.map(note => (
            <div
              key={note.id}
              className={`p-3 rounded border-l-4 ${
                note.priority === 'high' ? 'border-red-500 bg-red-900 bg-opacity-20' :
                note.priority === 'medium' ? 'border-yellow-500 bg-yellow-900 bg-opacity-20' :
                'border-green-500 bg-green-900 bg-opacity-20'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-white">{note.author}</span>
                <span className="text-xs text-gray-400">{note.quarter} - {note.gameTime}</span>
              </div>
              <p className="text-sm text-gray-200 mb-1">{note.content}</p>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  note.category === 'penalty' ? 'bg-red-600' :
                  note.category === 'situation' ? 'bg-yellow-600' :
                  note.category === 'communication' ? 'bg-blue-600' : 'bg-gray-600'
                }`}>
                  {note.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  note.priority === 'high' ? 'bg-red-600' :
                  note.priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                }`}>
                  {note.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => setShowCrewNotes(false)}
          className="w-full bg-gray-600 hover:bg-gray-700 p-3 rounded font-bold text-white transition-colors mt-4"
        >
          Close
        </button>
      </div>
    </div>
  );

  // Helper function to get current week
  const getCurrentWeek = (): number => {
    const seasonStart = new Date('2025-09-06');
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - seasonStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.ceil(diffDays / 7);
    return Math.min(Math.max(1, weekNumber), 12);
  };

  // Google Sheets sync function
  const syncToGoogleSheets = async () => {
    if (!currentGame || penalties.length === 0) {
      alert('No penalties to sync');
      return;
    }

    try {
      setIsSyncing(true);
      setSyncStatus('syncing');
      
      const currentCrew = localStorage.getItem('crew_name') || 'Crew 1';
      
      const gameInfo = {
        date: new Date().toISOString().split('T')[0],
        week: getCurrentWeek(),
        homeTeam: currentGame.homeTeam,
        awayTeam: currentGame.awayTeam,
        crew: currentCrew,
        location: 'TBD'
      };

      const response = await fetch('/api/sync-penalties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ penalties, gameInfo })
      });

      const result = await response.json();
      
      if (result.success) {
        setSyncStatus('success');
        setLastSyncTime(new Date().toISOString());
        localStorage.setItem('last_sync_time', new Date().toISOString());
        alert(`Successfully synced ${result.rowsAdded} penalties to Google Sheets!`);
      } else {
        setSyncStatus('error');
        alert('Sync failed. Please try again.');
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      alert('Error syncing to Google Sheets. Check your connection and try again.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  // Google Sync Section Component
  const GoogleSyncSection = () => (
    <div className="bg-gray-800 m-4 p-4 rounded-xl shadow-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-400" />
          Google Sheets Sync
        </h3>
        {lastSyncTime && (
          <div className="text-xs text-gray-400">
            <span>Last sync: </span>
            <span className="text-gray-300">
              {new Date(lastSyncTime).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
      
      {syncStatus !== 'idle' && (
        <div className={`mb-3 p-2 rounded-lg text-sm flex items-center gap-2 ${
          syncStatus === 'syncing' ? 'bg-blue-900 text-blue-200' :
          syncStatus === 'success' ? 'bg-green-900 text-green-200' :
          'bg-red-900 text-red-200'
        }`}>
          {syncStatus === 'syncing' && (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              Syncing to Google Sheets...
            </>
          )}
          {syncStatus === 'success' && (
            <>
              <CheckCircle className="w-4 h-4" />
              Successfully synced!
            </>
          )}
          {syncStatus === 'error' && (
            <>
              <AlertCircle className="w-4 h-4" />
              Sync failed - please try again
            </>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={syncToGoogleSheets}
          disabled={isSyncing || penalties.length === 0}
          className="p-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold transition-all flex items-center justify-center gap-2"
        >
          {isSyncing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Syncing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Sync to Sheets
            </>
          )}
        </button>
        
        <button
          onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${process.env.NEXT_PUBLIC_SHEET_ID}`, '_blank')}
          className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          View Sheet
        </button>
      </div>
      
      {penalties.length > 0 && (
        <div className="mt-3 text-center">
          <div className="text-sm text-gray-400">
            <span className="text-2xl font-bold text-white">{penalties.length}</span>
            <span> penalties ready to sync</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Game: {currentGame?.homeTeam} vs {currentGame?.awayTeam}
          </div>
        </div>
      )}
      
      {penalties.length === 0 && (
        <div className="mt-3 text-center text-gray-500 text-sm">
          No penalties to sync yet
        </div>
      )}
    </div>
  );

  // Game start screen
  if (!currentGame) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-4xl font-extrabold mb-4">RMAC Officials App</h1>
        <p className="text-lg mb-8 text-center max-w-md">
          Streamline your officiating experience. Record penalties, track game events, and sync with Google Sheets.
        </p>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <button
            onClick={() => startNewGame('Home Team', 'Away Team')}
            className="p-4 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Start New Game
          </button>
          
          <button
            onClick={() => setShowCrewManagement(true)}
            className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Manage Crew
          </button>
        </div>
        
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Version 1.0.0</p>
          <p>© 2025 RMAC Officials. All rights reserved.</p>
        </div>
      </div>
    );
  }

  // Main game interface
  return (
    <TeamColorProvider homeTeam={currentGame.homeTeam} awayTeam={currentGame.awayTeam}>
      <div className="min-h-screen bg-gray-900 text-white pb-20">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              {currentGame.homeTeam} vs {currentGame.awayTeam}
            </h2>
            <span className="text-sm text-gray-400">
              {new Date(currentGame.date).toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCrewManagement(true)}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all"
            >
              Manage Crew
            </button>
            
            <button
              onClick={saveGameOffline}
              className="p-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-all"
            >
              Save Game
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="p-4">
          {/* Penalty input section */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
            <h3 className="font-bold text-lg mb-2">Record Penalty</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Penalty Type</label>
                <select
                  value={selectedPenalty}
                  onChange={(e) => setSelectedPenalty(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded text-white"
                >
                  <option value="">Select Penalty</option>
                  {Object.entries(penaltyTypes).map(([code, data]) => (
                    <option key={code} value={code}>
                      {data.name} ({data.yards} yards)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Player Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={playerNumber}
                    onChange={(e) => setPlayerNumber(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded text-white pr-10"
                    placeholder="Enter player number"
                  />
                  <button
                    onClick={() => setShowNumberPad(true)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-600 rounded-full"
                  >
                    <TouchApp className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Team</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTeam('O')}
                    className={`flex-1 p-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                      team === 'O' ? 'bg-red-600' : 'bg-gray-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Offense
                  </button>
                  <button
                    onClick={() => setTeam('D')}
                    className={`flex-1 p-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                      team === 'D' ? 'bg-blue-600' : 'bg-gray-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Defense
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Quarter</label>
                <select
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded text-white"
                >
                  <option value="1st">1st Quarter</option>
                  <option value="2nd">2nd Quarter</option>
                  <option value="3rd">3rd Quarter</option>
                  <option value="4th">4th Quarter</option>
                  <option value="OT">Overtime</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Game Time</label>
                <input
                  type="text"
                  value={gameTime}
                  onChange={(e) => setGameTime(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded text-white"
                  placeholder="MM:SS"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Down & Distance</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={down}
                    onChange={(e) => setDown(e.target.value)}
                    className="flex-1 p-2 bg-gray-700 rounded text-white"
                    placeholder="Down"
                  />
                  <input
                    type="text"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="flex-1 p-2 bg-gray-700 rounded text-white"
                    placeholder="Distance"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={addPenalty}
                className="flex-1 p-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Add Penalty
              </button>
              
              <button
                onClick={() => setShowAnalytics(true)}
                className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                View Analytics
              </button>
            </div>
          </div>
          
          {/* Penalty list */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-2">Recorded Penalties</h3>
            
            {penalties.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-4">
                No penalties recorded yet
              </p>
            )}
            
            {penalties.length > 0 && (
              <div className="space-y-2">
                {penalties.map(penalty => (
                  <div
                    key={penalty.id}
                    className="p-3 bg-gray-700 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <div className="text-sm text-gray-400">
                        {penalty.quarter} - {penalty.time}
                      </div>
                      <div className="font-bold">
                        {penalty.name} ({penalty.yards} yards)
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setLastDeletedPenalty(penalty);
                          setPenalties(prev => prev.filter(p => p.id !== penalty.id));
                          playSound('ding');
                        }}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-all"
                        title="Delete Penalty"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedPenalty(penalty.code);
                          setPlayerNumber(penalty.player);
                          setDescription(penalty.description);
                          setTeam(penalty.team);
                          setQuarter(penalty.quarter);
                          setGameTime(penalty.time);
                          setDown(penalty.down.split(' & ')[0]);
                          setDistance(penalty.down.split(' & ')[1]);
                          setFieldPosition(penalty.fieldPosition || 50);
                          setShowNumberPad(false);
                        }}
                        className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-full transition-all"
                        title="Edit Penalty"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              <span>Version 1.0.0</span>
            </div>
            
            <div className="text-sm text-gray-400">
              <span>© 2025 RMAC Officials. All rights reserved.</span>
            </div }
          </div>
        </div>
      </div>
    </TeamColorProvider>
  );
};

export default RMACOfficialsPWA;