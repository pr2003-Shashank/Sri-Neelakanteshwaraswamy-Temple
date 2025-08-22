'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

type Post = {
    _id: string;
    title: string;
    description: string;
    date: string;
    images: string[];
};

export default function PostDetails() {
    const { _id } = useParams<{ _id: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!_id) return;
        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/posts/${_id}`);
                const data = await res.json();
                setPost(data);
            } catch (err) {
                console.error("Error fetching post:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [_id]);

    if (loading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    if (!post) {
        return <div className="text-center py-10">Post not found</div>;
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 text-sm mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
            </button>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-800 text-center">
                {post.title}
            </h1>

            {/* Carousel */}
            {post.images && post.images.length > 0 && (
                <Swiper
                    // enable modules
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={16}
                    autoplay={{ delay: 4000 }}
                    loop
                    // navigation
                    pagination={{ clickable: true }}
                    slidesPerView={1}
                    className="h-64 sm:h-80 md:h-96"
                >
                    {post.images.map((img, idx) => (
                        <SwiperSlide key={idx} className="relative w-full h-full">
                            <div className="relative w-full h-64 sm:h-80 md:h-96">
                                <Image
                                    src={img}
                                    alt="Sri Neelakanteshwaraswamy Temple"
                                    fill
                                    className="object-cover rounded-lg"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

            )}


            {/* Date */}
            <p className="text-gray-500 text-sm text-center">
                {new Date(post.date).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })}
            </p>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {post.description}
            </p>
        </div>
    );
}
