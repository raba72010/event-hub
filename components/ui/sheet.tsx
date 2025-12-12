"use client"

import {
  cloneElement,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SheetContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const SheetContext = createContext<SheetContextValue | null>(null)

function useSheetContext() {
  const context = useContext(SheetContext)
  if (!context) {
    throw new Error("Sheet components must be used within <Sheet>")
  }
  return context
}

export function Sheet({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const value = useMemo(() => ({ open, setOpen }), [open])

  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>
}

interface SheetTriggerProps {
  asChild?: boolean
  className?: string
  children: ReactNode
}

export function SheetTrigger({ asChild = false, className, children }: SheetTriggerProps) {
  const { setOpen } = useSheetContext()

  const handleClick = useCallback(() => setOpen(true), [setOpen])

  if (asChild && children && typeof children === "object") {
    const element = children as ReactElement<any>
    return cloneElement(element, {
      onClick: (event: MouseEvent) => {
        element.props?.onClick?.(event)
        if (!event.defaultPrevented) handleClick()
      },
      className: cn(element.props?.className, className),
    } as any)
  }

  return createElement(
    "button",
    { type: "button", className: cn("inline-flex items-center", className), onClick: handleClick },
    children,
  )
}

interface SheetContentProps {
  children: ReactNode
  side?: "left" | "right" | "top" | "bottom"
  className?: string
}

export function SheetContent({ children, side = "right", className }: SheetContentProps) {
  const { open, setOpen } = useSheetContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, setOpen])

  if (!mounted || !open) return null

  const sideClasses: Record<string, string> = {
    right: "right-0 top-0 h-full w-80 translate-x-0",
    left: "left-0 top-0 h-full w-80 translate-x-0",
    top: "top-0 left-0 w-full max-h-[80vh]",
    bottom: "bottom-0 left-0 w-full max-h-[80vh]",
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div
        className={cn(
          "absolute flex flex-col gap-4 border border-gray-200 bg-white p-6 shadow-xl",
          "transition-transform duration-200 ease-out",
          side === "left" && "animate-in slide-in-from-left",
          side === "right" && "animate-in slide-in-from-right",
          side === "top" && "animate-in slide-in-from-top",
          side === "bottom" && "animate-in slide-in-from-bottom",
          sideClasses[side],
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Menu</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 active:scale-95"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

