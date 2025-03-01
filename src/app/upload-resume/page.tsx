'use client'

import { ResumeFormContainer } from '@/components/resume/ResumeFormContainer'

export default function UploadResumePage() {
  return (
    <div className="w-full py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Upload Your Resume
      </h1>
      <ResumeFormContainer displayMode="carousel" />
    </div>
  )
}
