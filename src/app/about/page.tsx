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
        <h2>Built for Job Seekers. Powered by Bueno Vibes.</h2>

        <p>
          Let’s be real, writing resumes kinda sucks. You stare at a blank page,
          try to sound impressive, and then wonder if it’ll even get past the
          robots. That’s where we come in.
        </p>

        <p>
          <strong>Resume Bueno</strong> is your secret weapon for job hunting.
          We take your existing resume, pair it with the job description you’re
          chasing, and boom, out comes a custom-crafted resume that speaks the
          language hiring managers (and applicant tracking systems) love.
        </p>

        <p>
          It’s like having a professional resume writer, a savvy recruiter, and
          a sprinkle of AI magic working for you. Plus, you get a matching cover
          letter and a quick-read score showing how well you stack up for the
          job.
        </p>

        <p>
          We built Resume Bueno to make life easier for job seekers. Less
          stress. More interviews. That’s the bueno way.
        </p>
      </div>
    </div>
  )
}
