import { type useToast } from '@/hooks/use-toast'

interface ErrorHandlerOptions {
  toast: ReturnType<typeof useToast>['toast']
  defaultMessage?: string
  onAuthError?: () => void
}

export function createErrorHandler(options: ErrorHandlerOptions) {
  return function handleError(error: unknown) {
    const message = error instanceof Error ? error.message : options.defaultMessage || 'An error occurred'
    
    if (message === 'Invalid token' && options.onAuthError) {
      options.onAuthError()
      return
    }
    
    options.toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    })
  }
} 