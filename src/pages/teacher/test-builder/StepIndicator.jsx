import React from 'react';

const STEPS = [
  'Thông tin',
  'Nội dung IELTS',
  'Câu hỏi',
];

export default function StepIndicator({ currentStep, onStepClick }) {
  return (
    <div className="d-flex gap-2 flex-wrap mb-4">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const active = currentStep === step;
        const done = currentStep > step;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onStepClick(step)}
            className={`btn btn-sm fw-semibold rounded-pill px-3 ${active ? 'btn-primary' : done ? 'btn-success' : 'btn-outline-secondary'}`}
          >
            <span className="me-2">{done ? '✓' : step}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
