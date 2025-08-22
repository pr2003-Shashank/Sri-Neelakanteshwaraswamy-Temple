"use client";

import { useState, useMemo } from "react";

type PostFormProps = {
  initialData?: {
    _id?: string;
    title: string;
    description: string;
    date: string;
    images: string[];
  };
  onSuccess: () => void;
};

export default function PostForm({ initialData, onSuccess }: PostFormProps) {
  const isEdit = useMemo(() => Boolean(initialData?._id), [initialData?._id]);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [date, setDate] = useState(initialData?.date || "");
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);

  // Add more images
  const handleAddImages = (files: FileList | null) => {
    if (!files) return;
    setImages((prev) => [...prev, ...Array.from(files)]);
  };

  // Remove newly added image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing image (for edit)
  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEdit && initialData?._id) {
        // --- UPDATE (JSON) ---
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("date", date);
        formData.append("existingImages", JSON.stringify(existingImages));
        images.forEach((img) => formData.append("images", img));

        const res = await fetch(`/api/posts/${initialData._id}`, {
          method: "PUT",
          body: formData,
        });
        onSuccess();
        if (!res.ok) throw new Error("Failed to update post");
      } else {
        // --- CREATE (FormData) ---
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("date", date);
        images.forEach((img) => formData.append("images", img));

        const res = await fetch("/api/posts", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to create post");
      }

      alert("Post saved!");
      onSuccess();

    } catch (err) {
      console.error("Error saving post:", err);
      alert("Failed to save post. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <label className="block">
        <span className="text-sm text-gray-700">Title</span>
        <textarea
          required
          rows={2}
          placeholder="Title"
          className="mt-1 w-full border rounded-lg p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      {/* Description */}
      <label className="block">
        <span className="text-sm text-gray-700">Description</span>
        <textarea
          required
          rows={6}
          placeholder="Description"
          className="mt-1 w-full border rounded-lg p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      {/* Date */}
      <label className="block">
        <span className="text-sm text-gray-700">Date</span>
        <input
          type="date"
          required
          className="mt-1 w-full border rounded-lg p-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      {/* Existing images (edit mode) */}
      {isEdit && existingImages.length > 0 && (
        <div>
          <p className="text-sm text-gray-700 mb-2">Existing photos</p>
          <div className="grid grid-cols-3 gap-2">
            {existingImages.map((src, idx) => (
              <div key={idx} className="relative">
                <img
                  src={src}
                  alt="existing"
                  className="h-24 w-full object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(idx)}
                  className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New images */}
      <label className="block">
        <span className="text-sm text-gray-700">Add Photos</span>
        <input
          type="file"
          multiple
          accept="image/*"
          className="mt-1 w-full border rounded-lg p-2"
          onChange={(e) => handleAddImages(e.target.files)}
        />
      </label>

      {images.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {images.map((file, idx) => (
            <div key={idx} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="h-24 w-full object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-yellow-700 text-white hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          {isEdit ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
