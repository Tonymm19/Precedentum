export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AppUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export interface Judge {
  id: string;
  full_name: string;
  court: string | null;
  court_name: string | null;
  courtroom: string;
  chambers_url: string;
  contact_email: string;
  contact_phone: string;
  holiday_calendar: string | null;
  holiday_calendar_name: string | null;
}

export interface Case {
  id: string;
  internal_case_id: string;
  case_number: string;
  caption: string;
  practice_area: string;
  court: string | null;
  court_name: string | null;
  filing_date: string | null;
  status: 'open' | 'stayed' | 'closed' | 'appeal' | 'other';
  stage: string;
  lead_attorney: string | null;
  lead_attorney_name: string | null;
  confidentiality_level: string;
  legal_hold: boolean;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Deadline {
  id: string;
  case: string;
  case_caption: string | null;
  trigger_type: 'rule' | 'court_order' | 'user';
  trigger_source_type: string;
  trigger_source_id: string | null;
  basis: 'calendar_days' | 'business_days';
  holiday_calendar: string | null;
  holiday_calendar_name: string | null;
  due_at: string;
  timezone: string;
  owner: string | null;
  owner_name: string | null;
  priority: number;
  status: 'open' | 'snoozed' | 'done' | 'missed';
  snooze_until: string | null;
  extension_notes: string;
  outcome: string;
  computation_rationale: string;
  created_by: string | null;
  created_by_name: string | null;
  updated_by: string | null;
  updated_by_name: string | null;
  created_at: string;
  updated_at: string;
  pending_reminders: number;
}

export interface DeadlineUpdatePayload {
  status?: Deadline['status'];
  snooze_until?: string | null;
  extension_notes?: string;
  outcome?: string;
  owner?: string | null;
}

export type ReminderChannel = 'in_app' | 'email' | 'sms' | 'push';

export interface DeadlineReminderCreatePayload {
  deadline: string;
  notify_at: string;
  channel: ReminderChannel;
}

export interface DeadlineReminder {
  id: string;
  deadline: string;
  notify_at: string;
  channel: ReminderChannel;
  sent: boolean;
  sent_at: string | null;
}

export interface NewDeadlineFormPayload {
  case: string;
  trigger_type: Deadline['trigger_type'];
  trigger_source_type: string;
  trigger_source_id: string | null;
  basis: Deadline['basis'];
  holiday_calendar: string | null;
  due_at: string;
  timezone: string;
  owner: string | null;
  priority: number;
  status: Deadline['status'];
  snooze_until: string | null;
  extension_notes: string;
  outcome: string;
  computation_rationale: string;
}

export interface AuditLogEntry {
  id: string;
  actor_user: string | null;
  actor_name: string | null;
  entity_table: string;
  entity_id: string;
  action: 'create' | 'update' | 'delete' | 'compute';
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  created_at: string;
}

export interface Rule {
  id: string;
  source_type: 'FRCP' | 'LocalRule' | 'JudgeProcedure' | 'ECFManual' | 'StandingOrder';
  citation: string;
  jurisdiction: string;
  version: string;
  effective_date: string | null;
  superseded_by: string | null;
  superseded_by_citation: string | null;
  text: string;
  url: string;
  created_at: string;
}
