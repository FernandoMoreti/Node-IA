import express from 'express';
import OpenAI from 'openai';
import dotenv from "dotenv"
dotenv.config();
import { z } from "zod"
import { zodResponseFormat } from 'openai/helpers/zod.mjs';


const app = express()
const client = new OpenAI({
    apiKey: process.env.OPEN_AI_SECRET_API_KEY
})
app.use(express.json())

const schema = z.object({
    produtos: z.array(z.string())
})

app.post("/generate", async (request, response) => {

    const { content } = request.body
    
    try {

        const completion = await client.chat.completions.parse({
            model: "gpt-4o-mini",
            max_completion_tokens: 100,
            response_format: zodResponseFormat(schema, "produtos_shema"),
            messages: [
                {
                    role: "developer",
                    content: "Liste três produtos que atendam a necessidade do usuario. Responda em JSON no formato { produtos: stroing[] }"
                },
                {
                    role: "user",
                    content: content
                },
            ]
        })

        response.json(completion.choices[0].message.parsed?.produtos)

    } catch(error) {
        response.json({ error: error })
    }
})


export default app