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
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCustomResume } from '@/app/actions'

interface DeleteResumeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resumeId: number
  resumeTitle: string
}

export function DeleteResumeDialog({
  open,
  onOpenChange,
  resumeId,
  resumeTitle,
}: DeleteResumeDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteCustomResume(resumeId)
      if (result.success) {
        router.refresh()
        onOpenChange(false)
      } else {
        console.error('Failed to delete resume:', result.error)
      }
    } catch (error) {
      console.error('Error deleting resume:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Resume</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;
            {resumeTitle || 'Untitled Resume'}
            &quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex sm:justify-between mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Resume'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
