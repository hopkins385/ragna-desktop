import { toast } from 'vue-sonner'

interface IToast {
  message: string
}

export default function useToast() {
  function success(payload: IToast) {
    toast.success('Success', {
      description: payload.message,
      duration: 3000
    })
  }

  function error(payload: IToast) {
    toast.error('Error', {
      description: payload.message,
      duration: 10000
    })
  }

  return {
    success,
    error
  }
}
