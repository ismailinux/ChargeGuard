import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('merchant', JSON.stringify(res.data.merchant))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
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
        width: '50%',
        minWidth: '320px',
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
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: '800',
            color: 'white', lineHeight: '1.15',
            marginBottom: '20px'
          }}>
            Protect your<br />
            business from<br />
            <span style={{ color: '#E3001B' }}>chargeback fraud.</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 'clamp(14px, 1.5vw, 16px)', lineHeight: '1.6' }}>
            Nigeria's first AI-powered buyer trust network.
            Know your customer's risk before you accept payment.
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '16px'
        }}>
          {[
            { label: 'Merchants Protected', value: '2,400+' },
            { label: 'Fraud Prevented', value: '₦180M+' },
            { label: 'Risk Signals', value: '8 AI' },
            { label: 'Response Time', value: '<1s' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ fontSize: 'clamp(18px, 2vw, 24px)', fontWeight: '700', color: 'white' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                {stat.label}
              </div>
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
            fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: '700',
            color: '#0a1628', marginBottom: '8px'
          }}>
            Welcome back
          </h2>
          <p style={{ color: '#64748b', marginBottom: '36px', fontSize: '15px' }}>
            Sign in to your merchant account
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
            <div style={{ marginBottom: '20px' }}>
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

            <div style={{ marginBottom: '28px' }}>
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: '24px',
            fontSize: '14px', color: '#64748b'
          }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{
              color: '#E3001B', fontWeight: '700',
              textDecoration: 'none'
            }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}