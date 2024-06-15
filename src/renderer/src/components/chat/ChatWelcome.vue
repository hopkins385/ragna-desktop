<script setup lang="ts">
  import IconRagna from '@/assets/svg/ragna-logo-min.svg';
  import {
    BookOpenCheckIcon,
    ClipboardCheckIcon,
    ComponentIcon,
    GitForkIcon,
    LayersIcon,
    SquareArrowOutUpRightIcon,
    SquareMousePointerIcon
  } from 'lucide-vue-next';

  const emailHref = 'mailto:hello@ragna.app';
</script>

<template>
  <div class="text-primary/80 mx-auto pt-5">
    <div class="space-y-4 text-center">
      <div class="flex flex-col items-center justify-center space-y-4">
        <div class="">
          <IconRagna class="size-12" />
        </div>
        <h1 class="text-3xl font-semibold">RAGNA Desktop</h1>
      </div>
      <p class="text-xl">My Private Artificial Intelligence. 100% Private. 100% Secure.</p>
    </div>
    <div class="container mx-auto py-10 text-[#05154e]">
      <div class="mx-auto w-fit rounded-md border-0 p-5 text-sm">
        <div class="pb-10 text-center">
          <h2 class="text-2xl font-semibold">Need Help? Our Services</h2>
          <p class="pt-2">
            We offer a wide range of services to help you to leverage AI technology.
          </p>
          <p class="pt-2">We are located in Germany.</p>
        </div>
        <div class="grid gap-10 pt-5 lg:grid-cols-3">
          <div class="max-w-xs space-y-3">
            <span class="">
              <GitForkIcon class="stroke-1.5 size-10" />
            </span>
            <p class="font-bold">Process Automation Consulting</p>
            <p class="opacity-75">
              We analyse existing processes to identify areas that can be automated by AI for
              improved efficiency.
            </p>
            <span class="flex items-center space-x-1 opacity-75">
              <a class="hover:underline" :href="emailHref">More Info</a>
              <SquareArrowOutUpRightIcon class="stroke-1.5 size-3" />
            </span>
          </div>
          <div class="max-w-xs space-y-3">
            <span class="">
              <ComponentIcon class="stroke-1.5 size-10" />
            </span>
            <p class="font-bold">Design-Thinking-Workshops</p>
            <p class="opacity-75">
              Together with your team we discover innovative problem-solving options and develop AI
              powered prototypes to create new customer and employee experiences.
            </p>
            <span class="flex items-center space-x-1 opacity-75">
              <a class="hover:underline" :href="emailHref">More Info</a>
              <SquareArrowOutUpRightIcon class="stroke-1.5 size-3" />
            </span>
          </div>
          <div class="max-w-xs space-y-3">
            <span class="">
              <BookOpenCheckIcon class="stroke-1.5 size-10" />
            </span>
            <p class="font-bold">Tailored Know-How Transfer</p>
            <p class="opacity-75">
              We empower your team with the expertise and knowledge needed to leverage the new AI
              technology tailored to your business requirements.
            </p>
            <span class="flex items-center space-x-1 opacity-75">
              <a class="hover:underline" :href="emailHref">More Info</a>
              <SquareArrowOutUpRightIcon class="stroke-1.5 size-3" />
            </span>
          </div>
          <div class="max-w-xs space-y-3">
            <span class="">
              <ClipboardCheckIcon class="stroke-1.5 size-10" />
            </span>
            <p class="font-bold">Proof of Concept (PoC)</p>
            <p class="opacity-75">
              We turn your innovative ideas into tangible prototypes, demonstrating feasibility and
              unlocking new opportunities for your business.
            </p>
            <span class="flex items-center space-x-1 opacity-75">
              <a class="hover:underline" :href="emailHref">More Info</a>
              <SquareArrowOutUpRightIcon class="stroke-1.5 size-3" />
            </span>
          </div>
          <div class="max-w-xs space-y-3">
            <span class="">
              <SquareMousePointerIcon class="stroke-1.5 size-10" />
            </span>
            <p class="font-bold">Turn-Key Software Solutions</p>
            <p class="opacity-75">
              Ready-to-deploy, fully integrated software systems tailored to drive immediate
              results.
            </p>
            <span class="flex items-center space-x-1 opacity-75">
              <a class="hover:underline" :href="emailHref">More Info</a>
              <SquareArrowOutUpRightIcon class="stroke-1.5 size-3" />
            </span>
          </div>
          <div class="max-w-xs space-y-3">
            <span class="">
              <LayersIcon class="stroke-1.5 size-10" />
            </span>
            <p class="font-bold">Software Systems Engineering</p>
            <p class="opacity-75">
              We design and specify robust and scalable software solutions tailored to your unique
              requirements.
            </p>
            <span class="flex items-center space-x-1 opacity-75">
              <a class="hover:underline" :href="emailHref">More Info</a>
              <SquareArrowOutUpRightIcon class="stroke-1.5 size-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
