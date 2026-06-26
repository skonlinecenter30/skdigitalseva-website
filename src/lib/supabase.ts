import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ServiceType =
  | 'gram_thana'
  | 'asti_11b'
  | 'asti_94c'
  | 'na_property'
  | 'rehabilitation'
  | 'ec_only';

export type AppStatus =
  | 'submitted'
  | 'documents_pending'
  | 'under_review'
  | 'processing'
  | 'completed'
  | 'rejected';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  language: 'en' | 'kn';
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  application_number: string;
  user_id: string;
  service_type: ServiceType;
  status: AppStatus;
  applicant_name: string;
  applicant_phone: string;
  applicant_email: string | null;
  whatsapp_number: string | null;
  district: string | null;
  taluk: string | null;
  gram_panchayat: string | null;
  village_name: string | null;
  survey_number: string | null;
  property_number: string | null;
  khata_number: string | null;
  remarks: string | null;
  admin_notes: string | null;
  payment_amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface Enquiry {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  service_type: string | null;
  message: string;
  status: 'new' | 'contacted' | 'resolved';
  created_at: string;
}

export interface Review {
  id: string;
  full_name: string;
  location: string | null;
  service_type: string | null;
  rating: number;
  review_text: string;
  is_approved: boolean;
  created_at: string;
}

// ---- Service catalogue ----
export const SERVICE_INFO: Record<ServiceType, {
  labelKn: string;
  labelEn: string;
  emoji: string;
  fee: number;
  feeLabel: string;
  docsKn: string[];
  docsEn: string[];
  notesKn: string[];
}> = {
  gram_thana: {
    labelKn: 'ಗ್ರಾಮ ಠಾಣಾ ಆಸ್ತಿ (EC ಸಹಿತ)',
    labelEn: 'Gram Thana Asti (EC Included)',
    emoji: '🏠',
    fee: 1800,
    feeLabel: '₹1800',
    docsKn: ['ಆಧಾರ್ ಕಾರ್ಡ್', 'ಆಸ್ತಿ ಫೋಟೋ', 'ಗ್ರಾಮ ಪಂಚಾಯತ್ ಆಸ್ತಿ ಘೋಷಣಾ ಪ್ರಮಾಣ ಪತ್ರ', 'ವಿದ್ಯುತ್ ಬಿಲ್'],
    docsEn: ['Aadhaar Card', 'Property Photo', 'Gram Panchayat Property Declaration Certificate', 'Electricity Bill'],
    notesKn: ['ಕಟ್ಟಡ ಇದ್ದರೆ ವಿದ್ಯುತ್ ಬಿಲ್ ಕಡ್ಡಾಯ', 'ಖಾಲಿ ನಿವೇಶನ ಇದ್ದರೆ ವಿದ್ಯುತ್ ಬಿಲ್ ಅಗತ್ಯವಿಲ್ಲ', 'GPS ಆಸ್ತಿ ಫೋಟೋ ಕಡ್ಡಾಯ'],
  },
  asti_11b: {
    labelKn: '11B ಆಸ್ತಿ (EC ಸಹಿತ)',
    labelEn: '11B Asti (EC Included)',
    emoji: '🏡',
    fee: 1000,
    feeLabel: '₹1000',
    docsKn: ['ಗ್ರಾಮ ಪಂಚಾಯತ್ ಆಸ್ತಿ ಘೋಷಣಾ ಪ್ರಮಾಣ ಪತ್ರ', 'ಆಧಾರ್ ಕಾರ್ಡ್', 'RTC', 'ಆಸ್ತಿ ಫೋಟೋ', 'ವಿದ್ಯುತ್ ಬಿಲ್', 'Sanction Order'],
    docsEn: ['Gram Panchayat Property Declaration Certificate', 'Aadhaar Card', 'RTC', 'Property Photo', 'Electricity Bill', 'Sanction Order'],
    notesKn: ['ಕಟ್ಟಡ ಇದ್ದರೆ ವಿದ್ಯುತ್ ಬಿಲ್ ಕಡ್ಡಾಯ', 'ಖಾಲಿ ನಿವೇಶನ ಇದ್ದರೆ ವಿದ್ಯುತ್ ಬಿಲ್ ಅಗತ್ಯವಿಲ್ಲ', 'GPS ಆಸ್ತಿ ಫೋಟೋ ಕಡ್ಡಾಯ'],
  },
  asti_94c: {
    labelKn: '94C ಆಸ್ತಿ (EC ಸಹಿತ)',
    labelEn: '94C Asti (EC Included)',
    emoji: '🏡',
    fee: 1000,
    feeLabel: '₹1000',
    docsKn: ['ಹಕ್ಕು ಪತ್ರ (ಕಡ್ಡಾಯ)', 'ಆಧಾರ್ ಕಾರ್ಡ್', 'ಆಸ್ತಿ ಫೋಟೋ'],
    docsEn: ['Hakku Patra (Compulsory)', 'Aadhaar Card', 'Property Photo'],
    notesKn: ['ಕಟ್ಟಡ ಇದ್ದರೆ ವಿದ್ಯುತ್ ಬಿಲ್ ಕಡ್ಡಾಯ', 'ಖಾಲಿ ನಿವೇಶನ ಇದ್ದರೆ ವಿದ್ಯುತ್ ಬಿಲ್ ಅಗತ್ಯವಿಲ್ಲ', 'GPS ಆಸ್ತಿ ಫೋಟೋ ಕಡ್ಡಾಯ'],
  },
  na_property: {
    labelKn: 'NA ಆಸ್ತಿ (EC ಸಹಿತ)',
    labelEn: 'NA Property (EC Included)',
    emoji: '🏡',
    fee: 1000,
    feeLabel: '₹1000',
    docsKn: ['NA Order', 'DC ನೀಡಿದ Final NA Order', 'Site Map', 'Site Photo', 'ಸರ್ವೆ ಸಂಖ್ಯೆ'],
    docsEn: ['NA Order', 'Final NA Order Issued by DC', 'Site Map', 'Site Photo', 'Survey Number'],
    notesKn: ['ಕಟ್ಟಡ ಇದ್ದರೆ ವಿದ್ಯುತ್ ಬಿಲ್ ಕಡ್ಡಾಯ', 'ಖಾಲಿ ನಿವೇಶನ ಇದ್ದರೆ ವಿದ್ಯುತ್ ಬಿಲ್ ಅಗತ್ಯವಿಲ್ಲ', 'GPS ಆಸ್ತಿ ಫೋಟೋ ಕಡ್ಡಾಯ'],
  },
  rehabilitation: {
    labelKn: 'Rehabilitation ಆಸ್ತಿ (EC ಸಹಿತ)',
    labelEn: 'Rehabilitation Asti (EC Included)',
    emoji: '🏡',
    fee: 1000,
    feeLabel: '₹1000',
    docsKn: ['ಹಕ್ಕು ಪತ್ರ', 'Site Map', 'Site Photo'],
    docsEn: ['Hakku Patra', 'Site Map', 'Site Photo'],
    notesKn: ['ಕಟ್ಟಡ ಇದ್ದರೆ ವಿದ್ಯುತ್ ಬಿಲ್ ಕಡ್ಡಾಯ', 'ಖಾಲಿ ನಿವೇಶನ ಇದ್ದರೆ ವಿದ್ಯುತ್ ಬಿಲ್ ಅಗತ್ಯವಿಲ್ಲ', 'GPS ಆಸ್ತಿ ಫೋಟೋ ಕಡ್ಡಾಯ'],
  },
  ec_only: {
    labelKn: 'EC ಪ್ರಮಾಣ ಪತ್ರ ಮಾತ್ರ',
    labelEn: 'EC Certificate Only',
    emoji: '📄',
    fee: 600,
    feeLabel: '₹600',
    docsKn: ['ಆಧಾರ್ ಕಾರ್ಡ್', 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ', 'ಸರ್ವೆ ಸಂಖ್ಯೆ', 'ಆಸ್ತಿ ಸಂಖ್ಯೆ'],
    docsEn: ['Aadhaar Card', 'Mobile Number', 'Survey Number', 'Property Number'],
    notesKn: ['EC Certificate ಮಾತ್ರ ಸೇವಾ ಶುಲ್ಕ ₹600'],
  },
};

export const STATUS_META: Record<AppStatus, { labelKn: string; labelEn: string; badge: string; step: number }> = {
  submitted:         { labelKn: 'ಅರ್ಜಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ',  labelEn: 'Submitted',          badge: 'badge-submitted',    step: 1 },
  documents_pending: { labelKn: 'ದಾಖಲೆಗಳು ಬಾಕಿ ಇದೆ',    labelEn: 'Documents Pending',   badge: 'badge-docs-pending', step: 2 },
  under_review:      { labelKn: 'ಪರಿಶೀಲನೆ ನಡೆಯುತ್ತಿದೆ',  labelEn: 'Under Verification',  badge: 'badge-under-review', step: 3 },
  processing:        { labelKn: 'ಪ್ರಕ್ರಿಯೆ ನಡೆಯುತ್ತಿದೆ',  labelEn: 'Processing',          badge: 'badge-processing',   step: 4 },
  completed:         { labelKn: 'ಪೂರ್ಣಗೊಂಡಿದೆ',          labelEn: 'Completed',           badge: 'badge-completed',    step: 5 },
  rejected:          { labelKn: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',        labelEn: 'Rejected',            badge: 'badge-rejected',     step: 0 },
};

export const DISTRICTS_KA = [
  'Bagalkot','Ballari','Belagavi','Bengaluru Rural','Bengaluru Urban',
  'Bidar','Chamarajanagara','Chikkaballapura','Chikkamagaluru','Chitradurga',
  'Dakshina Kannada','Davanagere','Dharwad','Gadag','Hassan',
  'Haveri','Kalaburagi','Kodagu','Kolar','Koppal',
  'Mandya','Mysuru','Raichur','Ramanagara','Shivamogga',
  'Tumakuru','Udupi','Uttara Kannada','Vijayapura','Yadgir',
];
