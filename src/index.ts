import dotenv from "dotenv"
import OpenAI from "openai"
dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPEN_AI_SECRET_API_KEY
})

async function generateText() {

    const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_completion_tokens: 100,
        messages: [
            {
                role: "developer",
                content: "User emogis a cada 2 palavras"
            },
            {
                role: "user",
                content: "Escreva uma mensagem de uma frase sobre unicornios"
            },
            {
                role: "assistant",
                content: "//mensagem digitada pelo chat"
            },
            {
                role: "user",
                content: "Obrigado"
            },
        ]
    })

    console.log(completion.choices[0].message.content)

}

generateText()