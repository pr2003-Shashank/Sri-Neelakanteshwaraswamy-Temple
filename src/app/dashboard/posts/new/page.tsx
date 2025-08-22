"use client";

import PostForm from "@/components/PostForm";
import { useRouter } from "next/navigation";


export default function NewPostPage() {
    const router = useRouter();
    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Create Post</h1>
            <PostForm
                onSuccess={() => router.push("/dashboard")}
            />
        </div>
    );
}
