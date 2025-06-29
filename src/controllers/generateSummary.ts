// controllers/blogAIController.ts
import { Request, Response } from 'express';
import axios from 'axios';
import { errorHandler } from '../utils/ErrorHandler';
import dotenv from 'dotenv';
import { load } from 'cheerio';

dotenv.config();

export const generateSummary = errorHandler(
  async (req: Request, res: Response) => {
    const { content } = req.body; // content is HTML

    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: 'content is required' });
    }

    // Extract plain text from HTML using Cheerio
    const $ = load(content);
    const plainText = $.text().trim();

    // Prompt contains only plain text — no HTML examples
    const formattedPrompt = `Summarize the following blog content in simple.

Content:
"${plainText}"

Instructions:
in 20 -30 words`;

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'mistralai/mistral-7b-instruct',
          messages: [
            {
              role: 'system',
              content:
                'You are a blog writing assistant. Summarize the blog',
            },
            {
              role: 'user',
              content: formattedPrompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      res
        .status(200)
        .json({ summary: response.data.choices[0].message.content });
    } catch (error: any) {
      console.error(
        'OpenRouter error:',
        error?.response?.data || error.message,
      );
      res
        .status(500)
        .json({ success: false, message: 'Failed to generate blog summary' });
    }
  },
);
