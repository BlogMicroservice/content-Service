// controllers/blogAIController.ts
import { Request, Response } from 'express';
import axios from 'axios';
import { errorHandler } from '../utils/ErrorHandler';
import dotenv from 'dotenv';
import { load } from 'cheerio';

dotenv.config();




export const generateTextFromPrompt = errorHandler(
  async (req: Request, res: Response) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res
        .status(400)
        .json({ success: false, message: 'Prompt is required' });
    }
    const formattedPrompt = `${prompt}

Write the blog in raw HTML format only.

Use only these tags: <h1>, <h2>, <p>, <span>, <ul>, <ol>, <li>.

⚠️ Do NOT include: <section>, <footer>, <script>, <style>, or any unsupported tags.

❗ Return only a single valid HTML block. No markdown, no JSON, no explanations.

Example:
<h1>Blog Title</h1>
<p>This is an introductory paragraph.</p>
<ul>
  <li>First tip</li>
  <li>Second tip</li>
</ul>`;

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'mistralai/mistral-7b-instruct',
          messages: [
            {
              role: 'system',
              content:
                'You are a blog writing assistant. Return only raw HTML using simple semantic tags. Do not return JSON, markdown, code blocks, or any extra explanations. Only return valid HTML using: <h1>, <h2>, <p>, <span>, <ul>, <ol>, <li>. Do NOT use <section>, <footer>, or other tags. The output must be valid and easy to parse as HTML.',
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
      

      res.status(200).json({aiContent:response.data.choices[0].message.content});
    } catch (error: any) {
      console.error(
        'OpenRouter error:',
        error?.response?.data || error.message,
      );
      res
        .status(500)
        .json({ success: false, message: 'Failed to generate blog content' });
    }
  },
);
