import { describe, it, expect } from 'vitest';
import { reportFormSchema } from '../components/reports/ReportForm';
import { storageService } from '../services/storageService';

describe('Report Validation & Constraints', () => {
  it('accepts a valid lost report', () => {
    const validData = {
      report_type: 'lost' as const,
      item_name: 'Silver MacBook Pro 14',
      category: 'Electronics & Gadgets',
      description: 'Left on desk 3B on the 2nd floor of Science Quad.',
      color: 'Silver',
      campus_location: 'Science Quad & Labs',
      event_date: '2026-10-05',
      image_path: null,
      distinguishing_details: 'Sticker with GitHub octocat'
    };

    const result = reportFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects reports with missing required fields or too short description', () => {
    const invalidData = {
      report_type: 'lost' as const,
      item_name: 'Keys',
      category: 'Keys & Keychains',
      description: 'Lost', // less than 10 chars
      campus_location: '',
      event_date: '2026-10-05'
    };

    const result = reportFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.description).toBeDefined();
      expect(fieldErrors.campus_location).toBeDefined();
    }
  });

  it('rejects future event dates', () => {
    const futureDate = '2099-01-01';
    const invalidFutureData = {
      report_type: 'found' as const,
      item_name: 'Found Wallet',
      category: 'Wallets, Purses & Bags',
      description: 'Found black leather wallet with cash.',
      campus_location: 'Student Activity Center',
      event_date: futureDate
    };

    const result = reportFormSchema.safeParse(invalidFutureData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.event_date).toBeDefined();
    }
  });

  it('validates file upload type restrictions and max 5MB size', () => {
    // Valid file
    const validFile = new File(['image bytes'], 'photo.png', { type: 'image/png' });
    const validRes = storageService.validateFile(validFile);
    expect(validRes.valid).toBe(true);

    // Invalid format (e.g. PDF or executable)
    const invalidFile = new File(['text'], 'file.exe', { type: 'application/x-msdownload' });
    const invalidRes = storageService.validateFile(invalidFile);
    expect(invalidRes.valid).toBe(false);
    expect(invalidRes.error).toContain('Unsupported image format');

    // Oversized file (> 5MB)
    const oversizedFile = {
      name: 'huge.jpg',
      type: 'image/jpeg',
      size: 6 * 1024 * 1024 // 6MB
    } as File;
    const oversizedRes = storageService.validateFile(oversizedFile);
    expect(oversizedRes.valid).toBe(false);
    expect(oversizedRes.error).toContain('exceeds 5MB');
  });
});
