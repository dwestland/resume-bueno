'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useEffect, useRef } from 'react'

interface InsufficientCreditsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InsufficientCreditsDialog({
  open,
  onOpenChange,
}: InsufficientCreditsDialogProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (open && buttonRef.current) {
      buttonRef.current.focus()
    }
  }, [open])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insufficient Credits</DialogTitle>
          <DialogDescription>
            You don&apos;t have enough credits to generate a custom resume.
            Please purchase more credits to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button asChild>
            <button
              ref={buttonRef}
              onClick={() => {
                onOpenChange(false)
                // Optionally, navigate to the add resume page here
                window.location.href = '/'
              }}
              autoFocus
            >
              Purchase Credits
            </button>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
