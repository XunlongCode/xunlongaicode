import { Anthropic } from "@anthropic-ai/sdk"
import OpenAI from "openai"
import { ApiHandler } from "../"
import { ApiHandlerOptions, mindIEModelInfoSaneDefaults, ModelInfo } from "../../shared/api"
import { ApiStream } from "../transform/stream"
import { ChatCompletionCreateParamsStreaming } from "openai/resources/index.mjs"
import { convertToMindIEMessages } from "../transform/mindie-format"
import axios from "axios"

export class MindieHandler implements ApiHandler {
	private options: ApiHandlerOptions
	private client: OpenAI

	constructor(options: ApiHandlerOptions) {
		this.options = options
		this.client = new OpenAI({
			baseURL: (this.options.mindIEBaseUrl || "http://localhost:1025") + "/v1",
			apiKey: "mindie",
		})
	}

	async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		console.log("mindie createMessage")
		console.log(this.options)

		const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
			// TODO 测试模型不支持很长的prompt，先临时改成hi
			{ role: "system", content: "hi" },
			...convertToMindIEMessages(messages),
		]

		const body: ChatCompletionCreateParamsStreaming = {
			model: this.getModel().id,
			messages: openAiMessages,
			temperature: this.options.modelTemperature ?? 0,
			stream: true,
		}

		console.log(body)
		console.log(this.client)

		const stream = await this.client.chat.completions.create(body)
		for await (const chunk of stream) {
			const delta = chunk.choices[0]?.delta
			if (delta?.content) {
				yield {
					type: "text",
					text: delta.content,
				}
			}
		}
	}

	getModel(): { id: string; info: ModelInfo } {
		return {
			id: this.options.mindIEModelId || "",
			info: mindIEModelInfoSaneDefaults,
		}
	}
}

// mindIE
export async function getMindieModels(baseUrl?: string) {
	try {
		if (!baseUrl) {
			baseUrl = "http://localhost:1025"
		}
		if (!URL.canParse(baseUrl)) {
			return []
		}
		const response = await axios.get(`${baseUrl}/v1/models`)
		const modelsArray = response.data?.data?.map((model: any) => model.id) || []
		const models = [...new Set<string>(modelsArray)]
		return models
	} catch (error) {
		return []
	}
}
