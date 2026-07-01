import React from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import QuestionBlockEditor from './QuestionBlockEditor';

const parseRange = (range, fallbackStart, fallbackEnd) => {
  const match = String(range || '').match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return [fallbackStart, fallbackEnd];
  return [Number(match[1]), Number(match[2])];
};

const splitBlockByRange = (block, targetId, start, end) => {
  const questions = (block.questions || []).filter((question) => {
    const order = Number(question.questionOrder || 0);
    return order >= start && order <= end;
  });
  if (!questions.length) return null;

  const orders = questions.map((question) => Number(question.questionOrder)).filter(Boolean);
  return {
    ...block,
    id: String(block.id || '').includes(`:${targetId}`) ? block.id : `${block.id}:${targetId}`,
    range: `${Math.min(...orders)}-${Math.max(...orders)}`,
    questions,
  };
};

const flattenBlocks = (passages = []) => passages.flatMap((passage) => passage.blocks || []);

export default function ReadingBuilder({ value, onChange }) {
  const passages = value.passages || [];

  const updatePassage = (id, patch) => {
    onChange({
      ...value,
      passages: passages.map((passage) => (passage.id === id ? { ...passage, ...patch } : passage)),
    });
  };

  const addPassage = () => {
    const order = passages.length + 1;
    const defaultEnd = order === 3 ? 40 : order * 13;
    onChange({
      ...value,
      passages: [
        ...passages,
        {
          id: `passage-${order}`,
          title: `Passage ${order}`,
          content: '',
          instruction: '',
          imageUrl: '',
          defaultRange: `${(order - 1) * 13 + 1}-${defaultEnd}`,
          blocks: [],
          order,
        },
      ],
    });
  };

  const removePassage = (id) => {
    onChange({ ...value, passages: passages.filter((passage) => passage.id !== id) });
  };

  const distributeBlocks = (allBlocks) => {
    onChange({
      ...value,
      passages: passages.map((passage, index) => {
        const [start, end] = parseRange(passage.defaultRange, index * 13 + 1, index === 2 ? 40 : (index + 1) * 13);
        return {
          ...passage,
          blocks: allBlocks
            .map((block) => splitBlockByRange(block, passage.id, start, end))
            .filter(Boolean),
        };
      }),
    });
  };

  return (
    <div className="d-flex flex-column gap-3">
      {passages.map((passage, index) => (
        <Card className="border-0 shadow-sm" key={passage.id}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Reading Passage {index + 1}</h6>
              {passages.length > 1 && (
                <Button variant="outline-danger" size="sm" onClick={() => removePassage(passage.id)}>
                  Delete passage
                </Button>
              )}
            </div>

            <Row className="g-3">
              <Col md={8}>
                <Form.Label>Passage title</Form.Label>
                <Form.Control
                  value={passage.title || ''}
                  onChange={(event) => updatePassage(passage.id, { title: event.target.value })}
                />
              </Col>
              <Col md={4}>
                <Form.Label>Question range</Form.Label>
                <Form.Control
                  value={passage.defaultRange || ''}
                  placeholder="1-13"
                  onChange={(event) => updatePassage(passage.id, { defaultRange: event.target.value })}
                />
              </Col>
              <Col md={8}>
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  value={passage.imageUrl || ''}
                  onChange={(event) => updatePassage(passage.id, { imageUrl: event.target.value })}
                />
              </Col>
              <Col xs={12}>
                <Form.Label>Instruction</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={passage.instruction || ''}
                  onChange={(event) => updatePassage(passage.id, { instruction: event.target.value })}
                />
              </Col>
              <Col xs={12}>
                <Form.Label>Passage content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  value={passage.content || ''}
                  onChange={(event) => updatePassage(passage.id, { content: event.target.value })}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
      <Button variant="outline-primary" onClick={addPassage}>Add passage</Button>
      <QuestionBlockEditor
        title="Advanced import for full Reading test"
        variant="primary"
        blocks={flattenBlocks(passages)}
        onChange={distributeBlocks}
      />
    </div>
  );
}
