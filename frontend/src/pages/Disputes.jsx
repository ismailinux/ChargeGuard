import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const StatusBadge = ({ action }) => {
  const map = {
    '1': { label: 'Pending', bg: '#fffbeb', text: '#d97706' },
    '2': { label: 'Accepted', bg: '#f0fdf4', text: '#16a34a' },
    '3': { label: 'Rejected', bg: '#fef2f2', text: '#dc2626' },
  };
  const s = map[action] || map['1'];
  return (
    <span style={{
      background: s.bg,
      color: s.text,
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    }}>
      {s.label}
    </span>
  );
};

const formatAmount = (kobo) => {
  if (!kobo) return '—';
  return '₦' + (parseInt(kobo) / 100).toLocaleString('en-NG');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export default function Disputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [building, setBuilding] = useState(false);
  const [defenceCase, setDefenceCase] = useState(null);
  const [filter, setFilter] = useState('all');
  const [submitted, setSubmitted] = useState({});

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/disputes', {
        headers: { Authorization: `Bearer ${token}` }
      });

      let data = res.data?.data || [];
      if (data.rows) data = data.rows;

      setDisputes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = disputes.filter(d => {
    if (filter === 'pending') return d.status === 'pending' || d.squad_status === 'open';
    if (filter === 'rejected') return d.action === '3' || d.status === 'closed';
    if (filter === 'accepted') return d.action === '2';
    return true;
  });

  const buildDefence = async (dispute) => {
    setBuilding(true);
    setDefenceCase(null);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        dispute_id: dispute.id,
        ticket_id: dispute.squad_ticket_id,
        amount: dispute.amount,
        reason: dispute.reason,
        raised_at: dispute.raised_at,
        customer_email: dispute.customers?.email || dispute.email
      };

      const res = await axios.post(
        'http://localhost:5000/api/defence/generate',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const fullText = res.data.defenceText || res.data.defence || '';

        setDefenceCase({
          fullText: fullText,
          confidence: res.data.confidence || 78,
          evidence: res.data.evidence || [],
          recommendation: res.data.recommendation || "Review and submit the defence to Squad.",
          pdfUrl: res.data.pdfUrl || null
        });
      } else {
        alert(res.data.message || "Failed to generate defence");
      }
    } catch (err) {
      console.error("🚨 Error:", err);
      alert(err.response?.data?.message || "Failed to generate defence. Check console.");
    } finally {
      setBuilding(false);
    }
  };

  const handleSubmit = (ticketId) => {
    setSubmitted(prev => ({ ...prev, [ticketId]: true }));
    // Add API call to submit to Squad later
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fc' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Loading disputes...</p>
        </main>
      </div>
    );
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
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontSize: 'clamp(22px, 3vw, 28px)',
            fontWeight: '800',
            color: '#0a1628',
            marginBottom: '6px'
          }}>
            Disputes
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Manage chargebacks and let ChargeGuard AI build your defence automatically.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total', value: disputes.length, color: '#0a1628' },
            { label: 'Pending', value: disputes.filter(d => d.status === 'pending' || d.squad_status === 'open').length, color: '#d97706' },
            { label: 'Rejected', value: disputes.filter(d => d.action === '3').length, color: '#dc2626' },
            { label: 'Accepted', value: disputes.filter(d => d.action === '2').length, color: '#16a34a' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '22px', fontWeight: '800', color: stat.color }}>
                {stat.value}
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'rejected', 'accepted'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: filter === f ? 'none' : '1px solid #e2e8f0',
                background: filter === f ? '#0a1628' : 'white',
                color: filter === f ? 'white' : '#64748b',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'Sora, sans-serif',
                textTransform: 'capitalize'
              }}
            >
              {f === 'all' ? 'All disputes' : f}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

          {/* Dispute List */}
          <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.length > 0 ? (
              filtered.map(dispute => (
                <div
                  key={dispute.id || dispute.squad_ticket_id}
                  onClick={() => { setSelected(dispute); setDefenceCase(null); }}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    border: selected?.id === dispute.id || selected?.squad_ticket_id === dispute.squad_ticket_id
                      ? '2px solid #E3001B'
                      : '1px solid #e2e8f0',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'border 0.15s'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#0a1628', marginBottom: '3px' }}>
                        {dispute.customers?.email || dispute.email || 'Unknown Buyer'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {dispute.squad_ticket_id || dispute.ticket_id} • {formatDate(dispute.raised_at)}
                      </div>
                    </div>
                    <StatusBadge action={dispute.action} />
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#0a1628' }}>
                        {formatAmount(dispute.amount)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{dispute.reason}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {(dispute.defence_submitted || submitted[dispute.squad_ticket_id || dispute.id]) && (
                        <span style={{
                          fontSize: '11px',
                          color: '#16a34a',
                          background: '#f0fdf4',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: '600'
                        }}>✓ Defence filed</span>
                      )}
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#0a1628' }}>
                        {(dispute.customers?.trust_score || 50)}/100
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                No disputes found.
              </p>
            )}
          </div>

          {/* Detail Panel */}
          {selected && (
            <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Dispute Details */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0a1628', marginBottom: '16px' }}>
                  Dispute Details
                </h3>

                {[
                  { label: 'Ticket ID', value: selected.squad_ticket_id || selected.ticket_id },
                  { label: 'Customer', value: selected.customers?.email || selected.email },
                  { label: 'Amount', value: formatAmount(selected.amount) },
                  { label: 'Reason', value: selected.reason },
                  { label: 'Filed on', value: formatDate(selected.raised_at) },
                  { label: 'IP Address', value: selected.ip_address || '—' },
                  { label: 'Buyer Risk', value: `${selected.customers?.trust_score || 50}/100` },
                  { label: 'Rejection Attempts', value: `${selected.rejection_attempt_count || 0} times` },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '9px 0',
                    borderBottom: '1px solid #f1f5f9',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#0a1628' }}>
                      {item.value}
                    </span>
                  </div>
                ))}

                <button
                  onClick={() => buildDefence(selected)}
                  disabled={building}
                  style={{
                    width: '100%',
                    marginTop: '20px',
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: 'white',
                    background: building ? '#94a3b8' : '#E3001B',
                    cursor: building ? 'not-allowed' : 'pointer',
                    fontFamily: 'Sora, sans-serif'
                  }}
                >
                  {building ? '⚙ Building defence case...' : '🤖 Build AI Defence Case'}
                </button>
              </div>

              {/* AI Defence Case - Improved Version */}
              {defenceCase && (
                <div style={{
                  background: '#0a1628',
                  borderRadius: '16px',
                  padding: '24px',
                  color: 'white'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <h3 style={{ fontSize: '17px', fontWeight: '700' }}>
                      AI Defence Case
                    </h3>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: defenceCase.confidence >= 75 ? '#4ade80' : '#fbbf24',
                      background: 'rgba(255,255,255,0.1)',
                      padding: '5px 12px',
                      borderRadius: '20px'
                    }}>
                      {defenceCase.confidence}% Confidence
                    </span>
                  </div>

                  {/* Full Defence Letter */}
                  <div style={{
                    background: 'rgba(255,255,255,0.08)',
                    padding: '20px',
                    borderRadius: '12px',
                    lineHeight: '1.65',
                    fontSize: '13.5px',
                    marginBottom: '24px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {defenceCase.fullText}
                  </div>

                  {/* Evidence Points */}
                  {defenceCase.evidence && defenceCase.evidence.length > 0 && (
                    <>
                      <p style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#E3001B',
                        marginBottom: '12px',
                        letterSpacing: '0.5px'
                      }}>
                        KEY EVIDENCE POINTS
                      </p>
                      <div style={{ marginBottom: '24px' }}>
                        {defenceCase.evidence.map((point, i) => (
                          <div key={i} style={{
                            display: 'flex',
                            gap: '12px',
                            marginBottom: '11px',
                            fontSize: '13.2px',
                            lineHeight: '1.5'
                          }}>
                            <span style={{
                              color: '#E3001B',
                              fontWeight: '700',
                              flexShrink: 0,
                              marginTop: '2px'
                            }}>
                              {i + 1}.
                            </span>
                            <span style={{ color: '#cbd5e1' }}>{point}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Recommendation */}
                  {defenceCase.recommendation && (
                    <div style={{
                      background: 'rgba(227, 0, 27, 0.15)',
                      borderLeft: '4px solid #E3001B',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '24px'
                    }}>
                      <p style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#E3001B',
                        marginBottom: '6px'
                      }}>
                        RECOMMENDATION
                      </p>
                      <p style={{ fontSize: '13.5px', color: 'white', lineHeight: '1.6' }}>
                        {defenceCase.recommendation}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  {submitted[selected.squad_ticket_id || selected.id] ? (
                    <div style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '10px',
                      background: '#16a34a',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '700',
                      textAlign: 'center'
                    }}>
                      ✓ Defence Submitted to Squad
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubmit(selected.squad_ticket_id || selected.id)}
                      style={{
                        width: '100%',
                        padding: '15px',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#E3001B',
                        color: 'white',
                        fontSize: '14.5px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Submit Defence to Squad →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}