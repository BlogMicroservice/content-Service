import express from "express";
import { createBlog } from "../controllers/createBlog";
import { getEditBlog } from "../controllers/getEditBlog";
import { editBlog } from "../controllers/editBlog";
import upload from "../middlewares/upload";
import { addPostImage } from "../controllers/addPostImage";
import { publishPost } from "../controllers/publishBlog";
import { getTopPosts } from "../controllers/getTopPosts";
import { getUserBlog } from "../controllers/getUserBlogs";
import { getBlog } from "../controllers/getBlog";
import { toggleLike } from "../controllers/toggleLike";
import { LandingPageBlog } from "../controllers/landingPageBlog";
import { getTopTopics } from "../controllers/getTopTopics";
import { searchPosts } from "../controllers/searchBlogs";
export const Blog_Route =express.Router()
Blog_Route.post("/createBlog",createBlog)
Blog_Route.get("/getEditBlog/:postId", getEditBlog);
Blog_Route.put('/editBlog/:postId', editBlog);
Blog_Route.post('/upload-image', upload.single('image'), addPostImage);
Blog_Route.post('/publishPost', upload.single('image'), publishPost);
Blog_Route.get("/getTopPosts", getTopPosts);
Blog_Route.get("/getUserBlog", getUserBlog);
Blog_Route.get("/getBlog/:postId", getBlog);
Blog_Route.post("/toggleLike/:postId", toggleLike);
Blog_Route.get("/LandingPageBlog", LandingPageBlog);
Blog_Route.get("/getTopic", getTopTopics);
Blog_Route.get("/searchPosts", searchPosts);