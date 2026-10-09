import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { reportsService } from '../services/reportsService';
import { ItemReport, ItemMatch } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { MatchExplanationCard } from '../components/reports/MatchExplanationCard';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Tag,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const ReportDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [report, setReport] = useState<ItemReport | null>(null);
  const [candidateMatches, setCandidateMatches] = useState<ItemMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);

  const isOwner = user && report && report.reporter_id === user.id;

  const loadData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await reportsService.getReportById(id);
      setReport(data);

      if (data && data.status === 'active') {
        const matches = await reportsService.getMatchesForReport(id, 30);
        setCandidateMatches(matches);
      }
    } catch (err: any) {
      console.error('Error fetching report details:', err);
      showToast(err.message || 'Error loading report details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleResolve = async () => {
    if (!report || !id) return;
    try {
      setIsResolving(true);
      await reportsService.resolveReport(id, user?.id);
      showToast('Report marked as resolved successfully!', 'success');
      setResolveModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to resolve report', 'error');
    } finally {
      setIsResolving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <EmptyState
          title="Report Not Found"
          description="The requested campus report may have been deleted or the link is invalid."
          actionText="Back to Browse"
          onAction={() => navigate('/browse')}
        />
      </div>
    );
  }

  const isLost = report.report_type === 'lost';
  const isResolved = report.status === 'resolved';

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      {/* Back button & Action buttons */}
      <div className="flex items-center justify-between">
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse Reports</span>
        </Link>

        {isOwner && !isResolved && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResolveModalOpen(true)}
            className="border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
            leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          >
            Mark as Resolved / Claimed
          </Button>
        )}
      </div>

      {/* Main Report Details Card */}
      <Card className="overflow-hidden border-slate-200/90 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Photo side */}
          <div className="bg-slate-100 min-h-[260px] md:min-h-full flex items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-200/70 overflow-hidden">
            {report.image_path ? (
              <img
                src={report.image_path}
                alt={report.item_name}
                className="w-full h-full object-cover max-h-[380px]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                <Tag className="w-12 h-12 stroke-[1.5] mb-2" />
                <span className="text-xs">No photo provided</span>
              </div>
            )}

            <div className="absolute top-4 left-4">
              <Badge variant={isLost ? 'lost' : 'found'} size="md">
                {isLost ? 'LOST ITEM' : 'FOUND ITEM'}
              </Badge>
            </div>
          </div>

          {/* Details side */}
          <div className="p-6 md:p-8 md:col-span-2 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="default" size="sm">
                  {report.category}
                </Badge>
                {isResolved && (
                  <Badge variant="success" size="md">
                    Resolved / Returned
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                {report.item_name}
              </h1>

              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-6">
                {report.description}
              </p>

              {/* Attributes grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Location:</strong> {report.campus_location}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Event Date:</strong> {report.event_date}
                  </span>
                </div>

                {report.color && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-4 h-4 rounded-full border border-slate-300 bg-slate-200 flex items-center justify-center text-[9px] font-bold">
                      C
                    </span>
                    <span>
                      <strong className="text-slate-800">Color:</strong> {report.color}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Reported:</strong>{' '}
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {report.distinguishing_details && (
                <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs">
                  <strong className="text-blue-900 block mb-0.5">Distinguishing Marks & Details:</strong>
                  <span className="text-slate-700">{report.distinguishing_details}</span>
                </div>
              )}
            </div>

            {/* Reporter privacy guarantee */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  Submitted by {report.reporter_id ? 'Verified Campus User' : 'Anonymous Student'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">ID: {report.id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Candidate Matches Section for THIS Report */}
      <div className="pt-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Possible Matches ({candidateMatches.length})
          </h2>
        </div>

        {isResolved ? (
          <div className="p-4 bg-slate-100 rounded-xl text-xs text-slate-600 text-center">
            This report is marked as resolved and is excluded from active matching.
          </div>
        ) : candidateMatches.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-8 h-8 text-slate-400" />}
            title="No matching reports detected yet"
            description={`Our algorithm regularly scans all opposite (${isLost ? 'found' : 'lost'}) reports. If someone logs a candidate matching this item, it will appear here automatically.`}
          />
        ) : (
          <div className="space-y-4">
            {candidateMatches.map((m) => (
              <MatchExplanationCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </div>

      {/* Resolve Confirmation Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Resolve Report"
        description="Marking an item as resolved indicates it has been safely claimed or reunited."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to resolve <strong>"{report.item_name}"</strong>? It will no longer appear in active candidate searches.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResolveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isResolving}
              onClick={handleResolve}
            >
              Confirm Resolution
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
