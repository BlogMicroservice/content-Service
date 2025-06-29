// controllers/postController.ts
import prisma from "../config/prismaClient";
import { errorHandler } from "../utils/ErrorHandler";

export const getTopPosts = errorHandler(async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    take: 20,
    orderBy: {
      likes: {
        _count: "desc",
      },
    },
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
  }));

  res.json(formatted);
});
