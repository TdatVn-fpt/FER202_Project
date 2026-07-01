import api from './api';

export const markingService = {
  // Lấy danh sách bài đang chờ chấm (status: pending, skill: Writing/Speaking)
  getPendingSubmissions: async () => {
    const response = await api.get('/testAttempts');
    return response.data.filter(
      (attempt) => attempt.status === 'pending' && (attempt.skill === 'Writing' || attempt.skill === 'Speaking')
    );
  },

  // Cập nhật điểm và trạng thái thành graded
  gradeSubmission: async (attemptId, { score, feedback }) => {
    const payload = {
      score: Number(score),
      overallBandScore: Number(score),
      feedback: feedback,
      status: 'graded',
      completedAt: new Date().toISOString()
    };
    const response = await api.patch(`/testAttempts/${attemptId}`, payload);
    return response.data;
  }
};
