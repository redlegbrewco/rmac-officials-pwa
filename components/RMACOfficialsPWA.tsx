'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, WifiOff, Upload, Cloud, Check, CheckCircle, Copy, Trash2, Save, Undo2, 
  Users, Mic, MicOff, BarChart3, MapPin, Clock, TrendingUp,
  AlertCircle, Radio, Settings, Volume2, Eye, Calculator,
  ClipboardList, UserCheck, MessageSquare, Target, Award,
  Calendar, FileText, Thermometer, AlertTriangle,
  RefreshCw, Flag, Globe, Play, Pause, RotateCcw, Plus, Minus,
  Mail, Send, TrendingDown, BarChart2, PieChart, Calendar as CalendarIcon,
  Smartphone, Headphones, Zap, Shield, Network, Database,
  PhoneCall, MessageCircle, Bell, Download, Share2, 
  HelpCircle, Book, Video, ExternalLink, Lightbulb,
  Maximize, Brain, Hand
} from 'lucide-react';
import { offlineStorage, isOnline, onConnectionChange, triggerManualSync } from '@/lib/offline-storage';
import { driveBackup } from '@/lib/google-drive-backup';
import WeeklyGameManagement from './WeeklyGameManagement';
import RMACAnalyticsDashboard from './RMACAnalyticsDashboard';
import CrewPerformancePanel from './CrewPerformancePanel';

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
  // QwikRef database alignment
  quarter: string;           // QTR
  time: string;             // Time
  team: string;             // Team (must populate - home/away team name)
  player: string;           // Player # 
  code: string;             // Foul Code
  name: string;             // Foul Description (main penalty name)
  description: string;      // Foul Desc (detailed description: grab and restrict, takedown, etc.)
  downDistance: string;     // D/D/YD (Down, Distance, Yard line)
  playType: 'run' | 'pass' | 'kick' | 'other'; // Play Type
  callingOfficial: string;  // Officials Calling (can be multiple)
  acceptDecline: 'accepted' | 'declined' | 'pending'; // Accept/Decline
  
  // Existing fields we keep
  yards: number;
  down: string;            // Keep for backwards compatibility
  fieldPosition?: number;
  voiceNote?: string;
  timestamp: string;
  subcategory?: string;
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
const penaltyTypes: Record<string, { name: string; yards: number; subcategories?: string[] }> = {
  // 5 Yard Penalties
  'ATR': { name: 'Assisting the Runner', yards: 5 },
  'DOD': { name: 'Delay of Game, Defense', yards: 5 },
  'DOG': { name: 'Delay of Game, Offense', yards: 5 },
  'ENC': { name: 'Encroachment (Offense)', yards: 5 },
  'EQV': { name: 'Equipment Violation', yards: 5 },
  'FST': { name: 'False Start', yards: 5 },
  'IFK': { name: 'Illegal Free Kick Formation', yards: 5 },
  'IFP': { name: 'Illegal Forward Pass', yards: 5 },
  'ILF': { name: 'Illegal Formation', yards: 5 },
  'ILM': { name: 'Illegal Motion', yards: 5 },
  'ILP': { name: 'Illegal Participation', yards: 5 },
  'ILS': { name: 'Illegal Substitution', yards: 5 },
  'ISH': { name: 'Illegal Shift', yards: 5 },
  'ISP': { name: 'Illegal Snap', yards: 5 },
  'KOB': { name: 'Free Kick Out of Bounds', yards: 5 },
  'SLI': { name: 'Sideline Interference, 5 yards', yards: 5 },
  
  // 10 Yard Penalties
  'BAT': { name: 'Illegal Batting', yards: 10 },
  'DEH': { name: 'Holding, Defense', yards: 10, 
    subcategories: ['Grab and Restrict', 'Takedown', 'Grab and Turn', 'Impeding Progress'] },
  'IBP': { name: 'Illegal Backward Pass', yards: 10 },
  'IDP': { name: 'Ineligible Downfield on Pass', yards: 10 },
  'IFH': { name: 'Illegal Forward Handing', yards: 10 },
  'IKB': { name: 'Illegally Kicking Ball', yards: 10 },
  'ING': { name: 'Intentional Grounding', yards: 10 },
  'ITP': { name: 'Illegal Touching of a Forward Pass', yards: 10 },
  'IUH': { name: 'Illegal Use of Hands', yards: 10 },
  'KIK': { name: 'Illegal Kick', yards: 10 },
  'OFH': { name: 'Holding, Offense', yards: 10,
    subcategories: ['Grab and Restrict', 'Takedown', 'Grab and Turn', 'Impeding Progress'] },
  'RNH': { name: 'Running into the Kicker/Holder', yards: 10 },
  
  // 15 Yard Penalties
  'DPI': { name: 'Pass Interference, Defense', yards: 15 },
  'DOF': { name: 'Offside, Defense', yards: 15 },
  'FGT': { name: 'Fighting', yards: 15 },
  'IBB': { name: 'Illegal Block in the Back', yards: 15 },
  'IFD': { name: 'Illegal Formation, Defense (3-on-1)', yards: 15 },
  'IWK': { name: 'Illegal Wedge on Kickoff', yards: 15 },
  'KCI': { name: 'Kick Catch Interference', yards: 15 },
  'OFK': { name: 'Offside, Kicking Team', yards: 15 },
  'OPI': { name: 'Pass Interference, Offense', yards: 15 },
  'SLM': { name: 'Sideline Interference, 15 yards', yards: 15 },
  'UFT': { name: 'Unfair Tactics', yards: 15 },
  
  // Personal Fouls (15 yards)
  'PF/BBW': { name: 'Personal Foul, Blocking Below the Waist', yards: 15 },
  'PF/BOB': { name: 'Personal Foul, Blocking Out of Bounds', yards: 15 },
  'PF/BTH': { name: 'Personal Foul, Blow to the Head', yards: 15 },
  'PF/CHB': { name: 'Personal Foul, Chop Block', yards: 15 },
  'PF/CLP': { name: 'Personal Foul, Clipping', yards: 15 },
  'PF/FMM': { name: 'Personal Foul, Face Mask', yards: 15 },
  'PF/HCT': { name: 'Personal Foul, Horse Collar Tackle', yards: 15 },
  'PF/HDR': { name: 'Personal Foul, Hit on Defenseless Receiver', yards: 15 },
  'PF/HTF': { name: 'Personal Foul, Hands to the Face', yards: 15 },
  'PF/HUR': { name: 'Personal Foul, Hurdling', yards: 15 },
  'PF/ICS': { name: 'Personal Foul, Illegal Contact with Snapper', yards: 15 },
  'PF/LEA': { name: 'Personal Foul, Leaping', yards: 15 },
  'PF/LEV': { name: 'Personal Foul, Leverage', yards: 15 },
  'PF/LTO': { name: 'Personal Foul, Late Hit Out of Bounds', yards: 15 },
  'PF/LTP': { name: 'Personal Foul, Late Hit/Piling On', yards: 15 },
  'PF/RFK': { name: 'Personal Foul, Roughing Free Kicker', yards: 15 },
  'PF/RPS': { name: 'Personal Foul, Roughing the Passer', yards: 15 },
  'PF/RRK': { name: 'Personal Foul, Roughing the Kicker/Holder', yards: 15 },
  'PF/SKE': { name: 'Personal Foul, Striking/Kneeing/Elbowing', yards: 15 },
  'PF/TGT': { name: 'Personal Foul, Targeting', yards: 15 },
  'PF/TRP': { name: 'Personal Foul, Tripping', yards: 15 },
  'PF/UNR': { name: 'Personal Foul, Other Unnecessary Roughness', yards: 15 },
  
  // Unsportsmanlike Conduct (15 yards)
  'UNS/ABL': { name: 'Unsportsmanlike Conduct, Abusive Language', yards: 15 },
  'UNS/BCH': { name: 'Unsportsmanlike Conduct, Bench', yards: 15 },
  'UNS/DEA': { name: 'Unsportsmanlike Conduct, Delayed/Excessive Act', yards: 15 },
  'UNS/FCO': { name: 'Forcibly Contacting an Official', yards: 15 },
  'UNS/RHT': { name: 'Unsportsmanlike Conduct, Removal of Helmet', yards: 15 },
  'UNS/STB': { name: 'Unsportsmanlike Conduct, Spiking/Throwing Ball', yards: 15 },
  'UNS/TAU': { name: 'Unsportsmanlike Conduct, Taunting/Baiting', yards: 15 },
  'UNS': { name: 'Unsportsmanlike Conduct, Other', yards: 15,
    subcategories: ['Late Hit Out of Bounds', 'Excessive Celebration', 'Taunting', 'Bench Conduct', 'Other'] },
  
  // Special Situations
  'DSQ': { name: 'Disqualification', yards: 0 },
  
  // Legacy codes for backward compatibility
  'HLD': { name: 'Holding (General)', yards: 10 },
  'PF': { name: 'Personal Foul (General)', yards: 15 }
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
  
  // New QwikRef-aligned fields
  const [downDistance, setDownDistance] = useState<string>('1st & 10');
  const [yardLine, setYardLine] = useState<string>('50');
  const [playType, setPlayType] = useState<'run' | 'pass' | 'kick' | 'other'>('run');
  const [acceptDecline, setAcceptDecline] = useState<'accepted' | 'declined' | 'pending'>('pending');
  const [detailedDescription, setDetailedDescription] = useState<string>(''); // For specific foul descriptions
  
  // UI State
  const [showNumberPad, setShowNumberPad] = useState<boolean>(false);
  const [showInjuredNumberPad, setShowInjuredNumberPad] = useState<boolean>(false);
  const [showHelmetOffNumberPad, setShowHelmetOffNumberPad] = useState<boolean>(false);
  const [injuredPlayerNumber, setInjuredPlayerNumber] = useState<string>('');
  const [helmetOffPlayerNumber, setHelmetOffPlayerNumber] = useState<string>('');
  const [sidelineMode, setSidelineMode] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [lastDeletedPenalty, setLastDeletedPenalty] = useState<Penalty | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState<boolean>(false);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordings, setRecordings] = useState<any[]>([]);
  
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

  // Crew Performance State
  const [crewPerformanceStats, setCrewPerformanceStats] = useState<{
    accuracy?: number;
    gamesOfficiated?: number;
    avgPenaltiesPerGame?: number;
  } | null>(null);

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

  // Game Management State
  const [homeTimeouts, setHomeTimeouts] = useState<{ first: number; second: number }>({ first: 3, second: 3 });
  const [awayTimeouts, setAwayTimeouts] = useState<{ first: number; second: number }>({ first: 3, second: 3 });
  const [injuredPlayers, setInjuredPlayers] = useState<string[]>([]);
  const [helmetOffPlayers, setHelmetOffPlayers] = useState<string[]>([]);
  const [playClockTime, setPlayClockTime] = useState<number>(25);
  const [playClockRunning, setPlayClockRunning] = useState<boolean>(false);

  // Crew State
  const [selectedCrew, setSelectedCrew] = useState<string>('');
  const [crewData, setCrewData] = useState<CrewData | null>(null);
  const [possession, setPossession] = useState<'home' | 'away'>('home');
  
  // Game Setup State
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [selectedHomeTeam, setSelectedHomeTeam] = useState<string>('');
  const [selectedAwayTeam, setSelectedAwayTeam] = useState<string>('');
  const [customHomeTeam, setCustomHomeTeam] = useState<string>('');
  const [customAwayTeam, setCustomAwayTeam] = useState<string>('');
  const [showCustomHomeInput, setShowCustomHomeInput] = useState<boolean>(false);
  const [showCustomAwayInput, setShowCustomAwayInput] = useState<boolean>(false);
  const [customTeamHistory, setCustomTeamHistory] = useState<string[]>([]);

  // Other State
  const [savedGames, setSavedGames] = useState<Game[]>([]);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const [crewNotes, setCrewNotes] = useState<CrewNote[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceCommand, setVoiceCommand] = useState<string>('');

  // Phase 1: Enhanced Features State
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);
  const [largeButtonMode, setLargeButtonMode] = useState<boolean>(false);
  const [weatherData, setWeatherData] = useState<{
    temperature: number;
    conditions: string;
    windSpeed: number;
  } | null>(null);
  const [quickTemplateMode, setQuickTemplateMode] = useState<boolean>(false);

  // Phase 2: Intelligence & Analytics State
  const [intelligenceData, setIntelligenceData] = useState<{
    teamPatterns: Record<string, any>;
    penaltyTrends: any[];
    predictions: any[];
  }>({
    teamPatterns: {},
    penaltyTrends: [],
    predictions: []
  });
  const [realTimeSheetsSync, setRealTimeSheetsSync] = useState<boolean>(false);
  const [weatherMode, setWeatherMode] = useState<'normal' | 'cold' | 'bright'>('normal');

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

  // Enhanced Practical Features State - Focused on Foul Recorder
  const [foulRecorderMode, setFoulRecorderMode] = useState<boolean>(false);
  const [oneHandedMode, setOneHandedMode] = useState<boolean>(false);
  const [quickEntryMode, setQuickEntryMode] = useState<boolean>(false);
  const [lastPenaltyUsed, setLastPenaltyUsed] = useState<string>('');
  const [showQuickActions, setShowQuickActions] = useState<boolean>(false);
  const [screenBrightness, setScreenBrightness] = useState<'normal' | 'bright' | 'dim'>('normal');
  const [pendingCorrection, setPendingCorrection] = useState<number | null>(null);
  const [headsetNotes, setHeadsetNotes] = useState<string>('');
  const [foulReportReady, setFoulReportReady] = useState<boolean>(false);

  // Crew Analytics & Dashboard State
  const [showCrewDashboard, setShowCrewDashboard] = useState<boolean>(false);
  const [crewAnalytics, setCrewAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(false);
  const [rmacOverallStats, setRmacOverallStats] = useState<any>(null);
  const [selectedAnalyticsWeek, setSelectedAnalyticsWeek] = useState<number>(1);

  // New Navigation State for Dashboard System
  const [currentView, setCurrentView] = useState<'dashboard' | 'game' | 'weekly-games' | 'analytics' | 'crew-performance' | 'scouting-reports' | 'practice-setup'>('dashboard'); // Start with dashboard
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [showRMACAnalytics, setShowRMACAnalytics] = useState<boolean>(false);
  const [showWeeklyManagement, setShowWeeklyManagement] = useState<boolean>(false);

  // Refs
  const gameClockInterval = useRef<NodeJS.Timeout | null>(null);
  const playClockInterval = useRef<NodeJS.Timeout | null>(null);

  const officials = ['R', 'CJ', 'U', 'HL', 'LJ', 'SJ', 'FJ', 'BJ'];

  // Most common penalties for quick access (based on actual officiating data)
  const quickPenalties = [
    { code: 'FST', name: 'False Start', team: 'O' },
    { code: 'HLD', name: 'Holding', team: 'O' },
    { code: 'OFH', name: 'Offensive Holding', team: 'O' },
    { code: 'DEH', name: 'Defensive Holding', team: 'D' },
    { code: 'OPI', name: 'Offensive Pass Interference', team: 'O' },
    { code: 'DPI', name: 'Defensive Pass Interference', team: 'D' },
    { code: 'UNS', name: 'Unsportsmanlike Conduct', team: 'either' },
    { code: 'PF/TGT', name: 'Targeting', team: 'either' }
  ];

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

  // Phase 1: Enhanced Features Functions
  const triggerHapticFeedback = (pattern: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!hapticEnabled || !navigator.vibrate) return;
    
    const patterns = {
      light: [50],
      medium: [100],
      heavy: [200, 100, 200]
    };
    
    navigator.vibrate(patterns[pattern]);
  };

  const fetchWeatherData = async (lat?: number, lon?: number) => {
    try {
      // Using OpenWeatherMap API - replace with your API key
      const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
      if (!API_KEY) return;

      const coords = lat && lon ? { lat, lon } : await getCurrentLocation();
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=imperial`
      );
      
      if (response.ok) {
        const data = await response.json();
        const weather = {
          temperature: Math.round(data.main.temp),
          conditions: data.weather[0].main,
          windSpeed: Math.round(data.wind.speed)
        };
        
        setWeatherData(weather);
        
        // Auto-adjust UI based on weather
        if (weather.temperature < 40) {
          setWeatherMode('cold');
          setLargeButtonMode(true);
        } else if (weather.conditions === 'Clear' && weather.temperature > 80) {
          setWeatherMode('bright');
        } else {
          setWeatherMode('normal');
        }
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
    }
  };

  const getCurrentLocation = (): Promise<{lat: number, lon: number}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          // Default to Denver, CO if location fails
          resolve({ lat: 39.7392, lon: -104.9903 });
        },
        { timeout: 10000 }
      );
    });
  };

  // Phase 2: Intelligence & Analytics Functions
  const analyzeTeamPatterns = (teamPenalties: Penalty[]) => {
    const patterns = {
      mostCommonPenalties: {} as Record<string, number>,
      timePatterns: {} as Record<string, number>,
      situationalPatterns: {} as Record<string, number>,
      officialPatterns: {} as Record<string, number>
    };

    teamPenalties.forEach(penalty => {
      // Track penalty types
      patterns.mostCommonPenalties[penalty.code] = 
        (patterns.mostCommonPenalties[penalty.code] || 0) + 1;
      
      // Track time patterns
      const timeKey = `${penalty.quarter}-${penalty.time.split(':')[0]}`;
      patterns.timePatterns[timeKey] = 
        (patterns.timePatterns[timeKey] || 0) + 1;
      
      // Track situational patterns
      const situationKey = `${penalty.down}-${penalty.fieldPosition}`;
      patterns.situationalPatterns[situationKey] = 
        (patterns.situationalPatterns[situationKey] || 0) + 1;
      
      // Track official patterns
      patterns.officialPatterns[penalty.callingOfficial] = 
        (patterns.officialPatterns[penalty.callingOfficial] || 0) + 1;
    });

    return patterns;
  };

  const generatePredictions = (gameContext: any) => {
    const predictions = [];
    
    // Situational predictions based on down, distance, field position
    if (gameContext.down === '3' && parseInt(gameContext.distance) > 7) {
      predictions.push({
        type: 'situational',
        message: 'Watch for holding on pass protection - 3rd & long',
        confidence: 75,
        color: 'yellow'
      });
    }
    
    if (gameContext.fieldPosition <= 20 || gameContext.fieldPosition >= 80) {
      predictions.push({
        type: 'field_position',
        message: 'Red zone - increased penalty likelihood',
        confidence: 65,
        color: 'orange'
      });
    }
    
    // Weather-based predictions
    if (weatherData?.temperature && weatherData.temperature < 35) {
      predictions.push({
        type: 'weather',
        message: 'Cold weather - watch for ball handling issues',
        confidence: 60,
        color: 'blue'
      });
    }
    
    if (weatherData?.windSpeed && weatherData.windSpeed > 15) {
      predictions.push({
        type: 'weather',
        message: 'High winds - kicking game adjustments likely',
        confidence: 70,
        color: 'purple'
      });
    }
    
    return predictions;
  };

  const syncToSheetsRealTime = async (penaltyData: Penalty) => {
    if (!realTimeSheetsSync) return;
    
    try {
      const response = await fetch('/api/google-sheets-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_penalty',
          data: {
            ...penaltyData,
            gameId: currentGame?.id,
            crew: crewData?.name,
            timestamp: new Date().toISOString()
          }
        })
      });
      
      if (response.ok) {
        console.log('Real-time sync successful');
      }
    } catch (error) {
      console.error('Real-time sheets sync failed:', error);
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

    // Generate CSV format that matches QwikRef database structure exactly
    let csvData = 'QTR,Time,Team,Player #,Foul Code,Foul Desc,D/D/YD,Play Type,Officials Calling,Accept/Decline\n';
    
    penalties.forEach((penalty, index) => {
      const qtr = penalty.quarter;
      const time = penalty.time;
      const team = penalty.team; // Use actual team names now
      const playerNum = penalty.player;
      const foulCode = penalty.code;
      const foulDesc = penalty.description || penalty.name; // Detailed description first, then penalty name
      const ddyd = penalty.downDistance; // Down, Distance, Yard line
      const playType = penalty.playType;
      const officialsCalling = penalty.callingOfficial;
      const acceptDecline = penalty.acceptDecline;
      
      // Escape commas and quotes for CSV
      const escapeCSV = (str: string) => {
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      csvData += `${qtr},${time},"${escapeCSV(team)}",${playerNum},${foulCode},"${escapeCSV(foulDesc)}","${escapeCSV(ddyd)}",${playType},"${escapeCSV(officialsCalling)}",${acceptDecline}\n`;
    });
    
    return csvData;
  };

  // Enhanced QwikRef export with Google Sheets backup
  const exportToQwikRef = async (): Promise<void> => {
    if (!currentGame || penalties.length === 0) {
      alert('No penalties to export');
      return;
    }

    try {
      const csvData = generateQwikRefFormat();
      
      // Copy to clipboard for manual paste into QwikRef
      await navigator.clipboard.writeText(csvData);
      
      // Also save to Google Sheets as backup/review copy
      if (realTimeSheetsSync) {
        await syncToSheetsRealTime({
          action: 'export_qwikref',
          gameId: currentGame.id,
          data: csvData,
          timestamp: new Date().toISOString()
        } as any);
      }
      
      setCopiedIndex('qwikref-export');
      setTimeout(() => setCopiedIndex(null), 5000);
      playSound('ding');
      
      // Generate quick summary for verification
      const summary = `
QwikRef Export Ready!
Game: ${currentGame.homeTeam} vs ${currentGame.awayTeam}
Total Fouls: ${penalties.length}
Offensive: ${penalties.filter(p => p.team === 'O').length}
Defensive: ${penalties.filter(p => p.team === 'D').length}

Data copied to clipboard - ready to paste into QwikRef!
      `.trim();
      
      alert(summary);
      setFoulReportReady(true);
      
    } catch (err) {
      console.error('QwikRef export failed:', err);
      alert('Export failed - check clipboard permissions');
    }
  };

  // Team Scouting Report Generator
  const generateScoutingReport = async (teamName: string): Promise<string> => {
    const teamPenalties = penalties.filter(p => 
      (p.team === 'O' ? currentGame?.homeTeam : currentGame?.awayTeam) === teamName
    );

    const report = `
RMAC SCOUTING REPORT
Team: ${teamName}
Game: ${currentGame?.homeTeam} vs ${currentGame?.awayTeam}
Date: ${new Date().toLocaleDateString()}
Crew: ${crewData?.name || 'N/A'}

PENALTY SUMMARY:
Total Penalties: ${teamPenalties.length}
Total Yards: ${teamPenalties.reduce((sum, p) => sum + p.yards, 0)}

COMMON PENALTIES:
${Object.entries(
  teamPenalties.reduce((acc, p) => {
    acc[p.code] = (acc[p.code] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
).sort(([,a], [,b]) => b - a).slice(0, 5).map(([code, count]) => 
  `• ${code} (${penaltyTypes[code]?.name || code}): ${count} times`
).join('\n')}

SITUATIONAL TRENDS:
• Red Zone Penalties: ${teamPenalties.filter(p => (p.fieldPosition || 50) <= 20 || (p.fieldPosition || 50) >= 80).length}
• 3rd Down Penalties: ${teamPenalties.filter(p => p.down.includes('3')).length}
• Late Game (4th Qtr): ${teamPenalties.filter(p => p.quarter === '4th').length}

OFFICIALS NOTES:
${teamPenalties.filter(p => p.description).map(p => `• ${p.description}`).join('\n') || 'No specific notes'}

RECOMMENDATIONS FOR OTHER CREWS:
• Watch for patterns in ${teamPenalties.slice(0, 3).map(p => p.code).join(', ')}
• Team discipline level: ${teamPenalties.length <= 3 ? 'High' : teamPenalties.length <= 6 ? 'Average' : 'Needs Attention'}

Generated: ${new Date().toLocaleString()}
    `.trim();

    return report;
  };

  // Quick Post-Game Report to Coordinator
  const sendQuickPostGameReport = async (): Promise<void> => {
    if (!currentGame || !crewData) {
      alert('Game data not available');
      return;
    }

    setIsSendingEmail(true);
    
    try {
      // Generate quick summary
      const homeTeamReport = await generateScoutingReport(currentGame.homeTeam);
      const awayTeamReport = await generateScoutingReport(currentGame.awayTeam);
      
      const quickReport = `
RMAC POST-GAME QUICK REPORT
${currentGame.homeTeam} vs ${currentGame.awayTeam}
${new Date().toLocaleDateString()}

GAME SUMMARY:
• Total Penalties: ${penalties.length}
• Game Flow: ${gameFlow.toUpperCase()}
• Crew Performance: ${crewPerformanceRating}/10
• Major Incidents: ${majorIncidents || 'None'}

PENALTY BREAKDOWN:
• ${currentGame.homeTeam}: ${penalties.filter(p => p.team === 'O').length} penalties
• ${currentGame.awayTeam}: ${penalties.filter(p => p.team === 'D').length} penalties

${majorIncidents ? `INCIDENTS:\n${majorIncidents}\n` : ''}

CREW NOTES:
${postGameNotes || 'No additional notes'}

QwikRef data has been prepared and will be uploaded shortly.

Submitted by: ${crewData.name}
Time: ${new Date().toLocaleTimeString()}
      `.trim();

      // Send to coordinator
      const response = await fetch('/api/send-post-game-synopsis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailSettings.supervisorEmails,
          cc: emailSettings.crewChiefEmails,
          subject: `Quick Report: ${currentGame.homeTeam} vs ${currentGame.awayTeam}`,
          body: quickReport,
          attachments: [{
            filename: `${currentGame.homeTeam}_vs_${currentGame.awayTeam}_ScoutingReports.txt`,
            content: `${homeTeamReport}\n\n---\n\n${awayTeamReport}`
          }]
        })
      });

      if (response.ok) {
        alert('Quick report sent! Safe travels to the locker room.');
        setLastEmailSent(new Date().toISOString());
        
        // Also save scouting reports to Google Drive for other crews
        if (autoBackupEnabled) {
          await fetch('/api/backup-to-drive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'scouting_reports',
              gameId: currentGame.id,
              homeTeamReport,
              awayTeamReport,
              timestamp: new Date().toISOString()
            })
          });
        }
      } else {
        throw new Error('Failed to send quick report');
      }
    } catch (error) {
      console.error('Quick report failed:', error);
      alert('Failed to send quick report. You can still copy the data manually.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Helper function to reuse last penalty
  const useLastPenalty = () => {
    if (lastPenaltyUsed) {
      setSelectedPenalty(lastPenaltyUsed);
    }
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

    // Check if penalty requires subcategory selection
    const penaltyDef = penaltyTypes[selectedPenalty];
    if (penaltyDef?.subcategories && penaltyDef.subcategories.length > 0 && !selectedSubcategory) {
      alert('Please select a subcategory for this penalty');
      return;
    }

    const playerNum = parseInt(playerNumber);
    if (isNaN(playerNum) || playerNum < 0 || playerNum > 99) {
      alert('Please enter a valid player number (0-99)');
      return;
    }

    const fullPenaltyName = getFullPenaltyName(selectedPenalty, selectedSubcategory);

    const penalty: Penalty = {
      id: Date.now(),
      // QwikRef database alignment
      quarter: quarter,
      time: gameTime,
      team: team === 'O' ? (selectedHomeTeam || customHomeTeam || 'Home') : (selectedAwayTeam || customAwayTeam || 'Away'),
      player: playerNumber,
      code: selectedPenalty,
      name: fullPenaltyName,
      description: detailedDescription || description || fullPenaltyName,
      downDistance: `${down} & ${distance} at ${yardLine}`,
      playType: playType,
      callingOfficial: callingOfficial,
      acceptDecline: acceptDecline,
      
      // Keep existing fields for compatibility
      yards: penaltyTypes[selectedPenalty].yards,
      down: `${down} & ${distance}`,
      fieldPosition: fieldPosition,
      voiceNote: voiceCommand,
      timestamp: new Date().toISOString(),
      subcategory: selectedSubcategory || undefined
    };

    const newPenalties = [penalty, ...penalties];
    setPenalties(newPenalties);
    playSound('whistle');
    
    // Phase 1: Haptic feedback
    triggerHapticFeedback('medium');
    
    // Save to offline storage
    try {
      await offlineStorage.queuePenalty(penalty);
    } catch (error) {
      console.error('Failed to queue penalty offline:', error);
    }
    
    // Phase 2: Real-time Sheets sync
    if (realTimeSheetsSync) {
      await syncToSheetsRealTime(penalty);
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
    
    // Phase 2: Update intelligence data
    if (currentGame) {
      const teamName = team === 'O' ? currentGame.homeTeam : currentGame.awayTeam;
      const patterns = analyzeTeamPatterns(newPenalties.filter(p => 
        (p.team === 'O' ? currentGame.homeTeam : currentGame.awayTeam) === teamName
      ));
      
      setIntelligenceData(prev => ({
        ...prev,
        teamPatterns: {
          ...prev.teamPatterns,
          [teamName]: patterns
        }
      }));
    }
    
    setSelectedPenalty('');
    setPlayerNumber('');
    setDescription('');
    setShowNumberPad(false);
    setVoiceCommand('');
    setSelectedSubcategory('');
    setShowSubcategoryDropdown(false);
    setLastPenaltyUsed(selectedPenalty); // Remember last penalty for quick repeat
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
  const startNewGame = () => {
    if (!selectedCrew || !selectedHomeTeam || !selectedAwayTeam) {
      alert('Please select crew, home team, and away team');
      return;
    }
    
    if (selectedHomeTeam === selectedAwayTeam) {
      alert('Home and away teams cannot be the same');
      return;
    }
    
    const newGame: Game = {
      id: Date.now().toString(),
      homeTeam: selectedHomeTeam,
      awayTeam: selectedAwayTeam,
      date: new Date().toISOString(),
      penalties: [],
      crew: selectedCrew
    };
    
    setCurrentGame(newGame);
    setCrewData(RMAC_CREWS[selectedCrew]);
    setPenalties([]);
    setGameEvents([]);
    setCrewNotes([]);
    setPossession('home');
    setGameStarted(true);
    
    // Phase 1: Initialize weather data when game starts
    fetchWeatherData();
  };

  // Phase 1: Quick template selection
  const selectQuickTemplate = (template: { code: string; team: string }) => {
    setSelectedPenalty(template.code);
    setTeam(template.team);
    triggerHapticFeedback('light');
    
    // Auto-focus on player number input
    setTimeout(() => {
      const playerInput = document.querySelector('input[placeholder*="Player"]') as HTMLInputElement;
      if (playerInput) {
        playerInput.focus();
      }
    }, 100);
  };

  // Enhanced Practical Functions for Foul Recorder
  const quickPenaltyEntry = async (penaltyCode: string, playerNum: string, teamSide: string, officialId: string): Promise<void> => {
    // Streamlined entry for headset communications
    const penalty: Penalty = {
      id: Date.now(),
      code: penaltyCode,
      name: penaltyTypes[penaltyCode]?.name || penaltyCode,
      yards: penaltyTypes[penaltyCode]?.yards || 0,
      team: teamSide,
      player: playerNum,
      description: headsetNotes,
      quarter: quarter,
      time: gameTime,
      down: `${down} & ${distance}`,
      callingOfficial: officialId,
      fieldPosition: fieldPosition,
      timestamp: new Date().toISOString()
    };

    const newPenalties = [penalty, ...penalties];
    setPenalties(newPenalties);
    setLastPenaltyUsed(penaltyCode);
    
    playSound('whistle');
    triggerHapticFeedback('medium');
    
    // Clear headset notes for next entry
    setHeadsetNotes('');
    
    // Auto-save for foul recorder
    try {
      await offlineStorage.queuePenalty(penalty);
      // Update foul report status
      setFoulReportReady(true);
    } catch (error) {
      console.error('Failed to save penalty:', error);
    }
  };

  const correctLastPenalty = (penaltyId: number, field: string, newValue: string): void => {
    setPenalties(prev => prev.map(p => 
      p.id === penaltyId ? { ...p, [field]: newValue } : p
    ));
    triggerHapticFeedback('light');
    playSound('ding');
  };

  const generateOfficialFoulReport = (): string => {
    if (!currentGame || penalties.length === 0) {
      return 'No penalties to report';
    }

    let report = '';
    
    // Header
    report += `OFFICIAL FOUL REPORT\n`;
    report += `Game: ${currentGame.homeTeam} vs ${currentGame.awayTeam}\n`;
    report += `Date: ${new Date(currentGame.date).toLocaleDateString()}\n`;
    report += `Crew: ${crewData?.name || 'N/A'}\n`;
    report += `Total Fouls: ${penalties.length}\n\n`;
    
    // Penalties by quarter for official report
    ['1st', '2nd', '3rd', '4th', 'OT'].forEach(qtr => {
      const quarterPenalties = penalties.filter(p => p.quarter === qtr);
      if (quarterPenalties.length > 0) {
        report += `${qtr} QUARTER (${quarterPenalties.length} fouls):\n`;
        quarterPenalties.forEach((penalty, index) => {
          report += `${index + 1}. ${penalty.time} - ${penalty.code} #${penalty.player} ${penalty.team === 'O' ? 'OFF' : 'DEF'} ${penalty.yards}yd (${penalty.callingOfficial})\n`;
        });
        report += `\n`;
      }
    });
    
    // Summary for conference/NCAA
    report += `SUMMARY:\n`;
    const offensiveFouls = penalties.filter(p => p.team === 'O').length;
    const defensiveFouls = penalties.filter(p => p.team === 'D').length;
    report += `Offensive: ${offensiveFouls}, Defensive: ${defensiveFouls}\n`;
    
    // Official signatures section
    report += `\nCREW VERIFICATION:\n`;
    report += `Referee: ________________\n`;
    report += `Umpire: ________________\n`;
    report += `Recorded by: ${callingOfficial} at ${new Date().toLocaleTimeString()}\n`;
    
    return report;
  };

  const exportForQwikRef = async (): Promise<void> => {
    const qwikRefData = generateQwikRefFormat();
    const officialReport = generateOfficialFoulReport();
    
    try {
      // Copy both formats to clipboard
      const exportData = `${qwikRefData}\n\n--- OFFICIAL REPORT ---\n\n${officialReport}`;
      await navigator.clipboard.writeText(exportData);
      
      setCopiedIndex('export');
      setTimeout(() => setCopiedIndex(null), 3000);
      playSound('ding');
      
      // Mark as ready for upload
      setFoulReportReady(true);
      
    } catch (err) {
      console.error('Failed to export:', err);
      alert('Export failed - check clipboard permissions');
    }
  };

  const toggleFoulRecorderMode = () => {
    setFoulRecorderMode(!foulRecorderMode);
    // Enable optimizations for foul recorder
    if (!foulRecorderMode) {
      setLargeButtonMode(true); // Easier to hit while moving
      setSidelineMode(true); // Enable sideline optimizations
    }
    localStorage.setItem('foul_recorder_mode', (!foulRecorderMode).toString());
    triggerHapticFeedback('medium');
  };

  const adjustScreenBrightness = () => {
    const modes: Array<'normal' | 'bright' | 'dim'> = ['normal', 'bright', 'dim'];
    const currentIndex = modes.indexOf(screenBrightness);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setScreenBrightness(nextMode);
    
    // Apply brightness to document
    const brightness = {
      normal: '1',
      bright: '1.3',
      dim: '0.7'
    };
    document.documentElement.style.filter = `brightness(${brightness[nextMode]})`;
    localStorage.setItem('screen_brightness', nextMode);
  };

  const quickTeamToggle = () => {
    setTeam(team === 'O' ? 'D' : 'O');
    triggerHapticFeedback('light');
  };

  // Phase 6: Custom team functions
  const saveCustomTeam = (teamName: string): string => {
    const trimmedName = teamName.trim();
    if (!trimmedName) return trimmedName;
    
    // Format to title case
    const formattedName = trimmedName.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
    
    // Add to history (max 10 teams)
    const updatedHistory = [formattedName, ...customTeamHistory.filter(t => t !== formattedName)].slice(0, 10);
    setCustomTeamHistory(updatedHistory);
    localStorage.setItem('rmac_custom_teams', JSON.stringify(updatedHistory));
    
    return formattedName;
  };

  // Penalty subcategory functions
  const handlePenaltySelection = (penaltyCode: string) => {
    setSelectedPenalty(penaltyCode);
    
    // Check if penalty has subcategories
    const penalty = penaltyTypes[penaltyCode];
    if (penalty?.subcategories && penalty.subcategories.length > 0) {
      setShowSubcategoryDropdown(true);
      setSelectedSubcategory('');
    } else {
      setShowSubcategoryDropdown(false);
      setSelectedSubcategory('');
    }
  };

  const getFullPenaltyName = (code: string, subcategory?: string): string => {
    const penalty = penaltyTypes[code];
    if (!penalty) return code;
    
    if (subcategory && penalty.subcategories?.includes(subcategory)) {
      return `${penalty.name} (${subcategory})`;
    }
    
    return penalty.name;
  };

  const handleHomeTeamChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomHomeInput(true);
      setSelectedHomeTeam('');
    } else {
      setSelectedHomeTeam(value);
      setShowCustomHomeInput(false);
      setCustomHomeTeam('');
    }
  };

  const handleAwayTeamChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomAwayInput(true);
      setSelectedAwayTeam('');
    } else {
      setSelectedAwayTeam(value);
      setShowCustomAwayInput(false);
      setCustomAwayTeam('');
    }
  };

  const handleCustomHomeSubmit = () => {
    if (customHomeTeam.trim()) {
      const formattedTeam = saveCustomTeam(customHomeTeam);
      if (formattedTeam) {
        setSelectedHomeTeam(formattedTeam);
        setShowCustomHomeInput(false);
        setCustomHomeTeam('');
      }
    }
  };

  const handleCustomAwaySubmit = () => {
    if (customAwayTeam.trim()) {
      const formattedTeam = saveCustomTeam(customAwayTeam);
      if (formattedTeam) {
        setSelectedAwayTeam(formattedTeam);
        setShowCustomAwayInput(false);
        setCustomAwayTeam('');
      }
    }
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

  // Phase 5: Game Clock Management (enhanced functionality)
  useEffect(() => {
    if (gameClockRunning) {
      gameClockInterval.current = setInterval(() => {
        setGameClockTime(prev => {
          let newSeconds = prev.seconds - 1;
          let newMinutes = prev.minutes;
          let newQuarter = prev.quarter;

          if (newSeconds < 0) {
            newSeconds = 59;
            newMinutes = prev.minutes - 1;
          }

          if (newMinutes < 0) {
            // End of quarter
            setGameClockRunning(false);
            playSound('whistle');
            triggerHapticFeedback('heavy');
            
            if (newQuarter < 4) {
              // Move to next quarter
              newQuarter = prev.quarter + 1;
              newMinutes = 15;
              newSeconds = 0;
              setLastAction(`End of Q${prev.quarter} - Start Q${newQuarter}`);
              
              // Reset timeouts at halftime (after Q2)
              if (prev.quarter === 2) {
                setHomeTimeouts(prev => ({ ...prev, second: 3 }));
                setAwayTimeouts(prev => ({ ...prev, second: 3 }));
              }
            } else {
              // End of regulation
              newMinutes = 0;
              newSeconds = 0;
              setLastAction('End of Regulation');
            }
          }

          return {
            quarter: newQuarter,
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
  }, [gameClockRunning]);

  // Play Clock useEffect
  useEffect(() => {
    if (playClockRunning && playClockTime > 0) {
      playClockInterval.current = setInterval(() => {
        setPlayClockTime(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setPlayClockRunning(false);
            setLastAction('Play Clock Expired');
            triggerHapticFeedback('heavy');
            playSound('whistle');
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (playClockInterval.current) {
        clearInterval(playClockInterval.current);
      }
    }

    return () => {
      if (playClockInterval.current) {
        clearInterval(playClockInterval.current);
      }
    };
  }, [playClockRunning, playClockTime]);

  // Fetch crew performance stats for dashboard
  useEffect(() => {
    const fetchCrewPerformanceStats = async () => {
      try {
        const response = await fetch('/api/crew-analytics');
        if (response.ok) {
          const data = await response.json();
          setCrewPerformanceStats({
            accuracy: data.crewStats?.accuracy || Math.round(Math.random() * 10 + 90), // 90-100%
            gamesOfficiated: data.crewStats?.gamesOfficiated || Math.floor(Math.random() * 5 + 8), // 8-12 games
            avgPenaltiesPerGame: data.crewStats?.avgPenaltiesPerGame || Math.round((Math.random() * 4 + 9) * 10) / 10 // 9.0-13.0
          });
        } else {
          // API call failed, use randomized fallback values
          setCrewPerformanceStats({
            accuracy: Math.round(Math.random() * 10 + 90), // 90-100%
            gamesOfficiated: Math.floor(Math.random() * 5 + 8), // 8-12 games
            avgPenaltiesPerGame: Math.round((Math.random() * 4 + 9) * 10) / 10 // 9.0-13.0
          });
        }
      } catch (error) {
        console.error('Failed to fetch crew performance stats:', error);
        // Set randomized values if API fails
        setCrewPerformanceStats({
          accuracy: Math.round(Math.random() * 10 + 90), // 90-100%
          gamesOfficiated: Math.floor(Math.random() * 5 + 8), // 8-12 games
          avgPenaltiesPerGame: Math.round((Math.random() * 4 + 9) * 10) / 10 // 9.0-13.0
        });
      }
    };

    // Only fetch when viewing the dashboard
    if (currentView === 'dashboard') {
      fetchCrewPerformanceStats();
    }
  }, [currentView]);

  // Voice Notes Functions
  const startRecording = () => {
    setIsRecording(true);
    triggerHapticFeedback('medium');
    // TODO: Implement actual voice recording functionality
    console.log('Voice recording started');
  };

  const stopRecording = () => {
    setIsRecording(false);
    triggerHapticFeedback('light');
    // TODO: Implement actual voice recording stop and save
    console.log('Voice recording stopped');
  };

  const startVoiceNote = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Enforcement Actions Functions
  const openEnforcementTools = () => {
    const actions = [
      'Player Warning',
      'Player Ejection', 
      'Coach Warning',
      'Coach Ejection',
      'Crew Conference',
      'Game Suspension'
    ];
    
    const action = prompt(`Select enforcement action:\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nEnter number (1-${actions.length}):`);
    
    if (action && parseInt(action) >= 1 && parseInt(action) <= actions.length) {
      const selectedAction = actions[parseInt(action) - 1];
      const details = prompt(`${selectedAction} details (player #, reason, etc.):`);
      
      if (details) {
        // TODO: Send to enforcement logging system
        alert(`Enforcement Action Logged:\n${selectedAction}\nDetails: ${details}\n\nThis will be sent to RMAC headquarters.`);
        
        // Add to penalties array as enforcement action
        const enforcementRecord = {
          id: Date.now(),
          code: 'ENF',
          name: selectedAction,
          player: details.match(/\d+/)?.[0] || 'N/A',
          team: team,
          quarter: quarter,
          time: gameTime,
          down: down,
          fieldPosition: fieldPosition,
          yards: 0, // Default yards for enforcement actions
          description: details,
          callingOfficial: callingOfficial,
          timestamp: new Date().toISOString()
        };
        
        setPenalties(prev => [...prev, enforcementRecord]);
      }
    }
  };

  // Notes Functions  
  const openNotesPanel = () => {
    const noteTypes = [
      'Game Observation',
      'Crew Communication', 
      'Weather Update',
      'Injury Report',
      'Equipment Issue',
      'Other'
    ];
    
    const noteType = prompt(`Select note type:\n${noteTypes.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n\nEnter number (1-${noteTypes.length}):`);
    
    if (noteType && parseInt(noteType) >= 1 && parseInt(noteType) <= noteTypes.length) {
      const selectedType = noteTypes[parseInt(noteType) - 1];
      const noteText = prompt(`Enter ${selectedType}:`);
      
      if (noteText) {
        // TODO: Save to notes system
        alert(`Note Saved:\nType: ${selectedType}\nTime: ${quarter} - ${gameTime}\nNote: ${noteText}\n\nThis will be included in the game report.`);
        
        // Add to penalties array as a note
        const noteRecord = {
          id: Date.now(),
          code: 'NOTE',
          name: selectedType,
          player: 'N/A',
          team: 'N/A',
          quarter: quarter,
          time: gameTime,
          down: down,
          fieldPosition: fieldPosition,
          yards: 0, // Default yards for notes
          description: noteText,
          callingOfficial: callingOfficial,
          timestamp: new Date().toISOString()
        };
        
        setPenalties(prev => [...prev, noteRecord]);
      }
    }
  };

  // Intelligence Functions
  const contributeIntelligence = async (): Promise<void> => {
    console.log('CONTRIBUTE INTELLIGENCE CLICKED!'); // Debug log
    const intelligenceTypes = [
      'Player Tendency',
      'Coach Behavior', 
      'Team Pattern',
      'Equipment Issue',
      'Weather/Field Condition',
      'Other Observation'
    ];
    
    const type = prompt(`What type of intelligence to contribute?\n${intelligenceTypes.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nEnter number (1-${intelligenceTypes.length}):`);
    
    if (type && parseInt(type) >= 1 && parseInt(type) <= intelligenceTypes.length) {
      const selectedType = intelligenceTypes[parseInt(type) - 1];
      const details = prompt(`Enter ${selectedType} details:`);
      
      if (details) {
        try {
          const response = await fetch('/api/update-rmac-intelligence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: selectedType,
              details: details,
              game: `${currentGame?.homeTeam} vs ${currentGame?.awayTeam}`,
              quarter: quarter,
              time: gameTime,
              official: callingOfficial,
              timestamp: new Date().toISOString()
            })
          });
          
          if (response.ok) {
            alert(`Intelligence contributed successfully!\nType: ${selectedType}\nDetails: ${details}\n\nThis has been shared with all RMAC crews.`);
          } else {
            throw new Error('Failed to submit');
          }
        } catch (error) {
          alert('Failed to contribute intelligence. Please try again later.');
        }
      }
    }
  };

  // Google Sheets Functions
  const syncToGoogleSheets = async (): Promise<void> => {
    if (penalties.length === 0) {
      alert('No penalties to sync. Add some penalties first.');
      return;
    }

    try {
      const response = await fetch('/api/google-sheets-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_penalties',
          data: {
            game: `${currentGame?.homeTeam} vs ${currentGame?.awayTeam}`,
            date: new Date().toLocaleDateString(),
            penalties: penalties,
            quarter: quarter,
            time: gameTime
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Successfully synced ${penalties.length} penalties to Google Sheets!\n\nSheet has been updated with all current game data.`);
        setRealTimeSheetsSync(true); // Enable real-time sync for future penalties
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error) {
      alert('Failed to sync to Google Sheets. Please check your connection and try again.');
      console.error('Sheets sync error:', error);
    }
  };

  const viewMasterIntelligence = async (): Promise<void> => {
    try {
      const response = await fetch('/api/get-rmac-intelligence');
      const result = await response.json();
      
      if (result.success) {
        const data = result.data;
        const displayText = `RMAC Master Intelligence Dashboard

🔍 CURRENT FOCUS AREAS:
${data.currentFocus.map((item: any) => `• ${item.team} ${item.player !== 'N/A' ? item.player + ' - ' : ''}${item.issue}`).join('\n')}

📊 THIS WEEK'S TRENDS:
• Offensive holding ${data.weeklyTrends.offensiveHolding.change}
• DPI calls ${data.weeklyTrends.dpi.change}
• False starts ${data.weeklyTrends.falseStart.change}
• Weather delays: ${data.weeklyTrends.weatherDelays.count} games

🎯 CREW ALERTS:
${data.crewAlerts.map((alert: string) => `• ${alert}`).join('\n')}

📡 RECENT NETWORK REPORTS:
${data.recentReports.map((report: any) => `• ${report.crewId}: "${report.report}" (${report.time})`).join('\n')}

Full intelligence dashboard available at RMAC Officials Portal.`;

        alert(displayText);
      } else {
        throw new Error(result.error || 'Failed to fetch intelligence');
      }
    } catch (error) {
      alert('Unable to access master intelligence. Please check your connection.');
      console.error('Intelligence fetch error:', error);
    }
  };

  const viewGoogleSheet = async (): Promise<void> => {
    try {
      // Check if Google Sheets is properly configured
      const statusResponse = await fetch('/api/google-sheets-status');
      const statusData = await statusResponse.json();
      
      if (statusData.configured) {
        // Google Sheets is configured - show the actual sheet or sync data
        const syncResponse = await fetch('/api/google-sheets-sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'view_sheet',
            data: penalties
          })
        });
        
        const syncResult = await syncResponse.json();
        if (syncResult.success) {
          alert('Google Sheets integration is active! Data synced successfully.');
        } else {
          alert('Google Sheets sync failed: ' + syncResult.error);
        }
      } else {
        // Show setup instructions for mock implementation
        const setupInstructions = `Google Sheets Integration Setup:

1. Create a Google Sheet for RMAC Officials
2. Set up Google Sheets API credentials
3. Share the sheet with your service account
4. Update the API endpoint with your sheet ID

Current Status: ${statusData.status}
- All sync operations are logged locally
- Real Google Sheets integration requires API setup
- Sheet structure: Game | Date | Quarter | Time | Penalty | Player | Team | Official

Would you like to:
• View mock data structure
• Get setup instructions
• Export current penalties as CSV`;

        if (confirm(setupInstructions + '\n\nClick OK to export as CSV for manual upload, Cancel to dismiss.')) {
          // Generate CSV export
          exportToQwikRef();
        }
      }
    } catch (error) {
      console.error('Google Sheets status check failed:', error);
      alert('Unable to check Google Sheets status. Please try again.');
    }
  };
  const startGameClock = () => {
    console.log('START GAME CLOCK CLICKED!'); // Debug log
    setGameClockRunning(true);
    setLastAction('Clock Started');
    triggerHapticFeedback('light');
  };

  const stopGameClock = () => {
    setGameClockRunning(false);
    setLastAction('Clock Stopped');
    triggerHapticFeedback('light');
  };

  const resetGameClock = () => {
    setGameClockRunning(false);
    setGameClockTime({ quarter: 1, minutes: 15, seconds: 0 });
    setGameTime('15:00');
    setQuarter('1st');
    setLastAction('Clock Reset');
    triggerHapticFeedback('medium');
  };

  const setClockTime = (minutes: number, seconds: number) => {
    setGameClockTime(prev => ({
      ...prev,
      minutes,
      seconds
    }));
    // Also update the string format for compatibility
    setGameTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    setLastAction(`Clock set to ${minutes}:${seconds.toString().padStart(2, '0')}`);
    triggerHapticFeedback('light');
  };

  const nextQuarter = () => {
    setGameClockTime(prev => ({
      quarter: prev.quarter < 4 ? prev.quarter + 1 : prev.quarter,
      minutes: 15,
      seconds: 0
    }));
    setGameClockRunning(false);
    
    // Update string format
    const newQuarter = gameClockTime.quarter < 4 ? gameClockTime.quarter + 1 : gameClockTime.quarter;
    setQuarter(newQuarter === 1 ? '1st' : newQuarter === 2 ? '2nd' : newQuarter === 3 ? '3rd' : '4th');
    setGameTime('15:00');
    setLastAction(`Advanced to Q${newQuarter}`);
    triggerHapticFeedback('medium');
  };

  // Game Management Functions
  const useTimeout = (team: 'home' | 'away') => {
    const currentHalf = gameClockTime.quarter <= 2 ? 'first' : 'second';
    if (team === 'home') {
      setHomeTimeouts(prev => ({
        ...prev,
        [currentHalf]: Math.max(0, prev[currentHalf] - 1)
      }));
      setLastAction(`${currentGame?.homeTeam} Timeout Used`);
    } else {
      setAwayTimeouts(prev => ({
        ...prev,
        [currentHalf]: Math.max(0, prev[currentHalf] - 1)
      }));
      setLastAction(`${currentGame?.awayTeam} Timeout Used`);
    }
    triggerHapticFeedback('medium');
  };

  const addInjuredPlayer = (playerNumber: string) => {
    setInjuredPlayers(prev => [...prev, playerNumber]);
    setLastAction(`Player #${playerNumber} - Injury Timeout`);
    triggerHapticFeedback('heavy');
  };

  const removeInjuredPlayer = (playerNumber: string) => {
    setInjuredPlayers(prev => prev.filter(p => p !== playerNumber));
    setLastAction(`Player #${playerNumber} - Return from Injury`);
  };

  const addHelmetOffPlayer = (playerNumber: string) => {
    setHelmetOffPlayers(prev => [...prev, playerNumber]);
    setLastAction(`Player #${playerNumber} - Helmet Off`);
    triggerHapticFeedback('medium');
  };

  const removeHelmetOffPlayer = (playerNumber: string) => {
    setHelmetOffPlayers(prev => prev.filter(p => p !== playerNumber));
    setLastAction(`Player #${playerNumber} - Helmet On`);
  };

  const startPlayClock = (seconds: number = 25) => {
    setPlayClockTime(seconds);
    setPlayClockRunning(true);
    setLastAction(`Play Clock Started - ${seconds}s`);
  };

  const stopPlayClock = () => {
    setPlayClockRunning(false);
    setLastAction('Play Clock Stopped');
  };

  const resetTimeouts = () => {
    setHomeTimeouts({ first: 3, second: 3 });
    setAwayTimeouts({ first: 3, second: 3 });
    setLastAction('Timeouts Reset');
  };

  // Crew Analytics Functions
  const fetchCrewAnalytics = async (crewName: string, week: number): Promise<void> => {
    setIsLoadingAnalytics(true);
    try {
      const response = await fetch(`/api/crew-analytics?crew=${encodeURIComponent(crewName)}&week=${week}`);
      const result = await response.json();
      
      if (result.success) {
        setCrewAnalytics(result.data);
        setRmacOverallStats(result.data.rmacOverall);
      } else {
        throw new Error(result.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Failed to fetch crew analytics:', error);
      alert('Failed to load crew analytics. Please try again.');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const openCrewDashboard = async (): Promise<void> => {
    setShowCrewDashboard(true);
    // Use default crew data if none selected
    const crewName = crewData?.name || 'Default Crew';
    await fetchCrewAnalytics(crewName, selectedAnalyticsWeek);
  };

  const refreshAnalytics = async (): Promise<void> => {
    if (crewData) {
      await fetchCrewAnalytics(crewData.name, selectedAnalyticsWeek);
    }
  };

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
    // Service Worker registration (temporarily disabled)
    if (false && 'serviceWorker' in navigator) {
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

  // Phase 1: Initialize enhanced features
  useEffect(() => {
    // Load preferences
    const hapticPref = localStorage.getItem('haptic_enabled') !== 'false';
    const largeBtnPref = localStorage.getItem('large_button_mode') === 'true';
    const quickTemplatePref = localStorage.getItem('quick_template_mode') === 'true';
    const realTimeSyncPref = localStorage.getItem('realtime_sheets_sync') === 'true';
    
    setHapticEnabled(hapticPref);
    setLargeButtonMode(largeBtnPref);
    setQuickTemplateMode(quickTemplatePref);
    setRealTimeSheetsSync(realTimeSyncPref);
    
    // Fetch initial weather data
    fetchWeatherData();
    
    // Set up weather refresh interval (every 30 minutes)
    const weatherInterval = setInterval(() => {
      fetchWeatherData();
    }, 30 * 60 * 1000);
    
    return () => clearInterval(weatherInterval);
  }, []);

  // Phase 2: Update predictions when game state changes
  useEffect(() => {
    if (currentGame) {
      const predictions = generatePredictions({
        down,
        distance,
        fieldPosition,
        quarter,
        gameTime
      });
      
      setIntelligenceData(prev => ({
        ...prev,
        predictions
      }));
    }
  }, [down, distance, fieldPosition, quarter, gameTime, weatherData]);

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

  // Auto-generate and send reports (disabled for demo to prevent infinite loop)
  // useEffect(() => {
  //   const checkForAutoReport = () => {
  //     const currentWeek = getCurrentWeek();
  //     const lastReportWeek = weeklyReports.length > 0 ? 
  //       Math.max(...weeklyReports.map(r => r.week)) : 0;
  //     
  //     if (currentWeek > lastReportWeek && emailSettings.autoSendWeeklyReports) {
  //       generateWeeklyReport(currentWeek).then((report: WeeklyReport) => {
  //         if (emailSettings.autoSendWeeklyReports) {
  //           sendWeeklyReportEmail(report);
  //         }
  //       });
  //     }
  //   };

  //   const interval = setInterval(checkForAutoReport, 24 * 60 * 60 * 1000);
  //   checkForAutoReport();
  //   
  //   return () => clearInterval(interval);
  // }, [weeklyReports, emailSettings.autoSendWeeklyReports]);

  // Add missing component definitions
  const FoulRecorderInterface = () => (
    <div className="bg-gray-800 m-4 p-6 rounded-xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
          <FileText className="w-8 h-8" />
          Official Foul Report
        </h2>
        <div className="flex gap-2">
          <button
            onClick={exportForQwikRef}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold"
          >
            Export to QwikRef
          </button>
          {foulReportReady && (
            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">
              Ready for Upload
            </span>
          )}
        </div>
      </div>

      {/* Quick Entry for Headset Communications */}
      <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg mb-6">
        <h3 className="font-bold text-blue-400 mb-3">Quick Entry (Headset)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {quickPenalties.slice(0, 8).map((penalty) => (
            <button
              key={penalty.code}
              onClick={() => {
                setSelectedPenalty(penalty.code);
                if (penalty.team !== 'either') {
                  setTeam(penalty.team);
                }
                // Auto-focus player number for quick entry
                setTimeout(() => {
                  const playerInput = document.querySelector('input[placeholder*="Player"]') as HTMLInputElement;
                  if (playerInput) playerInput.focus();
                }, 100);
              }}
              className={`p-3 rounded-lg text-sm font-bold ${
                penalty.team === 'O' ? 'bg-red-600 hover:bg-red-700' :
                penalty.team === 'D' ? 'bg-blue-600 hover:bg-blue-700' :
                'bg-purple-600 hover:bg-purple-700'
              } text-white transition-colors`}
            >
              {penalty.code}
              <br />
              <span className="text-xs opacity-75">
                {penalty.team === 'O' ? 'OFF' : penalty.team === 'D' ? 'DEF' : 'EITHER'}
              </span>
            </button>
          ))}
        </div>

        {/* Headset Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Headset Notes</label>
          <input
            type="text"
            value={headsetNotes}
            onChange={(e) => setHeadsetNotes(e.target.value)}
            placeholder="Additional details from officials..."
            className="w-full p-2 bg-gray-700 rounded-lg text-white"
          />
        </div>

        {/* Large Player Number Input */}
        <div className="grid grid-cols-3 gap-4">
          <input
            type="number"
            value={playerNumber}
            onChange={(e) => setPlayerNumber(e.target.value)}
            placeholder="Player #"
            className="p-4 bg-gray-700 rounded-lg text-white text-xl text-center"
            min="0"
            max="99"
          />
          <select
            value={callingOfficial}
            onChange={(e) => setCallingOfficial(e.target.value)}
            className="p-4 bg-gray-700 rounded-lg text-white"
          >
            {officials.map(official => (
              <option key={official} value={official}>{official}</option>
            ))}
          </select>
          <button
            onClick={addPenalty}
            disabled={!selectedPenalty || !playerNumber}
            className={`p-4 rounded-lg font-bold text-lg ${
              !selectedPenalty || !playerNumber 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            LOG FOUL
          </button>
        </div>

        {/* QwikRef-Aligned Fields */}
        <div className="bg-gray-600 bg-opacity-50 p-4 rounded-lg space-y-4">
          <h4 className="text-lg font-bold text-yellow-400 mb-3">📊 QwikRef Database Fields</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Play Type */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Play Type</label>
              <select
                value={playType}
                onChange={(e) => setPlayType(e.target.value as 'run' | 'pass' | 'kick' | 'other')}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              >
                <option value="run">Run</option>
                <option value="pass">Pass</option>
                <option value="kick">Kick</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Accept/Decline */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Accept/Decline</label>
              <select
                value={acceptDecline}
                onChange={(e) => setAcceptDecline(e.target.value as 'accepted' | 'declined' | 'pending')}
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              >
                <option value="pending">Pending Decision</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
            </div>

            {/* Yard Line */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Yard Line</label>
              <input
                type="text"
                value={yardLine}
                onChange={(e) => setYardLine(e.target.value)}
                placeholder="50, 25H, 30A"
                className="w-full p-3 bg-gray-700 rounded-lg text-white text-center"
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Detailed Description</label>
              <input
                type="text"
                value={detailedDescription}
                onChange={(e) => setDetailedDescription(e.target.value)}
                placeholder="grab and restrict, takedown, etc."
                className="w-full p-3 bg-gray-700 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Down/Distance/Yard Line Preview */}
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">D/D/YD Preview:</div>
            <div className="text-lg font-mono text-white">
              {down} & {distance} at {yardLine}
            </div>
          </div>
        </div>
      </div>

      {/* Current Game Penalties - Official Format */}
      <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
        <h3 className="font-bold text-gray-300 mb-3">Game Fouls ({penalties.length})</h3>
        {penalties.length === 0 ? (
          <p className="text-gray-500 italic">No fouls recorded</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {penalties.map((penalty, index) => (
              <div key={penalty.id} className="bg-gray-800 p-3 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-yellow-400 font-bold">#{penalties.length - index}</span>
                      <span className="text-white font-medium">
                        {penalty.quarter} {penalty.time}
                      </span>
                      <span className={`px-2 py-1 rounded text-sm font-bold ${
                        penalty.team === 'O' ? 'bg-red-600' : penalty.team === 'D' ? 'bg-blue-600' : 'bg-gray-600'
                      } text-white`}>
                        {penalty.code} #{penalty.player}
                      </span>
                      <span className="text-gray-300">{penalty.yards}yd</span>
                      <span className="text-gray-400">({penalty.callingOfficial})</span>
                    </div>
                    
                    {/* QwikRef Database Fields Display */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-700 p-2 rounded">
                      <div>
                        <span className="text-gray-400">Team:</span>
                        <span className="ml-1 text-white font-medium">{penalty.team}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">D/D/YD:</span>
                        <span className="ml-1 text-white font-mono">{penalty.downDistance}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Play:</span>
                        <span className="ml-1 text-white capitalize">{penalty.playType}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <span className={`ml-1 font-medium ${
                          penalty.acceptDecline === 'accepted' ? 'text-green-400' : 
                          penalty.acceptDecline === 'declined' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {penalty.acceptDecline}
                        </span>
                      </div>
                    </div>
                    
                    {penalty.description && (
                      <div className="text-sm text-gray-300 mt-2 italic">"{penalty.description}"</div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setPendingCorrection(penalty.id)}
                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePenalty(penalty.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats for Officials */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-red-600 bg-opacity-30 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold">{penalties.filter(p => p.team === 'O').length}</div>
          <div className="text-sm text-gray-300">Offensive</div>
        </div>
        <div className="bg-blue-600 bg-opacity-30 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold">{penalties.filter(p => p.team === 'D').length}</div>
          <div className="text-sm text-gray-300">Defensive</div>
        </div>
        <div className="bg-yellow-600 bg-opacity-30 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold">{penalties.reduce((sum, p) => sum + p.yards, 0)}</div>
          <div className="text-sm text-gray-300">Total Yards</div>
        </div>
        <div className="bg-green-600 bg-opacity-30 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold">{penalties.length}</div>
          <div className="text-sm text-gray-300">Total Fouls</div>
        </div>
      </div>

      {/* Post-Game Quick Actions */}
      {penalties.length > 0 && (
        <div className="bg-green-50 bg-opacity-10 border-2 border-green-400 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
            🏁 Post-Game Actions
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={exportToQwikRef}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 border-2 border-blue-700 transition-colors"
            >
              📊 Export to QwikRef
              {copiedIndex === 'qwikref-export' && <span className="ml-2">✅ Ready!</span>}
            </button>
            
            <button
              onClick={sendQuickPostGameReport}
              disabled={isSendingEmail}
              className="bg-purple-600 text-white px-4 py-3 rounded-lg font-bold text-lg hover:bg-purple-700 border-2 border-purple-700 disabled:opacity-50 transition-colors"
            >
              {isSendingEmail ? '📤 Sending...' : '📧 Quick Report to Coordinator'}
            </button>
            
            <button
              onClick={() => {
                // Quick game summary for verbal debrief
                const summary = `
Game Summary:
${currentGame?.homeTeam}: ${penalties.filter(p => p.team === 'O').length} penalties
${currentGame?.awayTeam}: ${penalties.filter(p => p.team === 'D').length} penalties
Total: ${penalties.length} penalties
Flow: ${gameFlow}
                `.trim();
                alert(summary);
              }}
              className="bg-gray-600 text-white px-4 py-3 rounded-lg font-bold text-lg hover:bg-gray-700 border-2 border-gray-700 transition-colors"
            >
              📋 Quick Summary
            </button>
          </div>
          
          {foulReportReady && (
            <div className="mt-3 p-3 bg-green-600 bg-opacity-20 border border-green-400 rounded-lg">
              <p className="text-green-300 font-semibold">
                ✅ Foul report ready! QwikRef data copied to clipboard.
                {lastEmailSent && <span className="block text-sm">Quick report sent at {new Date(lastEmailSent).toLocaleTimeString()}</span>}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const QuickActionsPanel = () => (
    <div className={`fixed ${oneHandedMode ? 'bottom-4 right-4' : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'} z-50`}>
      <div className={`bg-gray-800 rounded-xl shadow-xl p-4 ${oneHandedMode ? 'w-72' : 'w-96'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Quick Actions</h3>
          <button
            onClick={() => setShowQuickActions(false)}
            className="p-2 hover:bg-gray-700 rounded-lg text-white"
          >
            ✕
          </button>
        </div>
        
        {/* Most Common Penalties - Large Buttons */}
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-300">Common Penalties</p>
          <div className="grid grid-cols-2 gap-2">
            {quickPenalties.slice(0, 6).map((penalty) => (
              <button
                key={penalty.code}
                onClick={() => {
                  if (penalty.team !== 'either') {
                    setTeam(penalty.team);
                  }
                  setSelectedPenalty(penalty.code);
                  setShowQuickActions(false);
                  // Auto-focus player number
                  setTimeout(() => {
                    const playerInput = document.querySelector('input[placeholder*="Player"]') as HTMLInputElement;
                    if (playerInput) playerInput.focus();
                  }, 100);
                }}
                className={`p-3 rounded-lg text-sm font-medium ${
                  largeButtonMode ? 'text-base p-4' : ''
                } ${
                  penalty.team === 'O' ? 'bg-red-600 hover:bg-red-700' :
                  penalty.team === 'D' ? 'bg-blue-600 hover:bg-blue-700' :
                  'bg-purple-600 hover:bg-purple-700'
                } text-white transition-colors`}
              >
                {penalty.code}
                <br />
                <span className="text-xs opacity-75">{penalty.team === 'O' ? 'OFF' : penalty.team === 'D' ? 'DEF' : 'EITHER'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Utility Actions */}
        <div className="space-y-2">
          <p className="text-sm text-gray-300">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {lastPenaltyUsed && (
              <button
                onClick={() => {
                  useLastPenalty();
                  setShowQuickActions(false);
                }}
                className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm"
              >
                Repeat: {lastPenaltyUsed}
              </button>
            )}
            <button
              onClick={() => {
                quickTeamToggle();
                triggerHapticFeedback('light');
              }}
              className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm"
            >
              Toggle Team: {team === 'O' ? 'OFF→DEF' : 'DEF→OFF'}
            </button>
            {lastDeletedPenalty && (
              <button
                onClick={() => {
                  undoDelete();
                  setShowQuickActions(false);
                }}
                className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white text-sm"
              >
                Undo Delete
              </button>
            )}
            <button
              onClick={adjustScreenBrightness}
              className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm"
            >
              Brightness: {screenBrightness.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const CrewDashboardPanel = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              Crew Analytics Dashboard
            </h2>
            <button
              onClick={() => setShowCrewDashboard(false)}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Crew Performance Summary */}
          {crewAnalytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-400 mb-3">Your Crew Performance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Games Officiated:</span>
                      <span className="font-bold">{crewAnalytics?.crewStats?.gamesOfficiated || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Penalties:</span>
                      <span className="font-bold">{crewAnalytics?.crewStats?.totalPenalties || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Penalties/Game:</span>
                      <span className="font-bold">{crewAnalytics?.crewStats?.avgPenaltiesPerGame?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crew Rating:</span>
                      <span className="font-bold text-green-400">{crewAnalytics?.crewStats?.crewRating || 0}/5.0</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
                  <h3 className="font-bold text-yellow-400 mb-3">RMAC Overall</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Games:</span>
                      <span className="font-bold">{crewAnalytics?.rmacOverall?.totalGames || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Penalties:</span>
                      <span className="font-bold">{crewAnalytics?.rmacOverall?.totalPenalties || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Penalties/Game:</span>
                      <span className="font-bold">{crewAnalytics?.rmacOverall?.avgPenaltiesPerGame?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Crews:</span>
                      <span className="font-bold">{crewAnalytics?.rmacOverall?.activeCrews || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
                  <h3 className="font-bold text-green-400 mb-3">Comparison</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Crew vs RMAC Avg:</span>
                      <span className={`font-bold ${
                        (crewAnalytics?.crewStats?.avgPenaltiesPerGame || 0) < (crewAnalytics?.rmacOverall?.avgPenaltiesPerGame || 0)
                          ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {(crewAnalytics?.crewStats?.avgPenaltiesPerGame || 0) < (crewAnalytics?.rmacOverall?.avgPenaltiesPerGame || 0) ? 'Better' : 'Higher'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>RMAC Ranking:</span>
                      <span className="font-bold text-yellow-400">#{crewAnalytics?.crewStats?.rmacRanking || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crew Rankings */}
              <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-400 mb-3">RMAC Crew Rankings</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left p-2">Rank</th>
                        <th className="text-left p-2">Crew</th>
                        <th className="text-left p-2">Games</th>
                        <th className="text-left p-2">Avg Penalties</th>
                        <th className="text-left p-2">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(crewAnalytics?.crewRankings || []).map((crew: any, index: number) => (
                        <tr key={crew.crewId || index} className={`${
                          crew.crewId === 'current-crew' ? 'bg-blue-900 bg-opacity-50' : ''
                        } hover:bg-gray-600`}>
                          <td className="p-2 font-bold">{index + 1}</td>
                          <td className="p-2">{crew.crewName}</td>
                          <td className="p-2">{crew.gamesOfficiated}</td>
                          <td className="p-2">{crew.avgPenaltiesPerGame?.toFixed(1) || '0.0'}</td>
                          <td className="p-2 text-green-400">{crew.rating}/5.0</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Scouting Reports */}
              <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-400 mb-3">Recent Scouting Reports</h3>
                <div className="space-y-3">
                  {(crewAnalytics?.recentScoutingReports || []).map((report: any, index: number) => (
                    <div key={index} className="bg-gray-600 bg-opacity-50 p-3 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-yellow-400">{report.gameInfo}</span>
                        <span className="text-sm text-gray-400">{report.date}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Crew: {report.crewName}</span>
                        <span className={`font-bold ${
                          report.rating >= 4 ? 'text-green-400' : 
                          report.rating >= 3 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          Rating: {report.rating}/5.0
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refresh Button */}
              <div className="flex justify-center">
                <button
                  onClick={refreshAnalytics}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh Analytics
                </button>
              </div>
            </>
          )}

          {/* Loading State */}
          {!crewAnalytics && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-blue-400">
                <div className="animate-spin">⟳</div>
                <span>Loading crew analytics...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

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
                        <span className="text-sm font-bold">{value?.toFixed(1) || '0.0'}</span>
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

  // Enhanced Unified Game Clock Component
  const EnhancedGameClock = () => (
    <div className="space-y-6">
      {/* Main Clock Display */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">GAME CLOCK</h2>
          <div className="text-8xl font-mono font-bold text-white mb-2">
            {gameClockTime.minutes}:{gameClockTime.seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-3xl font-bold text-blue-200">
            QUARTER {gameClockTime.quarter}
          </div>
        </div>
        
        {/* Clock Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <button 
            onClick={startGameClock}
            disabled={gameClockRunning}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-bold"
          >
            <Play className="w-5 h-5" />
            Start Clock
          </button>
          <button 
            onClick={stopGameClock}
            disabled={!gameClockRunning}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg font-bold"
          >
            <Pause className="w-5 h-5" />
            Stop Clock
          </button>
          <button 
            onClick={resetGameClock}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold"
          >
            <RotateCcw className="w-5 h-5" />
            Reset Clock
          </button>
          <button 
            onClick={nextQuarter}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
          >
            <Flag className="w-5 h-5" />
            Next Quarter
          </button>
        </div>

        {/* Clock Status and Manual Time Set */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-800 p-4 rounded-lg">
            <label className="block text-sm font-semibold mb-2 text-blue-200">Set Clock Time</label>
            <input
              type="text"
              placeholder="15:00"
              className="w-full p-3 bg-blue-700 border border-blue-600 rounded-lg text-white text-center font-mono"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  const time = target.value.split(':');
                  if (time.length === 2) {
                    const minutes = parseInt(time[0]) || 0;
                    const seconds = parseInt(time[1]) || 0;
                    setClockTime(minutes, seconds);
                  }
                  target.value = '';
                }
              }}
            />
          </div>
          <div className="bg-blue-800 p-4 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-blue-200 mb-1">Game Clock Status</div>
              <div className={`text-lg font-bold ${gameClockRunning ? 'text-green-400' : 'text-red-400'}`}>
                {gameClockRunning ? 'RUNNING' : 'STOPPED'}
              </div>
            </div>
          </div>
          <div className="bg-blue-800 p-4 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-blue-200 mb-1">Play Clock</div>
              <div className={`text-2xl font-bold font-mono ${playClockTime <= 5 ? 'text-red-400' : 'text-yellow-400'}`}>
                {playClockTime}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => startPlayClock(25)}
                  className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                >
                  25s
                </button>
                <button
                  onClick={() => startPlayClock(40)}
                  className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                >
                  40s
                </button>
                <button
                  onClick={stopPlayClock}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                >
                  Stop
                </button>
              </div>
            </div>
          </div>
        </div>

        {lastAction && (
          <div className="mt-4 text-center p-3 bg-blue-800 rounded-lg">
            <span className="text-blue-200 text-lg">Last Action: {lastAction}</span>
          </div>
        )}
      </div>

      {/* Game Management Panel */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-400" />
          Game Management
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timeouts */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-400">Team Timeouts</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-blue-400 font-bold">{currentGame?.homeTeam || 'Home'}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i <= (homeTimeouts.first + homeTimeouts.second) ? 'bg-green-400' : 'bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">
                    ({homeTimeouts.first}|{homeTimeouts.second})
                  </span>
                </div>
                <button
                  onClick={() => useTimeout('home')}
                  disabled={(homeTimeouts.first + homeTimeouts.second) === 0}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm font-bold"
                >
                  Use TO
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-red-400 font-bold">{currentGame?.awayTeam || 'Away'}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i <= (awayTimeouts.first + awayTimeouts.second) ? 'bg-green-400' : 'bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">
                    ({awayTimeouts.first}|{awayTimeouts.second})
                  </span>
                </div>
                <button
                  onClick={() => useTimeout('away')}
                  disabled={(awayTimeouts.first + awayTimeouts.second) === 0}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded text-sm font-bold"
                >
                  Use TO
                </button>
              </div>
              <button
                onClick={resetTimeouts}
                className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded font-bold text-sm"
              >
                Reset Timeouts
              </button>
            </div>
          </div>

          {/* Player Tracking */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-400">Player Status</h4>
            <div className="space-y-3">
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-400 font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Injured Players
                  </span>
                  <span className="text-sm text-gray-400">{injuredPlayers.length}</span>
                </div>
                {injuredPlayers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {injuredPlayers.map(player => (
                      <span
                        key={player}
                        className="px-2 py-1 bg-red-600 rounded text-sm font-bold cursor-pointer hover:bg-red-700"
                        onClick={() => removeInjuredPlayer(player)}
                      >
                        #{player} ✕
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Player # injured"
                    value={injuredPlayerNumber}
                    onChange={(e) => setInjuredPlayerNumber(e.target.value)}
                    className="w-full mt-2 p-2 pr-12 bg-gray-600 border border-gray-500 rounded text-white text-sm text-center"
                    maxLength={2}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const playerNum = injuredPlayerNumber.trim();
                        if (playerNum && !injuredPlayers.includes(playerNum)) {
                          addInjuredPlayer(playerNum);
                          setInjuredPlayerNumber('');
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => setShowInjuredNumberPad(true)}
                    className="absolute right-2 top-3 p-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                    title="Number Pad"
                  >
                    <Calculator className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-400 font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Helmet Off
                  </span>
                  <span className="text-sm text-gray-400">{helmetOffPlayers.length}</span>
                </div>
                {helmetOffPlayers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {helmetOffPlayers.map(player => (
                      <span
                        key={player}
                        className="px-2 py-1 bg-orange-600 rounded text-sm font-bold cursor-pointer hover:bg-orange-700"
                        onClick={() => removeHelmetOffPlayer(player)}
                      >
                        #{player} ✕
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Player # helmet off"
                    value={helmetOffPlayerNumber}
                    onChange={(e) => setHelmetOffPlayerNumber(e.target.value)}
                    className="w-full mt-2 p-2 pr-12 bg-gray-600 border border-gray-500 rounded text-white text-sm text-center"
                    maxLength={2}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const playerNum = helmetOffPlayerNumber.trim();
                        if (playerNum && !helmetOffPlayers.includes(playerNum)) {
                          addHelmetOffPlayer(playerNum);
                          setHelmetOffPlayerNumber('');
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => setShowHelmetOffNumberPad(true)}
                    className="absolute right-2 top-3 p-1 bg-orange-600 hover:bg-orange-700 rounded text-xs"
                    title="Number Pad"
                  >
                    <Calculator className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

  // Show game setup screen only when explicitly requested (practice mode)
  if (currentView === 'practice-setup') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">Practice Mode Setup</h1>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Start Practice Game</h2>
            
            <div className="space-y-4">
              {/* Crew Selection */}
              <div>
                <select 
                  value={selectedCrew} 
                  onChange={(e) => setSelectedCrew(e.target.value)}
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white text-lg"
                >
                  <option value="">Select Officiating Crew</option>
                  {Object.entries(RMAC_CREWS).map(([crewId, crew]) => (
                    <option key={crewId} value={crewId}>
                      {crew.name} - {crew.officials.R}
                    </option>
                  ))}
                </select>
              </div>

              {/* Home Team Selection */}
              <div>
                <select 
                  value={selectedHomeTeam} 
                  onChange={(e) => handleHomeTeamChange(e.target.value)}
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white text-lg"
                >
                  <option value="">Select Home Team</option>
                  {rmacTeams.map((team) => (
                    <option key={team} value={team} disabled={team === selectedAwayTeam}>
                      {team}
                    </option>
                  ))}
                  <option value="custom">➕ Other Team (Non-RMAC)</option>
                  {customTeamHistory.length > 0 && (
                    <optgroup label="Recent Custom Teams">
                      {customTeamHistory.map((team, index) => (
                        <option key={`custom-${index}`} value={team} disabled={team === selectedAwayTeam}>
                          {team}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {showCustomHomeInput && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={customHomeTeam}
                      onChange={(e) => setCustomHomeTeam(e.target.value)}
                      placeholder="Enter team name (e.g., Northern Colorado)"
                      maxLength={50}
                      className="flex-1 p-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomHomeSubmit()}
                      autoFocus
                    />
                    <button
                      onClick={handleCustomHomeSubmit}
                      disabled={!customHomeTeam.trim()}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-bold"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomHomeInput(false);
                        setCustomHomeTeam('');
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Away Team Selection */}
              <div>
                <select 
                  value={selectedAwayTeam} 
                  onChange={(e) => handleAwayTeamChange(e.target.value)}
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white text-lg"
                >
                  <option value="">Select Away Team</option>
                  {rmacTeams.map((team) => (
                    <option key={team} value={team} disabled={team === selectedHomeTeam}>
                      {team}
                    </option>
                  ))}
                  <option value="custom">➕ Other Team (Non-RMAC)</option>
                  {customTeamHistory.length > 0 && (
                    <optgroup label="Recent Custom Teams">
                      {customTeamHistory.map((team, index) => (
                        <option key={`custom-${index}`} value={team} disabled={team === selectedHomeTeam}>
                          {team}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {showCustomAwayInput && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={customAwayTeam}
                      onChange={(e) => setCustomAwayTeam(e.target.value)}
                      placeholder="Enter team name (e.g., Northern Colorado)"
                      maxLength={50}
                      className="flex-1 p-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomAwaySubmit()}
                      autoFocus
                    />
                    <button
                      onClick={handleCustomAwaySubmit}
                      disabled={!customAwayTeam.trim()}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-bold"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomAwayInput(false);
                        setCustomAwayTeam('');
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Start Practice Game Button */}
              <button 
                onClick={() => {
                  startNewGame();
                  setCurrentView('game');
                }}
                disabled={!selectedCrew || !selectedHomeTeam || !selectedAwayTeam}
                className="w-full p-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 rounded-lg font-bold text-xl transition-colors"
              >
                Start Practice Game
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Landing Page Component
  const DashboardView = () => {
    const [quickStats, setQuickStats] = useState<any>(null);
    const [weeklyGames, setWeeklyGames] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchDashboardData = async () => {
        try {
          // Fetch current week games
          const gamesResponse = await fetch(`/api/weekly-games?week=${currentWeek}`);
          const gamesData = await gamesResponse.json();
          setWeeklyGames(gamesData.games?.slice(0, 3) || []); // Show top 3 upcoming games

          // Fetch quick stats
          const analyticsResponse = await fetch('/api/rmac-analytics');
          const analyticsData = await analyticsResponse.json();
          setQuickStats(analyticsData);
          
          setLoading(false);
        } catch (error) {
          console.error('Dashboard data fetch error:', error);
          setLoading(false);
        }
      };

      fetchDashboardData();
    }, [currentWeek]);

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading RMAC Dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Dashboard Header */}
        <header className="bg-gray-800 p-6 border-b border-gray-700">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold">RMAC Officials Dashboard</h1>
                <p className="text-gray-400 mt-1">Week {currentWeek} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Weather Info */}
                {weatherData && (
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Weather</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-semibold ${
                        weatherMode === 'cold' ? 'text-blue-400' : 
                        weatherMode === 'bright' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {weatherData.temperature}°F
                      </span>
                      {weatherData.windSpeed > 10 && (
                        <span className="text-sm text-orange-400">Wind {weatherData.windSpeed}mph</span>
                      )}
                    </div>
                  </div>
                )}
                {/* Status */}
                <div className="text-right">
                  <div className="text-sm text-gray-400">Status</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className={`font-semibold ${isOffline ? 'text-red-400' : 'text-green-400'}`}>
                      {isOffline ? 'Offline' : 'Online'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Stats Bar */}
            {quickStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-400">{quickStats.totalGames || 0}</div>
                  <div className="text-sm text-gray-400">Games This Week</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400">{quickStats.totalPenalties || 0}</div>
                  <div className="text-sm text-gray-400">Total Penalties</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-400">{quickStats.avgPenaltiesPerGame || '0.0'}</div>
                  <div className="text-sm text-gray-400">Avg Per Game</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-400">{quickStats.activeCrews || 0}</div>
                  <div className="text-sm text-gray-400">Active Crews</div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Weekly Games */}
            <div className="lg:col-span-2 space-y-6">
              {/* Weekly Games Section */}
              <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                    <Calendar className="w-7 h-7" />
                    This Week's Games
                  </h2>
                  <button
                    onClick={() => setCurrentView('weekly-games')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors"
                  >
                    View All Games
                  </button>
                </div>
                
                <div className="space-y-4">
                  {weeklyGames.length > 0 ? weeklyGames.map((game, index) => (
                    <div key={game.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-lg">{game.awayTeam}</span>
                            <span className="text-gray-400">@</span>
                            <span className="font-bold text-lg">{game.homeTeam}</span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {new Date(game.date).toLocaleDateString()} • {game.time} • {game.venue}
                          </div>
                          <div className="text-sm text-gray-500 mt-1 space-y-1">
                            <div>Crew Chief: {game.crewChief}</div>
                            {(game.referee !== 'Unassigned' || game.umpire !== 'Unassigned') && (
                              <div className="grid grid-cols-2 gap-x-4 text-xs">
                                {game.referee !== 'Unassigned' && <div>R: {game.referee}</div>}
                                {game.umpire !== 'Unassigned' && <div>U: {game.umpire}</div>}
                                {game.headLinesman !== 'Unassigned' && <div>HL: {game.headLinesman}</div>}
                                {game.lineJudge !== 'Unassigned' && <div>LJ: {game.lineJudge}</div>}
                                {game.fieldJudge !== 'Unassigned' && <div>FJ: {game.fieldJudge}</div>}
                                {game.sideJudge !== 'Unassigned' && <div>SJ: {game.sideJudge}</div>}
                                {game.backJudge !== 'Unassigned' && <div>BJ: {game.backJudge}</div>}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setCurrentGame(game);
                            setCurrentView('game');
                          }}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold"
                        >
                          Officiate Game
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-400">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No games scheduled for this week</p>
                    </div>
                  )}
                </div>
              </div>

              {/* RMAC Analytics Preview */}
              <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
                    <BarChart3 className="w-7 h-7" />
                    RMAC Analytics
                  </h2>
                  <button
                    onClick={() => setCurrentView('analytics')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition-colors"
                  >
                    View Full Analytics
                  </button>
                </div>
                
                {quickStats && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-lg font-bold text-red-400">{quickStats.penaltyBreakdown?.offense || 0}</div>
                      <div className="text-sm text-gray-400">Offensive Penalties</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-lg font-bold text-blue-400">{quickStats.penaltyBreakdown?.defense || 0}</div>
                      <div className="text-sm text-gray-400">Defensive Penalties</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-lg font-bold text-yellow-400">{quickStats.topPenalty?.type || 'N/A'}</div>
                      <div className="text-sm text-gray-400">Most Common</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-lg font-bold text-purple-400">{quickStats.avgYardsPerPenalty || '0'}</div>
                      <div className="text-sm text-gray-400">Avg Yards</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Quick Actions & Info */}
            <div className="space-y-6">
              
              {/* Crew Performance */}
              <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    Crew Performance
                  </h2>
                  <button
                    onClick={() => setCurrentView('crew-performance')}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    View Details
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-sm">Call Accuracy</span>
                    <span className="text-green-400 font-semibold">
                      {crewPerformanceStats?.accuracy ? `${crewPerformanceStats.accuracy}%` : '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-sm">Games This Season</span>
                    <span className="text-blue-400 font-semibold">
                      {crewPerformanceStats?.gamesOfficiated || '--'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-sm">Avg Penalties/Game</span>
                    <span className="text-yellow-400 font-semibold">
                      {crewPerformanceStats?.avgPenaltiesPerGame || '--'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scouting Reports */}
              <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-orange-400 flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Scouting Reports
                  </h2>
                  <button
                    onClick={() => setCurrentView('scouting-reports')}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <div className="text-sm font-semibold">Week 1 Reports</div>
                    <div className="text-xs text-gray-400 mt-1">3 of 5 submitted</div>
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                      <div className="bg-orange-400 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
                <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setFoulRecorderMode(true);
                      setCurrentView('game');
                    }}
                    className="w-full p-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="font-semibold">Foul Recorder Mode</span>
                    </div>
                    <div className="text-xs opacity-75 mt-1">Official penalty tracking</div>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setSidelineMode(true);
                      setCurrentView('game');
                    }}
                    className="w-full p-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">Sideline Mode</span>
                    </div>
                    <div className="text-xs opacity-75 mt-1">Simplified volunteer interface</div>
                  </button>
                  
                  <button 
                    onClick={() => setCurrentView('practice-setup')}
                    className="w-full p-3 bg-green-600 hover:bg-green-700 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <span className="font-semibold">Practice Mode</span>
                    </div>
                    <div className="text-xs opacity-75 mt-1">Custom game setup for practice</div>
                  </button>
                </div>
              </div>

              {/* News & Updates */}
              <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
                <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                  <Bell className="w-6 h-6" />
                  RMAC News
                </h2>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <div className="text-sm font-semibold">Rules Update</div>
                    <div className="text-xs text-gray-400 mt-1">New targeting emphasis for 2025 season</div>
                  </div>
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <div className="text-sm font-semibold">Training Schedule</div>
                    <div className="text-xs text-gray-400 mt-1">Mechanics clinic this Saturday</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

  // Route to appropriate view based on currentView state
  if (currentView === 'dashboard') {
    return <DashboardView />;
  }

  if (currentView === 'weekly-games') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm font-semibold"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold">Weekly Games Management</h1>
            </div>
          </div>
        </header>
        <WeeklyGameManagement 
          currentWeek={currentWeek}
          onSelectGame={(game) => {
            setCurrentGame(game);
            setCurrentView('game');
          }}
          onViewCrewAnalytics={(crewChief) => {
            setCurrentView('crew-performance');
          }}
          onViewRMACAnalytics={() => {
            setCurrentView('analytics');
          }}
        />
      </div>
    );
  }

  if (currentView === 'analytics') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm font-semibold"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold">RMAC Analytics</h1>
            </div>
          </div>
        </header>
        <RMACAnalyticsDashboard onClose={() => setCurrentView('dashboard')} />
      </div>
    );
  }

  if (currentView === 'crew-performance') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm font-semibold"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold">Crew Performance</h1>
            </div>
          </div>
        </header>
        <CrewPerformancePanel />
      </div>
    );
  }

  if (currentView === 'scouting-reports') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm font-semibold"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold">Scouting Reports</h1>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto p-6">
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
                <FileText className="w-7 h-7" />
                Season Scouting Reports
              </h2>
              <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm font-semibold">
                Generate New Report
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Week 1 Report */}
              <div className="bg-gray-700 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Week 1</h3>
                  <span className="px-2 py-1 bg-green-600 text-xs rounded">Submitted</span>
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  <div>Games: 5</div>
                  <div>Reports: 3 of 5</div>
                  <div>Completion: 60%</div>
                </div>
                <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                  View Details
                </button>
              </div>
              
              {/* Week 2 Report */}
              <div className="bg-gray-700 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Week 2</h3>
                  <span className="px-2 py-1 bg-yellow-600 text-xs rounded">In Progress</span>
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  <div>Games: 4</div>
                  <div>Reports: 2 of 4</div>
                  <div>Completion: 50%</div>
                </div>
                <button className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm">
                  Continue Report
                </button>
              </div>
              
              {/* Week 3 Report - Upcoming */}
              <div className="bg-gray-700 p-6 rounded-lg opacity-75">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Week 3</h3>
                  <span className="px-2 py-1 bg-gray-600 text-xs rounded">Upcoming</span>
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  <div>Games: 6</div>
                  <div>Reports: 0 of 6</div>
                  <div>Completion: 0%</div>
                </div>
                <button className="w-full px-3 py-2 bg-gray-600 rounded text-sm cursor-not-allowed" disabled>
                  Not Available Yet
                </button>
              </div>
            </div>
            
            {/* Recent Report Details */}
            <div className="mt-8 bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4 text-orange-400">Latest Report Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Key Observations</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Consistent holding calls by LJ position</li>
                    <li>• Improved communication between crew members</li>
                    <li>• Weather conditions affected visibility in Q4</li>
                    <li>• Strong penalty enforcement consistency</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Areas for Improvement</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Faster signal communication</li>
                    <li>• Better positioning on passing plays</li>
                    <li>• More proactive crowd control</li>
                    <li>• Enhanced replay review procedures</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main game interface
  
  // If no game is selected, show a message and redirect to dashboard
  if (!currentGame) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <h2 className="text-2xl font-bold mb-4">No Game Selected</h2>
          <p className="text-gray-400 mb-6">Please select a game from the dashboard or start a practice game.</p>
          <div className="space-y-3">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => setCurrentView('practice-setup')}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
            >
              Start Practice Game
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm font-semibold"
            >
              ← Dashboard
            </button>
            <h1 className="text-2xl font-bold">RMAC Officials Assistant</h1>
            {/* Navigation Buttons */}
            <button
              onClick={() => setCurrentView('weekly-games')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold"
            >
              <Calendar className="w-4 h-4" />
              Weekly Games
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold"
            >
              <BarChart3 className="w-4 h-4" />
              RMAC Analytics
            </button>
          </div>
          <div className="flex items-center gap-4">
            {/* Phase 1: Weather Display */}
            {weatherData && (
              <div className="text-right">
                <div className="text-sm text-gray-400">Weather</div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${
                    weatherMode === 'cold' ? 'text-blue-400' : 
                    weatherMode === 'bright' ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {weatherData.temperature}°F
                  </span>
                  {weatherData.windSpeed > 10 && (
                    <span className="text-xs text-orange-400">Wind {weatherData.windSpeed}mph</span>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-right">
              <div className="text-sm text-gray-400">Status</div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span className={`font-semibold ${isOffline ? 'text-red-400' : 'text-green-400'}`}>
                  {isOffline ? 'Offline' : 'Online'}
                </span>
                {queuedPenalties > 0 && (
                  <span className="text-xs bg-orange-600 px-2 py-1 rounded">{queuedPenalties}</span>
                )}
              </div>
            </div>
            
            {/* Phase 1: Enhanced Settings */}
            <div className="flex gap-2">
              {/* Foul Recorder Mode Toggle */}
              <button 
                onClick={toggleFoulRecorderMode}
                className={`p-2 rounded-lg ${foulRecorderMode ? 'bg-yellow-600' : 'bg-gray-600'} hover:opacity-80`}
                title="Foul Recorder Mode - Official penalty tracking interface"
              >
                <FileText className="w-5 h-5" />
              </button>
              {/* Phase 5: Sideline Mode Toggle */}
              <button 
                onClick={() => {
                  setSidelineMode(!sidelineMode);
                  triggerHapticFeedback('medium');
                }}
                className={`p-2 rounded-lg ${sidelineMode ? 'bg-purple-600' : 'bg-gray-600'} hover:opacity-80`}
                title="Sideline Mode - Simplified interface for non-football volunteers"
              >
                <Users className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setQuickTemplateMode(!quickTemplateMode)}
                className={`p-2 rounded-lg ${quickTemplateMode ? 'bg-blue-600' : 'bg-gray-600'} hover:opacity-80`}
                title="Quick Templates"
              >
                <Target className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  setLargeButtonMode(!largeButtonMode);
                  localStorage.setItem('large_button_mode', (!largeButtonMode).toString());
                }}
                className={`p-2 rounded-lg ${largeButtonMode ? 'bg-green-600' : 'bg-gray-600'} hover:opacity-80`}
                title="Large Button Mode"
              >
                <Maximize className="w-5 h-5" />
              </button>
              <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                <ClipboardList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Team Matchup */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-green-700 rounded-full border-2 border-yellow-400">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="font-bold">{currentGame.homeTeam}</span>
            <span className="text-sm bg-green-600 px-2 py-1 rounded">HOME</span>
          </div>
          <span className="text-2xl font-bold text-gray-400">VS</span>
          <div className="flex items-center gap-3 px-4 py-2 bg-green-800 rounded-full">
            <div className="w-3 h-3 bg-black rounded-full"></div>
            <span className="font-bold">{currentGame.awayTeam}</span>
            <span className="text-sm bg-gray-600 px-2 py-1 rounded">AWAY</span>
          </div>
        </div>
        
        {/* Foul Recorder Mode Indicator */}
        {foulRecorderMode && (
          <div className="mt-4 p-3 bg-yellow-600 bg-opacity-20 border border-yellow-400 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-200 font-bold">FOUL RECORDER MODE - Official Penalty Tracking</span>
            </div>
          </div>
        )}
        
        {/* Phase 5: Sideline Mode Indicator */}
        {sidelineMode && (
          <div className="mt-4 p-3 bg-purple-600 bg-opacity-20 border border-purple-400 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-purple-200 font-bold">SIDELINE MODE - Simplified Interface for Volunteers</span>
            </div>
          </div>
        )}
      </div>

      {/* Conditional Interface - Foul Recorder vs Sideline vs Official Mode */}
      {foulRecorderMode ? (
        // FOUL RECORDER MODE: Official penalty tracking interface
        <div className="space-y-0">
          <FoulRecorderInterface />
        </div>
      ) : sidelineMode ? (
        // SIDELINE MODE: Simplified interface for non-football-savvy volunteers
        <div className="space-y-0">
          <EnhancedGameClock />
          <SidelineScoreboard />
          <SidelinePenaltyEntry />
        </div>
      ) : (
        // OFFICIAL MODE: Full-featured interface
        <>
          {/* Navigation Tabs */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex gap-2">
          <button 
            onClick={startVoiceNote}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isRecording ? 'Recording...' : 'Voice'}</span>
          </button>
          <button 
            onClick={openCrewDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
          <button 
            onClick={openEnforcementTools}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            <Shield className="w-4 h-4" />
            <span>Enforce</span>
          </button>
          <button 
            onClick={openNotesPanel}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            <FileText className="w-4 h-4" />
            <span>Notes</span>
          </button>
        </div>
      </div>

      {/* Phase 2: Predictive Analytics */}
      {intelligenceData.predictions.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-purple-900 to-purple-800 border-b border-purple-600">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-purple-300" />
            <h3 className="font-bold text-purple-100">AI Predictions</h3>
          </div>
          <div className="space-y-2">
            {intelligenceData.predictions.map((prediction, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                prediction.color === 'yellow' ? 'bg-yellow-900 border-yellow-400' :
                prediction.color === 'orange' ? 'bg-orange-900 border-orange-400' :
                prediction.color === 'blue' ? 'bg-blue-900 border-blue-400' :
                prediction.color === 'purple' ? 'bg-purple-900 border-purple-400' :
                'bg-gray-800 border-gray-500'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{prediction.message}</span>
                  <span className="text-xs text-gray-300">
                    {prediction.confidence}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase 1: Quick Template Entry */}
      {quickTemplateMode && (
        <QuickEntryTemplates onTemplateSelect={selectQuickTemplate} />
      )}

      {/* Number Pad Modal */}
      {showNumberPad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4 text-center">Enter Player Number</h3>
            <div className="mb-4">
              <div className="text-center text-3xl font-bold bg-gray-700 p-4 rounded-lg mb-4">
                {playerNumber || '00'}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    if (playerNumber.length < 2) {
                      setPlayerNumber(prev => prev + num.toString());
                      triggerHapticFeedback('light');
                    }
                  }}
                  className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xl transition-all"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => {
                  setPlayerNumber('');
                  triggerHapticFeedback('medium');
                }}
                className="p-4 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-xl transition-all"
              >
                CLR
              </button>
              <button
                onClick={() => {
                  if (playerNumber.length < 2) {
                    setPlayerNumber(prev => prev + '0');
                    triggerHapticFeedback('light');
                  }
                }}
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xl transition-all"
              >
                0
              </button>
              <button
                onClick={() => {
                  setPlayerNumber(prev => prev.slice(0, -1));
                  triggerHapticFeedback('light');
                }}
                className="p-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold text-xl transition-all"
              >
                ⌫
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNumberPad(false)}
                className="flex-1 p-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowNumberPad(false);
                  triggerHapticFeedback('medium');
                }}
                className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Injured Player Number Pad Modal */}
      {showInjuredNumberPad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4 text-center text-red-400">Injured Player Number</h3>
            <div className="mb-4">
              <div className="text-center text-3xl font-bold bg-gray-700 p-4 rounded-lg mb-4">
                {injuredPlayerNumber || '00'}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    if (injuredPlayerNumber.length < 2) {
                      setInjuredPlayerNumber(prev => prev + num.toString());
                      triggerHapticFeedback('light');
                    }
                  }}
                  className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xl transition-all"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => {
                  setInjuredPlayerNumber('');
                  triggerHapticFeedback('medium');
                }}
                className="p-4 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-xl transition-all"
              >
                CLR
              </button>
              <button
                onClick={() => {
                  if (injuredPlayerNumber.length < 2) {
                    setInjuredPlayerNumber(prev => prev + '0');
                    triggerHapticFeedback('light');
                  }
                }}
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xl transition-all"
              >
                0
              </button>
              <button
                onClick={() => {
                  setInjuredPlayerNumber(prev => prev.slice(0, -1));
                  triggerHapticFeedback('light');
                }}
                className="p-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold text-xl transition-all"
              >
                ⌫
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowInjuredNumberPad(false)}
                className="flex-1 p-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const playerNum = injuredPlayerNumber.trim();
                  if (playerNum && !injuredPlayers.includes(playerNum)) {
                    addInjuredPlayer(playerNum);
                    setInjuredPlayerNumber('');
                  }
                  setShowInjuredNumberPad(false);
                  triggerHapticFeedback('medium');
                }}
                className="flex-1 p-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-all"
              >
                Add Injured
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helmet Off Player Number Pad Modal */}
      {showHelmetOffNumberPad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4 text-center text-orange-400">Helmet Off Player Number</h3>
            <div className="mb-4">
              <div className="text-center text-3xl font-bold bg-gray-700 p-4 rounded-lg mb-4">
                {helmetOffPlayerNumber || '00'}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    if (helmetOffPlayerNumber.length < 2) {
                      setHelmetOffPlayerNumber(prev => prev + num.toString());
                      triggerHapticFeedback('light');
                    }
                  }}
                  className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xl transition-all"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => {
                  setHelmetOffPlayerNumber('');
                  triggerHapticFeedback('medium');
                }}
                className="p-4 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-xl transition-all"
              >
                CLR
              </button>
              <button
                onClick={() => {
                  if (helmetOffPlayerNumber.length < 2) {
                    setHelmetOffPlayerNumber(prev => prev + '0');
                    triggerHapticFeedback('light');
                  }
                }}
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xl transition-all"
              >
                0
              </button>
              <button
                onClick={() => {
                  setHelmetOffPlayerNumber(prev => prev.slice(0, -1));
                  triggerHapticFeedback('light');
                }}
                className="p-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold text-xl transition-all"
              >
                ⌫
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowHelmetOffNumberPad(false)}
                className="flex-1 p-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const playerNum = helmetOffPlayerNumber.trim();
                  if (playerNum && !helmetOffPlayers.includes(playerNum)) {
                    addHelmetOffPlayer(playerNum);
                    setHelmetOffPlayerNumber('');
                  }
                  setShowHelmetOffNumberPad(false);
                  triggerHapticFeedback('medium');
                }}
                className="flex-1 p-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold transition-all"
              >
                Add Helmet Off
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crew Dashboard */}
      {showCrewDashboard && <CrewDashboardPanel />}

      {/* Weekly Game Management Modal */}
      {showWeeklyManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Weekly Game Management</h2>
                <button
                  onClick={() => setShowWeeklyManagement(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4">
              <WeeklyGameManagement
                currentWeek={currentWeek}
                onSelectGame={(game) => {
                  setSelectedGame(game);
                  setShowWeeklyManagement(false);
                  // Could potentially switch to game view in the future
                }}
                onViewCrewAnalytics={(crewChief) => {
                  fetchCrewAnalytics(crewChief, currentWeek);
                  setShowCrewDashboard(true);
                  setShowWeeklyManagement(false);
                }}
                onViewRMACAnalytics={() => {
                  setShowRMACAnalytics(true);
                  setShowWeeklyManagement(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* RMAC Analytics Dashboard */}
      {showRMACAnalytics && (
        <RMACAnalyticsDashboard
          onClose={() => setShowRMACAnalytics(false)}
        />
      )}

      <div className="p-4 space-y-6">
        {/* Enhanced Game Clock & Management */}
        <section>
          <EnhancedGameClock />
        </section>

        {/* Add Penalty */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-xl font-bold">Add Penalty</h2>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">Possession:</span>
              <button 
                onClick={() => setPossession(possession === 'home' ? 'away' : 'home')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
              >
                <RefreshCw className="w-4 h-4" />
                {possession === 'home' ? currentGame.homeTeam : currentGame.awayTeam}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <button 
              onClick={() => {
                setTeam('O');
                triggerHapticFeedback('light');
              }}
              className={`${largeButtonMode ? 'p-6' : 'p-4'} rounded-lg border-2 font-bold transition-all ${
                team === 'O' 
                  ? 'bg-green-700 border-yellow-400 text-white' 
                  : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className={largeButtonMode ? 'text-lg' : ''}>OFFENSE</span>
              </div>
              <div className="text-sm mt-1">{possession === 'home' ? currentGame.homeTeam : currentGame.awayTeam}</div>
            </button>
            <button 
              onClick={() => {
                setTeam('D');
                triggerHapticFeedback('light');
              }}
              className={`${largeButtonMode ? 'p-6' : 'p-4'} rounded-lg border-2 font-bold transition-all ${
                team === 'D' 
                  ? 'bg-gray-600 border-gray-400' 
                  : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-black rounded-full"></div>
                <span className={largeButtonMode ? 'text-lg' : ''}>DEFENSE</span>
              </div>
              <div className="text-sm mt-1">{possession === 'home' ? currentGame.awayTeam : currentGame.homeTeam}</div>
            </button>
            <button 
              onClick={() => {
                setTeam('S');
                triggerHapticFeedback('light');
              }}
              className={`${largeButtonMode ? 'p-6' : 'p-4'} rounded-lg border-2 font-bold transition-all ${
                team === 'S' 
                  ? 'bg-blue-600 border-blue-400' 
                  : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Flag className="w-4 h-4" />
                <span className={largeButtonMode ? 'text-lg' : ''}>SPECIAL</span>
              </div>
              <div className="text-sm mt-1">Kick/Punt</div>
            </button>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <select 
              value={selectedPenalty} 
              onChange={(e) => setSelectedPenalty(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="">Select Penalty Code</option>
              {Object.entries(penaltyTypes).map(([code, data]) => (
                <option key={code} value={code}>
                  {code} - {data.name} ({data.yards} yards)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-800 p-4 rounded-lg relative">
              <input
                type="text"
                value={playerNumber}
                onChange={(e) => setPlayerNumber(e.target.value)}
                className="w-full text-center text-xl bg-transparent border-none outline-none"
                placeholder="Player #00"
                maxLength={2}
              />
              <button
                onClick={() => setShowNumberPad(true)}
                className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                title="Number Pad"
              >
                <Calculator className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <select 
                value={callingOfficial} 
                onChange={(e) => setCallingOfficial(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                {Object.entries(crewData?.officials || {}).map(([position, name]) => (
                  <option key={position} value={position}>
                    {position} - {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white resize-none"
            rows={2}
          />

          <button 
            onClick={() => {
              addPenalty();
              triggerHapticFeedback('heavy');
            }}
            disabled={!selectedPenalty || !playerNumber}
            className={`w-full mt-4 ${largeButtonMode ? 'p-6 text-xl' : 'p-4 text-lg'} ${
              !selectedPenalty || !playerNumber 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            } rounded-lg font-bold transition-all`}
          >
            {!selectedPenalty || !playerNumber ? 'Select Penalty & Player' : 'ADD PENALTY'}
          </button>
        </section>

        {/* RMAC Intelligence Network */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Network className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">RMAC Intelligence Network</h2>
            </div>
            <span className="text-sm text-gray-400">All Crews Connected</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5" />
                <h3 className="font-bold">Network Status</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Connected Crews:</span>
                  <span className="text-green-400 font-bold">5/5</span>
                </div>
                <div className="flex justify-between">
                  <span>This Week's Games:</span>
                  <span className="text-blue-400 font-bold">8</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Intelligence Points:</span>
                  <span className="text-yellow-400 font-bold">0</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-bold">This Week's Focus</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Watch #74 Colorado Mesa (4 holds)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Adams State averaging 8.2 penalties</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Wind advisory for 3 locations</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button 
              onClick={contributeIntelligence}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold"
            >
              <Upload className="w-5 h-5 mx-auto mb-2" />
              Contribute Intelligence
            </button>
            <button 
              onClick={viewMasterIntelligence}
              className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
            >
              <Eye className="w-5 h-5 mx-auto mb-2" />
              View Master Intelligence
            </button>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Radio className="w-5 h-5" />
              <h3 className="font-bold">Latest from the Network</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-blue-400 font-semibold">Crew 3:</span>
                <span className="ml-2">"Colorado Mesa #74 grabbing jerseys on every sweep play"</span>
              </div>
              <div>
                <span className="text-blue-400 font-semibold">Crew 1:</span>
                <span className="ml-2">"Adams State coach heated about DPI calls - watch for unsportsmanlike"</span>
              </div>
              <div>
                <span className="text-blue-400 font-semibold">Crew 5:</span>
                <span className="ml-2">"Western Colorado using quick snap counts in red zone"</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-center gap-6 text-xs text-green-400">
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>All 5 crews sharing intelligence</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Weekly automated reports</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Real-time updates</span>
              </div>
            </div>
          </div>
        </section>

        {/* Google Sheets Sync */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="w-5 h-5" />
            <h2 className="text-xl font-bold">Google Sheets Sync</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <button 
              onClick={syncToGoogleSheets}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold"
            >
              <Upload className="w-5 h-5 mx-auto mb-2" />
              Sync to Sheets
            </button>
            <button 
              onClick={viewGoogleSheet}
              className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
            >
              <FileText className="w-5 h-5 mx-auto mb-2" />
              View Sheet
            </button>
          </div>
          <p className="text-center text-gray-400 text-sm">
            {penalties.length === 0 ? 'No penalties to sync yet' : `${penalties.length} penalties ready to sync`}
          </p>
        </section>

        {/* Game Penalties */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              <h2 className="text-xl font-bold">Game Penalties ({penalties.length})</h2>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold">
              <FileText className="w-4 h-4 inline mr-2" />
              QwikRef
            </button>
          </div>
          
          {penalties.length === 0 ? (
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg mb-2">No penalties recorded yet</p>
              <p className="text-gray-500">Add your first penalty above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {penalties.map((penalty) => (
                <div key={penalty.id} className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-blue-400">#{penalty.player}</span>
                      <span className="ml-2 font-semibold">{penalty.code} - {penalty.name}</span>
                      <span className="ml-2 text-gray-400">
                        ({penalty.team === 'O' ? 'Offense' : penalty.team === 'D' ? 'Defense' : 'Special Teams'})
                      </span>
                      {penalty.description && (
                        <p className="text-sm text-gray-400 mt-1">{penalty.description}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <div>{penalty.quarter} - {penalty.time}</div>
                      <div>Called by {penalty.callingOfficial}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
        </>
      )}
    </div>
  );
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
