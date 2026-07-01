import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { markingService } from '../../services/markingService';

export default function MarkingQueuePage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    setLoading(true);
    try {
      const data = await markingService.getPendingSubmissions();
      setSubmissions(data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách bài chờ chấm.');
    } finally {
      setLoading(false);
    }
  };

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setScore('');
    setFeedback('');
    setShowModal(true);
  };

  const handleSaveGrade = async () => {
    if (!score || score < 0 || score > 9) {
      toast.error('Vui lòng nhập điểm hợp lệ (0-9)');
      return;
    }
    setSaving(true);
    try {
      await markingService.gradeSubmission(selectedSubmission.id, { score, feedback });
      toast.success('Chấm điểm thành công!');
      setShowModal(false);
      setSubmissions(prev => prev.filter(s => s.id !== selectedSubmission.id));
    } catch (error) {
      toast.error('Lỗi khi lưu điểm.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Đang tải danh sách bài thi...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ color: '#1b4332' }}>Hàng chờ chấm</h2>
        <p className="text-muted">Xem và chấm điểm các bài Writing/Speaking của học viên.</p>
      </div>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        {submissions.length === 0 ? (
          <div className="text-center py-5">
            <h1 style={{ fontSize: '3rem' }}>🎉</h1>
            <h5 className="fw-bold text-dark mt-3">Không có bài nào đang chờ!</h5>
            <p className="text-muted">Bạn đã chấm xong tất cả các bài thi hiện tại.</p>
          </div>
        ) : (
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="py-3 px-4 border-0">Học viên</th>
                <th className="py-3 border-0">Bài thi</th>
                <th className="py-3 border-0">Kỹ năng</th>
                <th className="py-3 border-0">Thời gian nộp</th>
                <th className="py-3 px-4 border-0 text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td className="py-3 px-4 fw-semibold text-dark">{sub.userId}</td>
                  <td className="py-3 text-secondary">{sub.testTitle || sub.testId}</td>
                  <td className="py-3">
                    <Badge bg={sub.skill === 'Writing' ? 'primary' : 'success'} className="px-3 py-2 rounded-pill">
                      {sub.skill}
                    </Badge>
                  </td>
                  <td className="py-3 text-muted small">
                    {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-4 text-end">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="rounded-pill px-3 fw-bold"
                      onClick={() => openGradeModal(sub)}
                    >
                      Chấm bài
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Grade Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-primary">Chấm bài thi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSubmission && (
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Badge bg="secondary">{selectedSubmission.skill}</Badge>
                <span className="fw-semibold text-muted">{selectedSubmission.testTitle || selectedSubmission.testId}</span>
              </div>
              
              <div className="p-3 bg-light rounded-3 mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <h6 className="fw-bold mb-2">Nội dung bài làm:</h6>
                {selectedSubmission.skill === 'Writing' ? (
                  <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {selectedSubmission.answers?.task2 || selectedSubmission.answers?.task1 || 'Không có nội dung'}
                  </p>
                ) : (
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-play-circle-fill text-success fs-3"></i>
                    <a href={selectedSubmission.answers?.audioUrl} target="_blank" rel="noreferrer" className="text-decoration-none">
                      Nghe file ghi âm
                    </a>
                  </div>
                )}
              </div>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Điểm IELTS (0.0 - 9.0)<span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.5" 
                  min="0" 
                  max="9" 
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Ví dụ: 6.5"
                  autoFocus
                />
              </Form.Group>

              <Form.Group>
                <Form.Label className="fw-semibold">Nhận xét chi tiết</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={4} 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Ghi nhận xét về ngữ pháp, từ vựng, tính mạch lạc..."
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill px-4">
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveGrade} disabled={saving} className="rounded-pill px-4 fw-bold">
            {saving ? <Spinner size="sm" /> : 'Lưu điểm'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}
