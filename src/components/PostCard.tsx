"use client";

import Image from "next/image";
import { Calendar } from "lucide-react";

type PostCardProps = {
  title: string;
  description: string;
  date: string;
  imageUrl?: string;
  actions?: React.ReactNode; 
};

export default function PostCard({
  title,
  description,
  date,
  imageUrl,
  actions,
}: PostCardProps) {
  return (
    <div className="bg-white shadow-md rounded-2xl border border-gray-200 w-full max-w-md mx-auto my-2 overflow-hidden p-2">
      {/* Header */}
      <div className="flex justify-between items-center py-3 px-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {actions && <div className="space-x-2">{actions}</div>}
      </div>

      {/* Image */}
      {imageUrl && (
        <div className="relative w-full h-56">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Body */}
      <div className="flex flex-col py-3 space-y-3 px-2">
        <div className="text-gray-700 text-start text-sm line-clamp-3">{description}</div>
        <div className="flex text-sm text-gray-600 space-x-2">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}
