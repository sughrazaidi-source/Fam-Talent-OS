import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'

const STAGES = ['Sourced', 'Outreach', 'Screening', 'Interview', 'Offer', 'Hired']
const STAGE_COLOR = {
  Sourced: '#7F77DD', Outreach: '#D85A30', Screening: '#378ADD',
  Interview: '#BA7517', Offer: '#1D9E75', Hired: '#639922',
}
const OWNERS = ['All', 'Riya', 'Karan']

const s = (obj) => Object.entries(obj).map(([k, v]) => `${k}:${v}`).join(';')

function Avatar({ name }) {
  const i = name.split(' ').map(w => w[0]).join('').slice(0, 2)
  const colors = ['#7F77DD','#1D9E75','#D85A30','#378ADD','#BA7517']
  const bg = colors[name.charCodeAt(0) % colors.length]
  return <div style={s({ width:32,height:32,borderRadius:'50%',background:bg+'33',color:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:500,border:`1.5px solid ${bg}55`,flexShrink:0 })}>{i}</div>
}

function Badge({ stage }) {
  const c = STAGE_COLOR[stage]
  return <span style={s({ background:c+'22',color:c,border:`1px solid ${c}44`,borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:500,whiteSpace:'nowrap' })}>{stage}</span>
}

function SrcBadge({ source }) {
  const m = { LinkedIn:'#0077B5', Referral:'#7F77DD', Clay:'#1D9E75', Inbound:'#D85A30' }
  const c = m[source] || '#888'
  return <span style={s({ background:c+'18',color:c,border:`1px solid ${c}33`,borderRadius:20,padding:'2px 8px',fontSize:11 })}>{source}</span>
}

function Stat({ label, value, color }) {
  return (
    <div style={s({ background:'#f0efe8',border:'1px solid #e0dfd6',borderRadius:12,padding:'16px 20px',flex:1,minWidth:120 })}>
      <div style={s({ fontSize:26,fontWeight:500,color:color||'#1a1a18' })}>{value}</div>
      <div style={s({ fontSize:13,color:'#666',marginTop:2 })}>{label}</div>
    </div>
  )
}

function Modal({ jobs, onAdd, onClose }) {
  const [f, setF] = useState({ name:'',email:'',company:'',role:jobs[0]?.title||'',source:'LinkedIn',owner:'Riya',notes:'' })
  const set = (k,v) => setF(p => ({...p,[k]:v}))
  const inp = { width:'100%',padding:'8px 10px',borderRadius:8,border:'1px solid #ccc',background:'#fff',fontSize:13,boxSizing:'border-box' }
  const lbl = { fontSize:12,color:'#666',marginBottom:4,display:'block' }
  return (
    <div style={s({ position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200 })}>
      <div style={s({ background:'#fff',borderRadius:16,padding:28,width:440,maxWidth:'90vw',border:'1px solid #ddd' })}>
        <div style={s({ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 })}>
          <div style={s({ fontWeight:500,fontSize:16 })}>Add candidate</div>
          <button onClick={onClose} style={s({ background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888' })}>×</button>
        </div>
        <div style={s({ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 })}>
          {[['Full name','name'],['Email','email'],['Current company','company']].map(([l,k]) => (
            <div key={k}>
              <label style={lbl}>{l}</label>
              <input style={inp} value={f[k]} onChange={e=>set(k,e.target.value)} placeholder={l} />
            </div>
          ))}
          <div>
            <label style={lbl}>Applying for</label>
            <select style={inp} value={f.role} onChange={e=>set('role',e.target.value)}>
              {jobs.map(j=><option key={j.id}>{j.title}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Source</label>
            <select style={inp} value={f.source} onChange={e=>set('source',e.target.value)}>
              {['LinkedIn','Referral','Clay','Inbound'].map(x=><option key={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Owner</label>
            <select style={inp} value={f.owner} onChange={e=>set('owner',e.target.value)}>
              {['Riya','Karan'].map(x=><option key={x}>{x}</option>)}
            </select>
          </div>
        </div>
        <div style={s({ marginTop:12 })}>
          <label style={lbl}>Notes</label>
          <textarea style={s({...inp,height:60,resize:'none'})} value={f.notes} onChange={e=>set('notes',e.target.value)} placeholder="Any context..." />
        </div>
        <div style={s({ display:'flex',gap:10,marginTop:20,justifyContent:'flex-end' })}>
          <button onClick={onClose} style={s({ padding:'8px 18px',borderRadius:8,border:'1px solid #ccc',background:'none',color:'#666',cursor:'pointer',fontSize:13 })}>Cancel</button>
          <button onClick={()=>{ if(f.name&&f.email){onAdd(f);onClose()} }} style={s({ padding:'8px 18px',borderRadius:8,border:'none',background:'#7F77DD',color:'#fff',cursor:'pointer',fontSize:13,fontWeight:500 })}>Add candidate</button>
        </div>
      </div>
    </div>
  )
}

function Drawer({ c, onClose, onStageChange, onNotesChange }) {
  const [notes, setNotes] = useState(c.notes||'')
  const row = (k,v) => (
    <div style={s({ display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:6 })}>
      <span style={s({ color:'#888' })}>{k}</span><span>{v}</span>
    </div>
  )
  return (
    <div style={s({ position:'fixed',right:0,top:0,bottom:0,width:340,background:'#fff',borderLeft:'1px solid #e0dfd6',padding:24,overflowY:'auto',zIndex:100 })}>
      <div style={s({ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20 })}>
        <div style={s({ display:'flex',gap:12,alignItems:'center' })}>
          <Avatar name={c.name} />
          <div>
            <div style={s({ fontWeight:500,fontSize:15 })}>{c.name}</div>
            <div style={s({ fontSize:12,color:'#888' })}>{c.company}</div>
          </div>
        </div>
        <button onClick={onClose} style={s({ background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888' })}>×</button>
      </div>
      <div style={s({ background:'#f8f7f4',borderRadius:10,padding:14,marginBottom:14 })}>
        <div style={s({ fontSize:11,color:'#aaa',marginBottom:8,textTransform:'uppercase',letterSpacing:.5 })}>Details</div>
        {row('Role',c.role)} {row('Email',c.email)} {row('Source',c.source)} {row('Owner',c.owner)}
      </div>
      <div style={s({ marginBottom:14 })}>
        <div style={s({ fontSize:11,color:'#aaa',marginBottom:8,textTransform:'uppercase',letterSpacing:.5 })}>Move stage</div>
        <div style={s({ display:'flex',flexWrap:'wrap',gap:6 })}>
          {STAGES.map(st => (
            <button key={st} onClick={()=>onStageChange(c.id,st)} style={s({ padding:'5px 12px',borderRadius:20,border:`1px solid ${STAGE_COLOR[st]}55`,background:c.stage===st?STAGE_COLOR[st]+'22':'none',color:STAGE_COLOR[st],fontSize:12,cursor:'pointer',fontWeight:c.stage===st?500:400 })}>{st}</button>
          ))}
        </div>
      </div>
      <div>
        <div style={s({ fontSize:11,color:'#aaa',marginBottom:8,textTransform:'uppercase',letterSpacing:.5 })}>Notes</div>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} onBlur={()=>onNotesChange(c.id,notes)} style={s({ width:'100%',minHeight:80,padding:'8px 10px',borderRadius:8,border:'1px solid #ddd',background:'#f8f7f4',fontSize:13,resize:'vertical',boxSizing:'border-box' })} placeholder="Add notes..." />
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState('pipeline')
  const [candidates, setCandidates] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filterOwner, setFilterOwner] = useState('All')
  const [filterStage, setFilterStage] = useState('All')
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [{ data: cands, error: ce }, { data: js, error: je }] = await Promise.all([
        supabase.from('candidates').select('*').order('created_at', { ascending: false }),
        supabase.from('jobs').select('*').order('created_at')
      ])
      if (ce) throw ce
      if (je) throw je
      setCandidates(cands || [])
      setJobs(js || [])
    } catch (e) {
      setError('Could not connect to database. Check your Supabase environment variables.')
      console.error(e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const addCandidate = async (form) => {
    const { data, error } = await supabase.from('candidates').insert([form]).select().single()
    if (!error && data) setCandidates(cs => [data, ...cs])
  }

  const stageChange = async (id, stage) => {
    const { error } = await supabase.from('candidates').update({ stage }).eq('id', id)
    if (!error) {
      setCandidates(cs => cs.map(c => c.id === id ? { ...c, stage } : c))
      setSelected(s => s?.id === id ? { ...s, stage } : s)
    }
  }

  const notesChange = async (id, notes) => {
    const { error } = await supabase.from('candidates').update({ notes }).eq('id', id)
    if (!error) {
      setCandidates(cs => cs.map(c => c.id === id ? { ...c, notes } : c))
      setSelected(s => s?.id === id ? { ...s, notes } : s)
    }
  }

  const filtered = candidates.filter(c => {
    const ms = !search || [c.name, c.role, c.company].some(f => f?.toLowerCase().includes(search.toLowerCase()))
    const mo = filterOwner === 'All' || c.owner === filterOwner
    const mst = filterStage === 'All' || c.stage === filterStage
    return ms && mo && mst
  })

  const nav = (v) => ({
    padding:'7px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:500,
    background: view===v ? '#7F77DD' : 'none',
    color: view===v ? '#fff' : '#666',
  })

  const inp = { padding:'7px 12px', borderRadius:8, border:'1px solid #ddd', background:'#f0efe8', fontSize:13 }

  if (loading) return (
    <div style={s({ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:12 })}>
      <div style={s({ width:32,height:32,border:'3px solid #e0dfd6',borderTopColor:'#7F77DD',borderRadius:'50%',animation:'spin 0.8s linear infinite' })} />
      <div style={s({ color:'#888',fontSize:14 })}>Loading TalentOS...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (error) return (
    <div style={s({ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:16,padding:40 })}>
      <div style={s({ fontSize:18,fontWeight:500,color:'#D85A30' })}>Connection error</div>
      <div style={s({ fontSize:14,color:'#666',textAlign:'center',maxWidth:440 })}>{error}</div>
      <button onClick={load} style={s({ padding:'8px 20px',borderRadius:8,background:'#7F77DD',color:'#fff',border:'none',cursor:'pointer',fontSize:14 })}>Retry</button>
    </div>
  )

  return (
    <div style={s({ minHeight:'100vh',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' })}>
      <div style={s({ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 20px',borderBottom:'1px solid #e0dfd6',background:'#fff' })}>
        <div style={s({ display:'flex',alignItems:'center',gap:20 })}>
          <div style={s({ fontWeight:600,fontSize:16,color:'#7F77DD',letterSpacing:'-0.3px' })}>TalentOS</div>
          <div style={s({ display:'flex',gap:4 })}>
            {[['pipeline','Pipeline'],['list','All candidates'],['jobs','Jobs'],['analytics','Analytics']].map(([v,l]) => (
              <button key={v} style={nav(v)} onClick={()=>setView(v)}>{l}</button>
            ))}
          </div>
        </div>
        <button onClick={()=>setShowAdd(true)} style={s({ padding:'7px 16px',borderRadius:8,background:'#7F77DD',color:'#fff',border:'none',cursor:'pointer',fontSize:13,fontWeight:500 })}>+ Add candidate</button>
      </div>
      <div style={s({ display:'flex',gap:12,padding:'16px 20px',borderBottom:'1px solid #e0dfd6',background:'#fff' })}>
        <Stat label="Total candidates" value={candidates.length} />
        <Stat label="Active pipeline" value={candidates.filter(c=>c.stage!=='Hired').length} color="#378ADD" />
        <Stat label="Offers out" value={candidates.filter(c=>c.stage==='Offer').length} color="#BA7517" />
        <Stat label="Hired" value={candidates.filter(c=>c.stage==='Hired').length} color="#639922" />
      </div>
      <div style={s({ display:'flex',gap:10,padding:'12px 20px',alignItems:'center',borderBottom:'1px solid #e0dfd6',background:'#fff' })}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search candidates..." style={{...inp,width:220}} />
        <select value={filterOwner} onChange={e=>setFilterOwner(e.target.value)} style={inp}>
          {OWNERS.map(o=><option key={o}>{o}</option>)}
        </select>
        {view!=='pipeline' && (
          <select value={filterStage} onChange={e=>setFilterStage(e.target.value)} style={inp}>
            <option>All</option>
            {STAGES.map(st=><option key={st}>{st}</option>)}
          </select>
        )}
        <div style={s({ marginLeft:'auto',fontSize:12,color:'#aaa' })}>{filtered.length} candidates</div>
      </div>
      <div style={s({ padding:'16px 20px',overflowX:view==='pipeline'?'auto':'visible' })}>
        {view==='pipeline' && (
          <div style={s({ display:'flex',gap:12,minWidth:900 })}>
            {STAGES.map(stage => {
              const cols = filtered.filter(c=>c.stage===stage)
              return (
                <div key={stage} style={s({ flex:1,minWidth:148 })}>
                  <div style={s({ display:'flex',alignItems:'center',gap:6,marginBottom:10 })}>
                    <div style={s({ width:8,height:8,borderRadius:'50%',background:STAGE_COLOR[stage] })} />
                    <span style={s({ fontSize:12,fontWeight:500,color:'#555' })}>{stage}</span>
                    <span style={s({ fontSize:11,color:'#aaa',marginLeft:'auto' })}>{cols.length}</span>
                  </div>
                  <div style={s({ display:'flex',flexDirection:'column',gap:8 })}>
                    {cols.map(c => (
                      <div key={c.id} onClick={()=>setSelected(c)} style={s({ background:'#fff',border:'1px solid #e0dfd6',borderLeft:`3px solid ${STAGE_COLOR[c.stage]}`,borderRadius:10,padding:'10px 12px',cursor:'pointer' })}>
                        <div style={s({ fontSize:13,fontWeight:500,marginBottom:3 })}>{c.name}</div>
                        <div style={s({ fontSize:11,color:'#888',marginBottom:6 })}>{c.role}</div>
                        <div style={s({ display:'flex',alignItems:'center',justifyContent:'space-between' })}>
                          <SrcBadge source={c.source} />
                          <span style={s({ fontSize:11,color:'#aaa' })}>{c.owner}</span>
                        </div>
                      </div>
                    ))}
                    {cols.length===0 && <div style={s({ fontSize:12,color:'#ccc',textAlign:'center',padding:'20px 0' })}>Empty</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {view==='list' && (
          <div style={s({ border:'1px solid #e0dfd6',borderRadius:12,overflow:'hidden',background:'#fff' })}>
            <table style={s({ width:'100%',borderCollapse:'collapse' })}>
              <thead>
                <tr style={s({ background:'#f8f7f4',fontSize:11,color:'#aaa',textAlign:'left' })}>
                  {['Candidate','Role','Company','Stage','Source','Owner'].map(h=>(
                    <th key={h} style={s({ padding:'10px 14px',fontWeight:500 })}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c,i) => (
                  <tr key={c.id} onClick={()=>setSelected(c)} style={s({ borderTop:'1px solid #f0efe8',cursor:'pointer',background:i%2===0?'#fff':'#fafaf8' })}>
                    <td style={s({ padding:'10px 14px' })}>
                      <div style={s({ display:'flex',alignItems:'center',gap:8 })}>
                        <Avatar name={c.name} />
                        <span style={s({ fontSize:13,fontWeight:500 })}>{c.name}</span>
                      </div>
                    </td>
                    <td style={s({ padding:'10px 14px',fontSize:13,color:'#666' })}>{c.role}</td>
                    <td style={s({ padding:'10px 14px',fontSize:13,color:'#666' })}>{c.company}</td>
                    <td style={s({ padding:'10px 14px' })}><Badge stage={c.stage} /></td>
                    <td style={s({ padding:'10px 14px' })}><SrcBadge source={c.source} /></td>
                    <td style={s({ padding:'10px 14px',fontSize:13,color:'#666' })}>{c.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {view==='jobs' && (
          <div style={s({ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:14 })}>
            {jobs.map(j => (
              <div key={j.id} style={s({ background:'#fff',border:'1px solid #e0dfd6',borderRadius:12,padding:18 })}>
                <div style={s({ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 })}>
                  <div style={s({ fontWeight:500,fontSize:14 })}>{j.title}</div>
                  <span style={s({ fontSize:11,background:'#1D9E7522',color:'#1D9E75',border:'1px solid #1D9E7544',borderRadius:20,padding:'2px 8px' })}>{j.status}</span>
                </div>
                <div style={s({ fontSize:12,color:'#888',marginBottom:12 })}>{j.department}</div>
                <div style={s({ display:'flex',gap:6,flexWrap:'wrap' })}>
                  {STAGES.map(st => {
                    const n = candidates.filter(c=>c.role===j.title&&c.stage===st).length
                    if(!n) return null
                    return <span key={st} style={s({ fontSize:11,color:STAGE_COLOR[st],background:STAGE_COLOR[st]+'18',borderRadius:20,padding:'2px 8px' })}>{st}: {n}</span>
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        {view==='analytics' && (
          <div style={s({ display:'flex',flexDirection:'column',gap:20 })}>
            <div style={s({ background:'#fff',borderRadius:12,padding:20,border:'1px solid #e0dfd6' })}>
              <div style={s({ fontWeight:500,fontSize:14,marginBottom:16 })}>Pipeline funnel</div>
              {STAGES.map(st => {
                const n = candidates.filter(c=>c.stage===st).length
                const pct = candidates.length ? Math.round(n/candidates.length*100) : 0
                return (
                  <div key={st} style={s({ marginBottom:12 })}>
                    <div style={s({ display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4 })}>
                      <span style={s({ color:'#666' })}>{st}</span>
                      <span style={s({ color:'#aaa' })}>{n} candidates</span>
                    </div>
                    <div style={s({ background:'#f0efe8',borderRadius:6,height:8 })}>
                      <div style={s({ height:8,borderRadius:6,background:STAGE_COLOR[st],width:`${pct}%`,transition:'width 0.5s' })} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={s({ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 })}>
              <div style={s({ background:'#fff',borderRadius:12,padding:20,border:'1px solid #e0dfd6' })}>
                <div style={s({ fontWeight:500,fontSize:14,marginBottom:14 })}>Source breakdown</div>
                {['LinkedIn','Referral','Clay','Inbound'].map(src => {
                  const n = candidates.filter(c=>c.source===src).length
                  if(!n) return null
                  return (
                    <div key={src} style={s({ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 })}>
                      <SrcBadge source={src} />
                      <span style={s({ fontSize:13,fontWeight:500 })}>{n}</span>
                    </div>
                  )
                })}
              </div>
              <div style={s({ background:'#fff',borderRadius:12,padding:20,border:'1px solid #e0dfd6' })}>
                <div style={s({ fontWeight:500,fontSize:14,marginBottom:14 })}>Recruiter load</div>
                {['Riya','Karan'].map(owner => {
                  const n = candidates.filter(c=>c.owner===owner).length
                  const hired = candidates.filter(c=>c.owner===owner&&c.stage==='Hired').length
                  return (
                    <div key={owner} style={s({ marginBottom:14 })}>
                      <div style={s({ display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4 })}>
                        <span style={s({ fontWeight:500 })}>{owner}</span>
                        <span style={s({ color:'#aaa' })}>{n} total · {hired} hired</span>
                      </div>
                      <div style={s({ background:'#f0efe8',borderRadius:6,height:6 })}>
                        <div style={s({ height:6,borderRadius:6,background:'#7F77DD',width:`${candidates.length?Math.round(n/candidates.length*100):0}%` })} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      {selected && (
        <Drawer c={selected} onClose={()=>setSelected(null)} onStageChange={stageChange} onNotesChange={notesChange} />
      )}
      {showAdd && <Modal jobs={jobs} onAdd={addCandidate} onClose={()=>setShowAdd(false)} />}
    </div>
  )
}
