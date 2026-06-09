import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getDashboardPathByRole, loginWithGoogle } from '../../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const roleHint = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('role') || 'student';
  }, [location.search]);

  const handleGoogleLogin = async () => {
    setStatus('loading');
    setError('');

    try {
      const user = await loginWithGoogle({ role: roleHint });
      const fallbackPath = getDashboardPathByRole(user.role);
      const redirectPath = location.state?.from?.pathname || fallbackPath;

      navigate(redirectPath, { replace: true });
    } catch (loginError) {
      setError('Google login failed. Please try again.');
      setStatus('error');
    }
  };

  const isLoading = status === 'loading';

  return (
    <section className="bg-white py-5">
      <div className="container py-5">
        <div className="row justify-content-center text-center">
          <div className="col-12 col-md-8 col-lg-5">
            <Link to="/" className="d-inline-flex align-items-center gap-2 mb-4 text-decoration-none text-dark">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold p-3 lh-1"
                aria-hidden="true"
              >
                I
              </span>
              <span className="fs-4 fw-semibold">IELTSMaster</span>
            </Link>

            <p className="mb-2 text-uppercase fw-semibold text-primary small">Auth user</p>
            <h1 className="display-6 fw-semibold mb-3">Log in to your account</h1>
            <p className="text-secondary mb-4">
              Continue with Google to access your IELTS learning dashboard.
            </p>

            {error && (
              <div className="alert alert-danger text-start" role="alert">
                {error}
              </div>
            )}

            <div className="border rounded-4 p-4 p-md-5 shadow-sm">
              <button
                type="button"
                className="btn btn-primary btn-lg rounded-pill w-100 d-flex align-items-center justify-content-center gap-3"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <span
                      className="bg-white text-primary rounded-circle d-inline-flex align-items-center justify-content-center fw-bold px-2 py-1 lh-1"
                    >
                      G
                    </span>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <p className="small text-secondary mt-4 mb-0">
                By continuing, you use Google authentication only. Email and password login are not available for this project.
              </p>
            </div>

            <div className="mt-4 small text-secondary">
              Demo roles: <code>?role=teacher</code> or <code>?role=admin</code>.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
