import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

/**
 * SkillRadarChart Component
 * Hiển thị biểu đồ Radar điểm 4 kỹ năng IELTS bằng Recharts.
 * 
 * @param {Array} data - Mảng dữ liệu kỹ năng, ví dụ: [{ skill: 'Listening', score: 6.5 }, ...]
 */
const SkillRadarChart = ({ data }) => {
  // EARS[Event]: WHEN the Student has no test attempts (data rỗng/null/undefined), THE system SHALL show an empty state for charts instead of crashing.
  const isEmpty = !data || !Array.isArray(data) || data.length === 0;

  // EARS[Ubiquitous]: THE system SHALL use Bootstrap classes for responsive layout.
  return (
    <div className="card shadow-sm border-0 h-100" style={{ background: '#ffffff' }}>
      <div className="card-body d-flex flex-column p-4">
        <h6 className="card-title fw-bold mb-4 text-dark" style={{ letterSpacing: '0.2px' }}>
          Skill Balance
        </h6>
        
        <div className="flex-grow-1 d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
          {isEmpty ? (
            <div 
              className="d-flex align-items-center justify-content-center h-100 w-100 rounded"
              style={{ backgroundColor: '#f7f7f7', color: '#7c828a' }}
              data-testid="chart-empty-state"
            >
              No skill data yet
            </div>
          ) : (
            // EARS[Event]: WHEN the Student has test attempts grouped by IELTS skill, THE system SHALL render a Radar Chart.
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                <PolarGrid stroke="#eef0f3" />
                <PolarAngleAxis 
                  dataKey="skill" 
                  tick={{ fill: '#0a0b0d', fontSize: 13, fontWeight: 'bold' }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 9]} 
                  tick={{ fill: '#7c828a', fontSize: 11 }}
                  tickCount={4}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #dee1e6', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
                  }}
                  itemStyle={{ color: '#0052ff', fontWeight: '600' }}
                />
                <Radar 
                  name="Band Score" 
                  dataKey="score" 
                  stroke="#0052ff" 
                  fill="#0052ff" 
                  fillOpacity={0.4} 
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillRadarChart;
