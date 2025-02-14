import React from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
export default async function DisplayResumePage() {
  // Get the session using Next‑Auth v5's auth() (server side)
  const session = await auth()
  if (!session?.user?.email) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Resume Information</h1>
        <p>
          You are not authenticated. Please sign in to view your resume
          information.
        </p>
      </div>
    )
  }
  // Fetch the current user's resume fields
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      resume: true,
      education: true,
      certificates: true,
      experience: true,
      skills: true,
      projects: true,
      awards: true,
      training: true,
      volunteering: true,
      hobbies_interests: true,
    },
  })
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Resume Information</h1>
      {user ? (
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold">Resume</h2>
            <div className="whitespace-pre-line">
              {user.resume || 'Not available'}
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Education</h2>
            <div className="whitespace-pre-line">
              {user.education || 'Not available'}
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Certificates</h2>
            <div className="whitespace-pre-line">
              {user.certificates || 'Not available'}
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Experience</h2>
            <div className="whitespace-pre-line">
              {user.experience || 'Not available'}
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Skills</h2>
            <div className="whitespace-pre-line">
              {user.skills || 'Not available'}
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Projects</h2>
            <div className="whitespace-pre-line">
              {user.projects || 'Not available'}
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Awards</h2>
            <div className="whitespace-pre-line">
              {user.awards || 'Not available'}
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Training</h2>
            <div className="whitespace-pre-line">
              {user.training || 'Not available'}
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Volunteering</h2>
            <div className="whitespace-pre-line">
              {user.volunteering || 'Not available'}
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Hobbies &amp; Interests</h2>
            <div className="whitespace-pre-line">
              {user.hobbies_interests || 'Not available'}
            </div>
          </section>
        </div>
      ) : (
        <p>No resume information found for your account.</p>
      )}
    </div>
  )
}
