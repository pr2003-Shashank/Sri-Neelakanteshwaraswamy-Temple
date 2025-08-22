import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// GET one post
export async function GET(
  _req: Request,
  context: { params: Promise<{ _id: string }> }
) {
  try {
    const { _id } = await context.params;
    await connectDB();
    const post = await Post.findById(_id).lean();
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (err) {
    console.error("GET /api/posts/[_id] error:", err);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

// PUT /api/posts/[_id]
export async function PUT(
  req: Request,
  context: { params: Promise<{ _id: string }> } // <-- match your async params style
) {
  try {
    const { _id } = await context.params;
    await connectDB();

    // Ensure the post exists before parsing payload
    const current = await Post.findById(_id).lean();
    if (!current) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Expect FormData so we can handle files + JSON together
    const formData = await req.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const date = formData.get("date");

    // Client sends the kept images as a JSON-encoded array
    // If not provided, fall back to current.images
    let keptImages: string[] = Array.isArray(current.images) ? [...current.images] : [];
    const existingImagesRaw = formData.get("existingImages");
    if (typeof existingImagesRaw === "string") {
      try {
        keptImages = JSON.parse(existingImagesRaw);
      } catch {
        // ignore parse errors and keep current images
      }
    }

    // New files to upload (optional)
    const files = formData.getAll("images") as File[];
    let uploadedUrls: string[] = [];

    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return new Promise<string>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "posts" }, (err, result) => {
              if (err || !result) return reject(err || new Error("Cloudinary upload failed"));
              resolve(result.secure_url);
            })
            .end(buffer);
        });
      });

      uploadedUrls = await Promise.all(uploadPromises);
    }

    // Merge (and de-dupe just in case)
    const images = Array.from(new Set([...(keptImages || []), ...uploadedUrls]));

    const updated = await Post.findByIdAndUpdate(
      _id,
      {
        ...(title != null && { title: String(title) }),
        ...(description != null && { description: String(description) }),
        ...(date != null && { date: String(date) }),
        images,
      },
      { new: true }
    ).lean();

    return NextResponse.json({ success: true, post: updated });
  } catch (err) {
    console.error("PUT /api/posts/[_id] error:", err);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}