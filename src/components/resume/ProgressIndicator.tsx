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
    <div className="w-full mb-12">
      <div className="relative flex items-center justify-between">
        {/* Progress line */}
        <div className="absolute left-0 right-0 h-0.5 bg-gray-200" />

        {/* Completed line */}
        <div
          className="absolute left-0 h-0.5 bg-blue-500 transition-all duration-300"
          style={{
            width: `${(currentStep / (steps.length - 1)) * 100}%`,
          }}
        />

        {/* Step circles */}
        {steps.map((step, index) => (
          <div key={step} className="relative flex flex-col items-center z-10">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                index < currentStep
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : index === currentStep
                  ? 'bg-white border-blue-500 text-blue-500'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {index < currentStep ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
                <span className="text-sm">{index + 1}</span>
              )}
            </div>
            <span
              className={`mt-2 text-sm font-medium ${
                index <= currentStep ? 'text-gray-900' : 'text-gray-400'
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
