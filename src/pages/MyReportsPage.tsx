import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsService } from '../services/reportsService';
import { ItemReport } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ReportForm, ReportFormData } from '../components/reports/ReportForm';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import {
  FileText,
  Edit2,
  CheckCircle2,
  Trash2,
  MapPin,
  Calendar,
  AlertTriangle,
  Users,
  PlusCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyReportsPage: React.FC = () => {
  const { user, profile, isDemoMode, demoUsers, activeDemoUser, switchDemoUser } = useAuth();
  const { showToast } = useToast();

  const [myReports, setMyReports] = useState<ItemReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [editingReport, setEditingReport] = useState<ItemReport | null>(null);
  const [resolvingReport, setResolvingReport] = useState<ItemReport | null>(null);
  const [deletingReport, setDeletingReport] = useState<ItemReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadMyReports = async () => {
    if (!user) {
      setMyReports([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const allReports = await reportsService.getReports();
      const filtered = allReports.filter((r) => r.reporter_id === user.id);
      setMyReports(filtered);
    } catch (err: any) {
      console.error('Error fetching my reports:', err);
      showToast(err.message || 'Error loading your reports', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyReports();
  }, [user]);

  const handleEditSubmit = async (formData: ReportFormData) => {
    if (!editingReport || !user) return;
    try {
      setIsProcessing(true);
      await reportsService.updateReport(
        editingReport.id,
        {
          item_name: formData.item_name,
          category: formData.category,
          description: formData.description,
          color: formData.color,
          campus_location: formData.campus_location,
          event_date: formData.event_date,
          image_path: formData.image_path,
          distinguishing_details: formData.distinguishing_details
        },
        user.id
      );

      showToast('Report updated successfully!', 'success');
      setEditingReport(null);
      await loadMyReports();
    } catch (err: any) {
      showToast(err.message || 'Failed to update report', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmResolve = async () => {
    if (!resolvingReport || !user) return;
    try {
      setIsProcessing(true);
      await reportsService.resolveReport(resolvingReport.id, user.id);
      showToast('Report marked as resolved!', 'success');
      setResolvingReport(null);
      await loadMyReports();
    } catch (err: any) {
      showToast(err.message || 'Failed to resolve report', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingReport || !user) return;
    try {
      setIsProcessing(true);
      await reportsService.deleteReport(deletingReport.id, user.id);
      showToast('Report deleted successfully', 'info');
      setDeletingReport(null);
      await loadMyReports();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete report', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Campus Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage, edit, or resolve reports created under your identity: <strong className="text-slate-800">{profile?.display_name}</strong>
          </p>
        </div>

        <Link to="/create">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Report
          </Button>
        </Link>
      </div>

      {isDemoMode && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <Users className="w-4 h-4 text-amber-700" />
            <span>Development Demo Mode Persona Switcher</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            Because this session is in demo mode without production Firebase Auth credentials, ownership is tied to demo persona IDs.
            Switch below to test authorization: <strong>Alice cannot edit Bob's reports, and Bob cannot edit Alice's.</strong>
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {demoUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => switchDemoUser(u)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeDemoUser.id === u.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-amber-300 hover:bg-amber-100/60'
                }`}
              >
                {u.display_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : myReports.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-10 h-10 text-slate-400" />}
          title="No reports created yet"
          description={`You currently have no active or resolved reports filed under "${profile?.display_name}".`}
          actionText="File a New Report"
          onAction={() => (window.location.href = '/create')}
        />
      ) : (
        <div className="space-y-4">
          {myReports.map((report) => {
            const isLost = report.report_type === 'lost';
            const isResolved = report.status === 'resolved';

            return (
              <Card key={report.id} className="p-5 border-slate-200/90 shadow-2xs">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={isLost ? 'lost' : 'found'} size="sm">
                        {isLost ? 'LOST' : 'FOUND'}
                      </Badge>
                      <Badge variant={isResolved ? 'success' : 'default'} size="sm">
                        {isResolved ? 'Resolved / Closed' : 'Active'}
                      </Badge>
                      <span className="text-xs text-slate-400 font-medium">{report.category}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{report.item_name}</h3>
                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">{report.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{report.campus_location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{report.event_date}</span>
                      </div>
                      {report.color && (
                        <span>
                          <strong>Color:</strong> {report.color}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <Link to={`/reports/${report.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs">
                        View
                      </Button>
                    </Link>

                    {!isResolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingReport(report)}
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Edit
                      </Button>
                    )}

                    {!isResolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setResolvingReport(report)}
                        className="text-xs border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      >
                        Resolve
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingReport(report)}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {editingReport && (
        <Modal
          isOpen={Boolean(editingReport)}
          onClose={() => setEditingReport(null)}
          title={`Edit Report: ${editingReport.item_name}`}
          maxWidth="lg"
        >
          <ReportForm
            initialType={editingReport.report_type}
            initialData={editingReport}
            isEditing={true}
            onSubmit={handleEditSubmit}
            submitButtonText="Save Changes"
          />
        </Modal>
      )}

      {resolvingReport && (
        <Modal
          isOpen={Boolean(resolvingReport)}
          onClose={() => setResolvingReport(null)}
          title="Resolve Report"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Confirm marking <strong>"{resolvingReport.item_name}"</strong> as resolved? This removes it from active searches and matching recommendations.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setResolvingReport(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isProcessing}
                onClick={handleConfirmResolve}
              >
                Confirm Resolve
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {deletingReport && (
        <Modal
          isOpen={Boolean(deletingReport)}
          onClose={() => setDeletingReport(null)}
          title="Delete Report"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                Are you sure you want to delete <strong>"{deletingReport.item_name}"</strong>? This action cannot be undone.
              </span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeletingReport(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isProcessing}
                onClick={handleConfirmDelete}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
