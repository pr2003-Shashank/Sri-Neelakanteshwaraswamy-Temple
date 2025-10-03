"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";
import ConfirmModal from "@/components/ConfirmModal";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import ImageUploader from "@/components/ui/image-uploader";

// Post as stored in MongoDB
type RawPost = {
  _id: string;
  title: string;
  description: string;
  date: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

// Post as used in frontend
type Post = {
  _id: string;
  title: string;
  description: string;
  date: string;
  imageUrls: string[];
};

// Gallery types
type GalleryImage = {
  _id: string;
  url: string;
  title?: string;
  createdAt?: string;
};

function optimizeCloudinary(url?: string, width = 800) {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (!u.hostname.includes("res.cloudinary.com")) return url;
    const parts = u.pathname.split("/upload/");
    if (parts.length !== 2) return url;
    const transform = `f_auto,q_auto,w_${width}`;
    u.pathname = `${parts[0]}/upload/${transform}/${parts[1]}`;
    return u.toString();
  } catch {
    return url;
  }
}

export default function DashboardPage() {
  const router = useRouter();

  //post states
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => { });

  // gallery states
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      if (!res.ok) throw new Error(`GET /api/posts failed ${res.status}`);
      const json = await res.json();

      const raw: RawPost[] = Array.isArray(json) ? json : json.posts ?? [];
      const normalized: Post[] = raw.map((p) => {
        const urls: string[] = Array.isArray(p.images) ? p.images : [];

        return {
          _id: String(p._id),
          title: p.title ?? "",
          description: p.description ?? "",
          date: p.date ?? "",
          imageUrls: urls.map((u) => optimizeCloudinary(u, 800)),
        };
      });

      setPosts(normalized);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else if (typeof e === "string") {
        setError(e);
      } else {
        setError("Failed to fetch posts");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGallery = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const res = await fetch("/api/gallery", { cache: "no-store" });
      if (!res.ok) throw new Error(`GET /api/gallery failed ${res.status}`);
      const json = await res.json();
      const raw: any[] = Array.isArray(json.images) ? json.images : [];

      const normalized: GalleryImage[] = raw.map((img) => ({
        _id: String(img._id),
        url: optimizeCloudinary(img.url, 800),
        title: img.title ?? "",
        createdAt: img.createdAt ?? "",
      }));

      setGallery(normalized);
    } catch (err) {
      console.error("Failed to load gallery:", err);
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      router.push("/login");
      return;
    }
    loadPosts();
    loadGallery();
  }, [router, loadPosts, loadGallery]);

  // DELETE with confirm
  const handleDelete = (_id: string) => {
    setConfirmAction(() => async () => {
      try {
        const res = await fetch("/api/posts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id }),
        });
        if (!res.ok) throw new Error("Failed to delete post");
        await loadPosts();
      } catch (err) {
        console.error(err);
        alert("Error deleting post");
      } finally {
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  // Handle Gallery Upload
  const handleGalleryUpload = async (fileList: FileList) => {
    if (!fileList || fileList.length === 0) return;

    const formData = new FormData();
    Array.from(fileList).forEach((f) => formData.append("images", f));

    try {
      setUploading(true);
      const res = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload gallery images");
      await loadGallery();
    } catch (err) {
      console.error("Gallery upload error:", err);
      alert("Error uploading images to gallery");
    }
    finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold mb-2 text-yellow-900">
        Admin Dashboard
      </h1>

      {/* Manage posts */}
      <div className="flex flex-col bg-yellow-50 m-1">
        <div className="flex items-center justify-between p-2">
          <h1 className="text-base md:text-xl text-yellow-900">
            Manage Posts
          </h1>
          <Button
            onClick={() => router.push("/dashboard/posts/new")}
            className="bg-yellow-900 text-yellow-200 text-sm px-4 py-2 rounded-lg shadow hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Create Post
          </Button>
        </div>

        {/* States */}
        {loading && <p className="m-6 text-yellow-900">Loading posts…</p>}
        {error && <p className="m-6 text-yellow-900">Error: {error}</p>}
        {!loading && !error && posts.length === 0 && (
          <p className="m-6 text-yellow-900">No posts yet.</p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div key={post._id} className="relative bg-gradient-to-b from-yellow-100 to-yellow-200 p-4 rounded-lg shadow-md">
              <PostCard
                title={post.title}
                description={post.description}
                date={post.date}
                imageUrl={post.imageUrls[0]}
              />
              <div className="flex flex-row gap-2 justify-center pb-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/posts/${post._id}/edit`)}
                  className="text-sm bg-yellow-600 text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(post._id)}
                  className="text-sm bg-yellow-800 text-white rounded-lg hover:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Confirm (delete) */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAction}
        message="Are you sure you want to delete this post?"
      />
      {/* Manage Gallery */}
      <div className="flex flex-col bg-yellow-50 m-1">
        <div className="flex items-center justify-between p-2">
          <h1 className="text-base md:text-xl text-yellow-900">
            Manage Gallery
          </h1>
          <ImageUploader onFilesSelected={handleGalleryUpload} loading={uploading} />
        </div>
        {galleryLoading && (
          <p className="m-6 text-yellow-900">Loading gallery…</p>
        )}

        {!galleryLoading && gallery.length === 0 && (
          <p className="m-6 text-yellow-900">No gallery images yet.</p>
        )}

        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((img) => (
            <div
              key={img._id}
              className="bg-gradient-to-b from-yellow-100 to-yellow-200 p-2 rounded-lg shadow"
            >
              {/* use optimized cloudinary */}
              <div className="relative w-full h-56">
                <Image
                  src={img.url}
                  alt={img.title || ''}
                  className="object-cover"
                  fill
                  unoptimized
                  priority={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div >
  );
}
