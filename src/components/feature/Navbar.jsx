import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Navbar as BsNavbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import { getCurrentUser, getDashboardPathByRole, logout } from '../../services/authService';

export default function Navbar({ variant = 'default' }) {
  const [expanded, setExpanded] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const navigate = useNavigate();

  const closeMenu = () => setExpanded(false);
  const dashboardPath = getDashboardPathByRole(currentUser?.role);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getCurrentUser());
    window.addEventListener('auth:user-changed', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('auth:user-changed', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  // Class helper cho NavLink (thêm 'active' của Bootstrap khi đang ở route đó)
  const navLinkClass = ({ isActive }) => `nav-link${isActive ? ' active fw-semibold' : ''}`;

  return (
    <BsNavbar
      expand="lg"
      bg="white"
      sticky="top"
      expanded={expanded}
      onToggle={setExpanded}
      className="shadow-sm py-2"
    >
      <Container>
        <BsNavbar.Brand as={Link} to="/" onClick={closeMenu} className="fw-bold fs-4 lh-1">
          <span className="text-primary">IELTS</span>
          <span className="text-dark"> Master</span>
        </BsNavbar.Brand>

        <BsNavbar.Toggle aria-controls="main-navbar" />

        <BsNavbar.Collapse id="main-navbar">
          {variant === 'student' ? (
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/learning/dashboard" className={navLinkClass} onClick={closeMenu}>
                Dashboard
              </Nav.Link>
              <Nav.Link as={NavLink} to="/learning/my-courses" className={navLinkClass} onClick={closeMenu}>
                My Courses
              </Nav.Link>
              <Nav.Link as={NavLink} to="/learning/courses" className={navLinkClass} onClick={closeMenu}>
                Course Catalog
              </Nav.Link>
              <Nav.Link as={NavLink} to="/learning/history" className={navLinkClass} onClick={closeMenu}>
                Learning History
              </Nav.Link>
            </Nav>
          ) : (
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/online-courses" className={navLinkClass} onClick={closeMenu}>
                Khóa học IELTS
              </Nav.Link>

              <NavDropdown title="Tài nguyên miễn phí" id="free-resources-dropdown">
                <NavDropdown.Item as={Link} to="/courses" onClick={closeMenu}>
                  Tổng hợp tài nguyên
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/skills" onClick={closeMenu}>Luyện 4 kỹ năng</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/resources/listening-keywords" onClick={closeMenu}>Mẹo Listening</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/resources/reading-skimming-scanning" onClick={closeMenu}>Mẹo Reading</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/resources/writing-task2-structure" onClick={closeMenu}>Mẹo Writing</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/resources/speaking-part1-fluency" onClick={closeMenu}>Mẹo Speaking</NavDropdown.Item>
              </NavDropdown>

              <Nav.Link as={NavLink} to="/skills" className={navLinkClass} onClick={closeMenu}>
                Luyện 4 kỹ năng
              </Nav.Link>
            </Nav>
          )}

          <Nav className="align-items-lg-center gap-lg-2">
            {currentUser ? (
              <NavDropdown title={currentUser.name} id="user-dropdown" align="end">
                {variant !== 'student' && (
                  <NavDropdown.Item as={Link} to={dashboardPath} onClick={closeMenu}>
                    My Dashboard
                  </NavDropdown.Item>
                )}
                <NavDropdown.Item as={Link} to="/learning/profile" onClick={closeMenu}>
                  My Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Đăng xuất</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Button as={Link} to="/login" variant="outline-primary" onClick={closeMenu}>
                  Đăng nhập
                </Button>
                <Button as={Link} to="/register" variant="primary" onClick={closeMenu}>
                  Đăng ký
                </Button>
              </>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}
