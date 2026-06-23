import React from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';

export default function ReadingBuilder({ value, onChange }) {
  const passages = value.passages || [];

  const updatePassage = (id, patch) => {
    onChange({
      ...value,
      passages: passages.map((passage) => passage.id === id ? { ...passage, ...patch } : passage),
    });
  };

  const addPassage = () => {
    const order = passages.length + 1;
    onChange({
      ...value,
      passages: [
        ...passages,
        { id: `passage-${order}`, title: `Passage ${order}`, content: '', imageUrl: '', order },
      ],
    });
  };

  const removePassage = (id) => {
    onChange({ ...value, passages: passages.filter((passage) => passage.id !== id) });
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
                  Xóa passage
                </Button>
              )}
            </div>
            <Row className="g-3">
              <Col md={8}>
                <Form.Label>Tiêu đề passage</Form.Label>
                <Form.Control
                  value={passage.title || ''}
                  onChange={(e) => updatePassage(passage.id, { title: e.target.value })}
                />
              </Col>
              <Col md={4}>
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  value={passage.imageUrl || ''}
                  onChange={(e) => updatePassage(passage.id, { imageUrl: e.target.value })}
                />
              </Col>
              <Col xs={12}>
                <Form.Label>Nội dung passage</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  value={passage.content || ''}
                  onChange={(e) => updatePassage(passage.id, { content: e.target.value })}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
      <Button variant="outline-primary" onClick={addPassage}>Thêm passage</Button>
    </div>
  );
}
