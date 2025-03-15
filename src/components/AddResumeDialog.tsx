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

interface AddResumeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddResumeDialog({ open, onOpenChange }: AddResumeDialogProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (open && buttonRef.current) {
      buttonRef.current.focus()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-4xl text-center">
            Get Started
          </DialogTitle>
          <DialogDescription className="text-lg text-center">
            To get started, upload your resume
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center mt-4">
          <Button asChild>
            <button
              ref={buttonRef}
              onClick={() => {
                onOpenChange(false)
                // Optionally, navigate to the add resume page here
                window.location.href = '/resume/add'
              }}
              autoFocus
            >
              Add Your Resume
            </button>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
