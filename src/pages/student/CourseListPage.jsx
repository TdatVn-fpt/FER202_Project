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
      <div className="row mb-4 align-items-center">
        <div className="col-md-6 mb-3 mb-md-0">
          <h2 className="fw-bold mb-0">Explore Courses</h2>
          <p className="text-muted">Find the right IELTS course for your goal.</p>
        </div>
        <div className="col-md-6">
          <form className="d-flex" onSubmit={handleSearchSubmit} data-testid="search-form">
            <input 
              type="text" 
              className="form-control me-2 rounded-pill shadow-sm" 
              placeholder="Search courses by title..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              data-testid="search-input"
            />
            <button className="btn btn-primary rounded-pill px-4 shadow-sm" type="submit">
              <i className="bi bi-search me-1"></i> Search
            </button>
          </form>
        </div>
      </div>

      <div className="row mb-4 bg-light p-3 rounded-4 shadow-sm align-items-center">
        <div className="col-md-auto fw-bold text-muted mb-2 mb-md-0">
          <i className="bi bi-funnel-fill me-2"></i> Filters:
        </div>
        <div className="col-md-4 mb-2 mb-md-0">
          <select 
            className="form-select rounded-pill border-0 shadow-sm" 
            value={skillFilter} 
            onChange={handleFilterChange(setSkillFilter)}
            data-testid="skill-filter"
          >
            <option value="">All Skills</option>
            <option value="Writing">Writing</option>
            <option value="Reading">Reading</option>
            <option value="Speaking">Speaking</option>
            <option value="Listening">Listening</option>
          </select>
        </div>
        <div className="col-md-4">
          <select 
            className="form-select rounded-pill border-0 shadow-sm" 
            value={levelFilter} 
            onChange={handleFilterChange(setLevelFilter)}
            data-testid="level-filter"
          >
            <option value="">All Levels</option>
            <option value="Band 5.0+">Band 5.0+</option>
            <option value="Band 6.0+">Band 6.0+</option>
            <option value="Band 7.0+">Band 7.0+</option>
          </select>
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
