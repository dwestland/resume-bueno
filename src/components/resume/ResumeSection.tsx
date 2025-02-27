'use client'

import { FieldErrors, UseFormRegister } from 'react-hook-form'
import { ResumeFormValues } from './resumeSchema'

export interface ResumeField {
  name: keyof ResumeFormValues
  label: string
  rows: number
  placeholder: string
  required?: boolean
}

interface ResumeSectionProps {
  field: ResumeField
  register: UseFormRegister<ResumeFormValues>
  errors: FieldErrors<ResumeFormValues>
}

export function ResumeSection({ field, register, errors }: ResumeSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor={field.name}
          className="block text-base font-medium text-gray-700"
        >
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {/* Character count could be added here in future */}
      </div>

      <div className="relative">
        <textarea
          id={field.name}
          {...register(field.name)}
          rows={field.rows}
          placeholder={field.placeholder}
          className={`w-full px-4 py-3 text-gray-900 bg-white border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors[field.name]
              ? 'border-red-400 focus:ring-red-500'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        />

        {/* Error icon could be added when there's an error */}
        {errors[field.name] && (
          <div className="absolute right-3 top-3 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {errors[field.name] && (
        <p className="text-sm text-red-500 mt-1">
          {errors[field.name]?.message as string}
        </p>
      )}

      {/* Helper text could be added here in future */}
    </div>
  )
}
