import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { 
  MdTrendingUp,
  MdCheckCircle,
  MdQuiz,
  MdPeople
} from 'react-icons/md';
import {
  getDashboardStats,
  getChartData,
  getRoleDistribution,
  getRecentActivities,
} from '../services/adminService';
import '../styles/AdminDashboard.css';

export default function AdminDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chartPeriod, setChartPeriod] = useState('day');
  
  // State lưu dữ liệu từ API
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tất cả dữ liệu khi component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch lại chart data khi đổi period
  useEffect(() => {
    fetchChartData();
  }, [chartPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartRes, roleRes, activitiesRes] = await Promise.all([
        getDashboardStats(),
        getChartData({ period: 'day' }),
        getRoleDistribution(),
        getRecentActivities({ limit: 10 }),
      ]);
      setStats(statsRes.stats);
      setChartData(chartRes.chartData || []);
      setRoleDistribution(roleRes.distribution);
      setActivities(activitiesRes.activities || []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const res = await getChartData({ period: chartPeriod });
      setChartData(res.chartData || []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu biểu đồ:', error);
    }
  };

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const name = activity.user?.name?.toLowerCase() || '';
    const target = activity.target?.toLowerCase() || '';
    const action = activity.action?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    return name.includes(q) || target.includes(q) || action.includes(q);
  });

  // Tính % lớn nhất trong chart để scale height
  const maxCount = chartData.length > 0 ? Math.max(...chartData.map(d => d.count)) : 1;

  // Format số
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return num.toLocaleString('vi-VN');
  };

  return (
    <AdminLayout pageTitle="Tổng quan hệ thống">
      <div className="db-body">
        
        {/* Stats Metrics Grid */}
        <div className="db-stats-grid">
          
          <div className="db-stat-card">
            <div className="db-stat-icon-container blue">
              <MdPeople />
            </div>
            <div className="db-stat-content">
              <span className="db-stat-label">Tổng người dùng</span>
              <h3 className="db-stat-value">
                {loading ? '...' : formatNumber(stats?.totalUsers)}
              </h3>
            </div>
          </div>

          <div className="db-stat-card">
            <div className="db-stat-icon-container green">
              <MdQuiz />
            </div>
            <div className="db-stat-content">
              <span className="db-stat-label">Tổng đề thi</span>
              <h3 className="db-stat-value">
                {loading ? '...' : formatNumber(stats?.totalQuizzes)}
              </h3>
            </div>
          </div>

          <div className="db-stat-card">
            <div className="db-stat-icon-container warning">
              <MdCheckCircle />
            </div>
            <div className="db-stat-content">
              <span className="db-stat-label">Bài nộp hôm nay</span>
              <h3 className="db-stat-value">
                {loading ? '...' : formatNumber(stats?.todayAttempts)}
              </h3>
            </div>
          </div>

          <div className="db-stat-card">
            <div className="db-stat-icon-container purple">
              <MdTrendingUp />
            </div>
            <div className="db-stat-content">
              <span className="db-stat-label">Bài nộp tuần này</span>
              <h3 className="db-stat-value">
                {loading ? '...' : formatNumber(stats?.weeklyAttempts)}
              </h3>
            </div>
          </div>

        </div>

        {/* Charts Section */}
        <div className="db-charts-grid">
          
          {/* Bar Chart */}
          <div className="db-chart-card col-span-2">
            <div className="db-chart-header">
              <div className="db-chart-title-wrapper">
                <h4 className="db-chart-title">{chartPeriod === 'week' ? 'Số bài thi 4 tuần qua' : 'Số bài thi 7 ngày qua'}</h4>
                <p className="db-chart-desc">Theo dõi lưu lượng làm bài của học sinh</p>
              </div>
              <div className="db-chart-toggle">
                <button 
                  className={`db-toggle-btn ${chartPeriod === 'day' ? 'active' : ''}`}
                  onClick={() => setChartPeriod('day')}
                >
                  Ngày
                </button>
                <button 
                  className={`db-toggle-btn ${chartPeriod === 'week' ? 'active' : ''}`}
                  onClick={() => setChartPeriod('week')}
                >
                  Tuần
                </button>
              </div>
            </div>

            <div className="db-bar-chart-container">
              {chartData.length > 0 ? (
                chartData.map((bar, index) => {
                  const heightPercent = maxCount > 0 ? (bar.count / maxCount) * 100 : 0;
                  return (
                    <div key={index} className="db-bar-column">
                      <div className="db-bar-track">
                        <div 
                          className="db-bar-fill" 
                          style={{ height: `${Math.max(heightPercent, 5)}%` }}
                        >
                          <span className="db-bar-tooltip">{bar.count} bài</span>
                        </div>
                      </div>
                      <span className="db-bar-label">{bar.label}</span>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  {loading ? 'Đang tải...' : 'Chưa có dữ liệu bài thi'}
                </div>
              )}
            </div>
          </div>

          {/* Donut Chart - Role Distribution */}
          <div className="db-chart-card">
            <h4 className="db-chart-title">Phân bố vai trò</h4>
            <p className="db-chart-desc" style={{ marginBottom: '16px' }}>Cơ cấu người dùng</p>

            <div className="db-donut-wrapper">
              <svg className="db-donut-svg">
                <circle 
                  cx="90" 
                  cy="90" 
                  r="70" 
                  className="db-donut-circle-bg"
                />
                {roleDistribution && roleDistribution.total > 0 ? (
                  <>
                    {/* Student segment */}
                    <circle 
                      cx="90" 
                      cy="90" 
                      r="70" 
                      className="db-donut-circle blue"
                      strokeDasharray={`${(roleDistribution.percentages.students / 100) * 440} 440`}
                      strokeDashoffset="0"
                    />
                    {/* Teacher segment */}
                    <circle 
                      cx="90" 
                      cy="90" 
                      r="70" 
                      className="db-donut-circle green"
                      strokeDasharray={`${(roleDistribution.percentages.teachers / 100) * 440} 440`}
                      strokeDashoffset={`${-((roleDistribution.percentages.students / 100) * 440)}`}
                    />
                    {/* Admin segment */}
                    <circle 
                      cx="90" 
                      cy="90" 
                      r="70" 
                      className="db-donut-circle warning"
                      strokeDasharray={`${(roleDistribution.percentages.admins / 100) * 440} 440`}
                      strokeDashoffset={`${-((roleDistribution.percentages.students + roleDistribution.percentages.teachers) / 100 * 440)}`}
                    />
                  </>
                ) : (
                  <circle cx="90" cy="90" r="70" className="db-donut-circle-bg" />
                )}
              </svg>
              <div className="db-donut-center-text">
                <span className="db-donut-number">
                  {loading ? '...' : formatNumber(roleDistribution?.total)}
                </span>
                <span className="db-donut-label">Tổng số</span>
              </div>
            </div>

            <div className="db-legend-container">
              <div className="db-legend-item">
                <div className="db-legend-left">
                  <div className="db-legend-dot warning"></div>
                  <span className="db-legend-name">Quản trị viên</span>
                </div>
                <span className="db-legend-percentage">
                  {loading ? '...' : (roleDistribution?.percentages?.admins || 0) + '%'}
                </span>
              </div>
              <div className="db-legend-item">
                <div className="db-legend-left">
                  <div className="db-legend-dot green"></div>
                  <span className="db-legend-name">Giáo viên</span>
                </div>
                <span className="db-legend-percentage">
                  {loading ? '...' : (roleDistribution?.percentages?.teachers || 0) + '%'}
                </span>
              </div>
              <div className="db-legend-item">
                <div className="db-legend-left">
                  <div className="db-legend-dot blue"></div>
                  <span className="db-legend-name">Học sinh</span>
                </div>
                <span className="db-legend-percentage">
                  {loading ? '...' : (roleDistribution?.percentages?.students || 0) + '%'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Recent Activity Section */}
        <div className="db-activity-section">
          <div className="db-activity-header">
            <h4 className="db-activity-title">Hoạt động gần đây</h4>
            <button className="db-view-all-btn">
              Xem tất cả
            </button>
          </div>

          <div className="db-table-responsive">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Hoạt động</th>
                  <th>Đối tượng</th>
                  <th style={{ textAlign: 'right' }}>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--db-text-muted)' }}>
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => (
                    <tr key={activity.id}>
                      <td>
                        <div className="db-user-cell">
                          {activity.user?.avatar ? (
                            <img 
                              className="db-user-avatar" 
                              src={activity.user.avatar} 
                              alt={activity.user.name} 
                            />
                          ) : (
                            <div className="db-user-avatar" style={{ 
                              background: '#e2e8f0', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: 600,
                              color: '#64748b'
                            }}>
                              {activity.user?.name?.charAt(0) || '?'}
                            </div>
                          )}
                          <span className="db-user-name">{activity.user?.name || 'Người dùng'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="db-badge green">
                          {activity.action}
                        </span>
                      </td>
                      <td>{activity.target}</td>
                      <td className="db-time-cell">{activity.timeAgo}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--db-text-muted)' }}>
                      Không có hoạt động nào gần đây
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
