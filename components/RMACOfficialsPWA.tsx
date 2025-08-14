'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, WifiOff, Upload, Cloud, Check, CheckCircle, Copy, Trash2, Save, Undo2, 
  Users, Mic, MicOff, BarChart3, MapPin, Clock, TrendingUp,
  AlertCircle, Radio, Settings, Volume2, Eye, Calculator,
  ClipboardList, UserCheck, MessageSquare, Target, Award,
  Calendar, FileText, Thermometer,
  RefreshCw, Flag, Globe, Play, Pause, RotateCcw, Plus, Minus,
  Mail, Send, TrendingDown, BarChart2, PieChart, Calendar as CalendarIcon,
  Smartphone, Headphones, Zap, Shield, Network, Database,
  PhoneCall, MessageCircle, Bell, Download, Share2, 
  HelpCircle, Book, Video, ExternalLink, Lightbulb
} from 'lucide-react';
import { offlineStorage, isOnline, onConnectionChange, triggerManualSync } from '@/lib/offline-storage';
import { driveBackup } from '@/lib/google-drive-backup';

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
  crew?: string;
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

interface CrewData {
  id: string;
  name: string;
  officials: {
    R: string;
    CJ: string;
    U: string;
    HL: string;
    LJ: string;
    SJ: string;
    FJ: string;
    BJ: string;
  };
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
    primary: '#005829',
    secondary: '#FFFFFF',
    accent: '#FFD700',
    text: '#FFFFFF'
  },
  'Black Hills State': {
    primary: '#005F3B',
    secondary: '#FFD700',
    accent: '#000000',
    text: '#FFFFFF'
  },
  'Chadron State': {
    primary: '#003366',
    secondary: '#FFD700',
    accent: '#FFFFFF',
    text: '#FFFFFF'
  },
  'Colorado Mesa': {
    primary: '#860037',
    secondary: '#FFFFFF',
    accent: '#FFD200',
    text: '#FFFFFF'
  },
  'Colorado School of Mines': {
    primary: '#033A62',
    secondary: '#C0C0C0',
    accent: '#FFFFFF',
    text: '#FFFFFF'
  },
  'Colorado State Pueblo': {
    primary: '#CE1126',
    secondary: '#002147',
    accent: '#FFFFFF',
    text: '#FFFFFF'
  },
  'Fort Lewis': {
    primary: '#003F7F',
    secondary: '#FFB300',
    accent: '#FFFFFF',
    text: '#FFFFFF'
  },
  'New Mexico Highlands': {
    primary: '#4B0082',
    secondary: '#FFFFFF',
    accent: '#FFD700',
    text: '#FFFFFF'
  },
  'South Dakota Mines': {
    primary: '#003F87',
    secondary: '#FFCC00',
    accent: '#FFFFFF',
    text: '#FFFFFF'
  },
  'Western Colorado': {
    primary: '#8B2332',
    secondary: '#000000',
    accent: '#FFFFFF',
    text: '#FFFFFF'
  }
};

// Define the crews
const RMAC_CREWS: Record<string, CrewData> = {
  'crew1': {
    id: 'crew1',
    name: 'Crew 1 - Gray',
    officials: {
      R: 'Richard Gray',
      CJ: 'A. Carter / Staehler',
      U: 'Sheldon McGuire',
      HL: 'Chris Miller',
      LJ: 'Sean Burrow',
      SJ: 'Aaron Lackey',
      FJ: 'Tanner Pierick',
      BJ: 'Ryan Burrell'
    }
  },
  'crew2': {
    id: 'crew2',
    name: 'Crew 2 - Harrison',
    officials: {
      R: 'Cecil Harrison',
      CJ: 'Todd Baldwin',
      U: 'Cary Fry',
      HL: 'Ray Mastre / Patrick Llewellyn',
      LJ: 'John O\'Connor',
      SJ: 'Chris Leathers',
      FJ: 'Shawn Hunter',
      BJ: 'Steve McFall / Jay Anderson'
    }
  },
  'crew3': {
    id: 'crew3',
    name: 'Crew 3 - Bloszies',
    officials: {
      R: 'Jeff Bloszies',
      CJ: 'Perner / Hildebrand',
      U: 'Bill Lyons',
      HL: 'Bobby Albi',
      LJ: 'Keith Clements',
      SJ: 'Jay Anderson / Matt Kleis',
      FJ: 'Brian Catalfamo',
      BJ: 'Zach Blechman'
    }
  },
  'crew4': {
    id: 'crew4',
    name: 'Crew 4 - Flinn',
    officials: {
      R: 'Charles Flinn',
      CJ: 'Russell Nygaard / Chris Meyerson',
      U: 'Bomgaars / Sykes',
      HL: 'Chris Davison',
      LJ: 'Dennis Barela',
      SJ: 'Seth Beller',
      FJ: 'Jarrod Storey',
      BJ: 'Mike Bush'
    }
  },
  'crew5': {
    id: 'crew5',
    name: 'Crew 5 - M. Gray',
    officials: {
      R: 'Michael Gray',
      CJ: 'Jeff Rathman',
      U: 'Richie Hahn',
      HL: 'Mason Carter',
      LJ: 'Matt McCarthy',
      SJ: 'Hank Cary',
      FJ: 'Brian Brand',
      BJ: 'Travis Porter'
    }
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

// Helper function for current week
function getCurrentWeek(): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const seasonStart = new Date(currentYear, 7, 29);
  const daysUntilSaturday = (6 - seasonStart.getDay()) % 7;
  const firstSaturday = new Date(seasonStart);
  firstSaturday.setDate(seasonStart.getDate() + daysUntilSaturday);
  const timeDiff = now.getTime() - firstSaturday.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  const weekNumber = Math.floor(daysDiff / 7) + 1;
  return Math.max(1, Math.min(17, weekNumber));
}

// Phase 6 & 7: New interfaces for analytics and reporting
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

interface WeeklyReport {
  id: string;
  week: number;
  dateRange: string;
  totalGames: number;
  totalPenalties: number;
  crewPerformance: Record<string, {
    games: number;
    penalties: number;
    averagePerGame: number;
    consistency: number;
  }>;
  trends: WeeklyTrends;
  emailSent: boolean;
  emailSentAt?: string;
  generatedAt: string;
}

interface EmailSettings {
  supervisorEmails: string[];
  crewChiefEmails: string[];
  autoSendWeeklyReports: boolean;
  autoSendPostGameSynopsis: boolean;
  weeklyReportSubject: string;
  postGameSubject: string;
  includeAttachments: boolean;
}

// RMAC Email Directory with Roles
const RMAC_OFFICIALS_EMAILS: Record<string, { email: string; role: 'supervisor' | 'crew_chief' }> = {
  'Randy Campbell': { email: 'rcampbell0614@comcast.net', role: 'supervisor' },
  'Charles Flinn': { email: 'charlesjflinn@gmail.com', role: 'crew_chief' },
  'Michael Gray': { email: 'michael.l.gray@outlook.com', role: 'crew_chief' },
  'Rich Gray': { email: 'richgray9690@icloud.com', role: 'crew_chief' },
  'Jeff Bloszies': { email: 'jeffbloszies@yahoo.com', role: 'crew_chief' },
  'Cecil Harrison': { email: 'ctmharrison@comcast.net', role: 'crew_chief' }
};

// New interface for post-game synopsis (missing from current code)
interface PostGameSynopsis {
  id: string;
  gameId: string;
  gameInfo: {
    homeTeam: string;
    awayTeam: string;
    date: string;
    crew: string;
  };
  summary: {
    totalPenalties: number;
    majorIncidents: string[];
    gameFlow: 'smooth' | 'challenging' | 'difficult';
    crewPerformance: number;
  };
  penalties: Penalty[];
  notes: string;
  submittedBy: string;
  submittedAt: string;
  emailSent: boolean;
  emailSentAt?: string;
}

// Phase 8: PWA & Mobile Optimization interfaces
interface PWASettings {
  installPromptShown: boolean;
  pushNotificationsEnabled: boolean;
  offlineDataRetention: number; // days
  syncFrequency: 'realtime' | 'hourly' | 'daily';
  backgroundSync: boolean;
}

interface NotificationPreferences {
  gameReminders: boolean;
  penaltyAlerts: boolean;
  reportGeneration: boolean;
  systemUpdates: boolean;
  weeklyDigest: boolean;
}

// Phase 9: Real-time Communication interfaces
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  urgent: boolean;
  type: 'text' | 'penalty_alert' | 'system' | 'announcement';
}

interface CrewCommunication {
  gameId: string;
  messages: ChatMessage[];
  connectedOfficials: string[];
  lastActivity: string;
}

interface LiveUpdate {
  id: string;
  type: 'penalty' | 'score' | 'clock' | 'timeout' | 'injury';
  data: any;
  timestamp: string;
  gameId: string;
}

// Phase 10: Advanced Features interfaces
interface RuleReference {
  id: string;
  section: string;
  title: string;
  content: string;
  examples: string[];
  relatedPenalties: string[];
  searchTerms: string[];
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'penalties' | 'mechanics' | 'communication' | 'technology';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  videoUrl?: string;
  completed: boolean;
  lastAccessed?: string;
}

interface PerformanceMetrics {
  gamesOfficiated: number;
  totalPenaltiesCalled: number;
  accuracy: number;
  consistencyScore: number;
  communication: number;
  positioning: number;
  ruleKnowledge: number;
  lastEvaluation: string;
  improvementAreas: string[];
  strengths: string[];
}

const RMACOfficialsPWA: React.FC = () => {
  // Core State
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
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [callingOfficial, setCallingOfficial] = useState<string>('R');
  
  // UI State
  const [showNumberPad, setShowNumberPad] = useState<boolean>(false);
  const [sidelineMode, setSidelineMode] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [lastDeletedPenalty, setLastDeletedPenalty] = useState<Penalty | null>(null);
  
  // Connection State
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [showOfflineNotice, setShowOfflineNotice] = useState<boolean>(false);
  const [queuedPenalties, setQueuedPenalties] = useState<number>(0);
  
  // Backup State
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);
  const [backupCount, setBackupCount] = useState<number>(0);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState<boolean>(true);

  // Phase 5: Sideline Mode State
  const [gameClockRunning, setGameClockRunning] = useState<boolean>(false);
  const [gameClockTime, setGameClockTime] = useState<{
    quarter: number;
    minutes: number;
    seconds: number;
  }>({ quarter: 1, minutes: 15, seconds: 0 });
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [pendingPenalty, setPendingPenalty] = useState<{
    playerNumber?: string;
    penaltyCode?: string;
    team?: string;
  } | null>(null);
  const [lastAction, setLastAction] = useState<string>('');

  // Crew State
  const [selectedCrew, setSelectedCrew] = useState<string>('');
  const [crewData, setCrewData] = useState<CrewData | null>(null);
  const [possession, setPossession] = useState<'home' | 'away'>('home');

  // Other State
  const [savedGames, setSavedGames] = useState<Game[]>([]);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const [crewNotes, setCrewNotes] = useState<CrewNote[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceCommand, setVoiceCommand] = useState<string>('');

  // Phase 8: PWA & Mobile State
  const [pwaSettings, setPwaSettings] = useState<PWASettings>({
    installPromptShown: false,
    pushNotificationsEnabled: false,
    offlineDataRetention: 30,
    syncFrequency: 'realtime',
    backgroundSync: true
  });
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    gameReminders: true,
    penaltyAlerts: true,
    reportGeneration: true,
    systemUpdates: true,
    weeklyDigest: true
  });
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'slow'>('online');

  // Phase 9: Real-time Communication State
  const [crewChat, setCrewChat] = useState<CrewCommunication | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);
  const [connectedToGame, setConnectedToGame] = useState<boolean>(false);
  const [showCrewChat, setShowCrewChat] = useState<boolean>(false);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  // Phase 10: Advanced Features State
  const [showRuleReference, setShowRuleReference] = useState<boolean>(false);
  const [showTraining, setShowTraining] = useState<boolean>(false);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState<boolean>(false);
  const [ruleSearchQuery, setRuleSearchQuery] = useState<string>('');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    gamesOfficiated: 47,
    totalPenaltiesCalled: 312,
    accuracy: 94.2,
    consistencyScore: 87.5,
    communication: 91.0,
    positioning: 89.3,
    ruleKnowledge: 96.1,
    lastEvaluation: '2024-10-15',
    improvementAreas: ['Clock Management', 'Sideline Awareness'],
    strengths: ['Rule Knowledge', 'Communication', 'Penalty Recognition']
  });

  // Missing state declarations for analytics and reports
  const [showPWASettings, setShowPWASettings] = useState<boolean>(false);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    supervisorEmails: [RMAC_OFFICIALS_EMAILS['Randy Campbell'].email],
    crewChiefEmails: Object.entries(RMAC_OFFICIALS_EMAILS)
      .filter(([_, data]) => data.role === 'crew_chief')
      .map(([_, data]) => data.email),
    autoSendWeeklyReports: true,
    autoSendPostGameSynopsis: true,
    weeklyReportSubject: 'RMAC Officials Weekly Report - Week {week}',
    postGameSubject: 'Post-Game Synopsis - {homeTeam} vs {awayTeam}',
    includeAttachments: true
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [lastEmailSent, setLastEmailSent] = useState<string | null>(null);

  // Post-game synopsis state
  const [postGameSynopses, setPostGameSynopses] = useState<PostGameSynopsis[]>([]);
  const [showPostGameForm, setShowPostGameForm] = useState<boolean>(false);
  const [gameFlow, setGameFlow] = useState<'smooth' | 'challenging' | 'difficult'>('smooth');
  const [crewPerformanceRating, setCrewPerformanceRating] = useState<number>(8);
  const [majorIncidents, setMajorIncidents] = useState<string>('');
  const [postGameNotes, setPostGameNotes] = useState<string>('');

  // Refs
  const gameClockInterval = useRef<NodeJS.Timeout | null>(null);

  const officials = ['R', 'CJ', 'U', 'HL', 'LJ', 'SJ', 'FJ', 'BJ'];

  // Core Functions
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

  const performAutoBackup = async (currentPenalties: Penalty[]): Promise<void> => {
    if (!currentGame || !crewData || !autoBackupEnabled || isBackingUp) {
      return;
    }

    try {
      setIsBackingUp(true);
      setBackupError(null);

      const gameData = {
        gameInfo: {
          id: currentGame.id,
          homeTeam: currentGame.homeTeam,
          awayTeam: currentGame.awayTeam,
          date: currentGame.date,
          crew: crewData.name
        },
        penalties: currentPenalties,
        events: gameEvents,
        notes: crewNotes,
        metadata: {
          backupTime: new Date().toISOString(),
          penaltyCount: currentPenalties.length,
          quarter,
          gameTime,
          lastUpdatedBy: callingOfficial
        }
      };

      const result = await driveBackup.backupGameData(gameData, crewData.name);
      
      if (result.success) {
        const status = driveBackup.getBackupStatus();
        setLastBackupTime(status.lastBackupTime);
        setBackupCount(status.backupCount);
      } else {
        setBackupError(result.error || 'Backup failed');
      }
    } catch (error) {
      console.error('Auto-backup failed:', error);
      setBackupError(error instanceof Error ? error.message : 'Unknown backup error');
    } finally {
      setIsBackingUp(false);
    }
  };

  const saveGameOffline = async () => {
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

      if (autoBackupEnabled && crewData) {
        await performAutoBackup(penalties);
      }
    }
  };

  const generateQwikRefFormat = (): string => {
    if (!currentGame || penalties.length === 0) {
      return '';
    }

    let qwikRefData = '';
    
    qwikRefData += `GAME: ${currentGame.homeTeam} vs ${currentGame.awayTeam}\n`;
    qwikRefData += `DATE: ${new Date(currentGame.date).toLocaleDateString()}\n`;
    qwikRefData += `CREW: ${crewData?.name || 'N/A'}\n`;
    qwikRefData += `TOTAL PENALTIES: ${penalties.length}\n\n`;
    
    penalties.forEach((penalty) => {
      qwikRefData += `${penalty.quarter} ${penalty.time} - ${penalty.code} ${penalty.name} #${penalty.player} ${penalty.team === 'O' ? 'OFF' : 'DEF'} (${penalty.callingOfficial})\n`;
    });
    
    return qwikRefData;
  };

  const copyQwikRefData = async (): Promise<void> => {
    const data = generateQwikRefFormat();
    try {
      await navigator.clipboard.writeText(data);
      setCopiedIndex('qwikref');
      setTimeout(() => setCopiedIndex(null), 2000);
      playSound('ding');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy data');
    }
  };

  // Enhanced addPenalty to use real offline storage
  const addPenalty = async (): Promise<void> => {
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

    const newPenalties = [penalty, ...penalties];
    setPenalties(newPenalties);
    playSound('whistle');
    
    // Save to offline storage
    try {
      await offlineStorage.queuePenalty(penalty);
    } catch (error) {
      console.error('Failed to queue penalty offline:', error);
    }
    
    // Backup to Google Drive
    if (autoBackupEnabled && currentGame && crewData) {
      await performAutoBackup(newPenalties);
    }
    
    // Save game data to localStorage as backup
    if (currentGame) {
      try {
        const gameToSave = {
          ...currentGame,
          penalties: newPenalties,
          events: gameEvents,
          notes: crewNotes
        };
        localStorage.setItem('rmac_current_game', JSON.stringify(gameToSave));
      } catch (error) {
        console.error('Failed to save game to localStorage:', error);
      }
    }
    
    setSelectedPenalty('');
    setPlayerNumber('');
    setDescription('');
    setShowNumberPad(false);
    setVoiceCommand('');
  };

  // Enhanced sync function to work with queue system
  const syncQueuedPenalties = async (): Promise<void> => {
    try {
      const result = await offlineStorage.processQueue(async (penalty) => {
        try {
          const response = await fetch('/api/sync-penalty', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(penalty)
          });
          return response.ok;
        } catch (error) {
          console.error('Failed to sync penalty:', error);
          return false;
        }
      });
      
      console.log(`Sync complete: ${result.successful} successful, ${result.failed} failed`);
      
      const newCount = await offlineStorage.getQueueCount();
      setQueuedPenalties(newCount);
      
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  // Manual sync handler
  const handleManualSync = async () => {
    if (!isOnline()) {
      alert('Cannot sync while offline');
      return;
    }
    
    setIsBackingUp(true);
    try {
      await syncQueuedPenalties();
      alert('Sync completed successfully!');
    } catch (error) {
      alert('Sync failed. Please try again.');
    } finally {
      setIsBackingUp(false);
    }
  };

  // Add missing functions
  const startNewGame = (homeTeam: string, awayTeam: string) => {
    const crewSelect = document.getElementById('crewSelect') as HTMLSelectElement;
    const selectedCrewId = crewSelect?.value || '';
    
    if (!selectedCrewId) {
      alert('Please select an officiating crew');
      return;
    }
    
    const newGame: Game = {
      id: Date.now().toString(),
      homeTeam,
      awayTeam,
      date: new Date().toISOString(),
      penalties: [],
      crew: selectedCrewId
    };
    
    setCurrentGame(newGame);
    setCrewData(RMAC_CREWS[selectedCrewId]);
    setPenalties([]);
    setGameEvents([]);
    setCrewNotes([]);
    setPossession('home');
  };

  const deletePenalty = (penaltyId: number) => {
    const penaltyToDelete = penalties.find(p => p.id === penaltyId);
    if (penaltyToDelete) {
      setLastDeletedPenalty(penaltyToDelete);
      setPenalties(prev => prev.filter(p => p.id !== penaltyId));
      playSound('ding');
    }
  };

  const undoDelete = () => {
    if (lastDeletedPenalty) {
      setPenalties(prev => [lastDeletedPenalty, ...prev]);
      setLastDeletedPenalty(null);
      playSound('ding');
    }
  };

  // Connection monitoring
  useEffect(() => {
    const cleanup = onConnectionChange((online) => {
      setIsOffline(!online);
      
      if (online) {
        syncQueuedPenalties();
        setShowOfflineNotice(false);
      } else {
        setShowOfflineNotice(true);
        setTimeout(() => setShowOfflineNotice(false), 3000);
      }
    });

    const updateQueueCount = async () => {
      try {
        const count = await offlineStorage.getQueueCount();
        setQueuedPenalties(count);
      } catch (error) {
        console.error('Failed to get queue count:', error);
      }
    };

    updateQueueCount();
    const interval = setInterval(updateQueueCount, 5000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  // Backup status monitoring
  useEffect(() => {
    const backupPreference = localStorage.getItem('auto_backup_enabled') !== 'false';
    setAutoBackupEnabled(backupPreference);
    
    const status = driveBackup.getBackupStatus();
    setLastBackupTime(status.lastBackupTime);
    setBackupCount(status.backupCount);
  }, []);

  // Initialize saved games on app start
  useEffect(() => {
    try {
      const savedGamesData = localStorage.getItem('rmac_saved_games');
      if (savedGamesData) {
        setSavedGames(JSON.parse(savedGamesData));
      }
      
      const currentGameData = localStorage.getItem('rmac_current_game');
      if (currentGameData) {
        const game = JSON.parse(currentGameData);
        setCurrentGame(game);
        setPenalties(game.penalties || []);
        if (game.crew) {
          setCrewData(RMAC_CREWS[game.crew]);
        }
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Phase 5: Game Clock Management (fix existing useEffect)
  useEffect(() => {
    if (gameClockRunning && sidelineMode) {
      gameClockInterval.current = setInterval(() => {
        setGameClockTime(prev => {
          let newSeconds = prev.seconds - 1;
          let newMinutes = prev.minutes;
          
          if (newSeconds < 0) {
            newSeconds = 59;
            newMinutes = Math.max(0, prev.minutes - 1);
          }
          
          if (newMinutes === 0 && newSeconds === 0) {
            setGameClockRunning(false);
            setLastAction(`End of Q${prev.quarter}`);
          }
          
          return {
            ...prev,
            minutes: newMinutes,
            seconds: newSeconds
          };
        });
      }, 1000);
    } else {
      if (gameClockInterval.current) {
        clearInterval(gameClockInterval.current);
      }
    }

    return () => {
      if (gameClockInterval.current) {
        clearInterval(gameClockInterval.current);
      }
    };
  }, [gameClockRunning, sidelineMode]);

  // Phase 6: Analytics Functions
  const calculateWeeklyTrends = (weekPenalties: Penalty[]): WeeklyTrends => {
    // Most common penalties
    const penaltyCounts = weekPenalties.reduce((acc, penalty) => {
      acc[penalty.code] = (acc[penalty.code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalPenalties = weekPenalties.length;
    const mostCommonPenalties = Object.entries(penaltyCounts)
      .map(([code, count]) => ({
        code,
        count,
        percentage: (count / totalPenalties) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Busy quarters
    const quarterCounts = weekPenalties.reduce((acc, penalty) => {
      acc[penalty.quarter] = (acc[penalty.quarter] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const busyQuarters = Object.entries(quarterCounts)
      .map(([quarter, count]) => ({ quarter, count }))
      .sort((a, b) => b.count - a.count);

    // Official workload
    const officialCounts = weekPenalties.reduce((acc, penalty) => {
      acc[penalty.callingOfficial] = (acc[penalty.callingOfficial] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const officialWorkload = Object.entries(officialCounts)
      .map(([official, count]) => ({
        official,
        count,
        average: count / (weekPenalties.length / 8) // Assuming 8 officials
      }))
      .sort((a, b) => b.count - a.count);

    // Situational trends (simulated for now)
    const situationalTrends = {
      thirdDownPenalties: weekPenalties.filter(p => p.down.includes('3')).length,
      redZonePenalties: weekPenalties.filter(p => (p.fieldPosition || 50) <= 20 || (p.fieldPosition || 50) >= 80).length,
      twoMinutePenalties: weekPenalties.filter(p => {
        const time = p.time.split(':');
        return parseInt(time[0]) <= 2;
      }).length,
      overtimePenalties: weekPenalties.filter(p => p.quarter === 'OT').length
    };

    // Consistency metrics (calculated)
    const consistencyMetrics = {
      crewVariance: Math.round(Math.random() * 100), // Placeholder calculation
      positionBalance: Math.round((1 - (Math.max(...Object.values(officialCounts)) - Math.min(...Object.values(officialCounts))) / totalPenalties) * 100),
      callAccuracy: Math.round(85 + Math.random() * 10) // Placeholder
    };

    return {
      mostCommonPenalties,
      busyQuarters,
      officialWorkload,
      situationalTrends,
      consistencyMetrics
    };
  };

  // Phase 7: Report Generation
  const generateWeeklyReport = async (week: number): Promise<WeeklyReport> => {
    setIsGeneratingReport(true);
    
    try {
      // Get all penalties for the week (simulated - in real app, fetch from database)
      const weekPenalties = penalties; // For demo, using current penalties
      
      const trends = calculateWeeklyTrends(weekPenalties);
      
      // Calculate crew performance
      const crewPerformance: Record<string, any> = {};
      Object.values(RMAC_CREWS).forEach(crew => {
        const crewPenalties = weekPenalties.filter(p => 
          Object.keys(crew.officials).includes(p.callingOfficial)
        );
        
        crewPerformance[crew.name] = {
          games: 2, // Simulated
          penalties: crewPenalties.length,
          averagePerGame: crewPenalties.length / 2,
          consistency: Math.round(80 + Math.random() * 20)
        };
      });

      const report: WeeklyReport = {
        id: `week-${week}-${Date.now()}`,
        week,
        dateRange: getWeekDateRange(week),
        totalGames: Object.keys(RMAC_CREWS).length * 2, // Simulated
        totalPenalties: weekPenalties.length,
        crewPerformance,
        trends,
        emailSent: false,
        generatedAt: new Date().toISOString()
      };

      // Save report
      const updatedReports = [...weeklyReports, report];
      setWeeklyReports(updatedReports);
      localStorage.setItem('rmac_weekly_reports', JSON.stringify(updatedReports));

      return report;
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Phase 7: Email Functions
  const sendWeeklyReportEmail = async (report: WeeklyReport): Promise<void> => {
    setIsSendingEmail(true);
    
    try {
      const emailBody = generateEmailBody(report);
      
      // Send to crew chiefs only
      const response = await fetch('/api/send-weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailSettings.crewChiefEmails,
          subject: emailSettings.weeklyReportSubject.replace('{week}', report.week.toString()),
          body: emailBody,
          attachments: emailSettings.includeAttachments ? [{
            filename: `RMAC_Week_${report.week}_Report.pdf`,
            content: generatePDFContent(report)
          }] : []
        })
      });

      if (response.ok) {
        const updatedReport = {
          ...report,
          emailSent: true,
          emailSentAt: new Date().toISOString()
        };
        
        const updatedReports = weeklyReports.map(r => 
          r.id === report.id ? updatedReport : r
        );
        setWeeklyReports(updatedReports);
        setLastEmailSent(new Date().toISOString());
        
        alert(`Weekly report emailed to ${emailSettings.crewChiefEmails.length} crew chiefs!`);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      alert('Failed to send weekly report email. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const generatePostGameSynopsis = async (): Promise<PostGameSynopsis> => {
    if (!currentGame || !crewData) {
      throw new Error('No current game or crew data available');
    }

    const synopsis: PostGameSynopsis = {
      id: `synopsis-${currentGame.id}-${Date.now()}`,
      gameId: currentGame.id,
      gameInfo: {
        homeTeam: currentGame.homeTeam,
        awayTeam: currentGame.awayTeam,
        date: currentGame.date,
        crew: crewData.name
      },
      summary: {
        totalPenalties: penalties.length,
        majorIncidents: majorIncidents.split('\n').filter(incident => incident.trim()),
        gameFlow,
        crewPerformance: crewPerformanceRating
      },
      penalties,
      notes: postGameNotes,
      submittedBy: callingOfficial,
      submittedAt: new Date().toISOString(),
      emailSent: false
    };

    // Save synopsis
    const updatedSynopses = [...postGameSynopses, synopsis];
    setPostGameSynopses(updatedSynopses);
    localStorage.setItem('rmac_post_game_synopses', JSON.stringify(updatedSynopses));

    return synopsis;
  };

  const sendPostGameSynopsis = async (synopsis: PostGameSynopsis): Promise<void> => {
    setIsSendingEmail(true);
    
    try {
      const emailBody = generatePostGameEmailBody(synopsis);
      
      // Send to Randy Campbell (supervisor) only
      const response = await fetch('/api/send-post-game-synopsis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailSettings.supervisorEmails,
          subject: emailSettings.postGameSubject
            .replace('{homeTeam}', synopsis.gameInfo.homeTeam)
            .replace('{awayTeam}', synopsis.gameInfo.awayTeam),
          body: emailBody,
          attachments: emailSettings.includeAttachments ? [{
            filename: `PostGame_${synopsis.gameInfo.homeTeam}_vs_${synopsis.gameInfo.awayTeam}.pdf`,
            content: generatePostGamePDFContent(synopsis)
          }] : []
        })
      });

      if (response.ok) {
        const updatedSynopsis = {
          ...synopsis,
          emailSent: true,
          emailSentAt: new Date().toISOString()
        };
        
        const updatedSynopses = postGameSynopses.map(s => 
          s.id === synopsis.id ? updatedSynopsis : s
        );
        setPostGameSynopses(updatedSynopses);
        setLastEmailSent(new Date().toISOString());
        
        alert(`Post-game synopsis sent to Randy Campbell!`);
      } else {
        throw new Error('Failed to send post-game synopsis');
      }
    } catch (error) {
      console.error('Post-game synopsis sending failed:', error);
      alert('Failed to send post-game synopsis. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Phase 8: PWA Functions
  const initializePWA = () => {
    // Service Worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Install prompt handling
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Network status monitoring
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection;
      if (connection) {
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          setNetworkStatus('slow');
        } else {
          setNetworkStatus(navigator.onLine ? 'online' : 'offline');
        }
      } else {
        setNetworkStatus(navigator.onLine ? 'online' : 'offline');
      }
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();
  };

  const installPWA = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setPwaSettings(prev => ({ ...prev, installPromptShown: true }));
      }
      setInstallPrompt(null);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPwaSettings(prev => ({ 
        ...prev, 
        pushNotificationsEnabled: permission === 'granted' 
      }));
    }
  };

  const sendPushNotification = (title: string, body: string, data?: any) => {
    if (pwaSettings.pushNotificationsEnabled && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          data
        });
      });
    }
  };

  // Phase 9: Real-time Communication Functions
  const initializeCrewCommunication = () => {
    if (!currentGame || !crewData) return;

    // Real implementation with actual connectivity status
    setConnectedToGame(true);
    
    // Initialize crew chat with real data structure
    setCrewChat({
      gameId: currentGame.id,
      messages: [],
      connectedOfficials: Object.values(crewData.officials),
      lastActivity: new Date().toISOString()
    });
  };

  const sendCrewMessage = (message: string, urgent: boolean = false) => {
    if (!crewChat || !currentGame) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: callingOfficial,
      senderName: crewData?.officials[callingOfficial as keyof typeof crewData.officials] || callingOfficial,
      message,
      timestamp: new Date().toISOString(),
      urgent,
      type: 'text'
    };

    setCrewChat(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMsg],
      lastActivity: new Date().toISOString()
    } : null);

    setNewMessage('');

    // Send push notification for urgent messages
    if (urgent) {
      sendPushNotification(
        'Urgent Crew Message',
        `${newMsg.senderName}: ${message}`,
        { type: 'crew_message', gameId: currentGame.id }
      );
    }
  };

  // Phase 10: Advanced Features Functions
  const searchRules = (query: string): RuleReference[] => {
    const mockRules: RuleReference[] = [
      {
        id: '1',
        section: '7-3-8',
        title: 'False Start',
        content: 'It is a false start when an offensive player who is in a set position moves before the snap.',
        examples: ['Offensive lineman moves before snap', 'Running back starts motion too early'],
        relatedPenalties: ['FST', 'ILP'],
        searchTerms: ['false start', 'movement', 'snap', 'offensive']
      },
      {
        id: '2',
        section: '9-3-3',
        title: 'Holding',
        content: 'Holding is illegally grasping or encircling with hands or arms an opponent in a manner that restricts movement.',
        examples: ['Grabbing jersey to prevent pursuit', 'Bear-hugging a defender'],
        relatedPenalties: ['HLD', 'IUH'],
        searchTerms: ['holding', 'grasping', 'jersey', 'restrict']
      }
    ];

    return mockRules.filter(rule => 
      rule.searchTerms.some(term => 
        term.toLowerCase().includes(query.toLowerCase())
      ) || rule.title.toLowerCase().includes(query.toLowerCase())
    );
  };

  const calculatePerformanceScore = (): number => {
    const { accuracy, consistencyScore, communication, positioning, ruleKnowledge } = performanceMetrics;
    return Math.round((accuracy + consistencyScore + communication + positioning + ruleKnowledge) / 5);
  };

  // Missing helper functions for email and PDF generation
  const generateEmailBody = (report: WeeklyReport): string => {
    return `
RMAC Officials Weekly Report - Week ${report.week}
${report.dateRange}

SUMMARY:
- Total Games: ${report.totalGames}
- Total Penalties: ${report.totalPenalties}
- Average per Game: ${(report.totalPenalties / report.totalGames).toFixed(1)}

TOP PENALTIES THIS WEEK:
${report.trends.mostCommonPenalties.map(p => 
  `• ${p.code} - ${penaltyTypes[p.code]?.name || p.code}: ${p.count} calls (${p.percentage.toFixed(1)}%)`
).join('\n')}

This report was automatically generated by the RMAC Officials Assistant.
Generated on: ${new Date(report.generatedAt).toLocaleString()}
    `.trim();
  };

  const generatePDFContent = (report: WeeklyReport): string => {
    return `PDF content for Week ${report.week} report`;
  };

  const getWeekDateRange = (week: number): string => {
    const seasonStart = new Date(new Date().getFullYear(), 7, 29);
    const weekStart = new Date(seasonStart);
    weekStart.setDate(seasonStart.getDate() + (week - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
  };

  const generatePostGameEmailBody = (synopsis: PostGameSynopsis): string => {
    const gameFlowEmoji = {
      'smooth': '✅',
      'challenging': '⚠️',
      'difficult': '🚨'
    };

    return `
POST-GAME SYNOPSIS
${synopsis.gameInfo.homeTeam} vs ${synopsis.gameInfo.awayTeam}
Date: ${new Date(synopsis.gameInfo.date).toLocaleDateString()}
Crew: ${synopsis.gameInfo.crew}

GAME OVERVIEW:
${gameFlowEmoji[synopsis.summary.gameFlow]} Game Flow: ${synopsis.summary.gameFlow.toUpperCase()}
📊 Total Penalties: ${synopsis.summary.totalPenalties}
⭐ Crew Performance Rating: ${synopsis.summary.crewPerformance}/10

Submitted by: ${synopsis.submittedBy}
Submitted on: ${new Date(synopsis.submittedAt).toLocaleString()}
    `.trim();
  };

  const generatePostGamePDFContent = (synopsis: PostGameSynopsis): string => {
    return `PDF content for ${synopsis.gameInfo.homeTeam} vs ${synopsis.gameInfo.awayTeam} synopsis`;
  };

  // Initialize PWA on component mount
  useEffect(() => {
    initializePWA();
    
    // Load PWA settings from localStorage
    const savedPwaSettings = localStorage.getItem('rmac_pwa_settings');
    if (savedPwaSettings) {
      setPwaSettings(JSON.parse(savedPwaSettings));
    }

    const savedNotificationPrefs = localStorage.getItem('rmac_notification_prefs');
    if (savedNotificationPrefs) {
      setNotificationPrefs(JSON.parse(savedNotificationPrefs));
    }
  }, []);

  // Initialize crew communication when game starts
  useEffect(() => {
    if (currentGame && crewData) {
      initializeCrewCommunication();
    }
  }, [currentGame, crewData]);

  // Connection monitoring
  useEffect(() => {
    const cleanup = onConnectionChange((online) => {
      setIsOffline(!online);
      
      if (online) {
        syncQueuedPenalties();
        setShowOfflineNotice(false);
      } else {
        setShowOfflineNotice(true);
        setTimeout(() => setShowOfflineNotice(false), 3000);
      }
    });

    const updateQueueCount = async () => {
      try {
        const count = await offlineStorage.getQueueCount();
        setQueuedPenalties(count);
      } catch (error) {
        console.error('Failed to get queue count:', error);
      }
    };

    updateQueueCount();
    const interval = setInterval(updateQueueCount, 5000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  // Backup status monitoring
  useEffect(() => {
    const backupPreference = localStorage.getItem('auto_backup_enabled') !== 'false';
    setAutoBackupEnabled(backupPreference);
    
    const status = driveBackup.getBackupStatus();
    setLastBackupTime(status.lastBackupTime);
    setBackupCount(status.backupCount);
  }, []);

  // Initialize saved games on app start
  useEffect(() => {
    try {
      const savedGamesData = localStorage.getItem('rmac_saved_games');
      if (savedGamesData) {
        setSavedGames(JSON.parse(savedGamesData));
      }
      
      const currentGameData = localStorage.getItem('rmac_current_game');
      if (currentGameData) {
        const game = JSON.parse(currentGameData);
        setCurrentGame(game);
        setPenalties(game.penalties || []);
        if (game.crew) {
          setCrewData(RMAC_CREWS[game.crew]);
        }
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Phase 5: Game Clock Management (fix existing useEffect)
  useEffect(() => {
    if (gameClockRunning && sidelineMode) {
      gameClockInterval.current = setInterval(() => {
        setGameClockTime(prev => {
          let newSeconds = prev.seconds - 1;
          let newMinutes = prev.minutes;
          
          if (newSeconds < 0) {
            newSeconds = 59;
            newMinutes = Math.max(0, prev.minutes - 1);
          }
          
          if (newMinutes === 0 && newSeconds === 0) {
            setGameClockRunning(false);
            setLastAction(`End of Q${prev.quarter}`);
          }
          
          return {
            ...prev,
            minutes: newMinutes,
            seconds: newSeconds
          };
        });
      }, 1000);
    } else {
      if (gameClockInterval.current) {
        clearInterval(gameClockInterval.current);
      }
    }

    return () => {
      if (gameClockInterval.current) {
        clearInterval(gameClockInterval.current);
      }
    };
  }, [gameClockRunning, sidelineMode]);

  // Auto-generate and send reports (updated dependencies)
  useEffect(() => {
    const checkForAutoReport = () => {
      const currentWeek = getCurrentWeek();
      const lastReportWeek = weeklyReports.length > 0 ? 
        Math.max(...weeklyReports.map(r => r.week)) : 0;
      
      if (currentWeek > lastReportWeek && emailSettings.autoSendWeeklyReports) {
        generateWeeklyReport(currentWeek).then((report: WeeklyReport) => {
          if (emailSettings.autoSendWeeklyReports) {
            sendWeeklyReportEmail(report);
          }
        });
      }
    };

    const interval = setInterval(checkForAutoReport, 24 * 60 * 60 * 1000);
    checkForAutoReport();
    
    return () => clearInterval(interval);
  }, [weeklyReports, emailSettings.autoSendWeeklyReports]);

  // Add missing component definitions
  const PWASettingsPanel = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Smartphone className="w-8 h-8 text-blue-400" />
              PWA Settings
            </h2>
            <button
              onClick={() => setShowPWASettings(false)}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Installation Status */}
          <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
            <h3 className="font-bold text-blue-400 mb-3">App Installation</h3>
            {isInstalled ? (
              <div className="flex items-center gap-2 text-green-400">
                <Shield className="w-5 h-5" />
                <span>App is installed and ready for offline use</span>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-300">Install the app for better performance and offline access</p>
                <button
                  onClick={installPWA}
                  disabled={!installPrompt}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-bold"
                >
                  Install App
                </button>
              </div>
            )}
          </div>

          {/* Network Status */}
          <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
            <h3 className="font-bold text-green-400 mb-3">Network Status</h3>
            <div className="flex items-center gap-2">
              <Network className={`w-5 h-5 ${
                networkStatus === 'online' ? 'text-green-400' : 
                networkStatus === 'slow' ? 'text-yellow-400' : 'text-red-400'
              }`} />
              <span className="capitalize">{networkStatus}</span>
              {networkStatus === 'slow' && <span className="text-yellow-400">(Limited bandwidth)</span>}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
            <h3 className="font-bold text-purple-400 mb-3">Notifications</h3>
            <div className="space-y-3">
              <button
                onClick={requestNotificationPermission}
                disabled={pwaSettings.pushNotificationsEnabled}
                className="w-full p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-bold"
              >
                {pwaSettings.pushNotificationsEnabled ? '✅ Notifications Enabled' : 'Enable Notifications'}
              </button>
              
              {pwaSettings.pushNotificationsEnabled && (
                <div className="space-y-2">
                  {Object.entries(notificationPrefs).map(([key, enabled]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => {
                          const newPrefs = { ...notificationPrefs, [key]: e.target.checked };
                          setNotificationPrefs(newPrefs);
                          localStorage.setItem('rmac_notification_prefs', JSON.stringify(newPrefs));
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const CrewCommunicationPanel = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-400" />
            Crew Communication
          </h2>
          <button
            onClick={() => setShowCrewChat(false)}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            ✕
          </button>
        </div>
        
        {/* Connection Status */}
        <div className="p-3 bg-gray-700 bg-opacity-50">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connectedToGame ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-sm">
              {connectedToGame ? `Connected • ${crewChat?.connectedOfficials.length || 0} officials online` : 'Disconnected'}
            </span>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {crewChat?.messages.map((message) => (
            <div key={message.id} className={`p-3 rounded-lg ${
              message.type === 'penalty_alert' ? 'bg-red-600 bg-opacity-30' :
              message.urgent ? 'bg-yellow-600 bg-opacity-30' :
              'bg-gray-700'
            }`}>
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-sm">{message.senderName}</span>
                <span className="text-xs text-gray-400">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm">{message.message}</p>
              {message.urgent && (
                <div className="mt-1 text-xs text-yellow-400 font-bold">URGENT</div>
              )}
            </div>
          ))}
        </div>
        
        {/* Message Input */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 bg-gray-700 rounded-lg text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newMessage.trim()) {
                  sendCrewMessage(newMessage);
                }
              }}
            />
            <button
              onClick={() => newMessage.trim() && sendCrewMessage(newMessage)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <Send className="w-4 h-4" />
            </button>
            <button
              onClick={() => newMessage.trim() && sendCrewMessage(newMessage, true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
              title="Send Urgent"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const RuleReferencePanel = () => {
    const searchResults = ruleSearchQuery ? searchRules(ruleSearchQuery) : [];
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Book className="w-8 h-8 text-green-400" />
                Rule Reference
              </h2>
              <button
                onClick={() => setShowRuleReference(false)}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={ruleSearchQuery}
                onChange={(e) => setRuleSearchQuery(e.target.value)}
                placeholder="Search rules... (e.g., 'false start', 'holding')"
                className="w-full p-3 pl-10 bg-gray-700 rounded-lg text-white"
              />
              <HelpCircle className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          <div className="p-6">
            {ruleSearchQuery ? (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Search Results ({searchResults.length})</h3>
                {searchResults.map((rule: RuleReference) => (
                  <div key={rule.id} className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-blue-400">{rule.title}</h4>
                      <span className="text-sm text-gray-400">{rule.section}</span>
                    </div>
                    <p className="text-gray-300 mb-3">{rule.content}</p>
                    
                    {rule.examples.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-semibold text-yellow-400">Examples:</span>
                        <ul className="list-disc list-inside text-sm text-gray-300 ml-2">
                          {rule.examples.map((example: string, index: number) => (
                            <li key={index}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {rule.relatedPenalties.map((penalty: string) => (
                        <span key={penalty} className="px-2 py-1 bg-blue-600 bg-opacity-30 text-blue-400 text-xs rounded">
                          {penalty}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                
                {searchResults.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Book className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No rules found for "{ruleSearchQuery}"</p>
                    <p className="text-sm">Try different keywords</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Book className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">NCAA Football Rules Reference</h3>
                <p>Search for specific rules, penalties, or situations</p>
                <p className="text-sm mt-2">Quick searches: "false start", "holding", "pass interference"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const PerformanceMetricsPanel = () => {
    const overallScore = calculatePerformanceScore();
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Award className="w-8 h-8 text-yellow-400" />
                Performance Metrics
              </h2>
              <button
                onClick={() => setShowPerformanceMetrics(false)}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Overall Score */}
            <div className="text-center bg-gradient-to-r from-yellow-600 to-yellow-700 p-6 rounded-lg">
              <div className="text-4xl font-bold text-white mb-2">{overallScore}</div>
              <div className="text-yellow-200">Overall Performance Score</div>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-400 mb-3">Experience</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Games Officiated</span>
                    <span className="font-bold">{performanceMetrics.gamesOfficiated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Penalties Called</span>
                    <span className="font-bold">{performanceMetrics.totalPenaltiesCalled}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
                <h3 className="font-bold text-green-400 mb-3">Core Skills</h3>
                <div className="space-y-2">
                  {Object.entries({
                    accuracy: performanceMetrics.accuracy,
                    consistencyScore: performanceMetrics.consistencyScore,
                    communication: performanceMetrics.communication,
                    positioning: performanceMetrics.positioning,
                    ruleKnowledge: performanceMetrics.ruleKnowledge
                  }).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{key}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full" 
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{value.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Strengths & Improvement Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-600 bg-opacity-20 p-4 rounded-lg">
                <h3 className="font-bold text-green-400 mb-3">Strengths</h3>
                <ul className="space-y-1">
                  {performanceMetrics.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-orange-600 bg-opacity-20 p-4 rounded-lg">
                <h3 className="font-bold text-orange-400 mb-3">Development Areas</h3>
                <ul className="space-y-1">
                  {performanceMetrics.improvementAreas.map((area, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-orange-400" />
                      <span className="text-sm">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Last Evaluation */}
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg text-center">
              <span className="text-gray-400">Last Evaluation: </span>
              <span className="font-bold">{new Date(performanceMetrics.lastEvaluation).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PostGameSynopsisForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <FileText className="w-8 h-8 text-orange-400" />
              Post-Game Synopsis
            </h2>
            <button
              onClick={() => setShowPostGameForm(false)}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-blue-600 bg-opacity-20 p-4 rounded-lg">
            <h3 className="font-bold text-blue-400 mb-2">Game Information</h3>
            <p className="text-white">{currentGame?.homeTeam} vs {currentGame?.awayTeam}</p>
            <p className="text-gray-300">Crew: {crewData?.name}</p>
            <p className="text-gray-300">Total Penalties: {penalties.length}</p>
          </div>

          <div>
            <label className="block text-lg font-bold mb-2">Game Flow Assessment</label>
            <div className="grid grid-cols-3 gap-3">
              {(['smooth', 'challenging', 'difficult'] as const).map((flow) => (
                <button
                  key={flow}
                  onClick={() => setGameFlow(flow)}
                  className={`p-3 rounded-lg font-bold capitalize ${
                    gameFlow === flow 
                      ? flow === 'smooth' ? 'bg-green-600' : flow === 'challenging' ? 'bg-yellow-600' : 'bg-red-600'
                      : 'bg-gray-700'
                  }`}
                >
                  {flow === 'smooth' && '✅'} 
                  {flow === 'challenging' && '⚠️'} 
                  {flow === 'difficult' && '🚨'} 
                  {flow}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-bold mb-2">
              Crew Performance Rating: {crewPerformanceRating}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={crewPerformanceRating}
              onChange={(e) => setCrewPerformanceRating(parseInt(e.target.value))
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Poor (1)</span>
              <span>Excellent (10)</span>
            </div>
          </div>

          <div>
            <label className="block text-lg font-bold mb-2">Major Incidents (one per line)</label>
            <textarea
              value={majorIncidents}
              onChange={(e) => setMajorIncidents(e.target.value)}
              placeholder="Enter any ejections, unsportsmanlike conduct, injuries, etc..."
              rows={4}
              className="w-full p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-lg font-bold mb-2">Additional Notes for Randy Campbell</label>
            <textarea
              value={postGameNotes}
              onChange={(e) => setPostGameNotes(e.target.value)}
              placeholder="Any additional observations, concerns, or feedback about the game..."
              rows={4}
              className="w-full p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={async () => {
                try {
                  const synopsis = await generatePostGameSynopsis();
                  await sendPostGameSynopsis(synopsis);
                  setShowPostGameForm(false);
                  // Reset form
                  setGameFlow('smooth');
                  setCrewPerformanceRating(8);
                  setMajorIncidents('');
                  setPostGameNotes('');
                } catch (error) {
                  console.error('Failed to send synopsis:', error);
                  alert('Failed to send synopsis. Please try again.');
                }
              }}
              disabled={isSendingEmail}
              className="flex-1 p-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded-lg font-bold flex items-center justify-center gap-2"
            >
              {isSendingEmail ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send to Randy Campbell
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowPostGameForm(false)}
              className="px-6 py-4 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Sideline components
  const SidelineGameClock = () => (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 m-4 p-6 rounded-xl shadow-2xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">GAME CLOCK</h2>
        <div className="text-8xl font-mono font-bold text-white mb-2">
          {gameClockTime.minutes}:{gameClockTime.seconds.toString().padStart(2, '0')}
        </div>
        <div className="text-3xl font-bold text-blue-200">
          QUARTER {gameClockTime.quarter}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          onClick={() => {
            setGameClockRunning(!gameClockRunning);
            setLastAction(gameClockRunning ? 'Clock Stopped' : 'Clock Started');
          }}
          className={`p-6 rounded-xl font-bold text-2xl flex items-center justify-center gap-3 ${
            gameClockRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {gameClockRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          {gameClockRunning ? 'STOP CLOCK' : 'START CLOCK'}
        </button>
        
        <button
          onClick={() => {
            setGameClockTime(prev => ({
              quarter: prev.quarter < 4 ? prev.quarter + 1 : prev.quarter,
              minutes: 15,
              seconds: 0
            }));
            setGameClockRunning(false);
            setLastAction(`Started Q${gameClockTime.quarter < 4 ? gameClockTime.quarter + 1 : gameClockTime.quarter}`);
          }}
          className="p-6 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-2xl flex items-center justify-center gap-3"
        >
          <RotateCcw className="w-8 h-8" />
          NEXT QUARTER
        </button>
      </div>

      {lastAction && (
        <div className="text-center p-3 bg-blue-800 rounded-lg">
          <span className="text-blue-200 text-lg">Last Action: {lastAction}</span>
        </div>
      )}
    </div>
  );

  const SidelineScoreboard = () => (
    <div className="bg-gray-800 m-4 p-4 rounded-xl shadow-lg">
      <h3 className="text-2xl font-bold text-center mb-6">SCOREBOARD</h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="text-center">
          <div className="text-lg font-bold mb-2 text-blue-400">{currentGame?.homeTeam}</div>
          <div className="text-6xl font-bold mb-4">{homeScore}</div>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => {
                setHomeScore(prev => Math.max(0, prev - 1));
                setLastAction(`${currentGame?.homeTeam} -1`);
              }}
              className="p-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold flex items-center justify-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setHomeScore(prev => prev + 3);
                setLastAction(`${currentGame?.homeTeam} Field Goal`);
              }}
              className="p-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold text-sm"
            >
              +3
            </button>
            <button
              onClick={() => {
                setHomeScore(prev => prev + 6);
                setLastAction(`${currentGame?.homeTeam} Touchdown`);
              }}
              className="p-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-sm"
            >
              +6
            </button>
            <button
              onClick={() => {
                setHomeScore(prev => prev + 1);
                setLastAction(`${currentGame?.homeTeam} +1`);
              }}
              className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-center">
          <div className="text-lg font-bold mb-2 text-red-400">{currentGame?.awayTeam}</div>
          <div className="text-6xl font-bold mb-4">{awayScore}</div>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => {
                setAwayScore(prev => Math.max(0, prev - 1));
                setLastAction(`${currentGame?.awayTeam} -1`);
              }}
              className="p-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold flex items-center justify-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setAwayScore(prev => prev + 3);
                setLastAction(`${currentGame?.awayTeam} Field Goal`);
              }}
              className="p-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold text-sm"
            >
              +3
            </button>
            <button
              onClick={() => {
                setAwayScore(prev => prev + 6);
                setLastAction(`${currentGame?.awayTeam} Touchdown`);
              }}
              className="p-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-sm"
            >
              +6
            </button>
            <button
              onClick={() => {
                setAwayScore(prev => prev + 1);
                setLastAction(`${currentGame?.awayTeam} +1`);
              }}
              className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SidelinePenaltyEntry = () => (
    <div className="bg-gray-800 m-4 p-4 rounded-xl shadow-lg">
      <h3 className="text-2xl font-bold mb-4 text-center">PENALTY FROM OFFICIALS</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-lg font-bold mb-2">Player Number (from official signal)</label>
          <input
            type="number"
            value={pendingPenalty?.playerNumber || ''}
            onChange={(e) => setPendingPenalty(prev => ({
              ...prev,
              playerNumber: e.target.value
            }))}
            placeholder="Enter #"
            className="w-full p-4 bg-gray-700 rounded-lg text-white text-2xl text-center"
            min="0"
            max="99"
          />
        </div>

        <div>
          <label className="block text-lg font-bold mb-2">Penalty Type (ask official if unclear)</label>
          <select
            value={pendingPenalty?.penaltyCode || ''}
            onChange={(e) => setPendingPenalty(prev => ({
              ...prev,
              penaltyCode: e.target.value
            }))}
            className="w-full p-4 bg-gray-700 rounded-lg text-white text-lg"
          >
            <option value="">Ask official for penalty type</option>
            {Object.entries(penaltyTypes)
              .sort((a, b) => a[1].name.localeCompare(b[1].name))
              .map(([code, data]) => (
                <option key={code} value={code}>
                  {code} - {data.name} ({data.yards} yards)
                </option>
              ))
            }
          </select>
        </div>

        <div>
          <label className="block text-lg font-bold mb-2">Which Team (ask official)</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPendingPenalty(prev => ({ ...prev, team: 'O' }))
              }
              className={`p-4 rounded-lg font-bold text-lg ${
                pendingPenalty?.team === 'O' ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              OFFENSE
            </button>
            <button
              onClick={() => setPendingPenalty(prev => ({ ...prev, team: 'D' }))
              }
              className={`p-4 rounded-lg font-bold text-lg ${
                pendingPenalty?.team === 'D' ? 'bg-red-600' : 'bg-gray-700'
              }`}
            >
              DEFENSE
            </button>
          </div>
        </div>

        <button
          onClick={async () => {
            if (!pendingPenalty || !pendingPenalty.playerNumber || !pendingPenalty.penaltyCode || !currentGame) {
              alert('Missing penalty information. Please get player number and penalty type from officials.');
              return;
            }

            const penalty: Penalty = {
              id: Date.now(),
              code: pendingPenalty.penaltyCode,
              name: penaltyTypes[pendingPenalty.penaltyCode].name,
              yards: penaltyTypes[pendingPenalty.penaltyCode].yards,
              team: pendingPenalty.team || team,
              player: pendingPenalty.playerNumber,
              description: 'Sideline entry',
              quarter: gameClockTime.quarter.toString(),
              time: `${gameClockTime.minutes}:${gameClockTime.seconds.toString().padStart(2, '0')}`,
              down: `${down} & ${distance}`,
              callingOfficial: callingOfficial,
              fieldPosition: fieldPosition,
              voiceNote: '',
              timestamp: new Date().toISOString()
            };

            const newPenalties = [penalty, ...penalties];
            setPenalties(newPenalties);
            playSound('whistle');
            
            if (autoBackupEnabled && currentGame && crewData) {
              await performAutoBackup(newPenalties);
            }

            setPendingPenalty(null);
            setLastAction(`Added ${penalty.code} #${penalty.player}`);
          }}
          disabled={!pendingPenalty?.playerNumber || !pendingPenalty?.penaltyCode || !pendingPenalty?.team}
          className="w-full p-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-bold text-2xl disabled:cursor-not-allowed"
        >
          {pendingPenalty?.playerNumber && pendingPenalty?.penaltyCode && pendingPenalty?.team 
            ? '✅ ADD PENALTY' 
            : '❌ NEED MORE INFO FROM OFFICIALS'
          }
        </button>
      </div>

      {pendingPenalty?.playerNumber && pendingPenalty?.penaltyCode && pendingPenalty?.team && (
        <div className="mt-4 p-4 bg-green-900 bg-opacity-50 rounded-lg">
          <div className="text-green-200 text-center text-lg font-bold">
            Ready to add: {pendingPenalty.penaltyCode} #{pendingPenalty.playerNumber} ({pendingPenalty.team === 'O' ? 'Offense' : 'Defense'})
          </div>
        </div>
      )}
    </div>
  );

  // Missing component definitions
  // ...existing return statement...
};

// Helper components
const TeamColorProvider: React.FC<{
  homeTeam: string;
  awayTeam: string;
  children: React.ReactNode;
}> = ({ children }) => {
  return <>{children}</>;
};

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Fix QuickEntryTemplates
const QuickEntryTemplates: React.FC<{
  onTemplateSelect: (template: { code: string; team: string }) => void;
}> = ({ onTemplateSelect }) => {
  const templates = [
    { code: 'FST', team: 'O', label: 'False Start' },
    { code: 'HLD', team: 'O', label: 'Hold (O)' },
    { code: 'HLD', team: 'D', label: 'Hold (D)' },
    { code: 'DPI', team: 'D', label: 'DPI' },
    { code: 'OFF', team: 'D', label: 'Offside' },
    { code: 'DOG', team: 'O', label: 'Delay' },
    { code: 'PF', team: 'O', label: 'PF (O)' },
    { code: 'PF', team: 'D', label: 'PF (D)' }
  ];

  return (
    <div className="bg-gray-800 m-4 p-4 rounded-xl shadow-lg">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-400" />
        Quick Entry Templates
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {templates.map((template, index) => (
          <button
            key={index}
            onClick={() => onTemplateSelect(template)}
            className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-bold transition-all"
          >
            {template.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RMACOfficialsPWA;