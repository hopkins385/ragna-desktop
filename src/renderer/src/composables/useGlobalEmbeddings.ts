import { createSharedComposable } from '@vueuse/core';
import useEmbeddings from './useEmbeddings';

export const useGlobalEmbeddings = createSharedComposable(useEmbeddings);
