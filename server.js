// server.js - Custom JSON Server Wrapper with Business Logic and Trial Limits
(async () => {
  const { createApp } = await import('json-server/lib/app.js');
  const { Low } = await import('lowdb');
  const { JSONFile } = await import('lowdb/node');
  const { App } = await import('@tinyhttp/app');
  const { json } = await import('milliparsec');

  const PORT = process.env.PORT || 9999;

  // Initialize lowdb database
  const adapter = new JSONFile('db.json');
  const db = new Low(adapter, {});
  await db.read();

  // Ensure collections exist
  db.data = db.data || {};
  db.data.courses = db.data.courses || [];
  db.data.users = db.data.users || [];
  db.data.tests = db.data.tests || [];
  db.data.testAttempts = db.data.testAttempts || [];
  db.data.flashcards = db.data.flashcards || [];
  db.data.flashcardProgress = db.data.flashcardProgress || [];
  db.data.auditLogs = db.data.auditLogs || [];
  db.data.approvalRequests = db.data.approvalRequests || [];

  // Sequential ID Generator
  function generateNextId(collectionName, prefix) {
    const items = db.data[collectionName] || [];
    let maxNum = 0;
    items.forEach(item => {
      if (item.id && String(item.id).startsWith(prefix)) {
        const numPart = String(item.id).substring(prefix.length);
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      }
    });
    return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
  }

  // Create wrapper app
  const server = new App();

  // Custom CORS middleware to prevent Network Error on frontend custom POST/PATCH requests
  server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    next();
  });

  const bodyParser = json();

  // --- 1. POST /courses (Course Creation) ---
  server.post('/courses', bodyParser, async (req, res) => {
    const { title, skill, level, price, teacherId, description, durationWeeks, thumbnail } = req.body;

    // AC-06: Validate Price
    if (price !== undefined && Number(price) < 0) {
      return res.status(400).json({ message: 'Giá học phí không được nhỏ hơn 0.' });
    }

    // Server-side validation for required fields
    if (!title || title.trim().length < 5) {
      return res.status(400).json({ message: 'Tiêu đề khóa học phải có ít nhất 5 ký tự.' });
    }
    if (!skill || !['Listening', 'Reading', 'Writing', 'Speaking'].includes(skill)) {
      return res.status(400).json({ message: 'Kỹ năng chuyên môn không hợp lệ.' });
    }
    if (!level || !['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
      return res.status(400).json({ message: 'Trình độ khóa học không hợp lệ.' });
    }

    // AC-07: Validate teacherId existence and role
    let teacher = db.data.users.find(u => u.id === teacherId);
    if (!teacher) {
      await db.read();
      teacher = db.data.users.find(u => u.id === teacherId);
    }
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Giảng viên không tồn tại hoặc không có quyền tạo khóa học.' });
    }

    // AC-02, AC-03, AC-04, AC-05, AC-08: Build new course object
    const newCourseId = generateNextId('courses', 'course-');
    const newCourse = {
      id: newCourseId,
      title,
      description: description || '',
      syllabus: req.body.syllabus || [],
      skill,
      level,
      price: Number(price) || 0,
      isPremium: Number(price) > 0,
      thumbnail: thumbnail || '',
      teacherId,
      status: 'draft', // AC-03: Default status is draft
      enrolledCount: 0, // AC-04: Default enrolledCount is 0
      durationWeeks: Number(durationWeeks) || 4,
      createdAt: new Date().toISOString() // AC-08: Standard ISO format
    };

    db.data.courses.push(newCourse);
    await db.write();

    console.log(`[Course Creation] Created Course: ${newCourseId}`);
    res.status(201).json(newCourse);
  });

  // --- 2. PATCH /courses/:id (Approval requests trigger) ---
  server.patch('/courses/:id', bodyParser, async (req, res, next) => {
    const courseId = req.params.id;
    const { status } = req.body;

    const courseIndex = db.data.courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course Not Found' });
    }

    const originalCourse = db.data.courses[courseIndex];

    // AC-10: Trigger Approval Request when course status becomes 'pending'
    if (status === 'pending' && originalCourse.status !== 'pending') {
      const existingReq = db.data.approvalRequests.find(r => 
        r.targetId === courseId && 
        r.targetType === 'course' && 
        r.status === 'pending'
      );

      if (!existingReq) {
        const nextReqId = generateNextId('approvalRequests', 'req-');
        const approvalReq = {
          id: nextReqId,
          targetType: 'course',
          targetId: courseId,
          teacherId: originalCourse.teacherId,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        db.data.approvalRequests.push(approvalReq);
        console.log(`[Approval Workflow] Generated approval request: ${nextReqId} for course: ${courseId}`);
      }
    }

    // Update the course in db
    db.data.courses[courseIndex] = { ...originalCourse, ...req.body, id: courseId };
    await db.write();

    res.json(db.data.courses[courseIndex]);
  });

  // --- 3. POST /auditLogs (Audit Logging standardization) ---
  server.post('/auditLogs', bodyParser, async (req, res) => {
    const { action, userId, details, timestamp } = req.body;

    const nextLogId = generateNextId('auditLogs', 'log-');
    const newLog = {
      id: nextLogId,
      actorId: userId || req.body.actorId || 'unknown',
      action: action || 'UNKNOWN',
      targetType: req.body.targetType || (details && details.courseId ? 'course' : 'unknown'),
      targetId: req.body.targetId || (details && details.courseId ? details.courseId : 'unknown'),
      createdAt: timestamp || req.body.createdAt || new Date().toISOString()
    };

    db.data.auditLogs.push(newLog);
    await db.write();

    console.log(`[Audit System] Recorded Action: ${action} - Log ID: ${nextLogId}`);
    res.status(201).json(newLog);
  });

  // --- 4. POST /testAttempts (Practice Test Limits check & Creation) ---
  server.post('/testAttempts', bodyParser, async (req, res) => {
    const { testId, userId, guestId, skill, status } = req.body;
    const studentId = userId || guestId;

    if (studentId && testId) {
      const test = db.data.tests.find(t => t.id === testId || String(t.id) === String(testId));
      if (test && test.courseId) {
        const course = db.data.courses.find(c => c.id === test.courseId);
        
        // AC-11: Limit Free Course to 3 testAttempts total per course
        if (course && !course.isPremium) {
          // Find all tests in this course
          const courseTests = db.data.tests.filter(t => t.courseId === course.id);
          const testIds = courseTests.map(t => t.id);

          // Count student attempts across these tests
          const count = db.data.testAttempts.filter(att => 
            (att.userId === studentId || att.guestId === studentId) && 
            testIds.includes(att.testId)
          ).length;

          if (count >= 3) {
            console.log(`[Trial Limits] Blocked Test Attempt for user: ${studentId} on course: ${course.id}`);
            return res.status(403).json({
              message: 'Bạn đã sử dụng hết 3 lượt làm bài kiểm tra miễn phí của khóa học này. Vui lòng nâng cấp lên khóa học Premium để tiếp tục.'
            });
          }
        }
      }
    }

    // Auto generate sequential ID to prevent random uuid
    const nextTaId = generateNextId('testAttempts', 'ta-');
    const newAttempt = {
      id: nextTaId,
      userId: userId || null,
      guestId: guestId || null,
      testId,
      skill: skill || 'Reading',
      status: status || 'in-progress',
      startTime: req.body.startTime || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    db.data.testAttempts.push(newAttempt);
    await db.write();

    console.log(`[Test Attempt] Saved Attempt: ${nextTaId} for student: ${studentId}`);
    res.status(201).json(newAttempt);
  });

  // --- 5. POST /flashcardProgress (Flashcard Progress Limits check) ---
  server.post('/flashcardProgress', bodyParser, async (req, res, next) => {
    const { flashcardId, userId } = req.body;

    if (userId && flashcardId) {
      const flashcard = db.data.flashcards.find(fc => fc.id === flashcardId);
      if (flashcard && flashcard.courseId) {
        const course = db.data.courses.find(c => c.id === flashcard.courseId);

        // AC-12: Limit Free Course to 3 flashcard progress saves
        if (course && !course.isPremium) {
          // Find all flashcards in this course
          const courseCards = db.data.flashcards.filter(fc => fc.courseId === course.id);
          const cardIds = courseCards.map(fc => fc.id);

          // Count student progress entries in this course
          const count = db.data.flashcardProgress.filter(prog => 
            prog.userId === userId && 
            cardIds.includes(prog.flashcardId)
          ).length;

          if (count >= 3) {
            console.log(`[Trial Limits] Blocked Flashcard Progress for user: ${userId} on course: ${course.id}`);
            return res.status(403).json({
              message: 'Bạn đã sử dụng hết 3 lượt học Flashcard miễn phí của khóa học này. Vui lòng nâng cấp lên khóa học Premium để tiếp tục.'
            });
          }
        }
      }
    }

    // Auto generate sequential ID to prevent random uuid
    const nextFpId = generateNextId('flashcardProgress', 'fp-');
    const newProgress = {
      id: nextFpId,
      userId,
      flashcardId,
      status: req.body.status || 'review',
      createdAt: req.body.createdAt || new Date().toISOString()
    };

    db.data.flashcardProgress.push(newProgress);
    await db.write();

    console.log(`[Flashcard Progress] Saved Progress: ${nextFpId} for user: ${userId}`);
    res.status(201).json(newProgress);
  });

  // Mount main json-server app
  const jsonServerApp = createApp(db);
  server.use(jsonServerApp);

  server.listen(PORT, () => {
    console.log(`Custom JSON Server is running on port ${PORT}`);
  });
})();
