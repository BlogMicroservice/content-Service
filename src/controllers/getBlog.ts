import axios from 'axios';
import { URL_BASE_PRIVATE, URL_BASE_PUBLIC } from '../config/constants';
import prisma from '../config/prismaClient';
import { errorHandler } from '../utils/ErrorHandler';

export const getBlog = errorHandler(async (req, res) => {
  const postId = req.params.postId;
  const userIdRaw = req.headers['x-user-id'];
  const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;

  const post = await prisma.post.findFirst({
    where: { id: postId },
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

  if (!post) {
    return res.status(404).json({ status: false, message: "Post not found" });
  }

  // ✅ Check if current user liked this post
  let isLiked = false;
  if (userId) {
    const like = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });
    isLiked = !!like;
  }

  // ✅ Get author profile
  let profile = null;
  try {
    const profileRes = await axios.get(
      `${URL_BASE_PUBLIC}/user/profile/${post.userId}`,
      { withCredentials: true }
    );
    profile = profileRes.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
  }

  return res.status(200).json({
    status: true,
    post,
    author: profile,
    isLiked,
  });
});
