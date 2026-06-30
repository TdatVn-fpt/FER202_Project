import React, { useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { parseAdvancedQuestionText } from '../../../utils/ieltsQuestionBlocks';

const SAMPLE_TEXT = `[MCQ]
1. Why does the speaker call the office?
A. To cancel a booking
*B. To change a reservation
C. To ask for directions
Explanation: The speaker says she needs another date.

[NOTE COMPLETION]
2. Customer name: ____.
*Martin Hale
Explanation: The receptionist repeats the name.`;

const MARKER_CHIPS = ['[MCQ]', '[T/F/NG]', '[Y/N/NG]', '[NOTE COMPLETION]', '[SENTENCE COMPLETION]', '[SAQ]'];

const getQuestionCount = (blocks = []) => blocks.reduce((sum, block) => sum + (block.questions || []).length, 0);

export default function QuestionBlockEditor({
  title,
  blocks = [],
  onChange,
  variant = 'primary',
}) {
  const [rawText, setRawText] = useState('');
  const [parsedBlocks, setParsedBlocks] = useState([]);
  const [errors, setErrors] = useState(null);

  const totalQuestions = useMemo(() => getQuestionCount(blocks), [blocks]);

  const appendMarker = (marker) => {
    setRawText((value) => {
      const prefix = value.trim() ? `${value.trimEnd()}\n\n` : '';
      return `${prefix}${marker}\n`;
    });
  };

  const parseText = () => {
    const result = parseAdvancedQuestionText(rawText);
    setParsedBlocks(result.blocks || []);
    setErrors(result.errors || null);
  };

  const confirmBlocks = () => {
    if (!parsedBlocks.length || errors?.length) return;
    onChange([...(blocks || []), ...parsedBlocks]);
    setRawText('');
    setParsedBlocks([]);
    setErrors(null);
  };

  const removeBlock = (blockId) => {
    onChange((blocks || []).filter((block) => block.id !== blockId));
  };

  return (
    <div className="lux-block-editor">
      <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3">
        <div>
          <div className="small text-uppercase fw-bold lux-eyebrow">Advanced import</div>
          <h6 className="fw-bold mb-1">{title}</h6>
          <div className="text-secondary small">{blocks.length} block, {totalQuestions} questions. Paste all 40 questions once; ranges will route them automatically.</div>
        </div>
        <span className="lux-mini-counter">{totalQuestions}</span>
      </div>

      <Card className="lux-import-card">
        <Card.Body>
          <Form.Label className="fw-semibold">Paste full question text</Form.Label>
          <Form.Control
            as="textarea"
            rows={9}
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            placeholder="[MCQ]\n1. Question text\nA. Option\n*B. Correct option\nExplanation: ..."
          />

          <div className="lux-marker-dock mt-3">
            <div>
              <div className="small text-uppercase fw-bold text-secondary mb-2">Markers append to the end</div>
              <div className="d-flex gap-2 flex-wrap">
                {MARKER_CHIPS.map((marker) => (
                  <button
                    key={marker}
                    type="button"
                    className="lux-marker-chip"
                    onClick={() => appendMarker(marker)}
                  >
                    {marker}
                  </button>
                ))}
              </div>
            </div>

            <div className="d-flex gap-2 flex-wrap justify-content-end">
              <Button
                type="button"
                variant={`outline-${variant}`}
                onClick={() => setRawText((value) => value || SAMPLE_TEXT)}
              >
                <i className="bi bi-stars me-1" />
                Sample
              </Button>
              <Button type="button" variant="outline-secondary" onClick={() => {
                setRawText('');
                setParsedBlocks([]);
                setErrors(null);
              }}>
                Clear
              </Button>
              <Button type="button" variant={variant} onClick={parseText} disabled={!rawText.trim()}>
                <i className="bi bi-eye me-1" />
                Preview
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {errors?.length > 0 && (
        <Alert variant="danger" className="lux-alert mt-3 mb-0">
          {errors.map((error) => <div key={error}>{error}</div>)}
        </Alert>
      )}

      {parsedBlocks.length > 0 && !errors?.length && (
        <Card className="lux-preview-card mt-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
              <h6 className="fw-bold mb-0">Preview import</h6>
              <Button type="button" variant="success" size="sm" onClick={confirmBlocks}>
                <i className="bi bi-plus-lg me-1" />
                Add {getQuestionCount(parsedBlocks)} questions
              </Button>
            </div>
            <div className="d-flex flex-column gap-3">
              {parsedBlocks.map((block, blockIndex) => (
                <div key={block.id} className="lux-preview-block" style={{ '--block-index': blockIndex }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Badge bg={variant}>{block.type}</Badge>
                    <span className="text-muted small">Range {block.range}</span>
                  </div>
                  {(block.questions || []).slice(0, 3).map((question) => (
                    <div key={question.id} className="small mb-2">
                      <span className="fw-semibold">{question.questionOrder}. {question.text}</span>
                      <span className="text-success ms-2">Answer: {question.correctAnswer}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {blocks.length > 0 && (
        <div className="d-flex flex-column gap-2 mt-3">
          {blocks.map((block, index) => (
            <Card key={block.id || index} className="lux-saved-block">
              <Card.Body className="py-3">
                <Row className="g-3 align-items-start">
                  <Col md={8}>
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                      <Badge bg="dark">Block {index + 1}</Badge>
                      <span className="fw-semibold">{block.type}</span>
                      <span className="text-muted small">Range {block.range}</span>
                    </div>
                    <div className="text-muted small">
                      {(block.questions || []).map((question) => `${question.questionOrder}. ${question.text}`).join(' | ')}
                    </div>
                  </Col>
                  <Col md={4} className="d-flex justify-content-md-end">
                    <Button type="button" variant="outline-danger" size="sm" onClick={() => removeBlock(block.id)}>
                      <i className="bi bi-trash me-1" />
                      Remove
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
