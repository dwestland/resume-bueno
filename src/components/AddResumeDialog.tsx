'use client'

import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AddResumeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddResumeDialog({ open, onOpenChange }: AddResumeDialogProps) {
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
            <Link href="/resume/add" onClick={() => onOpenChange(false)}>
              Add Your Resume
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
