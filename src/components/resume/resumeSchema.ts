import { z } from 'zod'

export const resumeSchema = z.object({
  resume: z
    .string()
    .min(1, 'Resume is required')
    .min(200, 'Resume must be at least 200 characters'),
  education: z.string().optional(),
  certificates: z.string().optional(),
  experience: z.string().optional(),
  skills: z.string().optional(),
  projects: z.string().optional(),
  awards: z.string().optional(),
  training: z.string().optional(),
  volunteering: z.string().optional(),
  hobbies_interests: z.string().optional(),
})

export type ResumeFormValues = z.infer<typeof resumeSchema>

// Define the resume form fields
export const resumeFormFields = [
  {
    name: 'resume' as const,
    label: 'Resume',
    rows: 10,
    placeholder: 'Enter your resume',
    required: true,
  },
  {
    name: 'education' as const,
    label: 'Education',
    rows: 4,
    placeholder: 'Enter your education history',
  },
  {
    name: 'certificates' as const,
    label: 'Certificates',
    rows: 3,
    placeholder: 'List your certificates',
  },
  {
    name: 'experience' as const,
    label: 'Experience',
    rows: 6,
    placeholder: 'Describe your work experience',
  },
  {
    name: 'skills' as const,
    label: 'Skills',
    rows: 4,
    placeholder: 'List your skills',
  },
  {
    name: 'projects' as const,
    label: 'Projects',
    rows: 4,
    placeholder: 'Describe your projects',
  },
  {
    name: 'awards' as const,
    label: 'Awards',
    rows: 3,
    placeholder: 'List your awards and achievements',
  },
  {
    name: 'training' as const,
    label: 'Training',
    rows: 3,
    placeholder: 'List your training and certifications',
  },
  {
    name: 'volunteering' as const,
    label: 'Volunteering',
    rows: 3,
    placeholder: 'Describe your volunteer work',
  },
  {
    name: 'hobbies_interests' as const,
    label: 'Hobbies & Interests',
    rows: 3,
    placeholder: 'Share your hobbies and interests',
  },
]
