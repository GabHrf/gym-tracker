import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ChevronLeft, ChevronRight, Plus, Trash2, Pencil, X} from 'lucide-react';
import './style.css';

const EXERCISES = ['exo 1', 'exo 2', 'exo 3'];
const STORAGE_KEY = 'gym-tracker-sessions-v1';
const pad = n => String(n).padStart(2, '0');
const dateKey = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const todayKey = dateKey(new Date());
const emptySet = () => ({reps: 10, weight: 0});
const emptyExercise = () => ({name: EXERCISES[0], sets: [emptySet()]});
const emptySession = (date=todayKey) => ({id: crypto.randomUUID(), date, start:'18:00', end:'19:00', exercises:[emptyExercise()], notes:''});
const volume = s => s.exercises.reduce((total,e)=> total + e.sets.reduce((sum,set)=> sum + (Number(set.reps)||0)*(Number(set.weight)||0),0),0);

function App(){
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState(todayKey);
  const [sessions, setSessions] = useState(()=> JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  const [editing, setEditing] = useState(null);
  useEffect(()=>localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)), [sessions]);
  useEffect(()=>{ if(!('serviceWorker' in navigator)) return; navigator.serviceWorker.register('/sw.js').catch(()=>{}); }, []);

  const monthDays = useMemo(()=>{
    const y=current.getFullYear(), m=current.getMonth();
    const first = new Date(y,m,1); const start = new Date(first); start.setDate(1-((first.getDay()+6)%7));
    return Array.from({length:42},(_,i)=>{ const d=new Date(start); d.setDate(start.getDate()+i); return d; });
  },[current]);
  const byDate = useMemo(()=> sessions.reduce((acc,s)=>{(acc[s.date]??=[]).push(s); return acc},{}),[sessions]);
  const selectedSessions = byDate[selected] || [];
  const save = session => { setSessions(prev => prev.some(s=>s.id===session.id) ? prev.map(s=>s.id===session.id?session:s) : [...prev, session]); setEditing(null); };
  const del = id => { if(confirm('Supprimer cette séance ?')) setSessions(prev=>prev.filter(s=>s.id!==id)); };
  const changeMonth = step => setCurrent(new Date(current.getFullYear(), current.getMonth()+step, 1));

  return <div className="app">
    <header><button onClick={()=>changeMonth(-1)}><ChevronLeft/></button><h1>{current.toLocaleDateString('fr-FR',{month:'long', year:'numeric'})}</h1><button onClick={()=>changeMonth(1)}><ChevronRight/></button></header>
    <main>
      <section className="calendar">
        {['Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.','Dim.'].map(d=><b className="weekday" key={d}>{d}</b>)}
        {monthDays.map(d=>{ const k=dateKey(d), inMonth=d.getMonth()===current.getMonth(); return <button key={k} onClick={()=>setSelected(k)} className={`day ${!inMonth?'muted':''} ${k===selected?'selected':''} ${k===todayKey?'today':''}`}>
          <span>{d.getDate()}</span>{(byDate[k]||[]).map(s=><small key={s.id}>{s.start} · {volume(s)} kg</small>)}
        </button> })}
      </section>
      <aside>
        <div className="asideTop"><h2>{new Date(selected).toLocaleDateString('fr-FR',{weekday:'long', day:'numeric', month:'long'})}</h2><button className="primary" onClick={()=>setEditing(emptySession(selected))}><Plus/> Ajouter</button></div>
        {selectedSessions.length===0 && <p className="empty">Aucune séance ce jour.</p>}
        {selectedSessions.map(s=><article className="card" key={s.id}><div className="row"><h3>{s.start} - {s.end}</h3><strong>{volume(s)} kg</strong></div>
          {s.exercises.map((e,i)=><div key={i} className="exercise"><b>{e.name}</b><span>{e.sets.length} série(s)</span></div>)}
          <div className="actions"><button onClick={()=>setEditing(structuredClone(s))}><Pencil/> Modifier</button><button onClick={()=>del(s.id)}><Trash2/> Supprimer</button></div>
        </article>)}
      </aside>
    </main>
    {editing && <Editor session={editing} onClose={()=>setEditing(null)} onSave={save}/>} 
  </div>
}

function Editor({session, onSave, onClose}){
  const [s,setS]=useState(session);
  const patch=(p)=>setS({...s,...p});
  const updEx=(i,ex)=>patch({exercises:s.exercises.map((e,idx)=>idx===i?ex:e)});
  const rmEx=i=>patch({exercises:s.exercises.filter((_,idx)=>idx!==i)});
  return <div className="modal"><form onSubmit={e=>{e.preventDefault(); onSave(s)}} className="panel">
    <div className="row"><h2>Séance</h2><button type="button" onClick={onClose}><X/></button></div>
    <label>Date<input type="date" value={s.date} onChange={e=>patch({date:e.target.value})}/></label>
    <div className="grid2"><label>Début<input type="time" value={s.start} onChange={e=>patch({start:e.target.value})}/></label><label>Fin<input type="time" value={s.end} onChange={e=>patch({end:e.target.value})}/></label></div>
    <h3>Exercices</h3>
    {s.exercises.map((ex,i)=><div className="editExercise" key={i}>
      <div className="row"><select value={ex.name} onChange={e=>updEx(i,{...ex,name:e.target.value})}>{EXERCISES.map(x=><option key={x}>{x}</option>)}</select><button type="button" onClick={()=>rmEx(i)}><Trash2/></button></div>
      {ex.sets.map((set,j)=><div className="set" key={j}><span>Série {j+1}</span><input type="number" min="0" value={set.reps} onChange={e=>updEx(i,{...ex,sets:ex.sets.map((v,k)=>k===j?{...v,reps:e.target.value}:v)})} placeholder="reps"/><input type="number" min="0" step="0.5" value={set.weight} onChange={e=>updEx(i,{...ex,sets:ex.sets.map((v,k)=>k===j?{...v,weight:e.target.value}:v)})} placeholder="kg"/></div>)}
      <button type="button" className="ghost" onClick={()=>updEx(i,{...ex,sets:[...ex.sets, emptySet()]})}>+ Ajouter une série</button>
    </div>)}
    <button type="button" className="ghost" onClick={()=>patch({exercises:[...s.exercises, emptyExercise()]})}>+ Ajouter un exercice</button>
    <p className="total">Volume total : <b>{volume(s)} kg</b></p><button className="primary wide">Enregistrer</button>
  </form></div>
}
createRoot(document.getElementById('root')).render(<App/>);
