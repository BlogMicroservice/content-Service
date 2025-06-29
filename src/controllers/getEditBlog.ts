import prisma from '../config/prismaClient';
import { errorHandler } from '../utils/ErrorHandler';

export const getEditBlog = errorHandler(async (req, res) => {
  const postId = req.params.postId;
  const userIdRaw = req.headers['x-user-id'];
  const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;

  if (!userId || typeof userId !== 'string') {
    return res.status(401).json({
      status: false,
      message: 'Unauthorized: User ID missing or invalid in header',
    });
  }

  if (!postId || typeof postId !== 'string') {
    return res.status(400).json({
      status: false,
      message: 'Bad request: Invalid or missing postId',
    });
  }

  try {
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        userId,
      },
    });

    if (!post) {
      return res.status(404).json({
        status: false,
        message: 'Post not found or access denied',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Post fetched successfully',
      post,
    });
  } catch (err) {
    console.error('Error fetching post:', err);
    return res.status(500).json({
      status: false,
      message: 'Server error while fetching post',
    });
  }
});
