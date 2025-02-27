'use client'

interface ProgressIndicatorProps {
  steps: string[]
  currentStep: number
}

export function ProgressIndicator({
  steps,
  currentStep,
}: ProgressIndicatorProps) {
  return (
    <div className="w-full mb-16">
      <div className="relative flex items-center justify-between">
        {/* Background line */}
        <div className="absolute left-0 right-0 top-5 h-1.5 bg-gray-100 rounded-full shadow-inner" />

        {/* Completed line with gradient */}
        <div
          className="absolute left-0 top-5 h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-500 ease-in-out shadow-sm"
          style={{
            width: `${(currentStep / (steps.length - 1)) * 100}%`,
          }}
        />

        {/* Step circles */}
        {steps.map((step, index) => (
          <div key={step} className="relative flex flex-col items-center z-10">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ease-in-out transform ${
                index < currentStep
                  ? 'bg-teal-500 border-teal-500 text-white shadow-md'
                  : index === currentStep
                  ? 'bg-white border-teal-500 text-teal-500 ring-4 ring-teal-100'
                  : 'bg-white border-gray-200 text-gray-400'
              }`}
            >
              {index < currentStep ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span
              className={`mt-3 text-sm font-semibold transition-colors duration-200 ${
                index <= currentStep ? 'text-gray-800' : 'text-gray-400'
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
