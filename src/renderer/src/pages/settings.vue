<script setup lang="ts">
  import LayoutSettings from '@/layout/LayoutSettings.vue';
  import SettingsProfile from '@/components/settings/SettingsProfile.vue';
  import SettingsAccount from '@/components/settings/SettingsAccount.vue';
  import SettingsAppearance from '@/components/settings/SettingsAppearance.vue';
  import SettingsStorage from '@/components/settings/SettingsStorage.vue';
  import SettingsAiModel from '@/components/settings/SettingsAiModel.vue';
  import { useSettingsStore } from '@/stores/settings.store';
  import SettingsAdvanced from '@/components/settings/SettingsAdvanced.vue';
  import SettingsLog from '@/components/settings/SettingsLog.vue';
  import SettingsServer from '@renderer/components/settings/SettingsServer.vue';

  const settings = useSettingsStore();

  const getComponent = () => {
    return {
      profile: SettingsProfile,
      account: SettingsAccount,
      appearance: SettingsAppearance,
      model: SettingsAiModel,
      storage: SettingsStorage,
      advanced: SettingsAdvanced,
      log: SettingsLog,
      server: SettingsServer
    }[settings.activeNavPath];
  };
</script>

<template>
  <LayoutSettings>
    <component :is="getComponent()" />
  </LayoutSettings>
</template>
