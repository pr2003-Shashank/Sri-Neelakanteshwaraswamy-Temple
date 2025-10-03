import mongoose, { Schema, Model } from "mongoose";

export interface IGallery {
  url: string;       // Cloudinary URL
  publicId: string;  // Cloudinary public_id for deletion if needed
  title?: string;    // optional: caption/title
  createdAt?: Date;
  updatedAt?: Date;
}

const GallerySchema = new Schema<IGallery>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    title: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Gallery: Model<IGallery> =
  mongoose.models.Gallery || mongoose.model<IGallery>("Gallery", GallerySchema);
