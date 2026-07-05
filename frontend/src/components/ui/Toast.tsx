import React, { createContext, useContext, useState, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  action?: { label: string; onClick: () => void }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (type: ToastType, message: string, action?: Toast['action']) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

export const useToast = () => useContext(ToastContext)

const borderColor: Record<ToastType, string> = {
  success: 'var(--status-up)',
  error: 'var(--status-down)',
  info: 'var(--accent)',
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (type: ToastType, message: string, action?: Toast['action']) => {
      const id = Date.now().toString()
      setToasts((prev) => [...prev, { id, type, message, action }])
      setTimeout(() => removeToast(id), 3000)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-slide-up flex items-center gap-3 px-4 py-3 rounded-md shadow-lg text-[13px]"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderLeft: `3px solid ${borderColor[toast.type]}`,
            }}
          >
            <span className="text-text-primary flex-1">{toast.message}</span>
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="text-accent hover:text-accent-hover font-medium text-xs whitespace-nowrap"
              >
                {toast.action.label}
              </button>
            )}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-text-faint hover:text-text-secondary ml-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
