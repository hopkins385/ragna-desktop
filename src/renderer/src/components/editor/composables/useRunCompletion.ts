import type { Editor } from '@tiptap/vue-3';
import { getSelectionText } from './../utils/editor-utils';
import useEditorCompletion from './useEditorCompletion';
import useToast from '@renderer/composables/useToast';

export default function useRunCompletion() {
  const { getEditorCompletion, isLoading } = useEditorCompletion();
  const toast = useToast();

  function runCompletion(
    editor: Editor,
    options: { lang: string; action: string; prompt: string | undefined }
  ) {
    if (!editor) return;
    const { selectedText, pos } = getSelectionText(editor);

    if (!selectedText) {
      toast.info({ message: 'Please select some text.' });
      return;
    }

    const payload = {
      lang: options.lang,
      action: options.action,
      selectedText,
      prompt: options.prompt || '',
      fullText: undefined // currently not used
    };

    getEditorCompletion(payload)
      .then((res: any) => {
        const tr = editor.state.tr.insertText(res || '', pos.from, pos.to);
        editor.view.dispatch(tr);
        editor.commands.focus();
      })
      .catch((err: any) => {
        console.error('[EditorCompletion Error] ', err);
        toast.error({ message: 'Ups! Something went wrong. Please try again.' });
      })
      .finally(() => {
        //
      });
  }

  return {
    isLoading,
    runCompletion
  };
}
