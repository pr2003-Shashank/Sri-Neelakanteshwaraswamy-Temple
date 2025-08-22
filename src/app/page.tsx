'use client';

import Link from "next/link";

import { useEffect, useState, useCallback } from "react";
import PostCard from "@/components/PostCard";
import { Carousel } from "flowbite-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      if (!res.ok) throw new Error(`GET /api/posts failed ${res.status}`);
      const json = await res.json();

      const raw: any[] = Array.isArray(json) ? json : json.posts ?? [];
      const normalized: Post[] = raw.map((p: any) => {
        const urls: string[] = Array.isArray(p.imageUrls)
          ? p.imageUrls
          : Array.isArray(p.images)
            ? p.images
            : typeof p.images === "string"
              ? p.images.split(/,\s*/)
              : typeof p.imageUrls === "string"
                ? p.imageUrls.split(/,\s*/)
                : [];

        return {
          _id: String(p._id),
          title: p.title ?? "",
          description: p.description ?? "",
          date: p.date ?? "",
          imageUrls: urls.map((u) => optimizeCloudinary(u, 800)),
        };
      });

      setPosts(normalized);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] md:h-[90vh]">
        <Carousel
          slideInterval={5000}
          className="h-full"
        >
          <div className="relative h-full">
            <img
              src="https://res.cloudinary.com/dnumk8kl0/image/upload/v1755843424/image1_uy2fzg.jpg"
              alt="Sri Neelakanteshwaraswamy Temple"
              className="w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                ಇತಿಹಾಸ ಪ್ರಸಿದ್ಧ
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-6 max-w-2xl">
                ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರಸ್ವಾಮಿ ದೇವಸ್ಥಾನ - ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠ,
                ಶ್ರೀ ಕ್ಷೇತ್ರ ಗುರುಪುರ
              </p>
              <a
                href="#posts"
                className="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg"
              >
                View Posts
              </a>
            </div>
          </div>
        </Carousel>
      </section>

      {/* Posts Section */}
      <section id="posts" className="h-full py-5 bg-white text-center">
        <h2 className="text-3xl font-bold mb-8">Posts</h2>

        {/* States */}
        {loading && <p className="mt-6 text-gray-600">Loading posts…</p>}
        {error && <p className="mt-6 text-red-600">Error: {error}</p>}
        {!loading && !error && posts.length === 0 && (
          <p className="mt-6 text-gray-600">No posts yet.</p>
        )}

        <div className="px-4">
          <Swiper
            // enable modules
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={16}
            autoplay={{ delay: 4000 }}
            loop
            // navigation
            pagination={{ clickable: true }}
            breakpoints={{
              0: { slidesPerView: 1 },   // xs
              768: { slidesPerView: 2 }, // md
              1024: { slidesPerView: 3 } // lg+
            }}
          >
            {posts.map((post) => (
              <SwiperSlide key={post._id}>
                <Link href={`/posts/${post._id}`} passHref>
                  {/* make the whole card clickable */}
                  <div className="cursor-pointer hover:scale-105 transition-transform duration-200">
                    <PostCard
                      title={post.title}
                      description={post.description}
                      date={post.date}
                      imageUrl={post.imageUrls[0]}
                    />
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-yellow-50 text-center">
        <h2 className="text-3xl font-bold mb-4">About Us</h2>
        <p className="max-w-3xl mx-auto">
          ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರ ಸ್ವಾಮಿ ದೇವಾಲಯ - ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠ, ಗುರುಪುರ (ಕೈಕಂಬ), ಮಂಗಳೂರು
          ಫಾಲ್ಗುಣಿ (ಗುರುಪುರ) ನದೀತೀರದಲ್ಲಿ ಅಲೆಮಾರುತ್ತಿರುವ ಧಾರ್ಮಿಕ–ಸಾಂಸ್ಕೃತಿಕ ಪರಂಪರೆಯ ಹೊಳಪನ್ನು ಹೊತ್ತ ನಮ್ಮ ದೇವಸ್ಥಾನವು ಶೈವ ಭಕ್ತಿಯ ಕೇಂದ್ರವಾಗಿದ್ದು, ಶತಮಾನಗಳಿಂದ ಗುರುಪುರ ಪಟ್ಟಣದ ಆಧ್ಯಾತ್ಮಿಕ ಜೀವನಕ್ಕೆ ಬೆಳಕು ನೀಡುತ್ತಿದೆ. ದೇವಾಲಯವು ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠದೊಂದಿಗೆ ಅಂತರ್‌ಘಟಿತವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸಿ, ಭಕ್ತರಿಗೆ ನಿತ್ಯಪೂಜೆ, ಅಭಿಷೇಕ–ಆಲಂಕಾರ ಹಾಗು ವಿಶೇಷ ಹೋಮ–ಹವನಗಳ ಮೂಲಕ ಶಿವತತ್ತ್ವದ ಸಂದೇಶವನ್ನು ಪಸರಿಸುತ್ತದೆ.
      
          ಗುರುಪುರ ಪ್ರದೇಶವು ಇತಿಹಾಸ ಪ್ರಸಿದ್ಧ ದೇವಾಲಯಗಳಿಂದ ಪ್ರಸಿದ್ಧವಾಗಿರುವ ತೀರ್ಥ ಕ್ಷೇತ್ರ. ಇಲ್ಲಿ ನಡೆಯುವ ವಾರ್ಷಿಕ ಉತ್ಸವಗಳು ಮತ್ತು “ಗುರ್ಪುರ ತೆರು” ಮುಂತಾದ ಸಂಪ್ರದಾಯಗಳು ಸ್ಥಳೀಯ ಸಮುದಾಯವನ್ನು ಒಂದಾಗಿಸುತ್ತವೆ. ನಮ್ಮ ದೇವಾಲಯವು ಭಕ್ತರ ಸೇವೆ, ಧಾರ್ಮಿಕ ಶಿಕ್ಷಣ, ಹಾಗೂ ಸಂಸ್ಕೃತಿಯ ಉಳಿವು–ಬೆಳವಣಿಗೆಗೆ ಬದ್ಧವಾಗಿದೆ.

          ಇತ್ತೀಚೆಗೆ ದೇವಾಲಯ–ಮಠ ಸಂಕೀರ್ಣದ ಜೀರ್ಣೋದ್ಧಾರ ಕಾರ್ಯಗಳ ಅಂಗವಾಗಿ ಬಾಲಾಲಯ ಪ್ರತಿಷ್ಠಾಪನೆ (ಆಗಸ್ಟ್ 21, 2025) ನೆರವೇರಿತು. ಪೀಠಾಧಿಪತಿಗಳ ಸನ್ನಿಧಾನದಲ್ಲಿ ನಡೆದ ರುದ್ರಾಭಿಷೇಕ, ರುದ್ರಪಾರಾಯಣ ಮತ್ತು ರುದ್ರಹೋಮಗಳೊಂದಿಗೆ ಭವ್ಯ ವಿಧಿವಿಧಾನಗಳು ಜರುಗಿದವು. ಭವಿಷ್ಯದಲ್ಲಿ ಭಕ್ತರಿಗೆ ಹೆಚ್ಚು ಸುಸಜ್ಜಿತ ಸೌಲಭ್ಯಗಳನ್ನು ಒದಗಿಸುವ ದೃಷ್ಟಿಯಿಂದ ಮೂಲಸೌಕರ್ಯ ಸುಧಾರಣೆಗಳು ನಡೆಯುತ್ತಿವೆ.

          ಕೈಕಂಬ–ಗುರುಪುರ ಪ್ರದೇಶವು ಮಂಗಳೂರಿನಿಂದ ಅತಿ ಸಮೀಪದಲ್ಲಿದ್ದು, ಇತರೆ ಪ್ರಮುಖ ದೇವಾಲಯಗಳಿಗೂ ಸಂಪರ್ಕ ಹೊಂದಿದೆ. ಭಕ್ತೀಯಾತ್ರಿಕರು ನಮ್ಮ ಮಂದಿರದ ದರ್ಶನದೊಂದಿಗೆ ಸುತ್ತಮುತ್ತಲಿನ ಧಾರ್ಮಿಕ ಸ್ಥಳಗಳಿಗೂ ಭೇಟಿ ನೀಡಿ ಆಧ್ಯಾತ್ಮಿಕ ಅನುಭವವನ್ನು ಹೆಚ್ಚಿಸಿಕೊಳ್ಳಬಹುದು.

          ನಿಮ್ಮೆಲ್ಲರನ್ನು ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರ ಸ್ವಾಮಿಯ ಕೃಪೆಗೆ ಆಹ್ವಾನಿಸುತ್ತೇವೆ.
        </p>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white text-center">
        <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
        <p>Email: info.srineelakanteshwaraswamy@gmail.com</p>
        {/* <p>Phone: +91 9876543210</p> */}
      </section>
    </div>
  );
}
