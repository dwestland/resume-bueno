import React from 'react'
import Image from 'next/image'

export default function AboutUsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="">About Us</h1>
      <div className="max-w-3xl">
        <Image
          src="/images/organize-resume.svg"
          alt="Organize Resume"
          width={500}
          height={300}
          className="mx-auto mb-6"
        />
        <p>
          Resume Bueno helps job seekers get hired. We make strong resumes fast.
        </p>

        <h2>What We Do</h2>

        <p>
          Our AI crafts resumes that match job descriptions. This improves
          results.
        </p>

        <p>We provide:</p>
        <ul>
          <li>
            <strong>Custom Resumes</strong> – Match your skills to any job.
          </li>
          <li>
            <strong>Cover Letters</strong> – Present yourself with confidence.
          </li>
          <li>
            <strong>Job Fit Scores</strong> – See how well your resume aligns.
          </li>
          <li>
            <strong>Employer Insights</strong> – Understand what they seek.
          </li>
        </ul>

        <h2>Why It Matters</h2>

        <p>
          Good resumes open doors. Many job seekers miss out due to weak
          resumes.
        </p>
        <p>We fix that. Our tool makes every application stronger.</p>

        <h2>Join Us</h2>

        <p>Get noticed. Get hired. Start with Resume Bueno today.</p>
      </div>
    </div>
  )
}
