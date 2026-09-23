'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  Star,
  Plus,
  X,
  Video,
  Check,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import type { PropertyPhoto } from '../../types';
import { uploadPropertyPhoto } from '../../api';

export interface StepPhotosProps {
  propertyId: string;
  initialPhotos?: PropertyPhoto[];
  initialVideoUrl?: string;
  onBack: (currentPhotos: PropertyPhoto[], videoUrl?: string) => void;
  onSave: (photos: PropertyPhoto[], videoUrl?: string) => Promise<void> | void;
  isSaving?: boolean;
}

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

export default function StepPhotos({
  propertyId,
  initialPhotos = [],
  initialVideoUrl = '',
  onBack,
  onSave,
  isSaving = false
}: StepPhotosProps) {
  const [photos, setPhotos] = useState<PropertyPhoto[]>(() => ensureSingleCover(initialPhotos));
  const [videoUrl, setVideoUrl] = useState<string>(initialVideoUrl);
  const [videoName, setVideoName] = useState<string>('');
  const [isDragOverPhoto, setIsDragOverPhoto] = useState<boolean>(false);
  const [isDragOverVideo, setIsDragOverVideo] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const createdBlobUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urlsToCleanup = createdBlobUrls.current;
    return () => {
      urlsToCleanup.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      });
      urlsToCleanup.clear();
    };
  }, []);

  const handlePhotoFiles = async (files: FileList | File[]) => {
    const validFiles: File[] = [];
    setErrorMsg(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select only image files (JPEG, PNG, WebP).');
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg('Images must be smaller than 15MB.');
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploadingPhoto(true);

    const newPhotosToAdd: PropertyPhoto[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const localUrl = URL.createObjectURL(file);
      createdBlobUrls.current.add(localUrl);

      const isFirst = photos.length === 0 && i === 0;
      const photoItem: PropertyPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        url: localUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        isCover: isFirst,
        order: photos.length + i
      };

      newPhotosToAdd.push(photoItem);

      // Async background server upload
      uploadPropertyPhoto(propertyId, {
        file,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        isCover: isFirst
      }).then((res) => {
        if (res.success && res.data && res.data.url) {
          setPhotos((curr) =>
            curr.map((p) => (p.id === photoItem.id ? { ...p, url: res.data!.url } : p))
          );
        }
      }).catch(() => {
        // Safe offline fallback - local blob remains valid
      });
    }

    setPhotos((prev) => ensureSingleCover([...prev, ...newPhotosToAdd]));
    setIsUploadingPhoto(false);
  };

  const handleSetCover = (id: string | number) => {
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        isCover: String(p.id) === String(id)
      }))
    );
  };

  const handleDeletePhoto = (id: string | number) => {
    setPhotos((prev) => {
      const filtered = prev.filter((p) => String(p.id) !== String(id));
      return ensureSingleCover(filtered);
    });
  };

  const handleVideoFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('video/')) {
      setErrorMsg('Please select a valid video file (MP4, WebM, MOV).');
      return;
    }
    if (file.size > 80 * 1024 * 1024) {
      setErrorMsg('Video must be smaller than 80MB.');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    createdBlobUrls.current.add(localUrl);
    setVideoUrl(localUrl);
    setVideoName(file.name);
  };

  const handleRemoveVideo = () => {
    setVideoUrl('');
    setVideoName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.length === 0) {
      setErrorMsg('Please upload at least 1 photo of your property to continue.');
      return;
    }
    setErrorMsg(null);
    onSave(photos, videoUrl);
  };

  const coverPhoto = photos.find((p) => p.isCover) || photos[0];
  const regularPhotos = photos.filter((p) => String(p.id) !== String(coverPhoto?.id));

  return (
    <form
      id="photos-form"
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto py-2 space-y-8 animate-fade-in"
      noValidate
    >
      {/* SECTION HEADING (Airbnb Style) */}
      <div className="space-y-1">
        <h1 className="font-outfit text-2xl sm:text-[30px] font-semibold text-[#222222] tracking-tight">
          Add some photos of your place
        </h1>
        <p className="font-inter text-sm sm:text-base text-[#717171]">
          You&apos;ll need at least 5 photos to get started. You can add more or make changes later.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-primary flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-primary" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* HIDDEN INPUTS */}
      <input
        ref={photoInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handlePhotoFiles(e.target.files);
          }
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleVideoFile(e.target.files[0]);
          }
        }}
      />

      {/* ==================================================================== */}
      {/* 1. PHOTOS SECTION                                                    */}
      {/* ==================================================================== */}
      {photos.length === 0 ? (
        /* EMPTY STATE: AIRBNB DRAG & DROP HERO */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOverPhoto(true);
          }}
          onDragLeave={() => setIsDragOverPhoto(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOverPhoto(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handlePhotoFiles(e.dataTransfer.files);
            }
          }}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center flex flex-col items-center justify-center transition-all duration-150 ${
            isDragOverPhoto
              ? 'border-[#222222] bg-[#F7F7F7]'
              : 'border-[#DDDDDD] bg-white hover:border-[#222222]'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#F7F7F7] flex items-center justify-center mb-4 text-[#222222]">
            <Camera className="w-8 h-8 stroke-[1.5]" />
          </div>

          <h2 className="font-outfit text-lg sm:text-xl font-semibold text-[#222222] mb-1">
            Drag your photos here
          </h2>
          <p className="font-inter text-xs sm:text-sm text-[#717171] mb-6">
            Choose at least 5 photos (JPEG, PNG, WebP)
          </p>

          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="px-6 py-3 rounded-xl border border-[#222222] font-semibold text-sm sm:text-base text-[#222222] hover:bg-[#F7F7F7] active:scale-[0.98] transition-all inline-flex items-center gap-2"
          >
            {isUploadingPhoto ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload from your device</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* POPULATED PHOTOS STATE */
        <div className="space-y-4">
          {/* PHOTO STATUS BADGE & ADD MORE BUTTON */}
          <div className="flex items-center justify-between">
            <span
              className={`text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 ${
                photos.length >= 5 ? 'text-emerald-700' : 'text-[#717171]'
              }`}
            >
              {photos.length >= 5 ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>{photos.length} photos added</span>
                </>
              ) : (
                <span>
                  {photos.length} of 5 photos added (add {5 - photos.length} more)
                </span>
              )}
            </span>

            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#222222] underline underline-offset-4 hover:text-black"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add more photos</span>
            </button>
          </div>

          {/* 1. COVER PHOTO (HERO CARD) */}
          {coverPhoto && (
            <div className="relative rounded-2xl overflow-hidden border border-[#DDDDDD] bg-[#F7F7F7] aspect-[16/10] sm:aspect-[16/9] group">
              <img
                src={coverPhoto.url}
                alt="Cover photo"
                className="w-full h-full object-cover"
              />

              {/* COVER BADGE */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#222222] shadow-sm">
                Cover photo
              </div>

              {/* DELETE BUTTON */}
              <button
                type="button"
                onClick={() => handleDeletePhoto(coverPhoto.id)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-[#222222] hover:text-primary shadow-sm opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all"
                title="Delete photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 2. SECONDARY PHOTOS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
            {regularPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative rounded-xl overflow-hidden border border-[#DDDDDD] bg-[#F7F7F7] aspect-square group select-none"
              >
                <img
                  src={photo.url}
                  alt="Property"
                  className="w-full h-full object-cover"
                />

                {/* HOVER ACTIONS */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetCover(photo.id)}
                    className="px-2.5 py-1 rounded-full bg-white text-xs font-semibold text-[#222222] hover:bg-[#F7F7F7] shadow-sm flex items-center gap-1"
                    title="Make cover photo"
                  >
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>Make cover</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="p-1.5 rounded-full bg-white text-[#222222] hover:text-primary shadow-sm"
                    title="Delete photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* ADD MORE CARD BUTTON */}
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="rounded-xl border-2 border-dashed border-[#DDDDDD] hover:border-[#222222] bg-white aspect-square flex flex-col items-center justify-center text-[#717171] hover:text-[#222222] transition-colors"
            >
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-xs sm:text-sm font-medium">Add more</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. VIDEO WALKTHROUGH SECTION (OPTIONAL)                              */}
      {/* ==================================================================== */}
      <div className="pt-6 border-t border-[#EBEBEB] space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-inter text-base sm:text-lg font-semibold text-[#222222]">
              Video walkthrough
            </h2>
            <span className="text-xs font-normal text-[#717171] bg-[#F7F7F7] px-2 py-0.5 rounded-md border border-[#EBEBEB]">
              Optional
            </span>
          </div>
          <p className="font-inter text-xs sm:text-sm text-[#717171] mt-0.5">
            Add a short video walkthrough so tenants can take a virtual tour of your place.
          </p>
        </div>

        {videoUrl ? (
          /* VIDEO PREVIEW */
          <div className="rounded-2xl overflow-hidden border border-[#DDDDDD] bg-black/5 p-3 space-y-3">
            <video
              src={videoUrl}
              controls
              className="w-full max-h-[300px] rounded-xl object-contain bg-black"
            />
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-[#717171] truncate max-w-[260px]">
                {videoName || 'video_walkthrough.mp4'}
              </span>
              <button
                type="button"
                onClick={handleRemoveVideo}
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove video</span>
              </button>
            </div>
          </div>
        ) : (
          /* VIDEO DROPZONE */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOverVideo(true);
            }}
            onDragLeave={() => setIsDragOverVideo(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverVideo(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleVideoFile(e.dataTransfer.files[0]);
              }
            }}
            className={`border border-dashed rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center justify-center transition-all ${
              isDragOverVideo
                ? 'border-[#222222] bg-[#F7F7F7]'
                : 'border-[#DDDDDD] bg-white hover:border-[#222222]'
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-[#F7F7F7] flex items-center justify-center mb-2.5 text-[#222222]">
              <Video className="w-5 h-5 stroke-[1.5]" />
            </div>

            <h3 className="font-inter text-sm font-semibold text-[#222222] mb-0.5">
              Upload a video tour
            </h3>
            <p className="font-inter text-xs text-[#717171] mb-4">
              MP4, WebM or MOV up to 80MB
            </p>

            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="px-4 py-2 rounded-xl border border-[#DDDDDD] hover:border-[#222222] text-xs sm:text-sm font-semibold text-[#222222] bg-white hover:bg-[#F7F7F7] transition-all"
            >
              Browse video
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
