import '@logseq/libs'
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin';
import { evalExpression } from '@hkh12/node-calc'

const settingsSchema: SettingSchemaDesc[] = [
  {
    key: "calculatorShortcut",
    type: "string",
    default: "ctrl+enter",
    title: "Shortcut",
    description: "Keyboard shortcut to call Calculator",
  },
]

async function settings_are_valid() {
  const shortcut = logseq.settings!["calculatorShortcut"]
  if (!shortcut) {
    console.error("Keyboard shortcut not configured for Calculator.")
    logseq.UI.showMsg(
      "Please configure a keyboard shortcut for Calculator.",
      "error"
    )
    return false
  }
  return true
}

async function main() {
  logseq.useSettingsSchema(settingsSchema)
  if (!await settings_are_valid()) {
    console.error("Calculator settings are invalid, exiting.")
    return
  }

  const shortcut = logseq.settings!["calculatorShortcut"]

  logseq.App.registerCommandShortcut({
    binding: shortcut,
    mode: "global"
  },
    async () => {
      const current_block = await logseq.Editor.getCurrentBlock()
      const input = await logseq.Editor.getEditingBlockContent()

      if (input) {
        // console.log("Evaluating input: ", input)
        try {
          const result = evalExpression(input)
          logseq.Editor.insertBlock(current_block!.uuid, `${result}`, { sibling: false })
          logseq.Editor.insertBlock(current_block!.uuid, "", { sibling: true })
        } catch (e) {
          logseq.UI.showMsg(`Error: ${e}`, "error")
        }
      }
      else {
        console.log("Calculator: No input, skipping...")
      }
    }
  )

  console.log('Calculator: ready.')
}

logseq.ready(main).catch(console.error)
