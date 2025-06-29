import { Request, Response } from "express";
import prisma from "../config/prismaClient";
import { errorHandler } from "../utils/ErrorHandler";

export const getUserBlog = errorHandler(async (req: Request, res: Response) => {
  const userIdRaw = req.headers['x-user-id'];
  const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  const posts = await prisma.post.findMany({
    where: { userId },
    include: {
      topics: {
        include: {
          topic: true,
        },
      },
      _count: {
        select: { likes: true },
      },
    },
  });

  const formatted = posts.map((post) => ({
    id: post.id,
    title: post.title,
    summary: post.summary,
    thumbnailUrl: post.thumbnailUrl,
    topics: post.topics.map((pt) => pt.topic.name),
    likeCount: post._count.likes,
    published:post.published
  }));

  res.json(formatted);
});
