import { Judge, Case, Deadline, Rule, Alert } from '../types';

export const judges: Judge[] = [
  {
    id: 'judge-1',
    name: 'Hon. Rebecca R. Pallmeyer',
    district: 'Northern District of Illinois',
    chamber: 'Courtroom 2525',
    preferences: {
      motionDeadline: 21,
      discoveryExtensions: false,
      pageLimit: 25,
      preferredFormat: 'PDF',
      electronicFiling: true,
    },
    standingOrders: ['Motion Practice', 'Discovery Management', 'Case Management'],
    avatar: 'https://images.pexels.com/photos/5668882/pexels-photo-5668882.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  },
  {
    id: 'judge-2',
    name: 'Hon. John Z. Lee',
    district: 'Northern District of Illinois',
    chamber: 'Courtroom 1341',
    preferences: {
      motionDeadline: 28,
      discoveryExtensions: true,
      pageLimit: 30,
      preferredFormat: 'PDF',
      electronicFiling: true,
    },
    standingOrders: ['Electronic Filing', 'Settlement Conferences', 'Pretrial Orders'],
    avatar: 'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  },
  {
    id: 'judge-3',
    name: 'Hon. Andrea R. Wood',
    district: 'Northern District of Illinois',
    chamber: 'Courtroom 1703',
    preferences: {
      motionDeadline: 14,
      discoveryExtensions: false,
      pageLimit: 20,
      preferredFormat: 'PDF',
      electronicFiling: true,
    },
    standingOrders: ['Motion Briefing', 'Status Conferences', 'Discovery Disputes'],
    avatar: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  },
];

export const cases: Case[] = [
  {
    id: 'case-1',
    caseNumber: '1:24-cv-00123',
    title: 'TechCorp Inc. v. DataSystems LLC',
    district: 'Northern District of Illinois',
    judgeId: 'judge-1',
    filingDate: '2024-01-15',
    caseType: 'Intellectual Property',
    status: 'Active',
    upcomingDeadlines: [],
  },
  {
    id: 'case-2',
    caseNumber: '1:24-cv-00456',
    title: 'Smith v. Manufacturing Co.',
    district: 'Northern District of Illinois',
    judgeId: 'judge-2',
    filingDate: '2024-02-03',
    caseType: 'Employment',
    status: 'Active',
    upcomingDeadlines: [],
  },
  {
    id: 'case-3',
    caseNumber: '1:24-cv-00789',
    title: 'Global Finance v. Regional Bank',
    district: 'Northern District of Illinois',
    judgeId: 'judge-3',
    filingDate: '2024-03-10',
    caseType: 'Commercial Litigation',
    status: 'Active',
    upcomingDeadlines: [],
  },
];

export const deadlines: Deadline[] = [
  {
    id: 'deadline-1',
    caseId: 'case-1',
    type: 'Motion Filing',
    description: 'Motion for Summary Judgment Due',
    dueDate: '2025-01-18',
    priority: 'High',
    completed: false,
    alertSent: false,
    confidence: 95,
    source: 'Judge Standing Order',
  },
  {
    id: 'deadline-2',
    caseId: 'case-1',
    type: 'Discovery',
    description: 'Discovery Responses Due',
    dueDate: '2025-01-25',
    priority: 'Medium',
    completed: false,
    alertSent: false,
    confidence: 90,
    source: 'Local Rule',
  },
  {
    id: 'deadline-3',
    caseId: 'case-2',
    type: 'Filing',
    description: 'Response Brief Due',
    dueDate: '2025-01-20',
    priority: 'High',
    completed: false,
    alertSent: false,
    confidence: 98,
    source: 'Federal Rule',
  },
  {
    id: 'deadline-4',
    caseId: 'case-3',
    type: 'Hearing',
    description: 'Status Conference',
    dueDate: '2025-01-22',
    priority: 'Medium',
    completed: false,
    alertSent: false,
    confidence: 100,
    source: 'Court Order',
  },
];

export const rules: Rule[] = [
  {
    id: 'rule-1',
    title: 'Motion Practice Requirements',
    number: 'LR 7.1',
    content: 'All motions must be filed with supporting memorandum not exceeding 25 pages unless otherwise authorized by the Court.',
    category: 'District',
    district: 'Northern District of Illinois',
    lastUpdated: '2024-12-01',
    url: 'https://www.ilnd.uscourts.gov/local-rules',
  },
  {
    id: 'rule-2',
    title: 'Discovery Scheduling',
    number: 'SO-2023-1',
    content: 'Discovery must be completed within 180 days of case filing unless modified by court order.',
    category: 'Judge-Specific',
    district: 'Northern District of Illinois',
    judgeId: 'judge-1',
    lastUpdated: '2024-11-15',
    url: 'https://www.ilnd.uscourts.gov/judges/pallmeyer/standing-orders',
  },
  {
    id: 'rule-3',
    title: 'Summary Judgment Standards',
    number: 'FRCP 56',
    content: 'A party may move for summary judgment, identifying each claim or defense as to which summary judgment is sought.',
    category: 'Federal',
    district: 'Northern District of Illinois',
    lastUpdated: '2024-10-01',
    url: 'https://www.law.cornell.edu/rules/frcp/rule_56',
  },
];

export const alerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'deadline',
    title: 'Urgent Deadline Tomorrow',
    message: 'Motion for Summary Judgment due tomorrow in TechCorp Inc. v. DataSystems LLC',
    priority: 'High',
    timestamp: '2025-01-16T14:30:00Z',
    read: false,
    caseId: 'case-1',
  },
  {
    id: 'alert-2',
    type: 'rule-change',
    title: 'Local Rule Update',
    message: 'Judge Pallmeyer updated motion practice requirements',
    priority: 'Medium',
    timestamp: '2025-01-15T10:15:00Z',
    read: false,
    actionUrl: '/rules/judge-1',
  },
  {
    id: 'alert-3',
    type: 'hearing',
    title: 'Hearing Scheduled',
    message: 'Status conference scheduled for January 22, 2025',
    priority: 'Medium',
    timestamp: '2025-01-14T16:45:00Z',
    read: true,
    caseId: 'case-3',
  },
];

// Update cases with deadlines
cases.forEach(c => {
  const caseDeadlines = deadlines.filter(d => d.caseId === c.id);
  c.upcomingDeadlines = caseDeadlines;
  c.nextDeadline = caseDeadlines.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
});