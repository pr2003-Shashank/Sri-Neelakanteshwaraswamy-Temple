"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PostForm from "@/components/PostForm";
import { ArrowLeft } from "lucide-react";

// Post as used in frontend
type Post = {
    _id: string;
    title: string;
    description: string;
    date: string;
    images: string[];
};

export default function EditPostPage() {
    const { _id } = useParams();
    const router = useRouter();
    const [post, setPost] = useState<Post | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            const res = await fetch(`/api/posts/${_id}`);
            const data = await res.json();
            setPost(data);
        };
        fetchPost();
    }, [_id]);

    if (!post) return <p className="p-4">Loading...</p>;

    return (
        <div className="max-w-2xl mx-auto p-4">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 text-sm mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
            </button>
            <h1 className="text-xl md:text-2xl font-semibold mb-2 text-yellow-900">
                Edit Post
            </h1>            
            <PostForm
                initialData={post}
                onSuccess={() => router.push("/dashboard")}
            />
        </div>
    );
}
