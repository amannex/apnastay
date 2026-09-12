'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Clock,
  ArrowLeft,
  ArrowRight,
  Tag,
  Loader2,
  Eye
} from 'lucide-react';
import type { PropertyPhoto, PhotoCategory, UploadPhotoPayload } from '../../types';
import { uploadPropertyPhoto } from '../../api';

export const PHOTO_CATEGORIES: { id: PhotoCategory; label: string }[] = [
  { id: 'exterior', label: 'Exterior' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'bathroom', label: 'Bathroom' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'living_room', label: 'Living Room' },
  { id: 'room', label: 'Room' },
  { id: 'common_area', label: 'Common Area' },
  { id: 'parking', label: 'Parking' },
  { id: 'other', label: 'Other' }
];

export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif'
];

/**
 * Safely resolve photo URLs in local development if pointing to production CMS uploads.
 */
export function getSafeImageUrl(url?: string): string {
  if (!url) return '';
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    if (url.includes('cms.apnastay.in/wp-content/uploads')) {
      return url.replace('https://cms.apnastay.in/wp-content/uploads', 'http://localhost:8888/wp-content/uploads');
    }
  }
  return url;
}

/**
 * Ensures that strictly one photo is marked as the primary cover photo.
 */
export function ensureSingleCover(list: PropertyPhoto[]): PropertyPhoto[] {
  if (!list || list.length === 0) return [];
  const coverIdx = list.findIndex((p) => Boolean(p.isCover));
  const targetIdx = coverIdx >= 0 ? coverIdx : 0;
  return list.map((p, idx) => ({
    ...p,
    isCover: idx === targetIdx,
    order: typeof p.order === 'number' ? p.order : idx
  }));
}

interface UploadQueueItem {
  clientId: string;
  file: File;
  previewUrl: string;
  status: 'uploading' | 'uploaded' | 'failed';
  error?: string;
  progress: number;
}

export interface StepPhotosProps {
  propertyId: string;
  initialPhotos?: PropertyPhoto[];
  onBack: (currentPhotos: PropertyPhoto[]) => void;
  onSave: (photos: PropertyPhoto[]) => Promise<void> | void;
  isSaving?: boolean;
}

export default function StepPhotos({
  propertyId,
  initialPhotos = [],
  onBack,
  onSave,
  isSaving = false
}: StepPhotosProps) {
  // Main photos list — strictly one cover photo
  const [photos, setPhotos] = useState<PropertyPhoto[]>(() => {
    return ensureSingleCover(initialPhotos);
  });

  // Upload queue for tracking in-flight and failed uploads
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Drag and drop reordering state
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Full-screen Preview Modal
  const [previewPhoto, setPreviewPhoto] = useState<PropertyPhoto | null>(null);

  // Hidden file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // Clean up object URLs on component unmount
  useEffect(() => {
    const urls = blobUrlsRef.current;
    return () => {
      urls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      });
      urls.clear();
    };
  }, []);

  const revokeBlobUrl = (url?: string) => {
    if (url && url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
      blobUrlsRef.current.delete(url);
    }
  };

  // Keep photos synchronized with initialPhotos if refreshed
  useEffect(() => {
    if (initialPhotos && initialPhotos.length > 0 && photos.length === 0) {
      setPhotos(ensureSingleCover(initialPhotos));
    }
  }, [initialPhotos, photos.length]);

  // --------------------------------------------------------------------------
  // File Validation
  // --------------------------------------------------------------------------
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const mime = file.type.toLowerCase();
    const validMimes = SUPPORTED_MIME_TYPES;
    const validExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];

    const matchesMime = validMimes.includes(mime);
    const matchesExt = validExts.includes(ext);

    if (!matchesMime && !matchesExt) {
      return {
        valid: false,
        error: `"${file.name}" is not a supported format. Please upload JPG, PNG, WebP, GIF, or HEIC images.`
      };
    }

    if (file.size <= 0) {
      return {
        valid: false,
        error: `"${file.name}" is empty or corrupted (0 bytes).`
      };
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      return {
        valid: false,
        error: `"${file.name}" exceeds the 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller image.`
      };
    }

    return { valid: true };
  };

  // --------------------------------------------------------------------------
  // Upload Processing
  // --------------------------------------------------------------------------
  const processUpload = async (file: File, clientId: string) => {
    // Generate data URL for offline instant preview & persistence
    let dataUrl = '';
    try {
      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      });
    } catch {
      dataUrl = URL.createObjectURL(file);
    }

    // Call API (WordPress REST or propertyBackend simulation)
    const payload: UploadPhotoPayload = {
      file,
      dataUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'image/jpeg',
      isCover: photos.length === 0 // default first to cover
    };

    const res = await uploadPropertyPhoto(propertyId, payload);

    if (res.success && res.data) {
      const uploaded = res.data;

      // Update photos state
      setPhotos((prev) => {
        const next = [...prev];
        // If this photo was set as cover, unset other covers
        if (uploaded.isCover) {
          next.forEach((p) => {
            p.isCover = false;
          });
        }
        // Check if cover needs to be assigned
        if (next.length === 0) {
          uploaded.isCover = true;
        }
        uploaded.order = next.length;
        next.push(uploaded);
        return next;
      });

      // Remove from upload queue and revoke preview blob
      setUploadQueue((prev) => {
        const item = prev.find((i) => i.clientId === clientId);
        revokeBlobUrl(item?.previewUrl);
        return prev.filter((i) => i.clientId !== clientId);
      });
    } else {
      // Mark as failed in queue
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.clientId === clientId
            ? { ...item, status: 'failed', error: res.error || 'Upload failed. Please retry.' }
            : item
        )
      );
    }
  };

  // Handle selected files (from input or dropzone)
  const handleFiles = (files: FileList | File[]) => {
    setValidationError(null);
    const fileArray = Array.from(files);

    if (fileArray.length === 0) return;

    const validFiles: { file: File; clientId: string; previewUrl: string }[] = [];
    const errors: string[] = [];

    fileArray.forEach((file) => {
      const check = validateFile(file);
      if (!check.valid) {
        errors.push(check.error || `Invalid file "${file.name}"`);
      } else {
        const clientId = `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const previewUrl = URL.createObjectURL(file);
        blobUrlsRef.current.add(previewUrl);
        validFiles.push({ file, clientId, previewUrl });
      }
    });

    if (errors.length > 0) {
      setValidationError(errors.join(' '));
    }

    if (validFiles.length === 0) return;

    // Add valid files to queue
    const queueItems: UploadQueueItem[] = validFiles.map(({ file, clientId, previewUrl }) => ({
      clientId,
      file,
      previewUrl,
      status: 'uploading',
      progress: 50
    }));

    setUploadQueue((prev) => [...prev, ...queueItems]);

    // Kick off uploads
    validFiles.forEach(({ file, clientId }) => {
      processUpload(file, clientId);
    });
  };

  // Retry a failed upload item
  const handleRetryUpload = (item: UploadQueueItem) => {
    setUploadQueue((prev) =>
      prev.map((q) => (q.clientId === item.clientId ? { ...q, status: 'uploading', error: undefined } : q))
    );
    processUpload(item.file, item.clientId);
  };

  // Remove a failed item from the upload queue
  const handleDismissFailedQueue = (clientId: string) => {
    setUploadQueue((prev) => {
      const item = prev.find((i) => i.clientId === clientId);
      revokeBlobUrl(item?.previewUrl);
      return prev.filter((i) => i.clientId !== clientId);
    });
  };

  // --------------------------------------------------------------------------
  // Drag & Drop File Handlers
  // --------------------------------------------------------------------------
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // --------------------------------------------------------------------------
  // Photo Operations: Cover, Delete, Category, Reorder
  // --------------------------------------------------------------------------
  const handleSetCover = (photoId: string | number) => {
    setPhotos((prev) => {
      const next = prev.map((p) => ({
        ...p,
        isCover: String(p.id) === String(photoId)
      }));
      return ensureSingleCover(next);
    });
    if (previewPhoto) {
      setPreviewPhoto((prev) =>
        prev ? { ...prev, isCover: String(prev.id) === String(photoId) } : null
      );
    }
  };

  const handleDeletePhoto = (photoId: string | number) => {
    setPhotos((prev) => {
      const remaining = prev.filter((p) => String(p.id) !== String(photoId));
      return ensureSingleCover(remaining);
    });

    if (previewPhoto && String(previewPhoto.id) === String(photoId)) {
      setPreviewPhoto(null);
    }
  };

  const handleCategoryChange = (photoId: string | number, category: PhotoCategory | '') => {
    const catValue = category === '' ? undefined : category;
    setPhotos((prev) =>
      prev.map((p) => (String(p.id) === String(photoId) ? { ...p, category: catValue } : p))
    );
    if (previewPhoto && String(previewPhoto.id) === String(photoId)) {
      setPreviewPhoto((prev) => (prev ? { ...prev, category: catValue } : null));
    }
  };

  // Accessible / Touch-friendly Shift Reordering
  const handleMovePhoto = (currentIndex: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    setPhotos((prev) => {
      const next = [...prev];
      const temp = next[currentIndex];
      next[currentIndex] = next[targetIndex];
      next[targetIndex] = temp;
      next.forEach((p, idx) => {
        p.order = idx;
      });
      return next;
    });
  };

  // HTML5 Drag and Drop Reordering
  const handlePhotoDragStart = (index: number) => {
    setDraggedPhotoIndex(index);
  };

  const handlePhotoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedPhotoIndex === null || draggedPhotoIndex === index) return;
    setDragOverIndex(index);
  };

  const handlePhotoDrop = (targetIndex: number) => {
    if (draggedPhotoIndex === null || draggedPhotoIndex === targetIndex) {
      setDraggedPhotoIndex(null);
      setDragOverIndex(null);
      return;
    }

    setPhotos((prev) => {
      const next = [...prev];
      const [moved] = next.splice(draggedPhotoIndex, 1);
      next.splice(targetIndex, 0, moved);
      next.forEach((p, idx) => {
        p.order = idx;
      });
      return next;
    });

    setDraggedPhotoIndex(null);
    setDragOverIndex(null);
  };

  // --------------------------------------------------------------------------
  // Save & Navigation
  // --------------------------------------------------------------------------
  const handleContinue = async () => {
    await onSave(photos);
  };

  const isUploadingActive = uploadQueue.some((item) => item.status === 'uploading');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER SECTION (EXACT SPECIFICATION) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
            5
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Phase 5 — Media Management
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
          Add photos
        </h2>
        <p className="text-sm sm:text-base text-[#86868B] leading-relaxed">
          Good photos help tenants understand your property better.
        </p>
      </div>

      {/* VALIDATION OR GLOBAL ERROR ALERT */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start justify-between gap-3 animate-shake">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Upload Error</p>
              <p className="mt-0.5">{validationError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="text-rose-500 hover:text-rose-700 p-1"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* LARGE UPLOAD AREA / DROPZONE (EXACT SPECIFICATION) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-3xl border-2 border-dashed transition-all p-8 sm:p-14 text-center select-none ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99] shadow-md'
            : 'border-[#D1D1D6] hover:border-[#1D1D1F] bg-[#FAFAFA] hover:bg-white shadow-apple-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = ''; // Reset input so same file can be chosen again
          }}
          className="hidden"
          id="property-photo-file-input"
        />

        <div className="max-w-md mx-auto space-y-4">
          {/* CAMERA ICON */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-white border border-[#EDEDED] shadow-apple-sm flex items-center justify-center text-[#1D1D1F] transition-transform hover:scale-105">
            <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-[#1D1D1F]" strokeWidth={1.8} />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-extrabold text-[#1D1D1F] tracking-tight">
              Add property photos
            </h3>
            <p className="text-xs sm:text-sm text-[#86868B]">
              Drag and drop high-quality images here, or tap below to browse
            </p>
          </div>

          {/* CHOOSE PHOTOS BUTTON */}
          <div className="pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Choose photos from device</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-[#86868B] font-medium flex-wrap">
            <span>Supports JPG, PNG, WebP, GIF, HEIC</span>
            <span>•</span>
            <span>Up to 10MB each</span>
            <span>•</span>
            <span>Multiple selection supported</span>
          </div>
        </div>
      </div>

      {/* ACTIVE UPLOAD QUEUE & PROGRESS */}
      {uploadQueue.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-[#EDEDED] shadow-apple-sm space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1D1D1F] flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Processing {uploadQueue.length} photo{uploadQueue.length > 1 ? 's' : ''}...</span>
            </span>
            <span className="text-[#86868B]">Do not close this page</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {uploadQueue.map((item) => (
              <div
                key={item.clientId}
                className={`p-3 rounded-2xl border flex items-center gap-3 ${
                  item.status === 'failed'
                    ? 'border-rose-200 bg-rose-50/50'
                    : 'border-[#EDEDED] bg-[#FAFAFA]'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-[#EDEDED]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1D1D1F] truncate">{item.file.name}</p>
                  <p className="text-[11px] text-[#86868B]">
                    {(item.file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>

                  {item.status === 'uploading' && (
                    <div className="mt-1.5 w-full bg-[#EDEDED] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-2/3 animate-pulse rounded-full" />
                    </div>
                  )}

                  {item.status === 'failed' && (
                    <p className="text-[11px] font-medium text-rose-600 truncate mt-0.5">
                      {item.error || 'Upload failed'}
                    </p>
                  )}
                </div>

                {item.status === 'failed' && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleRetryUpload(item)}
                      className="p-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1"
                      title="Retry upload"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Retry</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDismissFailedQueue(item.clientId)}
                      className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F]"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHOTO GALLERY SECTION (EXACT SPECIFICATION) */}
      {photos.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm space-y-6">
          {/* GALLERY HEADER & STATS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EDEDED] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight">Photos</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-xs font-bold">
                  {photos.length} photo{photos.length > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-[#86868B] mt-0.5">Drag to reorder</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#86868B]">
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full font-semibold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                <span>Cover photo will be shown first</span>
              </span>
            </div>
          </div>

          {/* THUMBNAILS GRID: [ photo ] [ photo ] ... [ + Add ] */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => {
              const isCover = Boolean(photo.isCover);
              const isBeingDragged = draggedPhotoIndex === index;
              const isTargetDrop = dragOverIndex === index;

              return (
                <div
                  key={String(photo.id)}
                  draggable
                  onDragStart={() => handlePhotoDragStart(index)}
                  onDragOver={(e) => handlePhotoDragOver(e, index)}
                  onDrop={() => handlePhotoDrop(index)}
                  className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 bg-[#FAFAFA] flex flex-col ${
                    isCover
                      ? 'border-amber-400 shadow-apple-md ring-2 ring-amber-400/20'
                      : 'border-[#EDEDED] hover:border-[#1D1D1F]'
                  } ${isBeingDragged ? 'opacity-40 scale-95' : 'opacity-100'} ${
                    isTargetDrop ? 'border-dashed border-emerald-500 bg-emerald-50/20' : ''
                  }`}
                >
                  {/* PHOTO IMAGE THUMBNAIL */}
                  <div
                    onClick={() => setPreviewPhoto(photo)}
                    className="relative aspect-[4/3] w-full bg-[#EDEDED] cursor-pointer overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getSafeImageUrl(photo.thumbnailUrl || photo.url)}
                      alt={photo.fileName || `Property Photo ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = getSafeImageUrl(photo.url);
                        if (fallback && target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                    />

                    {/* HOVER OVERLAY WITH PREVIEW ICON */}
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <div className="p-2 rounded-full bg-black/50 backdrop-blur-md">
                        <Eye className="w-5 h-5" />
                      </div>
                    </div>

                    {/* COVER BADGE */}
                    {isCover && (
                      <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-extrabold shadow-sm">
                        <Star className="w-3 h-3 fill-white" />
                        <span>Cover Photo</span>
                      </div>
                    )}

                    {/* ORDER NUMBER BADGE */}
                    <div className="absolute bottom-2.5 left-2.5 w-6 h-6 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-bold flex items-center justify-center">
                      {index + 1}
                    </div>

                    {/* TOP RIGHT DELETE BUTTON */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo.id);
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:outline-none"
                      title="Delete photo"
                      aria-label={`Delete photo ${index + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* THUMBNAIL FOOTER & ACTIONS */}
                  <div className="p-3 bg-white space-y-2.5 text-xs flex-1 flex flex-col justify-between border-t border-[#EDEDED]">
                    {/* OPTIONAL CATEGORY SELECTOR */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>Category</span>
                      </label>
                      <select
                        value={photo.category || ''}
                        onChange={(e) =>
                          handleCategoryChange(photo.id, e.target.value as PhotoCategory | '')
                        }
                        className="w-full text-xs font-semibold bg-[#F5F5F7] hover:bg-[#EDEDED] border-none rounded-xl py-1.5 px-2 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#1D1D1F] transition-colors"
                      >
                        <option value="">General / None</option>
                        {PHOTO_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ACTIONS ROW: SET COVER + MOVE LEFT/RIGHT */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#F5F5F7]">
                      {!isCover ? (
                        <button
                          type="button"
                          onClick={() => handleSetCover(photo.id)}
                          className="text-[11px] font-bold text-[#86868B] hover:text-amber-600 inline-flex items-center gap-1 transition-colors rounded-lg focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:outline-none"
                          aria-label={`Set photo ${index + 1} as cover photo`}
                        >
                          <Star className="w-3 h-3" />
                          <span>Make Cover</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Primary</span>
                        </span>
                      )}

                      {/* MOBILE & ACCESSIBLE REORDER BUTTONS */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMovePhoto(index, 'left')}
                          className="w-7 h-7 rounded-lg border border-[#EDEDED] hover:bg-[#F5F5F7] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[#1D1D1F] transition-all focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:outline-none"
                          title="Move earlier"
                          aria-label={`Move photo ${index + 1} earlier`}
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === photos.length - 1}
                          onClick={() => handleMovePhoto(index, 'right')}
                          className="w-7 h-7 rounded-lg border border-[#EDEDED] hover:bg-[#F5F5F7] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[#1D1D1F] transition-all focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:outline-none"
                          title="Move later"
                          aria-label={`Move photo ${index + 1} later`}
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* [ + ADD ] CARD IN GALLERY GRID */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer rounded-2xl border-2 border-dashed border-[#D1D1D6] hover:border-[#1D1D1F] bg-[#FAFAFA] hover:bg-white transition-all flex flex-col items-center justify-center p-6 text-center min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#EDEDED] shadow-sm flex items-center justify-center text-[#1D1D1F] group-hover:scale-110 transition-transform mb-3">
                <Plus className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#1D1D1F]">+ Add Photos</p>
              <p className="text-[11px] text-[#86868B] mt-1">Upload more photos</p>
            </div>
          </div>
        </div>
      )}

      {/* FULL PREVIEW LIGHTBOX MODAL */}
      {previewPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full border border-[#EDEDED] shadow-apple-lg flex flex-col max-h-[90vh]"
          >
            {/* MODAL HEADER */}
            <div className="p-4 sm:p-5 border-b border-[#EDEDED] flex items-center justify-between">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#1D1D1F] truncate max-w-sm">
                  {previewPhoto.fileName || 'Property Photo Preview'}
                </h4>
                <div className="flex items-center gap-2 text-xs text-[#86868B] mt-0.5">
                  <span>Photo #{previewPhoto.order + 1}</span>
                  {previewPhoto.category && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{previewPhoto.category.replace('_', ' ')}</span>
                    </>
                  )}
                  {previewPhoto.isCover && (
                    <>
                      <span>•</span>
                      <span className="text-amber-600 font-bold">Cover Photo</span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="w-8 h-8 rounded-full bg-[#F5F5F7] hover:bg-[#EDEDED] flex items-center justify-center text-[#1D1D1F] transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* MODAL IMAGE */}
            <div className="relative bg-black/90 flex-1 flex items-center justify-center p-4 min-h-[300px] max-h-[60vh] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getSafeImageUrl(previewPhoto.url)}
                alt={previewPhoto.fileName || 'Full preview'}
                className="max-h-full max-w-full object-contain rounded-xl shadow-lg"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = getSafeImageUrl(previewPhoto.thumbnailUrl);
                  if (fallback && target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
              />
            </div>

            {/* MODAL FOOTER ACTIONS */}
            <div className="p-4 sm:p-5 bg-white border-t border-[#EDEDED] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs font-semibold text-[#86868B]">Category:</label>
                <select
                  value={previewPhoto.category || ''}
                  onChange={(e) =>
                    handleCategoryChange(previewPhoto.id, e.target.value as PhotoCategory | '')
                  }
                  className="text-xs font-semibold bg-[#F5F5F7] border border-[#EDEDED] rounded-xl py-1.5 px-2.5 text-[#1D1D1F] focus:outline-none"
                >
                  <option value="">General / None</option>
                  {PHOTO_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {!previewPhoto.isCover && (
                  <button
                    type="button"
                    onClick={() => handleSetCover(previewPhoto.id)}
                    className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Set as Cover</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeletePhoto(previewPhoto.id)}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP ACTION NAVIGATION BAR */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDEDED] shadow-apple-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onBack(photos)}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-[#EDEDED] hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Location</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* OPTIONAL SAVE DRAFT BUTTON */}
          <button
            type="button"
            disabled={isSaving || isUploadingActive}
            onClick={handleContinue}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#F5F5F7] hover:bg-[#EDEDED] text-[#1D1D1F] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 transition-all"
          >
            <Clock className="w-4 h-4 text-[#86868B]" />
            <span>Save Draft</span>
          </button>

          {/* MAIN CONTINUE / FINISH BUTTON */}
          <button
            type="button"
            disabled={isSaving || isUploadingActive}
            onClick={handleContinue}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#1D1D1F] hover:bg-black disabled:opacity-50 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Photos...</span>
              </>
            ) : (
              <>
                <span>Save & Complete Phase 5</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
