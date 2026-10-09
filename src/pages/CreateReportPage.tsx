import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ReportForm, ReportFormData } from '../components/reports/ReportForm';
import { reportsService } from '../services/reportsService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ReportType } from '../types';
import { Card } from '../components/common/Card';

export const CreateReportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const reportTypeParam = searchParams.get('type');
  const initialType: ReportType = reportTypeParam === 'found' ? 'found' : 'lost';

  const handleFormSubmit = async (data: ReportFormData) => {
    try {
      const created = await reportsService.createReport({
        report_type: data.report_type,
        item_name: data.item_name,
        category: data.category,
        description: data.description,
        color: data.color,
        campus_location: data.campus_location,
        event_date: data.event_date,
        image_path: data.image_path,
        distinguishing_details: data.distinguishing_details,
        reporter_id: user?.id || null
      });

      showToast(
        `Report for "${created.item_name}" saved successfully!`,
        'success',
        'Report Created'
      );

      navigate(`/reports/${created.id}`);
    } catch (err: any) {
      console.error('Submission error:', err);
      showToast(err.message || 'Failed to submit report', 'error');
      throw err;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Submit a Campus Report
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Whether you lost something precious or helped recover an item, log the details below to enable intelligent campus matching.
        </p>
      </div>

      <Card className="p-6 sm:p-8 border-slate-200/90 shadow-sm">
        <ReportForm
          initialType={initialType}
          onSubmit={handleFormSubmit}
        />
      </Card>
    </div>
  );
};
