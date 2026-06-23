import React from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';

export default function ListeningBuilder({ value, onChange }) {
  const sections = value.sections || [];

  const updateSection = (id, patch) => {
    onChange({
      ...value,
      sections: sections.map((section) => section.id === id ? { ...section, ...patch } : section),
    });
  };

  const addSection = () => {
    const order = sections.length + 1;
    onChange({
      ...value,
      sections: [
        ...sections,
        { id: `section-${order}`, title: `Section ${order}`, instruction: '', audioUrl: '', order },
      ],
    });
  };

  const removeSection = (id) => {
    onChange({ ...value, sections: sections.filter((section) => section.id !== id) });
  };

  return (
    <div className="d-flex flex-column gap-3">
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={8}>
              <Form.Label>Audio URL chung</Form.Label>
              <Form.Control
                value={value.audioUrl || ''}
                onChange={(e) => onChange({ ...value, audioUrl: e.target.value })}
                placeholder="https://..."
              />
            </Col>
            <Col md={4}>
              <Form.Label>Audio policy</Form.Label>
              <Form.Select
                value={value.audioPolicy || 'allow-replay'}
                onChange={(e) => onChange({ ...value, audioPolicy: e.target.value })}
              >
                <option value="allow-replay">Allow replay</option>
                <option value="play-once">Play once</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {sections.map((section, index) => (
        <Card className="border-0 shadow-sm" key={section.id}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Listening Section {index + 1}</h6>
              {sections.length > 1 && (
                <Button variant="outline-danger" size="sm" onClick={() => removeSection(section.id)}>
                  Xóa section
                </Button>
              )}
            </div>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Tiêu đề</Form.Label>
                <Form.Control
                  value={section.title || ''}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                />
              </Col>
              <Col md={6}>
                <Form.Label>Audio URL riêng</Form.Label>
                <Form.Control
                  value={section.audioUrl || ''}
                  onChange={(e) => updateSection(section.id, { audioUrl: e.target.value })}
                />
              </Col>
              <Col xs={12}>
                <Form.Label>Instruction</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={section.instruction || ''}
                  onChange={(e) => updateSection(section.id, { instruction: e.target.value })}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
      <Button variant="outline-primary" onClick={addSection}>Thêm section</Button>
    </div>
  );
}
