import React from 'react';

const STEPS = [
  { label: 'Thong tin', icon: 'bi-sliders2' },
  { label: 'Noi dung IELTS', icon: 'bi-layers' },
  { label: 'Cau hoi', icon: 'bi-ui-checks-grid' },
];

export default function StepIndicator({ currentStep, onStepClick }) {
  return (
    <div className="lux-stepper mb-4">
      {STEPS.map((item, index) => {
        const step = index + 1;
        const active = currentStep === step;
        const done = currentStep > step;
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => onStepClick(step)}
            className={`lux-step ${active ? 'is-active' : ''} ${done ? 'is-done' : ''}`}
          >
            <span className="lux-step-index">
              <i className={`bi ${done ? 'bi-check-lg' : item.icon}`} />
            </span>
            <span>{step}. {item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
