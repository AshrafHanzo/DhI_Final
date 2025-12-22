export type UserRole = 'recruiter' | 'manager' | 'owner';

export type JobSource = 'EarlyJob' | 'DHI';
export type JobStatus = 'active' | 'on_hold' | 'closed';

export type CandidateStatus = 'new' | 'screening' | 'interview_ready' | 'selected' | 'joined' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Job {
  id: number;
  company_id: number;
  company_name: string;
  job_title: string;
  job_description: string;
  address: string;
  openings: number;
  type?: string;
  work_mode?: string;
  salary_min?: number;
  salary_max?: number;
  status: string;
  urgency?: string;
  commission?: number;
  tenure?: string;
  shift?: string;
  category?: string;
  experience?: number;
  age_min?: number;
  age_max?: number;
  required_skills?: string;
  preferred_skills?: string;
  nice_to_have?: string;
  languages_required?: string;
  seo_keywords?: string;
  posted_by?: number;
  created_at?: string;
  updated_at?: string;
  
  // Legacy fields
  company?: string;
  title?: string;
  assignedRecruiters?: string[];
}

export interface Candidate {
  id: number;
  full_name: string;
  phone_number: string;
  email_address?: string;
  city?: string;
  gender?: string;
  status: string;
  resume_url?: string;
  job_id?: number;
  
  // Personal details
  fathers_name?: string;
  date_of_birth?: string;
  aadhaar_number?: string;
  street_address?: string;
  area_locality?: string;
  pincode?: string;
  
  // Professional profile fields
  select_languages?: string;
  educational_quality?: string;
  work_experience?: string | number;
  additional_months?: string | number;
  technical_professional_skills?: string;
  preferred_industries_categories?: string;
  preferred_employment_types?: string;
  preferred_work_types?: string;
  
  // Legacy fields for backward compatibility
  name?: string;
  phone?: string;
  position?: string;
  recruiterId?: string;
  jobId?: string;
  createdAt?: string;
  screeningNotes?: string;
  interviewNotes?: string;
  companyFeedback?: string;
  dateOfJoining?: string;
  lockInDays?: number;
  created_at?: string;
  updated_at?: string;
  
  // Legacy fields for compatibility
  name?: string;
  phone?: string;
  email?: string;
  position?: string;
  jobId?: string;
  recruiterId?: string;
  createdAt?: string;
  resumeUrl?: string;
  screeningNotes?: string;
  interviewNotes?: string;
  companyFeedback?: string;
  dateOfJoining?: string;
  lockInDays?: number;
}

export interface Activity {
  id: string;
  candidateId: string;
  userId: string;
  action: string;
  timestamp: string;
  details?: string;
}

export interface Application {
  id: number;
  candidate_id: number;
  job_id: number;
  candidate_name: string;
  job_title: string;
  company: string;
  status: string;
  sourced_by?: string;
  sourced_from?: string;
  assigned_to?: string;
  applied_on?: string;
  comments?: string;
  created_at: string;
  updated_at: string;
  
  // Optional candidate info from JOIN
  candidate_phone?: string;
  candidate_city?: string;
  candidate_gender?: string;
  
  // Optional job info from JOIN
  job_location?: string;
  job_salary?: string;
  
  // Workflow status fields
  screening_status?: string;
  interview_status?: string;
  interview_date?: string;
  joined_status?: string;
  joining_date?: string;
}
