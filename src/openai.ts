import OpenAI from 'openai';
import dotenv from "dotenv"
dotenv.config();
import { z } from "zod"
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import { produtosEmEstoque, produtosQuaseSemEstoque } from './database';
import { produtosSemEstoque } from './database';
import { property } from 'zod/v4';
import { Completions } from 'openai/resources';

const client = new OpenAI({
    apiKey: process.env.OPEN_AI_SECRET_API_KEY
})

const schema = z.object({
    produtos: z.array(z.string())
})

async function generateProducts(content: string) {
    const completion = await client.chat.completions.parse({
        model: "gpt-4o-mini",
        max_completion_tokens: 100,
        response_format: zodResponseFormat(schema, "produtos_shema"),
        tools: [
            {
                type: "function",
                function: {
                    name: "produtosEmEstoque",
                    description: "Lista produtos que estão em estoque",
                    parameters: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                    },
                    strict: true,
                }
            },
            {
                type: "function",
                function: {
                    name:"produtosSemEstoque",
                    description: "Lista produtos que estão em falta",
                    parameters: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                    },
                    strict: true,
                }
            },
            {
                type: "function",
                function: {
                    name: "produtosQuaseSemEstoque",
                    description: "Lista produtos que tão com estoque baixo",
                    parameters: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                    },
                    strict: true,
                }
            }
        ],
        messages: [
            {
                role: "developer",
                content: "Liste três produtos que atendam a necessidade do usuario. Considere somente os produtos em estoque}"
            },
            {
                role: "user",
                content: content
            },
        ]
    })

    if (completion.choices[0].message.refusal) {
        throw new Error("Refusal")
    }

    const { tool_calls } = completion.choices[0].message
    if (tool_calls) {
        const [tool_call] = tool_calls
        const toolsMap = {
            produtosEmEstoque: produtosEmEstoque,
            produtosSemEstoque: produtosSemEstoque,
            produtosQuaseSemEstoque: produtosQuaseSemEstoque
        }
        const functionToCall = toolsMap[tool_call.function.name]
        if (!functionToCall) {
            throw new Error("Function not found")
        }
        const result = functionToCall()
    }

    console.log(completion.choices[0].message.tool_calls)

    return (completion.choices[0].message.parsed?.produtos)
}

export default generateProducts