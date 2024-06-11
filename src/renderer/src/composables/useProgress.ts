import { useModelStore } from './../stores/model.store'
import { useIndicatorStore } from './../stores/indicator.store'

export default function useProgress() {
  const indicator = useIndicatorStore()
  const model = useModelStore()
  async function runFakeProgressBar() {
    if (indicator.globalProgress > 0) {
      indicator.setGlobalProgressValue(0)
    }
    indicator.setGlobalProgressVisible(true)
    for (let i = 0; i <= 100; i++) {
      if (model.isModelLoadingInProgress === false) {
        if (i > 0) {
          indicator.setGlobalProgressValue(100)
        }
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate delay
        i = 0
        indicator.setGlobalProgressVisible(false)
        indicator.setGlobalProgressValue(0)
        return
      }
      await new Promise((resolve) => setTimeout(resolve, 10 + i * 10)) // Simulate delay
      indicator.setGlobalProgressValue(i)
    }
  }

  return {
    runFakeProgressBar
  }
}
