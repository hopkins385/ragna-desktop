<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { Button } from '@ui/button';
  import Input from '@renderer/components/ui/input/Input.vue';
  import LayoutDefault from '@renderer/layout/LayoutDefault.vue';
  import HeadingTitle from '@renderer/components/heading/HeadingTitle.vue';
  import useDocuments from '@renderer/composables/useDocuments';
  import DocumentTable from '@renderer/components/document/DocumentTable.vue';
  import useToast from '@renderer/composables/useToast';

  const content = ref('');
  const input = ref('');
  const isLoading = ref(false);

  const toast = useToast();

  const documents = ref([]);
  const { getAllDocuments, deleteDocument } = useDocuments();

  function refreshDocuments() {
    getAllDocuments()
      .then((data) => {
        documents.value = data;
      })
      .catch((error) => {
        console.error(error);
        toast.error({ message: 'Failed to refresh documents' });
      });
  }

  async function onDeleteDocument(id: string) {
    await deleteDocument(id);
    refreshDocuments();
    toast.success({ message: 'Document deleted' });
  }

  async function openFileDialog() {
    content.value = '';
    isLoading.value = true;
    let path;

    // Open file dialog
    try {
      path = await window.electron.ipcRenderer.invoke('open-file-dialog');
    } catch (error) {
      console.error(error);
      toast.error({ message: 'Failed to open file' });
    }

    if (!path) {
      isLoading.value = false;
      return;
    }

    // Embed file to vector database
    try {
      await embedFile(path);
    } catch (error) {
      console.error(error);
      toast.error({ message: `Failed to embed file. Is the model loaded?` });
    }

    isLoading.value = false;
  }

  async function readFile(path: string) {
    const fileContents = await window.electron.ipcRenderer.invoke('read-file', path);
    content.value = fileContents;
  }

  async function embedFile(path: string) {
    const result = await window.electron.ipcRenderer.invoke('embed-file', path);
    refreshDocuments();
  }

  async function deleteAllEmbeddings() {
    isLoading.value = true;
    const result = await window.electron.ipcRenderer.invoke('delete-all-embeddings');
    isLoading.value = false;
  }

  async function onSubmit() {
    isLoading.value = true;
    const query = input.value;
    const result = await window.electron.ipcRenderer.invoke('semantic-search', { query });
    content.value = JSON.stringify(result, null, 2);
    isLoading.value = false;
  }

  onMounted(() => {
    refreshDocuments();
  });
</script>

<template>
  <LayoutDefault class="no-scrollbar overflow-x-auto">
    <HeadingTitle title="Files" />

    <div class="">
      <div class="flex w-fit flex-col space-y-4">
        <Button @click="openFileDialog">Open File</Button>
        <Button @click="deleteAllEmbeddings">Delete All Embeddings</Button>
      </div>
      <div>
        <div v-if="isLoading">Loading...</div>
      </div>
      <div>
        <pre>{{ content }}</pre>
      </div>
      <div class="max-w-sm px-2 py-5">
        <Input v-model="input" type="text" />
        <Button @click="() => onSubmit()">Submit</Button>
      </div>
    </div>
    <div class="rounded-xl border p-5">
      <DocumentTable :documents="documents" @delete="(id) => onDeleteDocument(id)" @open="" />
    </div>
  </LayoutDefault>
</template>
