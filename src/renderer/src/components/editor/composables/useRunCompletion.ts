import type { Editor } from '@tiptap/vue-3'
import { getSelectionText } from './../utils/editor-utils'
// import useTurndown from '~/composables/useTurndown'
import useEditorCompletion from './useEditorCompletion'

export default function useRunCompletion() {
  // const { toMarkdown } = useTurndown()
  const { getEditorCompletion, isLoading } = useEditorCompletion()

  function runCompletion(
    editor: Editor,
    options: { lang: string; action: string; prompt: string | undefined }
  ) {
    if (!editor) return
    const { selectedText, pos } = getSelectionText(editor)

    // const markdown = toMarkdown(editor.getHTML())

    const payload = {
      lang: options.lang,
      action: options.action,
      selectedText,
      // fullText: markdown,
      prompt: options.prompt || ''
    }

    getEditorCompletion(payload)
      .then((res: any) => {
        console.log('[EditorCompletion Response] ', res)
        const tr = editor.state.tr.insertText(
          res?.choices[0].message.content || '',
          pos.from,
          pos.to
        )
        editor.view.dispatch(tr)
        editor.commands.focus()
      })
      .catch((err: any) => {
        console.log('[EditorCompletion Error] ', err)
      })
      .finally(() => {
        //
      })
  }

  return {
    isLoading,
    runCompletion
  }
}
