import { db, isFirebaseConfigured } from '../config/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { ItemReport, ItemMatch, DashboardStats, ReportFilterOptions, ReportType } from '../types';
import { INITIAL_DEMO_REPORTS } from './seedData';
import { computeAllCandidateMatches, calculateMatchScore } from './matchingEngine';

export interface CreateReportInput {
  report_type: ReportType;
  item_name: string;
  category: string;
  description: string;
  color?: string | null;
  campus_location: string;
  event_date: string;
  image_path?: string | null;
  distinguishing_details?: string | null;
  reporter_id?: string | null;
}

// In-memory / session store for development & demo fallback
let demoReportsCache: ItemReport[] = [...INITIAL_DEMO_REPORTS];
const DEMO_STORAGE_KEY = 'foundit_demo_reports_v1';

if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(DEMO_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        demoReportsCache = parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read demo cache:', err);
  }
}

function persistDemoCache() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoReportsCache));
    } catch (err) {
      console.warn('Could not persist demo cache:', err);
    }
  }
}

export const reportsService = {
  /**
   * Determine if the application is using live Google Firestore or demo mode
   */
  isLiveBackend(): boolean {
    return isFirebaseConfigured() && db !== null;
  },

  /**
   * Reset or re-seed the demo data into Google Firestore or memory
   */
  async seedDemoData(): Promise<ItemReport[]> {
    if (this.isLiveBackend() && db) {
      for (const report of INITIAL_DEMO_REPORTS) {
        const reportDocRef = doc(db, 'item_reports', report.id);
        await setDoc(reportDocRef, report, { merge: true });
      }
      return this.getReports();
    } else {
      demoReportsCache = [...INITIAL_DEMO_REPORTS];
      persistDemoCache();
      return [...demoReportsCache];
    }
  },

  /**
   * Fetch reports with flexible search and filtering
   */
  async getReports(filters: ReportFilterOptions = {}): Promise<ItemReport[]> {
    if (this.isLiveBackend() && db) {
      try {
        const reportsRef = collection(db, 'item_reports');
        let q = query(reportsRef);

        if (filters.status && filters.status !== 'all') {
          q = query(q, where('status', '==', filters.status));
        }

        if (filters.reportType && filters.reportType !== 'all') {
          q = query(q, where('report_type', '==', filters.reportType));
        }

        if (filters.category && filters.category !== 'all') {
          q = query(q, where('category', '==', filters.category));
        }

        if (filters.campusLocation && filters.campusLocation !== 'all') {
          q = query(q, where('campus_location', '==', filters.campusLocation));
        }

        const snapshot = await getDocs(q);
        let results: ItemReport[] = [];
        snapshot.forEach((docSnap) => {
          results.push({ id: docSnap.id, ...docSnap.data() } as ItemReport);
        });

        // Client-side text search filter if provided
        if (filters.searchQuery && filters.searchQuery.trim()) {
          const searchLower = filters.searchQuery.toLowerCase().trim();
          results = results.filter((r) =>
            r.item_name.toLowerCase().includes(searchLower) ||
            r.description.toLowerCase().includes(searchLower) ||
            (r.color && r.color.toLowerCase().includes(searchLower)) ||
            r.campus_location.toLowerCase().includes(searchLower) ||
            (r.distinguishing_details && r.distinguishing_details.toLowerCase().includes(searchLower))
          );
        }

        // Sorting
        if (filters.sortBy === 'oldest') {
          results.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        } else if (filters.sortBy === 'event_date') {
          results.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
        } else {
          results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        return results;
      } catch (err: any) {
        console.error('Firestore query failed, falling back to cache:', err);
        throw new Error(`Google Firestore query failed: ${err.message}`);
      }
    } else {
      // Demo / offline fallback mode
      let results = [...demoReportsCache];

      if (filters.status && filters.status !== 'all') {
        results = results.filter((r) => r.status === filters.status);
      }

      if (filters.reportType && filters.reportType !== 'all') {
        results = results.filter((r) => r.report_type === filters.reportType);
      }

      if (filters.category && filters.category !== 'all') {
        results = results.filter((r) => r.category === filters.category);
      }

      if (filters.campusLocation && filters.campusLocation !== 'all') {
        results = results.filter((r) => r.campus_location === filters.campusLocation);
      }

      if (filters.startDate) {
        results = results.filter((r) => r.event_date >= filters.startDate!);
      }

      if (filters.endDate) {
        results = results.filter((r) => r.event_date <= filters.endDate!);
      }

      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        results = results.filter((r) =>
          r.item_name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (r.color && r.color.toLowerCase().includes(q)) ||
          r.campus_location.toLowerCase().includes(q) ||
          (r.distinguishing_details && r.distinguishing_details.toLowerCase().includes(q))
        );
      }

      if (filters.sortBy === 'oldest') {
        results.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      } else if (filters.sortBy === 'event_date') {
        results.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
      } else {
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      return results;
    }
  },

  /**
   * Retrieve report by ID
   */
  async getReportById(id: string): Promise<ItemReport | null> {
    if (this.isLiveBackend() && db) {
      try {
        const docRef = doc(db, 'item_reports', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as ItemReport;
        }
        return null;
      } catch (err: any) {
        throw new Error(`Error fetching report from Firestore: ${err.message}`);
      }
    } else {
      const report = demoReportsCache.find((r) => r.id === id);
      return report || null;
    }
  },

  /**
   * Create a new report
   */
  async createReport(input: CreateReportInput): Promise<ItemReport> {
    const now = new Date().toISOString();
    const newId = `report-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newReport: ItemReport = {
      id: newId,
      report_type: input.report_type,
      item_name: input.item_name.trim(),
      category: input.category,
      description: input.description.trim(),
      color: input.color ? input.color.trim() : null,
      campus_location: input.campus_location.trim(),
      event_date: input.event_date,
      image_path: input.image_path || null,
      distinguishing_details: input.distinguishing_details ? input.distinguishing_details.trim() : null,
      reporter_id: input.reporter_id || null,
      status: 'active',
      created_at: now,
      updated_at: now
    };

    if (this.isLiveBackend() && db) {
      try {
        const docRef = doc(db, 'item_reports', newId);
        await setDoc(docRef, newReport);
        return newReport;
      } catch (err: any) {
        throw new Error(`Google Firestore error creating report: ${err.message}`);
      }
    } else {
      demoReportsCache.unshift(newReport);
      persistDemoCache();
      return newReport;
    }
  },

  /**
   * Update an owned report
   */
  async updateReport(id: string, updates: Partial<CreateReportInput>, userId?: string): Promise<ItemReport> {
    const existing = await this.getReportById(id);
    if (!existing) {
      throw new Error('Report not found');
    }

    if (existing.reporter_id && userId && existing.reporter_id !== userId) {
      throw new Error('Unauthorized: You can only edit reports that you created.');
    }

    const now = new Date().toISOString();

    if (this.isLiveBackend() && db) {
      try {
        const docRef = doc(db, 'item_reports', id);
        await updateDoc(docRef, {
          ...updates,
          updated_at: now
        });
        const updated = await this.getReportById(id);
        return updated!;
      } catch (err: any) {
        throw new Error(`Failed to update report in Firestore: ${err.message}`);
      }
    } else {
      const index = demoReportsCache.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Report not found');

      const updated = {
        ...demoReportsCache[index],
        ...updates,
        updated_at: now
      } as ItemReport;

      demoReportsCache[index] = updated;
      persistDemoCache();
      return updated;
    }
  },

  /**
   * Mark a report as resolved
   */
  async resolveReport(id: string, userId?: string): Promise<ItemReport> {
    const existing = await this.getReportById(id);
    if (!existing) {
      throw new Error('Report not found');
    }

    if (existing.reporter_id && userId && existing.reporter_id !== userId) {
      throw new Error('Unauthorized: You can only resolve reports that you created.');
    }

    const now = new Date().toISOString();

    if (this.isLiveBackend() && db) {
      try {
        const docRef = doc(db, 'item_reports', id);
        await updateDoc(docRef, { status: 'resolved', updated_at: now });
        return { ...existing, status: 'resolved', updated_at: now };
      } catch (err: any) {
        throw new Error(`Failed to resolve report in Firestore: ${err.message}`);
      }
    } else {
      const index = demoReportsCache.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Report not found');

      demoReportsCache[index] = {
        ...demoReportsCache[index],
        status: 'resolved',
        updated_at: now
      };
      persistDemoCache();
      return demoReportsCache[index];
    }
  },

  /**
   * Delete an owned report
   */
  async deleteReport(id: string, userId?: string): Promise<void> {
    const existing = await this.getReportById(id);
    if (!existing) {
      throw new Error('Report not found');
    }

    if (existing.reporter_id && userId && existing.reporter_id !== userId) {
      throw new Error('Unauthorized: You can only delete reports that you created.');
    }

    if (this.isLiveBackend() && db) {
      try {
        const docRef = doc(db, 'item_reports', id);
        await deleteDoc(docRef);
      } catch (err: any) {
        throw new Error(`Failed to delete report from Firestore: ${err.message}`);
      }
    } else {
      demoReportsCache = demoReportsCache.filter((r) => r.id !== id);
      persistDemoCache();
    }
  },

  /**
   * Get dynamic dashboard statistics calculated from actual records
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const all = await this.getReports();
    const active = all.filter((r) => r.status === 'active');
    const lost = active.filter((r) => r.report_type === 'lost').length;
    const found = active.filter((r) => r.report_type === 'found').length;
    const resolved = all.filter((r) => r.status === 'resolved').length;

    const matches = await this.getMatches(40);

    return {
      totalActiveReports: active.length,
      totalLostReports: lost,
      totalFoundReports: found,
      totalPossibleMatches: matches.length,
      resolvedReportsCount: resolved
    };
  },

  /**
   * Compute and fetch candidate matches across active reports
   */
  async getMatches(minScore: number = 30): Promise<ItemMatch[]> {
    const allReports = await this.getReports();
    return computeAllCandidateMatches(allReports, minScore);
  },

  /**
   * Compute matches specifically for one given report
   */
  async getMatchesForReport(reportId: string, minScore: number = 25): Promise<ItemMatch[]> {
    const targetReport = await this.getReportById(reportId);
    if (!targetReport || targetReport.status !== 'active') return [];

    const allReports = await this.getReports({ status: 'active' });
    const opposingType: ReportType = targetReport.report_type === 'lost' ? 'found' : 'lost';
    const candidates = allReports.filter((r) => r.report_type === opposingType);

    const matches: ItemMatch[] = [];

    for (const candidate of candidates) {
      const lost = targetReport.report_type === 'lost' ? targetReport : candidate;
      const found = targetReport.report_type === 'found' ? targetReport : candidate;

      const { score, explanation } = calculateMatchScore(lost, found);

      if (score >= minScore) {
        matches.push({
          id: `match-${lost.id.slice(0, 8)}-${found.id.slice(0, 8)}`,
          lost_report_id: lost.id,
          found_report_id: found.id,
          score,
          explanation,
          matching_method: 'rule-based',
          status: 'suggested',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          lost_report: lost,
          found_report: found
        });
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }
};
