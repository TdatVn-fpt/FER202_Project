import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../../services/courseLearning.service';
import CourseCard from '../../components/feature-course-learning/CourseCard';

const StudentHomePage = () => {
  const [topCourses, setTopCourses] = useState([]);
  const [latestCourses, setLatestCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getCourses({ page: 1, limit: 100 });
        const allCourses = response.data || [];

        const top = [...allCourses]
          .sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0))
          .slice(0, 5);

        const latest = [...allCourses]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);

        setTopCourses(top);
        setLatestCourses(latest);
      } catch (err) {
        setError(err.message || 'Failed to load courses.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeCourses();
  }, []);

  return (
    <div className="container py-5">
      <div className="row align-items-center gy-4 mb-5">
        <div className="col-12 col-lg-6">
          <h1 className="display-5 fw-bold">Chào mừng đến với IELTS MASTER</h1>
          <p className="lead text-muted">
            Khám phá khóa học phù hợp nhất, theo dõi tiến độ học tập và tiếp cận nội dung mới nhất ngay từ trang chủ riêng của bạn.
          </p>
          <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
            <Link to="/learning/courses" className="btn btn-primary btn-lg rounded-pill px-4">
              Xem danh sách khóa học
            </Link>
            <Link to="/learning/dashboard" className="btn btn-outline-secondary btn-lg rounded-pill px-4">
              Mở Dashboard cá nhân
            </Link>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="p-4 rounded-4 bg-white shadow-sm">
            <div className="mb-3 px-3 py-4 rounded-4 bg-light">
              <h5 className="fw-bold">Ưu đãi nổi bật</h5>
              <p className="mb-0 text-muted">Học IELTS hiệu quả hơn với lộ trình rõ ràng và khóa học cập nhật mỗi tuần.</p>
            </div>
            <div className="row g-3">
              <div className="col-12">
                <div className="border rounded-4 p-3">
                  <h6 className="fw-semibold mb-2">Học phí thấp nhất</h6>
                  <p className="mb-0 text-muted">Các khóa học giá trị cao dành cho học viên mới bắt đầu.</p>
                </div>
              </div>
              <div className="col-6">
                <div className="border rounded-4 p-3 h-100">
                  <p className="text-uppercase text-primary small mb-2">Miễn phí</p>
                  <p className="fw-semibold mb-0">Nhiều khóa học free</p>
                </div>
              </div>
              <div className="col-6">
                <div className="border rounded-4 p-3 h-100">
                  <p className="text-uppercase text-primary small mb-2">Mới nhất</p>
                  <p className="fw-semibold mb-0">Cập nhật thường xuyên</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-4 shadow-sm" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <section className="mb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
              <div>
                <h2 className="fw-bolder mb-1">Các khóa học hàng đầu</h2>
                <p className="text-muted mb-0">Khóa học được nhiều học viên đăng ký nhất hiện nay.</p>
              </div>
              <Link to="/learning/courses" className="text-primary fw-semibold">
                Xem tất cả khóa học &rarr;
              </Link>
            </div>
            <div className="row g-4">
              {topCourses.map(course => (
                <div className="col-12 col-md-6 col-lg-4" key={course.id}>
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
              <div>
                <h2 className="fw-bolder mb-1">Top 10 Khóa học mới nhất</h2>
                <p className="text-muted mb-0">Những khóa học vừa được cập nhật và mở bán gần đây.</p>
              </div>
              <Link to="/learning/courses" className="text-primary fw-semibold">
                Xem Catalog &rarr;
              </Link>
            </div>
            <div className="row g-4">
              {latestCourses.map(course => (
                <div className="col-12 col-md-6 col-lg-4" key={course.id}>
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default StudentHomePage;
