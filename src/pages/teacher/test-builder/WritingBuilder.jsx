import React from 'react';
import { Card, Col, Form, Row } from 'react-bootstrap';

export default function WritingBuilder({ value, onChange }) {
  const task1 = value.task1 || {};
  const task2 = value.task2 || {};

  const updateTask = (key, patch) => {
    onChange({
      ...value,
      [key]: {
        ...(value[key] || {}),
        ...patch,
      },
    });
  };

  return (
    <div className="d-flex flex-column gap-3">
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h6 className="fw-bold mb-3">Writing Task 1</h6>
          <Row className="g-3">
            <Col md={8}>
              <Form.Label>Image/chart URL</Form.Label>
              <Form.Control
                value={task1.imageUrl || ''}
                onChange={(e) => updateTask('task1', { imageUrl: e.target.value })}
              />
            </Col>
            <Col md={4}>
              <Form.Label>Minimum words</Form.Label>
              <Form.Control
                type="number"
                value={task1.minimumWords || 150}
                onChange={(e) => updateTask('task1', { minimumWords: Number(e.target.value) })}
              />
            </Col>
            <Col xs={12}>
              <Form.Label>Prompt Task 1</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={task1.prompt || ''}
                onChange={(e) => updateTask('task1', { prompt: e.target.value })}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h6 className="fw-bold mb-3">Writing Task 2</h6>
          <Row className="g-3">
            <Col md={4}>
              <Form.Label>Minimum words</Form.Label>
              <Form.Control
                type="number"
                value={task2.minimumWords || 250}
                onChange={(e) => updateTask('task2', { minimumWords: Number(e.target.value) })}
              />
            </Col>
            <Col xs={12}>
              <Form.Label>Prompt Task 2</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={task2.prompt || ''}
                onChange={(e) => updateTask('task2', { prompt: e.target.value })}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Form.Label>Band criteria / Ghi chú chấm điểm</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={value.bandCriteria || ''}
            onChange={(e) => onChange({ ...value, bandCriteria: e.target.value })}
          />
        </Card.Body>
      </Card>
    </div>
  );
}
