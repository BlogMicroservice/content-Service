import express, { Request, Response } from 'express';
import { AI_Route } from './routes/AI-Route';
import { Blog_Route } from './routes/Blog-route';
const app = express();
app.use(express.json());
app.use("/AI",AI_Route)
app.use("/blog",Blog_Route)
app.get("/",(req:Request,res:Response)=>{
    res.json("hi from user services")
})


export default app
