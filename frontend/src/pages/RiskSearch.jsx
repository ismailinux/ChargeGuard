import { useState } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'

const RiskMeter = ({ score, color }) => {
  const colors = {
    green: '#16a34a',
    amber: '#d97706',
    orange: '#ea580c',
    red: '#dc2626',
  }
  const c = colors[color] || colors.green
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference

  return (
    <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto' }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r="54"
          fill="none" stroke="#f1f5f9" strokeWidth="12" />
        <circle cx="70" cy="70" r="54"
          fill="none" stroke={c} strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ fontSize: '28px', fontWeight: '800', color: c }}>{score}</span>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>/ 100</span>
      </div>
    </div>
  )
}

const SignalItem = ({ text }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start',
    gap: '10px', padding: '10px 0',
    borderBottom: '1px solid #f1f5f9'
  }}>
    <span style={{
      width: '6px', height: '6px',
      borderRadius: '50%', background: '#E3001B',
      marginTop: '6px', flexShrink: 0
    }} />
    <span style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{text}</span>
  </div>
)

const LegitimacyItem = ({ text }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start',
    gap: '10px', padding: '10px 0',
    borderBottom: '1px solid #f1f5f9'
  }}>
    <span style={{
      width: '6px', height: '6px',
      borderRadius: '50%', background: '#16a34a',
      marginTop: '6px', flexShrink: 0
    }} />
    <span style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{text}</span>
  </div>
)

export default function RiskSearch() {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('email')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
  e.preventDefault();
  if (!query.trim()) return;

  setLoading(true);
  setError('');
  setResult(null);
  setSearched(true);

  try {
    const token = localStorage.getItem('token');
    const params = searchType === 'email'
      ? { email: query }
      : { phone: query };

    const res = await axios.get('http://localhost:5000/api/risk/search', {
      headers: { Authorization: `Bearer ${token}` },
      params
    });

    const data = res.data;
    setResult(data);

    // === RECORD THE SEARCH ===
    if (data.success) {
      await axios.post('http://localhost:5000/api/risk/record', {
        customer_id: data.customer?.id || null,
        query: query,
        search_type: searchType,
        risk_score: data.risk?.score || 50
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Search failed');
  } finally {
    setLoading(false);
  }
};

  const getRiskColors = (color) => {
    const map = {
      green: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
      amber: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
      orange: { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
      red: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    }
    return map[color] || map.green
  }

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
            fontWeight: '800', color: '#0a1628', marginBottom: '6px'
          }}>
            Buyer Risk Search
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Search a buyer's email or phone number to get their AI risk score before accepting payment.
          </p>
        </div>

        {/* Search Box */}
        <div style={{
          background: 'white', borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: 'clamp(20px, 4vw, 32px)',
          marginBottom: '28px'
        }}>
          {/* Toggle */}
          <div style={{
            display: 'flex', gap: '8px',
            marginBottom: '20px',
            background: '#f8f9fc',
            borderRadius: '12px', padding: '4px',
            width: 'fit-content'
          }}>
            {['email', 'phone'].map(type => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                style={{
                  padding: '8px 20px', borderRadius: '10px',
                  border: 'none', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', fontFamily: 'Sora, sans-serif',
                  transition: 'all 0.15s',
                  background: searchType === type ? 'white' : 'transparent',
                  color: searchType === type ? '#0a1628' : '#94a3b8',
                  boxShadow: searchType === type ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {type === 'email' ? '✉ Email' : '📱 Phone'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type={searchType === 'email' ? 'email' : 'tel'}
                placeholder={searchType === 'email'
                  ? 'Enter buyer email address...'
                  : 'Enter buyer phone number...'}
                value={query}
                onChange={e => setQuery(e.target.value)}
                required
                style={{
                  flex: '1 1 280px', padding: '14px 18px',
                  borderRadius: '12px', fontSize: '14px',
                  border: '1.5px solid #e2e8f0',
                  background: '#f8f9fc', color: '#0a1628',
                  outline: 'none', fontFamily: 'Sora, sans-serif'
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '14px 28px', borderRadius: '12px',
                  border: 'none', fontSize: '14px', fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? '#94a3b8' : '#E3001B',
                  color: 'white', fontFamily: 'Sora, sans-serif',
                  flexShrink: 0
                }}
              >
                {loading ? 'Analysing...' : '🔍 Check Risk'}
              </button>
            </div>
          </form>

          {/* Quick test buttons */}
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
              Quick test:
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { email: 'fraudster@gmail.com', label: 'Critical Risk' },
                { email: 'suspicious@yahoo.com', label: 'High Risk' },
                { email: 'goodbuyer@gmail.com', label: 'Low Risk' },
              ].map(item => (
                <button
                  key={item.email}
                  onClick={() => {
                    setSearchType('email')
                    setQuery(item.email)
                  }}
                  style={{
                    padding: '6px 12px', borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: 'white', color: '#64748b',
                    fontSize: '12px', cursor: 'pointer',
                    fontFamily: 'Sora, sans-serif'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2', color: '#dc2626',
            border: '1px solid #fecaca', borderRadius: '12px',
            padding: '16px', marginBottom: '20px', fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{
            background: 'white', borderRadius: '20px',
            border: '1px solid #e2e8f0', padding: '48px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔍</div>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Analysing buyer across network — checking 8 fraud signals...
            </p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>

            {/* Risk Score Card */}
            <div style={{
              flex: '1 1 280px',
              background: 'white', borderRadius: '20px',
              border: '1px solid #e2e8f0', padding: '32px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px', fontWeight: '500' }}>
                RISK SCORE
              </p>

              <RiskMeter score={result.risk.score} color={result.risk.color} />

              <div style={{ marginTop: '24px' }}>
                {(() => {
                  const c = getRiskColors(result.risk.color)
                  return (
                    <span style={{
                      background: c.bg, color: c.text,
                      border: `1px solid ${c.border}`,
                      padding: '8px 20px', borderRadius: '20px',
                      fontSize: '14px', fontWeight: '700'
                    }}>
                      {result.risk.label}
                    </span>
                  )
                })()}
              </div>

              <p style={{
                marginTop: '20px', fontSize: '13px',
                color: '#64748b', lineHeight: '1.6'
              }}>
                {result.risk.recommendation}
              </p>

              {/* Stats row */}
              <div style={{
                display: 'flex', justifyContent: 'space-around',
                marginTop: '24px', paddingTop: '24px',
                borderTop: '1px solid #f1f5f9'
              }}>
                {[
                  { label: 'Chargebacks', value: result.risk.total_chargebacks },
                  { label: 'Last 30 days', value: result.risk.recent_chargebacks },
                  { label: 'Merchants', value: result.risk.merchants_affected },
                ].map(stat => (
                  <div key={stat.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#0a1628' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signals Card */}
            <div style={{
              flex: '2 1 340px',
              display: 'flex', flexDirection: 'column', gap: '20px'
            }}>

              {/* Fraud signals */}
              {result.risk.signals?.length > 0 && (
                <div style={{
                  background: 'white', borderRadius: '20px',
                  border: '1px solid #e2e8f0', padding: '24px'
                }}>
                  <h3 style={{
                    fontSize: '15px', fontWeight: '700',
                    color: '#0a1628', marginBottom: '4px'
                  }}>
                    🚨 Fraud Signals Detected
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
                    {result.risk.signals.length} signal(s) flagged by ChargeGuard AI
                  </p>
                  <div>
                    {result.risk.signals.map((signal, i) => (
                      <SignalItem key={i} text={signal} />
                    ))}
                  </div>
                </div>
              )}

              {/* Legitimacy notes */}
              {result.risk.legitimacy_notes?.length > 0 && (
                <div style={{
                  background: 'white', borderRadius: '20px',
                  border: '1px solid #e2e8f0', padding: '24px'
                }}>
                  <h3 style={{
                    fontSize: '15px', fontWeight: '700',
                    color: '#0a1628', marginBottom: '4px'
                  }}>
                    ✅ Legitimacy Indicators
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
                    Factors suggesting this may be a genuine dispute
                  </p>
                  <div>
                    {result.risk.legitimacy_notes.map((note, i) => (
                      <LegitimacyItem key={i} text={note} />
                    ))}
                  </div>
                </div>
              )}

              {/* No history */}
              {!result.found && (
                <div style={{
                  background: '#f0fdf4', borderRadius: '20px',
                  border: '1px solid #bbf7d0', padding: '24px'
                }}>
                  <h3 style={{
                    fontSize: '15px', fontWeight: '700',
                    color: '#16a34a', marginBottom: '8px'
                  }}>
                    ✅ No History Found
                  </h3>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                    This buyer has no chargeback history on the ChargeGuard network.
                    They appear to be a first-time or clean buyer.
                  </p>
                </div>
              )}

              {/* Recommendation box */}
              <div style={{
                background: '#0a1628', borderRadius: '20px',
                padding: '24px'
              }}>
                <h3 style={{
                  fontSize: '15px', fontWeight: '700',
                  color: 'white', marginBottom: '12px'
                }}>
                  ChargeGuard Recommendation
                </h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6' }}>
                  {result.risk.recommendation}
                </p>
                <div style={{
                  marginTop: '16px', paddingTop: '16px',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '12px', color: '#64748b'
                }}>
                  Powered by ChargeGuard AI · 8 signals analysed · Squad network data
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && searched === false && (
          <div style={{
            background: 'white', borderRadius: '20px',
            border: '1px solid #e2e8f0', padding: '48px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🛡️</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0a1628', marginBottom: '8px' }}>
              Search a buyer before you accept payment
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
              Enter a buyer's email or phone number above.
              ChargeGuard will check their history across the entire merchant network instantly.
            </p>
          </div>
        )}

      </main>
    </div>
  )
}