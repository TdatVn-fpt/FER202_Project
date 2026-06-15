import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { getDashboardPathByRole, loginWithEmailAndPassword } from '../../services/authService';
import './Login.css';

export default function Login() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Đăng nhập | IELTS Master';
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const user = await loginWithEmailAndPassword(formData.email, formData.password);
      const fallbackPath = getDashboardPathByRole(user.role);
      const redirectPath = location.state?.from?.pathname || fallbackPath;
      navigate(redirectPath, { replace: true });
    } catch (loginError) {
      setError(loginError.message === 'Invalid email or password'
        ? 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.'
        : (loginError.message || 'Đăng nhập thất bại. Vui lòng thử lại.'));
      setStatus('error');
    }
  };

  const isLoading = status === 'loading';

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
                    <h2 className="h3 fw-bold mb-3">Chào mừng trở lại 👋</h2>
                    <p className="mb-0 opacity-75">
                      Đăng nhập để tiếp tục hành trình chinh phục IELTS của bạn với lộ trình cá nhân hóa,
                      flashcard và bài luyện 4 kỹ năng.
                    </p>
                  </div>
                  <ul className="list-unstyled small mb-0 opacity-75">
                    <li className="mb-2">✓ Theo dõi tiến độ học tập</li>
                    <li className="mb-2">✓ Kho tài nguyên miễn phí</li>
                    <li>✓ Luyện đề bám sát thực tế</li>
                  </ul>
                </Col>

                {/* Cột form */}
                <Col md={7} className="p-4 p-md-5">
                  <h1 className="h3 fw-bold mb-1">Đăng nhập</h1>
                  <p className="text-muted mb-4">
                    Chưa có tài khoản? <Link to="/register" className="fw-semibold text-decoration-none">Đăng ký miễn phí</Link>
                  </p>

                  {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="loginEmail">
                      <Form.Label className="fw-semibold small">Địa chỉ email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="ban@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        size="lg"
                      />
                    </Form.Group>

                    <Form.Group className="mb-2" controlId="loginPassword">
                      <Form.Label className="fw-semibold small">Mật khẩu</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          placeholder="Nhập mật khẩu"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          size="lg"
                        />
                        <Button
                          variant="outline-secondary"
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                        >
                          {showPassword ? 'Ẩn' : 'Hiện'}
                        </Button>
                      </InputGroup>
                    </Form.Group>

                    <div className="d-flex justify-content-end mb-4">
                      <a href="#reset" className="small text-decoration-none">Quên mật khẩu?</a>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-100 fw-semibold mb-3"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <><Spinner as="span" animation="border" size="sm" className="me-2" />Đang đăng nhập...</>
                      ) : 'Đăng nhập'}
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
