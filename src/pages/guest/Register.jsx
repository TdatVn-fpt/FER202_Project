import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { registerNewUser } from '../../services/authService';
import './Register.css';

const MONTHS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

export default function Register() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Đăng ký tài khoản | IELTS Master';
  }, []);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '',
    day: '', month: '', year: '', agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fullName = `${formData.lastName} ${formData.firstName}`.trim();
      const userData = {
        email: formData.email,
        password: formData.password,
        fullName,
        name: fullName,
        dateOfBirth: `${formData.year}-${formData.month}-${formData.day}`,
      };
      await registerNewUser(userData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message === 'Email is already registered'
        ? 'Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.'
        : (err.message || 'Đăng ký thất bại. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={9} xl={8}>
            <Card className="border-0 shadow-lg overflow-hidden auth-card">
              <Row className="g-0">
                {/* Cột thương hiệu */}
                <Col md={5} className="auth-brand d-none d-md-flex flex-column justify-content-between p-4 text-white">
                  <div className="fw-bold fs-4">IELTS<span className="text-warning">Master</span></div>
                  <div>
                    <h2 className="h3 fw-bold mb-3">Bắt đầu miễn phí 🚀</h2>
                    <p className="mb-0 opacity-75">
                      Tạo tài khoản để mở khóa toàn bộ tài nguyên học tập, lưu tiến độ và
                      đăng ký các khóa học IELTS chuyên sâu.
                    </p>
                  </div>
                  <ul className="list-unstyled small mb-0 opacity-75">
                    <li className="mb-2">✓ Hoàn toàn miễn phí</li>
                    <li className="mb-2">✓ Lưu lộ trình học cá nhân</li>
                    <li>✓ Truy cập kho flashcard</li>
                  </ul>
                </Col>

                {/* Cột form */}
                <Col md={7} className="p-4 p-md-5">
                  <h1 className="h3 fw-bold mb-1">Đăng ký tài khoản</h1>
                  <p className="text-muted mb-4">
                    Đã có tài khoản? <Link to="/login" className="fw-semibold text-decoration-none">Đăng nhập</Link>
                  </p>

                  {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                  {success && <Alert variant="success" className="py-2 small">Đăng ký thành công! Đang chuyển tới trang đăng nhập...</Alert>}

                  <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                      <Col sm={6}>
                        <Form.Group controlId="lastName">
                          <Form.Label className="fw-semibold small">Họ và tên đệm</Form.Label>
                          <Form.Control
                            name="lastName" placeholder="Nguyễn Văn"
                            value={formData.lastName} onChange={handleChange} required
                          />
                        </Form.Group>
                      </Col>
                      <Col sm={6}>
                        <Form.Group controlId="firstName">
                          <Form.Label className="fw-semibold small">Tên</Form.Label>
                          <Form.Control
                            name="firstName" placeholder="An"
                            value={formData.firstName} onChange={handleChange} required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mt-3" controlId="registerEmail">
                      <Form.Label className="fw-semibold small">Email</Form.Label>
                      <Form.Control
                        type="email" name="email" placeholder="ban@email.com"
                        value={formData.email} onChange={handleChange} required
                      />
                    </Form.Group>

                    <Form.Group className="mt-3" controlId="registerPassword">
                      <Form.Label className="fw-semibold small">Mật khẩu</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          name="password" placeholder="Tối thiểu 6 ký tự"
                          value={formData.password} onChange={handleChange} required
                        />
                        <Button variant="outline-secondary" type="button" onClick={() => setShowPassword((s) => !s)}>
                          {showPassword ? 'Ẩn' : 'Hiện'}
                        </Button>
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mt-3">
                      <Form.Label className="fw-semibold small mb-1">Ngày sinh</Form.Label>
                      <div className="text-muted small mb-2">Giúp chúng tôi gợi ý nội dung phù hợp với bạn.</div>
                      <Row className="g-2">
                        <Col xs={4}>
                          <Form.Select name="day" value={formData.day} onChange={handleChange} required aria-label="Ngày">
                            <option value="">Ngày</option>
                            {[...Array(31)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                          </Form.Select>
                        </Col>
                        <Col xs={4}>
                          <Form.Select name="month" value={formData.month} onChange={handleChange} required aria-label="Tháng">
                            <option value="">Tháng</option>
                            {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                          </Form.Select>
                        </Col>
                        <Col xs={4}>
                          <Form.Select name="year" value={formData.year} onChange={handleChange} required aria-label="Năm">
                            <option value="">Năm</option>
                            {[...Array(100)].map((_, i) => {
                              const year = new Date().getFullYear() - i;
                              return <option key={year} value={year}>{year}</option>;
                            })}
                          </Form.Select>
                        </Col>
                      </Row>
                    </Form.Group>

                    <Form.Group className="mt-3" controlId="agreeTerms">
                      <Form.Check
                        type="checkbox" name="agreeTerms" required
                        checked={formData.agreeTerms} onChange={handleChange}
                        label={<span className="small">Tôi đồng ý với <a href="#terms">Điều khoản sử dụng</a> của IELTS Master.</span>}
                      />
                    </Form.Group>

                    <Button
                      type="submit" variant="primary" size="lg"
                      className="w-100 fw-semibold mt-4 mb-3"
                      disabled={loading || success}
                    >
                      {loading ? (
                        <><Spinner as="span" animation="border" size="sm" className="me-2" />Đang tạo tài khoản...</>
                      ) : 'Tạo tài khoản'}
                    </Button>

                    <div className="text-center">
                      <Link to="/" className="small text-muted text-decoration-none">← Quay lại trang chủ</Link>
                    </div>
                  </Form>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
