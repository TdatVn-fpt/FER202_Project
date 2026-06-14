import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../../services/courseLearning.service';
import { formatVnd } from '../../services/paymentService';
import './OnlineCourses.css';

const SKILLS = ['Tất cả', 'Reading', 'Listening', 'Writing', 'Speaking'];

export default function OnlineCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [skill, setSkill] = useState('Tất cả');
  const [search, setSearch] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    let ignore = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        // Lấy tối đa 50 khóa, lọc phía client cho mượt
        const { data } = await getCourses({ page: 1, limit: 50 });
        if (!ignore) setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!ignore) setError(err.message || 'Không tải được danh sách khóa học.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, []);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchSkill = skill === 'Tất cả' || c.skill === skill;
      const keyword = search.trim().toLowerCase();
      const matchSearch =
        !keyword ||
        (c.title || '').toLowerCase().includes(keyword) ||
        (c.description || '').toLowerCase().includes(keyword);
      return matchSkill && matchSearch;
    });
  }, [courses, skill, search]);

  return (
    <div className="catalog-page">
      {/* HERO */}
      <header className="catalog-hero">
        <div className="catalog-hero-inner">
          <span className="catalog-eyebrow">Khóa học IELTS</span>
          <h1>Chinh phục IELTS cùng lộ trình bài bản</h1>
          <p>
            Khóa học bám sát 4 kỹ năng, tích hợp flashcard từ vựng trọng tâm và
            bài tập thực chiến. Chọn khóa phù hợp với mục tiêu band điểm của bạn.
          </p>
        </div>
      </header>

      {/* THANH LỌC */}
      <div className="catalog-toolbar">
        <div className="catalog-filters">
          {SKILLS.map((s) => (
            <button
              key={s}
              className={`catalog-chip ${skill === s ? 'active' : ''}`}
              onClick={() => setSkill(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="catalog-search">
          <input
            type="text"
            placeholder="Tìm khóa học theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* DANH SÁCH */}
      <main className="catalog-body">
        {loading && <div className="catalog-state">Đang tải khóa học...</div>}
        {error && !loading && <div className="catalog-state catalog-state-error">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="catalog-state">Không tìm thấy khóa học phù hợp.</div>
        )}

        <div className="catalog-grid">
          {filtered.map((course) => {
            const isFree = !course.price || course.price === 0;
            return (
              <article className="catalog-card" key={course.id}>
                <Link to={`/courses/${course.id}`} className="catalog-card-media">
                  <img src={course.thumbnail} alt={course.title} loading="lazy" />
                  <span className={`catalog-tag ${isFree ? 'free' : 'premium'}`}>
                    {isFree ? 'Miễn phí' : 'Trả phí'}
                  </span>
                  <span className="catalog-skill-tag">{course.skill}</span>
                </Link>
                <div className="catalog-card-body">
                  <div className="catalog-card-meta">
                    <span>⭐ {course.rating}</span>
                    <span>👥 {course.enrolledCount}</span>
                    <span>🗓️ {course.durationWeeks} tuần</span>
                  </div>
                  <h3>
                    <Link to={`/courses/${course.id}`}>{course.title}</Link>
                  </h3>
                  <p className="catalog-card-desc">{course.description}</p>
                  <div className="catalog-card-foot">
                    <span className="catalog-price">
                      {isFree ? 'Miễn phí' : formatVnd(course.price)}
                    </span>
                    <Link to={`/courses/${course.id}`} className="catalog-btn">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
