import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import prisma from '../config/prismaClient';

export const addPostImage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const file = req.file;
  const { postId, altText } = req.body;

  if (!file) {
    res.status(400).json({ error: 'No file uploaded' });
    return
  }

  try {
    const imageUrl = await new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'post-images' },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result.secure_url);
        },
      );
      stream.end(file.buffer);
    });
    console.log(imageUrl)
    const image = await prisma.postImage.create({
      data: {
        postId,
        imageUrl,
        altText,
      },
    });

    res.status(201).json({ message: 'Image uploaded', imageUrl });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
