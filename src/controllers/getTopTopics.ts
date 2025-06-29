import prisma from "../config/prismaClient";
import { errorHandler } from "../utils/ErrorHandler";

export const getTopTopics = errorHandler(async (req, res) => {
  // Get top 5 topics used in published posts
  const topics = await prisma.postTopic.groupBy({
    by: ["topicId"],
    where: {
      post: {
        published: true,
      },
    },
    _count: {
      topicId: true,
    },
    orderBy: {
      _count: {
        topicId: "desc",
      },
    },
    take: 5,
  });

  // Fetch topic names for the top topicIds
  const topicIds = topics.map((t) => t.topicId);

  const topicDetails = await prisma.topic.findMany({
    where: { id: { in: topicIds } },
    select: {
      id: true,
      name: true,
    },
  });

  return res.status(200).json({
    status: true,
    topics: topicDetails,
  });
});
