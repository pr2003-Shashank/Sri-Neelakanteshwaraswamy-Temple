"use client";

import PostForm from "@/components/PostForm";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NewPostPage() {
    const router = useRouter();
    return (
        <div className="max-w-3xl mx-auto p-4">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 text-sm mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
            </button>
            <h1 className="text-xl md:text-2xl font-semibold mb-2 text-yellow-900">
                Create New Post
            </h1>
            <PostForm
                onSuccess={() => router.push("/dashboard")}
            />
        </div>
    );
}
