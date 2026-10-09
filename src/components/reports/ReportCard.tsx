import React from 'react';
import { Link } from 'react-router-dom';
import { ItemReport } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { MapPin, Calendar, ArrowRight, Tag, Palette } from 'lucide-react';

export const ReportCard: React.FC<{ report: ItemReport }> = ({ report }) => {
  const isLost = report.report_type === 'lost';
  const isResolved = report.status === 'resolved';

  return (
    <Card hoverable className="flex flex-col h-full overflow-hidden border-slate-200/90 group">
      {/* Top Banner & Image */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
        {report.image_path ? (
          <img
            src={report.image_path}
            alt={report.item_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              // Fallback to placeholder if image URL fails to load
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
            <Tag className="w-10 h-10 stroke-[1.5]" />
          </div>
        )}

        {/* Badges on image overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <Badge variant={isLost ? 'lost' : 'found'} size="md">
            {isLost ? 'LOST' : 'FOUND'}
          </Badge>
          {isResolved && (
            <Badge variant="success" size="md">
              Resolved
            </Badge>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <Badge variant="default" size="sm" className="bg-white/90 backdrop-blur-xs text-slate-700 shadow-xs">
            {report.category}
          </Badge>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1.5">
            {report.item_name}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {report.description}
          </p>

          {/* Metadata chips */}
          <div className="space-y-1.5 text-xs text-slate-500 mb-4">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{report.campus_location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{report.event_date}</span>
            </div>
            {report.color && (
              <div className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Color: {report.color}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Reported {new Date(report.created_at).toLocaleDateString()}
          </span>
          <Link
            to={`/reports/${report.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
