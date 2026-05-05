
export type University = {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
  website: string | null;
  admissions_email: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ApplicationRequirement = {
  id: string;
  university_id: string;
  label: string;
  required: boolean;
  format: string | null;
  notes: string | null;
  created_at: string;
};

export type ApplicationHistory = {
  id: string;
  university_id: string;
  university_name: string;
  program: string;
  student_name: string;
  file_names: string[];
  email_subject: string | null;
  user_id: string | null;
  sent_at: string;
};

export type NewApplicationHistory = Omit<ApplicationHistory, 'id' | 'sent_at'> & {
  sent_at?: string;
};

