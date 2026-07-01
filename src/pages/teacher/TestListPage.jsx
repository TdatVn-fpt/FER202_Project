import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Col, Form, Modal, Spinner, Table } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { getCurrentUser } from '../../services/authService';
import { teacherCourseService } from '../../services/teacherCourseService';
import { teacherTestService } from '../../services/teacherTestService';
import { teacherQuestionService } from '../../services/teacherQuestionService';
import { auditLogService } from '../../services/auditLogService';
import { countEmbeddedQuestions, matchesTestId } from '../../utils/testModel';

const skillIcon = {
  Reading: 'bi-book',
  Listening: 'bi-headphones',
  Writing: 'bi-pencil-square',
  Speaking: 'bi-mic',
};

const statusMeta = {
  published: { label: 'Published', icon: 'bi-patch-check-fill', className: 'status-published' },
  pending: { label: 'Waiting admin', icon: 'bi-hourglass-split', className: 'status-pending' },
  draft: { label: 'Draft', icon: 'bi-circle', className: 'status-draft' },
};

export default function TestListPage() {
  const currentUser = getCurrentUser();
  const teacherId = currentUser?.id || 'u-teacher-001';

  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [testToAssign, setTestToAssign] = useState(null);
  const [assignCourseId, setAssignCourseId] = useState('');
  const [working, setWorking] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesData, testsData] = await Promise.all([
        teacherCourseService.getCourses(teacherId),
        teacherTestService.getTests(teacherId),
      ]);
      setCourses(coursesData);
      setTests(testsData);

      const questionGroups = await Promise.all(
        testsData.map((test) => teacherQuestionService.getQuestions(test.id))
      );
      setQuestions(questionGroups.flat());
    } catch (err) {
      setError('Cannot connect to the mock server to load IELTS tests.');
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getCourseTitle = useCallback((courseId) => {
    if (!courseId) return 'Free library';
    const course = courses.find((item) => String(item.id) === String(courseId));
    return course ? course.title : 'Unknown course';
  }, [courses]);

  const isTestLocked = (courseId) => {
    const course = courses.find((item) => String(item.id) === String(courseId));
    return course?.status === 'pending';
  };

  const getQuestionsCount = useCallback((test) => {
    const bankCount = questions.filter((question) => matchesTestId(question.testId, test.id)).length;
    return countEmbeddedQuestions(test) + bankCount;
  }, [questions]);

  const filteredTests = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return tests.filter((test) => {
      const matchSearch = !keyword || test.title?.toLowerCase().includes(keyword);
      const matchCourse = selectedCourseId ? String(test.courseId) === String(selectedCourseId) : true;
      const matchSkill = selectedSkill ? test.skill === selectedSkill : true;
      const matchMode = selectedMode ? test.testMode === selectedMode : true;
      return matchSearch && matchCourse && matchSkill && matchMode;
    }).sort((a, b) => {
      const statusRank = { pending: 0, draft: 1, published: 2 };
      const rankCompare = (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9);
      if (rankCompare !== 0) return rankCompare;
      return String(a.title).localeCompare(String(b.title));
    });
  }, [tests, searchQuery, selectedCourseId, selectedSkill, selectedMode]);

  const stats = useMemo(() => {
    const published = tests.filter((test) => test.status === 'published').length;
    const pending = tests.filter((test) => test.status === 'pending').length;
    const totalQuestions = tests.reduce((sum, test) => sum + getQuestionsCount(test), 0);
    const free = tests.filter((test) => test.testMode === 'free' || test.isFreePreview).length;
    return { published, pending, totalQuestions, free };
  }, [tests, getQuestionsCount]);

  const handleDeleteClick = (test) => {
    if (isTestLocked(test.courseId)) {
      toast.error('Cannot delete a test inside a course that is waiting for approval.');
      return;
    }
    setTestToDelete(test);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!testToDelete) return;
    setWorking(true);
    try {
      const relatedQuestions = questions.filter((question) => matchesTestId(question.testId, testToDelete.id));
      for (const question of relatedQuestions) {
        await teacherQuestionService.deleteQuestion(question.id);
        await auditLogService.logAction('DELETE_QUESTION', { questionId: question.id, testId: testToDelete.id }, teacherId);
      }
      await teacherTestService.deleteTest(testToDelete.id);
      await auditLogService.logAction(
        'DELETE_TEST',
        { testId: testToDelete.id, title: testToDelete.title, courseId: testToDelete.courseId },
        teacherId
      );
      setTests((prev) => prev.filter((item) => item.id !== testToDelete.id));
      setQuestions((prev) => prev.filter((item) => !matchesTestId(item.testId, testToDelete.id)));
      toast.success('Test and related question-bank items deleted.');
      setShowDeleteModal(false);
      setTestToDelete(null);
    } catch (err) {
      toast.error('Delete failed.');
    } finally {
      setWorking(false);
    }
  };

  const handleTogglePublish = async (test) => {
    setWorking(true);
    try {
      let nextStatus = 'draft';
      if (test.status === 'draft') nextStatus = 'pending';
      else if (test.status === 'pending') nextStatus = 'draft';
      else if (test.status === 'published') nextStatus = 'draft';

      const updated = await teacherTestService.updateTest(test.id, { status: nextStatus, updatedAt: new Date().toISOString() });
      await auditLogService.logAction(
        nextStatus === 'pending' ? 'SUBMIT_TEST' : 'UNPUBLISH_TEST',
        { testId: test.id, title: test.title },
        teacherId
      );
      setTests((prev) => prev.map((item) => item.id === test.id ? { ...item, ...updated } : item));
      toast.success(nextStatus === 'pending' ? 'Sent to admin approval.' : 'Moved back to draft.');
    } catch (err) {
      toast.error('Cannot update test status.');
    } finally {
      setWorking(false);
    }
  };

  const openAssignModal = (test) => {
    setTestToAssign(test);
    setAssignCourseId(test.courseId || '');
    setShowAssignModal(true);
  };

  const handleAssignCourse = async () => {
    if (!testToAssign) return;
    setWorking(true);
    try {
      const payload = assignCourseId
        ? { testMode: 'course', courseId: assignCourseId, updatedAt: new Date().toISOString() }
        : { testMode: 'free', courseId: '', updatedAt: new Date().toISOString() };
      const updated = await teacherTestService.updateTest(testToAssign.id, payload);
      await auditLogService.logAction(
        'ASSIGN_TEST_COURSE',
        { testId: testToAssign.id, courseId: assignCourseId || null },
        teacherId
      );
      setTests((prev) => prev.map((item) => item.id === testToAssign.id ? { ...item, ...updated } : item));
      toast.success(assignCourseId ? 'Assigned to course.' : 'Moved to Free test.');
      setShowAssignModal(false);
      setTestToAssign(null);
    } catch (err) {
      toast.error('Assign course failed.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="test-studio-page">
      <style>
        {`
          .test-studio-page {
            min-height: 100vh;
            background: #f7f7f7;
            color: #0a0b0d;
            animation: studioFade 260ms ease both;
          }

          .test-studio-shell {
            max-width: 1240px;
            margin: 0 auto;
            padding: 32px 24px 48px;
          }

          .studio-hero {
            position: relative;
            overflow: hidden;
            background: #0a0b0d;
            color: #ffffff;
            border-radius: 24px;
            padding: 34px;
            min-height: 250px;
            display: grid;
            grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
            gap: 24px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
          }

          .studio-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            height: 34px;
            padding: 0 14px;
            border-radius: 999px;
            background: #16181c;
            color: #a8acb3;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .studio-title {
            max-width: 760px;
            margin: 22px 0 12px;
            font-size: clamp(38px, 5vw, 68px);
            font-weight: 400;
            line-height: 1;
            letter-spacing: 0;
          }

          .studio-subtitle {
            max-width: 650px;
            margin: 0;
            color: #a8acb3;
            font-size: 16px;
            line-height: 1.55;
          }

          .studio-hero-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 26px;
          }

          .studio-primary-btn,
          .studio-secondary-btn {
            min-height: 44px;
            border-radius: 999px;
            padding: 10px 18px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }

          .studio-primary-btn {
            background: #0052ff;
            border-color: #0052ff;
          }

          .studio-secondary-btn {
            background: #16181c;
            border-color: #2b2f36;
            color: #ffffff;
          }

          .studio-approval-card {
            align-self: stretch;
            background: #16181c;
            border: 1px solid #2b2f36;
            border-radius: 24px;
            padding: 22px;
            animation: studioFloat 5s ease-in-out infinite;
          }

          .approval-step {
            display: grid;
            grid-template-columns: 36px 1fr auto;
            gap: 12px;
            align-items: center;
            padding: 14px 0;
            border-bottom: 1px solid #2b2f36;
          }

          .approval-step:last-child {
            border-bottom: 0;
          }

          .approval-icon {
            width: 36px;
            height: 36px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #eef0f3;
            color: #0a0b0d;
          }

          .approval-label {
            color: #ffffff;
            font-weight: 700;
          }

          .approval-note {
            color: #a8acb3;
            font-size: 13px;
          }

          .approval-badge {
            border-radius: 999px;
            padding: 6px 10px;
            color: #05b169;
            background: transparent;
            font-weight: 700;
            font-size: 12px;
          }

          .metric-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 14px;
            margin: 18px 0;
          }

          .metric-tile,
          .studio-filter-card,
          .studio-table-card {
            background: #ffffff;
            border: 1px solid #dee1e6;
            border-radius: 24px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
          }

          .metric-tile {
            padding: 20px;
            animation: studioLift 320ms ease both;
            animation-delay: calc(var(--metric-index) * 55ms);
          }

          .metric-value {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 30px;
            font-weight: 600;
            line-height: 1;
          }

          .metric-label {
            margin-top: 8px;
            color: #5b616e;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .studio-filter-card {
            padding: 20px;
            margin-bottom: 18px;
          }

          .studio-filter-card .form-label {
            color: #5b616e;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .studio-filter-card .form-control,
          .studio-filter-card .form-select {
            min-height: 48px;
            border-radius: 14px;
            border-color: #dee1e6;
            transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
          }

          .studio-filter-card .form-control:focus,
          .studio-filter-card .form-select:focus {
            border-color: #0052ff;
            box-shadow: 0 0 0 0.2rem rgba(0, 82, 255, 0.12);
            transform: translateY(-1px);
          }

          .studio-table-card {
            overflow: hidden;
          }

          .studio-table-card table {
            margin: 0;
          }

          .studio-table-card thead th {
            padding: 18px 18px;
            border-bottom: 1px solid #dee1e6;
            background: #ffffff;
            color: #5b616e;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0;
          }

          .studio-row {
            animation: studioLift 260ms ease both;
            animation-delay: calc(var(--row-index) * 35ms);
            transition: transform 180ms ease, background 180ms ease;
          }

          .studio-row:hover {
            transform: translateY(-2px);
            background: #f7f7f7;
          }

          .test-title-cell {
            min-width: 300px;
            padding: 18px;
          }

          .skill-pill,
          .mode-pill,
          .status-pill {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            border-radius: 999px;
            padding: 7px 11px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
          }

          .skill-pill {
            background: #eef0f3;
            color: #0a0b0d;
          }

          .mode-pill {
            background: #ffffff;
            color: #0a0b0d;
            border: 1px solid #dee1e6;
          }

          .status-published {
            color: #05b169;
            background: transparent;
          }

          .status-pending {
            color: #f4b000;
            background: transparent;
          }

          .status-draft {
            color: #5b616e;
            background: transparent;
          }

          .question-meter {
            min-width: 112px;
          }

          .question-meter-track {
            height: 6px;
            overflow: hidden;
            border-radius: 999px;
            background: #eef0f3;
          }

          .question-meter-fill {
            height: 100%;
            width: var(--meter-width);
            background: #0052ff;
            border-radius: inherit;
            transition: width 260ms ease;
          }

          .studio-actions {
            min-width: 280px;
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            flex-wrap: wrap;
          }

          .studio-actions .btn {
            min-height: 34px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: transform 160ms ease, box-shadow 160ms ease;
          }

          .studio-actions .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
          }

          .empty-state {
            padding: 64px 24px;
            text-align: center;
            color: #5b616e;
          }

          @keyframes studioFade {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes studioLift {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes studioFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }

          @media (max-width: 992px) {
            .studio-hero {
              grid-template-columns: 1fr;
            }

            .metric-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 640px) {
            .test-studio-shell {
              padding: 18px 12px 32px;
            }

            .studio-hero,
            .metric-tile,
            .studio-filter-card,
            .studio-table-card {
              border-radius: 18px;
            }

            .studio-hero {
              padding: 24px;
            }

            .metric-grid {
              grid-template-columns: 1fr;
            }

            .studio-title {
              font-size: 38px;
            }
          }
        `}
      </style>

      <div className="test-studio-shell">
        <section className="studio-hero mb-3">
          <div>
            <span className="studio-eyebrow">
              <i className="bi bi-grid-1x2"></i>
              IELTS assessment studio
            </span>
            <h1 className="studio-title">Build, approve, publish.</h1>
            <p className="studio-subtitle">
              Tutor tests now move through admin approval before they reach student skill practice.
              Reading and Listening can carry all 40 embedded questions in one polished test config.
            </p>
            <div className="studio-hero-actions">
              <Button as={Link} to="/teacher/tests/create" className="studio-primary-btn">
                <i className="bi bi-plus-lg"></i>
                New IELTS test
              </Button>
              <Button as={Link} to="/skills" className="studio-secondary-btn">
                <i className="bi bi-window"></i>
                Student skills
              </Button>
            </div>
          </div>

          <div className="studio-approval-card">
            <div className="approval-step">
              <span className="approval-icon"><i className="bi bi-pencil-square"></i></span>
              <div>
                <div className="approval-label">Tutor creates</div>
                <div className="approval-note">Draft, question blocks, audio and task setup.</div>
              </div>
              <span className="approval-badge">Step 1</span>
            </div>
            <div className="approval-step">
              <span className="approval-icon"><i className="bi bi-shield-check"></i></span>
              <div>
                <div className="approval-label">Admin approves</div>
                <div className="approval-note">Pending requests become published tests.</div>
              </div>
              <span className="approval-badge">Step 2</span>
            </div>
            <div className="approval-step">
              <span className="approval-icon"><i className="bi bi-mortarboard"></i></span>
              <div>
                <div className="approval-label">Student practices</div>
                <div className="approval-note">Only published free tests appear in /skills.</div>
              </div>
              <span className="approval-badge">Live</span>
            </div>
          </div>
        </section>

        <div className="metric-grid">
          {[
            ['Published', stats.published, 'bi-patch-check-fill'],
            ['Waiting admin', stats.pending, 'bi-hourglass-split'],
            ['Free skill tests', stats.free, 'bi-unlock'],
            ['Total questions', stats.totalQuestions, 'bi-list-check'],
          ].map(([label, value, icon], index) => (
            <div className="metric-tile" style={{ '--metric-index': index }} key={label}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="metric-value">{value}</div>
                  <div className="metric-label">{label}</div>
                </div>
                <i className={`bi ${icon} fs-4 text-primary`}></i>
              </div>
            </div>
          ))}
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Card className="studio-filter-card">
          <Form className="row g-3">
            <Col md={4}>
              <Form.Label>Search test</Form.Label>
              <Form.Control value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Type a test title..." />
            </Col>
            <Col md={3}>
              <Form.Label>Course</Form.Label>
              <Form.Select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)}>
                <option value="">All courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>Skill</Form.Label>
              <Form.Select value={selectedSkill} onChange={(event) => setSelectedSkill(event.target.value)}>
                <option value="">All skills</option>
                <option value="Reading">Reading</option>
                <option value="Listening">Listening</option>
                <option value="Writing">Writing</option>
                <option value="Speaking">Speaking</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Mode</Form.Label>
              <Form.Select value={selectedMode} onChange={(event) => setSelectedMode(event.target.value)}>
                <option value="">All modes</option>
                <option value="free">Free</option>
                <option value="course">Course</option>
              </Form.Select>
            </Col>
          </Form>
        </Card>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-secondary">Loading IELTS test studio...</p>
          </div>
        ) : (
          <Card className="studio-table-card">
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Skill</th>
                  <th>Mode</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Attempts</th>
                  <th>Questions</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((test, index) => {
                  const locked = isTestLocked(test.courseId);
                  const meta = statusMeta[test.status] || statusMeta.draft;
                  const currentCount = getQuestionsCount(test);
                  const total = Number(test.totalQuestions || 0);
                  const percent = total ? Math.min(100, Math.round((currentCount / total) * 100)) : 0;

                  return (
                    <tr key={test.id} className="studio-row" style={{ '--row-index': index }}>
                      <td className="test-title-cell">
                        <div className="fw-semibold text-dark">{test.title}</div>
                        <div className="small text-secondary mt-1">{test.durationMinutes} min · {test.bandScale}</div>
                      </td>
                      <td>
                        <span className="skill-pill">
                          <i className={`bi ${skillIcon[test.skill] || 'bi-card-text'}`}></i>
                          {test.skill}
                        </span>
                      </td>
                      <td>
                        <span className="mode-pill">
                          <i className={`bi ${test.testMode === 'free' ? 'bi-unlock' : 'bi-collection'}`}></i>
                          {test.testMode === 'free' ? 'Free' : 'Course'}
                        </span>
                      </td>
                      <td className="small text-secondary">{getCourseTitle(test.courseId)}</td>
                      <td>
                        <span className={`status-pill ${meta.className}`}>
                          <i className={`bi ${meta.icon}`}></i>
                          {meta.label}
                        </span>
                      </td>
                      <td className="small">{test.attemptLimit ? `${test.attemptLimit} times` : 'Unlimited'}</td>
                      <td>
                        <div className="question-meter">
                          <div className="fw-semibold">{currentCount} / {total}</div>
                          <div className="question-meter-track mt-2">
                            <div className="question-meter-fill" style={{ '--meter-width': `${percent}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="studio-actions">
                          {test.skill !== 'Writing' && (
                            <Button as={Link} to={`/teacher/tests/${test.id}/questions`} size="sm" variant="outline-primary" title="Question bank">
                              <i className="bi bi-list-check"></i>
                              Questions
                            </Button>
                          )}
                          <Button as={Link} to={`/teacher/tests/${test.id}/edit`} size="sm" variant="outline-secondary" disabled={locked} title="Edit test">
                            <i className="bi bi-pencil"></i>
                            Edit
                          </Button>
                          <Button size="sm" variant="outline-info" onClick={() => openAssignModal(test)} disabled={working} title="Assign course">
                            <i className="bi bi-link-45deg"></i>
                            Assign
                          </Button>
                          <Button
                            size="sm"
                            variant={test.status === 'published' ? 'outline-warning' : test.status === 'pending' ? 'outline-secondary' : 'outline-success'}
                            onClick={() => handleTogglePublish(test)}
                            disabled={working}
                            title="Approval status"
                          >
                            <i className={`bi ${test.status === 'draft' ? 'bi-send' : 'bi-arrow-counterclockwise'}`}></i>
                            {test.status === 'published' ? 'Draft' : test.status === 'pending' ? 'Cancel' : 'Send'}
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDeleteClick(test)} disabled={locked || working} title="Delete test">
                            <i className="bi bi-trash3"></i>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredTests.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      <i className="bi bi-search fs-1 d-block mb-3"></i>
                      No IELTS tests match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card>
        )}
      </div>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Delete test</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Delete <strong>{testToDelete?.title}</strong> and related question-bank items?
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={working}>
            {working ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Assign test to course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Course</Form.Label>
          <Form.Select value={assignCourseId} onChange={(event) => setAssignCourseId(event.target.value)}>
            <option value="">No course - keep as Free skill test</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.title} ({course.status})</option>
            ))}
          </Form.Select>
          <div className="small text-secondary mt-3">
            Free published tests appear on the student skills page after admin approval.
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowAssignModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAssignCourse} disabled={working}>
            {working ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
