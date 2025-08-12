'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, WifiOff, Upload, Cloud, Check, CheckCircle, Copy, Trash2, Save, Undo2, 
  Users, Mic, MicOff, BarChart3, MapPin, Clock, TrendingUp,
  AlertCircle, Radio, Settings, Volume2, Eye, Calculator,
  ClipboardList, UserCheck, MessageSquare, Target, Award,
  Calendar, FileText, Thermometer
} from 'lucide-react';

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromURI(src: string, weight?: number): void;
  addFromString(string: string, weight?: number): void;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

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
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">RMAC Officials Assistant</h1>
          
          <div className="bg-gray-800 p-6 rounded-lg mb-4">
            <h2 className="text-xl font-bold mb-4">Start New Game</h2>
            <div className="space-y-4">
              <select 
                id="homeTeam"
                className="w-full p-3 bg-gray-700 rounded text-white"
                defaultValue=""
              >
                <option value="">Select Home Team</option>
                {rmacTeams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
              
              <select 
                id="awayTeam"
                className="w-full p-3 bg-gray-700 rounded text-white"
                defaultValue=""
              >
                <option value="">Select Away Team</option>
                {rmacTeams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
              
              <button
                onClick={() => {
                  const homeSelect = document.getElementById('homeTeam') as HTMLSelectElement;
                  const awaySelect = document.getElementById('awayTeam') as HTMLSelectElement;
                  
                  if (homeSelect && awaySelect) {
                    const home = homeSelect.value;
                    const away = awaySelect.value;
                    
                    if (home && away && home !== away) {
                      startNewGame(home, away);
                    } else {
                      alert('Please select different home and away teams');
                    }
                  }
                }}
                className="w-full p-3 bg-green-600 hover:bg-green-700 rounded font-bold transition-colors"
              >
                Start Game
              </button>
            </div>
          </div>

          {savedGames.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Saved Games ({savedGames.length})</h3>
              <button
                onClick={syncToCloud}
                className="w-full p-2 bg-blue-600 rounded mb-2 flex items-center justify-center gap-2 transition-colors hover:bg-blue-700"
              >
                <Upload className="w-4 h-4" />
                Sync to Cloud
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main game interface
  return (
    <TeamColorProvider homeTeam={currentGame.homeTeam} awayTeam={currentGame.awayTeam}>
      <div className="min-h-screen bg-gray-900 text-white pb-20">
        {showNumberPad && (
          <NumberPad 
            playerNumber={playerNumber}
            onNumberClick={handleNumberPadClick}
            onClose={() => setShowNumberPad(false)}
          />
        )}
        {showAnalytics && <AnalyticsDashboard />}
        {showFieldView && <FieldView />}
        {showEnforcementCalc && <EnforcementCalculator />}
        {showCrewNotes && <CrewNotesPanel />}
        
        {/* Enhanced Header with Team Colors */}
        <GameHeader 
          game={currentGame} 
          isOnline={isOnline} 
          onSave={saveGameOffline} 
        />

        {/* Undo notification */}
        {lastDeletedPenalty && (
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-3 flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-semibold">Penalty deleted</span>
            </div>
            <button
              onClick={undoDelete}
              className="flex items-center gap-2 bg-yellow-700 hover:bg-yellow-800 px-4 py-2 rounded-lg transition-all font-bold"
            >
              <Undo2 className="w-4 h-4" />
              Undo
            </button>
          </div>
        )}

        {/* Quick Action Bar */}
        <div className="bg-gray-800 mx-4 mt-4 p-3 rounded-xl flex gap-2 overflow-x-auto shadow-lg">
          <QuickActionButton
            icon={isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            label="Voice"
            onClick={toggleVoiceRecognition}
            active={isListening}
            color={isListening ? '#ef4444' : '#10b981'}
          />
          
          <QuickActionButton
            icon={<BarChart3 className="w-4 h-4" />}
            label="Analytics"
            onClick={() => setShowAnalytics(true)}
            color="#8b5cf6"
          />
          
          <QuickActionButton
            icon={<Calculator className="w-4 h-4" />}
            label="Enforce"
            onClick={() => setShowEnforcementCalc(true)}
            color="#06b6d4"
          />
          
          <QuickActionButton
            icon={<MessageSquare className="w-4 h-4" />}
            label="Notes"
            onClick={() => setShowCrewNotes(true)}
            color="#f59e0b"
          />
        </div>

        {/* Game Status */}
        <div className="bg-gray-800 m-4 p-4 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Game Status
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              className="p-3 bg-gray-700 rounded-lg text-white font-semibold"
            >
              <option value="1st">1st Quarter</option>
              <option value="2nd">2nd Quarter</option>
              <option value="3rd">3rd Quarter</option>
              <option value="4th">4th Quarter</option>
              <option value="OT">Overtime</option>
            </select>
            
            <input
              type="text"
              value={gameTime}
              onChange={(e) => setGameTime(e.target.value)}
              placeholder="Time (0:00)"
              className="p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 font-mono text-center"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              value={down}
              onChange={(e) => setDown(e.target.value)}
              placeholder="Down"
              min="1"
              max="4"
              className="p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 text-center"
            />
            
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="Distance"
              className="p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 text-center"
            />
            
            <button
              onClick={() => setShowFieldView(true)}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2 transition-all font-bold"
            >
              <MapPin className="w-4 h-4" />
              {fieldPosition}
            </button>
          </div>
        </div>

        {/* Main Penalty Entry */}
        <div className="bg-gray-800 m-4 p-4 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Add Penalty
          </h3>
          
          {/* Team Selection */}
          <TeamSelectionButtons
            selectedTeam={team}
            onTeamSelect={setTeam}
            homeTeam={currentGame.homeTeam}
            awayTeam={currentGame.awayTeam}
          />

          {/* Penalty Selection */}
          <select
            value={selectedPenalty}
            onChange={(e) => setSelectedPenalty(e.target.value)}
            className="w-full p-4 bg-gray-700 rounded-lg mb-4 text-white"
          >
            <option value="">Select Penalty Code</option>
            {Object.entries(penaltyTypes)
              .sort((a, b) => a[1].name.localeCompare(b[1].name))
              .map(([code, data]) => (
                <option key={code} value={code}>
                  {code} - {data.name} ({data.yards} yards)
                </option>
              ))
            }
          </select>

          {/* Player Number and Official */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setShowNumberPad(true)}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <UserCheck className="w-4 h-4" />
                <span>Player #{playerNumber || '00'}</span>
              </div>
            </button>
            
            <select
              value={callingOfficial}
              onChange={(e) => setCallingOfficial(e.target.value)}
              className="p-4 bg-gray-700 rounded-lg text-white"
            >
              {officials.map(official => (
                <option key={official} value={official}>{official}</option>
              ))}
            </select>
          </div>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full p-4 bg-gray-700 rounded-lg mb-4 text-white placeholder-gray-400"
          />

          <button
            onClick={addPenalty}
            disabled={!selectedPenalty || !playerNumber}
            className="w-full p-4 bg-green-600 disabled:bg-gray-600 rounded-lg font-bold text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed shadow-lg"
          >
            {selectedPenalty && playerNumber ? 'Add Penalty' : 'Select Penalty & Player'}
          </button>
        </div>

        {/* Google Sheets Sync Section */}
        <GoogleSyncSection />

        {/* Penalties List */}
        <div className="bg-gray-800 m-4 p-4 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Game Penalties ({penalties.length})
            </h3>
            <button
              onClick={copyQwikRefData}
              className="flex items-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all font-bold shadow-lg"
            >
              {copiedIndex === 'qwikref' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              QwikRef
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {penalties.map((penalty) => (
              <PenaltyCard
                key={penalty.id}
                penalty={penalty}
                homeTeam={currentGame.homeTeam}
                awayTeam={currentGame.awayTeam}
                onDelete={() => {
                  setLastDeletedPenalty(penalty);
                  setPenalties(penalties.filter(p => p.id !== penalty.id));
                }}
              />
            ))}
            
            {penalties.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No penalties recorded yet</p>
                <p className="text-sm">Add your first penalty above</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TeamColorProvider>
  );
};

export default RMACOfficialsPWA;

// Team Color Provider Component
interface TeamColorProviderProps {
  homeTeam: string;
  awayTeam: string;
  children: React.ReactNode;
}

const TeamColorProvider: React.FC<TeamColorProviderProps> = ({ homeTeam, awayTeam, children }) => {
  const homeColors = RMACTeamColors[homeTeam];
  const awayColors = RMACTeamColors[awayTeam];
  
  return (
    <div className="rmac-team-colors">
      {children}
    </div>
  );
};

// Enhanced Team Indicator Component
const TeamIndicator: React.FC<{ team: string; isHome: boolean }> = ({ team, isHome }) => {
  const colors = RMACTeamColors[team];
  const style = {
    backgroundColor: colors?.primary || (isHome ? '#ef4444' : '#3b82f6'),
    color: colors?.text || '#ffffff',
    borderColor: colors?.accent || '#ffffff'
  };
  
  return (
    <div 
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border"
      style={style}
    >
      <div 
        className="w-2 h-2 rounded-full" 
        style={{ backgroundColor: colors?.accent || '#ffffff' }}
      />
      {team}
      <span className="text-xs opacity-75">{isHome ? 'HOME' : 'AWAY'}</span>
    </div>
  );
};

// Enhanced Penalty Card Component
const PenaltyCard: React.FC<{ penalty: Penalty; onDelete: () => void; homeTeam: string; awayTeam: string }> = ({ 
  penalty, 
  onDelete, 
  homeTeam, 
  awayTeam 
}) => {
  const isOffense = penalty.team === 'O';
  const teamName = isOffense ? homeTeam : awayTeam;
  const teamColors = RMACTeamColors[teamName];
  
  const cardStyle = {
    borderLeftColor: teamColors?.primary || (isOffense ? '#ef4444' : '#3b82f6'),
    background: `linear-gradient(90deg, ${teamColors?.primary || (isOffense ? '#ef4444' : '#3b82f6')}10 0%, transparent 50%)`
  };
  
  return (
    <div 
      className="bg-gray-700 p-3 rounded-lg flex justify-between items-start border-l-4 transition-all hover:translate-x-1 hover:shadow-lg"
      style={cardStyle}
    >
      <div className="flex-1">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="font-bold text-white flex items-center gap-2">
              <span style={{ color: teamColors?.primary || (isOffense ? '#ef4444' : '#3b82f6') }}>
                {penalty.code}
              </span>
              <span>-</span>
              <span>{penalty.name}</span>
              <span className="text-lg font-bold">#{penalty.player}</span>
            </div>
            
            <div className="text-sm text-gray-300 mt-1 flex items-center gap-3">
              <span>{penalty.quarter} {penalty.time}</span>
              <span>•</span>
              <span>{penalty.down}</span>
              <span>•</span>
              <span className="font-semibold">{penalty.callingOfficial}</span>
            </div>
            
            {penalty.description && (
              <div className="text-xs text-gray-400 mt-2 italic bg-gray-800 bg-opacity-50 p-2 rounded">
                {penalty.description}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <TeamIndicator team={teamName} isHome={isOffense} />
            <div 
              className="text-lg font-bold px-2 py-1 rounded text-white"
              style={{ backgroundColor: penalty.yards >= 15 ? '#ef4444' : penalty.yards >= 10 ? '#f59e0b' : '#10b981' }}
            >
              {penalty.yards} yds
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={onDelete}
        className="ml-3 p-2 text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-30 rounded transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

// Enhanced Game Header Component
const GameHeader: React.FC<{ game: Game; isOnline: boolean; onSave: () => void }> = ({ 
  game, 
  isOnline, 
  onSave 
}) => {
  return (
    <div className="p-4 shadow-lg sticky top-0 z-10 bg-gray-800">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white mb-2">RMAC Officials Assistant</h1>
          <div className="flex items-center gap-3">
            <TeamIndicator team={game.homeTeam} isHome={true} />
            <span className="text-white font-bold">VS</span>
            <TeamIndicator team={game.awayTeam} isHome={false} />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-gray-300">Status</div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400">Offline</span>
                </>
              )}
            </div>
          </div>
          
          <button
            onClick={onSave}
            className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-lg"
          >
            <Save className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Team Selection Buttons
const TeamSelectionButtons: React.FC<{ 
  selectedTeam: string; 
  onTeamSelect: (team: string) => void;
  homeTeam: string;
  awayTeam: string;
}> = ({ selectedTeam, onTeamSelect, homeTeam, awayTeam }) => {
  const homeColors = RMACTeamColors[homeTeam];
  const awayColors = RMACTeamColors[awayTeam];
  
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <button
        onClick={() => onTeamSelect('O')}
        className={`p-4 rounded-xl font-bold transition-all duration-300 ${
          selectedTeam === 'O' ? 'scale-105 shadow-lg' : 'hover:scale-102'
        }`}
        style={{
          backgroundColor: selectedTeam === 'O' ? homeColors?.primary || '#ef4444' : '#374151',
          color: selectedTeam === 'O' ? homeColors?.text || '#ffffff' : '#ffffff',
          border: `2px solid ${selectedTeam === 'O' ? homeColors?.accent || '#fbbf24' : 'transparent'}`
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: homeColors?.accent || '#fbbf24' }}
          />
          <span>OFFENSE</span>
        </div>
        <div className="text-xs mt-1 opacity-80">{homeTeam}</div>
      </button>
      
      <button
        onClick={() => onTeamSelect('D')}
        className={`p-4 rounded-xl font-bold transition-all duration-300 ${
          selectedTeam === 'D' ? 'scale-105 shadow-lg' : 'hover:scale-102'
        }`}
        style={{
          backgroundColor: selectedTeam === 'D' ? awayColors?.primary || '#3b82f6' : '#374151',
          color: selectedTeam === 'D' ? awayColors?.text || '#ffffff' : '#ffffff',
          border: `2px solid ${selectedTeam === 'D' ? awayColors?.accent || '#60a5fa' : 'transparent'}`
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: awayColors?.accent || '#60a5fa' }}
          />
          <span>DEFENSE</span>
        </div>
        <div className="text-xs mt-1 opacity-80">{awayTeam}</div>
      </button>
    </div>
  );
};

// Enhanced Quick Action Button
const QuickActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  color?: string;
}> = ({ icon, label, onClick, active = false, color = '#6b7280' }) => {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all duration-200 hover:scale-105 ${
        active ? 'shadow-lg' : ''
      }`}
      style={{
        backgroundColor: active ? color : '#374151',
        color: '#ffffff'
      }}
    >
      {icon}
      <span className="text-sm font-bold">{label}</span>
    </button>
  );
};
// NumberPad Component
const NumberPad: React.FC<{
  playerNumber: string;
  onNumberClick: (num: string) => void;
  onClose: () => void;
}> = ({ playerNumber, onNumberClick, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
        <h3 className="text-lg font-bold mb-4 text-center">Enter Player Number</h3>
        
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-white bg-gray-700 p-4 rounded-lg">
            #{playerNumber || '00'}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => onNumberClick(num.toString())}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-xl font-bold transition-all"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => onNumberClick('C')}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-lg text-xl font-bold transition-all"
          >
            C
          </button>
          <button
            onClick={() => onNumberClick('0')}
            className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-xl font-bold transition-all"
          >
            0
          </button>
          <button
            onClick={() => onNumberClick('OK')}
            className="p-4 bg-green-600 hover:bg-green-700 rounded-lg text-xl font-bold transition-all"
          >
            OK
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="w-full p-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Analytics Dashboard Component (placeholder)
const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Analytics Dashboard</h3>
        <p className="text-gray-400">Analytics features coming soon...</p>
      </div>
    </div>
  );
};

// Field View Component (placeholder)
const FieldView: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Field View</h3>
        <p className="text-gray-400">Field visualization coming soon...</p>
      </div>
    </div>
  );
};

// Enforcement Calculator Component (placeholder)
const EnforcementCalculator: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Penalty Enforcement Calculator</h3>
        <p className="text-gray-400">Enforcement calculator coming soon...</p>
      </div>
    </div>
  );
};

// Crew Notes Panel Component (placeholder)
const CrewNotesPanel: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Crew Notes</h3>
        <p className="text-gray-400">Crew notes feature coming soon...</p>
      </div>
    </div>
  );
};

// Helper function to calculate the current week of the football season
function getCurrentWeek(): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // College football season typically starts in late August/early September
  // Week 1 is usually the Saturday of Labor Day weekend or the week before
  const seasonStart = new Date(currentYear, 7, 29); // August 29th as a baseline
  
  // Find the first Saturday on or after the season start date
  const daysUntilSaturday = (6 - seasonStart.getDay()) % 7;
  const firstSaturday = new Date(seasonStart);
  firstSaturday.setDate(seasonStart.getDate() + daysUntilSaturday);
  
  // Calculate weeks since season start
  const timeDiff = now.getTime() - firstSaturday.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  const weekNumber = Math.floor(daysDiff / 7) + 1;
  
  // Ensure week is between 1 and 17 (typical college football season length)
  return Math.max(1, Math.min(17, weekNumber));
}
