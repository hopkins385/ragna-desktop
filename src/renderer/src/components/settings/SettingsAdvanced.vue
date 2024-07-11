<script setup lang="ts">
  import { ref, onMounted, watch, onBeforeMount } from 'vue';
  import { Separator } from '@ui/separator';
  import { Switch } from '@/components/ui/switch';
  import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@ui/form';
  import { toast } from 'vue-sonner';
  // import useGpuHardware from '@/composables/useGpuHardware'
  import { AlertTriangleIcon } from 'lucide-vue-next';
  import { useModelStore } from '@/stores/model.store';
  import Input from '../ui/input/Input.vue';

  const gpuAcceleration = ref(false);
  const hasGpu = ref(true);
  const contextSize = ref('auto');
  const useMlock = ref(false);
  const flashAttention = ref(false);
  const model = useModelStore();
  // const { getGpuInfo } = useGpuHardware()

  const handleGpuAccelerationChange = async (checked: boolean) => {
    try {
      gpuAcceleration.value = checked;
      const value = checked ? -1 : 0;
      await window.electron.ipcRenderer.invoke('set-llm-gpu-layers', value);
      const message = checked ? 'enabled' : 'disabled';
      if (model.isModelLoaded) {
        toast.info('Please restart the AI model for the changes to take effect.', {
          duration: 6000
        });
      } else {
        toast.success(`GPU acceleration ${message}`);
      }
    } catch (error) {
      console.error('Error setting GPU acceleration state', error);
      toast.error('Error setting GPU acceleration state');
    }
  };

  async function getGpuAccelerationState() {
    try {
      const llmGpuLayers = await window.electron.ipcRenderer.invoke('get-llm-gpu-layers');
      if (llmGpuLayers === -1) return true;
      return false;
    } catch (error) {
      console.error('Error getting GPU acceleration state', error);
      return false;
    }
  }

  async function handleUseMlockChange(checked: boolean) {
    try {
      useMlock.value = checked;
      await setUseMlock(checked);
      const message = checked ? 'enabled' : 'disabled';
      if (model.isModelLoaded) {
        toast.info('Please restart the AI model for the changes to take effect.', {
          duration: 6000
        });
      } else {
        toast.success(`Keep LLM in memory ${message}`);
      }
    } catch (error) {
      console.error('Error setting use mlock', error);
      toast.error('Error setting use mlock');
    }
  }

  async function handleFlashAttentionChange(checked: boolean) {
    try {
      flashAttention.value = checked;
      await window.electron.ipcRenderer.invoke('set-llm-flash-attention', checked);
      const message = checked ? 'enabled' : 'disabled';
      if (model.isModelLoaded) {
        toast.info('Please restart the AI model for the changes to take effect.', {
          duration: 6000
        });
      } else {
        toast.success(`Flash attention ${message}`);
      }
    } catch (error) {
      console.error('Error setting flash attention', error);
      toast.error('Error setting flash attention');
    }
  }

  async function getFlashAttention() {
    try {
      const flashAttention = await window.electron.ipcRenderer.invoke('get-llm-flash-attention');
      return flashAttention;
    } catch (error) {
      console.error('Error getting flash attention', error);
      return false;
    }
  }

  async function getUseMlock() {
    try {
      const useMlock = await window.electron.ipcRenderer.invoke('get-llm-use-mlock');
      return useMlock;
    } catch (error) {
      console.error('Error getting use mlock', error);
      return false;
    }
  }

  async function setUseMlock(value: boolean) {
    try {
      await window.electron.ipcRenderer.invoke('set-llm-use-mlock', value);
    } catch (error) {
      console.error('Error setting use mlock', error);
      toast.error('Error setting use mlock');
    }
  }

  async function getContextSize() {
    try {
      const contextSize = await window.electron.ipcRenderer.invoke('get-llm-context-size');
      return contextSize;
    } catch (error) {
      console.error('Error getting context size', error);
      return 2048;
    }
  }

  async function updateContextSize(value: number) {
    // check if value is number
    if (isNaN(Number(value)) || value < 0) {
      return;
    }
    try {
      await window.electron.ipcRenderer.invoke('set-llm-context-size', value);
    } catch (error) {
      console.error('Error setting context size', error);
      toast.error('Error setting context size');
    }
  }

  // watch(
  //   () => contextSize.value,
  //   async (value) => await updateContextSize(value)
  // );

  async function initValues() {
    const gpuAcc = getGpuAccelerationState();
    const mlock = getUseMlock();
    const flashAtt = getFlashAttention();

    const res = await Promise.all([gpuAcc, mlock, flashAtt]);
    gpuAcceleration.value = res[0];
    useMlock.value = res[1];
    flashAttention.value = res[2];
  }

  onBeforeMount(async () => {
    await initValues();
  });
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">Advanced</h3>
    <p class="text-muted-foreground text-sm">
      Update your advanced settings. Set your preferred GPU acceleration.
    </p>
  </div>
  <Separator />
  <FormField name="gpu">
    <FormItem class="relative flex flex-row items-center justify-between rounded-lg border p-4">
      <div
        v-if="!hasGpu"
        class="absolute -top-3 right-5 flex items-center justify-end rounded-lg border bg-white px-3 py-1 text-xs"
      >
        <AlertTriangleIcon class="text-destructive mr-2 size-4" />
        <span>Warning - No GPU detected</span>
      </div>
      <div class="space-y-0.5">
        <FormLabel class="text-base"> GPU Acceleration </FormLabel>
        <FormDescription class="pr-10">
          Turning on GPU acceleration allows you to generate more tokens per second. For Windows, we
          recommend to only turn this on if you have a dedicated GPU with at least 8GB of VRAM. For
          Mac M1 or newer, this feature is enabled by default. Turn this off if you are experiencing
          issues.
        </FormDescription>
      </div>
      <FormControl>
        <Switch :checked="gpuAcceleration" @update:checked="handleGpuAccelerationChange" />
      </FormControl>
    </FormItem>
  </FormField>
  <FormField name="useMlock">
    <FormItem class="relative flex flex-row items-center justify-between rounded-lg border p-4">
      <div class="space-y-0.5">
        <FormLabel class="text-base"> Keep LLM in Memory </FormLabel>
        <FormDescription class="pr-10">
          Keeps the model in memory even if not used. This can speed up subsequent generations and
          responses by the AI. We recommend to turn this off if you have a low amount of RAM or if
          you are only using the AI occasionally.
        </FormDescription>
      </div>
      <FormControl>
        <Switch :checked="useMlock" @update:checked="handleUseMlockChange" />
      </FormControl>
    </FormItem>
  </FormField>
  <FormField name="flashAttention">
    <FormItem class="relative flex flex-row items-center justify-between rounded-lg border p-4">
      <div class="space-y-0.5">
        <FormLabel class="text-base"> Flash Attention (Experimental) </FormLabel>
        <FormDescription class="pr-10">
          Flash attention is an optimization in the attention mechanism that makes inference faster,
          more efficient and uses less memory. The support for flash attention is currently
          experimental and may not always work as expected. Use with caution. This option will be
          ignored if flash attention is not supported by the model.
        </FormDescription>
      </div>
      <FormControl>
        <Switch :checked="flashAttention" @update:checked="handleFlashAttentionChange" />
      </FormControl>
    </FormItem>
  </FormField>
  <FormField name="contextSize">
    <FormItem class="relative flex flex-row items-center justify-between rounded-lg border p-4">
      <div class="space-y-0.5">
        <FormLabel class="text-base"> LLM Context Size </FormLabel>
        <FormDescription class="pr-10">
          The higher the context size, the more tokens the model can process. <br />Auto: Adapt to
          the current available VRAM and attempt to set the context size as high as possible up to
          the size the model was trained on.
        </FormDescription>
      </div>
      <FormControl class="">
        <!--  -->
        <Input v-model="contextSize" :disabled="true" class="w-20 text-right" />
      </FormControl>
    </FormItem>
  </FormField>
</template>
