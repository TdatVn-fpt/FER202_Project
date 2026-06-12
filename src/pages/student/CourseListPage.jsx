import React, { useState, useEffect } from 'react';
import { getCourses } from '../../services/courseLearning.service';
import CourseCard from '../../components/feature-course-learning/CourseCard';

const CourseListPage = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Local state cho form input
  const [skillFilter, setSkillFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const limit = 6;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  useEffect(() => {
    const fetchCoursesData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getCourses({
          page: currentPage,
          limit,
          search: searchTerm,
          skill: skillFilter,
          level: levelFilter
        });
        setCourses(response.data);
        setTotalItems(response.totalCount);
      } catch (err) {
        // EARS[Unwanted]: IF fetching fails, THE system SHALL show an error message.
        setError(err.message || 'An error occurred while fetching courses.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCoursesData();
  }, [currentPage, searchTerm, skillFilter, levelFilter]);

  // EARS[Event]: WHEN user submits search, THE system SHALL update searchTerm and reset page to 1.
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1); // Trở về trang 1 khi đổi bộ lọc
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="container py-5">
      {/* Page Header */}
      <div className="row mb-5 align-items-center">
        <div className="col-lg-6 mb-4 mb-lg-0">
          <h2 className="fw-bolder text-dark mb-2" style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>
            Explore Courses
          </h2>
          <p className="text-muted fs-5 mb-0">
            Find the right IELTS course to achieve your target band score.
          </p>
        </div>
        <div className="col-lg-6">
          <form onSubmit={handleSearchSubmit} data-testid="search-form">
            <div className="input-group input-group-lg shadow-sm rounded-pill overflow-hidden bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
              <span className="input-group-text bg-transparent border-0 pe-2 ps-4 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-0 bg-transparent shadow-none px-2" 
                placeholder="Search by course title..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                data-testid="search-input"
              />
              <div className="d-flex align-items-center pe-1 py-1">
                <button 
                  className="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm" 
                  type="submit"
                  style={{ zIndex: 10 }}
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Filters Section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="bg-white p-3 rounded-pill shadow-sm d-flex flex-wrap flex-md-nowrap align-items-center gap-3 border" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            <div className="fw-bold text-muted px-3 text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
              <i className="bi bi-funnel-fill me-1"></i> Filters
            </div>
            
            <div className="flex-grow-1">
              <select 
                className="form-select form-select-sm border-0 bg-light rounded-pill px-4 fw-medium text-dark" 
                value={skillFilter} 
                onChange={handleFilterChange(setSkillFilter)}
                style={{ height: '42px', cursor: 'pointer' }}
                data-testid="skill-filter"
              >
                <option value="">All Skills</option>
                <option value="Writing">Writing</option>
                <option value="Reading">Reading</option>
                <option value="Speaking">Speaking</option>
                <option value="Listening">Listening</option>
              </select>
            </div>
            
            <div className="flex-grow-1">
              <select 
                className="form-select form-select-sm border-0 bg-light rounded-pill px-4 fw-medium text-dark" 
                value={levelFilter} 
                onChange={handleFilterChange(setLevelFilter)}
                style={{ height: '42px', cursor: 'pointer' }}
                data-testid="level-filter"
              >
                <option value="">All Levels</option>
                <option value="Band 5.0+">Band 5.0+</option>
                <option value="Band 6.0+">Band 6.0+</option>
                <option value="Band 7.0+">Band 7.0+</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-4 shadow-sm" role="alert" data-testid="error-alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-5" data-testid="loading-spinner">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading courses...</p>
        </div>
      ) : (
        <>
          {courses.length === 0 && !error ? (
            // EARS[State-driven]: IF no courses match, THE system SHALL display an empty state.
            <div className="card border-0 bg-light rounded-4 py-5 text-center shadow-sm" data-testid="empty-state">
              <div className="card-body py-5">
                <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
                <h4 className="fw-bold">No courses found</h4>
                <p className="text-muted">Try adjusting your search or filters to find what you're looking for.</p>
                <button 
                  className="btn btn-outline-primary rounded-pill mt-3 px-4"
                  onClick={() => {
                    setSearchInput('');
                    setSearchTerm('');
                    setSkillFilter('');
                    setLevelFilter('');
                    setCurrentPage(1);
                  }}
                >
                  Clear all filters
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="row g-4 mb-5">
                {courses.map(course => (
                  <div className="col-12 col-md-6 col-lg-4" key={course.id}>
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalItems > limit && (
                <nav aria-label="Course pagination" className="d-flex justify-content-center">
                  <ul className="pagination pagination-lg">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link rounded-start-pill px-4" onClick={() => handlePageChange(currentPage - 1)} data-testid="prev-page">
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li className={`page-item ${currentPage === i + 1 ? 'active' : ''}`} key={i}>
                        <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link rounded-end-pill px-4" onClick={() => handlePageChange(currentPage + 1)} data-testid="next-page">
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CourseListPage;
