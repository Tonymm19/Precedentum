export interface Judge {
  id: string;
  name: string;
  district: string;
  chamber: string;
  preferences: JudgePreferences;
  standingOrders: string[];
  avatar?: string;
}

export interface JudgePreferences {
  motionDeadline: number; // days before hearing
  discoveryExtensions: boolean;
  pageLimit: number;
  preferredFormat: string;
  electronicFiling: boolean;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  district: string;
  judgeId: string;
  filingDate: string;
  caseType: string;
  status: 'Active' | 'Closed' | 'Pending';
  nextDeadline?: Deadline;
  upcomingDeadlines: Deadline[];
}

export interface Deadline {
  id: string;
  caseId: string;
  type: string;
  description: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  alertSent: boolean;
  confidence: number;
  source: string;
}

export interface Rule {
  id: string;
  title: string;
  number: string;
  content: string;
  category: 'Federal' | 'District' | 'Judge-Specific';
  district: string;
  judgeId?: string;
  lastUpdated: string;
  url: string;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  relevanceScore: number;
  confidence: 'High' | 'Medium' | 'Low';
  source: string;
  category: string;
  url: string;
}

export interface Alert {
  id: string;
  type: 'deadline' | 'rule-change' | 'hearing' | 'filing';
  title: string;
  message: string;
  priority: 'High' | 'Medium' | 'Low';
  timestamp: string;
  read: boolean;
  caseId?: string;
  actionUrl?: string;
}