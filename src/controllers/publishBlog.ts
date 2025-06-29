import cloudinary from "../config/cloudinary";
import prisma from "../config/prismaClient";
import { errorHandler } from "../utils/ErrorHandler";
import { Request } from "express";
import { Readable } from "stream";

export const publishPost = errorHandler(async (req: Request, res) => {
  const userIdRaw = req.headers["x-user-id"];
  const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;

  const { postId, title, summary, topics } = req.body;
  const topicList: string[] = JSON.parse(topics); // frontend sends topics as JSON string

  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "Image file is required." });
  }

  const imageUrl = await uploadToCloudinary(file.buffer, file.originalname);

  // Store or connect topics
  const topicRecords = await Promise.all(
    topicList.map(async (name) => {
      return prisma.topic.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    })
  );

  // Update Post as published
  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      summary,
      thumbnailUrl: imageUrl,
      published: true,
      topics: {
        deleteMany: {}, // remove previous topics if any
        create: topicRecords.map((topic) => ({
          topicId: topic.id,
        })),
      },
    },
  });

  res.json({ success: true, post: updatedPost });
});

// Helper: Upload image to Cloudinary from buffer
function uploadToCloudinary(buffer: Buffer, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "post-images",
        public_id: filename.split(".")[0], // optional clean name
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );

    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
}
