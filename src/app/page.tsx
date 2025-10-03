'use client';

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import Banner from "@/components/Banner";
import PostCard from "@/components/PostCard";
import frameTop from '../assets/frame-top.png';
import Temple from '../assets/temple-blueprint.jpg';
import frameBottom from '../assets/frame-bottom.png';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Loader2 } from "lucide-react";
import EmblaCarousel from "@/components/Carousel";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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

export default function Home() {
  // posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // gallery states
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  const imageUrls = gallery.map((img) => img.url)

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
    setGalleryError(null)
    try {
      const res = await fetch("/api/gallery", { cache: "no-store" });
      if (!res.ok) throw new Error(`GET /api/gallery failed ${res.status}`);
      const json = await res.json();
      const raw: GalleryImage[] = Array.isArray(json.images) ? json.images : [];

      const normalized: GalleryImage[] = raw.map((img) => ({
        _id: String(img._id),
        url: optimizeCloudinary(img.url, 800),
        title: img.title ?? "",
        createdAt: img.createdAt ?? "",
      }));

      setGallery(normalized);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setGalleryError(e.message);
      } else if (typeof e === "string") {
        setGalleryError(e);
      } else {
        setGalleryError("Failed to fetch posts");
      }
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
    loadGallery();

  }, [loadPosts, loadGallery]);

  return (
    <div className="flex flex-col w-full">
      <Banner />
      {/* Posts Section */}
      <section id="posts" className="h-full bg-gradient-to-b from-yellow-100 to-yellow-200 text-center">
        <div className="flex w-full justify-center">
          <img src={frameBottom.src} alt="frame top" className="w-full max-w-3xl mb-2" />
        </div>
        <h2 className="text-xl md:text-3xl font-bold mb-2 text-yellow-900">ಪೋಸ್ಟ್‌ಗಳು</h2>
        {/* States */}
        {loading && <div className="flex my-6 w-full items-center justify-center text-yellow-900">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>}
        {error && <div className="m-6 text-yellow-900">Sorry could not fetch post</div>}
        {!loading && !error && posts.length === 0 && (
          <p className="m-6 text-yellow-900">No posts yet.</p>
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
            centerInsufficientSlides={true}

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
        <div className="flex w-full justify-center">
          <img src={frameTop.src} alt="frame top" className="w-full max-w-3xl mt-2" />
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-5 h-full text-center">
        <h2 className="text-xl text-center md:text-3xl font-bold mb-2 text-yellow-900">ಗ್ಯಾಲರಿ</h2>
        {/* States */}
        {galleryLoading && <div className="flex my-6 w-full items-center justify-center text-yellow-900">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>}
        {galleryError && <div className="m-6 text-yellow-900">Sorry could not fetch images from the gallery</div>}
        {!galleryLoading && !galleryError && gallery.length === 0 && (
          <p className="m-6 text-yellow-900">No images in the gallery yet.</p>
        )}
        <EmblaCarousel
          images={imageUrls}
          options={{ loop: true }}
          autoplay
          autoplayDelay={4000} />

      </section>

      {/* History Section */}
      <section id="history" className="py-5 bg-yellow-50">
        <h2 className="text-xl text-center md:text-3xl font-bold mb-2 text-yellow-900">ಇತಿಹಾಸ</h2>
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <div
            className="bg-gradient-to-b from-yellow-100 to-yellow-200 p-4 rounded-lg shadow-md"
          >
            <p>ಗುರುಪುರ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠ ಮತ್ತು ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರ ಸ್ವಾಮಿ ದೇವಸ್ಥಾನಕ್ಕೆ, ಒಂದು ಸಾವಿರ ವರುಷಗಳಿಗಿಂತಲೂ ಹೆಚ್ಚಿನ ಇತಿಹಾಸವಿದೆ.</p>
          </div>
          <div
            className="bg-gradient-to-b from-yellow-100 to-yellow-200 p-4 rounded-lg shadow-md"
          >
            <p className="text-lg font-semibold mb-2 text-center">ಗುರುಗಳ ಪುರ</p>
            <p>ಮಂಗಳೂರಿನಿಂದ ಮೂಡಬಿದಿರೆಗೆ ಹೋಗುವ ರಸ್ತೆಯಲ್ಲಿ,ಮಂಗಳೂರಿನಿಂದ
              ಹದಿನಾರು ಕಿಲೋ ಮೀಟರ್ ದೂರದಲ್ಲಿ,
              ಫಲ್ಘುಣಿ ನದಿಯ ತೀರದಲ್ಲಿ ಇರುವ
              ಸುಂದರ ಊರು ಗುರುಪುರ.ಈ ಗುರುಪುರದಲ್ಲಿ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠವಿದೆ. ಶ್ರೀಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠದ ಆಧೀನದಲ್ಲಿ ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರ ಸ್ವಾಮಿ
              ದೇವಸ್ಥಾನವಿದೆ.ಈಗ ಶ್ರೀ ಶ್ರೀ ಶ್ರೀ ರುದ್ರಮುನಿ ಮಹಾಸ್ವಾಮಿಗಳು
              ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠ ಮತ್ತು
              ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರ ಸ್ವಾಮಿ ದೇವಸ್ಥಾನದ ಆಡಳಿತವನ್ನು ನಿರ್ವಹಿಸುತ್ತಿದ್ದಾರೆ.
              ಅನಾದಿ ಕಾಲದಿಂದಲೂ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠದಲ್ಲಿ ಗುರುಗಳ ವಾಸ್ತವ್ಯ
              ಇದ್ದುದರಿಂದ ನಮ್ಮ ಊರಿಗೆ,ಗುರುಗಳ
              ಪುರ ,ಗುರುಪುರ ಎಂಬ ಹೆಸರು ಬಂದಿದೆ.</p>
          </div>
          <div
            className="bg-gradient-to-b from-yellow-100 to-yellow-200 p-4 rounded-lg shadow-md"
          >
            <p className="text-lg font-semibold mb-2 text-center">ಕ್ರಿ.ಶ. 1190ರಲ್ಲಿ ಸ್ಥಾಪನೆ</p>
            <p>ಕ್ರಿ ಶ 1190 ರಲ್ಲಿ ಬಾದಾಮಿಯ ಜಾಲುಕ್ಯರ
              ಆರನೇ ವಿಕ್ರಮಾದಿತ್ಯನ ಆಳ್ವಿಕೆಯ ಕಾಲದಲ್ಲಿ,ಶ್ರೀ ಸಿದ್ಧೇಶ್ವರ ಶಿವಯೋಗಿಗಳು ಉತ್ತರ ಕರ್ನಾಟಕದಿಂದ ಬಂದು  ಗುರುಪುರದಲ್ಲಿ ಈ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠ ಮತ್ತು ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರ ಸ್ವಾಮಿ ದೇವಸ್ಥಾನವನ್ನು  ಸ್ಥಾಪಿಸಿದ್ದರು. ಈ ಮಾತಿಗೆ ಸಾಕ್ಷಿಯಾಗಿ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠ ಮತ್ತು ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರ ಸ್ವಾಮಿ ದೇವಸ್ತಾನದ ವಾಸ್ತು, ಪೌಳಿ ಗೋಡೆ ಮತ್ತು ಮರದ ಕೆತ್ತನೆ, ಬಾದಾಮಿಯ ಚಾಲುಕ್ಯರ ಕಾಲದ ವಾಸ್ತುವನ್ನು ಹೋಲುತ್ತಿದೆ. ಮತ್ತು ಇಲ್ಲಿಂದ ಒಂದೂವರೆ ಕಿಲೋ ಮೀಟರ್ ದೂರದಲ್ಲಿ ಇರುವ ಶ್ರೀ ಸಿದ್ಧೇಶ್ವರ ಶಿವ ಯೋಗಿಗಳ ಗದ್ದುಗೆಯಲ್ಲಿ ವರ್ಷಕ್ಕೊಮ್ಮೆ ನಡೆಯುವ ಆರಾಧನೆಯಲ್ಲಿ ,ಗುರುಗಳಿಗೆ ಉತ್ತರ ಕರ್ನಾಟಕದ ಜೋಳದ ರೊಟ್ಟಿ, ಮತ್ತು ಪುಂಡಿ ಪಲ್ಯವನ್ನು  ನೈವೇದ್ಯ (ಎಡೆ)ವಾಗಿ  ಅರ್ಪಿಸಲಾಗುತ್ತಿತ್ತು.ಇತ್ತೀಚೆಗೆ ಮೈಸೂರು ಪ್ರಾಂತ್ಯದ ಸಂಪ್ರದಾಯದಂತೆ ಜೋಳದ ರೊಟ್ಟಿಯ ಬದಲಾಗಿ ಅಕ್ಕಿಯ ರೊಟ್ಟಿಯನ್ನು  ಇಲ್ಲಿ ನೈವೇದ್ಯಕ್ಕೆ ಬಳಸಲಾಗುತ್ತಿದೆ.</p>
          </div>
          <div
            className="bg-gradient-to-b from-yellow-100 to-yellow-200 p-4 rounded-lg shadow-md"
          >
            <p className="text-lg font-semibold mb-2 text-center">ರಾಜಮನೆತನದ ಆಶ್ರಯ</p>
            <p>ಕೆಳದಿಯ ಶೈವ ಸಂಪ್ರದಾಯದ ರಾಜಮನೆತನದ ಆಳ್ವಿಕೆಗಾರರಾಗಿದ್ದ
              ಶಿವಪ್ಪ ನಾಯಕ,ಚೆನ್ನಮ್ಮ ಮತ್ತು ಇಮ್ಮಡಿ
              ಸೋಮಶೇಖರನ ಆಳ್ವಿಕೆಯಲ್ಲಿ, ಇವರ
              ಆಳ್ವಿಕೆಯು ಕರಾವಳಿ ಮತ್ತು ಕೇರಳದ ಕಾಸರಗೋಡ್ ವರೆಗೂ ಹಬ್ಬಿತ್ತು.
              ಕೆಳದಿಯಿಂದ ಹೊರಡುತ್ತಿದ್ದ ವೀರಶೈವ ಲಿಂಗಾಯತ ವ್ಯಾಪಾರಿಗಳ ಸೌಕರ್ಯಕ್ಕಾಗಿ,
              ಈ ರಾಜರು ಅವರ ವ್ಯಾಪಾರದ ಹಾದಿಗಳಲ್ಲಿ
              ಮಠ ಮಂದಿರಗಳನ್ನು ನಿರ್ಮಿಸಿದ್ದರು.
              ತಮ್ಮ ನಾಡಿನಲ್ಲಿ ಧರ್ಮವು ನೆಲೆಗೊಂಡರೆ  ತಮ್ಮ ಆಡಳಿತವು ಸುಲಲಿತವಾಗುವುದು ಎಂಬ ನಂಬಿಕೆ ಕೂಡಾ ಕೆಳದಿ ಸಂಸ್ಥಾನವು ಇಂತಹ ಮಠಗಳನ್ನು ನಿರ್ಮಿಸಲು
              ಪ್ರೇರಣೆಯಾಗಿತ್ತು.
              <br />
              ಕೆಳದಿಯ ಚೆನ್ನಮ್ಮ ರಾಣಿ, ಕರಾವಳಿಯ ಕಡೆ ಬಂದಾಗ, ಗುರುಪುರದ ಜಂಗಮ ಮಠದ ಎದುರಲ್ಲಿ ಇದ್ದ ಅರಮನೆಯಲ್ಲಿ ವಾಸ್ತವ್ಯ ಮಾಡುತ್ತಿದ್ದರು. ಗುರುಪುರ ಶ್ರೀ ಜಂಗಮ ಮಠದ ವಾಸ್ತುವೂ ಅಂದಿನ ಅರಮನೆಗಳ ರೂಪುರೇಶೆಗಳನ್ನು ಹೋಲುತ್ತಿದೆ.</p>
          </div>

          <div
            className="flex flex-col text-pre-wrap bg-gradient-to-b from-yellow-100 to-yellow-200 p-4 rounded-lg shadow-md"
          >
            <p className="text-lg font-semibold mb-2 text-center">ಮಠಗಳ ಗುರುಪೀಠ - ಗುರುಪುರ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠ</p>
            <p className="">
              ಇಕ್ಕೇರಿ ಸೋಮಶೇಖರ ನಾಯಕರು, ಗುರುಪುರ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠಕ್ಕೆ ಮೂಳೂರು, ಕಂದಾವರ, ಕೊಳಂಬೆ,
              ಅಡ್ಡೂರು, ಮೂಡಬಿದ್ರಿ, ಕರ್ಪೆ, ಕರಿಂಜೆ,
              ಸಂಗಬೆಟ್ಟು, ವಿಲಿಯ, ಕುಕ್ಕೆಪಾಡಿ, ನಡು,
              ತೋಡಾರು,ಕೊಡಿಯಾಲ ಬೈಲ್ ಕಸಬಾ, ಹೊಳೆ ಹೊನ್ನೂರು ಸೀಮೆ,ಮತ್ತು ಅರಸಿನಕೆರೆ ಎಂಬ ಗ್ರಾಮಗಳನ್ನು ಕೈಧರ್ಮವಾಗಿ ನೀಡಿದ್ದರು
              <br /><br />
              ವಿಜಯ ನಗರದ ಆಡಳಿತಕ್ಕೆ ಒಳಪಟ್ಟ
              ಬಾರ್ಕೂರು ಪ್ರಾಂತ್ಯದ ಆಡಳಿತಾಧಿಕಾರಿ ಒಂದನೆಯ ವೆಂಕಟಪ್ಪ ಇವರು ಗುರುಪುರ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠಕ್ಕೆಉಪ್ಪೂರು ಸೇರಿದಂತೆ ಒಟ್ಟು  ಎರಡು ಗ್ರಾಮಗಳನ್ನು ಉಂಬಳಿ ನೀಡಿದ್ದರು.
              <br /><br />
              ಕೆಳದಿಯ ನಾಯಕರು ವೀರಶೈವ ಧರ್ಮದ
              ಅನುಯಾಯಿಗಳಾಗಿದ್ದು ದ.ಕನ್ನಡದ
              ಈ ಕೆಳ ಕಂಡ ಊರುಗಳಲ್ಲಿ 64
              ಮಠಗಳನ್ನು ಸ್ಥಾಪಿಸಿದ್ದರು.
              <br /><br />
              ಬಸ್ರೂರು, ಕೋಟೇಶ್ವರ, ಸಿದ್ದಾಪುರ,
              ಕೊಲ್ಲೂರು(ಇಲ್ಲಿ‌4ಮಠ), ಮಾರಗ,
              ಬಾಳೆಕುದ್ರು, ಬೆಣ್ಣೆಕುದ್ರು,
              ಶಂಕರ ನಾರಾಯಣ, ಬಾರ್ಕೂರು,
              ಕೌಂಡ್ಲೂರು, ಉಪ್ಪೂರು, ಕಲ್ಯಾಣಪುರ,
              ಸೂರಾಲು, ಕೊಂಡಾಡಿ, ಕುಂದಾಪುರ,
              ಉಡುಪಿ, ಪಾಂಗಾಳ, ಮುಲ್ಕಿ(2 ಮಠ),
              ಸುರತ್ಕಲ್, ಶಿರ್ವ, ನಾಳ, ಕೆರವಾಸೆ, ನಾರಾವಿ, ಕಾರ್ಕಳ, ಸಾಣೂರು, ಮೂಡಬಿದಿರೆಯ
              ಪೊನ್ನೆಚ್ಚಾರ್, ವೇಣೂರು, ಪುಚ್ಚೆಮೊಗರು,
              ಬೆಳ್ತಂಗಡಿ, ಗುರುವಾಯನ ಕೆರೆ, ಉಪ್ಪಿನಂಗಡಿ, ಸುಬ್ರಹ್ಮಣ್ಯ (4 ಮಠ),
              ಹೊಸಮಠ, ಪಂಜ , ಬೆಳ್ಳಾರೆ, ವಿಠ್ಲ, ಕಾಡೊಳೆ, ಎಣ್ಣೆಹೊಳೆ, ಉಳ್ಳಾಲ, ಮಂಜೇಶ್ವರ, ಕುಂಬಳೆ,
              ಕಾಸರಗೋಡ್, ಚಂದ್ರಗಿರಿ, ಪಳ್ಳಿಕೆರೆ,
              ಹೊಸದುರ್ಗ, ಬಂಟ್ವಾಳ, ಮಳಲಿ, ಗಂಜಿಮಠ, ಬೆಳುವಾಯಿ, ಕೊಳತ್ತಮಜಲು,
              ಅಸೈಗೋಳಿ, ಬಾಸುಬೈಲು ಮತ್ತು ಗುರುಪುರ.
              <br /><br />
              ಉಳಿದ ಎಲ್ಲಾ 63 ಮಠಗಳು ಶಾಖಾ ಮಠಗಳಾಗಿದ್ದು,ಗುರುಪುರ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠವು ಅವುಗಳಿಗೆಲ್ಲ
              ಗುರುಪೀಠವಾಗಿತ್ತು.ಈ 63 ಮಠಗಳು ತಮ್ಮ
              ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಮತ್ತು ತಮ್ಮ ವ್ಯಾಪ್ತಿಗೆ ಸಂಬಂಧಿಸಿದ ಯಾವುದೇ ಸ್ಥಳಗಳ ಯಾವುದೇ ಸಮಸ್ಯೆಗಳ ಪರಿಹಾರಗಳಿಗಾಗಿ ಆಶ್ರಯಿಸುತ್ತಿದ್ದುದು ಗುರುಪುರ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠ ಮತ್ತು ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರ ಸ್ವಾಮಿ ದೇವಸ್ಥಾನವನ್ನು.ಈ ಸಂಪ್ರದಾಯ ಇಂದಿನವರೆಗೂ ಮುಂದುವರಿದಿದೆ.</p>
          </div>

          <div
            className="bg-gradient-to-b from-yellow-100 to-yellow-200 p-4 rounded-lg shadow-md"
          >
            <p className="text-lg font-semibold mb-2 text-center">ಉಪದೇಶಗಳು ಮತ್ತು ಮೌಲ್ಯಗಳು</p>
            <p>
              ಈ ಮಠಗಳು ಪ್ರವಾಸಿಗಳಿಗೆ ರಕ್ಷಣೆ
              ಮತ್ತು ದಾಸೋಹದ ಕೇಂದ್ರಗಳಾಗಿದ್ದವು.
              ಈ ಮಠಗಳ ಗುರುಗಳು ,ಊರ ಜನರಿಗೆ ಆಭಯವನ್ನೂ  ,ಸಂಸ್ಕಾರವನ್ನೂ,ಕಾಯಕವೇ ಕೈಲಾಸ ಮೊದಲಾದ ಸದಾಚಾರಗಳನ್ನೂ
              ಬೋಧಿಸುತ್ತಾ, ಊರ ಜನರಲ್ಲಿ ಗುರುವೇ
              ದೇವರು ಎಂಬ ಭಾವವನ್ನು ಸೃಜಿಸಿದ್ದರು.
              ಸಹಬಾಳ್ವೆಗೆ ಪ್ರೇರಣೆಯಾಗಿದ್ದರು.
            </p>
          </div>
          <div
            className="bg-gradient-to-b from-yellow-100 to-yellow-200 p-4 rounded-lg shadow-md"
          >
            <p className="text-lg font-semibold mb-2 text-center">ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರನ ವಿಶಿಷ್ಟ ಆರಾಧ್ಯ ವಿಗ್ರಹ </p>
            <p>ಗುರುಪುರ ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರ ದೇವಸ್ತಾನದ
              ಆರಾಧ್ಯ ಮೂರ್ತಿ ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರನ
              ವಿಗ್ರಹವು ಬಲು ವಿಶಿಷ್ಟವಾದುದು.
              ಹೆಚ್ಚಿನ‌ ಕಡೆಗಳಲ್ಲಿ  ಲಿಂಗ ರೂಪಿನಲ್ಲಿರುವ
              ಶಿವನು, ಇಲ್ಲಿ ನಿಂತ ನಿಲುವಿನಲ್ಲಿ, ನಾಲ್ಕು‌ ಕೈಗಳಿಂದ ಶೋಭಿಸುವ ಮನೋಹರ ಮೂರ್ತಿಯಾಗಿದ್ದಾನೆ.ಮೇಲಿನ ಬಲದ ಕೈ ತ್ರಿಶೂಲ ಪಾಣಿಯಾದರೆ ಎಡ ಕೈ ಮೃಗಪಾಣಿಯಾಗಿದೆ. ಅಂದರೆ ಶಿವನು ಜಿಂಕೆಯನ್ನು ಹಿಡಿದಿದ್ದಾನೆ.ಕೆಳಗಿನ ಬಲದ ಕೈ ಜಪಮಣಿಯನ್ನು ಹೊಂದಿದ್ದು ವರದ  ಹಸ್ತವಾದರೆ ಎಡದ ಕೈ ಅಭಯ ಹಸ್ತವಾಗಿದೆ.
              <br />
              ಈ ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರನು ನಮ್ಮ ಜನ್ಮ ಜನ್ಮಾಂತರದ ಪಾಪಗಳೆಂಬ ವಿಷವನ್ನು
              ತಾನುಂಡು,ನಮಗೆ ಸುಖ ಶಾಂತಿ ನೆಮ್ಮದಿ
              ಮತ್ತು ಸಾಯುಜ್ಯ ಎಂಬ ಅಮೃತವನ್ನು
              ಕರುಣಿಸಬಲ್ಲ ಅಮೃತೇಶ್ವರನಾಗಿದ್ದಾನೆ.</p>
          </div>
          <div
            className="bg-gradient-to-b from-yellow-100 to-yellow-200 p-4 rounded-lg shadow-md"
          >
            <p className="text-lg font-semibold mb-2 text-center">ಪ್ರತಿಷ್ಠಿತ ಪರಿವಾರ ದೈವಗಳು</p>
            <p>ಕರೆದು ಎಚ್ಚರಿಸುವ ಕರ್ಲುಟ್ಟಿ ಎಂಬ ಅಭಿದಾನವುಳ್ಳ ಕರ್ಲುಟ್ಟಿ , ತನ್ನ ಪರಿವಾರ ದೈವಗಳ ಜತೆ ಇಲ್ಲಿ ಸನ್ನಿಧಾನವನ್ನು
              ಹೊಂದಿದ್ದಾಳೆ.ಗುಳಿಗನ ಕಾರಣೀಕವೂ ಇಲ್ಲಿ
              ಜನಜನಿತವಾಗಿದೆ.ಮಠದ ಮುಂದುಗಡೆ ದಾರಿಯ ಇಕ್ಕೆಲಗಳಲ್ಲಿ ಕರ್ಲುಟ್ಟಿ ಮತ್ತು ಮಹಮ್ಮಾಯಿಯವರ ಸಾನಿಧ್ಯವಿದೆ.
              ಮಠದ ಒಳಗಡೆ ಚೌಡಮ್ಮನ ಸಾನಿಧ್ಯವಿದೆ.</p>
          </div>
          <div
            className="bg-gradient-to-b from-yellow-100 to-yellow-200 p-4 rounded-lg shadow-md"
          >
            <p className="text-lg font-semibold mb-2 text-center">ಮಹಾಗುರುಗಳ ಸಾನಿಧ್ಯ</p>
            <p>
              ಎಲ್ಲಕ್ಕಿಂತಲೂ ವಿಶೇಷ ವೆಂದರೆ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠವು ,ಗುರುಗಳ ಅಪೂರ್ವ ಸಾನಿಧ್ಯವನ್ನು ಹೊಂದಿದೆ. ಓರ್ವ ಗುರುಮಾತೆಯದೂ ಸೇರಿದಂತೆ, ಹದಿಮೂರು ಗುರುಗಳ ಗದ್ದುಗೆ ಇಲ್ಲಿವೆ.
              ಮಠದ ಸಂಸ್ಥಾಪಕರಾದ ಸಿದ್ಧೇಶ್ವರ ಶಿವಯೋಗಿಗಳ ಗದ್ದುಗೆ, ಇಲ್ಲಿಗೆ ಒಂದೂವರೆ ಕಿಲೋ ಮೀಟರ್ ದೂರದ ಚಿಲಿಂಬಿ
              ಕೋಡಿಯಲ್ಲಿದೆ.ಇಲ್ಲಿಯ ಆರು ಗುರುಗಳ
              ಗದ್ದುಗೆ ವಿರಾಜಪೇಟೆಯಲ್ಲಿದೆ. ಹೀಗೆ ಇಪ್ಪತ್ತು
              ಮಂದಿ ಗುರುಗಳನ್ನು ಹೊಂದಿದ, ಮಹಾಗುರು ಸಾನಿಧ್ಯ ಗುರುಪುರ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠ.
            </p>
          </div>
          <div
            className="bg-gradient-to-b from-yellow-100 to-yellow-200 p-4 rounded-lg shadow-md"
          >
            <p className="text-lg font-semibold mb-2 text-center">ವಾರ್ಷಿಕ ಧಾರ್ಮಿಕ ಸಂಪ್ರದಾಯಗಳು</p>
            <p>
              ಇಲ್ಲಿ ಶ್ರಾವಣ ಮಾಸದ ಪ್ರತಿ ಸೋಮವಾರ ನಡೆಯವ ಎಲೆ‌ಪೂಜೆ, ಉತ್ತರ ಕರ್ನಾಟಕದ
              ತಾಂಬೂಲ ಪೂಜೆಯ ಅನುಕರಣೆ. ದೀಪಾವಳಿಯಲ್ಲಿ ,ತುಳುನಾಡಿನ  ಶಿಷ್ಟಾಚಾರದಂತೆ ಬಲೀಂದ್ರ ಪೂಜೆ ಇಲ್ಲಿ ನಡೆಯುತ್ತದೆ.ಕಾರ್ತಿಕಮಾಸದಲ್ಲಿ ಬಲು ವೈಭವದ ದೀಪೋತ್ಸವ ಜರಗುತ್ತದೆ. ಶಿವರಾತ್ರಿಯನ್ನು ಕೂಡಾ ಇಲ್ಲಿ ವೈಭವದಿಂದ ಆಚರಿಸಲಾಗುತ್ತದೆ.ದೀಪೋತ್ಸವ ಮತ್ತು ಶಿವರಾತ್ರಿಯ ಸಮಯದಲ್ಲಿ ನೀಲಕಂಠೇಶ್ವರ ಸ್ವಾಮಿ ರಥಾರೂಢನಾಗುತ್ತಾನೆ
            </p>
          </div>
        </div>
      </section>
      <section id="renovation" className="flex flex-col py-5 justify-center items-center">
        <h2 className="text-xl text-center md:text-3xl font-bold mb-2 text-yellow-900">ಜೀರ್ಣೋದ್ಧಾರ</h2>
        <div className="flex flex-col md:flex-row w-full max-w-4xl gap-2 mb-2 bg-gradient-to-b from-yellow-50 to-yellow-100">
          <div className="renovation-blueprint flex max-h-[400px] p-4">
            <img src={Temple.src} alt="renovation" />
          </div>
          <div className="flex flex-col justify-center items-center mx-4 mb-4 gap-2">
            <div className="flex flex-col w-full p-4 rounded-lg shadow-md bg-gradient-to-b  from-yellow-100 to-yellow-200">
              <p className="font-bold mb-2">ಹೊಸ ಯೋಜನೆಯ ಮುಖ್ಯ ಅಂಶಗಳು:</p>
              <ul className="list-disc list-inside">
                <li>ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರ ಸ್ವಾಮಿ ದೇವರ ನೂತನ ಶಿಲಾಮಯ ಗರ್ಭಗುಡಿ</li>
                <li>ಗಣಪತಿ ದೇವರ ಶಿಲಾಮಯ ಗರ್ಭಗುಡಿ</li>
                <li>ದುರ್ಗೆಯ ಶಿಲಾಮಯ ಗರ್ಭಗುಡಿ</li>
                <li>ಶಿಲಾಮಯ ನಂದಿಪೀಠ</li>
                <li>ಗುರು ಭವನ</li>
                <li>ಅತಿಥಿ ಗೃಹ</li>
              </ul>
            </div>
            <div className="flex flex-col w-full justify-center items-center rounded-lg shadow-md p-4 bg-gradient-to-b from-yellow-100 to-yellow-200">
              <p className="">ಈ ಯೋಜನೆಯ ಅಂದಾಜು ವೆಚ್ಚ</p>
              <p className="text-xl font-bold">₹ 5 ಕೋಟಿ </p>
            </div>
          </div>
        </div>
        <div
          className="flex flex-col w-full max-w-4xl bg-gradient-to-b from-yellow-100 to-yellow-200 p-4 mx-4 rounded-lg shadow-md"
        >
          <div className="flex w-full justify-center">
            <img src={frameBottom.src} alt="frame top" className="w-full" />
          </div>
          <p className="flex flex-col">
            <span className="flex text-lg font-semibold mb-2 justify-center">ವಿಜ್ಞಾಪನೆ ಪತ್ರ</span>
            ಭಕ್ತಾಭಿಮಾನಿಗಳೇ,
            <br /> <br /><br />
            ಹತ್ತು ಹಲವು ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಹೊಂದಿರುವ ಗುರುಪುರ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠ,ರಾಜ ಮನೆತನಗಳಿಂದ ಹಲವು  ಗ್ರಾಮಗಳ ಉಂಬಳಿ ಪಡೆದು ಕೊಂಡ ಗುರುಪುರ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠ, 63 ಶಾಖಾ ಜಂಗಮ‌ ಮಠಗಳಿಗೆ ಪ್ರಧಾನ ಮಠ ಎಂಬ ಹೆಗ್ಗಳಿಕೆ ಹೊಂದಿದ್ದ ಗುರುಪುರ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ‌ಮಠ,ಒಂದು‌ ಕಾಲದಲ್ಲಿ ವಿದ್ಯಾ ಸಂಸ್ಥೆಯನ್ನು ನಡೆಸಿ ವಿದ್ಯಾದಾನ ನೀಡುತ್ತಿದ್ದ ಗುರುಪುರ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠ, ತುಳುನಾಡಿನ ಜಾನಪದ ಕ್ರೀಡೆಯಾದಂತಹ ಕಂಬಳವನ್ನು ನಡೆಸಿ ಕೊಂಡು ಬರುತ್ತಿದ್ದಂತಹ ಗುರುಪುರ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠ, ಇಂದು ಕಾಲಗತಿಗೆ ಸಿಲುಕಿ ಕೊರಗಿದೆ.
            <br /><br />
            ಉಳುವವನೇ ಭೂಮಿಯ ಒಡೆಯ ಎಂಬ ಮಸೂದೆ ಕರ್ನಾಟಕದಲ್ಲಿ ಜಾರಿಗೆ ಬಂದಾಗ, ಆಗ ಮಠದ ಮಠಾಧ್ಯಕ್ಷರಾಗಿದ್ದ  ಶ್ರೀ ಶ್ರೀ ಶ್ರೀ ಚೆನ್ನಬಸಪ್ಪ ಸ್ವಾಮಿಯವರು  ತಮ್ಮ ಗೇಣಿದಾರರಾಗಿದ್ದವರಿಗೆ , ಅವರವರ ಭೂಮಿಯ ಒಡೆತನವನ್ನು ತಾವೇ ಕರುಣಿಸಿರುತ್ತಾರೆ. ಹೀಗೆ ತನ್ನ ಬಹುಪಾಲು
            ಭೂಮಿಯನ್ನು ಕಳೆದು ಕೊಂಡ ಗುರುಪುರ
            ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠದ ಆರ್ಥಿಕ
            ಪರಿಸ್ಥಿತಿ ಈ ದಿನಗಳಲ್ಲಿ ಚೆನ್ನಾಗಿಲ್ಲ.
            ಶ್ರೀನೀಲಕಂಠೇಶ್ವರ ದೇವಸ್ತಾನವು ತನ್ನ ಜೀರ್ಣಾವಸ್ಥೆಯ ಅಂಚಿಗೆ ಬಂದು ತಲುಪಿದೆ.
            <br /><br />
            ಈ ಕಾಲಘಟ್ಟದಲ್ಲಿ,ಗುರುಪುರ ಶ್ರೀ ಜಂಗಮ ಸಂಸ್ಥಾನ ಮಠದ ಅಭಿಮಾನಿಗಳೂ
            ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರ ದೇವಸ್ತಾನದ ಭಕ್ತಾಭಿಮಾನಿಗಳೂ ಒಗ್ಗೂಡಿ,
            ಮಠಾಧ್ಯಕ್ಷರಾದ ಶ್ರೀ ಶ್ರೀ ಶ್ರೀ ರುದ್ರಮುನಿ ಮಹಾಸ್ವಾಮಿಗಳ ನೇತ್ರತ್ವದಲ್ಲಿ ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರ ದೇವಸ್ಥಾನದ ಜೀರ್ಣೋದ್ಧಾರದ ಸಂಕಲ್ಪವನ್ನು ಕೈಗೊಂಡಿದ್ದೇವೆ.
            <br /><br />
            ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರ ದೇವರ ನೂತನ ಶಿಲಾಮಯ ಗರ್ಭಗುಡಿ,ಗಣಪತಿ ದೇವರ ಶಿಲಾಮಯ ಗರ್ಭಗುಡಿ, ದುರ್ಗೆಯ
            ಶಿಲಾಮಯ ಗರ್ಭಗುಡಿ, ಮತ್ತು ಶಿಲಾಮಯ
            ನಂದಿಪೀಠ ಸಹಿತ ನೂತನ  ದೇವಸ್ಥಾನವನ್ನೂ ಗುರು ಭವನವನ್ನೂ , ಅತಿಥಿ ಗೃಹವನ್ನೂ ಹೊಂದಿರುವ ನೂತನ ಯೋಜನೆ ಸುಮಾರು ಐದು ಕೋಟಿ ರೂಪಾಯಿಗಳ ಅಂದಾಜು ವೆಚ್ಚವನ್ನು ಹೊಂದಿದೆ.
            <br /><br />
            ಈ ವರುಷ ಅಕ್ಟೋಬರ್ 24 ರಂದು ದೇಗುಲದ ಶಿಲಾನ್ಯಾಸ ಜರಗಲಿದೆ.ಎರಡು ವರುಷಗಳಲ್ಲಿ ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರ ಸ್ವಾಮಿಯ ದೇವಾಲಯವನ್ನು ಪೂರ್ಣಗೊಳಿಸುವ ಸಂಕಲ್ಪ ನಮ್ಮದಾಗಿದೆ.
            <br />
            ಈ ಜೀರ್ಣೋದ್ಧಾರದ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ
            ಭಕ್ತಾಭಿಮಾನಿಗಳಾದ ತಮ್ಮೆಲ್ಲರ
            ಸಲಹೆ ,ಸಹಕಾರ,ಸಹಾಯ,ಪ್ರೋತ್ಸಾಹ
            ಮಾರ್ಗದರ್ಶನ ಇವುಗಳ ಅಗತ್ಯವಿದೆ.
            ಈ ಕ್ಷೇತ್ರಕ್ಕೆ ಒಂದಲ್ಲ ಒಂದು ರೀತಿಯ ಅವಿನಾಭಾವ ಸಂಬಂಧವನ್ನು ಹೊಂದಿರುವ ,ತಾವೆಲ್ಲರೂ ಈ ಕಾರ್ಯದಲ್ಲಿ
            ತಮಗೆ ಸಾಧ್ಯವಾಗುವ ನೆರವನ್ನು ನೀಡಿ,
            ಈ ಭಗವತ್ ಕಾರ್ಯದಲ್ಲಿ ಸಹಭಾಗಿಗಳಾಗಿ
            ಶ್ರೀ ನೀಲಕಂಠೇಶ್ವರನ ಅನುಗ್ರಹವನ್ನು ಪಡೆದು ಧನ್ಯತೆಯನ್ನು ಹೊಂದಬೇಕಾಗಿ,
            ವಿನಮ್ರ ಪ್ರಾರ್ಥನೆ.
            <br /><br />
            <b>ಶ್ರೀ ಶ್ರೀ ಶ್ರೀ ರುದ್ರಮುನಿ ಮಹಾಸ್ವಾಮಿಗಳು</b>
            ಮತ್ತು ಶ್ರೀನೀಲಕಂಠೇಶ್ವರ  ಸ್ವಾಮಿ ದೇವಸ್ಥಾನ ಜೀರ್ಣೋದ್ಧಾರ ಸಮಿತಿ
            <br />
            ಶ್ರೀ ಜಂಗಮ  ಸಂಸ್ಥಾನ ಮಠ ಗುರುಪುರ
          </p>
          <div className="flex w-full justify-center">
            <img src={frameTop.src} alt="frame top" className="w-full" />
          </div>
        </div>
      </section>
    </div>
  );
}
