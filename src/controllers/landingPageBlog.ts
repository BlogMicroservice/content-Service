import axios from 'axios';
import { URL_BASE_PUBLIC } from '../config/constants';
import prisma from '../config/prismaClient';
import { errorHandler } from '../utils/ErrorHandler';

export const LandingPageBlog = errorHandler(async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
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

  if (!posts || posts.length === 0) {
    return res.status(404).json({ status: false, message: 'No posts found' });
  }

  const postsWithAuthor = await Promise.all(
    posts.map(async (post) => {
      let author = null;
      try {
        const profileRes = await axios.get(
          `${URL_BASE_PUBLIC}/user/profile/${post.userId}`,
          { withCredentials: true }
        );
        author = profileRes.data?.data || null;
      } catch (error) {
        console.error(`Error fetching profile for user ${post.userId}:`, error);
      }

      return {
        ...post,
        author,
      };
    })
  );

  return res.status(200).json({
    status: true,
    posts: postsWithAuthor,
  });
});
