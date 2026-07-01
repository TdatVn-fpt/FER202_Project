import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { getCurrentUser } from '../../services/authService';
import { teacherLibraryService } from '../../services/teacherLibraryService';

export default function LibraryResourceListPage() {
  const currentUser = getCurrentUser();
  const teacherId = currentUser?.id || 'u-teacher-001';

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await teacherLibraryService.getResources(teacherId);
      setResources(data);
    } catch (err) {
      setError('Không thể tải danh sách tài nguyên.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài nguyên này?')) return;
    try {
      await teacherLibraryService.deleteResource(id);
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Xóa thất bại.');
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      pdf: 'danger',
      document: 'primary',
      presentation: 'warning',
      audio: 'info',
      video: 'success',
      image: 'secondary',
      link: 'dark',
    };
    return <Badge bg={colors[type] || 'secondary'}>{type.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-2">Đang tải...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" data-testid="library-page-title">Thư viện Tài nguyên</h2>
          <p className="text-muted mb-0">Quản lý các tài nguyên học tập đã tạo.</p>
        </div>
        <Button
          as={Link}
          to="/teacher/library/create"
          variant="primary"
          className="rounded-pill fw-semibold px-4"
          data-testid="btn-create-resource"
        >
          + Tạo tài nguyên mới
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {resources.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <p className="text-muted fs-5" data-testid="empty-state">Chưa có tài nguyên nào.</p>
            <Button as={Link} to="/teacher/library/create" variant="outline-primary">
              Tạo tài nguyên đầu tiên
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <Table responsive hover className="mb-0" data-testid="resource-table">
            <thead className="bg-light">
              <tr>
                <th>#</th>
                <th>Tiêu đề</th>
                <th>Loại</th>
                <th>Kỹ năng</th>
                <th>Trình độ</th>
                <th>Hiển thị</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource, idx) => (
                <tr key={resource.id} data-testid={`resource-row-${resource.id}`}>
                  <td>{idx + 1}</td>
                  <td className="fw-semibold" data-testid={`resource-title-${resource.id}`}>
                    {resource.title}
                  </td>
                  <td>{getTypeBadge(resource.resourceType)}</td>
                  <td>{resource.skill}</td>
                  <td>{resource.level}</td>
                  <td>
                    <Badge bg={resource.visibility === 'public' ? 'success' : 'secondary'}>
                      {resource.visibility}
                    </Badge>
                  </td>
                  <td>{new Date(resource.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        as={Link}
                        to={`/teacher/library/edit/${resource.id}`}
                        variant="outline-primary"
                        size="sm"
                        data-testid={`btn-edit-${resource.id}`}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(resource.id)}
                        data-testid={`btn-delete-${resource.id}`}
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </Container>
  );
}
