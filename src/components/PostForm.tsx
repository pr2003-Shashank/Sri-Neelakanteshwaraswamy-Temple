"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2 bg-yellow-50 w-full">
      {/* Title */}
      <div className="grid w-full items-center gap-3">
        <Label htmlFor="title">Title</Label>
        <Textarea
          id="title"
          required
          rows={2}
          placeholder="Title"
          className="bg-white w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="grid w-full items-center gap-3">
        <Label htmlFor="title">Description</Label>
        <Textarea
          id="description"
          required
          rows={6}
          placeholder="Description"
          value={description}
          className="bg-white w-full"
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Date */}
      <div className="grid w-full items-center gap-3">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          required
          value={date}
          placeholder="dd/mm/yyyy"
          className="bg-white w-full"
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

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
      <div className="grid w-full items-center gap-3">
        <Label htmlFor="date">Add Photos</Label>
        <Input
          id="files"
          type="file"
          multiple
          accept="image/*"
          capture={undefined}
          required
          className="bg-white w-full"
          onChange={(e) => handleAddImages(e.target.files)}
        />
      </div>

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
      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-yellow-900 text-white hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          {isEdit ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
