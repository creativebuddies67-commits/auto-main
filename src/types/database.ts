// Type definitions matching the database schema

export interface DealerGroup {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Rooftop {
  id: string;
  dealer_group_id: string;
  name: string;
  brands: string[];
  website_url: string;
  timezone: string;
  questionnaire_status: 'draft' | 'completed';
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface RooftopDocument {
  id: string;
  rooftop_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: string | null;
}

export interface QuestionnaireAnswer {
  id: string;
  rooftop_id: string;
  question_id: string;
  answer: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebsiteExtraction {
  id: string;
  rooftop_id: string;
  service_address: string | null;
  weekday_hours: string | null;
  saturday_hours: string | null;
  extracted_at: string;
  extracted_by: string | null;
}

export interface Rulebook {
  id: string;
  rooftop_id: string;
  content: string;
  status: 'draft' | 'signed_off' | 'pushed';
  signed_off_at: string | null;
  signed_off_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RulebookEdit {
  id: string;
  rulebook_id: string;
  user_id: string;
  content_snapshot: string;
  edit_note: string | null;
  created_at: string;
}

export interface RetellAgent {
  id: string;
  rooftop_id: string;
  agent_id: string | null;
  push_status: string | null;
  push_error: string | null;
  pushed_at: string | null;
  pushed_by: string | null;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface RooftopWithDetails extends Rooftop {
  dealer_groups?: DealerGroup;
  rooftop_documents?: RooftopDocument[];
  website_extractions?: WebsiteExtraction;
  rulebooks?: Rulebook;
  retell_agents?: RetellAgent;
}
