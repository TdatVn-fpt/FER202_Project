import React from 'react';
import { Card } from 'react-bootstrap';
import { getReferenceOptions, normalizeTest } from '../../../utils/testModel';

const statusIcon = (ok) => (ok ? '✓' : '!');

export default function LiveChecklist({ test, questionCount = 0, onGoToStep }) {
  const normalized = normalizeTest(test);
  const references = getReferenceOptions(normalized);
  const config = normalized.testConfig || {};

  const common = [
    { label: 'Có tiêu đề', ok: normalized.title?.trim().length >= 5, step: 1 },
    { label: 'Đã chọn kỹ năng', ok: Boolean(normalized.skill), step: 1 },
    { label: 'Có thời gian làm bài', ok: Number(normalized.durationMinutes) > 0, step: 1 },
    { label: 'Có mode hiển thị', ok: Boolean(normalized.testMode), step: 1 },
  ];

  const skillItems = [];
  if (normalized.skill === 'Reading') {
    const passages = config.passages || [];
    skillItems.push(
      { label: 'Có ít nhất 1 passage', ok: passages.length > 0, step: 2 },
      { label: 'Passage có nội dung', ok: passages.some((p) => p.content?.trim()), step: 2 },
      { label: 'Có câu hỏi gắn passage', ok: questionCount > 0, step: 3 },
    );
  }
  if (normalized.skill === 'Listening') {
    const sections = config.sections || [];
    skillItems.push(
      { label: 'Có audio hoặc section audio', ok: Boolean(config.audioUrl || sections.some((s) => s.audioUrl)), step: 2 },
      { label: 'Có section nghe', ok: sections.length > 0, step: 2 },
      { label: 'Có câu hỏi gắn section', ok: questionCount > 0, step: 3 },
    );
  }
  if (normalized.skill === 'Writing') {
    skillItems.push(
      { label: 'Task 1 có prompt', ok: Boolean(config.task1?.prompt?.trim()), step: 2 },
      { label: 'Task 2 có prompt', ok: Boolean(config.task2?.prompt?.trim()), step: 2 },
      { label: 'Minimum words hợp lệ', ok: Number(config.task1?.minimumWords) >= 100 && Number(config.task2?.minimumWords) >= 200, step: 2 },
    );
  }
  if (normalized.skill === 'Speaking') {
    const parts = config.parts || [];
    const part2 = parts.find((p) => Number(p.partNumber) === 2);
    skillItems.push(
      { label: 'Có đủ 3 parts', ok: parts.length >= 3, step: 2 },
      { label: 'Part 2 có cue card', ok: Boolean(part2?.cueCard?.trim()), step: 2 },
      { label: 'Part 1/3 có câu hỏi', ok: parts.some((p) => p.partNumber !== 2 && p.questions?.some((q) => q.text?.trim())), step: 3 },
    );
  }

  const items = [
    ...common,
    { label: 'Có vùng nội dung để gắn câu hỏi', ok: references.length > 0, step: 2 },
    ...skillItems,
  ];

  return (
    <Card className="border-0 shadow-sm sticky-top" style={{ top: 16 }}>
      <Card.Body>
        <h6 className="fw-bold mb-3">Checklist publish</h6>
        <div className="d-flex flex-column gap-2">
          {items.map((item) => (
            <button
              type="button"
              key={item.label}
              onClick={() => onGoToStep(item.step)}
              className="btn btn-light text-start d-flex align-items-center gap-2 rounded-3"
            >
              <span
                className={`d-inline-flex align-items-center justify-content-center rounded-circle fw-bold ${item.ok ? 'bg-success text-white' : 'bg-warning text-dark'}`}
                style={{ width: 24, height: 24, fontSize: 12 }}
              >
                {statusIcon(item.ok)}
              </span>
              <span className={item.ok ? 'text-dark' : 'text-muted'}>{item.label}</span>
            </button>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
