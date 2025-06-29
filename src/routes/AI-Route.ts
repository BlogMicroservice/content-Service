import express from "express";
import { generateTextFromPrompt } from "../controllers/generateTextFromPrompt";
import { generateSummary } from "../controllers/generateSummary";

export const AI_Route =express.Router()
AI_Route.post("/generateTextFromPrompt",generateTextFromPrompt)
AI_Route.post("/generateSummary",generateSummary)