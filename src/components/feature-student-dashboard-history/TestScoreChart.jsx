import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * TestScoreChart Component
 * Hiển thị biểu đồ dạng Line Chart xu hướng điểm số bằng Recharts.
 * 
 * @param {Array} data - Mảng dữ liệu chứa { date, score }
 */
const TestScoreChart = ({ data }) => {
  // EARS[Event]: WHEN the Student has no test attempts (data is null, undefined, or empty array), THE system SHALL show an empty state for charts instead of crashing.
  const isEmpty = !data || !Array.isArray(data) || data.length === 0;

  // EARS[Ubiquitous]: THE system SHALL use Bootstrap classes for layout and responsive design.
  return (
    <div className="card shadow-sm border-0 h-100" style={{ background: '#ffffff' }}>
      <div className="card-body d-flex flex-column p-4">
        <h6 className="card-title fw-bold mb-4 text-dark" style={{ letterSpacing: '0.2px' }}>
          Test Score Trend
        </h6>
        
        <div className="flex-grow-1" style={{ minHeight: '300px' }}>
          {isEmpty ? (
            <div 
              className="d-flex align-items-center justify-content-center h-100 w-100 rounded"
              style={{ backgroundColor: '#f7f7f7', color: '#7c828a' }}
              data-testid="chart-empty-state"
            >
              No test data yet
            </div>
          ) : (
            // EARS[Event]: WHEN the Student has at least one test attempt, THE system SHALL render a Line Chart sorted by submittedAt.
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 20,
                  left: -20, // Kéo trục Y sát viền trái
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#7c828a' }} 
                  axisLine={{ stroke: '#dee1e6' }}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 9]} // Band score từ 0.0 đến 9.0
                  ticks={[0, 3, 6, 9]}
                  tick={{ fontSize: 12, fill: '#7c828a' }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #dee1e6', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#0a0b0d', marginBottom: '4px' }}
                  itemStyle={{ color: '#0052ff', fontWeight: '600' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0052ff" // Coinbase Blue từ DESIGN.md
                  strokeWidth={3}
                  activeDot={{ r: 6, fill: '#ffffff', stroke: '#0052ff', strokeWidth: 2 }}
                  dot={{ r: 4, fill: '#0052ff', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestScoreChart;
