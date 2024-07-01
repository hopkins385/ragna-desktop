import { ref } from 'vue';

export default function useHostFiles() {
  const fileDialogIsLoading = ref(false);

  async function openFileDialog() {
    fileDialogIsLoading.value = true;

    // Open file dialog
    const path = await window.electron.ipcRenderer.invoke('open-file-dialog');

    fileDialogIsLoading.value = false;

    return path;
  }

  return {
    fileDialogIsLoading,
    openFileDialog
  };
}
