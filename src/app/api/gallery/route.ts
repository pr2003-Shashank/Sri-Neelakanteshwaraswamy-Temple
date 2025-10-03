import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Gallery } from "@/models/Gallery";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// GET /api/gallery → fetch all gallery images
export async function GET() {
  try {
    await connectDB();
    const images = await Gallery.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, images });
  } catch (err) {
    console.error("Error in GET /api/gallery:", err);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

// POST /api/gallery → upload new gallery images
export async function POST(req: Request) {
  try {
    await connectDB();
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];
    const title = String(formData.get("title") || "");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "gallery" }, (err, result) => {
            if (err || !result) return reject(err);
            resolve({ url: result.secure_url, publicId: result.public_id });
          })
          .end(buffer);
      });
    });

    const uploaded = await Promise.all(uploadPromises);

    // Save all uploaded images to MongoDB
    const docs = await Gallery.insertMany(
      uploaded.map((img) => ({
        url: img.url,
        publicId: img.publicId,
        title,
      }))
    );

    return NextResponse.json({ success: true, images: docs });
  } catch (err) {
    console.error("Error in POST /api/gallery:", err);
    return NextResponse.json({ error: "Failed to upload to gallery" }, { status: 500 });
  }
}

// DELETE /api/gallery/:id → delete image from MongoDB & Cloudinary
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { _id } = await req.json();
    if (!_id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    // Find the image doc

    const imageDoc = await Gallery.findById(_id);
    if (!imageDoc) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete from Cloudinary (using stored publicId)
    if (imageDoc.publicId) {
      await cloudinary.uploader.destroy(imageDoc.publicId);
    }

    // Delete from MongoDB
    await Gallery.findByIdAndDelete(_id);

    return NextResponse.json({ success: true, message: "Image deleted successfully" });
  } catch (err) {
    console.error("Error in DELETE /api/gallery:", err);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}