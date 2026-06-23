import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

const SKILL_CARDS = [
  {
    skill: 'Reading',
    title: 'Reading',
    detail: '3 passages, 40 questions, split passage/questions.',
    color: '#0ea5e9',
    icon: 'bi-book',
  },
  {
    skill: 'Listening',
    title: 'Listening',
    detail: '4 sections, audio policy, form/table completion.',
    color: '#f59e0b',
    icon: 'bi-headphones',
  },
  {
    skill: 'Writing',
    title: 'Writing',
    detail: 'Task 1 + Task 2, image prompt, word count.',
    color: '#8b5cf6',
    icon: 'bi-pencil-square',
  },
  {
    skill: 'Speaking',
    title: 'Speaking',
    detail: 'Part 1, cue card Part 2, discussion Part 3.',
    color: '#10b981',
    icon: 'bi-mic',
  },
];

export default function SkillTemplateSelector({ value, onChange }) {
  return (
    <>
      <style>
        {`
          .skill-template-card {
            position: relative;
            overflow: hidden;
            min-height: 168px;
            transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
          }

          .skill-template-card::before {
            content: "";
            position: absolute;
            inset: 0 auto 0 0;
            width: 5px;
            background: var(--skill-color);
            transform: scaleY(0);
            transform-origin: bottom;
            transition: transform 180ms ease;
          }

          .skill-template-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12) !important;
          }

          .skill-template-card.is-active {
            transform: translateY(-5px);
            box-shadow: 0 18px 36px color-mix(in srgb, var(--skill-color) 22%, transparent) !important;
            background: linear-gradient(180deg, color-mix(in srgb, var(--skill-color) 10%, #fff), #fff);
          }

          .skill-template-card.is-active::before {
            transform: scaleY(1);
          }

          .skill-template-icon {
            transition: transform 180ms ease, box-shadow 180ms ease;
          }

          .skill-template-card:hover .skill-template-icon,
          .skill-template-card.is-active .skill-template-icon {
            transform: scale(1.08) rotate(-3deg);
            box-shadow: 0 10px 22px color-mix(in srgb, var(--skill-color) 28%, transparent);
          }

          .skill-template-check {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 28px;
            height: 28px;
            transform: scale(0.72);
            opacity: 0;
            transition: transform 160ms ease, opacity 160ms ease;
          }

          .skill-template-card.is-active .skill-template-check {
            transform: scale(1);
            opacity: 1;
          }
        `}
      </style>

      <Row className="g-3">
        {SKILL_CARDS.map((item) => {
          const active = value === item.skill;
          return (
            <Col md={6} xl={3} key={item.skill}>
              <Card
                role="button"
                aria-pressed={active}
                tabIndex={0}
                className={`skill-template-card h-100 border shadow-sm ${active ? 'is-active' : ''}`}
                onClick={() => onChange(item.skill)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onChange(item.skill);
                  }
                }}
                style={{
                  '--skill-color': item.color,
                  borderColor: active ? item.color : '#e2e8f0',
                  borderWidth: active ? 2 : 1,
                  cursor: 'pointer',
                }}
              >
                <span
                  className="skill-template-check rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ background: item.color }}
                >
                  <i className="bi bi-check-lg" />
                </span>
                <Card.Body className="d-flex flex-column">
                  <div
                    className="skill-template-icon rounded-3 d-flex align-items-center justify-content-center mb-3 text-white"
                    style={{ width: 42, height: 42, background: item.color }}
                  >
                    <i className={`bi ${item.icon}`} />
                  </div>
                  <h6 className="fw-bold mb-1">{item.title}</h6>
                  <p className="small text-muted mb-0">{item.detail}</p>
                  <div className="mt-auto pt-3">
                    <span className="small fw-semibold" style={{ color: active ? item.color : '#94a3b8' }}>
                      {active ? 'Selected template' : 'Click to select'}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );
}
