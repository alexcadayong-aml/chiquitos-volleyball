import { useState, useEffect, useCallback, useRef } from "react";

const COLORS = {
  primary:"#1a472a",primaryLight:"#2d6a4f",bg:"#f8f9f4",surface:"#ffffff",
  surfaceAlt:"#f0f4ed",border:"#d8e4d0",text:"#1a2e1a",textMuted:"#5a7a5a",
  danger:"#c0392b",dangerLight:"#fdecea",success:"#1e8449",successLight:"#eafaf1",
  warning:"#d68910",warningLight:"#fef9e7",info:"#1a5276",infoLight:"#eaf2ff",
  guest:"#6d4c41",guestLight:"#efebe9",
};

const DEFAULT_POSITIONS=[
  {key:"setter", label:"Setter",        slots:4, color:"#6c3483"},
  {key:"opp",    label:"Opposite",       slots:4, color:"#1a5276"},
  {key:"oh",     label:"Outside Hitter", slots:8, color:"#1e8449"},
  {key:"mb",     label:"Middle Blocker", slots:8, color:"#d68910"},
  {key:"libero", label:"Libero",         slots:99,color:"#c0392b",optional:true},
];

const REMARK_TAGS=[
  {key:"good_receiver",    label:"Good Receiver",        category:"skill",    color:"#1a5276"},
  {key:"effective_blocker",label:"Effective Blocker",    category:"skill",    color:"#1e8449"},
  {key:"effective_open",   label:"Effective Open Hitter",category:"skill",    color:"#6c3483"},
  {key:"effective_opp",    label:"Effective Opposite",   category:"skill",    color:"#c0392b"},
  {key:"smart_server",     label:"Smart Server",         category:"skill",    color:"#d68910"},
  {key:"can_officiate",    label:"Can Officiate",        category:"skill",    color:"#0e6655"},
  {key:"team_player",      label:"Team Player",          category:"behavior", color:"#1a472a"},
  {key:"team_leader",      label:"Team Leader",          category:"behavior", color:"#922b21"},
  {key:"adapts_to_team",   label:"Adapts to Teammates",  category:"behavior", color:"#7d6608"},
];

const TEAM_COLORS=["#1a472a","#1a5276","#6c3483","#c0392b","#d68910","#0e6655"];
const TEAM_NAMES=["Team A","Team B","Team C","Team D","Team E","Team F"];

const STYLES={
  btn:{
    primary:  {background:COLORS.primary,color:"#fff",border:"none",borderRadius:8,padding:"10px 20px",fontWeight:600,cursor:"pointer",fontSize:14,fontFamily:"'DM Sans',sans-serif"},
    secondary:{background:"transparent",color:COLORS.primary,border:`1.5px solid ${COLORS.primary}`,borderRadius:8,padding:"10px 20px",fontWeight:600,cursor:"pointer",fontSize:14,fontFamily:"'DM Sans',sans-serif"},
    danger:   {background:COLORS.danger,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontWeight:600,cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif"},
    ghost:    {background:"transparent",color:COLORS.textMuted,border:"none",padding:"8px 12px",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif"},
    guest:    {background:COLORS.guest,color:"#fff",border:"none",borderRadius:8,padding:"10px 20px",fontWeight:600,cursor:"pointer",fontSize:14,fontFamily:"'DM Sans',sans-serif"},
  },
  input:{width:"100%",padding:"10px 14px",borderRadius:8,border:`1px solid ${COLORS.border}`,fontSize:14,fontFamily:"'DM Sans',sans-serif",background:COLORS.surface,color:COLORS.text,boxSizing:"border-box",outline:"none"},
  card: {background:COLORS.surface,borderRadius:12,border:`1px solid ${COLORS.border}`,padding:"20px"},
  badge:{
    confirmed: {background:COLORS.successLight,color:COLORS.success, padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600},
    pending:   {background:COLORS.warningLight, color:COLORS.warning, padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600},
    waitlist:  {background:COLORS.infoLight,    color:COLORS.info,    padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600},
    rejected:  {background:COLORS.dangerLight,  color:COLORS.danger,  padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600},
    paid:      {background:COLORS.successLight, color:COLORS.success, padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600},
    unpaid:    {background:COLORS.dangerLight,  color:COLORS.danger,  padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600},
    admin:     {background:"#e8f0fe",           color:COLORS.info,    padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600},
    member:    {background:COLORS.surfaceAlt,   color:COLORS.textMuted,padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600},
    guest:     {background:COLORS.guestLight,   color:COLORS.guest,   padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600},
  },
};

const today=new Date();
const fmt=d=>d.toISOString().split("T")[0];
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};

const SEED_USERS=[
  {id:1,name:"Admin One",    email:"admin@chiquitos.ph",password:"admin123",role:"admin", joined:"2024-01-01",avatar:"A1",positions:[],remarkTags:[],remarkNotes:""},
  {id:2,name:"Ana Reyes",    email:"ana@email.com",     password:"pass123", role:"member",joined:"2024-01-10",avatar:"AR",positions:[{key:"setter",level:3},{key:"oh",level:2}],remarkTags:["good_receiver","team_player"],remarkNotes:"Very consistent."},
  {id:3,name:"Ben Cruz",     email:"ben@email.com",     password:"pass123", role:"member",joined:"2024-02-05",avatar:"BC",positions:[{key:"mb",level:2}],remarkTags:["effective_blocker"],remarkNotes:""},
  {id:4,name:"Carla Mendoza",email:"carla@email.com",   password:"pass123", role:"member",joined:"2024-02-20",avatar:"CM",positions:[{key:"oh",level:1},{key:"libero",level:2}],remarkTags:[],remarkNotes:""},
  {id:5,name:"Diego Santos", email:"diego@email.com",   password:"pass123", role:"member",joined:"2024-03-01",avatar:"DS",positions:[{key:"opp",level:3},{key:"mb",level:1}],remarkTags:["effective_opp","team_leader"],remarkNotes:"Natural leader."},
];

const SEED_GAMES=[
  {id:1,title:"Saturday Spike Session",date:fmt(addDays(today,3)), time:"08:00",venue:"Rizal Memorial Coliseum, Manila",fee:150,allowMultiple:false,allowGuests:true, notes:"Bring water and kneepads.",positions:DEFAULT_POSITIONS.map(p=>({...p})),reservations:[
    {userId:2,guestId:null,position:"setter",status:"confirmed",paymentStatus:"paid",   paymentProof:"gcash_001",reservedAt:"2024-06-01T08:00:00Z",waitlistPos:null},
    {userId:3,guestId:null,position:"oh",    status:"confirmed",paymentStatus:"pending",paymentProof:"gcash_002",reservedAt:"2024-06-01T09:00:00Z",waitlistPos:null},
    {userId:4,guestId:null,position:"mb",    status:"waitlist", paymentStatus:"unpaid", paymentProof:null,       reservedAt:"2024-06-01T10:00:00Z",waitlistPos:1},
  ]},
  {id:2,title:"Wednesday Warmup",  date:fmt(addDays(today,7)), time:"18:00",venue:"Meralco Gym, Pasig",       fee:100,allowMultiple:true, allowGuests:true, notes:"Beginners welcome.",positions:DEFAULT_POSITIONS.map(p=>({...p})),reservations:[]},
  {id:3,title:"Sunday Scrimmage",  date:fmt(addDays(today,10)),time:"09:00",venue:"Philsports Arena, Pasig",   fee:200,allowMultiple:false,allowGuests:false,notes:"Full match format.",  positions:DEFAULT_POSITIONS.map(p=>({...p})),reservations:[
    {userId:5,guestId:null,position:"opp",status:"confirmed",paymentStatus:"paid",paymentProof:"gcash_003",reservedAt:"2024-06-02T07:00:00Z",waitlistPos:null},
  ]},
];

// guest registry (not users array)
const SEED_GUESTS=[];

// ─── STORE ────────────────────────────────────────────────────────────────────

function useStore(){
  const[users,       setUsers]      =useState([]);
  const[guests,      setGuests]     =useState([]);
  const[games,       setGames]      =useState([]);
  const[currentUser, setCurrentUser]=useState(null);
  const[loading,     setLoading]    =useState(true);
  const[toast,       setToast]      =useState(null);

  const showToast=useCallback((msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),3200);},[]);

  // ── helpers to shape DB rows into app format ──
  const shapeGame=useCallback((g,reservations=[])=>({
    id:g.id, title:g.title, date:g.date, time:g.time, venue:g.venue,
    fee:g.fee, allowMultiple:g.allow_multiple, allowGuests:g.allow_guests,
    notes:g.notes||"", positions:g.positions||DEFAULT_POSITIONS.map(p=>({...p})),
    teams:g.teams||null, matches:g.matches||null, matchSettings:g.match_settings||null,
    reservations,
  }),[]);

  const shapeRes=useCallback(r=>({
    id:r.id, userId:r.user_id, guestId:r.guest_id, position:r.position,
    level:r.level||1, status:r.status, paymentStatus:r.payment_status,
    paymentProof:r.payment_proof, reservedAt:r.reserved_at, waitlistPos:r.waitlist_pos,
  }),[]);

  const shapeUser=useCallback(u=>({
    id:u.id, name:u.name, email:u.email, password:u.password, role:u.role,
    joined:u.joined, avatar:u.avatar||u.name.slice(0,2).toUpperCase(),
    positions:u.positions||[], remarkTags:u.remark_tags||[], remarkNotes:u.remark_notes||"",
  }),[]);

  // ── load all data ──
  const loadAll=useCallback(async()=>{
    const {supabase}=await import('./supabase.js');
    const[{data:usersData},{data:guestsData},{data:gamesData},{data:resData}]=await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('guests').select('*'),
      supabase.from('games').select('*').order('date',{ascending:true}),
      supabase.from('reservations').select('*'),
    ]);
    const shaped=(resData||[]).map(shapeRes);
    const shapedGames=(gamesData||[]).map(g=>shapeGame(g,shaped.filter(r=>r.gameId===g.id||shaped.filter(x=>x).find(x=>x))));
    // attach reservations to games
    const gamesWithRes=(gamesData||[]).map(g=>shapeGame(g,(resData||[]).filter(r=>r.game_id===g.id).map(shapeRes)));
    setUsers((usersData||[]).map(shapeUser));
    setGuests((guestsData||[]).map(g=>({id:g.id,name:g.name,contact:g.contact,level:g.level,joinedAt:g.joined_at})));
    setGames(gamesWithRes);
    setLoading(false);
  },[shapeGame,shapeRes,shapeUser]);

  useEffect(()=>{loadAll();},[loadAll]);

  // ── auth ──
  const login=async(email,password)=>{
    const {supabase}=await import('./supabase.js');
    const{data,error}=await supabase.from('users').select('*').eq('email',email).eq('password',password).single();
    if(error||!data)return false;
    setCurrentUser(shapeUser(data));
    return true;
  };
  const logout=()=>setCurrentUser(null);

  // ── guest join ──
  const guestJoin=async(gameId,guestInfo,position,level)=>{
    const {supabase}=await import('./supabase.js');
    const gId=`guest_${Date.now()}`;
    await supabase.from('guests').insert({id:gId,name:guestInfo.name,contact:guestInfo.contact,level});
    const game=games.find(g=>g.id===gameId);
    const filled=(game?.reservations||[]).filter(r=>r.position===position&&r.status==="confirmed").length;
    const pos=game?.positions.find(p=>p.key===position);
    const isLib=position==="libero";
    const full=!isLib&&filled>=(pos?.slots||99);
    const wPos=full?(game?.reservations||[]).filter(r=>r.position===position&&r.status==="waitlist").length+1:null;
    await supabase.from('reservations').insert({game_id:gameId,guest_id:gId,position,level,status:full?"waitlist":"confirmed",payment_status:"unpaid",waitlist_pos:wPos});
    showToast("You're signed up! Contact admin for payment details.");
    await loadAll();
    return gId;
  };

  // ── games ──
  const addGame=async(g)=>{
    const {supabase}=await import('./supabase.js');
    await supabase.from('games').insert({title:g.title,date:g.date,time:g.time,venue:g.venue,fee:g.fee,allow_multiple:g.allowMultiple,allow_guests:g.allowGuests,notes:g.notes,positions:g.positions});
    showToast("Game scheduled!");await loadAll();
  };
  const updateGame=async(id,u)=>{
    const {supabase}=await import('./supabase.js');
    await supabase.from('games').update({title:u.title,date:u.date,time:u.time,venue:u.venue,fee:u.fee,allow_multiple:u.allowMultiple,allow_guests:u.allowGuests,notes:u.notes,positions:u.positions}).eq('id',id);
    showToast("Game updated.");await loadAll();
  };
  const deleteGame=async(id)=>{
    const {supabase}=await import('./supabase.js');
    await supabase.from('games').delete().eq('id',id);
    showToast("Game deleted.");await loadAll();
  };

  // ── reservations ──
  const reserve=async(gameId,userId,position)=>{
    const {supabase}=await import('./supabase.js');
    const game=games.find(g=>g.id===gameId);
    const filled=(game?.reservations||[]).filter(r=>r.position===position&&r.status==="confirmed").length;
    const pos=game?.positions.find(p=>p.key===position);
    const isLib=position==="libero";
    const full=!isLib&&filled>=(pos?.slots||99);
    const wPos=full?(game?.reservations||[]).filter(r=>r.position===position&&r.status==="waitlist").length+1:null;
    await supabase.from('reservations').insert({game_id:gameId,user_id:userId,position,status:full?"waitlist":"confirmed",payment_status:"unpaid",waitlist_pos:wPos});
    showToast("Spot reserved! Upload your payment proof.");await loadAll();
  };

  const cancelReservation=async(gameId,userId,guestId=null)=>{
    const {supabase}=await import('./supabase.js');
    const game=games.find(g=>g.id===gameId);
    const cancelled=game?.reservations.find(r=>guestId?r.guestId===guestId:r.userId===userId);
    if(guestId) await supabase.from('reservations').delete().eq('game_id',gameId).eq('guest_id',guestId);
    else await supabase.from('reservations').delete().eq('game_id',gameId).eq('user_id',userId);
    // promote waitlist if cancelled was confirmed
    if(cancelled?.status==="confirmed"){
      const waitlist=(game?.reservations||[]).filter(r=>r.position===cancelled.position&&r.status==="waitlist").sort((a,b)=>a.waitlistPos-b.waitlistPos);
      if(waitlist.length>0){
        await supabase.from('reservations').update({status:"confirmed",waitlist_pos:null}).eq('id',waitlist[0].id);
        for(let i=1;i<waitlist.length;i++) await supabase.from('reservations').update({waitlist_pos:i}).eq('id',waitlist[i].id);
      }
    }
    showToast("Reservation cancelled.");await loadAll();
  };

  const uploadProof=async(gameId,userId,proof)=>{
    const {supabase}=await import('./supabase.js');
    await supabase.from('reservations').update({payment_proof:proof,payment_status:"pending"}).eq('game_id',gameId).eq('user_id',userId);
    showToast("Proof submitted!");await loadAll();
  };

  const confirmPayment=async(gameId,userId,guestId=null)=>{
    const {supabase}=await import('./supabase.js');
    const q=supabase.from('reservations').update({payment_status:"paid"}).eq('game_id',gameId);
    if(guestId) await q.eq('guest_id',guestId); else await q.eq('user_id',userId);
    showToast("Payment confirmed!");await loadAll();
  };

  const rejectPayment=async(gameId,userId,guestId=null)=>{
    const {supabase}=await import('./supabase.js');
    const q=supabase.from('reservations').update({payment_status:"unpaid",payment_proof:null}).eq('game_id',gameId);
    if(guestId) await q.eq('guest_id',guestId); else await q.eq('user_id',userId);
    showToast("Payment rejected.","warning");await loadAll();
  };

  // ── members ──
  const addMember=async(member)=>{
    const {supabase}=await import('./supabase.js');
    if(users.find(u=>u.email===member.email)){showToast("Email already exists.","error");return false;}
    const avatar=member.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
    await supabase.from('users').insert({name:member.name,email:member.email,password:member.password,role:"member",avatar,positions:member.positions||[],remark_tags:[],remark_notes:""});
    showToast("Member added!");await loadAll();return true;
  };
  const removeMember=async(id)=>{
    const {supabase}=await import('./supabase.js');
    await supabase.from('users').delete().eq('id',id);
    showToast("Member removed.");await loadAll();
  };
  const toggleRole=async(id)=>{
    const {supabase}=await import('./supabase.js');
    const user=users.find(u=>u.id===id);
    await supabase.from('users').update({role:user.role==="admin"?"member":"admin"}).eq('id',id);
    showToast("Role updated.");await loadAll();
  };
  const updateProfile=async(id,updates)=>{
    const {supabase}=await import('./supabase.js');
    const dbUpdates={};
    if(updates.positions!==undefined) dbUpdates.positions=updates.positions;
    if(updates.remarkTags!==undefined) dbUpdates.remark_tags=updates.remarkTags;
    if(updates.remarkNotes!==undefined) dbUpdates.remark_notes=updates.remarkNotes;
    await supabase.from('users').update(dbUpdates).eq('id',id);
    setCurrentUser(prev=>prev?.id===id?{...prev,...updates}:prev);
    showToast("Profile updated!");await loadAll();
  };

  // ── teams & matches ──
  const saveTeams=async(gameId,teams)=>{
    const {supabase}=await import('./supabase.js');
    await supabase.from('games').update({teams}).eq('id',gameId);
    showToast("Teams saved!");await loadAll();
  };
  const saveMatches=async(gameId,matches,settings)=>{
    const {supabase}=await import('./supabase.js');
    await supabase.from('games').update({matches,match_settings:settings}).eq('id',gameId);
    showToast("Matches generated!");await loadAll();
  };
  const updateMatchScore=async(gameId,matchId,sets)=>{
    const {supabase}=await import('./supabase.js');
    const game=games.find(g=>g.id===gameId);
    const stw=game?.matchSettings?.setsToWin||2;
    const updatedMatches=(game?.matches||[]).map(m=>{
      if(m.id!==matchId)return m;
      const wA=sets.filter(s=>s.a>s.b).length,wB=sets.filter(s=>s.b>s.a).length;
      return{...m,sets,winner:wA>=stw?m.teamA:wB>=stw?m.teamB:null,played:wA>=stw||wB>=stw};
    });
    await supabase.from('games').update({matches:updatedMatches}).eq('id',gameId);
    showToast("Score updated!");await loadAll();
  };

  const getReservationName=(r)=>{
    if(r.userId){const u=users.find(x=>x.id===r.userId);return{name:u?.name||"Unknown",avatar:u?.avatar||"??",isGuest:false,contact:u?.email};}
    const g=guests.find(x=>x.id===r.guestId);
    return{name:g?.name||"Guest",avatar:(g?.name||"G").slice(0,2).toUpperCase(),isGuest:true,contact:g?.contact};
  };

  return{users,guests,games,currentUser,loading,toast,login,logout,guestJoin,addGame,updateGame,deleteGame,reserve,cancelReservation,uploadProof,confirmPayment,rejectPayment,addMember,removeMember,toggleRole,updateProfile,saveTeams,saveMatches,updateMatchScore,getReservationName,showToast};
}
// ─── UI HELPERS ───────────────────────────────────────────────────────────────

function Toast({toast}){
  if(!toast)return null;
  const c=toast.type==="error"?{bg:COLORS.dangerLight,br:COLORS.danger,tx:COLORS.danger}:toast.type==="warning"?{bg:COLORS.warningLight,br:COLORS.warning,tx:COLORS.warning}:{bg:COLORS.successLight,br:COLORS.success,tx:COLORS.success};
  return<div style={{position:"fixed",bottom:24,right:24,zIndex:9999,background:c.bg,border:`1px solid ${c.br}`,color:c.tx,padding:"12px 20px",borderRadius:10,fontSize:14,fontWeight:500,maxWidth:320,boxShadow:"0 4px 16px rgba(0,0,0,0.12)",fontFamily:"'DM Sans',sans-serif"}}>{toast.msg}</div>;
}
function Avatar({initials,size=36,color=COLORS.primary}){
  return<div style={{width:size,height:size,borderRadius:"50%",background:color,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:size*0.35,flexShrink:0,fontFamily:"'DM Sans',sans-serif"}}>{initials}</div>;
}
function Badge({type,children}){return<span style={STYLES.badge[type]||STYLES.badge.member}>{children}</span>;}
function Modal({title,onClose,children,wide}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:COLORS.surface,borderRadius:14,width:"100%",maxWidth:wide?680:520,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 0"}}>
          <h3 style={{margin:0,fontSize:18,fontWeight:700,color:COLORS.text}}>{title}</h3>
          <button onClick={onClose} style={{...STYLES.btn.ghost,fontSize:20,padding:"4px 10px"}}>×</button>
        </div>
        <div style={{padding:"16px 24px 24px"}}>{children}</div>
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────

function PublicGameCard({game}){
  const confirmedCount=game.reservations.filter(r=>r.status==="confirmed").length;
  const waitlistCount =game.reservations.filter(r=>r.status==="waitlist").length;
  const totalSlots    =game.positions.filter(p=>p.key!=="libero").reduce((s,p)=>s+p.slots,0);
  return(
    <div style={{...STYLES.card,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
        <div style={{flex:1,minWidth:200}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <h3 style={{margin:0,fontSize:16,fontWeight:700,color:COLORS.text}}>{game.title}</h3>
            {game.allowGuests&&<span style={{fontSize:11,background:COLORS.guestLight,color:COLORS.guest,padding:"2px 8px",borderRadius:10,fontWeight:600}}>Guests welcome</span>}
          </div>
          <div style={{display:"flex",gap:14,marginTop:7,flexWrap:"wrap"}}>
            <span style={{fontSize:13,color:COLORS.textMuted}}>📅 {new Date(game.date).toLocaleDateString("en-PH",{weekday:"short",month:"short",day:"numeric"})} · {game.time}</span>
            <span style={{fontSize:13,color:COLORS.textMuted}}>📍 {game.venue}</span>
            <span style={{fontSize:13,color:COLORS.textMuted}}>₱{game.fee}</span>
          </div>
          <div style={{display:"flex",gap:12,marginTop:5}}>
            <span style={{fontSize:13,color:COLORS.success,fontWeight:600}}>{confirmedCount}/{totalSlots} players confirmed</span>
            {waitlistCount>0&&<span style={{fontSize:13,color:COLORS.info,fontWeight:600}}>{waitlistCount} on waitlist</span>}
          </div>
        </div>
      </div>
      {/* Position breakdown */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginTop:10}}>
        {game.positions.map(pos=>{
          const confirmed =game.reservations.filter(r=>r.position===pos.key&&r.status==="confirmed").length;
          const waitlisted=game.reservations.filter(r=>r.position===pos.key&&r.status==="waitlist").length;
          const isLib=pos.key==="libero";
          const isFull=!isLib&&confirmed>=pos.slots;
          const pct=isLib?0:Math.min(100,Math.round((confirmed/pos.slots)*100));
          return(
            <div key={pos.key} style={{background:COLORS.surfaceAlt,borderRadius:10,padding:"8px 10px",border:`1px solid ${isFull?pos.color+"55":COLORS.border}`}}>
              <span style={{fontSize:11,fontWeight:700,color:pos.color,textTransform:"uppercase",letterSpacing:0.3}}>{pos.label.split(" ")[0]}</span>
              {isFull&&<span style={{display:"block",fontSize:9,background:pos.color+"22",color:pos.color,padding:"1px 4px",borderRadius:8,fontWeight:700,marginTop:1}}>FULL</span>}
              <div style={{marginTop:3,fontSize:15,fontWeight:800,color:COLORS.text}}>{confirmed}<span style={{fontSize:11,fontWeight:400,color:COLORS.textMuted}}>/{isLib?"∞":pos.slots}</span></div>
              {!isLib&&<div style={{height:4,borderRadius:4,background:COLORS.border,marginTop:4,overflow:"hidden"}}><div style={{height:"100%",borderRadius:4,background:isFull?pos.color:pos.color+"99",width:`${pct}%`}}/></div>}
              {waitlisted>0&&<div style={{fontSize:9,color:COLORS.info,marginTop:3}}>+{waitlisted} wait</div>}
            </div>
          );
        })}
      </div>
      {/* Waitlist names */}
      {waitlistCount>0&&(
        <div style={{marginTop:8,padding:"8px 10px",background:COLORS.infoLight,borderRadius:8}}>
          <p style={{margin:"0 0 4px",fontSize:11,fontWeight:700,color:COLORS.info}}>Waitlist ({waitlistCount})</p>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {game.reservations.filter(r=>r.status==="waitlist").sort((a,b)=>a.waitlistPos-b.waitlistPos).map((r,i)=>{
              const pos=DEFAULT_POSITIONS.find(p=>p.key===r.position);
              return<span key={i} style={{fontSize:11,background:COLORS.surface,border:`1px solid ${COLORS.border}`,padding:"1px 7px",borderRadius:20,color:COLORS.text}}>#{r.waitlistPos} <span style={{color:pos?.color,fontWeight:600}}>({pos?.label})</span></span>;
            })}
          </div>
        </div>
      )}
      {game.notes&&<p style={{margin:"10px 0 0",fontSize:12,color:COLORS.textMuted,borderTop:`1px solid ${COLORS.border}`,paddingTop:8}}>📌 {game.notes}</p>}
    </div>
  );
}

function LoginPage({login,games,guestJoin}){
  const[panel,setPanel]=useState(null); // null | "login" | "guest"
  const[email,setEmail]=useState("");
  const[password,setPassword]=useState("");
  const[error,setError]=useState("");
  const[loading,setLoading]=useState(false);
  const[gName,setGName]=useState("");
  const[gContact,setGContact]=useState("");
  const[selGame,setSelGame]=useState("");
  const[gPos,setGPos]=useState("");
  const[gLevel,setGLevel]=useState(1);
  const[gDone,setGDone]=useState(false);

  const upcoming=games.filter(g=>new Date(g.date+"T"+g.time)>=today).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const guestGames=upcoming.filter(g=>g.allowGuests);

  const handleLogin=()=>{
    setError("");
    if(!email||!password){setError("Please fill in all fields.");return;}
    setLoading(true);
    setTimeout(()=>{const ok=login(email,password);if(!ok)setError("Invalid email or password.");setLoading(false);},600);
  };

  const handleGuestJoin=()=>{
    if(!selGame||!gName.trim()||!gContact.trim()||!gPos){setError("Please fill in all fields.");return;}
    guestJoin(+selGame,{name:gName.trim(),contact:gContact.trim()},gPos,gLevel);
    setGDone(true);
  };

  const closePanel=()=>{setPanel(null);setError("");setEmail("");setPassword("");setGName("");setGContact("");setSelGame("");setGPos("");setGLevel(1);setGDone(false);};

  return(
    <div style={{minHeight:"100vh",background:COLORS.bg,fontFamily:"'DM Sans',sans-serif"}}>
      {/* Header */}
      <div style={{background:COLORS.primary,color:"#fff",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:60}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>🏐</span>
          <span style={{fontWeight:800,fontSize:18,letterSpacing:-0.3}}>Chiquitos Volleyball</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setPanel("login");setError("");}} style={{...STYLES.btn.secondary,padding:"8px 16px",fontSize:13,color:"#fff",border:"1.5px solid rgba(255,255,255,0.5)"}}>Sign In</button>
          <button onClick={()=>{setPanel("guest");setError("");}} style={{...STYLES.btn.primary,padding:"8px 16px",fontSize:13,background:"rgba(255,255,255,0.15)"}}>Join as Guest</button>
        </div>
      </div>

      {/* Games list */}
      <div style={{maxWidth:860,margin:"0 auto",padding:"28px 16px"}}>
        <div style={{marginBottom:24}}>
          <h2 style={{margin:"0 0 4px",fontSize:22,fontWeight:800,color:COLORS.text}}>Upcoming Games</h2>
          <p style={{margin:0,fontSize:14,color:COLORS.textMuted}}>Sign in or join as guest to reserve a spot.</p>
        </div>
        {upcoming.length===0&&(
          <div style={{...STYLES.card,textAlign:"center",padding:"40px 20px"}}>
            <div style={{fontSize:36,marginBottom:12}}>📅</div>
            <p style={{color:COLORS.textMuted,fontSize:15}}>No upcoming games scheduled yet. Check back soon!</p>
          </div>
        )}
        {upcoming.map(g=><PublicGameCard key={g.id} game={g}/>)}

        {/* CTA */}
        <div style={{...STYLES.card,background:COLORS.primary,border:"none",textAlign:"center",padding:"28px 24px",marginTop:8}}>
          <p style={{margin:"0 0 6px",fontWeight:800,fontSize:18,color:"#fff"}}>Want to join a game?</p>
          <p style={{margin:"0 0 20px",fontSize:14,color:"rgba(255,255,255,0.75)"}}>Sign in if you're a member, or join as a guest — no account needed.</p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>{setPanel("login");setError("");}} style={{...STYLES.btn.secondary,padding:"11px 28px",fontSize:14,color:"#fff",border:"1.5px solid rgba(255,255,255,0.6)"}}>Sign In as Member</button>
            <button onClick={()=>{setPanel("guest");setError("");}} style={{background:"#fff",color:COLORS.primary,border:"none",borderRadius:8,padding:"11px 28px",fontWeight:700,cursor:"pointer",fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>Join as Guest</button>
          </div>
        </div>
      </div>

      {/* Sign In Modal */}
      {panel==="login"&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&closePanel()}>
          <div style={{background:COLORS.surface,borderRadius:14,width:"100%",maxWidth:400,boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 0"}}>
              <h3 style={{margin:0,fontSize:18,fontWeight:700,color:COLORS.text}}>Member Sign In</h3>
              <button onClick={closePanel} style={{...STYLES.btn.ghost,fontSize:20,padding:"4px 10px"}}>×</button>
            </div>
            <div style={{padding:"16px 24px 24px"}}>
              {error&&<div style={{background:COLORS.dangerLight,color:COLORS.danger,padding:"10px 14px",borderRadius:8,fontSize:13,marginBottom:14}}>{error}</div>}
              <div style={{marginBottom:12}}><label style={{fontSize:13,fontWeight:500,color:COLORS.textMuted,display:"block",marginBottom:6}}>Email</label><input style={STYLES.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="you@email.com" autoFocus/></div>
              <div style={{marginBottom:20}}><label style={{fontSize:13,fontWeight:500,color:COLORS.textMuted,display:"block",marginBottom:6}}>Password</label><input style={STYLES.input} type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="••••••••"/></div>
              <button onClick={handleLogin} style={{...STYLES.btn.primary,width:"100%",padding:"12px",fontSize:15}} disabled={loading}>{loading?"Signing in…":"Sign in"}</button>
              <div style={{marginTop:14,padding:"11px 13px",background:COLORS.surfaceAlt,borderRadius:8,fontSize:12,color:COLORS.textMuted}}><strong>Demo:</strong> admin@chiquitos.ph / admin123 &nbsp;|&nbsp; ana@email.com / pass123</div>
              <p style={{margin:"14px 0 0",fontSize:13,color:COLORS.textMuted,textAlign:"center"}}>Not a member? <button onClick={()=>{setPanel("guest");setError("");}} style={{background:"none",border:"none",color:COLORS.guest,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13}}>Join as Guest →</button></p>
            </div>
          </div>
        </div>
      )}

      {/* Guest Join Modal */}
      {panel==="guest"&&!gDone&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&closePanel()}>
          <div style={{background:COLORS.surface,borderRadius:14,width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 8px 40px rgba(0,0,0,0.2)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px 0"}}>
              <h3 style={{margin:0,fontSize:18,fontWeight:700,color:COLORS.text}}>Join as Guest</h3>
              <button onClick={closePanel} style={{...STYLES.btn.ghost,fontSize:20,padding:"4px 10px"}}>×</button>
            </div>
            <div style={{padding:"14px 24px 24px"}}>
              <p style={{margin:"0 0 16px",fontSize:13,color:COLORS.textMuted}}>No account needed. Fill in your details to reserve a spot.</p>
              {error&&<div style={{background:COLORS.dangerLight,color:COLORS.danger,padding:"10px 14px",borderRadius:8,fontSize:13,marginBottom:14}}>{error}</div>}
              <div style={{display:"grid",gap:12}}>
                <div><label style={{fontSize:13,fontWeight:500,color:COLORS.textMuted,display:"block",marginBottom:6}}>Your Name</label><input style={STYLES.input} value={gName} onChange={e=>setGName(e.target.value)} placeholder="Juan dela Cruz" autoFocus/></div>
                <div><label style={{fontSize:13,fontWeight:500,color:COLORS.textMuted,display:"block",marginBottom:6}}>Contact Number</label><input style={STYLES.input} value={gContact} onChange={e=>setGContact(e.target.value)} placeholder="09XXXXXXXXX"/></div>
                <div>
                  <label style={{fontSize:13,fontWeight:500,color:COLORS.textMuted,display:"block",marginBottom:6}}>Select Game</label>
                  {guestGames.length===0
                    ?<p style={{fontSize:13,color:COLORS.textMuted,padding:"8px 0"}}>No games open for guests right now.</p>
                    :<select style={STYLES.input} value={selGame} onChange={e=>setSelGame(e.target.value)}>
                      <option value="">Choose a game…</option>
                      {guestGames.map(g=><option key={g.id} value={g.id}>{g.title} — {new Date(g.date).toLocaleDateString("en-PH",{month:"short",day:"numeric"})}</option>)}
                    </select>
                  }
                </div>
                <div>
                  <label style={{fontSize:13,fontWeight:500,color:COLORS.textMuted,display:"block",marginBottom:8}}>Position</label>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:7}}>
                    {DEFAULT_POSITIONS.map(pos=>(
                      <button key={pos.key} onClick={()=>setGPos(pos.key)} style={{padding:"9px 6px",borderRadius:8,border:`2px solid ${gPos===pos.key?pos.color:COLORS.border}`,background:gPos===pos.key?pos.color+"15":COLORS.surface,color:gPos===pos.key?pos.color:COLORS.textMuted,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{pos.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{fontSize:13,fontWeight:500,color:COLORS.textMuted,display:"block",marginBottom:8}}>Skill Level</label>
                  <div style={{display:"flex",gap:10}}>
                    {[1,2,3].map(lvl=>(
                      <button key={lvl} onClick={()=>setGLevel(lvl)} style={{flex:1,padding:"12px",borderRadius:8,border:`2px solid ${gLevel===lvl?COLORS.primary:COLORS.border}`,background:gLevel===lvl?COLORS.primary:COLORS.surface,color:gLevel===lvl?"#fff":COLORS.textMuted,fontWeight:700,fontSize:18,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{lvl}</button>
                    ))}
                  </div>
                  <p style={{margin:"5px 0 0",fontSize:11,color:COLORS.textMuted}}>1 = beginner · 2 = intermediate · 3 = advanced</p>
                </div>
              </div>
              <button onClick={handleGuestJoin} style={{...STYLES.btn.guest,width:"100%",padding:"12px",fontSize:15,marginTop:18}}>Reserve Spot as Guest</button>
              <p style={{margin:"12px 0 0",fontSize:13,color:COLORS.textMuted,textAlign:"center"}}>Already a member? <button onClick={()=>{setPanel("login");setError("");}} style={{background:"none",border:"none",color:COLORS.primary,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13}}>Sign in →</button></p>
            </div>
          </div>
        </div>
      )}

      {/* Guest success modal */}
      {panel==="guest"&&gDone&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:COLORS.surface,borderRadius:14,width:"100%",maxWidth:400,boxShadow:"0 8px 40px rgba(0,0,0,0.2)",padding:"32px 28px",textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>✅</div>
            <h2 style={{margin:"0 0 8px",fontSize:20,fontWeight:800,color:COLORS.success}}>You're signed up!</h2>
            <p style={{fontSize:14,color:COLORS.textMuted,marginBottom:20,lineHeight:1.6}}>Welcome, <strong>{gName}</strong>! Your spot has been reserved.</p>
            <div style={{background:COLORS.warningLight,border:`1px solid ${COLORS.warning}33`,borderRadius:10,padding:"14px 16px",textAlign:"left",marginBottom:20}}>
              <p style={{margin:"0 0 6px",fontWeight:700,fontSize:14,color:COLORS.warning}}>📋 Next Steps</p>
              <p style={{margin:0,fontSize:13,color:COLORS.text,lineHeight:1.6}}>Contact the admin to settle your payment and confirm your reservation. You can reach out via the group chat or ask any member for the admin's contact.</p>
            </div>
            <button onClick={closePanel} style={{...STYLES.btn.secondary,width:"100%"}}>Back to Games</button>
          </div>
        </div>
      )}
    </div>
  );
}
// ─── POSITION BREAKDOWN ───────────────────────────────────────────────────────

function PositionBreakdown({game,compact=false}){
  return(
    <div style={{display:"grid",gridTemplateColumns:compact?"repeat(5,1fr)":"repeat(auto-fit,minmax(120px,1fr))",gap:compact?6:10,marginTop:compact?10:14}}>
      {game.positions.map(pos=>{
        const confirmed =game.reservations.filter(r=>r.position===pos.key&&r.status==="confirmed").length;
        const waitlisted=game.reservations.filter(r=>r.position===pos.key&&r.status==="waitlist").length;
        const isLib=pos.key==="libero";
        const isFull=!isLib&&confirmed>=pos.slots;
        const pct=isLib?0:Math.min(100,Math.round((confirmed/pos.slots)*100));
        return(
          <div key={pos.key} style={{background:COLORS.surfaceAlt,borderRadius:10,padding:compact?"8px 10px":"12px 14px",border:`1px solid ${isFull?pos.color+"55":COLORS.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <span style={{fontSize:compact?11:12,fontWeight:700,color:pos.color,textTransform:"uppercase",letterSpacing:0.3}}>{compact?pos.label.split(" ")[0]:pos.label}</span>
              {isFull&&<span style={{fontSize:10,background:pos.color+"22",color:pos.color,padding:"1px 6px",borderRadius:10,fontWeight:700}}>FULL</span>}
            </div>
            <div style={{marginTop:4,fontSize:compact?16:20,fontWeight:800,color:COLORS.text}}>{confirmed}<span style={{fontSize:compact?11:13,fontWeight:400,color:COLORS.textMuted}}>/{isLib?"∞":pos.slots}</span></div>
            {!isLib&&<div style={{height:4,borderRadius:4,background:COLORS.border,marginTop:6,overflow:"hidden"}}><div style={{height:"100%",borderRadius:4,background:isFull?pos.color:pos.color+"99",width:`${pct}%`,transition:"width 0.3s"}}/></div>}
            {waitlisted>0&&<div style={{fontSize:10,color:COLORS.info,marginTop:4}}>+{waitlisted} waitlist</div>}
          </div>
        );
      })}
    </div>
  );
}

function WaitlistSummary({game,getReservationName}){
  const waitlist=game.reservations.filter(r=>r.status==="waitlist");
  if(waitlist.length===0)return null;
  return(
    <div style={{marginTop:10,padding:"10px 12px",background:COLORS.infoLight,borderRadius:8,border:`1px solid ${COLORS.info}33`}}>
      <p style={{margin:"0 0 6px",fontSize:12,fontWeight:700,color:COLORS.info}}>Waitlist ({waitlist.length})</p>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {waitlist.sort((a,b)=>a.waitlistPos-b.waitlistPos).map((r,i)=>{
          const{name,isGuest}=getReservationName(r);
          const pos=DEFAULT_POSITIONS.find(p=>p.key===r.position);
          return(
            <span key={i} style={{fontSize:11,background:COLORS.surface,border:`1px solid ${COLORS.border}`,padding:"2px 8px",borderRadius:20,color:COLORS.text}}>
              #{r.waitlistPos} {name}{isGuest?" 👤":""} <span style={{color:pos?.color,fontWeight:600}}>({pos?.label})</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── RESERVE MODAL (MEMBER) ───────────────────────────────────────────────────

function ReserveModal({game,userId,onReserve,onClose}){
  const[selPos,setSelPos]=useState(null);
  const getStatus=pos=>{
    const confirmed =game.reservations.filter(r=>r.position===pos.key&&r.status==="confirmed").length;
    const waitlisted=game.reservations.filter(r=>r.position===pos.key&&r.status==="waitlist").length;
    const isLib=pos.key==="libero";
    const isFull=!isLib&&confirmed>=pos.slots;
    return{confirmed,waitlisted,isFull,spotsLeft:isLib?"∞":Math.max(0,pos.slots-confirmed)};
  };
  const anyFull=game.positions.filter(p=>p.key!=="libero").some(p=>getStatus(p).isFull);
  return(
    <Modal title="Choose your position" onClose={onClose} wide>
      <p style={{margin:"0 0 16px",fontSize:14,color:COLORS.textMuted}}>Select a position to reserve your spot.</p>
      <div style={{display:"grid",gap:10}}>
        {game.positions.map(pos=>{
          const{confirmed,waitlisted,isFull,spotsLeft}=getStatus(pos);
          const isLib=pos.key==="libero";
          const locked=isLib&&!anyFull;
          const isSel=selPos===pos.key;
          return(
            <button key={pos.key} onClick={()=>!locked&&setSelPos(pos.key)} style={{background:isSel?pos.color+"15":locked?COLORS.surfaceAlt:COLORS.surface,border:`${isSel?2:1}px solid ${isSel?pos.color:COLORS.border}`,borderRadius:10,padding:"14px 16px",cursor:locked?"not-allowed":"pointer",textAlign:"left",opacity:locked?0.45:1,fontFamily:"'DM Sans',sans-serif"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:15,color:pos.color}}>{pos.label}</div>
                  {isLib&&<div style={{fontSize:12,color:COLORS.textMuted,marginTop:2}}>{locked?"Unlocks when any position is full":"Optional role — no slot limit"}</div>}
                  {!isLib&&<div style={{fontSize:12,color:COLORS.textMuted,marginTop:2}}>{confirmed}/{pos.slots} filled · {spotsLeft} spot{spotsLeft!==1?"s":""} left</div>}
                </div>
                <div style={{textAlign:"right"}}>
                  {isFull&&!isLib&&<span style={{fontSize:12,background:COLORS.warningLight,color:COLORS.warning,padding:"3px 10px",borderRadius:20,fontWeight:600}}>Join waitlist</span>}
                  {!isFull&&!isLib&&<span style={{fontSize:12,background:COLORS.successLight,color:COLORS.success,padding:"3px 10px",borderRadius:20,fontWeight:600}}>Available</span>}
                  {waitlisted>0&&<div style={{fontSize:11,color:COLORS.info,marginTop:4}}>+{waitlisted} waiting</div>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
        <button onClick={onClose} style={STYLES.btn.secondary}>Cancel</button>
        <button onClick={()=>{if(selPos){onReserve(game.id,userId,selPos);onClose();}}} style={{...STYLES.btn.primary,opacity:selPos?1:0.4}}>
          {selPos?`Reserve as ${game.positions.find(p=>p.key===selPos)?.label}`:"Select a position"}
        </button>
      </div>
    </Modal>
  );
}

function UploadProof({gameId,userId,onUpload}){
  const[name,setName]=useState("");
  const[show,setShow]=useState(false);
  if(!show)return<button onClick={()=>setShow(true)} style={{...STYLES.btn.secondary,padding:"7px 14px",fontSize:13}}>Upload GCash Proof</button>;
  return(
    <div style={{display:"flex",gap:6,alignItems:"center"}}>
      <input style={{...STYLES.input,width:160,padding:"7px 10px",fontSize:13}} placeholder="GCash ref #" value={name} onChange={e=>setName(e.target.value)}/>
      <button onClick={()=>{if(name.trim()){onUpload(gameId,userId,name.trim());setShow(false);setName("");}}} style={{...STYLES.btn.primary,padding:"7px 12px",fontSize:13}}>Submit</button>
    </div>
  );
}

// ─── GAME CARD ────────────────────────────────────────────────────────────────

function GameCard({game,currentUser,getReservationName,onReserve,onCancel,onUploadProof,isAdmin,onEdit,onDelete,onViewDetail}){
  const[showReserve,setShowReserve]=useState(false);
  const myRes=currentUser?game.reservations.find(r=>r.userId===currentUser.id):null;
  const confirmedCount=game.reservations.filter(r=>r.status==="confirmed").length;
  const waitlistCount =game.reservations.filter(r=>r.status==="waitlist").length;
  const totalSlots    =game.positions.filter(p=>p.key!=="libero").reduce((s,p)=>s+p.slots,0);
  const isPast        =new Date(game.date+"T"+game.time)<today;
  const myPos         =game.positions.find(p=>p.key===myRes?.position);
  return(
    <>
      <div style={{...STYLES.card,marginBottom:16,opacity:isPast?0.65:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
          <div style={{flex:1,minWidth:200}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <h3 style={{margin:0,fontSize:17,fontWeight:700,color:COLORS.text}}>{game.title}</h3>
              {isPast&&<Badge type="member">Past</Badge>}
              {game.allowGuests&&!isPast&&<span style={{fontSize:11,background:COLORS.guestLight,color:COLORS.guest,padding:"2px 8px",borderRadius:10,fontWeight:600}}>Guests welcome</span>}
            </div>
            <div style={{display:"flex",gap:16,marginTop:8,flexWrap:"wrap"}}>
              <span style={{fontSize:13,color:COLORS.textMuted}}>📅 {new Date(game.date).toLocaleDateString("en-PH",{weekday:"short",month:"short",day:"numeric"})} · {game.time}</span>
              <span style={{fontSize:13,color:COLORS.textMuted}}>📍 {game.venue}</span>
              <span style={{fontSize:13,color:COLORS.textMuted}}>₱{game.fee}</span>
              <span style={{fontSize:13,color:COLORS.success,fontWeight:600}}>{confirmedCount}/{totalSlots} players</span>
              {waitlistCount>0&&<span style={{fontSize:13,color:COLORS.info,fontWeight:600}}>{waitlistCount} on waitlist</span>}
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {isAdmin?(
              <>
                <button onClick={()=>onViewDetail(game)} style={{...STYLES.btn.secondary,padding:"8px 14px",fontSize:13}}>View</button>
                <button onClick={()=>onEdit(game)}       style={{...STYLES.btn.secondary,padding:"8px 14px",fontSize:13}}>Edit</button>
                <button onClick={()=>onDelete(game.id)}  style={{...STYLES.btn.danger,   padding:"8px 14px"}}>Delete</button>
              </>
            ):(
              <>
                {!myRes&&!isPast&&<button onClick={()=>setShowReserve(true)} style={{...STYLES.btn.primary,padding:"9px 18px",fontSize:13}}>Reserve Spot</button>}
                {myRes&&(
                  <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:12,background:myPos?.color+"22",color:myPos?.color,padding:"3px 10px",borderRadius:20,fontWeight:600}}>{myPos?.label}</span>
                      <Badge type={myRes.status}>{myRes.status==="waitlist"?`Waitlist #${myRes.waitlistPos}`:myRes.status}</Badge>
                      <Badge type={myRes.paymentStatus}>{myRes.paymentStatus}</Badge>
                    </div>
                    {myRes.paymentStatus==="unpaid"&&myRes.status==="confirmed"&&<UploadProof gameId={game.id} userId={currentUser.id} onUpload={onUploadProof}/>}
                    {myRes.paymentStatus==="pending"&&<span style={{fontSize:12,color:COLORS.warning}}>Waiting for admin to confirm</span>}
                    {!isPast&&<button onClick={()=>onCancel(game.id,currentUser.id)} style={{...STYLES.btn.ghost,fontSize:12,color:COLORS.danger,padding:"2px 0"}}>Cancel reservation</button>}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <PositionBreakdown game={game} compact/>
        <WaitlistSummary game={game} getReservationName={getReservationName}/>
        {game.notes&&<p style={{margin:"12px 0 0",fontSize:13,color:COLORS.textMuted,borderTop:`1px solid ${COLORS.border}`,paddingTop:10}}>📌 {game.notes}</p>}
      </div>
      {showReserve&&<ReserveModal game={game} userId={currentUser?.id} onReserve={onReserve} onClose={()=>setShowReserve(false)}/>}
    </>
  );
}
// ─── ADMIN SIGN IN MODAL ──────────────────────────────────────────────────────

function AdminSignInModal({game,users,onClose,onReserve}){
  const[selUId,setSelUId]=useState(null);
  const[selPos,setSelPos]=useState(null);
  const alreadySigned=game.reservations.map(r=>r.userId).filter(Boolean);
  const eligible=users.filter(u=>u.role==="member"&&!alreadySigned.includes(u.id));
  const selUser=users.find(u=>u.id===selUId);
  const getPosStatus=pos=>{
    const confirmed =game.reservations.filter(r=>r.position===pos.key&&r.status==="confirmed").length;
    const waitlisted=game.reservations.filter(r=>r.position===pos.key&&r.status==="waitlist").length;
    const isLib=pos.key==="libero";
    const isFull=!isLib&&confirmed>=pos.slots;
    return{confirmed,waitlisted,isFull,spotsLeft:isLib?"∞":Math.max(0,pos.slots-confirmed)};
  };
  const anyFull=game.positions.filter(p=>p.key!=="libero").some(p=>getPosStatus(p).isFull);
  return(
    <Modal title="Sign In a Member" onClose={onClose} wide>
      <p style={{margin:"0 0 16px",fontSize:13,color:COLORS.textMuted}}>Select a member and position to sign them in.</p>
      <div style={{marginBottom:18}}>
        <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:COLORS.text}}>1. Select Member</p>
        {eligible.length===0&&<p style={{fontSize:13,color:COLORS.textMuted}}>All members are already signed in.</p>}
        <div style={{display:"grid",gap:6,maxHeight:200,overflowY:"auto"}}>
          {eligible.map(u=>{
            const isSel=selUId===u.id;
            return(
              <button key={u.id} onClick={()=>{setSelUId(u.id);setSelPos(null);}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:isSel?COLORS.primary+"12":COLORS.surfaceAlt,border:`1.5px solid ${isSel?COLORS.primary:COLORS.border}`,borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"left"}}>
                <Avatar initials={u.avatar} size={30} color={isSel?COLORS.primary:COLORS.primaryLight}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:13,color:COLORS.text}}>{u.name}</div>
                  {(u.positions||[]).length>0&&<div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>{u.positions.map(p=>{const pos=DEFAULT_POSITIONS.find(x=>x.key===p.key);return<span key={p.key} style={{fontSize:10,background:pos?.color+"18",color:pos?.color,padding:"1px 6px",borderRadius:10,fontWeight:600}}>{pos?.label}·L{p.level}</span>;})}</div>}
                </div>
                {isSel&&<span style={{fontSize:18,color:COLORS.primary}}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>
      {selUId&&(
        <div style={{marginBottom:18}}>
          <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:COLORS.text}}>2. Select Position</p>
          <div style={{display:"grid",gap:8}}>
            {game.positions.map(pos=>{
              const{confirmed,waitlisted,isFull,spotsLeft}=getPosStatus(pos);
              const isLib=pos.key==="libero";
              const locked=isLib&&!anyFull;
              const isSel=selPos===pos.key;
              return(
                <button key={pos.key} onClick={()=>!locked&&setSelPos(pos.key)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:isSel?pos.color+"15":locked?COLORS.surfaceAlt:COLORS.surface,border:`${isSel?2:1}px solid ${isSel?pos.color:COLORS.border}`,borderRadius:8,cursor:locked?"not-allowed":"pointer",opacity:locked?0.45:1,fontFamily:"'DM Sans',sans-serif"}}>
                  <div><span style={{fontWeight:700,fontSize:13,color:pos.color}}>{pos.label}</span>{!isLib&&<span style={{fontSize:12,color:COLORS.textMuted,marginLeft:8}}>{confirmed}/{pos.slots}</span>}</div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {waitlisted>0&&<span style={{fontSize:11,color:COLORS.info}}>+{waitlisted} waiting</span>}
                    {isFull&&!isLib&&<span style={{fontSize:11,background:COLORS.warningLight,color:COLORS.warning,padding:"2px 8px",borderRadius:10,fontWeight:600}}>Waitlist</span>}
                    {!isFull&&!isLib&&<span style={{fontSize:11,background:COLORS.successLight,color:COLORS.success,padding:"2px 8px",borderRadius:10,fontWeight:600}}>{spotsLeft} left</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={STYLES.btn.secondary}>Cancel</button>
        <button onClick={()=>{if(selUId&&selPos){onReserve(game.id,selUId,selPos);onClose();}}} style={{...STYLES.btn.primary,opacity:selUId&&selPos?1:0.4}}>
          {selUId&&selPos?`Sign in ${selUser?.name} as ${game.positions.find(p=>p.key===selPos)?.label}`:"Select member and position"}
        </button>
      </div>
    </Modal>
  );
}

// ─── GAME SHEET ───────────────────────────────────────────────────────────────

function GameSheet({game,getReservationName,onClose}){
  const sheetRef=useRef(null);
  const confirmed=game.reservations.filter(r=>r.status==="confirmed");
  const waitlist =game.reservations.filter(r=>r.status==="waitlist").sort((a,b)=>a.waitlistPos-b.waitlistPos);
  const byPosition=DEFAULT_POSITIONS.map(pos=>({pos,players:confirmed.filter(r=>r.position===pos.key).map(r=>({...r,...getReservationName(r)}))})).filter(g=>g.players.length>0);

  return(
    <Modal title="Game Sheet" onClose={onClose} wide>
      <div style={{display:"flex",gap:8,marginBottom:16,justifyContent:"flex-end"}}>
        <button onClick={()=>window.print()} style={{...STYLES.btn.primary,padding:"8px 16px",fontSize:13}}>🖨 Print / Save PDF</button>
      </div>
      <div ref={sheetRef} style={{background:"#ffffff",padding:24,borderRadius:12,border:`2px solid ${COLORS.primary}`,fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{textAlign:"center",marginBottom:20,borderBottom:`2px solid ${COLORS.primary}`,paddingBottom:16}}>
          <div style={{fontSize:22,fontWeight:800,color:COLORS.primary}}>🏐 Chiquitos Volleyball</div>
          <div style={{fontSize:18,fontWeight:700,color:COLORS.text,marginTop:4}}>{game.title}</div>
          <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:8,flexWrap:"wrap"}}>
            <span style={{fontSize:13,color:COLORS.textMuted}}>📅 {new Date(game.date).toLocaleDateString("en-PH",{weekday:"long",year:"numeric",month:"long",day:"numeric"})} · {game.time}</span>
            <span style={{fontSize:13,color:COLORS.textMuted}}>📍 {game.venue}</span>
            <span style={{fontSize:13,color:COLORS.textMuted}}>₱{game.fee}/player</span>
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <p style={{margin:"0 0 10px",fontWeight:700,fontSize:14,color:COLORS.text}}>✅ Confirmed Players ({confirmed.length})</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
            {byPosition.map(({pos,players})=>(
              <div key={pos.key} style={{background:pos.color+"0d",border:`1px solid ${pos.color}33`,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:12,fontWeight:700,color:pos.color,marginBottom:6,textTransform:"uppercase"}}>{pos.label} ({players.length}/{pos.key==="libero"?"∞":pos.slots})</div>
                {players.map((r,i)=>(
                  <div key={i} style={{fontSize:13,color:COLORS.text,padding:"3px 0",borderBottom:i<players.length-1?`1px solid ${pos.color}22`:"none",display:"flex",alignItems:"center",gap:6}}>
                    <span>{r.name}</span>
                    {r.isGuest&&<span style={{fontSize:10,background:COLORS.guestLight,color:COLORS.guest,padding:"1px 5px",borderRadius:8,fontWeight:600}}>Guest</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {waitlist.length>0&&(
          <div style={{marginBottom:20}}>
            <p style={{margin:"0 0 10px",fontWeight:700,fontSize:14,color:COLORS.text}}>⏳ Waitlist ({waitlist.length})</p>
            <div style={{background:COLORS.infoLight,borderRadius:8,padding:"10px 12px"}}>
              {waitlist.map((r,i)=>{
                const{name,isGuest}=getReservationName(r);
                const pos=DEFAULT_POSITIONS.find(p=>p.key===r.position);
                return(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",fontSize:13}}>
                    <span style={{fontWeight:700,color:COLORS.info,minWidth:24}}>#{r.waitlistPos}</span>
                    <span style={{color:COLORS.text}}>{name}</span>
                    {isGuest&&<span style={{fontSize:10,background:COLORS.guestLight,color:COLORS.guest,padding:"1px 5px",borderRadius:8,fontWeight:600}}>Guest</span>}
                    <span style={{fontSize:11,background:pos?.color+"22",color:pos?.color,padding:"1px 8px",borderRadius:10,fontWeight:600}}>{pos?.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {game.matches&&game.teams&&(
          <div style={{marginBottom:20}}>
            <p style={{margin:"0 0 10px",fontWeight:700,fontSize:14,color:COLORS.text}}>📋 Match Order of Play</p>
            <div style={{display:"grid",gap:6}}>
              {game.matches.map((m,i)=>{
                const tA=game.teams.find(t=>t.id===m.teamA);
                const tB=game.teams.find(t=>t.id===m.teamB);
                return(
                  <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:i%2===0?COLORS.surfaceAlt:"#fff",borderRadius:6}}>
                    <span style={{fontWeight:700,color:COLORS.textMuted,minWidth:36,fontSize:12}}>R{m.round}-{i+1}</span>
                    <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:10,height:10,borderRadius:"50%",background:tA?.color,flexShrink:0}}/><span style={{fontWeight:600,fontSize:13,color:COLORS.text}}>{tA?.name}</span>
                      <span style={{color:COLORS.textMuted,fontSize:12}}>vs</span>
                      <div style={{width:10,height:10,borderRadius:"50%",background:tB?.color,flexShrink:0}}/><span style={{fontWeight:600,fontSize:13,color:COLORS.text}}>{tB?.name}</span>
                    </div>
                    {m.played&&<div style={{display:"flex",gap:4,alignItems:"center"}}>{m.sets.map((s,si)=><span key={si} style={{fontSize:12,fontWeight:600,background:COLORS.border,padding:"2px 6px",borderRadius:4}}>{s.a}–{s.b}</span>)}<span style={{fontSize:11,color:COLORS.success,fontWeight:700,marginLeft:4}}>{game.teams.find(t=>t.id===m.winner)?.name}</span></div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {game.teams&&(
          <div>
            <p style={{margin:"0 0 10px",fontWeight:700,fontSize:14,color:COLORS.text}}>👥 Teams</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
              {game.teams.map(team=>(
                <div key={team.id} style={{border:`2px solid ${team.color}`,borderRadius:8,overflow:"hidden"}}>
                  <div style={{background:team.color,padding:"6px 10px",color:"#fff",fontWeight:700,fontSize:13}}>{team.name}</div>
                  <div style={{padding:"8px 10px"}}>
                    {team.members.map(m=>{
                      const pos=DEFAULT_POSITIONS.find(p=>p.key===m.position);
                      return<div key={m.userId||m.guestId} style={{fontSize:12,color:COLORS.text,padding:"2px 0",display:"flex",justifyContent:"space-between"}}><span>{m.name}</span><span style={{color:pos?.color,fontWeight:600,fontSize:11}}>{pos?.label}</span></div>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{marginTop:20,paddingTop:12,borderTop:`1px solid ${COLORS.border}`,textAlign:"center",fontSize:11,color:COLORS.textMuted}}>Chiquitos Volleyball · Generated {new Date().toLocaleDateString("en-PH",{year:"numeric",month:"long",day:"numeric"})}</div>
      </div>
    </Modal>
  );
}

// ─── GAME DETAIL MODAL (ADMIN) ────────────────────────────────────────────────

function GameDetailModal({game,users,getReservationName,onClose,onConfirmPayment,onRejectPayment,onReserve,onCancel}){
  const[showSignIn,setShowSignIn]=useState(false);
  const[showSheet, setShowSheet] =useState(false);
  return(
    <>
      <Modal title={game.title} onClose={onClose} wide>
        <div style={{background:COLORS.surfaceAlt,borderRadius:8,padding:"12px 14px",fontSize:13,color:COLORS.textMuted,marginBottom:16}}>
          📅 {game.date} · {game.time} &nbsp;|&nbsp; 📍 {game.venue} &nbsp;|&nbsp; ₱{game.fee} &nbsp;|&nbsp;
          <span style={{color:game.allowGuests?COLORS.guest:COLORS.textMuted,fontWeight:600}}>{game.allowGuests?"Guests allowed":"Members only"}</span>
        </div>
        <PositionBreakdown game={game}/>
        <WaitlistSummary game={game} getReservationName={getReservationName}/>
        <div style={{marginTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
          <p style={{margin:0,fontWeight:700,fontSize:14,color:COLORS.text}}>Reservations ({game.reservations.length})</p>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowSheet(true)}  style={{...STYLES.btn.secondary,padding:"8px 14px",fontSize:13}}>📄 Game Sheet</button>
            <button onClick={()=>setShowSignIn(true)} style={{...STYLES.btn.primary,  padding:"8px 14px",fontSize:13}}>+ Sign In Member</button>
          </div>
        </div>
        {game.reservations.length===0&&<p style={{color:COLORS.textMuted,fontSize:13}}>No reservations yet.</p>}
        {game.reservations.map((r,i)=>{
          const{name,avatar,isGuest,contact}=getReservationName(r);
          const pos=game.positions.find(p=>p.key===r.position);
          return(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${COLORS.border}`,flexWrap:"wrap"}}>
              <Avatar initials={avatar} size={32} color={isGuest?COLORS.guest:COLORS.primary}/>
              <div style={{flex:1,minWidth:120}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontWeight:500,fontSize:14,color:COLORS.text}}>{name}</span>
                  {isGuest&&<Badge type="guest">Guest</Badge>}
                </div>
                <div style={{fontSize:12,color:COLORS.textMuted}}>{contact||""} {r.paymentProof?`· Ref: ${r.paymentProof}`:""}</div>
              </div>
              <span style={{fontSize:12,background:pos?.color+"22",color:pos?.color,padding:"3px 10px",borderRadius:20,fontWeight:600}}>{pos?.label}</span>
              <Badge type={r.status}>{r.status==="waitlist"?`Waitlist #${r.waitlistPos}`:r.status}</Badge>
              <Badge type={r.paymentStatus}>{r.paymentStatus}</Badge>
              <div style={{display:"flex",gap:6}}>
                {r.paymentProof&&r.paymentStatus==="pending"&&(
                  <>
                    <button onClick={()=>onConfirmPayment(game.id,r.userId,r.guestId)} style={{...STYLES.btn.primary,padding:"6px 12px",fontSize:12,background:COLORS.success}}>Confirm</button>
                    <button onClick={()=>onRejectPayment(game.id,r.userId,r.guestId)}  style={{...STYLES.btn.danger, padding:"6px 12px",fontSize:12}}>Reject</button>
                  </>
                )}
                <button onClick={()=>onCancel(game.id,r.userId,r.guestId)} style={{...STYLES.btn.ghost,fontSize:12,color:COLORS.danger,padding:"4px 8px"}}>Remove</button>
              </div>
            </div>
          );
        })}
      </Modal>
      {showSignIn&&<AdminSignInModal game={game} users={users} onClose={()=>setShowSignIn(false)} onReserve={onReserve}/>}
      {showSheet &&<GameSheet game={game} getReservationName={getReservationName} onClose={()=>setShowSheet(false)}/>}
    </>
  );
}
// ─── GAME FORM ────────────────────────────────────────────────────────────────

function GameForm({game,onSave,onClose}){
  const[form,setForm]=useState({title:game?.title||"",date:game?.date||"",time:game?.time||"08:00",venue:game?.venue||"",fee:game?.fee||150,allowMultiple:game?.allowMultiple??false,allowGuests:game?.allowGuests??true,notes:game?.notes||"",positions:game?.positions||DEFAULT_POSITIONS.map(p=>({...p}))});
  const set     =(k,v)=>setForm(p=>({...p,[k]:v}));
  const setSlots=(key,val)=>setForm(p=>({...p,positions:p.positions.map(pos=>pos.key===key?{...pos,slots:val}:pos)}));
  const valid=form.title&&form.date&&form.venue;
  return(
    <Modal title={game?"Edit Game":"Schedule New Game"} onClose={onClose} wide>
      <div style={{display:"grid",gap:14}}>
        <div><label style={{fontSize:13,fontWeight:500,color:COLORS.textMuted,display:"block",marginBottom:5}}>Title</label><input style={STYLES.input} value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Saturday Spike Session"/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div><label style={{fontSize:13,fontWeight:500,color:COLORS.textMuted,display:"block",marginBottom:5}}>Date</label><input style={STYLES.input} type="date" value={form.date} onChange={e=>set("date",e.target.value)}/></div>
          <div><label style={{fontSize:13,fontWeight:500,color:COLORS.textMuted,display:"block",marginBottom:5}}>Time</label><input style={STYLES.input} type="time" value={form.time} onChange={e=>set("time",e.target.value)}/></div>
        </div>
        <div><label style={{fontSize:13,fontWeight:500,color:COLORS.textMuted,display:"block",marginBottom:5}}>Venue</label><input style={STYLES.input} value={form.venue} onChange={e=>set("venue",e.target.value)} placeholder="Venue name, city"/></div>
        <div><label style={{fontSize:13,fontWeight:500,color:COLORS.textMuted,display:"block",marginBottom:5}}>Fee (₱)</label><input style={STYLES.input} type="number" min={0} value={form.fee} onChange={e=>set("fee",+e.target.value)}/></div>
        <div>
          <label style={{fontSize:13,fontWeight:500,color:COLORS.textMuted,display:"block",marginBottom:10}}>Position Slots</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
            {form.positions.filter(p=>p.key!=="libero").map(pos=>(
              <div key={pos.key} style={{background:COLORS.surfaceAlt,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:12,fontWeight:700,color:pos.color,marginBottom:6}}>{pos.label}</div>
                <input style={{...STYLES.input,padding:"7px 10px",fontSize:14}} type="number" min={1} value={pos.slots} onChange={e=>setSlots(pos.key,+e.target.value)}/>
              </div>
            ))}
          </div>
        </div>
        <div><label style={{fontSize:13,fontWeight:500,color:COLORS.textMuted,display:"block",marginBottom:5}}>Notes (optional)</label><textarea style={{...STYLES.input,resize:"vertical",minHeight:70}} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Reminders, rules, etc."/></div>
        <div style={{display:"grid",gap:10}}>
          <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:14,color:COLORS.text}}><input type="checkbox" checked={form.allowMultiple} onChange={e=>set("allowMultiple",e.target.checked)}/> Allow members to book multiple games this week</label>
          <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:14,color:COLORS.guest}}>
            <input type="checkbox" checked={form.allowGuests} onChange={e=>set("allowGuests",e.target.checked)}/> Allow guests to sign up for this game
          </label>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:8}}>
          <button onClick={onClose} style={STYLES.btn.secondary}>Cancel</button>
          <button onClick={()=>valid&&onSave(form)} style={{...STYLES.btn.primary,opacity:valid?1:0.5}}>{game?"Save changes":"Schedule game"}</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── ADD MEMBER MODAL ─────────────────────────────────────────────────────────

function AddMemberModal({onClose,onSave}){
  const[form,setForm]=useState({name:"",email:"",password:""});
  const[positions,setPos]=useState([]);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const hasPos=key=>positions.find(p=>p.key===key);
  const togglePos=key=>{if(hasPos(key))setPos(prev=>prev.filter(p=>p.key!==key));else setPos(prev=>[...prev,{key,level:1}]);};
  const setLevel=(key,level)=>setPos(prev=>prev.map(p=>p.key===key?{...p,level}:p));
  const valid=form.name&&form.email&&form.password;
  return(
    <Modal title="Add New Member" onClose={onClose} wide>
      <div style={{display:"grid",gap:16}}>
        <div style={{display:"grid",gap:12}}>
          <p style={{margin:0,fontWeight:700,fontSize:13,color:COLORS.textMuted,textTransform:"uppercase",letterSpacing:0.5}}>Account Details</p>
          <div><label style={{fontSize:13,fontWeight:500,color:COLORS.textMuted,display:"block",marginBottom:5}}>Full Name</label><input style={STYLES.input} value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Juan dela Cruz"/></div>
          <div><label style={{fontSize:13,fontWeight:500,color:COLORS.textMuted,display:"block",marginBottom:5}}>Email</label><input style={STYLES.input} type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="juan@email.com"/></div>
          <div><label style={{fontSize:13,fontWeight:500,color:COLORS.textMuted,display:"block",marginBottom:5}}>Password</label><input style={STYLES.input} type="password" value={form.password} onChange={e=>set("password",e.target.value)} placeholder="Temporary password"/></div>
        </div>
        <div>
          <p style={{margin:"0 0 6px",fontWeight:700,fontSize:13,color:COLORS.textMuted,textTransform:"uppercase",letterSpacing:0.5}}>Positions & Skill Level</p>
          <p style={{margin:"0 0 10px",fontSize:12,color:COLORS.textMuted}}>Check each position they play and assign a level.</p>
          <div style={{display:"grid",gap:8}}>
            {DEFAULT_POSITIONS.map(pos=>{
              const selected=hasPos(pos.key);
              return(
                <div key={pos.key} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:selected?pos.color+"0d":COLORS.surfaceAlt,border:`1.5px solid ${selected?pos.color+"55":COLORS.border}`,borderRadius:10}}>
                  <input type="checkbox" checked={!!selected} onChange={()=>togglePos(pos.key)} style={{width:16,height:16,cursor:"pointer",accentColor:pos.color}}/>
                  <span style={{flex:1,fontWeight:600,fontSize:14,color:selected?pos.color:COLORS.textMuted}}>{pos.label}</span>
                  {selected&&<div style={{display:"flex",gap:6}}>{[1,2,3].map(lvl=><button key={lvl} onClick={()=>setLevel(pos.key,lvl)} style={{width:34,height:34,borderRadius:8,border:`1.5px solid ${selected.level===lvl?pos.color:COLORS.border}`,background:selected.level===lvl?pos.color:COLORS.surface,color:selected.level===lvl?"#fff":COLORS.textMuted,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{lvl}</button>)}</div>}
                  {!selected&&<span style={{fontSize:12,color:COLORS.border}}>Select to set level</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:4}}>
          <button onClick={onClose} style={STYLES.btn.secondary}>Cancel</button>
          <button onClick={()=>valid&&onSave({...form,positions})} style={{...STYLES.btn.primary,opacity:valid?1:0.5}}>Add Member</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── REMARK MODAL ─────────────────────────────────────────────────────────────

function RemarkModal({user,onClose,onSave}){
  const[tags, setTags] =useState(user.remarkTags||[]);
  const[notes,setNotes]=useState(user.remarkNotes||"");
  const toggleTag=key=>setTags(prev=>prev.includes(key)?prev.filter(t=>t!==key):[...prev,key]);
  const skillTags   =REMARK_TAGS.filter(t=>t.category==="skill");
  const behaviorTags=REMARK_TAGS.filter(t=>t.category==="behavior");
  return(
    <Modal title={`Remarks — ${user.name}`} onClose={onClose} wide>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,padding:"12px 14px",background:COLORS.surfaceAlt,borderRadius:10}}>
        <Avatar initials={user.avatar} size={44} color={user.role==="admin"?COLORS.primary:COLORS.primaryLight}/>
        <div>
          <div style={{fontWeight:700,fontSize:16,color:COLORS.text}}>{user.name}</div>
          <div style={{fontSize:13,color:COLORS.textMuted}}>{user.email} · Since {user.joined}</div>
          {(user.positions||[]).length>0&&<div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>{user.positions.map(p=>{const pos=DEFAULT_POSITIONS.find(x=>x.key===p.key);return<span key={p.key} style={{fontSize:11,background:pos?.color+"18",color:pos?.color,padding:"2px 8px",borderRadius:20,fontWeight:600}}>{pos?.label}·L{p.level}</span>;})}</div>}
        </div>
      </div>
      <div style={{marginBottom:18}}>
        <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:COLORS.textMuted,textTransform:"uppercase",letterSpacing:0.5}}>⚡ Skills</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{skillTags.map(t=>{const a=tags.includes(t.key);return<button key={t.key} onClick={()=>toggleTag(t.key)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${a?t.color:COLORS.border}`,background:a?t.color:COLORS.surface,color:a?"#fff":COLORS.textMuted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{a?"✓ ":""}{t.label}</button>;})}</div>
      </div>
      <div style={{marginBottom:18}}>
        <p style={{margin:"0 0 10px",fontWeight:700,fontSize:13,color:COLORS.textMuted,textTransform:"uppercase",letterSpacing:0.5}}>🤝 Behavior</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{behaviorTags.map(t=>{const a=tags.includes(t.key);return<button key={t.key} onClick={()=>toggleTag(t.key)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${a?t.color:COLORS.border}`,background:a?t.color:COLORS.surface,color:a?"#fff":COLORS.textMuted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{a?"✓ ":""}{t.label}</button>;})}</div>
      </div>
      <div style={{marginBottom:20}}>
        <p style={{margin:"0 0 8px",fontWeight:700,fontSize:13,color:COLORS.textMuted,textTransform:"uppercase",letterSpacing:0.5}}>📝 Notes</p>
        <textarea style={{...STYLES.input,resize:"vertical",minHeight:90}} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Additional observations..."/>
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={STYLES.btn.secondary}>Cancel</button>
        <button onClick={()=>{onSave(user.id,tags,notes);onClose();}} style={STYLES.btn.primary}>Save Remarks</button>
      </div>
    </Modal>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────

function ProfilePage({currentUser,store}){
  const[editing,setEditing]=useState(false);
  const[positions,setPositions]=useState(currentUser.positions||[]);
  const hasPos=key=>positions.find(p=>p.key===key);
  const togglePos=key=>{if(hasPos(key))setPositions(prev=>prev.filter(p=>p.key!==key));else setPositions(prev=>[...prev,{key,level:1}]);};
  const setLevel=(key,level)=>setPositions(prev=>prev.map(p=>p.key===key?{...p,level}:p));
  const levelColors={1:{bg:"#f0f4ed",text:"#5a7a5a",label:"Level 1"},2:{bg:"#fef9e7",text:"#d68910",label:"Level 2"},3:{bg:"#eafaf1",text:"#1e8449",label:"Level 3"}};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{margin:0,fontSize:22,fontWeight:700,color:COLORS.text}}>My Profile</h2>
        {!editing&&<button onClick={()=>setEditing(true)} style={STYLES.btn.secondary}>Edit Profile</button>}
      </div>
      <div style={{...STYLES.card,marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
          <Avatar initials={currentUser.avatar} size={56}/>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:COLORS.text}}>{currentUser.name}</div>
            <div style={{fontSize:14,color:COLORS.textMuted}}>{currentUser.email}</div>
            <div style={{fontSize:13,color:COLORS.textMuted,marginTop:2}}>Member since {currentUser.joined}</div>
          </div>
        </div>
        <div style={{borderTop:`1px solid ${COLORS.border}`,paddingTop:16}}>
          <p style={{margin:"0 0 14px",fontWeight:700,fontSize:15,color:COLORS.text}}>Positions & Proficiency</p>
          {!editing?(
            <div>
              {(currentUser.positions||[]).length===0&&<div style={{background:COLORS.surfaceAlt,borderRadius:8,padding:"14px 16px",fontSize:14,color:COLORS.textMuted}}>No positions set. Click <strong>Edit Profile</strong> to add.</div>}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
                {(currentUser.positions||[]).map(p=>{const pos=DEFAULT_POSITIONS.find(x=>x.key===p.key);const lc=levelColors[p.level];return<div key={p.key} style={{background:COLORS.surfaceAlt,borderRadius:10,padding:"12px 14px",border:`1px solid ${COLORS.border}`}}><div style={{fontSize:13,fontWeight:700,color:pos?.color}}>{pos?.label}</div><div style={{marginTop:8}}><span style={{background:lc.bg,color:lc.text,padding:"3px 12px",borderRadius:20,fontSize:12,fontWeight:700}}>{lc.label}</span></div></div>;})}
              </div>
            </div>
          ):(
            <div>
              <div style={{display:"grid",gap:10}}>
                {DEFAULT_POSITIONS.map(pos=>{
                  const selected=hasPos(pos.key);
                  return(
                    <div key={pos.key} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:selected?pos.color+"0d":COLORS.surfaceAlt,border:`1.5px solid ${selected?pos.color+"55":COLORS.border}`,borderRadius:10}}>
                      <input type="checkbox" checked={!!selected} onChange={()=>togglePos(pos.key)} style={{width:16,height:16,cursor:"pointer",accentColor:pos.color}}/>
                      <span style={{flex:1,fontWeight:600,fontSize:14,color:selected?pos.color:COLORS.textMuted}}>{pos.label}</span>
                      {selected&&<div style={{display:"flex",gap:6}}>{[1,2,3].map(lvl=><button key={lvl} onClick={()=>setLevel(pos.key,lvl)} style={{width:34,height:34,borderRadius:8,border:`1.5px solid ${selected.level===lvl?pos.color:COLORS.border}`,background:selected.level===lvl?pos.color:COLORS.surface,color:selected.level===lvl?"#fff":COLORS.textMuted,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{lvl}</button>)}</div>}
                      {!selected&&<span style={{fontSize:12,color:COLORS.border}}>Select to set level</span>}
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:16}}>
                <button onClick={()=>{setPositions(currentUser.positions||[]);setEditing(false);}} style={STYLES.btn.secondary}>Cancel</button>
                <button onClick={()=>{store.updateProfile(currentUser.id,{positions});setEditing(false);}} style={STYLES.btn.primary}>Save Profile</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ─── TEAMS MANAGER ────────────────────────────────────────────────────────────

function suggestTeams(confirmed,numTeams,users,getReservationName){
  const teams=Array.from({length:numTeams},(_,i)=>({id:i,name:TEAM_NAMES[i],color:TEAM_COLORS[i],members:[]}));
  const posOrder=["setter","opp","oh","mb","libero"];
  const byPos={};posOrder.forEach(p=>{byPos[p]=[];});byPos["unassigned"]=[];
  confirmed.forEach(r=>{
    const{name,avatar}=getReservationName(r);
    const user=users.find(u=>u.id===r.userId);
    const up=(user?.positions||[]).find(p=>p.key===r.position);
    const level=r.level||up?.level||1;
    const entry={userId:r.userId,guestId:r.guestId,position:r.position,level,name,avatar};
    if(byPos[r.position])byPos[r.position].push(entry);else byPos["unassigned"].push(entry);
  });
  posOrder.concat(["unassigned"]).forEach(posKey=>{
    const group=(byPos[posKey]||[]).sort((a,b)=>b.level-a.level);
    group.forEach((player,idx)=>{
      const round=Math.floor(idx/numTeams);
      const pos=idx%numTeams;
      const teamIdx=round%2===0?pos:(numTeams-1-pos);
      teams[teamIdx].members.push(player);
    });
  });
  return teams;
}

function generateRoundRobin(teams,rounds){
  const matches=[];let id=1;const n=teams.length;
  for(let r=0;r<rounds;r++)for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)matches.push({id:id++,round:r+1,teamA:teams[i].id,teamB:teams[j].id,sets:[],winner:null,played:false});
  return matches;
}

function computeStandings(teams,matches,settings){
  const stw=settings?.setsToWin||2;
  const s=teams.map(t=>({...t,matchWins:0,matchLosses:0,setsWon:0,setsLost:0,pointsWon:0,pointsLost:0}));
  matches.filter(m=>m.played).forEach(m=>{
    const a=s.find(x=>x.id===m.teamA),b=s.find(x=>x.id===m.teamB);
    if(!a||!b)return;
    const wA=m.sets.filter(x=>x.a>x.b).length,wB=m.sets.filter(x=>x.b>x.a).length;
    m.sets.forEach(x=>{a.pointsWon+=x.a;a.pointsLost+=x.b;b.pointsWon+=x.b;b.pointsLost+=x.a;a.setsWon+=x.a>x.b?1:0;a.setsLost+=x.b>x.a?1:0;b.setsWon+=x.b>x.a?1:0;b.setsLost+=x.a>x.b?1:0;});
    if(wA>=stw){a.matchWins++;b.matchLosses++;}else if(wB>=stw){b.matchWins++;a.matchLosses++;}
  });
  return s.sort((a,b)=>b.matchWins-a.matchWins||b.pointsWon-a.pointsWon);
}

function TeamsManager({games,users,getReservationName,store}){
  const[selGameId,setSelGameId]=useState(null);
  const[step,setStep]          =useState("select");
  const[numTeams,setNumTeams]  =useState(4);
  const[draftTeams,setDraft]   =useState(null);
  const[rounds,setRounds]      =useState(2);
  const[setsToWin,setSets]     =useState(2);
  const[scoreTarget,setTarget] =useState(21);
  const[scoreModal,setScModal] =useState(null);
  const[showSheet,setShowSheet]=useState(false);

  const upGames  =games.filter(g=>new Date(g.date+"T"+g.time)>=today).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const selGame  =games.find(g=>g.id===selGameId);
  const confirmed=selGame?.reservations.filter(r=>r.status==="confirmed")||[];

  const handleSelect=id=>{setSelGameId(id);const g=games.find(x=>x.id===id);if(g?.teams){setDraft(g.teams);setStep("teams");}else setStep("setup");};
  const handleSuggest=()=>{setDraft(suggestTeams(confirmed,numTeams,users,getReservationName));setStep("teams");};
  const handleSaveTeams=()=>{store.saveTeams(selGameId,draftTeams);store.saveMatches(selGameId,generateRoundRobin(draftTeams,rounds),{setsToWin,scoreTarget,rounds});setStep("matches");};
  const movePlayer=(player,from,to)=>setDraft(prev=>prev.map(t=>{
    const key=player.guestId?"guestId":"userId";
    if(t.id===from)return{...t,members:t.members.filter(m=>m[key]!==player[key])};
    if(t.id===to)  return{...t,members:[...t.members,player]};
    return t;
  }));
  const getTeam=id=>(selGame?.teams||draftTeams||[]).find(t=>t.id===id);
  const standings=selGame?.teams&&selGame?.matches?computeStandings(selGame.teams,selGame.matches,selGame.matchSettings):[];

  const ScoreModal=({match,onClose})=>{
    const stw=selGame?.matchSettings?.setsToWin||2;
    const[scores,setScores]=useState(match.sets.length>0?match.sets:Array.from({length:stw},()=>({a:0,b:0})));
    const tA=getTeam(match.teamA),tB=getTeam(match.teamB);
    return(
      <Modal title={`${tA?.name} vs ${tB?.name}`} onClose={onClose}>
        <p style={{margin:"0 0 16px",fontSize:13,color:COLORS.textMuted}}>Score target: {selGame?.matchSettings?.scoreTarget||21} · First to {stw} set wins</p>
        <div style={{display:"grid",gap:10}}>
          {scores.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:13,fontWeight:600,color:COLORS.textMuted,minWidth:44}}>Set {i+1}</span>
              <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
                <span style={{fontSize:12,color:tA?.color,fontWeight:700,minWidth:52}}>{tA?.name}</span>
                <input type="number" min={0} max={99} value={s.a} onChange={e=>setScores(prev=>prev.map((x,xi)=>xi===i?{...x,a:+e.target.value}:x))} style={{...STYLES.input,width:64,padding:"8px 10px",textAlign:"center",fontSize:16,fontWeight:700}}/>
                <span style={{color:COLORS.textMuted,fontWeight:700}}>—</span>
                <input type="number" min={0} max={99} value={s.b} onChange={e=>setScores(prev=>prev.map((x,xi)=>xi===i?{...x,b:+e.target.value}:x))} style={{...STYLES.input,width:64,padding:"8px 10px",textAlign:"center",fontSize:16,fontWeight:700}}/>
                <span style={{fontSize:12,color:tB?.color,fontWeight:700,minWidth:52}}>{tB?.name}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:8,marginTop:12}}>
          {scores.length<stw*2-1&&<button onClick={()=>setScores(prev=>[...prev,{a:0,b:0}])} style={{...STYLES.btn.secondary,padding:"7px 14px",fontSize:13}}>+ Add Set</button>}
          {scores.length>stw&&<button onClick={()=>setScores(prev=>prev.slice(0,-1))} style={{...STYLES.btn.ghost,fontSize:13}}>− Remove</button>}
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:16}}>
          <button onClick={onClose} style={STYLES.btn.secondary}>Cancel</button>
          <button onClick={()=>{store.updateMatchScore(selGameId,match.id,scores);onClose();}} style={STYLES.btn.primary}>Save Score</button>
        </div>
      </Modal>
    );
  };

  return(
    <div>
      <h2 style={{margin:"0 0 20px",fontSize:22,fontWeight:700,color:COLORS.text}}>Teams & Matches</h2>
      <div style={{...STYLES.card,marginBottom:16}}>
        <p style={{margin:"0 0 10px",fontWeight:600,fontSize:14,color:COLORS.text}}>Select a game</p>
        {upGames.length===0&&<p style={{color:COLORS.textMuted,fontSize:14}}>No upcoming games.</p>}
        <div style={{display:"grid",gap:8}}>
          {upGames.map(g=>{const cc=g.reservations.filter(r=>r.status==="confirmed").length;const wc=g.reservations.filter(r=>r.status==="waitlist").length;return(
            <button key={g.id} onClick={()=>handleSelect(g.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:selGameId===g.id?COLORS.primary+"12":COLORS.surfaceAlt,border:`1.5px solid ${selGameId===g.id?COLORS.primary:COLORS.border}`,borderRadius:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"left"}}>
              <div><div style={{fontWeight:600,fontSize:14,color:COLORS.text}}>{g.title}</div><div style={{fontSize:12,color:COLORS.textMuted,marginTop:2}}>📅 {g.date} · {cc} confirmed{wc>0?` · ${wc} waitlist`:""}</div></div>
              {g.teams?<span style={{fontSize:12,background:COLORS.successLight,color:COLORS.success,padding:"3px 10px",borderRadius:20,fontWeight:600}}>Teams set</span>:<span style={{fontSize:12,background:COLORS.surfaceAlt,color:COLORS.textMuted,padding:"3px 10px",borderRadius:20,fontWeight:600}}>No teams yet</span>}
            </button>
          );})}
        </div>
      </div>

      {selGame&&step==="setup"&&(
        <div style={STYLES.card}>
          <p style={{margin:"0 0 16px",fontWeight:700,fontSize:15,color:COLORS.text}}>Team & Match Settings</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:16}}>
            {[{label:"Number of teams",val:numTeams,set:setNumTeams,min:2,max:6},{label:"Round robin rounds",val:rounds,set:setRounds,min:1,max:4},{label:"Sets to win a match",val:setsToWin,set:setSets,min:1,max:5},{label:"Score target per set",val:scoreTarget,set:setTarget,min:15,max:30}].map(s=>(
              <div key={s.label}><label style={{fontSize:12,fontWeight:600,color:COLORS.textMuted,display:"block",marginBottom:6}}>{s.label}</label><input type="number" min={s.min} max={s.max} value={s.val} onChange={e=>s.set(+e.target.value)} style={{...STYLES.input,padding:"9px 12px"}}/></div>
            ))}
          </div>
          <button onClick={handleSuggest} style={STYLES.btn.primary}>Generate Team Suggestions →</button>
        </div>
      )}

      {selGame&&step==="teams"&&draftTeams&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
            <p style={{margin:0,fontWeight:700,fontSize:15,color:COLORS.text}}>Suggested Teams — drag to adjust</p>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setStep("setup")} style={{...STYLES.btn.secondary,padding:"8px 14px",fontSize:13}}>← Redo</button>
              <button onClick={handleSaveTeams} style={STYLES.btn.primary}>Lock Teams & Generate Matches →</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
            {draftTeams.map(team=>(
              <div key={team.id} style={{background:COLORS.surface,border:`2px solid ${team.color}33`,borderRadius:12,overflow:"hidden"}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const d=JSON.parse(e.dataTransfer.getData("text/plain"));if(d.fromTeam!==team.id)movePlayer(d.player,d.fromTeam,team.id);}}>
                <div style={{background:team.color,padding:"10px 14px",display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:700,fontSize:14,color:"#fff"}}>{team.name}</span><span style={{fontSize:12,color:"rgba(255,255,255,0.8)"}}>{team.members.length} players</span></div>
                <div style={{padding:"10px"}}>
                  {team.members.length===0&&<p style={{color:COLORS.textMuted,fontSize:12,textAlign:"center",padding:"10px 0"}}>Drop players here</p>}
                  {team.members.map((m,mi)=>{
                    const pos=DEFAULT_POSITIONS.find(p=>p.key===m.position);
                    const key=m.guestId||m.userId;
                    return(
                      <div key={key} draggable onDragStart={e=>e.dataTransfer.setData("text/plain",JSON.stringify({player:m,fromTeam:team.id}))} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",marginBottom:5,background:COLORS.surfaceAlt,borderRadius:8,cursor:"grab",userSelect:"none"}}>
                        <div style={{width:28,height:28,borderRadius:"50%",background:m.guestId?COLORS.guest+"33":team.color+"33",color:m.guestId?COLORS.guest:team.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{m.avatar}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:600,color:COLORS.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.name}{m.guestId?" 👤":""}</div>
                          <div style={{display:"flex",gap:4,marginTop:2}}>
                            <span style={{fontSize:10,background:pos?.color+"22",color:pos?.color,padding:"1px 6px",borderRadius:10,fontWeight:600}}>{pos?.label}</span>
                            <span style={{fontSize:10,background:COLORS.border,color:COLORS.textMuted,padding:"1px 6px",borderRadius:10,fontWeight:600}}>L{m.level}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selGame&&selGame.matches&&(step==="matches"||step==="standings")&&(
        <div style={{marginTop:20}}>
          <div style={{display:"flex",borderBottom:`1px solid ${COLORS.border}`,marginBottom:16,justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex"}}>
              {["matches","standings"].map(s=><button key={s} onClick={()=>setStep(s)} style={{padding:"10px 18px",background:"transparent",border:"none",borderBottom:step===s?`2.5px solid ${COLORS.primary}`:"2.5px solid transparent",color:step===s?COLORS.primary:COLORS.textMuted,fontWeight:600,cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>{s==="matches"?"📋 Matches":"🏆 Standings"}</button>)}
            </div>
            <div style={{display:"flex",gap:8,paddingBottom:4}}>
              <button onClick={()=>setShowSheet(true)} style={{...STYLES.btn.secondary,padding:"6px 12px",fontSize:12}}>📄 Game Sheet</button>
              <button onClick={()=>setStep("teams")}   style={{...STYLES.btn.ghost,fontSize:13}}>Edit Teams</button>
            </div>
          </div>
          {step==="matches"&&(
            <div>{Array.from({length:selGame.matchSettings?.rounds||2},(_,ri)=>(
              <div key={ri} style={{marginBottom:20}}>
                <p style={{margin:"0 0 10px",fontWeight:700,fontSize:14,color:COLORS.textMuted}}>Round {ri+1}</p>
                <div style={{display:"grid",gap:10}}>
                  {selGame.matches.filter(m=>m.round===ri+1).map(m=>{
                    const tA=selGame.teams.find(t=>t.id===m.teamA);const tB=selGame.teams.find(t=>t.id===m.teamB);
                    return(
                      <div key={m.id} style={{...STYLES.card,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                        <div style={{flex:1,display:"flex",alignItems:"center",gap:10,minWidth:200}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:"50%",background:tA?.color}}/><span style={{fontWeight:m.winner===m.teamA?700:400,fontSize:14,color:m.winner===m.teamA?COLORS.text:COLORS.textMuted}}>{tA?.name}</span></div>
                          <span style={{color:COLORS.textMuted,fontSize:13}}>vs</span>
                          <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:"50%",background:tB?.color}}/><span style={{fontWeight:m.winner===m.teamB?700:400,fontSize:14,color:m.winner===m.teamB?COLORS.text:COLORS.textMuted}}>{tB?.name}</span></div>
                        </div>
                        {m.played?(
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div style={{display:"flex",gap:6}}>{m.sets.map((s,i)=><span key={i} style={{fontSize:13,fontWeight:600,color:COLORS.text,background:COLORS.surfaceAlt,padding:"3px 8px",borderRadius:6}}>{s.a}–{s.b}</span>)}</div>
                            <span style={{fontSize:12,background:COLORS.successLight,color:COLORS.success,padding:"3px 10px",borderRadius:20,fontWeight:600}}>{selGame.teams.find(t=>t.id===m.winner)?.name} wins</span>
                            <button onClick={()=>setScModal(m)} style={{...STYLES.btn.ghost,fontSize:12,padding:"4px 10px"}}>Edit</button>
                          </div>
                        ):<button onClick={()=>setScModal(m)} style={{...STYLES.btn.primary,padding:"8px 16px",fontSize:13}}>Enter Score</button>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}</div>
          )}
          {step==="standings"&&(
            <div style={STYLES.card}>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
                  <thead><tr style={{borderBottom:`2px solid ${COLORS.border}`}}>{["Rank","Team","W","L","Sets W","Sets L","Pts Won","Pts Lost"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:h==="Team"?"left":"center",fontWeight:700,color:COLORS.textMuted,fontSize:12}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {standings.map((t,i)=>(
                      <tr key={t.id} style={{borderBottom:`1px solid ${COLORS.border}`,background:i===0?"#fffbea":"transparent"}}>
                        <td style={{padding:"10px 12px",textAlign:"center",fontWeight:700,fontSize:16}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</td>
                        <td style={{padding:"10px 12px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:t.color,flexShrink:0}}/><span style={{fontWeight:600,color:COLORS.text}}>{t.name}</span><span style={{fontSize:11,color:COLORS.textMuted}}>({t.members?.length||0})</span></div></td>
                        {[t.matchWins,t.matchLosses,t.setsWon,t.setsLost,t.pointsWon,t.pointsLost].map((v,vi)=><td key={vi} style={{padding:"10px 12px",textAlign:"center",fontWeight:vi<2?700:400,color:vi===0?COLORS.success:vi===1?COLORS.danger:COLORS.text}}>{v}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {standings.length===0&&<p style={{color:COLORS.textMuted,fontSize:14,padding:"14px 0",textAlign:"center"}}>No completed matches yet.</p>}
              </div>
              <p style={{margin:"12px 0 0",fontSize:12,color:COLORS.textMuted}}>Ranked by: match wins → total points won</p>
            </div>
          )}
        </div>
      )}
      {scoreModal&&<ScoreModal match={scoreModal} onClose={()=>setScModal(null)}/>}
      {showSheet&&selGame&&<GameSheet game={selGame} getReservationName={getReservationName} onClose={()=>setShowSheet(false)}/>}
    </div>
  );
}
// ─── MEMBERS MANAGER ──────────────────────────────────────────────────────────

function MembersManager({users,guests,currentUser,store}){
  const[showForm,  setShowForm]  =useState(false);
  const[remarkUser,setRemarkUser]=useState(null);
  const[search,    setSearch]    =useState("");
  const[tab,       setTab]       =useState("members"); // members | guests
  const filtered=users.filter(u=>u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase()));
  const filteredGuests=guests.filter(g=>g.name.toLowerCase().includes(search.toLowerCase())||g.contact.toLowerCase().includes(search.toLowerCase()));
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h2 style={{margin:0,fontSize:22,fontWeight:700,color:COLORS.text}}>Members</h2>
        <button onClick={()=>setShowForm(true)} style={STYLES.btn.primary}>+ Add Member</button>
      </div>
      <div style={{display:"flex",background:COLORS.surfaceAlt,borderRadius:10,padding:4,marginBottom:14,width:"fit-content"}}>
        <button onClick={()=>setTab("members")} style={{padding:"7px 18px",borderRadius:8,border:"none",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:tab==="members"?COLORS.surface:"transparent",color:tab==="members"?COLORS.primary:COLORS.textMuted}}>Members ({users.length})</button>
        <button onClick={()=>setTab("guests")}  style={{padding:"7px 18px",borderRadius:8,border:"none",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",background:tab==="guests"?COLORS.surface:"transparent",color:tab==="guests"?COLORS.guest:COLORS.textMuted}}>Guests ({guests.length})</button>
      </div>
      <input style={{...STYLES.input,marginBottom:14}} placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>

      {tab==="members"&&(
        <div style={STYLES.card}>
          {filtered.map((u,i)=>{
            const activeTags=(u.remarkTags||[]).map(k=>REMARK_TAGS.find(t=>t.key===k)).filter(Boolean);
            const hasRemarks=activeTags.length>0||u.remarkNotes;
            return(
              <div key={u.id} style={{padding:"14px 0",borderBottom:i<filtered.length-1?`1px solid ${COLORS.border}`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <Avatar initials={u.avatar} size={40} color={u.role==="admin"?COLORS.primary:COLORS.primaryLight}/>
                  <div style={{flex:1,minWidth:150}}>
                    <div style={{fontWeight:600,fontSize:15,color:COLORS.text}}>{u.name}</div>
                    <div style={{fontSize:13,color:COLORS.textMuted}}>{u.email}</div>
                    {(u.positions||[]).length>0&&<div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>{u.positions.map(p=>{const pos=DEFAULT_POSITIONS.find(x=>x.key===p.key);return<span key={p.key} style={{fontSize:11,background:pos?.color+"18",color:pos?.color,padding:"2px 8px",borderRadius:20,fontWeight:600}}>{pos?.label}·L{p.level}</span>;})}</div>}
                  </div>
                  <Badge type={u.role}>{u.role}</Badge>
                  <span style={{fontSize:12,color:COLORS.textMuted}}>Since {u.joined}</span>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <button onClick={()=>setRemarkUser(u)} style={{...STYLES.btn.secondary,padding:"6px 12px",fontSize:12}}>{hasRemarks?"✏️ Remarks":"📝 Add Remarks"}</button>
                    {u.id!==currentUser.id&&(
                      <>
                        <button onClick={()=>store.toggleRole(u.id)}   style={{...STYLES.btn.secondary,padding:"6px 12px",fontSize:12}}>{u.role==="admin"?"Demote":"Make Admin"}</button>
                        <button onClick={()=>store.removeMember(u.id)} style={{...STYLES.btn.danger,   padding:"6px 12px"}}>Remove</button>
                      </>
                    )}
                  </div>
                </div>
                {hasRemarks&&(
                  <div style={{marginTop:10,marginLeft:52,padding:"10px 14px",background:COLORS.surfaceAlt,borderRadius:8,borderLeft:`3px solid ${COLORS.primary}`}}>
                    {activeTags.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:u.remarkNotes?8:0}}>{activeTags.map(t=><span key={t.key} style={{fontSize:11,background:t.color+"18",color:t.color,padding:"2px 8px",borderRadius:20,fontWeight:600}}>{t.label}</span>)}</div>}
                    {u.remarkNotes&&<p style={{margin:0,fontSize:12,color:COLORS.textMuted,fontStyle:"italic"}}>"{u.remarkNotes}"</p>}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length===0&&<p style={{color:COLORS.textMuted,fontSize:14,padding:"12px 0"}}>No members found.</p>}
        </div>
      )}

      {tab==="guests"&&(
        <div style={STYLES.card}>
          {filteredGuests.length===0&&<p style={{color:COLORS.textMuted,fontSize:14,padding:"12px 0"}}>No guests yet.</p>}
          {filteredGuests.map((g,i)=>(
            <div key={g.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<filteredGuests.length-1?`1px solid ${COLORS.border}`:"none",flexWrap:"wrap"}}>
              <Avatar initials={g.name.slice(0,2).toUpperCase()} size={40} color={COLORS.guest}/>
              <div style={{flex:1,minWidth:150}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontWeight:600,fontSize:15,color:COLORS.text}}>{g.name}</span>
                  <Badge type="guest">Guest</Badge>
                </div>
                <div style={{fontSize:13,color:COLORS.textMuted}}>📞 {g.contact}</div>
                <div style={{fontSize:12,color:COLORS.textMuted}}>Joined {new Date(g.joinedAt).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"})}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm&&<AddMemberModal onClose={()=>setShowForm(false)} onSave={member=>{const ok=store.addMember(member);if(ok)setShowForm(false);}}/>}
      {remarkUser&&<RemarkModal user={remarkUser} onClose={()=>setRemarkUser(null)} onSave={(id,tags,notes)=>store.updateProfile(id,{remarkTags:tags,remarkNotes:notes})}/>}
    </div>
  );
}

// ─── ADMIN SCHEDULE ───────────────────────────────────────────────────────────

function ScheduleManager({games,users,getReservationName,currentUser,store}){
  const[showForm,  setShowForm]  =useState(false);
  const[editGame,  setEditGame]  =useState(null);
  const[detailGame,setDetailGame]=useState(null);
  const sorted=[...games].sort((a,b)=>new Date(a.date)-new Date(b.date));
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{margin:0,fontSize:22,fontWeight:700,color:COLORS.text}}>Game Schedule</h2>
        <button onClick={()=>setShowForm(true)} style={STYLES.btn.primary}>+ New Game</button>
      </div>
      {sorted.length===0&&<p style={{color:COLORS.textMuted}}>No games scheduled yet.</p>}
      {sorted.map(g=><GameCard key={g.id} game={g} currentUser={currentUser} getReservationName={getReservationName} isAdmin onEdit={g=>{setEditGame(g);setShowForm(true);}} onDelete={store.deleteGame} onViewDetail={setDetailGame}/>)}
      {showForm&&<GameForm game={editGame} onSave={editGame?(d)=>{store.updateGame(editGame.id,d);setShowForm(false);setEditGame(null);}:(d)=>{store.addGame(d);setShowForm(false);}} onClose={()=>{setShowForm(false);setEditGame(null);}}/>}
      {detailGame&&<GameDetailModal game={detailGame} users={users} getReservationName={getReservationName} onClose={()=>setDetailGame(null)} onConfirmPayment={store.confirmPayment} onRejectPayment={store.rejectPayment} onReserve={store.reserve} onCancel={store.cancelReservation}/>}
    </div>
  );
}

// ─── PAYMENTS MANAGER ─────────────────────────────────────────────────────────

function PaymentsManager({games,getReservationName,store}){
  const pending=games.flatMap(g=>g.reservations.filter(r=>r.paymentProof&&r.paymentStatus==="pending").map(r=>({...r,game:g})));
  const paid   =games.flatMap(g=>g.reservations.filter(r=>r.paymentStatus==="paid").map(r=>({...r,game:g})));
  const unpaid =games.flatMap(g=>g.reservations.filter(r=>r.paymentStatus==="unpaid"&&r.status==="confirmed").map(r=>({...r,game:g})));
  const total  =paid.reduce((s,r)=>s+r.game.fee,0);
  const Row=({r,showActions})=>{
    const{name,avatar,isGuest}=getReservationName(r);
    const pos=r.game.positions?.find(p=>p.key===r.position);
    return(
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${COLORS.border}`,flexWrap:"wrap"}}>
        <Avatar initials={avatar} size={32} color={isGuest?COLORS.guest:COLORS.primary}/>
        <div style={{flex:1,minWidth:120}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontWeight:500,fontSize:14,color:COLORS.text}}>{name}</span>
            {isGuest&&<Badge type="guest">Guest</Badge>}
          </div>
          <div style={{fontSize:12,color:COLORS.textMuted}}>{r.game.title}·₱{r.game.fee}{r.paymentProof?`·${r.paymentProof}`:""}</div>
        </div>
        {pos&&<span style={{fontSize:12,background:pos.color+"22",color:pos.color,padding:"3px 10px",borderRadius:20,fontWeight:600}}>{pos.label}</span>}
        <Badge type={r.paymentStatus}>{r.paymentStatus}</Badge>
        {showActions&&r.paymentProof&&(
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>store.confirmPayment(r.game.id,r.userId,r.guestId)} style={{...STYLES.btn.primary,padding:"6px 12px",fontSize:12,background:COLORS.success}}>Confirm</button>
            <button onClick={()=>store.rejectPayment(r.game.id,r.userId,r.guestId)}  style={{...STYLES.btn.danger, padding:"6px 12px",fontSize:12}}>Reject</button>
          </div>
        )}
      </div>
    );
  };
  const Section=({title,items,showActions,bg})=>(
    <div style={{...STYLES.card,marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><h3 style={{margin:0,fontSize:15,fontWeight:700,color:COLORS.text}}>{title}</h3><span style={{background:bg,padding:"2px 10px",borderRadius:20,fontSize:13,fontWeight:600}}>{items.length}</span></div>
      {items.length===0&&<p style={{color:COLORS.textMuted,fontSize:14,margin:0}}>None.</p>}
      {items.map((r,i)=><Row key={`${r.game.id}-${r.userId||r.guestId}-${i}`} r={r} showActions={showActions}/>)}
    </div>
  );
  return(
    <div>
      <h2 style={{margin:"0 0 20px",fontSize:22,fontWeight:700,color:COLORS.text}}>Payments</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20}}>
        {[{label:"Pending review",val:pending.length,bg:COLORS.warningLight},{label:"Confirmed paid",val:paid.length,bg:COLORS.successLight},{label:"Unpaid slots",val:unpaid.length,bg:COLORS.dangerLight},{label:"Total collected",val:`₱${total.toLocaleString()}`,bg:COLORS.surfaceAlt}].map(s=>(
          <div key={s.label} style={{background:s.bg,borderRadius:10,padding:"14px 16px"}}><div style={{fontSize:13,color:COLORS.textMuted}}>{s.label}</div><div style={{fontSize:24,fontWeight:700,color:COLORS.text}}>{s.val}</div></div>
        ))}
      </div>
      <Section title="Pending Review"           items={pending} showActions bg={COLORS.warningLight}/>
      <Section title="Confirmed Paid"           items={paid}    bg={COLORS.successLight}/>
      <Section title="Unpaid (confirmed spots)" items={unpaid}  bg={COLORS.dangerLight}/>
    </div>
  );
}

// ─── MEMBER PAGES ─────────────────────────────────────────────────────────────

function BrowseGames({games,currentUser,getReservationName,store}){
  const upcoming=[...games].filter(g=>new Date(g.date+"T"+g.time)>=today).sort((a,b)=>new Date(a.date)-new Date(b.date));
  return(<div><h2 style={{margin:"0 0 20px",fontSize:22,fontWeight:700,color:COLORS.text}}>Upcoming Games</h2>{upcoming.length===0&&<p style={{color:COLORS.textMuted}}>No games scheduled yet.</p>}{upcoming.map(g=><GameCard key={g.id} game={g} currentUser={currentUser} getReservationName={getReservationName} onReserve={store.reserve} onCancel={store.cancelReservation} onUploadProof={store.uploadProof}/>)}</div>);
}

function MyGames({games,currentUser,getReservationName,store}){
  const myGames=games.filter(g=>g.reservations.some(r=>r.userId===currentUser.id));
  const upcoming=myGames.filter(g=>new Date(g.date+"T"+g.time)>=today);
  const past    =myGames.filter(g=>new Date(g.date+"T"+g.time)<today);
  return(
    <div>
      <h2 style={{margin:"0 0 20px",fontSize:22,fontWeight:700,color:COLORS.text}}>My Reservations</h2>
      <p style={{margin:"0 0 14px",fontWeight:600,color:COLORS.textMuted,fontSize:13}}>Upcoming ({upcoming.length})</p>
      {upcoming.length===0&&<p style={{color:COLORS.textMuted,fontSize:14}}>No upcoming reservations.</p>}
      {upcoming.map(g=><GameCard key={g.id} game={g} currentUser={currentUser} getReservationName={getReservationName} onReserve={store.reserve} onCancel={store.cancelReservation} onUploadProof={store.uploadProof}/>)}
      {past.length>0&&<><p style={{margin:"20px 0 14px",fontWeight:600,color:COLORS.textMuted,fontSize:13}}>Past ({past.length})</p>{past.map(g=><GameCard key={g.id} game={g} currentUser={currentUser} getReservationName={getReservationName} onReserve={store.reserve} onCancel={store.cancelReservation} onUploadProof={store.uploadProof}/>)}</>}
    </div>
  );
}

function MyPayments({games,currentUser,store}){
  const myRes=games.flatMap(g=>g.reservations.filter(r=>r.userId===currentUser.id).map(r=>({...r,game:g})));
  return(
    <div>
      <h2 style={{margin:"0 0 20px",fontSize:22,fontWeight:700,color:COLORS.text}}>My Payments</h2>
      {myRes.length===0&&<p style={{color:COLORS.textMuted}}>No payment history.</p>}
      <div style={STYLES.card}>
        {myRes.map((r,i)=>{
          const pos=r.game.positions?.find(p=>p.key===r.position);
          return(
            <div key={`${r.game.id}-${i}`} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<myRes.length-1?`1px solid ${COLORS.border}`:"none",flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:150}}>
                <div style={{fontWeight:600,fontSize:15,color:COLORS.text}}>{r.game.title}</div>
                <div style={{fontSize:13,color:COLORS.textMuted}}>📅 {r.game.date}·₱{r.game.fee}{r.paymentProof?`·${r.paymentProof}`:""}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                {pos&&<span style={{fontSize:12,background:pos.color+"22",color:pos.color,padding:"3px 10px",borderRadius:20,fontWeight:600}}>{pos.label}</span>}
                <Badge type={r.status}>{r.status==="waitlist"?`Waitlist #${r.waitlistPos}`:r.status}</Badge>
                <Badge type={r.paymentStatus}>{r.paymentStatus}</Badge>
              </div>
              {r.paymentStatus==="unpaid"&&r.status==="confirmed"&&<UploadProof gameId={r.game.id} userId={currentUser.id} onUpload={store.uploadProof}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── LAYOUT ───────────────────────────────────────────────────────────────────

function Layout({currentUser,logout,children,tab,setTab}){
  const tabs=currentUser?.role==="admin"
    ?[{key:"schedule",label:"📅 Schedule"},{key:"payments",label:"💳 Payments"},{key:"members",label:"👥 Members"},{key:"teams",label:"🏐 Teams"}]
    :[{key:"browse",label:"🏐 Games"},{key:"myGames",label:"📋 My Reservations"},{key:"myPayments",label:"💳 Payments"},{key:"profile",label:"👤 Profile"}];
  return(
    <div style={{minHeight:"100vh",background:COLORS.bg,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{background:COLORS.primary,color:"#fff",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:60}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>🏐</span>
          <span style={{fontWeight:800,fontSize:18,letterSpacing:-0.3}}>Chiquitos Volleyball</span>
          {currentUser?.role==="admin"&&<Badge type="admin">Admin</Badge>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Avatar initials={currentUser?.avatar} size={32} color="rgba(255,255,255,0.2)"/>
          <span style={{fontSize:14,fontWeight:500}}>{currentUser?.name}</span>
          <button onClick={logout} style={{...STYLES.btn.ghost,color:"rgba(255,255,255,0.7)",fontSize:13}}>Sign out</button>
        </div>
      </div>
      <div style={{display:"flex",borderBottom:`1px solid ${COLORS.border}`,background:COLORS.surface,overflowX:"auto"}}>
        {tabs.map(t=><button key={t.key} onClick={()=>setTab(t.key)} style={{padding:"14px 20px",background:"transparent",border:"none",borderBottom:tab===t.key?`2.5px solid ${COLORS.primary}`:"2.5px solid transparent",color:tab===t.key?COLORS.primary:COLORS.textMuted,fontWeight:600,cursor:"pointer",fontSize:14,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>{t.label}</button>)}
      </div>
      <div style={{maxWidth:900,margin:"0 auto",padding:"24px 16px"}}>{children}</div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App(){
  const store=useStore();
  const[tab,setTab]=useState(null);

  useEffect(()=>{
    const link=document.createElement("link");
    link.href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap";
    link.rel="stylesheet";
    document.head.appendChild(link);
  },[]);

  useEffect(()=>{
    if(store.currentUser)setTab(store.currentUser.role==="admin"?"schedule":"browse");
  },[store.currentUser]);

  if(store.loading) return(
    <div style={{minHeight:"100vh",background:COLORS.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>🏐</div>
        <p style={{color:COLORS.textMuted,fontSize:16,fontWeight:500}}>Loading Chiquitos Volleyball…</p>
      </div>
    </div>
  );

  if(!store.currentUser)return(
    <>
      <LoginPage login={store.login} games={store.games} guestJoin={store.guestJoin}/>
      <Toast toast={store.toast}/>
    </>
  );

  return(
    <>
      <Layout currentUser={store.currentUser} logout={store.logout} tab={tab} setTab={setTab}>
        {store.currentUser.role==="admin"?(
          <>
            {tab==="schedule"&&<ScheduleManager games={store.games} users={store.users} getReservationName={store.getReservationName} currentUser={store.currentUser} store={store}/>}
            {tab==="payments"&&<PaymentsManager games={store.games} getReservationName={store.getReservationName} store={store}/>}
            {tab==="members" &&<MembersManager  users={store.users} guests={store.guests} currentUser={store.currentUser} store={store}/>}
            {tab==="teams"   &&<TeamsManager    games={store.games} users={store.users} getReservationName={store.getReservationName} store={store}/>}
          </>
        ):(
          <>
            {tab==="browse"    &&<BrowseGames games={store.games} currentUser={store.currentUser} getReservationName={store.getReservationName} store={store}/>}
            {tab==="myGames"   &&<MyGames     games={store.games} currentUser={store.currentUser} getReservationName={store.getReservationName} store={store}/>}
            {tab==="myPayments"&&<MyPayments  games={store.games} currentUser={store.currentUser} store={store}/>}
            {tab==="profile"   &&<ProfilePage currentUser={store.currentUser} store={store}/>}
          </>
        )}
      </Layout>
      <Toast toast={store.toast}/>
    </>
  );
}