<script setup lang="ts">
  import { ref } from 'vue';
  import { ExternalLinkIcon } from 'lucide-vue-next';
  import LayoutDefault from '@/layout/LayoutDefault.vue';

  const version = ref<string>('');

  const getAppVersion = async () => {
    version.value = await window.electron.ipcRenderer.invoke('get-app-version');
  };

  getAppVersion();
</script>

<template>
  <LayoutDefault>
    <div class="h-10" />
    <div class="rounded-2xl border p-10">
      <h1 class="text-xl font-semibold"><span class="tracking-wide">RAGNA</span> Desktop App</h1>
      <p class="pt-1 text-sm text-slate-500">
        Copyright &copy; 2024 Sven Stadhouders. All rights reserved.
      </p>
      <div class="space-y-10 pt-10">
        <div>
          <p class="font-semibold">Contact</p>
          <p class="pt-1 text-sm">info@ragna.app</p>
        </div>
        <div>
          <p class="font-semibold">Join our Discord Community</p>
          <a
            href="https://discord.gg/wWfU7kBRC3"
            target="_blank"
            class="flex items-center pt-1 text-sm text-blue-800 hover:underline"
          >
            Join Discord Community
            <ExternalLinkIcon class="stroke-1.5 ml-1 size-3" />
          </a>
        </div>
        <div class="w-fit">
          <p class="font-semibold">Terms and conditions</p>
          <a
            href="https://ragna.app/terms"
            target="_blank"
            class="flex items-center pt-1 text-sm text-blue-800 hover:underline"
          >
            Terms and conditions
            <ExternalLinkIcon class="stroke-1.5 ml-1 size-3" />
          </a>
        </div>
        <div>
          <p class="font-semibold">Privacy</p>
          <div>
            <p class="pt-1 text-sm">This app does not collect data.</p>
            <ul class="hidden list-disc pl-5 pt-1 text-sm">
              <li>Anonymous usage statistics</li>
              <li>Crash reports</li>
            </ul>
          </div>
        </div>
        <div>
          <p class="font-semibold">License</p>
          <p class="pt-1 text-sm">
            Non Commercial License.<br />Only for private or educational use.
          </p>
        </div>
        <div>
          <p class="font-semibold">Version</p>
          <p class="pt-1 text-sm">
            {{ version }}
          </p>
        </div>
      </div>
    </div>
  </LayoutDefault>
</template>
