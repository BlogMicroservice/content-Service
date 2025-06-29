import { Request, Response } from "express";
import prisma from "../config/prismaClient";
import { errorHandler } from "../utils/ErrorHandler";

export const toggleLike = errorHandler(async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const userIdRaw = req.headers["x-user-id"];
  const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;

  if (!userId) {
    return res.status(401).json({ status: false, message: "User not authenticated" });
  }

  const existingLike = await prisma.postLike.findUnique({
    where: {
      postId_userId: { postId, userId },
    },
  });

  if (existingLike) {
    await prisma.postLike.delete({
      where: {
        postId_userId: { postId, userId },
      },
    });
    return res.status(200).json({ status: true, liked: false });
  } else {
    await prisma.postLike.create({
      data: {
        postId,
        userId,
      },
    });
    return res.status(200).json({ status: true, liked: true });
  }
});
