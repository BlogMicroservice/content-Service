import prisma from '../config/prismaClient';
import { errorHandler } from '../utils/ErrorHandler';

export const createBlog = errorHandler(async (req, res) => {
  const { title } = req.body;
  const userIdRaw = req.headers['x-user-id'];
  const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;
  if (!userId) {
    return res
      .status(400)
      .json({ status: false, message: 'User ID is required' });
  }

  if (!title || typeof title !== 'string') {
    return res
      .status(400)
      .json({
        status: false,
        message: 'Title is required and must be a string',
      });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        userId: userId,
        content: '', // placeholder content
        published:false
      },
    });

    res.status(201).json({
      status: true,
      message: 'Post created successfully',
      post: newPost,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: false, message: 'Server error while creating post' });
  }
});

// {
//     "id": "6a30da16-0588-4fec-9de5-a532cc04dbf1",
//     "userId": "1174e01b-4c08-4dba-bb5f-262973508553",
//     "title": "Why JS is Best",
//     "summary": null,
//     "content": "",
//     "thumbnailUrl": null,
//     "createdAt": "2025-06-27T17:40:13.701Z",
//     "updatedAt": "2025-06-27T17:40:13.701Z"
// }
