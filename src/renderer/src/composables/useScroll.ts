import { nextTick } from 'vue'

export default function useScroll() {
  function scrollToBottom(
    el: HTMLElement | null,
    options: { behavior: ScrollBehavior } = { behavior: 'smooth' }
  ) {
    if (!el) return
    nextTick(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: options.behavior
      })
    })
  }

  return {
    scrollToBottom
  }
}
