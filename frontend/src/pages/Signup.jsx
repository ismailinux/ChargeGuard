import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
    business_name: '',
    squad_api_key: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API_URL}/api/auth/signup`, form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('merchant', JSON.stringify(res.data.merchant))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    borderRadius: '12px', fontSize: '14px',
    border: '1.5px solid #e2e8f0',
    background: 'white', color: '#0a1628',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Sora, sans-serif'
  }

  const labelStyle = {
    display: 'block', fontSize: '14px',
    fontWeight: '600', color: '#0a1628',
    marginBottom: '8px'
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexWrap: 'wrap', background: '#f8f9fc' }}>

      {/* Left Panel */}
      <div style={{
        flex: '1 1 320px',
        background: '#0a1628',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(32px, 5vw, 48px)',
        gap: '48px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '10px', background: '#E3001B',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800', color: 'white', fontSize: '14px',
            flexShrink: 0
          }}>CG</div>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '20px' }}>ChargeGuard</span>
          <span style={{
            fontSize: '11px', padding: '3px 10px',
            borderRadius: '20px',
            background: 'rgba(227,0,27,0.2)', color: '#ff6b7a'
          }}>by Squad</span>
        </div>

        {/* Hero text */}
        <div>
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: '800',
            color: 'white', lineHeight: '1.15',
            marginBottom: '20px'
          }}>
            Join Nigeria's<br />
            fraud intelligence<br />
            <span style={{ color: '#E3001B' }}>network.</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 'clamp(14px, 1.5vw, 16px)', lineHeight: '1.6' }}>
            Connect your Squad account and start protecting
            your business from fraudulent chargebacks today.
          </p>
        </div>

        {/* How it works */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '16px', padding: '24px'
        }}>
          <div style={{
            fontSize: '13px', color: '#94a3b8',
            marginBottom: '16px', fontWeight: '600',
            letterSpacing: '0.05em'
          }}>
            HOW IT WORKS
          </div>
          {[
            { step: '01', text: 'Connect your Squad API key' },
            { step: '02', text: 'Search any buyer before payment' },
            { step: '03', text: 'Get an instant AI risk score' },
            { step: '04', text: 'Auto-defend chargebacks in 24hrs' },
          ].map(item => (
            <div key={item.step} style={{
              display: 'flex', alignItems: 'center',
              gap: '16px', marginBottom: '14px'
            }}>
              <span style={{
                fontSize: '11px', fontWeight: '700',
                color: '#E3001B', minWidth: '24px', flexShrink: 0
              }}>{item.step}</span>
              <span style={{ color: 'white', fontSize: '14px' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        flex: '1 1 320px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(32px, 5vw, 48px)',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 30px)',
            fontWeight: '700',
            color: '#0a1628', marginBottom: '8px'
          }}>
            Create your account
          </h2>
          <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '15px' }}>
            Start protecting your business today
          </p>

          {error && (
            <div style={{
              background: '#fef2f2', color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '10px', padding: '14px 16px',
              marginBottom: '24px', fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>Business name</label>
              <input
                type="text"
                placeholder="Emeka's Fashion Store"
                value={form.business_name}
                onChange={e => setForm({ ...form, business_name: e.target.value })}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>Email address</label>
              <input
                type="email"
                placeholder="you@business.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={labelStyle}>Squad API Key</label>
              <input
                type="text"
                placeholder="sandbox_sk_..."
                value={form.squad_api_key}
                onChange={e => setForm({ ...form, squad_api_key: e.target.value })}
                required
                style={inputStyle}
              />
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                Found in your Squad dashboard under Settings → API Keys
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '15px',
                borderRadius: '12px', fontSize: '15px',
                fontWeight: '700', color: 'white',
                background: loading ? '#94a3b8' : '#E3001B',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Sora, sans-serif'
              }}
            >
              {loading ? 'Validating Squad key...' : 'Create account'}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: '24px',
            fontSize: '14px', color: '#64748b'
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{
              color: '#E3001B', fontWeight: '700',
              textDecoration: 'none'
            }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}