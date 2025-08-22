import mongoose, { Schema, Model } from "mongoose";

export interface IPost {
  title: string;
  description: string;
  date: string;        // keep as string to match your UI, or change to Date
  images: string[];    // Cloudinary URLs
  createdAt?: Date;
  updatedAt?: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Prevent model overwrite in dev/hot-reload
export const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
