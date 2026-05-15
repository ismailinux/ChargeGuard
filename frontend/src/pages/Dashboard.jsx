import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StatCard = ({ label, value, sub, color }) => (
  <div style={{
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    flex: '1 1 180px'
  }}>
    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
      {label}
    </div>
    <div style={{
      fontSize: 'clamp(24px, 3vw, 32px)',
      fontWeight: '800',
      color: color || '#0a1628',
      marginBottom: '4px'
    }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: '12px', color: '#94a3b8' }}>{sub}</div>}
  </div>
);

const RiskBadge = ({ label, color }) => {
  const colors = {
    green: { bg: '#f0fdf4', text: '#16a34a' },
    amber: { bg: '#fffbeb', text: '#d97706' },
    orange: { bg: '#fff7ed', text: '#ea580c' },
    red: { bg: '#fef2f2', text: '#dc2626' },
  };
  const c = colors[color] || colors.green;
  return (
    <span style={{
      background: c.bg,
      color: c.text,
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    }}>
      {label}
    </span>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const merchant = JSON.parse(localStorage.getItem('merchant') || '{}');

  // Fetch Disputes
  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/disputes`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        let rawData = res.data?.data || [];
        if (!Array.isArray(rawData) && rawData.rows) {
          rawData = rawData.rows;
        }

        setDisputes(Array.isArray(rawData) ? rawData : []);
      } catch (err) {
        console.error('Failed to fetch disputes:', err);
      }
    };
    fetchDisputes();
  }, []);

  // Fetch Recent Risk Searches
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/risk/recent`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecentSearches(res.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch recent searches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const activeDisputes = disputes.filter(d =>
    d.status === 'pending' || d.squad_status === 'open'
  ).length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fc' }}>
      <Sidebar />

      <main style={{
        flex: 1,
        padding: 'clamp(24px, 4vw, 40px)',
        paddingTop: 'clamp(80px, 4vw, 40px)',
        overflowY: 'auto',
        minWidth: 0
      }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(22px, 3vw, 28px)',
            fontWeight: '800',
            color: '#0a1628',
            marginBottom: '6px'
          }}>
            Good morning, {merchant.business_name?.split(' ')[0] || 'Merchant'} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Here's your fraud protection summary for today.
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <StatCard
            label="Active Disputes"
            value={loading ? '...' : activeDisputes}
            sub="Requires attention"
            color="#E3001B"
          />
          <StatCard
            label="Total Disputes"
            value={loading ? '...' : disputes.length}
            sub="All time"
          />
          <StatCard
            label="Revenue Protected"
            value="₦0"
            sub="Auto-defended"
            color="#16a34a"
          />
          <StatCard
            label="Risk Searches"
            value={recentSearches.length}
            sub="Today"
          />
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>

          {/* Recent Risk Searches */}
          <div style={{
            flex: '2 1 400px',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            minWidth: 0
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0a1628' }}>
                Recent Risk Searches
              </h2>
              <button
                onClick={() => navigate('/risk')}
                style={{
                  fontSize: '13px',
                  color: '#E3001B',
                  fontWeight: '600',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Sora, sans-serif'
                }}
              >
                New search →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentSearches.length > 0 ? (
                recentSearches.map((item, i) => {
                  const email = item.customers?.email || item.query || 'Unknown';
                  const score = item.risk_score || 0;
                  const color = score > 75 ? 'red' : score > 45 ? 'orange' : 'amber';

                  return (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: '#f8f9fc',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#0a1628',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '13px',
                          fontWeight: '700',
                          flexShrink: 0
                        }}>
                          {email[0]?.toUpperCase() || '?'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#0a1628',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {email}
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {new Date(item.searched_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#0a1628' }}>
                          {score}/100
                        </span>
                        <RiskBadge
                          label={score > 75 ? 'Critical Risk' : score > 45 ? 'High Risk' : 'Medium Risk'}
                          color={color}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '40px 20px' }}>
                  No recent risk searches yet. Try searching a buyer on the Risk page.
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions + Network Intelligence */}
          <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Quick Actions */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0a1628', marginBottom: '16px' }}>
                Quick Actions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => navigate('/risk')}
                  style={{
                    padding: '13px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#E3001B',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Sora, sans-serif',
                    textAlign: 'left'
                  }}
                >
                  🔍 Search buyer risk
                </button>
                <button
                  onClick={() => navigate('/disputes')}
                  style={{
                    padding: '13px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    background: 'white',
                    color: '#0a1628',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Sora, sans-serif',
                    textAlign: 'left'
                  }}
                >
                  ⚑ View disputes
                </button>
              </div>
            </div>

            {/* Network Intelligence */}
            <div style={{
              background: '#0a1628',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h2 style={{
                fontSize: '15px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '16px'
              }}>
                Network Intelligence
              </h2>
              {[
                { label: 'Buyers flagged', value: disputes.length },
                { label: 'Merchants on network', value: '1' },
                { label: 'Signals analysed', value: '8' },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>{item.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}