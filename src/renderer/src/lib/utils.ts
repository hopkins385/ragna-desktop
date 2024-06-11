import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
// @ts-ignore
import { camelize, getCurrentInstance, toHandlerKey } from 'vue'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
