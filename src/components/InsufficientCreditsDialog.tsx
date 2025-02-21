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

interface InsufficientCreditsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InsufficientCreditsDialog({
  open,
  onOpenChange,
}: InsufficientCreditsDialogProps) {
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
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => onOpenChange(false)}
          >
            Purchase Credits
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
