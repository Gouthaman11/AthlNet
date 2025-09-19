import React from 'react';
import Icon from 'components/AppIcon';

const ProgressIndicator = ({
  currentStep = 1,
  totalSteps = 3,
  steps = [],
  onStepClick,
  className = '',
}) => {
  const defaultSteps = [
    { id: 1, title: 'Account Info', description: 'Basic information' },
    { id: 2, title: 'Profile Setup', description: 'Complete your profile' },
    { id: 3, title: 'Verification', description: 'Verify your account' },
  ];

  const stepData = steps?.length > 0 ? steps : defaultSteps?.slice(0, totalSteps);

  const handleStepClick = (stepNumber) => {
    if (onStepClick && stepNumber <= currentStep) onStepClick(stepNumber);
  };

  const getStepStatus = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative mb-8">
        <div className="flex items-center justify-between">
          {stepData?.map((step, index) => {
            const stepNumber = index + 1;
            const status = getStepStatus(stepNumber);
            const isClickable = stepNumber <= currentStep && onStepClick;

            return (
              <div key={step?.id} className="flex flex-col items-center relative">
                <button
                  onClick={() => handleStepClick(stepNumber)}
                  disabled={!isClickable}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-smooth
                    ${
                      status === 'completed'
                        ? 'bg-success text-success-foreground shadow-card'
                        : status === 'current'
                        ? 'bg-primary text-primary-foreground shadow-card'
                        : 'bg-muted text-muted-foreground border-2 border-border'
                    }
                    ${isClickable ? 'hover-scale cursor-pointer' : 'cursor-default'}
                  `}
                >
                  {status === 'completed' ? <Icon name="Check" size={16} /> : <span>{stepNumber}</span>}
                </button>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${status === 'current' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step?.title}
                  </div>
                  {step?.description && <div className="text-xs text-muted-foreground mt-1 hidden sm:block">{step?.description}</div>}
                </div>
                {index < stepData?.length - 1 && (
                  <div className="absolute top-5 left-full w-full h-0.5 bg-border -translate-y-0.5 hidden sm:block">
                    <div className={`h-full transition-smooth ${stepNumber < currentStep ? 'bg-success' : 'bg-border'}`} style={{ width: stepNumber < currentStep ? '100%' : '0%' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="sm:hidden mt-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-smooth" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
            </div>
            <span className="text-sm text-muted-foreground font-data">{currentStep}/{totalSteps}</span>
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Step {currentStep}: {stepData?.[currentStep - 1]?.title}</h3>
        {stepData?.[currentStep - 1]?.description && <p className="text-muted-foreground">{stepData?.[currentStep - 1]?.description}</p>}
      </div>

      <div className="mt-4 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="mt-2 flex space-x-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full ${i < currentStep ? 'bg-success' : 'bg-border'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;