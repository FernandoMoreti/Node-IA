import express from 'express';
import generateProducts from './openai';

const app = express()
app.use(express.json())

app.post("/generate", async (request, response) => {
    try {
        const { content } = request.body
        const products = await generateProducts(content)
        response.json(products)
    } catch (error) {
        console.error(error)
    }
})


export default app
