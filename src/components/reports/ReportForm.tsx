import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ReportType, ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '../../types';
import { Button } from '../common/Button';
import { storageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Upload, X, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';

// Form validation schema using Zod
export const reportFormSchema = z.object({
  report_type: z.enum(['lost', 'found'], {
    required_error: 'Please select whether this item is lost or found'
  }),
  item_name: z
    .string()
    .min(3, 'Item name must be at least 3 characters')
    .max(80, 'Item name cannot exceed 80 characters'),
  category: z.string().min(1, 'Please select a category'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  color: z.string().optional().nullable(),
  campus_location: z.string().min(1, 'Please select a campus location'),
  event_date: z.string().refine((val) => {
    if (!val) return false;
    const selected = new Date(val);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return selected <= today;
  }, 'Event date cannot be in the future'),
  image_path: z.string().optional().nullable(),
  distinguishing_details: z.string().max(500, 'Details cannot exceed 500 characters').optional().nullable()
});

export type ReportFormData = z.infer<typeof reportFormSchema>;

export interface ReportFormProps {
  initialType?: ReportType;
  initialData?: Partial<ReportFormData>;
  onSubmit: (data: ReportFormData) => Promise<void>;
  submitButtonText?: string;
  isEditing?: boolean;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  initialType = 'lost',
  initialData,
  onSubmit,
  submitButtonText,
  isEditing = false
}) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_path || null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      report_type: initialType,
      item_name: initialData?.item_name || '',
      category: initialData?.category || '',
      description: initialData?.description || '',
      color: initialData?.color || '',
      campus_location: initialData?.campus_location || '',
      event_date: initialData?.event_date || new Date().toISOString().split('T')[0],
      image_path: initialData?.image_path || null,
      distinguishing_details: initialData?.distinguishing_details || ''
    }
  });

  const currentReportType = watch('report_type');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = storageService.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setValue('image_path', null);
  };

  const onFormSubmit = async (data: ReportFormData) => {
    if (isSubmitting) return; // Prevent duplicate submissions

    try {
      setIsSubmitting(true);
      let finalImagePath = data.image_path || null;

      // Upload image if a new file was chosen
      if (imageFile) {
        try {
          const uploadResult = await storageService.uploadItemPhoto(imageFile);
          finalImagePath = uploadResult.url;
        } catch (uploadErr: any) {
          showToast(`Image upload failed: ${uploadErr.message}. Submitting report without new image.`, 'warning');
        }
      }

      await onSubmit({
        ...data,
        image_path: finalImagePath
      });

      // Reset form only after confirmed success
      if (!isEditing) {
        reset({
          report_type: currentReportType,
          item_name: '',
          category: '',
          description: '',
          color: '',
          campus_location: '',
          event_date: new Date().toISOString().split('T')[0],
          image_path: null,
          distinguishing_details: ''
        });
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (err: any) {
      console.error('Error submitting report:', err);
      showToast(err.message || 'Failed to save report. Please check fields and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* 1. Report Type Selector */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
          Report Type <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue('report_type', 'lost')}
            className={`p-3.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              currentReportType === 'lost'
                ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs ring-2 ring-amber-400/20'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>I Lost an Item</span>
          </button>

          <button
            type="button"
            onClick={() => setValue('report_type', 'found')}
            className={`p-3.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              currentReportType === 'found'
                ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>I Found an Item</span>
          </button>
        </div>
        {errors.report_type && (
          <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.report_type.message}</span>
          </p>
        )}
      </div>

      {/* 2. Item Name & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Item Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Hydro Flask, ThinkPad X1, Student ID Card"
            {...register('item_name')}
            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          {errors.item_name && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.item_name.message}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('category')}
            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Select a category...</option>
            {ITEM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.category.message}</span>
            </p>
          )}
        </div>
      </div>

      {/* 3. Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Description <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={3}
          placeholder="Describe the item, what it looks like, where you last had or saw it..."
          {...register('description')}
          className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-y"
        />
        {errors.description && (
          <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.description.message}</span>
          </p>
        )}
      </div>

      {/* 4. Color, Location & Event Date */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Primary Color
          </label>
          <input
            type="text"
            placeholder="e.g. Black, Navy Blue, Silver"
            {...register('color')}
            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Campus Location <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('campus_location')}
            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Select campus location...</option>
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          {errors.campus_location && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.campus_location.message}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Date {currentReportType === 'lost' ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            max={new Date().toISOString().split('T')[0]}
            {...register('event_date')}
            className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          {errors.event_date && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.event_date.message}</span>
            </p>
          )}
        </div>
      </div>

      {/* 5. Distinguishing Details (Optional) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Distinguishing Details (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Stickers, engravings, scratches, lock screen photo, brand serial hint"
          {...register('distinguishing_details')}
          className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          These details are used by the matching engine to correlate potential matches.
        </p>
      </div>

      {/* 6. Photo Upload (Optional) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Item Photo (Optional, Max 5MB)
        </label>

        {imagePreview ? (
          <div className="relative inline-block rounded-xl overflow-hidden border border-slate-200">
            <img
              src={imagePreview}
              alt="Item preview"
              className="w-48 h-32 object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors cursor-pointer"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
            <Upload className="w-6 h-6 text-slate-400 mb-2" />
            <span className="text-xs font-semibold text-slate-700">
              Click to browse or drag image here
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              JPG, PNG, WEBP, or GIF up to 5MB
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}

        {uploadError && (
          <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{uploadError}</span>
          </p>
        )}
      </div>

      {/* Privacy note */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-500">
        🛡️ <strong>Student Privacy:</strong> Your personal contact details are never exposed to the public. Prospective claimers verify shared attributes before retrieving items.
      </div>

      {/* Submit Button */}
      <div className="pt-3">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          {submitButtonText || (currentReportType === 'lost' ? 'Submit Lost Item Report' : 'Submit Found Item Report')}
        </Button>
      </div>
    </form>
  );
};
