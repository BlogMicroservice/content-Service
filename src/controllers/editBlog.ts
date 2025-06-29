import prisma from '../config/prismaClient';
import { errorHandler } from '../utils/ErrorHandler';

export const editBlog = errorHandler(async (req, res) => {
  const { title, content } = req.body;
  const { postId } = req.params; // assuming postId is in route like /editBlog/:postId

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
      message: 'Invalid or missing postId',
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

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
      },
    });

    return res.status(200).json({
      status: true,
      message: 'Post updated successfully',
      post: updatedPost,
    });
  } catch (err) {
    console.error('Error updating post:', err);
    return res.status(500).json({
      status: false,
      message: 'Server error while updating post',
    });
  }
});
