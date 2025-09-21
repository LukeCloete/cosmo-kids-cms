'use client';

import { X } from 'lucide-react';
import Image from 'next/image';

interface GalleryOverlayProps {
  images: { url: string; alt: string }[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function GalleryOverlay({ images, initialIndex, isOpen, onClose }: GalleryOverlayProps) {
  if (!isOpen || !images.length) {
    return null;
  }

  const currentImage = images[initialIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="relative w-11/12 h-5/6 md:w-4/5 md:h-4/5 lg:w-3/4 lg:h-5/6">
        <Image
          src={currentImage.url}
          alt={currentImage.alt}
          layout="fill"
          objectFit="contain"
          className="rounded-lg"
        />
      </div>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-gray-800 rounded-full p-2"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
}
