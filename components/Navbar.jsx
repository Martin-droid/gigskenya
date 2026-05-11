import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LayoutDashboard, LogOut, Zap, Building2, Laptop } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [mob, setMob] = useState(false);
  const [drop, setDrop] = useState(false);
  const { user, profile, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setDrop(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const active = path => loc.pathname === path;
  const initials = (profile?.displayName || user?.email || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

  const nl = (to, label) => (
    <Link to={to} onClick={() => setMob(false)} style={{ fontSize:14, fontWeight:500, padding:'6px 12px', borderRadius:'var(--r-sm)', color: active(to)?'var(--green)':'var(--grey-600)', background: active(to)?'var(--green-light)':'transparent', transition:'all .15s' }}>
      {label}
    </Link>
  );

  return (
    <>
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, background:'rgba(250,250,248,.94)', backdropFilter:'blur(14px)', borderBottom:'1px solid var(--grey-200)' }}>
      <div style={{ maxWidth:1160, margin:'0 auto', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:34, height:34, background:'var(--ink)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={18} color="var(--green)" fill="var(--green)" />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:19, color:'var(--ink)', letterSpacing:'-.03em' }}>
            Gigs<span style={{ color:'var(--green)' }}>Kenya</span>
          </span>
        </Link>

        <div className="desk" style={{ display:'flex', alignItems:'center', gap:2 }}>
          {nl('/browse', 'Browse Jobs')}
          {nl('/talent', 'Find Talent')}
          {nl('/how-it-works', 'How It Works')}
        </div>

        <div className="desk" style={{ display:'flex', alignItems:'center', gap:10 }}>
          {isAuthenticated ? (
            <>
              <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ padding:'9px 18px', fontSize:13 }}>
                <LayoutDashboard size={14} /> Dashboard
              </button>
              <div ref={ref} style={{ position:'relative' }}>
                <button onClick={() => setDrop(!drop)} style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 10px 5px 6px', borderRadius:'var(--r-full)', border:'1.5px solid var(--grey-200)', background:'white', cursor:'pointer', transition:'border-color .15s' }}
                  onMouseOver={e=>e.currentTarget.style.borderColor='var(--grey-300)'}
                  onMouseOut={e=>e.currentTarget.style.borderColor='var(--grey-200)'}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:700, fontSize:12, color:'white', overflow:'hidden', flexShrink:0 }}>
                    {user?.photoURL ? <img src={user.photoURL} style={{ width:30, height:30 }} alt="" /> : initials}
                  </div>
                  <ChevronDown size={13} color="var(--grey-500)" style={{ transform: drop?'rotate(180deg)':'none', transition:'transform .2s' }} />
                </button>
                {drop && (
                  <div style={{ position:'absolute', right:0, top:'calc(100% + 8px)', background:'white', border:'1px solid var(--grey-200)', borderRadius:'var(--r-lg)', boxShadow:'var(--shadow-lg)', width:210, overflow:'hidden', animation:'fadeUp .15s ease' }}>
                    <div style={{ padding:'13px 16px', borderBottom:'1px solid var(--grey-150)' }}>
                      <p style={{ fontWeight:600, fontSize:13, color:'var(--ink)' }}>{profile?.displayName || user?.email?.split('@')[0]}</p>
                      <p style={{ fontSize:11, color:'var(--grey-400)', marginTop:2 }}>{user?.email}</p>
                      <span style={{ marginTop:6, display:'inline-block', fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:'var(--r-full)', background: profile?.role==='talent'?'var(--gold-light)':'var(--green-light)', color: profile?.role==='talent'?'var(--gold)':'var(--green-dark)' }}>
                        {profile?.role === 'talent' ? 'Talent' : 'Hirer'}
                      </span>
                    </div>
                    <button onClick={()=>{navigate('/dashboard');setDrop(false)}} style={{ width:'100%', padding:'11px 16px', background:'none', border:'none', display:'flex', alignItems:'center', gap:10, fontSize:13, color:'var(--grey-700)', cursor:'pointer' }}
                      onMouseOver={e=>e.currentTarget.style.background='var(--grey-100)'}
                      onMouseOut={e=>e.currentTarget.style.background='none'}>
                      <LayoutDashboard size={14} color="var(--grey-400)" /> Dashboard
                    </button>
                    <div style={{ height:1, background:'var(--grey-150)' }} />
                    <button onClick={()=>{logout();setDrop(false)}} style={{ width:'100%', padding:'11px 16px', background:'none', border:'none', display:'flex', alignItems:'center', gap:10, fontSize:13, color:'var(--red)', cursor:'pointer' }}
                      onMouseOver={e=>e.currentTarget.style.background='var(--red-light)'}
                      onMouseOut={e=>e.currentTarget.style.background='none'}>
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={()=>navigate('/login?role=hirer')}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:9, border:'1.5px solid #99F6E4', background:'#F0FDFA', color:'#0F766E', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all .15s', whiteSpace:'nowrap' }}
                onMouseOver={e=>{e.currentTarget.style.background='#CCFBF1';e.currentTarget.style.borderColor='#5EEAD4';}}
                onMouseOut={e=>{e.currentTarget.style.background='#F0FDFA';e.currentTarget.style.borderColor='#99F6E4';}}>
                <Building2 size={14}/> I'm Hiring
              </button>
              <button onClick={()=>navigate('/login?role=talent')}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:9, border:'none', background:'#16A34A', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all .15s', whiteSpace:'nowrap' }}
                onMouseOver={e=>e.currentTarget.style.background='#15803D'}
                onMouseOut={e=>e.currentTarget.style.background='#16A34A'}>
                <Zap size={14}/> Find Work
              </button>
            </>
          )}
        </div>

        <button className="mob-btn" onClick={()=>setMob(!mob)} style={{ display:'none', background:'none', border:'none', color:'var(--ink)' }}>
          {mob ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>

      {mob && (
        <div style={{ background:'white', borderTop:'1px solid var(--grey-200)', padding:'12px 24px 20px' }}>
          {[{to:'/browse',l:'Browse Jobs'},{to:'/talent',l:'Find Talent'},{to:'/how-it-works',l:'How It Works'}].map(({to,l})=>(
            <Link key={to} to={to} onClick={()=>setMob(false)} style={{ display:'block', padding:'12px 0', fontSize:15, color:'var(--grey-700)', borderBottom:'1px solid var(--grey-100)', fontWeight:500 }}>{l}</Link>
          ))}
          <div style={{ display:'flex', gap:10, marginTop:16 }}>
            {isAuthenticated ? (
              <button onClick={()=>{navigate('/dashboard');setMob(false)}} className="btn-primary" style={{ flex:1, justifyContent:'center' }}>Dashboard</button>
            ) : (
              <>
                <button onClick={()=>{navigate('/login?role=hirer');setMob(false)}}
                  style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'11px', borderRadius:9, border:'1.5px solid #99F6E4', background:'#F0FDFA', color:'#0F766E', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  <Building2 size={14}/> Hire
                </button>
                <button onClick={()=>{navigate('/login?role=talent');setMob(false)}}
                  style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'11px', borderRadius:9, border:'none', background:'#16A34A', color:'white', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  <Zap size={14}/> Find Work
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>

    {/* Mobile sticky CTA bar — only shown when logged out */}
    {!isAuthenticated && (
      <div className="mob-cta-bar" style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:199, background:'white', borderTop:'1px solid #E2E8F0', padding:'10px 16px', display:'none', gap:10, boxShadow:'0 -4px 20px rgba(0,0,0,.08)', paddingBottom:'calc(10px + env(safe-area-inset-bottom))' }}>
        <button onClick={()=>navigate('/login?role=hirer')}
          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'13px', borderRadius:11, border:'1.5px solid #99F6E4', background:'#F0FDFA', color:'#0F766E', fontSize:14, fontWeight:700, cursor:'pointer' }}>
          <Building2 size={15}/> I'm Hiring
        </button>
        <button onClick={()=>navigate('/login?role=talent')}
          style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'13px', borderRadius:11, border:'none', background:'#16A34A', color:'white', fontSize:14, fontWeight:700, cursor:'pointer' }}>
          <Zap size={15}/> Find Work
        </button>
      </div>
    )}
    </>
  );
}
