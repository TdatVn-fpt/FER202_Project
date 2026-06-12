import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getCurrentUser } from '../../services/authService';
import { updateUserProfile } from '../../services/userService';

// Khai báo schema Zod thủ công
const profileSchema = z.object({
  fullName: z.string().min(1, { message: "Full Name cannot be empty" }),
  dateOfBirth: z.string().optional(),
  avatar: z.string().refine(val => val === '' || val.startsWith('http') || val.startsWith('data:image'), { message: "Avatar must be a valid URL or base64 image" }),
  currentBand: z.coerce.number().min(0).max(9),
  targetBand: z.coerce.number().min(0).max(9),
}).refine(data => data.targetBand >= data.currentBand, {
  message: "Target Band must be greater than or equal to Current Band",
  path: ["targetBand"]
});

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Load user data on mount
  useEffect(() => {
    const loadUser = () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        reset({
          fullName: currentUser.fullName || currentUser.name || '',
          dateOfBirth: currentUser.dateOfBirth || '',
          avatar: currentUser.avatar || '',
          currentBand: currentUser.currentBand || 0,
          targetBand: currentUser.targetBand || 0,
        });
      }
      setLoading(false);
    };
    loadUser();
  }, [reset]);

  const onSubmit = async (data) => {
    // Validate thủ công với Zod
    const validationResult = profileSchema.safeParse(data);
    if (!validationResult.success) {
      // Hiển thị lỗi Zod đầu tiên
      toast.error(validationResult.error.issues[0].message);
      return;
    }

    try {
      setIsSaving(true);
      const updatedUser = await updateUserProfile(user.id, validationResult.data);
      
      // Update local storage so Sidebar updates
      localStorage.setItem('ielts_auth_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Profile updated successfully!');
      
      // Trigger a custom event to notify Sidebar (optional, but good practice if needed)
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="container py-5">User not found.</div>;
  }

  // Fallback cho avatar
  const initials = (user.fullName || user.name || user.email || 'S')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const progressPercentage = user.targetBand > 0 
    ? Math.min(100, (user.currentBand / user.targetBand) * 100) 
    : 0;

  return (
    <div className="container py-5">
      <h2 className="mb-4 fw-bolder text-dark" style={{ letterSpacing: '-0.5px' }}>
        My Profile
      </h2>

      <div className="row g-4">
        {/* Cột trái: Overview Card */}
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm border-0 rounded-4" style={{ backgroundColor: '#ffffff' }}>
            <div className="card-body text-center p-4">
              <div 
                className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center text-white"
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  backgroundColor: '#0052ff',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  overflow: 'hidden'
                }}
              >
                {user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:image')) ? (
                  <img src={user.avatar} alt="Avatar" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                ) : (
                  initials
                )}
              </div>
              <h4 className="fw-bold mb-1">{user.fullName || user.name || 'No Name'}</h4>
              <p className="text-muted mb-2">{user.email}</p>
              <span className="badge bg-light text-dark rounded-pill px-3 py-2 border mb-4">
                Role: {user.role?.toUpperCase()}
              </span>

              <div className="text-start mt-2">
                <p className="text-muted small fw-semibold mb-2" style={{ letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  IELTS Goal Progress
                </p>
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-bold text-dark">Current: {user.currentBand || 'N/A'}</span>
                  <span className="fw-bold text-primary">Target: {user.targetBand || 'N/A'}</span>
                </div>
                <div className="progress rounded-pill" style={{ height: '10px' }}>
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ width: `${progressPercentage}%`, backgroundColor: '#0052ff' }} 
                    aria-valuenow={progressPercentage} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-top text-start">
                <small className="text-muted">
                  Joined on {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Update Form */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0 rounded-4" style={{ backgroundColor: '#ffffff' }}>
            <div className="card-body p-4 p-md-5">
              <h4 className="fw-bold mb-4">Personal Information</h4>
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-3">
                  {/* Full Name */}
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-semibold">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Nguyen Tien Dat"
                      {...register('fullName', { required: true })}
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-semibold">Date of Birth</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      {...register('dateOfBirth')}
                    />
                  </div>

                  {/* Avatar URL */}
                  <div className="col-12">
                    <label className="form-label text-muted small fw-semibold">Avatar URL</label>
                    <input 
                      type="url" 
                      className="form-control" 
                      placeholder="https://example.com/avatar.jpg"
                      {...register('avatar')}
                    />
                  </div>

                  {/* Current Band */}
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-semibold">Current Band Score</label>
                    <select className="form-select" {...register('currentBand')}>
                      <option value="0">0.0</option>
                      <option value="4.0">4.0</option>
                      <option value="4.5">4.5</option>
                      <option value="5.0">5.0</option>
                      <option value="5.5">5.5</option>
                      <option value="6.0">6.0</option>
                      <option value="6.5">6.5</option>
                      <option value="7.0">7.0</option>
                      <option value="7.5">7.5</option>
                      <option value="8.0">8.0</option>
                      <option value="8.5">8.5</option>
                      <option value="9.0">9.0</option>
                    </select>
                  </div>

                  {/* Target Band */}
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-semibold">Target Band Score</label>
                    <select className="form-select" {...register('targetBand')}>
                      <option value="0">0.0</option>
                      <option value="4.0">4.0</option>
                      <option value="4.5">4.5</option>
                      <option value="5.0">5.0</option>
                      <option value="5.5">5.5</option>
                      <option value="6.0">6.0</option>
                      <option value="6.5">6.5</option>
                      <option value="7.0">7.0</option>
                      <option value="7.5">7.5</option>
                      <option value="8.0">8.0</option>
                      <option value="8.5">8.5</option>
                      <option value="9.0">9.0</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="col-12 mt-4 text-end">
                    <button 
                      type="submit" 
                      className="btn btn-primary px-4 py-2 fw-semibold rounded-pill"
                      disabled={isSaving}
                      style={{ backgroundColor: '#0052ff' }}
                    >
                      {isSaving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
