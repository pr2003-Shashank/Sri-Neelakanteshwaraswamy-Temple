"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";
import ConfirmModal from "@/components/ConfirmModal";

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => { });

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

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      router.push("/login");
      return;
    }
    loadPosts();
  }, [router, loadPosts]);

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

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-700">
          Admin Dashboard
        </h1>
        <button
          onClick={() => router.push("/dashboard/posts/new")}
          className="bg-yellow-700 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          + Create Post
        </button>
      </div>

      {/* States */}
      {loading && <p className="mt-6 text-gray-600">Loading posts…</p>}
      {error && <p className="mt-6 text-red-600">Error: {error}</p>}
      {!loading && !error && posts.length === 0 && (
        <p className="mt-6 text-gray-600">No posts yet. Create the first one!</p>
      )}

      {/* Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div key={post._id} className="relative">
            <PostCard
              title={post.title}
              description={post.description}
              date={post.date}
              imageUrl={post.imageUrls[0]}
            />
            <div className="flex gap-2 justify-center pb-4">
              <button
                onClick={() => router.push(`/dashboard/posts/${post._id}/edit`)}
                className="px-3 py-1 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(post._id)}
                className="px-3 py-1 text-sm bg-yellow-800 text-white rounded-lg hover:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm (delete) */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAction}
        message="Are you sure you want to delete this post?"
      />
    </div>
  );
}
