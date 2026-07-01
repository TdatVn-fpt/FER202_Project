import React, { useState, useEffect } from 'react';
import { studentLibraryService } from '../../services/studentLibraryService';

export default function ExamLibraryPage() {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const CATEGORIES = ['Tất cả', 'Academic', 'General Training', 'Cambridge', 'Recent Actual Tests'];

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await studentLibraryService.getPublicResources();
        setResources(data);
      } catch (err) {
        setError(err.message || 'Lỗi khi tải thư viện tài liệu.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, []);

  const filteredResources = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Fallback classification because mock data doesn't perfectly map to these categories
    const isGeneral = r.title.toLowerCase().includes('general');
    const isCam = r.title.toLowerCase().includes('cambridge');
    
    let matchCat = true;
    if (activeCategory === 'Academic') matchCat = !isGeneral;
    if (activeCategory === 'General Training') matchCat = isGeneral;
    if (activeCategory === 'Cambridge') matchCat = isCam;
    if (activeCategory === 'Recent Actual Tests') matchCat = !isCam && !isGeneral;

    return matchSearch && (activeCategory === 'Tất cả' || matchCat);
  });

  const getFileIconInfo = (type) => {
    switch(type) {
      case 'pdf': return { icon: 'bi-file-earmark-pdf-fill', color: 'text-danger', bg: '#fee2e2' };
      case 'document': return { icon: 'bi-file-earmark-word-fill', color: 'text-primary', bg: '#dbeafe' };
      case 'audio': return { icon: 'bi-file-earmark-music-fill', color: 'text-success', bg: '#d1fae5' };
      case 'video': return { icon: 'bi-file-earmark-play-fill', color: 'text-warning', bg: '#fef3c7' };
      default: return { icon: 'bi-file-earmark-text-fill', color: 'text-secondary', bg: '#f1f5f9' };
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} />
        <p className="text-muted fw-semibold">Đang tải tài liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger shadow-sm border-0 rounded-4 p-4 text-center">
          <h4 className="alert-heading fw-bold mb-2">Lỗi tải dữ liệu</h4>
          <p className="mb-0">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* ===== HERO BANNER ===== */}
      <div style={{
        background: 'linear-gradient(120deg, #1e3a8a 0%, #3b82f6 100%)',
        padding: '80px 0 60px',
        color: '#fff',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div className="container text-center">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-4" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <i className="bi bi-book-half fs-5"></i>
            <span className="fw-semibold" style={{ letterSpacing: '1px' }}>IELTS MASTER LIBRARY</span>
          </div>
          <h1 className="display-4 fw-bolder mb-3">Thư Viện Tài Liệu IELTS</h1>
          <p className="lead mx-auto" style={{ maxWidth: '700px', opacity: 0.9 }}>
            Kho lưu trữ các bộ đề thi thật, tài liệu tham khảo và file âm thanh (Cambridge, IELTS Trainer...) dưới dạng PDF/Audio. Tải về hoặc xem trực tiếp để luyện tập hiệu quả.
          </p>
          
          {/* Search Bar */}
          <div className="mx-auto mt-5" style={{ maxWidth: '600px' }}>
            <div className="input-group input-group-lg shadow-sm" style={{ borderRadius: '50px', overflow: 'hidden' }}>
              <span className="input-group-text bg-white border-0 ps-4 text-primary">
                <i className="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-0 py-3 px-3" 
                placeholder="Tìm kiếm sách, PDF (ví dụ: Cambridge 18...)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: '1rem', boxShadow: 'none' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="container mt-5">
        <div className="row g-4">
          
          {/* Sidebar */}
          <div className="col-lg-3">
            <div className="bg-white rounded-4 shadow-sm p-4 sticky-top" style={{ top: '100px' }}>
              <h5 className="fw-bold mb-4 text-dark border-bottom pb-3">Phân loại tài liệu</h5>
              <div className="d-flex flex-column gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="btn text-start d-flex justify-content-between align-items-center rounded-3 px-3 py-2 border-0 transition-all"
                    style={{
                      background: activeCategory === cat ? '#eff6ff' : 'transparent',
                      color: activeCategory === cat ? '#1d4ed8' : '#475569',
                      fontWeight: activeCategory === cat ? '600' : '500'
                    }}
                  >
                    <span>
                      {cat === 'Tất cả' && <i className="bi bi-collection me-2"></i>}
                      {cat === 'Academic' && <i className="bi bi-mortarboard me-2"></i>}
                      {cat === 'General Training' && <i className="bi bi-briefcase me-2"></i>}
                      {cat === 'Cambridge' && <i className="bi bi-journal-bookmark-fill me-2"></i>}
                      {cat === 'Recent Actual Tests' && <i className="bi bi-fire text-danger me-2"></i>}
                      {cat}
                    </span>
                    {activeCategory === cat && <i className="bi bi-check2"></i>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Document List */}
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold text-dark mb-0">
                {activeCategory === 'Tất cả' ? 'Tất cả tài liệu' : `Tài liệu ${activeCategory}`}
              </h4>
              <span className="text-muted fw-medium">{filteredResources.length} kết quả</span>
            </div>

            {filteredResources.length === 0 ? (
              <div className="text-center bg-white rounded-4 shadow-sm py-5">
                <i className="bi bi-search text-muted" style={{ fontSize: '3rem' }}></i>
                <h5 className="fw-bold mt-3">Không tìm thấy tài liệu phù hợp</h5>
                <p className="text-muted">Vui lòng thử từ khóa khác.</p>
              </div>
            ) : (
              <div className="row g-3">
                {filteredResources.map((resource) => {
                  const fileInfo = getFileIconInfo(resource.resourceType);
                  const resourceLink = resource.externalUrl || resource.fileUrl || resource.url || "#";
                  return (
                    <div className="col-12" key={resource.id}>
                      <div className="bg-white rounded-4 shadow-sm p-4 d-flex align-items-center justify-content-between transition-all hover-lift border-start border-4 border-primary">
                        <div className="d-flex align-items-center gap-4">
                          {/* File Icon */}
                          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '64px', height: '64px', background: fileInfo.bg }}>
                            <i className={`bi fs-2 ${fileInfo.icon} ${fileInfo.color}`}></i>
                          </div>
                          
                          {/* Info */}
                          <div>
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-2 py-1" style={{ fontSize: '11px' }}>
                                {resource.skill}
                              </span>
                              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2 py-1" style={{ fontSize: '11px' }}>
                                {resource.level}
                              </span>
                              <span className="badge bg-dark bg-opacity-10 text-dark border border-dark border-opacity-25 rounded-pill px-2 py-1 text-uppercase" style={{ fontSize: '11px' }}>
                                {resource.resourceType}
                              </span>
                            </div>
                            <h5 className="fw-bold text-dark mb-1">{resource.title}</h5>
                            <p className="text-muted small mb-0" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {resource.description || 'Không có mô tả cho tài liệu này.'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="d-flex flex-column gap-2 text-end ms-3 border-start ps-4 flex-shrink-0">
                          <a 
                            href={resourceLink} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2"
                          >
                            <i className="bi bi-eye-fill"></i> Xem trực tuyến
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
