import { useState, useEffect, useCallback } from "react";

const COLORS = {
  primary: "#1a472a", primaryLight: "#2d6a4f", accent: "#f4a261",
  bg: "#f8f9f4", surface: "#ffffff", surfaceAlt: "#f0f4ed",
  border: "#d8e4d0", text: "#1a2e1a", textMuted: "#5a7a5a",
  danger: "#c0392b", dangerLight: "#fdecea",
  success: "#1e8449", successLight: "#eafaf1",
  warning: "#d68910", warningLight: "#fef9e7",
  info: "#1a5276", infoLight: "#eaf2ff",
};

const DEFAULT_POSITIONS = [
  { key: "setter", label: "Setter", slots: 4, color: "#6c3483" },
  { key: "opp", label: "Opposite", slots: 4, color: "#1a5276" },
  { key: "oh", label: "Outside Hitter", slots: 8, color: "#1e8449" },
  { key: "mb", label: "Middle Blocker", slots: 8, color: "#d68910" },
  { key: "libero", label: "Libero", slots: 99, color: "#c0392b", optional: true },
];

const STYLES = {
  btn: {
    primary: { background: COLORS.primary, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" },
    secondary: { background: "transparent", color: COLORS.primary, border: `1.5px solid ${COLORS.primary}`, borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" },
    danger: { background: COLORS.danger, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" },
    ghost: { background: "transparent", color: COLORS.textMuted, border: "none", padding: "8px 12px", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" },
  },
  input: { width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: COLORS.surface, color: COLORS.text, boxSizing: "border-box", outline: "none" },
  card: { background: COLORS.surface, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "20px" },
  badge: {
    confirmed: { background: COLORS.successLight, color: COLORS.success, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
    pending: { background: COLORS.warningLight, color: COLORS.warning, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
    waitlist: { background: COLORS.infoLight, color: COLORS.info, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
    rejected: { background: COLORS.dangerLight, color: COLORS.danger, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
    paid: { background: COLORS.successLight, color: COLORS.success, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
    unpaid: { background: COLORS.dangerLight, color: COLORS.danger, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
    admin: { background: "#e8f0fe", color: COLORS.info, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
    member: { background: COLORS.surfaceAlt, color: COLORS.textMuted, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  },
};

const today = new Date();
const fmt = (d) => d.toISOString().split("T")[0];
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

const SEED_USERS = [
  { id: 1, name: "Admin One", email: "admin@chiquitos.ph", password: "admin123", role: "admin", joined: "2024-01-01", avatar: "A1", positions: [] },
  { id: 2, name: "Ana Reyes", email: "ana@email.com", password: "pass123", role: "member", joined: "2024-01-10", avatar: "AR", positions: [{ key: "setter", level: 3 }, { key: "oh", level: 2 }] },
  { id: 3, name: "Ben Cruz", email: "ben@email.com", password: "pass123", role: "member", joined: "2024-02-05", avatar: "BC", positions: [{ key: "mb", level: 2 }] },
  { id: 4, name: "Carla Mendoza", email: "carla@email.com", password: "pass123", role: "member", joined: "2024-02-20", avatar: "CM", positions: [{ key: "oh", level: 1 }, { key: "libero", level: 2 }] },
  { id: 5, name: "Diego Santos", email: "diego@email.com", password: "pass123", role: "member", joined: "2024-03-01", avatar: "DS", positions: [{ key: "opp", level: 3 }, { key: "mb", level: 1 }] },
];

const SEED_GAMES = [
  { id: 1, title: "Saturday Spike Session", date: fmt(addDays(today, 3)), time: "08:00", venue: "Rizal Memorial Coliseum, Manila", fee: 150, allowMultiple: false, notes: "Bring water and kneepads.", positions: DEFAULT_POSITIONS.map(p => ({ ...p })), reservations: [
    { userId: 2, position: "setter", status: "confirmed", paymentStatus: "paid", paymentProof: "gcash_ref_001", reservedAt: "2024-06-01T08:00:00Z", waitlistPos: null },
    { userId: 3, position: "oh", status: "confirmed", paymentStatus: "pending", paymentProof: "gcash_ref_002", reservedAt: "2024-06-01T09:00:00Z", waitlistPos: null },
    { userId: 4, position: "mb", status: "waitlist", paymentStatus: "unpaid", paymentProof: null, reservedAt: "2024-06-01T10:00:00Z", waitlistPos: 1 },
  ]},
  { id: 2, title: "Wednesday Warmup", date: fmt(addDays(today, 7)), time: "18:00", venue: "Meralco Gym, Pasig", fee: 100, allowMultiple: true, notes: "Beginners welcome.", positions: DEFAULT_POSITIONS.map(p => ({ ...p })), reservations: [] },
  { id: 3, title: "Sunday Scrimmage", date: fmt(addDays(today, 10)), time: "09:00", venue: "Philsports Arena, Pasig", fee: 200, allowMultiple: false, notes: "Full match format.", positions: DEFAULT_POSITIONS.map(p => ({ ...p })), reservations: [
    { userId: 5, position: "opp", status: "confirmed", paymentStatus: "paid", paymentProof: "gcash_ref_003", reservedAt: "2024-06-02T07:00:00Z", waitlistPos: null },
  ]},
];

function useStore() {
  const [users, setUsers] = useState(SEED_USERS);
  const [games, setGames] = useState(SEED_GAMES);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("login");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return false;
    setCurrentUser(user);
    setView(user.role === "admin" ? "admin" : "member");
    return true;
  };

  const logout = () => { setCurrentUser(null); setView("login"); };

  const addGame = (game) => {
    setGames(prev => [{ ...game, id: Date.now(), reservations: [] }, ...prev]);
    showToast("Game scheduled!");
  };

  const updateGame = (id, updates) => {
    setGames(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    showToast("Game updated.");
  };

  const deleteGame = (id) => {
    setGames(prev => prev.filter(g => g.id !== id));
    showToast("Game deleted.");
  };

  const reserve = (gameId, userId, position) => {
    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g;
      const pos = g.positions.find(p => p.key === position);
      const filledInPos = g.reservations.filter(r => r.position === position && r.status === "confirmed").length;
      const isLibero = position === "libero";
      const positionFull = !isLibero && filledInPos >= pos.slots;
      const waitlistPos = positionFull ? g.reservations.filter(r => r.position === position && r.status === "waitlist").length + 1 : null;
      const newRes = { userId, position, status: positionFull ? "waitlist" : "confirmed", paymentStatus: "unpaid", paymentProof: null, reservedAt: new Date().toISOString(), waitlistPos };
      return { ...g, reservations: [...g.reservations, newRes] };
    }));
    showToast("Spot reserved! Upload your payment proof.");
  };

  const cancelReservation = (gameId, userId) => {
    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g;
      const cancelled = g.reservations.find(r => r.userId === userId);
      const updated = g.reservations.filter(r => r.userId !== userId);
      if (cancelled?.status === "confirmed") {
        let wPos = 1;
        const promoted = updated.map(r => {
          if (r.position === cancelled.position && r.status === "waitlist") {
            const filledNow = updated.filter(x => x.position === cancelled.position && x.status === "confirmed").length;
            const pos = g.positions.find(p => p.key === cancelled.position);
            if (filledNow < pos.slots) return { ...r, status: "confirmed", waitlistPos: null };
            return { ...r, waitlistPos: wPos++ };
          }
          return r;
        });
        return { ...g, reservations: promoted };
      }
      return { ...g, reservations: updated };
    }));
    showToast("Reservation cancelled.");
  };

  const uploadProof = (gameId, userId, filename) => {
    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g;
      return { ...g, reservations: g.reservations.map(r => r.userId === userId ? { ...r, paymentProof: filename, paymentStatus: "pending" } : r) };
    }));
    showToast("Payment proof submitted. Waiting for admin confirmation.");
  };

  const confirmPayment = (gameId, userId) => {
    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g;
      return { ...g, reservations: g.reservations.map(r => r.userId === userId ? { ...r, paymentStatus: "paid" } : r) };
    }));
    showToast("Payment confirmed!");
  };

  const rejectPayment = (gameId, userId) => {
    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g;
      return { ...g, reservations: g.reservations.map(r => r.userId === userId ? { ...r, paymentStatus: "unpaid", paymentProof: null } : r) };
    }));
    showToast("Payment rejected.", "warning");
  };

  const addMember = (member) => {
    const exists = users.find(u => u.email === member.email);
    if (exists) { showToast("Email already exists.", "error"); return false; }
    setUsers(prev => [...prev, { ...member, id: Date.now(), role: "member", joined: fmt(today), avatar: member.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(), positions: [] }]);
    showToast("Member added!");
    return true;
  };

  const updateProfile = (id, updates) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser?.id === id) setCurrentUser(prev => ({ ...prev, ...updates }));
    showToast("Profile updated!");
  };

  const removeMember = (id) => { setUsers(prev => prev.filter(u => u.id !== id)); showToast("Member removed."); };
  const toggleRole = (id) => { setUsers(prev => prev.map(u => u.id === id ? { ...u, role: u.role === "admin" ? "member" : "admin" } : u)); showToast("Role updated."); };

  const saveTeams = (gameId, teams) => {
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, teams } : g));
    showToast("Teams saved!");
  };

  const saveMatches = (gameId, matches, settings) => {
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, matches, matchSettings: settings } : g));
    showToast("Match schedule saved!");
  };

  const updateMatchScore = (gameId, matchId, sets) => {
    setGames(prev => prev.map(g => {
      if (g.id !== gameId) return g;
      const matches = g.matches.map(m => {
        if (m.id !== matchId) return m;
        const setsToWin = g.matchSettings?.setsToWin || 2;
        const winsA = sets.filter(s => s.a > s.b).length;
        const winsB = sets.filter(s => s.b > s.a).length;
        const winner = winsA >= setsToWin ? m.teamA : winsB >= setsToWin ? m.teamB : null;
        return { ...m, sets, winner, played: !!winner };
      });
      return { ...g, matches };
    }));
    showToast("Score updated!");
  };

  return { users, games, currentUser, view, setView, toast, login, logout, addGame, updateGame, deleteGame, reserve, cancelReservation, uploadProof, confirmPayment, rejectPayment, addMember, removeMember, toggleRole, updateProfile, saveTeams, saveMatches, updateMatchScore, showToast };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function Toast({ toast }) {
  if (!toast) return null;
  const colors = toast.type === "error" ? { bg: COLORS.dangerLight, border: COLORS.danger, text: COLORS.danger } : toast.type === "warning" ? { bg: COLORS.warningLight, border: COLORS.warning, text: COLORS.warning } : { bg: COLORS.successLight, border: COLORS.success, text: COLORS.success };
  return <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text, padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 500, maxWidth: 320, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontFamily: "'DM Sans', sans-serif" }}>{toast.msg}</div>;
}

function Avatar({ initials, size = 36, color = COLORS.primary }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>{initials}</div>;
}

function Badge({ type, children }) {
  return <span style={STYLES.badge[type] || STYLES.badge.member}>{children}</span>;
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: COLORS.surface, borderRadius: 14, width: "100%", maxWidth: wide ? 680 : 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.text }}>{title}</h3>
          <button onClick={onClose} style={{ ...STYLES.btn.ghost, fontSize: 20, padding: "4px 10px" }}>×</button>
        </div>
        <div style={{ padding: "16px 24px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── POSITION BREAKDOWN ──────────────────────────────────────────────────────

function PositionBreakdown({ game, compact = false }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: compact ? "repeat(5, 1fr)" : "repeat(auto-fit, minmax(120px, 1fr))", gap: compact ? 6 : 10, marginTop: compact ? 10 : 14 }}>
      {game.positions.map(pos => {
        const confirmed = game.reservations.filter(r => r.position === pos.key && r.status === "confirmed").length;
        const waitlisted = game.reservations.filter(r => r.position === pos.key && r.status === "waitlist").length;
        const isLibero = pos.key === "libero";
        const isFull = !isLibero && confirmed >= pos.slots;
        const pct = isLibero ? 0 : Math.min(100, Math.round((confirmed / pos.slots) * 100));

        return (
          <div key={pos.key} style={{ background: COLORS.surfaceAlt, borderRadius: 10, padding: compact ? "8px 10px" : "12px 14px", border: `1px solid ${isFull ? pos.color + "55" : COLORS.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: compact ? 11 : 12, fontWeight: 700, color: pos.color, textTransform: "uppercase", letterSpacing: 0.3 }}>{compact ? pos.label.split(" ")[0] : pos.label}</span>
              {isFull && <span style={{ fontSize: 10, background: pos.color + "22", color: pos.color, padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>FULL</span>}
            </div>
            <div style={{ marginTop: 4, fontSize: compact ? 16 : 20, fontWeight: 800, color: COLORS.text }}>
              {confirmed}<span style={{ fontSize: compact ? 11 : 13, fontWeight: 400, color: COLORS.textMuted }}>/{isLibero ? "∞" : pos.slots}</span>
            </div>
            {!isLibero && (
              <div style={{ height: 4, borderRadius: 4, background: COLORS.border, marginTop: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 4, background: isFull ? pos.color : pos.color + "99", width: `${pct}%`, transition: "width 0.3s" }} />
              </div>
            )}
            {waitlisted > 0 && <div style={{ fontSize: 10, color: COLORS.info, marginTop: 4 }}>+{waitlisted} waitlist</div>}
          </div>
        );
      })}
    </div>
  );
}

// ─── RESERVE MODAL ────────────────────────────────────────────────────────────

function ReserveModal({ game, userId, onReserve, onClose }) {
  const [selectedPos, setSelectedPos] = useState(null);

  const getStatus = (pos) => {
    const confirmed = game.reservations.filter(r => r.position === pos.key && r.status === "confirmed").length;
    const waitlisted = game.reservations.filter(r => r.position === pos.key && r.status === "waitlist").length;
    const isLibero = pos.key === "libero";
    const isFull = !isLibero && confirmed >= pos.slots;
    return { confirmed, waitlisted, isFull, spotsLeft: isLibero ? "∞" : Math.max(0, pos.slots - confirmed) };
  };

  const anyNonLiberoFull = game.positions.filter(p => p.key !== "libero").some(p => getStatus(p).isFull);

  return (
    <Modal title="Choose your position" onClose={onClose} wide>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: COLORS.textMuted }}>Select an available position to reserve your spot. You can waitlist for a specific position if it's full.</p>
      <div style={{ display: "grid", gap: 10 }}>
        {game.positions.map(pos => {
          const { confirmed, waitlisted, isFull, spotsLeft } = getStatus(pos);
          const isLibero = pos.key === "libero";
          const locked = isLibero && !anyNonLiberoFull;
          const isSelected = selectedPos === pos.key;

          return (
            <button key={pos.key} onClick={() => !locked && setSelectedPos(pos.key)} style={{ background: isSelected ? pos.color + "15" : locked ? COLORS.surfaceAlt : COLORS.surface, border: `${isSelected ? 2 : 1}px solid ${isSelected ? pos.color : locked ? COLORS.border : COLORS.border}`, borderRadius: 10, padding: "14px 16px", cursor: locked ? "not-allowed" : "pointer", textAlign: "left", opacity: locked ? 0.45 : 1, fontFamily: "'DM Sans', sans-serif" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: pos.color }}>{pos.label}</div>
                  {isLibero && <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{locked ? "Unlocks when any position is full" : "Optional role — no slot limit"}</div>}
                  {!isLibero && <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{confirmed}/{pos.slots} filled · {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left</div>}
                  {isLibero && !locked && <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{confirmed} signed up</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  {isFull && !isLibero && <span style={{ fontSize: 12, background: COLORS.warningLight, color: COLORS.warning, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>Join waitlist</span>}
                  {!isFull && !isLibero && <span style={{ fontSize: 12, background: COLORS.successLight, color: COLORS.success, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>Available</span>}
                  {waitlisted > 0 && <div style={{ fontSize: 11, color: COLORS.info, marginTop: 4 }}>+{waitlisted} waiting</div>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <button onClick={onClose} style={STYLES.btn.secondary}>Cancel</button>
        <button onClick={() => { if (selectedPos) { onReserve(game.id, userId, selectedPos); onClose(); } }} style={{ ...STYLES.btn.primary, opacity: selectedPos ? 1 : 0.4 }}>
          {selectedPos ? `Reserve as ${game.positions.find(p => p.key === selectedPos)?.label}` : "Select a position"}
        </button>
      </div>
    </Modal>
  );
}

// ─── GAME CARD ────────────────────────────────────────────────────────────────

function GameCard({ game, users, currentUser, onReserve, onCancel, onUploadProof, isAdmin, onConfirmPayment, onRejectPayment, onEdit, onDelete, onViewDetail }) {
  const [showReserve, setShowReserve] = useState(false);
  const myRes = game.reservations.find(r => r.userId === currentUser?.id);
  const confirmedCount = game.reservations.filter(r => r.status === "confirmed").length;
  const totalSlots = game.positions.filter(p => p.key !== "libero").reduce((s, p) => s + p.slots, 0);
  const gameDate = new Date(game.date + "T" + game.time);
  const isPast = gameDate < today;
  const myPos = game.positions.find(p => p.key === myRes?.position);

  return (
    <>
      <div style={{ ...STYLES.card, marginBottom: 16, opacity: isPast ? 0.65 : 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: COLORS.text }}>{game.title}</h3>
              {isPast && <Badge type="member">Past</Badge>}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: COLORS.textMuted }}>📅 {new Date(game.date).toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" })} · {game.time}</span>
              <span style={{ fontSize: 13, color: COLORS.textMuted }}>📍 {game.venue}</span>
              <span style={{ fontSize: 13, color: COLORS.textMuted }}>₱{game.fee}</span>
              <span style={{ fontSize: 13, color: COLORS.success, fontWeight: 600 }}>{confirmedCount}/{totalSlots} players</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {isAdmin ? (
              <>
                <button onClick={() => onViewDetail(game)} style={{ ...STYLES.btn.secondary, padding: "8px 14px", fontSize: 13 }}>View</button>
                <button onClick={() => onEdit(game)} style={{ ...STYLES.btn.secondary, padding: "8px 14px", fontSize: 13 }}>Edit</button>
                <button onClick={() => onDelete(game.id)} style={{ ...STYLES.btn.danger, padding: "8px 14px" }}>Delete</button>
              </>
            ) : (
              <>
                {!myRes && !isPast && <button onClick={() => setShowReserve(true)} style={{ ...STYLES.btn.primary, padding: "9px 18px", fontSize: 13 }}>Reserve Spot</button>}
                {myRes && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, background: myPos?.color + "22", color: myPos?.color, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{myPos?.label}</span>
                      <Badge type={myRes.status}>{myRes.status === "waitlist" ? `Waitlist #${myRes.waitlistPos}` : myRes.status}</Badge>
                      <Badge type={myRes.paymentStatus}>{myRes.paymentStatus}</Badge>
                    </div>
                    {myRes.paymentStatus === "unpaid" && myRes.status === "confirmed" && <UploadProof gameId={game.id} userId={currentUser.id} onUpload={onUploadProof} />}
                    {myRes.paymentStatus === "pending" && <span style={{ fontSize: 12, color: COLORS.warning }}>Waiting for admin to confirm payment</span>}
                    {!isPast && <button onClick={() => onCancel(game.id, currentUser.id)} style={{ ...STYLES.btn.ghost, fontSize: 12, color: COLORS.danger, padding: "2px 0" }}>Cancel reservation</button>}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <PositionBreakdown game={game} compact />

        {game.notes && <p style={{ margin: "12px 0 0", fontSize: 13, color: COLORS.textMuted, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>📌 {game.notes}</p>}
      </div>
      {showReserve && <ReserveModal game={game} userId={currentUser.id} onReserve={onReserve} onClose={() => setShowReserve(false)} />}
    </>
  );
}

function UploadProof({ gameId, userId, onUpload }) {
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  if (!show) return <button onClick={() => setShow(true)} style={{ ...STYLES.btn.secondary, padding: "7px 14px", fontSize: 13 }}>Upload GCash Proof</button>;
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <input style={{ ...STYLES.input, width: 160, padding: "7px 10px", fontSize: 13 }} placeholder="GCash ref #" value={name} onChange={e => setName(e.target.value)} />
      <button onClick={() => { if (name.trim()) { onUpload(gameId, userId, name.trim()); setShow(false); setName(""); } }} style={{ ...STYLES.btn.primary, padding: "7px 12px", fontSize: 13 }}>Submit</button>
    </div>
  );
}

// ─── GAME DETAIL MODAL (ADMIN) ────────────────────────────────────────────────

function AdminSignInModal({ game, users, onClose, onReserve, onCancel }) {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedPos, setSelectedPos] = useState(null);

  const alreadySigned = game.reservations.map(r => r.userId);
  const eligible = users.filter(u => u.role === "member" && !alreadySigned.includes(u.id));

  const selectedUser = users.find(u => u.id === selectedUserId);

  const getPosStatus = (pos) => {
    const confirmed = game.reservations.filter(r => r.position === pos.key && r.status === "confirmed").length;
    const waitlisted = game.reservations.filter(r => r.position === pos.key && r.status === "waitlist").length;
    const isLibero = pos.key === "libero";
    const isFull = !isLibero && confirmed >= pos.slots;
    return { confirmed, waitlisted, isFull, spotsLeft: isLibero ? "∞" : Math.max(0, pos.slots - confirmed) };
  };

  const anyNonLiberoFull = game.positions.filter(p => p.key !== "libero").some(p => getPosStatus(p).isFull);

  return (
    <Modal title="Sign In a Member" onClose={onClose} wide>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: COLORS.textMuted }}>Select a member and their position to sign them into this game on their behalf.</p>

      {/* Step 1: pick member */}
      <div style={{ marginBottom: 18 }}>
        <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 13, color: COLORS.text }}>1. Select Member</p>
        {eligible.length === 0 && <p style={{ fontSize: 13, color: COLORS.textMuted }}>All members are already signed in.</p>}
        <div style={{ display: "grid", gap: 6, maxHeight: 200, overflowY: "auto" }}>
          {eligible.map(u => {
            const isSelected = selectedUserId === u.id;
            return (
              <button key={u.id} onClick={() => { setSelectedUserId(u.id); setSelectedPos(null); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: isSelected ? COLORS.primary + "12" : COLORS.surfaceAlt, border: `1.5px solid ${isSelected ? COLORS.primary : COLORS.border}`, borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textAlign: "left" }}>
                <Avatar initials={u.avatar} size={30} color={isSelected ? COLORS.primary : COLORS.primaryLight} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.text }}>{u.name}</div>
                  {(u.positions || []).length > 0 && (
                    <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                      {u.positions.map(p => {
                        const pos = DEFAULT_POSITIONS.find(x => x.key === p.key);
                        return <span key={p.key} style={{ fontSize: 10, background: pos?.color + "18", color: pos?.color, padding: "1px 6px", borderRadius: 10, fontWeight: 600 }}>{pos?.label} · L{p.level}</span>;
                      })}
                    </div>
                  )}
                </div>
                {isSelected && <span style={{ fontSize: 18, color: COLORS.primary }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: pick position */}
      {selectedUserId && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 13, color: COLORS.text }}>2. Select Position</p>
          <div style={{ display: "grid", gap: 8 }}>
            {game.positions.map(pos => {
              const { confirmed, waitlisted, isFull, spotsLeft } = getPosStatus(pos);
              const isLibero = pos.key === "libero";
              const locked = isLibero && !anyNonLiberoFull;
              const isSelected = selectedPos === pos.key;
              return (
                <button key={pos.key} onClick={() => !locked && setSelectedPos(pos.key)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: isSelected ? pos.color + "15" : locked ? COLORS.surfaceAlt : COLORS.surface, border: `${isSelected ? 2 : 1}px solid ${isSelected ? pos.color : COLORS.border}`, borderRadius: 8, cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.45 : 1, fontFamily: "'DM Sans', sans-serif" }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: pos.color }}>{pos.label}</span>
                    {!isLibero && <span style={{ fontSize: 12, color: COLORS.textMuted, marginLeft: 8 }}>{confirmed}/{pos.slots} filled</span>}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {waitlisted > 0 && <span style={{ fontSize: 11, color: COLORS.info }}>+{waitlisted} waiting</span>}
                    {isFull && !isLibero && <span style={{ fontSize: 11, background: COLORS.warningLight, color: COLORS.warning, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>Waitlist</span>}
                    {!isFull && !isLibero && <span style={{ fontSize: 11, background: COLORS.successLight, color: COLORS.success, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{spotsLeft} left</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={STYLES.btn.secondary}>Cancel</button>
        <button
          onClick={() => { if (selectedUserId && selectedPos) { onReserve(game.id, selectedUserId, selectedPos); onClose(); } }}
          style={{ ...STYLES.btn.primary, opacity: selectedUserId && selectedPos ? 1 : 0.4 }}>
          {selectedUserId && selectedPos ? `Sign in ${selectedUser?.name} as ${game.positions.find(p => p.key === selectedPos)?.label}` : "Select member and position"}
        </button>
      </div>
    </Modal>
  );
}

function GameDetailModal({ game, users, onClose, onConfirmPayment, onRejectPayment, onReserve, onCancel }) {
  const [showSignIn, setShowSignIn] = useState(false);
  const getUser = (id) => users.find(u => u.id === id);

  return (
    <>
      <Modal title={game.title} onClose={onClose} wide>
        <div style={{ background: COLORS.surfaceAlt, borderRadius: 8, padding: "12px 14px", fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>
          📅 {game.date} · {game.time} &nbsp;|&nbsp; 📍 {game.venue} &nbsp;|&nbsp; ₱{game.fee}
        </div>

        <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 14, color: COLORS.text }}>Position Breakdown</p>
        <PositionBreakdown game={game} />

        <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: COLORS.text }}>Reservations ({game.reservations.length})</p>
          <button onClick={() => setShowSignIn(true)} style={{ ...STYLES.btn.primary, padding: "8px 14px", fontSize: 13 }}>+ Sign In a Member</button>
        </div>

        {game.reservations.length === 0 && <p style={{ color: COLORS.textMuted, fontSize: 13 }}>No reservations yet.</p>}
        {game.reservations.map(r => {
          const u = getUser(r.userId);
          const pos = game.positions.find(p => p.key === r.position);
          return (
            <div key={r.userId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${COLORS.border}`, flexWrap: "wrap" }}>
              <Avatar initials={u?.avatar} size={32} />
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ fontWeight: 500, fontSize: 14, color: COLORS.text }}>{u?.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{r.paymentProof ? `Ref: ${r.paymentProof}` : "No proof uploaded"}</div>
              </div>
              <span style={{ fontSize: 12, background: pos?.color + "22", color: pos?.color, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{pos?.label}</span>
              <Badge type={r.status}>{r.status === "waitlist" ? `Waitlist #${r.waitlistPos}` : r.status}</Badge>
              <Badge type={r.paymentStatus}>{r.paymentStatus}</Badge>
              <div style={{ display: "flex", gap: 6 }}>
                {r.paymentProof && r.paymentStatus === "pending" && (
                  <>
                    <button onClick={() => onConfirmPayment(game.id, r.userId)} style={{ ...STYLES.btn.primary, padding: "6px 12px", fontSize: 12, background: COLORS.success }}>Confirm</button>
                    <button onClick={() => onRejectPayment(game.id, r.userId)} style={{ ...STYLES.btn.danger, padding: "6px 12px", fontSize: 12 }}>Reject</button>
                  </>
                )}
                <button onClick={() => onCancel(game.id, r.userId)} style={{ ...STYLES.btn.ghost, fontSize: 12, color: COLORS.danger, padding: "4px 8px" }}>Remove</button>
              </div>
            </div>
          );
        })}
      </Modal>

      {showSignIn && (
        <AdminSignInModal
          game={game}
          users={users}
          onClose={() => setShowSignIn(false)}
          onReserve={onReserve}
          onCancel={onCancel}
        />
      )}
    </>
  );
}

// ─── GAME FORM ────────────────────────────────────────────────────────────────

function GameForm({ game, onSave, onClose }) {
  const [form, setForm] = useState({
    title: game?.title || "", date: game?.date || "", time: game?.time || "08:00",
    venue: game?.venue || "", fee: game?.fee || 150, allowMultiple: game?.allowMultiple ?? false,
    notes: game?.notes || "",
    positions: game?.positions || DEFAULT_POSITIONS.map(p => ({ ...p })),
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setSlots = (key, val) => setForm(p => ({ ...p, positions: p.positions.map(pos => pos.key === key ? { ...pos, slots: val } : pos) }));
  const valid = form.title && form.date && form.venue;

  return (
    <Modal title={game ? "Edit Game" : "Schedule New Game"} onClose={onClose} wide>
      <div style={{ display: "grid", gap: 14 }}>
        <div><label style={{ fontSize: 13, fontWeight: 500, color: COLORS.textMuted, display: "block", marginBottom: 5 }}>Title</label><input style={STYLES.input} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Saturday Spike Session" /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={{ fontSize: 13, fontWeight: 500, color: COLORS.textMuted, display: "block", marginBottom: 5 }}>Date</label><input style={STYLES.input} type="date" value={form.date} onChange={e => set("date", e.target.value)} /></div>
          <div><label style={{ fontSize: 13, fontWeight: 500, color: COLORS.textMuted, display: "block", marginBottom: 5 }}>Time</label><input style={STYLES.input} type="time" value={form.time} onChange={e => set("time", e.target.value)} /></div>
        </div>
        <div><label style={{ fontSize: 13, fontWeight: 500, color: COLORS.textMuted, display: "block", marginBottom: 5 }}>Venue</label><input style={STYLES.input} value={form.venue} onChange={e => set("venue", e.target.value)} placeholder="Venue name, city" /></div>
        <div><label style={{ fontSize: 13, fontWeight: 500, color: COLORS.textMuted, display: "block", marginBottom: 5 }}>Fee (₱)</label><input style={STYLES.input} type="number" min={0} value={form.fee} onChange={e => set("fee", +e.target.value)} /></div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.textMuted, display: "block", marginBottom: 10 }}>Position Slots</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
            {form.positions.filter(p => p.key !== "libero").map(pos => (
              <div key={pos.key} style={{ background: COLORS.surfaceAlt, borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: pos.color, marginBottom: 6 }}>{pos.label}</div>
                <input style={{ ...STYLES.input, padding: "7px 10px", fontSize: 14 }} type="number" min={1} value={pos.slots} onChange={e => setSlots(pos.key, +e.target.value)} />
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: COLORS.textMuted, margin: "8px 0 0" }}>Libero slots are unlimited and unlock automatically when any position fills up.</p>
        </div>

        <div><label style={{ fontSize: 13, fontWeight: 500, color: COLORS.textMuted, display: "block", marginBottom: 5 }}>Notes (optional)</label><textarea style={{ ...STYLES.input, resize: "vertical", minHeight: 70 }} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Reminders, rules, etc." /></div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: COLORS.text }}>
          <input type="checkbox" checked={form.allowMultiple} onChange={e => set("allowMultiple", e.target.checked)} />
          Allow members to book multiple games this week
        </label>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8 }}>
          <button onClick={onClose} style={STYLES.btn.secondary}>Cancel</button>
          <button onClick={() => valid && onSave(form)} style={{ ...STYLES.btn.primary, opacity: valid ? 1 : 0.5 }}>{game ? "Save changes" : "Schedule game"}</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────

function ProfilePage({ currentUser, store }) {
  const [editing, setEditing] = useState(false);
  const [positions, setPositions] = useState(currentUser.positions || []);

  const hasPos = (key) => positions.find(p => p.key === key);
  const togglePos = (key) => {
    if (hasPos(key)) setPositions(prev => prev.filter(p => p.key !== key));
    else setPositions(prev => [...prev, { key, level: 1 }]);
  };
  const setLevel = (key, level) => setPositions(prev => prev.map(p => p.key === key ? { ...p, level } : p));

  const handleSave = () => {
    store.updateProfile(currentUser.id, { positions });
    setEditing(false);
  };
  const handleCancel = () => { setPositions(currentUser.positions || []); setEditing(false); };

  const levelColors = { 1: { bg: "#f0f4ed", text: "#5a7a5a", label: "Level 1" }, 2: { bg: "#fef9e7", text: "#d68910", label: "Level 2" }, 3: { bg: "#eafaf1", text: "#1e8449", label: "Level 3" } };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: COLORS.text }}>My Profile</h2>
        {!editing && <button onClick={() => setEditing(true)} style={STYLES.btn.secondary}>Edit Profile</button>}
      </div>

      <div style={{ ...STYLES.card, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <Avatar initials={currentUser.avatar} size={56} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text }}>{currentUser.name}</div>
            <div style={{ fontSize: 14, color: COLORS.textMuted }}>{currentUser.email}</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>Member since {currentUser.joined}</div>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: COLORS.text }}>Positions & Proficiency</p>
            {!editing && (currentUser.positions || []).length === 0 && (
              <span style={{ fontSize: 13, color: COLORS.textMuted }}>Not set yet</span>
            )}
          </div>

          {!editing ? (
            <div>
              {(currentUser.positions || []).length === 0 && (
                <div style={{ background: COLORS.surfaceAlt, borderRadius: 8, padding: "14px 16px", fontSize: 14, color: COLORS.textMuted }}>
                  No positions set. Click <strong>Edit Profile</strong> to add your positions and proficiency levels.
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
                {(currentUser.positions || []).map(p => {
                  const pos = DEFAULT_POSITIONS.find(x => x.key === p.key);
                  const lc = levelColors[p.level];
                  return (
                    <div key={p.key} style={{ background: COLORS.surfaceAlt, borderRadius: 10, padding: "12px 14px", border: `1px solid ${COLORS.border}` }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: pos?.color }}>{pos?.label}</div>
                      <div style={{ marginTop: 8 }}>
                        <span style={{ background: lc.bg, color: lc.text, padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{lc.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: COLORS.textMuted }}>Select the positions you can play and assign your proficiency level for each.</p>
              <div style={{ display: "grid", gap: 10 }}>
                {DEFAULT_POSITIONS.map(pos => {
                  const selected = hasPos(pos.key);
                  return (
                    <div key={pos.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: selected ? pos.color + "0d" : COLORS.surfaceAlt, border: `1.5px solid ${selected ? pos.color + "55" : COLORS.border}`, borderRadius: 10 }}>
                      <input type="checkbox" checked={!!selected} onChange={() => togglePos(pos.key)} style={{ width: 16, height: 16, cursor: "pointer", accentColor: pos.color }} />
                      <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: selected ? pos.color : COLORS.textMuted }}>{pos.label}</span>
                      {selected && (
                        <div style={{ display: "flex", gap: 6 }}>
                          {[1, 2, 3].map(lvl => (
                            <button key={lvl} onClick={() => setLevel(pos.key, lvl)} style={{ width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${selected.level === lvl ? pos.color : COLORS.border}`, background: selected.level === lvl ? pos.color : COLORS.surface, color: selected.level === lvl ? "#fff" : COLORS.textMuted, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                              {lvl}
                            </button>
                          ))}
                        </div>
                      )}
                      {!selected && <span style={{ fontSize: 12, color: COLORS.border }}>Select to set level</span>}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
                <button onClick={handleCancel} style={STYLES.btn.secondary}>Cancel</button>
                <button onClick={handleSave} style={STYLES.btn.primary}>Save Profile</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LAYOUT ───────────────────────────────────────────────────────────────────

function Layout({ currentUser, logout, children, tab, setTab }) {
  const tabs = currentUser?.role === "admin"
    ? [{ key: "schedule", label: "📅 Schedule" }, { key: "payments", label: "💳 Payments" }, { key: "members", label: "👥 Members" }, { key: "teams", label: "🏐 Teams" }]
    : [{ key: "browse", label: "🏐 Games" }, { key: "myGames", label: "📋 My Reservations" }, { key: "myPayments", label: "💳 Payments" }, { key: "profile", label: "👤 Profile" }];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: COLORS.primary, color: "#fff", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏐</span>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.3 }}>Chiquitos Volleyball</span>
          {currentUser?.role === "admin" && <Badge type="admin">Admin</Badge>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar initials={currentUser?.avatar} size={32} color="rgba(255,255,255,0.2)" />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{currentUser?.name}</span>
          <button onClick={logout} style={{ ...STYLES.btn.ghost, color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Sign out</button>
        </div>
      </div>
      <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.surface, overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "14px 20px", background: "transparent", border: "none", borderBottom: tab === t.key ? `2.5px solid ${COLORS.primary}` : "2.5px solid transparent", color: tab === t.key ? COLORS.primary : COLORS.textMuted, fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>{children}</div>
    </div>
  );
}

// ─── PAGES ────────────────────────────────────────────────────────────────────

function LoginPage({ login }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setTimeout(() => { const ok = login(email, password); if (!ok) setError("Invalid email or password."); setLoading(false); }, 600);
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>🏐</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: COLORS.text }}>Chiquitos Volleyball</h1>
          <p style={{ color: COLORS.textMuted, margin: "6px 0 0", fontSize: 14 }}>Volleyball group management</p>
        </div>
        <div style={STYLES.card}>
          <p style={{ margin: "0 0 16px", fontWeight: 600, color: COLORS.text }}>Sign in to your account</p>
          {error && <div style={{ background: COLORS.dangerLight, color: COLORS.danger, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{error}</div>}
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 13, fontWeight: 500, color: COLORS.textMuted, display: "block", marginBottom: 6 }}>Email</label><input style={STYLES.input} type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="you@email.com" /></div>
          <div style={{ marginBottom: 20 }}><label style={{ fontSize: 13, fontWeight: 500, color: COLORS.textMuted, display: "block", marginBottom: 6 }}>Password</label><input style={STYLES.input} type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••••••" /></div>
          <button onClick={handleLogin} style={{ ...STYLES.btn.primary, width: "100%", padding: "12px", fontSize: 15 }} disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
          <div style={{ marginTop: 16, padding: "12px", background: COLORS.surfaceAlt, borderRadius: 8, fontSize: 12, color: COLORS.textMuted }}><strong>Demo:</strong> admin@chiquitos.ph / admin123 &nbsp;|&nbsp; ana@email.com / pass123</div>
        </div>
      </div>
    </div>
  );
}

function ScheduleManager({ games, users, currentUser, store }) {
  const [showForm, setShowForm] = useState(false);
  const [editGame, setEditGame] = useState(null);
  const [detailGame, setDetailGame] = useState(null);
  const sorted = [...games].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: COLORS.text }}>Game Schedule</h2>
        <button onClick={() => setShowForm(true)} style={STYLES.btn.primary}>+ New Game</button>
      </div>
      {sorted.length === 0 && <p style={{ color: COLORS.textMuted }}>No games scheduled yet.</p>}
      {sorted.map(g => <GameCard key={g.id} game={g} users={users} currentUser={currentUser} isAdmin onEdit={g => { setEditGame(g); setShowForm(true); }} onDelete={store.deleteGame} onViewDetail={setDetailGame} onConfirmPayment={store.confirmPayment} onRejectPayment={store.rejectPayment} />)}
      {showForm && <GameForm game={editGame} onSave={editGame ? (d) => { store.updateGame(editGame.id, d); setShowForm(false); setEditGame(null); } : (d) => { store.addGame(d); setShowForm(false); }} onClose={() => { setShowForm(false); setEditGame(null); }} />}
      {detailGame && <GameDetailModal game={detailGame} users={users} onClose={() => setDetailGame(null)} onConfirmPayment={store.confirmPayment} onRejectPayment={store.rejectPayment} onReserve={store.reserve} onCancel={store.cancelReservation} />}
    </div>
  );
}

function PaymentsManager({ games, users, store }) {
  const getUser = id => users.find(u => u.id === id);
  const pending = games.flatMap(g => g.reservations.filter(r => r.paymentProof && r.paymentStatus === "pending").map(r => ({ ...r, game: g })));
  const paid = games.flatMap(g => g.reservations.filter(r => r.paymentStatus === "paid").map(r => ({ ...r, game: g })));
  const unpaid = games.flatMap(g => g.reservations.filter(r => r.paymentStatus === "unpaid" && r.status === "confirmed").map(r => ({ ...r, game: g })));
  const totalCollected = paid.reduce((s, r) => s + r.game.fee, 0);

  const Row = ({ r, showActions }) => {
    const u = getUser(r.userId);
    const pos = r.game.positions?.find(p => p.key === r.position);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${COLORS.border}`, flexWrap: "wrap" }}>
        <Avatar initials={u?.avatar} size={32} />
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontWeight: 500, fontSize: 14, color: COLORS.text }}>{u?.name}</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>{r.game.title} · ₱{r.game.fee}{r.paymentProof ? ` · Ref: ${r.paymentProof}` : ""}</div>
        </div>
        {pos && <span style={{ fontSize: 12, background: pos.color + "22", color: pos.color, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{pos.label}</span>}
        <Badge type={r.paymentStatus}>{r.paymentStatus}</Badge>
        {showActions && r.paymentProof && (
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => store.confirmPayment(r.game.id, r.userId)} style={{ ...STYLES.btn.primary, padding: "6px 12px", fontSize: 12, background: COLORS.success }}>Confirm</button>
            <button onClick={() => store.rejectPayment(r.game.id, r.userId)} style={{ ...STYLES.btn.danger, padding: "6px 12px", fontSize: 12 }}>Reject</button>
          </div>
        )}
      </div>
    );
  };

  const Section = ({ title, items, showActions, bg }) => (
    <div style={{ ...STYLES.card, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.text }}>{title}</h3>
        <span style={{ background: bg, padding: "2px 10px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{items.length}</span>
      </div>
      {items.length === 0 && <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>None.</p>}
      {items.map((r, i) => <Row key={`${r.game.id}-${r.userId}-${i}`} r={r} showActions={showActions} />)}
    </div>
  );

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700, color: COLORS.text }}>Payments</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[{ label: "Pending review", val: pending.length, bg: COLORS.warningLight }, { label: "Confirmed paid", val: paid.length, bg: COLORS.successLight }, { label: "Unpaid slots", val: unpaid.length, bg: COLORS.dangerLight }, { label: "Total collected", val: `₱${totalCollected.toLocaleString()}`, bg: COLORS.surfaceAlt }].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.text }}>{s.val}</div>
          </div>
        ))}
      </div>
      <Section title="Pending Review" items={pending} showActions bg={COLORS.warningLight} />
      <Section title="Confirmed Paid" items={paid} bg={COLORS.successLight} />
      <Section title="Unpaid (confirmed spots)" items={unpaid} bg={COLORS.dangerLight} />
    </div>
  );
}

const REMARK_TAGS = [
  { key: "good_receiver",    label: "Good Receiver",            category: "skill",     color: "#1a5276" },
  { key: "effective_blocker",label: "Effective Blocker",        category: "skill",     color: "#1e8449" },
  { key: "effective_open",   label: "Effective Open Hitter",    category: "skill",     color: "#6c3483" },
  { key: "effective_opp",    label: "Effective Opposite",       category: "skill",     color: "#c0392b" },
  { key: "smart_server",     label: "Smart Server",             category: "skill",     color: "#d68910" },
  { key: "can_officiate",    label: "Can Officiate",            category: "skill",     color: "#0e6655" },
  { key: "team_player",      label: "Team Player",              category: "behavior",  color: "#1a472a" },
  { key: "team_leader",      label: "Team Leader",              category: "behavior",  color: "#922b21" },
  { key: "adapts_to_team",   label: "Adapts to Teammates",      category: "behavior",  color: "#7d6608" },
];

function RemarkModal({ user, onClose, onSave }) {
  const [tags, setTags] = useState(user.remarkTags || []);
  const [notes, setNotes] = useState(user.remarkNotes || "");

  const toggleTag = (key) => setTags(prev => prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key]);

  const skillTags = REMARK_TAGS.filter(t => t.category === "skill");
  const behaviorTags = REMARK_TAGS.filter(t => t.category === "behavior");

  return (
    <Modal title={`Remarks — ${user.name}`} onClose={onClose} wide>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "12px 14px", background: COLORS.surfaceAlt, borderRadius: 10 }}>
        <Avatar initials={user.avatar} size={44} color={user.role === "admin" ? COLORS.primary : COLORS.primaryLight} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.text }}>{user.name}</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted }}>{user.email} · Member since {user.joined}</div>
          {(user.positions || []).length > 0 && (
            <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
              {user.positions.map(p => {
                const pos = DEFAULT_POSITIONS.find(x => x.key === p.key);
                return <span key={p.key} style={{ fontSize: 11, background: pos?.color + "18", color: pos?.color, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{pos?.label} · L{p.level}</span>;
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 13, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>⚡ Skills</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {skillTags.map(t => {
            const active = tags.includes(t.key);
            return (
              <button key={t.key} onClick={() => toggleTag(t.key)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${active ? t.color : COLORS.border}`, background: active ? t.color : COLORS.surface, color: active ? "#fff" : COLORS.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}>
                {active ? "✓ " : ""}{t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 13, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>🤝 Behavior</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {behaviorTags.map(t => {
            const active = tags.includes(t.key);
            return (
              <button key={t.key} onClick={() => toggleTag(t.key)} style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${active ? t.color : COLORS.border}`, background: active ? t.color : COLORS.surface, color: active ? "#fff" : COLORS.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}>
                {active ? "✓ " : ""}{t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 13, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>📝 Notes</p>
        <textarea style={{ ...STYLES.input, resize: "vertical", minHeight: 90 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional observations, context, or anything the admin should know about this player..." />
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={STYLES.btn.secondary}>Cancel</button>
        <button onClick={() => { onSave(user.id, tags, notes); onClose(); }} style={STYLES.btn.primary}>Save Remarks</button>
      </div>
    </Modal>
  );
}

function MembersManager({ users, currentUser, store }) {
  const [showForm, setShowForm] = useState(false);
  const [remarkUser, setRemarkUser] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: COLORS.text }}>Members ({users.length})</h2>
        <button onClick={() => setShowForm(true)} style={STYLES.btn.primary}>+ Add Member</button>
      </div>

      <input style={{ ...STYLES.input, marginBottom: 14 }} placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />

      <div style={STYLES.card}>
        {filtered.map((u, i) => {
          const activeTags = (u.remarkTags || []).map(k => REMARK_TAGS.find(t => t.key === k)).filter(Boolean);
          const hasRemarks = activeTags.length > 0 || u.remarkNotes;
          return (
            <div key={u.id} style={{ padding: "14px 0", borderBottom: i < filtered.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <Avatar initials={u.avatar} size={40} color={u.role === "admin" ? COLORS.primary : COLORS.primaryLight} />
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: COLORS.text }}>{u.name}</div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted }}>{u.email}</div>
                  {(u.positions || []).length > 0 && (
                    <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
                      {u.positions.map(p => {
                        const pos = DEFAULT_POSITIONS.find(x => x.key === p.key);
                        return <span key={p.key} style={{ fontSize: 11, background: pos?.color + "18", color: pos?.color, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{pos?.label} · L{p.level}</span>;
                      })}
                    </div>
                  )}
                </div>
                <Badge type={u.role}>{u.role}</Badge>
                <span style={{ fontSize: 12, color: COLORS.textMuted }}>Since {u.joined}</span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => setRemarkUser(u)} style={{ ...STYLES.btn.secondary, padding: "6px 12px", fontSize: 12 }}>
                    {hasRemarks ? "✏️ Edit Remarks" : "📝 Add Remarks"}
                  </button>
                  {u.id !== currentUser.id && (
                    <>
                      <button onClick={() => store.toggleRole(u.id)} style={{ ...STYLES.btn.secondary, padding: "6px 12px", fontSize: 12 }}>{u.role === "admin" ? "Demote" : "Make Admin"}</button>
                      <button onClick={() => store.removeMember(u.id)} style={{ ...STYLES.btn.danger, padding: "6px 12px" }}>Remove</button>
                    </>
                  )}
                </div>
              </div>

              {/* Remarks preview */}
              {hasRemarks && (
                <div style={{ marginTop: 10, marginLeft: 52, padding: "10px 14px", background: COLORS.surfaceAlt, borderRadius: 8, borderLeft: `3px solid ${COLORS.primary}` }}>
                  {activeTags.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: u.remarkNotes ? 8 : 0 }}>
                      {activeTags.map(t => (
                        <span key={t.key} style={{ fontSize: 11, background: t.color + "18", color: t.color, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{t.label}</span>
                      ))}
                    </div>
                  )}
                  {u.remarkNotes && <p style={{ margin: 0, fontSize: 12, color: COLORS.textMuted, fontStyle: "italic" }}>"{u.remarkNotes}"</p>}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p style={{ color: COLORS.textMuted, fontSize: 14, padding: "12px 0" }}>No members found.</p>}
      </div>

      {showForm && (
        <Modal title="Add New Member" onClose={() => setShowForm(false)}>
          <div style={{ display: "grid", gap: 14 }}>
            <div><label style={{ fontSize: 13, fontWeight: 500, color: COLORS.textMuted, display: "block", marginBottom: 5 }}>Full name</label><input style={STYLES.input} value={form.name} onChange={e => set("name", e.target.value)} /></div>
            <div><label style={{ fontSize: 13, fontWeight: 500, color: COLORS.textMuted, display: "block", marginBottom: 5 }}>Email</label><input style={STYLES.input} type="email" value={form.email} onChange={e => set("email", e.target.value)} /></div>
            <div><label style={{ fontSize: 13, fontWeight: 500, color: COLORS.textMuted, display: "block", marginBottom: 5 }}>Password</label><input style={STYLES.input} type="password" value={form.password} onChange={e => set("password", e.target.value)} /></div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowForm(false)} style={STYLES.btn.secondary}>Cancel</button>
              <button onClick={() => { if (form.name && form.email && form.password) { const ok = store.addMember(form); if (ok) { setShowForm(false); setForm({ name: "", email: "", password: "" }); } } }} style={STYLES.btn.primary}>Add Member</button>
            </div>
          </div>
        </Modal>
      )}

      {remarkUser && (
        <RemarkModal
          user={remarkUser}
          onClose={() => setRemarkUser(null)}
          onSave={(id, tags, notes) => store.updateProfile(id, { remarkTags: tags, remarkNotes: notes })}
        />
      )}
    </div>
  );
}

function BrowseGames({ games, users, currentUser, store }) {
  const upcoming = [...games].filter(g => new Date(g.date + "T" + g.time) >= today).sort((a, b) => new Date(a.date) - new Date(b.date));
  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700, color: COLORS.text }}>Upcoming Games</h2>
      {upcoming.length === 0 && <p style={{ color: COLORS.textMuted }}>No games scheduled yet.</p>}
      {upcoming.map(g => <GameCard key={g.id} game={g} users={users} currentUser={currentUser} onReserve={store.reserve} onCancel={store.cancelReservation} onUploadProof={store.uploadProof} />)}
    </div>
  );
}

function MyGames({ games, users, currentUser, store }) {
  const myGames = games.filter(g => g.reservations.some(r => r.userId === currentUser.id));
  const upcoming = myGames.filter(g => new Date(g.date + "T" + g.time) >= today);
  const past = myGames.filter(g => new Date(g.date + "T" + g.time) < today);
  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700, color: COLORS.text }}>My Reservations</h2>
      <p style={{ margin: "0 0 14px", fontWeight: 600, color: COLORS.textMuted, fontSize: 13 }}>Upcoming ({upcoming.length})</p>
      {upcoming.length === 0 && <p style={{ color: COLORS.textMuted, fontSize: 14 }}>No upcoming reservations.</p>}
      {upcoming.map(g => <GameCard key={g.id} game={g} users={users} currentUser={currentUser} onReserve={store.reserve} onCancel={store.cancelReservation} onUploadProof={store.uploadProof} />)}
      {past.length > 0 && <><p style={{ margin: "20px 0 14px", fontWeight: 600, color: COLORS.textMuted, fontSize: 13 }}>Past ({past.length})</p>{past.map(g => <GameCard key={g.id} game={g} users={users} currentUser={currentUser} onReserve={store.reserve} onCancel={store.cancelReservation} onUploadProof={store.uploadProof} />)}</>}
    </div>
  );
}

function MyPayments({ games, currentUser, store }) {
  const myRes = games.flatMap(g => g.reservations.filter(r => r.userId === currentUser.id).map(r => ({ ...r, game: g })));
  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700, color: COLORS.text }}>My Payments</h2>
      {myRes.length === 0 && <p style={{ color: COLORS.textMuted }}>No payment history.</p>}
      <div style={STYLES.card}>
        {myRes.map((r, i) => {
          const pos = r.game.positions?.find(p => p.key === r.position);
          return (
            <div key={`${r.game.id}-${i}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < myRes.length - 1 ? `1px solid ${COLORS.border}` : "none", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: COLORS.text }}>{r.game.title}</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted }}>📅 {r.game.date} · ₱{r.game.fee}{r.paymentProof ? ` · Ref: ${r.paymentProof}` : ""}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                {pos && <span style={{ fontSize: 12, background: pos.color + "22", color: pos.color, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{pos.label}</span>}
                <Badge type={r.status}>{r.status === "waitlist" ? `Waitlist #${r.waitlistPos}` : r.status}</Badge>
                <Badge type={r.paymentStatus}>{r.paymentStatus}</Badge>
              </div>
              {r.paymentStatus === "unpaid" && r.status === "confirmed" && <UploadProof gameId={r.game.id} userId={currentUser.id} onUpload={store.uploadProof} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TEAMS MANAGER ────────────────────────────────────────────────────────────

const TEAM_COLORS = ["#1a472a","#1a5276","#6c3483","#c0392b","#d68910","#0e6655"];
const TEAM_NAMES = ["Team A","Team B","Team C","Team D","Team E","Team F"];

function suggestTeams(confirmedPlayers, numTeams, users) {
  const teams = Array.from({ length: numTeams }, (_, i) => ({ id: i, name: TEAM_NAMES[i], color: TEAM_COLORS[i], members: [] }));
  const posOrder = ["setter","opp","oh","mb","libero"];
  const byPos = {};
  posOrder.forEach(p => { byPos[p] = []; });
  byPos["unassigned"] = [];

  confirmedPlayers.forEach(r => {
    const user = users.find(u => u.id === r.userId);
    const userPos = (user?.positions || []).find(p => p.key === r.position);
    const level = userPos?.level || 1;
    const entry = { userId: r.userId, position: r.position, level, name: user?.name || "Unknown", avatar: user?.avatar || "??" };
    if (byPos[r.position]) byPos[r.position].push(entry);
    else byPos["unassigned"].push(entry);
  });

  // Sort each position group by level desc, then round-robin assign to teams
  posOrder.concat(["unassigned"]).forEach(posKey => {
    const group = (byPos[posKey] || []).sort((a, b) => b.level - a.level);
    group.forEach((player, idx) => {
      // Snake draft: 0,1,2,3,3,2,1,0,0,1...
      const round = Math.floor(idx / numTeams);
      const pos = idx % numTeams;
      const teamIdx = round % 2 === 0 ? pos : (numTeams - 1 - pos);
      teams[teamIdx].members.push(player);
    });
  });

  return teams;
}

function generateRoundRobin(teams, rounds) {
  const matches = [];
  let id = 1;
  const n = teams.length;
  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        matches.push({ id: id++, round: round + 1, teamA: teams[i].id, teamB: teams[j].id, sets: [], winner: null, played: false });
      }
    }
  }
  return matches;
}

function computeStandings(teams, matches, settings) {
  const setsToWin = settings?.setsToWin || 2;
  const standings = teams.map(t => ({ ...t, matchWins: 0, matchLosses: 0, setsWon: 0, setsLost: 0, pointsWon: 0, pointsLost: 0 }));
  matches.filter(m => m.played).forEach(m => {
    const a = standings.find(s => s.id === m.teamA);
    const b = standings.find(s => s.id === m.teamB);
    if (!a || !b) return;
    const winsA = m.sets.filter(s => s.a > s.b).length;
    const winsB = m.sets.filter(s => s.b > s.a).length;
    m.sets.forEach(s => { a.pointsWon += s.a; a.pointsLost += s.b; b.pointsWon += s.b; b.pointsLost += s.a; a.setsWon += s.a > s.b ? 1 : 0; a.setsLost += s.b > s.a ? 1 : 0; b.setsWon += s.b > s.a ? 1 : 0; b.setsLost += s.a > s.b ? 1 : 0; });
    if (winsA >= setsToWin) { a.matchWins++; b.matchLosses++; }
    else if (winsB >= setsToWin) { b.matchWins++; a.matchLosses++; }
  });
  return standings.sort((a, b) => b.matchWins - a.matchWins || b.pointsWon - a.pointsWon);
}

function TeamsManager({ games, users, store }) {
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [step, setStep] = useState("select"); // select | teams | matches | standings
  const [numTeams, setNumTeams] = useState(4);
  const [draftTeams, setDraftTeams] = useState(null);
  const [rounds, setRounds] = useState(2);
  const [setsToWin, setSetsToWin] = useState(2);
  const [scoreTarget, setScoreTarget] = useState(21);
  const [scoreModal, setScoreModal] = useState(null);

  const upcomingGames = games.filter(g => new Date(g.date + "T" + g.time) >= today).sort((a, b) => new Date(a.date) - new Date(b.date));
  const selectedGame = games.find(g => g.id === selectedGameId);
  const confirmed = selectedGame?.reservations.filter(r => r.status === "confirmed") || [];

  const handleSelectGame = (id) => {
    setSelectedGameId(id);
    const g = games.find(x => x.id === id);
    if (g?.teams) { setDraftTeams(g.teams); setStep("teams"); }
    else setStep("setup");
  };

  const handleSuggest = () => {
    const suggested = suggestTeams(confirmed, numTeams, users);
    setDraftTeams(suggested);
    setStep("teams");
  };

  const handleSaveTeams = () => {
    store.saveTeams(selectedGameId, draftTeams);
    const matches = generateRoundRobin(draftTeams, rounds);
    store.saveMatches(selectedGameId, matches, { setsToWin, scoreTarget, rounds });
    setStep("matches");
  };

  const movePlayer = (player, fromTeamId, toTeamId) => {
    setDraftTeams(prev => prev.map(t => {
      if (t.id === fromTeamId) return { ...t, members: t.members.filter(m => m.userId !== player.userId) };
      if (t.id === toTeamId) return { ...t, members: [...t.members, player] };
      return t;
    }));
  };

  const getTeam = (id) => (selectedGame?.teams || draftTeams || []).find(t => t.id === id);
  const standings = selectedGame?.teams && selectedGame?.matches ? computeStandings(selectedGame.teams, selectedGame.matches, selectedGame.matchSettings) : [];

  // Score entry modal
  const ScoreModal = ({ match, onClose }) => {
    const sets = selectedGame?.matchSettings?.setsToWin || 2;
    const maxSets = sets * 2 - 1;
    const [scores, setScores] = useState(
      match.sets.length > 0 ? match.sets : Array.from({ length: sets }, () => ({ a: 0, b: 0 }))
    );
    const setScore = (i, side, val) => setScores(prev => prev.map((s, idx) => idx === i ? { ...s, [side]: +val } : s));
    const addSet = () => { if (scores.length < maxSets) setScores(prev => [...prev, { a: 0, b: 0 }]); };
    const removeSet = () => { if (scores.length > sets) setScores(prev => prev.slice(0, -1)); };
    const teamA = getTeam(match.teamA);
    const teamB = getTeam(match.teamB);

    return (
      <Modal title={`${teamA?.name} vs ${teamB?.name}`} onClose={onClose}>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: COLORS.textMuted }}>Enter scores per set. Score target: {selectedGame?.matchSettings?.scoreTarget || 21} pts · First to {sets} set wins</p>
        <div style={{ display: "grid", gap: 10 }}>
          {scores.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted, minWidth: 44 }}>Set {i + 1}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                <span style={{ fontSize: 12, color: teamA?.color, fontWeight: 700, minWidth: 52 }}>{teamA?.name}</span>
                <input type="number" min={0} max={99} value={s.a} onChange={e => setScore(i, "a", e.target.value)} style={{ ...STYLES.input, width: 64, padding: "8px 10px", textAlign: "center", fontSize: 16, fontWeight: 700 }} />
                <span style={{ color: COLORS.textMuted, fontWeight: 700 }}>—</span>
                <input type="number" min={0} max={99} value={s.b} onChange={e => setScore(i, "b", e.target.value)} style={{ ...STYLES.input, width: 64, padding: "8px 10px", textAlign: "center", fontSize: 16, fontWeight: 700 }} />
                <span style={{ fontSize: 12, color: teamB?.color, fontWeight: 700, minWidth: 52 }}>{teamB?.name}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {scores.length < maxSets && <button onClick={addSet} style={{ ...STYLES.btn.secondary, padding: "7px 14px", fontSize: 13 }}>+ Add Set</button>}
          {scores.length > sets && <button onClick={removeSet} style={{ ...STYLES.btn.ghost, fontSize: 13 }}>− Remove Set</button>}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} style={STYLES.btn.secondary}>Cancel</button>
          <button onClick={() => { store.updateMatchScore(selectedGameId, match.id, scores); onClose(); }} style={STYLES.btn.primary}>Save Score</button>
        </div>
      </Modal>
    );
  };

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700, color: COLORS.text }}>Teams & Matches</h2>

      {/* Game Selector */}
      <div style={{ ...STYLES.card, marginBottom: 16 }}>
        <p style={{ margin: "0 0 10px", fontWeight: 600, fontSize: 14, color: COLORS.text }}>Select a game</p>
        {upcomingGames.length === 0 && <p style={{ color: COLORS.textMuted, fontSize: 14 }}>No upcoming games.</p>}
        <div style={{ display: "grid", gap: 8 }}>
          {upcomingGames.map(g => {
            const confirmedCount = g.reservations.filter(r => r.status === "confirmed").length;
            const hasTeams = !!g.teams;
            return (
              <button key={g.id} onClick={() => handleSelectGame(g.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: selectedGameId === g.id ? COLORS.primary + "12" : COLORS.surfaceAlt, border: `1.5px solid ${selectedGameId === g.id ? COLORS.primary : COLORS.border}`, borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textAlign: "left" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.text }}>{g.title}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>📅 {g.date} · {confirmedCount} confirmed players</div>
                </div>
                {hasTeams ? <span style={{ fontSize: 12, background: COLORS.successLight, color: COLORS.success, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>Teams set</span>
                  : <span style={{ fontSize: 12, background: COLORS.surfaceAlt, color: COLORS.textMuted, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>No teams yet</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Setup */}
      {selectedGame && step === "setup" && (
        <div style={STYLES.card}>
          <p style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 15, color: COLORS.text }}>Team & Match Settings</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 16 }}>
            {[
              { label: "Number of teams", val: numTeams, set: setNumTeams, min: 2, max: 6 },
              { label: "Round robin rounds", val: rounds, set: setRounds, min: 1, max: 4 },
              { label: "Sets to win a match", val: setsToWin, set: setSetsToWin, min: 1, max: 5 },
              { label: "Score target per set", val: scoreTarget, set: setScoreTarget, min: 15, max: 30 },
            ].map(s => (
              <div key={s.label}>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, display: "block", marginBottom: 6 }}>{s.label}</label>
                <input type="number" min={s.min} max={s.max} value={s.val} onChange={e => s.set(+e.target.value)} style={{ ...STYLES.input, padding: "9px 12px" }} />
              </div>
            ))}
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: COLORS.textMuted }}>{confirmed.length} confirmed players will be distributed across {numTeams} teams. System will balance positions and skill levels using a snake draft.</p>
          <button onClick={handleSuggest} style={STYLES.btn.primary}>Generate Team Suggestions →</button>
        </div>
      )}

      {/* Team Editor */}
      {selectedGame && step === "teams" && draftTeams && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: COLORS.text }}>Suggested Teams — drag players between teams to adjust</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setStep("setup")} style={{ ...STYLES.btn.secondary, padding: "8px 14px", fontSize: 13 }}>← Redo</button>
              <button onClick={handleSaveTeams} style={STYLES.btn.primary}>Lock Teams & Generate Matches →</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {draftTeams.map(team => (
              <div key={team.id} style={{ background: COLORS.surface, border: `2px solid ${team.color}33`, borderRadius: 12, overflow: "hidden" }}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const data = JSON.parse(e.dataTransfer.getData("text/plain")); if (data.fromTeam !== team.id) movePlayer(data.player, data.fromTeam, team.id); }}>
                <div style={{ background: team.color, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{team.name}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{team.members.length} players</span>
                </div>
                <div style={{ padding: "10px" }}>
                  {team.members.length === 0 && <p style={{ color: COLORS.textMuted, fontSize: 12, textAlign: "center", padding: "10px 0" }}>Drop players here</p>}
                  {team.members.map(m => {
                    const pos = DEFAULT_POSITIONS.find(p => p.key === m.position);
                    return (
                      <div key={m.userId} draggable
                        onDragStart={e => e.dataTransfer.setData("text/plain", JSON.stringify({ player: m, fromTeam: team.id }))}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", marginBottom: 5, background: COLORS.surfaceAlt, borderRadius: 8, cursor: "grab", userSelect: "none" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: team.color + "33", color: team.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{m.avatar}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</div>
                          <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                            <span style={{ fontSize: 10, background: pos?.color + "22", color: pos?.color, padding: "1px 6px", borderRadius: 10, fontWeight: 600 }}>{pos?.label}</span>
                            <span style={{ fontSize: 10, background: COLORS.border, color: COLORS.textMuted, padding: "1px 6px", borderRadius: 10, fontWeight: 600 }}>L{m.level}</span>
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

      {/* Matches */}
      {selectedGame && (step === "matches" || (selectedGame.matches && step === "select")) && selectedGame.matches && (
        <div style={{ marginTop: step === "matches" ? 20 : 0 }}>
          {step === "matches" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: COLORS.text }}>Match Schedule</p>
              <button onClick={() => setStep("standings")} style={{ ...STYLES.btn.secondary, padding: "8px 14px", fontSize: 13 }}>View Standings →</button>
            </div>
          )}
          {selectedGame.teams && selectedGame.matches && (
            <div>
              {/* Sub-tabs */}
              <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${COLORS.border}`, marginBottom: 16 }}>
                {["matches","standings"].map(s => (
                  <button key={s} onClick={() => setStep(s)} style={{ padding: "10px 18px", background: "transparent", border: "none", borderBottom: step === s ? `2.5px solid ${COLORS.primary}` : "2.5px solid transparent", color: step === s ? COLORS.primary : COLORS.textMuted, fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif", textTransform: "capitalize" }}>{s === "matches" ? "📋 Matches" : "🏆 Standings"}</button>
                ))}
                <button onClick={() => setStep("teams")} style={{ padding: "10px 18px", background: "transparent", border: "none", borderBottom: "2.5px solid transparent", color: COLORS.textMuted, fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginLeft: "auto" }}>Edit Teams</button>
              </div>

              {step === "matches" && (
                <div>
                  {Array.from({ length: selectedGame.matchSettings?.rounds || 2 }, (_, ri) => (
                    <div key={ri} style={{ marginBottom: 20 }}>
                      <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 14, color: COLORS.textMuted }}>Round {ri + 1}</p>
                      <div style={{ display: "grid", gap: 10 }}>
                        {selectedGame.matches.filter(m => m.round === ri + 1).map(m => {
                          const tA = selectedGame.teams.find(t => t.id === m.teamA);
                          const tB = selectedGame.teams.find(t => t.id === m.teamB);
                          return (
                            <div key={m.id} style={{ ...STYLES.card, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 200 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: tA?.color }} />
                                  <span style={{ fontWeight: m.winner === m.teamA ? 700 : 400, fontSize: 14, color: m.winner === m.teamA ? COLORS.text : COLORS.textMuted }}>{tA?.name}</span>
                                </div>
                                <span style={{ color: COLORS.textMuted, fontSize: 13 }}>vs</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: tB?.color }} />
                                  <span style={{ fontWeight: m.winner === m.teamB ? 700 : 400, fontSize: 14, color: m.winner === m.teamB ? COLORS.text : COLORS.textMuted }}>{tB?.name}</span>
                                </div>
                              </div>
                              {m.played ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{ display: "flex", gap: 6 }}>
                                    {m.sets.map((s, i) => (
                                      <span key={i} style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, background: COLORS.surfaceAlt, padding: "3px 8px", borderRadius: 6 }}>{s.a}–{s.b}</span>
                                    ))}
                                  </div>
                                  <span style={{ fontSize: 12, background: COLORS.successLight, color: COLORS.success, padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
                                    {selectedGame.teams.find(t => t.id === m.winner)?.name} wins
                                  </span>
                                  <button onClick={() => setScoreModal(m)} style={{ ...STYLES.btn.ghost, fontSize: 12, padding: "4px 10px" }}>Edit</button>
                                </div>
                              ) : (
                                <button onClick={() => setScoreModal(m)} style={{ ...STYLES.btn.primary, padding: "8px 16px", fontSize: 13 }}>Enter Score</button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {step === "standings" && (
                <div style={STYLES.card}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${COLORS.border}` }}>
                          {["Rank","Team","W","L","Sets W","Sets L","Pts Won","Pts Lost"].map(h => (
                            <th key={h} style={{ padding: "8px 12px", textAlign: h === "Team" ? "left" : "center", fontWeight: 700, color: COLORS.textMuted, fontSize: 12 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((t, i) => (
                          <tr key={t.id} style={{ borderBottom: `1px solid ${COLORS.border}`, background: i === 0 ? "#fffbea" : "transparent" }}>
                            <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, fontSize: 16 }}>
                              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                            </td>
                            <td style={{ padding: "10px 12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                                <span style={{ fontWeight: 600, color: COLORS.text }}>{t.name}</span>
                                <span style={{ fontSize: 11, color: COLORS.textMuted }}>({t.members?.length || 0} players)</span>
                              </div>
                            </td>
                            {[t.matchWins, t.matchLosses, t.setsWon, t.setsLost, t.pointsWon, t.pointsLost].map((v, vi) => (
                              <td key={vi} style={{ padding: "10px 12px", textAlign: "center", fontWeight: vi < 2 ? 700 : 400, color: vi === 0 ? COLORS.success : vi === 1 ? COLORS.danger : COLORS.text }}>{v}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {standings.length === 0 && <p style={{ color: COLORS.textMuted, fontSize: 14, padding: "14px 0", textAlign: "center" }}>No completed matches yet.</p>}
                  </div>
                  <p style={{ margin: "12px 0 0", fontSize: 12, color: COLORS.textMuted }}>Ranked by: match wins → total points won (tiebreaker)</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {scoreModal && <ScoreModal match={scoreModal} onClose={() => setScoreModal(null)} />}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const store = useStore();
  const [tab, setTab] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (store.currentUser) setTab(store.currentUser.role === "admin" ? "schedule" : "browse");
  }, [store.currentUser]);

  if (!store.currentUser) return <><LoginPage login={store.login} /><Toast toast={store.toast} /></>;

  return (
    <>
      <Layout currentUser={store.currentUser} logout={store.logout} tab={tab} setTab={setTab}>
        {store.currentUser.role === "admin" ? (
          <>
            {tab === "schedule" && <ScheduleManager games={store.games} users={store.users} currentUser={store.currentUser} store={store} />}
            {tab === "payments" && <PaymentsManager games={store.games} users={store.users} store={store} />}
            {tab === "members" && <MembersManager users={store.users} currentUser={store.currentUser} store={store} />}
            {tab === "teams" && <TeamsManager games={store.games} users={store.users} store={store} />}
          </>
        ) : (
          <>
            {tab === "browse" && <BrowseGames games={store.games} users={store.users} currentUser={store.currentUser} store={store} />}
            {tab === "myGames" && <MyGames games={store.games} users={store.users} currentUser={store.currentUser} store={store} />}
            {tab === "myPayments" && <MyPayments games={store.games} currentUser={store.currentUser} store={store} />}
            {tab === "profile" && <ProfilePage currentUser={store.currentUser} store={store} />}
          </>
        )}
      </Layout>
      <Toast toast={store.toast} />
    </>
  );
}