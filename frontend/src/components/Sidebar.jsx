import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: '▦' },
  { path: '/risk', label: 'Risk Search', icon: '⊕' },
  { path: '/disputes', label: 'Disputes', icon: '⚑' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const merchant = JSON.parse(localStorage.getItem('merchant') || '{}')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('merchant')
    navigate('/login')
  }

  const handleNav = (path) => {
    navigate(path)
    setMobileOpen(false)
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '10px', marginBottom: '48px'
      }}>
        <div style={{
          width: '36px', height: '36px',
          borderRadius: '8px', background: '#E3001B',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '800', color: 'white', fontSize: '13px',
          flexShrink: 0
        }}>CG</div>
        <span style={{ color: 'white', fontWeight: '700', fontSize: '17px' }}>
          ChargeGuard
        </span>
      </div>

      {/* Nav Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {navItems.map(item => {
          const active = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              style={{
                display: 'flex', alignItems: 'center',
                gap: '12px', padding: '12px 16px',
                borderRadius: '10px', border: 'none',
                cursor: 'pointer', textAlign: 'left',
                width: '100%', fontSize: '14px',
                fontWeight: active ? '600' : '400',
                fontFamily: 'Sora, sans-serif',
                background: active ? 'rgba(227,0,27,0.15)' : 'transparent',
                color: active ? '#ff6b7a' : '#94a3b8',
                transition: 'all 0.15s'
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px', padding: '16px',
          marginBottom: '12px'
        }}>
          <div style={{
            fontSize: '13px', fontWeight: '600',
            color: 'white', marginBottom: '4px',
            overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {merchant.business_name || 'My Business'}
          </div>
          <div style={{
            fontSize: '12px', color: '#64748b',
            overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {merchant.email || ''}
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '11px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#94a3b8',
            fontSize: '13px', fontWeight: '500',
            cursor: 'pointer', fontFamily: 'Sora, sans-serif'
          }}
        >
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <div style={{
        width: '240px',
        minHeight: '100vh',
        background: '#0a1628',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 20px',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}
        className="desktop-sidebar"
      >
        <NavContent />
      </div>

      {/* ── Mobile Top Bar ── */}
      <div
        className="mobile-topbar"
        style={{
          display: 'none',
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: '60px',
          background: '#0a1628',
          zIndex: 100,
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '8px', background: '#E3001B',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800', color: 'white', fontSize: '12px'
          }}>CG</div>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>
            ChargeGuard
          </span>
        </div>

        {/* Hamburger Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'transparent', border: 'none',
            cursor: 'pointer', padding: '8px',
            display: 'flex', flexDirection: 'column',
            gap: '5px', alignItems: 'flex-end'
          }}
        >
          <span style={{
            display: 'block', height: '2px',
            background: 'white', borderRadius: '2px',
            transition: 'all 0.2s',
            width: mobileOpen ? '24px' : '24px',
            transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
          }} />
          <span style={{
            display: 'block', height: '2px',
            background: 'white', borderRadius: '2px',
            transition: 'all 0.2s',
            width: '18px',
            opacity: mobileOpen ? 0 : 1
          }} />
          <span style={{
            display: 'block', height: '2px',
            background: 'white', borderRadius: '2px',
            transition: 'all 0.2s',
            width: '24px',
            transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
          }} />
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: '60px', left: 0, right: 0, bottom: 0,
            zIndex: 99,
            display: 'flex'
          }}
          className="mobile-drawer"
        >
          {/* Drawer panel */}
          <div style={{
            width: '260px',
            background: '#0a1628',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 20px',
            overflowY: 'auto'
          }}>
            <NavContent />
          </div>

          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(2px)'
            }}
          />
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-topbar { display: none !important; }
          .mobile-drawer { display: none !important; }
        }
      `}</style>
    </>
  )
}