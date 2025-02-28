import Anthropic from "@anthropic-ai/sdk"

export type MindIEMessage = {
	role: "user" | "assistant"
	content: string
}

function convertToMindIEMessage(anthropicMessages: Anthropic.Messages.MessageParam): MindIEMessage[] {
	if (typeof anthropicMessages.content === "string") {
		return [
			{
				role: anthropicMessages.role,
				content: anthropicMessages.content,
			},
		]
	}

	return anthropicMessages.content.flatMap((message) => {
		// TODO 这部分处理待确定
		if (message.type === "image") {
			return {
				role: anthropicMessages.role,
				content: message.source.data,
			}
		} else if (message.type === "text") {
			return {
				role: anthropicMessages.role,
				content: message.text,
			}
		} else if (message.type === "tool_use") {
			return {
				role: anthropicMessages.role,
				content: message.name,
			}
		} else if (message.type === "tool_result") {
			if (typeof message.content === "string") {
				return {
					role: anthropicMessages.role,
					content: message.content,
				}
				// TODO message.content 为数组的处理
			} else {
				return {
					role: anthropicMessages.role,
					content: "",
				}
			}
		} else {
			return {
				role: anthropicMessages.role,
				content: "",
			}
		}
	})
}

export function convertToMindIEMessages(anthropicMessages: Anthropic.Messages.MessageParam[]): MindIEMessage[] {
	return anthropicMessages.flatMap(convertToMindIEMessage)
}
