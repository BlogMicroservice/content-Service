import prisma from "../config/prismaClient";
import axios from "axios";
import { URL_BASE_PUBLIC } from "../config/constants";
import { errorHandler } from "../utils/ErrorHandler";

export const searchPosts = errorHandler(async (req, res) => {
  const search = (req.query.search as string) || "";
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const where: any = {
    published: true,
  };

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        summary: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        topics: {
          some: {
            topic: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      },
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  const enrichedPosts = await Promise.all(
    posts.map(async (post) => {
      let author = null;
      try {
        const res = await axios.get(`${URL_BASE_PUBLIC}/user/profile/${post.userId}`, {
          withCredentials: true,
        });
        author = res.data?.data || null;
      } catch (err) {
        console.error("Error fetching author", err);
      }

      return {
        ...post,
        author,
      };
    })
  );

  return res.status(200).json({
    status: true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    posts: enrichedPosts,
  });
});
