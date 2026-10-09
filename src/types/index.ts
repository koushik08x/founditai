export type ReportType = 'lost' | 'found';
export type ReportStatus = 'active' | 'resolved';
export type MatchStatus = 'suggested' | 'dismissed' | 'resolved';
export type MatchingMethod = 'rule-based' | 'ai-enhanced';

export interface Profile {
  id: string;
  display_name: string | null;
  email?: string;
  created_at: string;
}

export interface ItemReport {
  id: string;
  reporter_id: string | null;
  report_type: ReportType;
  item_name: string;
  category: string;
  description: string;
  color: string | null;
  campus_location: string;
  event_date: string; // YYYY-MM-DD
  image_path: string | null;
  distinguishing_details: string | null;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}

export interface MatchBreakdown {
  nameAndCategoryScore: number; // 30% weight
  descriptionScore: number;     // 25% weight
  colorScore: number;           // 15% weight
  locationScore: number;        // 20% weight
  dateScore: number;            // 10% weight
}

export interface MatchExplanation {
  breakdown: MatchBreakdown;
  sharedAttributes: string[];
  conflictingAttributes: string[];
  uncertainAttributes: string[];
  summary: string;
  confidenceTier: 'High Probability' | 'Moderate Probability' | 'Low / Plausible' | 'Unlikely';
}

export interface ItemMatch {
  id: string;
  lost_report_id: string;
  found_report_id: string;
  score: number; // 0 - 100
  explanation: MatchExplanation;
  matching_method: MatchingMethod;
  status: MatchStatus;
  created_at: string;
  updated_at: string;
  // Joined relation fields for UI convenience
  lost_report?: ItemReport;
  found_report?: ItemReport;
}

export interface DashboardStats {
  totalActiveReports: number;
  totalLostReports: number;
  totalFoundReports: number;
  totalPossibleMatches: number;
  resolvedReportsCount: number;
}

export interface ReportFilterOptions {
  searchQuery?: string;
  reportType?: ReportType | 'all';
  category?: string | 'all';
  campusLocation?: string | 'all';
  status?: ReportStatus | 'all';
  startDate?: string;
  endDate?: string;
  sortBy?: 'newest' | 'oldest' | 'event_date';
}

export const ITEM_CATEGORIES = [
  'Electronics & Gadgets',
  'Wallets, Purses & Bags',
  'IDs, Cards & Documents',
  'Keys & Keychains',
  'Water Bottles & Tumblers',
  'Books & Stationery',
  'Clothing & Apparel',
  'Eyewear & Accessories',
  'Jewelry & Watches',
  'Sports Equipment',
  'Other'
] as const;

export type ItemCategory = typeof ITEM_CATEGORIES[number];

export const CAMPUS_LOCATIONS = [
  'Main Library',
  'Science Quad & Labs',
  'Student Activity Center',
  'Campus Cafeteria & Food Court',
  'Engineering Hall',
  'North Lecture Theatres',
  'University Sports Arena',
  'East Residential Hall',
  'West Residential Hall',
  'Administration & Registrar Building',
  'Campus Green / Central Lawn',
  'Bus Transit Terminal'
] as const;

export type CampusLocation = typeof CAMPUS_LOCATIONS[number];
