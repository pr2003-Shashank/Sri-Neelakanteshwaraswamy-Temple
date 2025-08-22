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

// GET all posts
export async function GET() {
  try {
    await connectDB();
    const posts = await Post.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, posts });
  } catch (err) {
    console.error("Error fetching posts:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// CREATE post (FormData + Cloudinary)
export async function POST(req: Request) {
  try {
    await connectDB();
    const formData = await req.formData();

    const title = String(formData.get("title") || "");
    const description = String(formData.get("description") || "");
    const date = String(formData.get("date") || "");
    const files = formData.getAll("images") as File[];

    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      return new Promise<string>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "posts" }, (err, result) => {
            if (err) return reject(err);
            resolve(result!.secure_url);
          })
          .end(buffer);
      });
    });

    const images = await Promise.all(uploadPromises);

    const doc = await Post.create({ title, description, date, images });

    return NextResponse.json({ success: true, post: doc });
  } catch (err) {
    console.error("Error in POST /api/posts:", err);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

// DELETE post (JSON: { _id })
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { _id } = await req.json();
    if (!_id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await Post.findByIdAndDelete(_id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /api/posts:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
