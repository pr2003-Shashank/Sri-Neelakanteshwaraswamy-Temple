"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PostForm from "@/components/PostForm";

export default function EditPostPage() {
    const { _id } = useParams();
    const router = useRouter();
    const [post, setPost] = useState<any>(null);

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
            <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
            <PostForm
                initialData={post}
                onSuccess={() => router.push("/dashboard")}
            />
        </div>
    );
}
