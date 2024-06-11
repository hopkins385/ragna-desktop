<script setup lang="ts">
import IconRagna from '@/assets/svg/ragna-logo-min.svg'
import ChatWelcomeCard from './ChatWelcomeCard.vue';
</script>

<template>
  <div class="mx-auto pt-5 text-primary/80">
    <div class="space-y-4 text-center">
      <div class="flex flex-col justify-center items-center space-y-4">
        <div class="">
          <IconRagna class="size-12" />
        </div>
        <h1 class="text-3xl font-semibold">
          RAGNA Desktop
        </h1>
      </div>
      <p class="text-xl">My Private Artificial Intelligence</p>
    </div>
    <div class="py-12">
      <ul class="flex items-center justify-center space-x-4">
        <li>
          <span class="cursor-pointer underline" @click="$router.push('models')">
            Download Free Models
          </span>
        </li>
        <li>|</li>
        <li>
          <a href="mailto:help@svenson.ai?subject=Ragna Desktop Support Request" target="_blank"
            class="cursor-pointer underline">
            Need Consulting? Get in touch with us!
          </a>
        </li>
        <li>|</li>
        <li>
          <a href="https://discord.gg/wWfU7kBRC3" target="_blank" class="cursor-pointer underline">
            Join Discord
          </a>
        </li>
      </ul>
      <div class="py-20">
        <div class="rounded-md text-sm w-fit border mx-auto p-5 max-w-lg">
          <h2 class="font-semibold">Non-Commercial License</h2>
          <p>You are using the free version of RAGNA Desktop.</p>
          <p>To unlock all features, and/or to use this software for commercial purposes,
            please consider purchasing a
            license.</p>
        </div>
      </div>
    </div>
  </div>
</template>
