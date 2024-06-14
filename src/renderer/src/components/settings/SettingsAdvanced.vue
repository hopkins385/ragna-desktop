<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { Separator } from '@ui/separator';
  import { Switch } from '@/components/ui/switch';
  import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@ui/form';
  import { toast } from 'vue-sonner';
  // import useGpuHardware from '@/composables/useGpuHardware'
  import { AlertTriangleIcon } from 'lucide-vue-next';
  import { useModelStore } from '@/stores/model.store';
  import Input from '../ui/input/Input.vue';

  const gpuChecked = ref(true);
  const hasGpu = ref(true);
  const contextSize = ref(2048);
  const model = useModelStore();
  // const { getGpuInfo } = useGpuHardware()

  const handleChange = async (checked: boolean) => {
    try {
      gpuChecked.value = checked;
      await window.electron.ipcRenderer.invoke('set-gpu-acceleration-state', checked);
      const message = checked ? 'enabled' : 'disabled';
      if (model.isModelLoaded) {
        toast.info('Please restart the AI model for the changes to take effect.', {
          duration: 6000
        });
        // await server.restartModel()
      } else {
        toast.success(`GPU acceleration ${message}`);
      }
    } catch (error) {
      console.error('Error setting GPU acceleration state', error);
      toast.error('Error setting GPU acceleration state');
    }
  };

  const initAccelerationState = async () => {
    try {
      const gpuAccelerationState = await window.electron.ipcRenderer.invoke(
        'get-gpu-acceleration-state'
      );
      gpuChecked.value = gpuAccelerationState;
    } catch (error) {
      // silent discard
    }
  };

  /*const initGpuInfo = async () => {
  try {
    const gpuInfo = await getGpuInfo()
    if (gpuInfo && gpuInfo?.gpu) {
      hasGpu.value = gpuInfo.gpu.length > 0
    } else {
      hasGpu.value = false
    }
  } catch (error) {
    console.error('Error getting GPU info', error)
    hasGpu.value = false
  }
}*/

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

  watch(
    () => contextSize.value,
    async (value) => await updateContextSize(value)
  );

  onMounted(async () => {
    await initAccelerationState();
    contextSize.value = await getContextSize();
    // await initGpuInfo()
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
        <FormDescription>
          Turning on GPU acceleration allows you to generate more tokens per second.
        </FormDescription>
      </div>
      <FormControl>
        <Switch :checked="gpuChecked" @update:checked="handleChange" />
      </FormControl>
    </FormItem>
  </FormField>
  <FormField name="contextSize">
    <FormItem class="relative flex flex-row items-center justify-between rounded-lg border p-4">
      <div class="space-y-0.5">
        <FormLabel class="text-base"> LLM Context Size</FormLabel>
        <FormDescription>
          The higher the context size, the more tokens the model can process. But be careful, as
          increasing the context size can lead to a very high memory usage and potentially crash the
          app or freeze your system.
        </FormDescription>
      </div>
      <FormControl class="">
        <Input v-model="contextSize" class="ml-10 w-20" />
      </FormControl>
    </FormItem>
  </FormField>
</template>
