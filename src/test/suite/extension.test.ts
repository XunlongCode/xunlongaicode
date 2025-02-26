import * as assert from "assert"
import * as vscode from "vscode"

suite("Xunlong AI Code Extension", () => {
	test("OPENROUTER_API_KEY environment variable is set", () => {
		if (!process.env.OPENROUTER_API_KEY) {
			assert.fail("OPENROUTER_API_KEY environment variable is not set")
		}
	})

	test("Commands should be registered", async () => {
		const timeout = 10 * 1_000
		const interval = 1_000
		const startTime = Date.now()

		const expectedCommands = [
			"xunlongaicode.plusButtonClicked",
			"xunlongaicode.mcpButtonClicked",
			"xunlongaicode.historyButtonClicked",
			"xunlongaicode.popoutButtonClicked",
			"xunlongaicode.settingsButtonClicked",
			"xunlongaicode.openInNewTab",
			"xunlongaicode.explainCode",
			"xunlongaicode.fixCode",
			"xunlongaicode.improveCode",
		]

		while (Date.now() - startTime < timeout) {
			const commands = await vscode.commands.getCommands(true)
			const missingCommands = []

			for (const cmd of expectedCommands) {
				if (!commands.includes(cmd)) {
					missingCommands.push(cmd)
				}
			}

			if (missingCommands.length === 0) {
				break
			}

			await new Promise((resolve) => setTimeout(resolve, interval))
		}

		const commands = await vscode.commands.getCommands(true)

		for (const cmd of expectedCommands) {
			assert.ok(commands.includes(cmd), `Command ${cmd} should be registered`)
		}
	})
})
