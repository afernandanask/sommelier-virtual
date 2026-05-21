
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
import { useState, useRef, useEffect } from "react";

const WELCOME_MSG = {
  role: "assistant",
  content: `Olá! Bem-vindo à nossa enoteca virtual 🍷\n\nSou seu sommelier pessoal e estou aqui para te ajudar a encontrar o vinho perfeito para o seu momento.\n\nMe conta: qual é a ocasião? Pode ser um jantar especial, uma reunião com amigos, um presente... ou simplesmente a vontade de abrir uma boa garrafa hoje à noite.\n\nEstou todo ouvidos! 😊`,
};

const suggestions = [
  "Vinho tinto para jantar a dois hoje à noite 🕯️",
  "Espumante para celebrar com amigos 🥂",
  "Branco leve para frutos do mar no verão 🦐",
  "Presente para um apreciador de vinhos 🎁",
];

export default function Home() {
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message || "Desculpe, não consegui processar." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Desculpe, houve um problema. Tente novamente. 🙏" }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
      `}</style>

      <div style={s.page}>
        <div style={s.bgOrb1} /><div style={s.bgOrb2} /><div style={s.bgOrb3} />

        <div style={s.container}>
          {/* Header */}
          <header style={s.header}>
            <div style={s.headerInner}>
              <div style={s.logoArea}>
                <span style={s.logoIcon}>🍷</span>
                <div>
                  <div style={s.logoTitle}>Sommelier Virtual</div>
                  <div style={s.logoSub}>Curadoria personalizada de vinhos</div>
                </div>
              </div>
              <div style={s.statusBadge}>
                <span style={s.statusDot} />Online
              </div>
            </div>
          </header>

          {/* Messages */}
          <div style={s.messagesArea}>
            {messages.map((msg, i) => (
              <div key={i} style={{ ...s.msgRow, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.role === "assistant" && <div style={s.avatar}>🍷</div>}
                <div style={msg.role === "user" ? s.bubbleUser : s.bubbleBot}>
                  {msg.content.split("\n").map((line, j, arr) => (
                    <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ ...s.msgRow, justifyContent: "flex-start" }}>
                <div style={s.avatar}>🍷</div>
                <div style={s.bubbleBot}>
                  <div style={s.typing}>
                    {[0, 0.2, 0.4].map((d, i) => (
                      <span key={i} style={{ ...s.dot, animationDelay: `${d}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length === 1 && (
            <div style={s.suggestionsArea}>
              <p style={s.suggestLabel}>Sugestões rápidas:</p>
              <div style={s.chips}>
                {suggestions.map((sg, i) => (
                  <button key={i} style={s.chip} onClick={() => sendMessage(sg)}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(139,0,0,0.15)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(139,0,0,0.07)"}>
                    {sg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={s.inputArea}>
            <div style={s.inputWrapper}>
              <textarea
                ref={(el) => { inputRef.current = el; textareaRef.current = el; }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Descreva o que você está procurando..."
                style={s.textarea}
                rows={1}
              />
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                style={{ ...s.sendBtn, opacity: (!input.trim() || loading) ? 0.4 : 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p style={s.hint}>Enter para enviar · Shift+Enter para nova linha</p>
          </div>
        </div>
      </div>
    </>
  );
}

const s = {
  page: { minHeight:"100vh", background:"linear-gradient(135deg,#1a0a0a 0%,#2d1010 40%,#1a0a18 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:"16px", position:"relative", overflow:"hidden" },
  bgOrb1: { position:"fixed", top:"-100px", right:"-100px", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(139,0,0,0.25) 0%,transparent 70%)", pointerEvents:"none" },
  bgOrb2: { position:"fixed", bottom:"-80px", left:"-80px", width:"350px", height:"350px", borderRadius:"50%", background:"radial-gradient(circle,rgba(100,0,80,0.2) 0%,transparent 70%)", pointerEvents:"none" },
  bgOrb3: { position:"fixed", top:"40%", left:"30%", width:"200px", height:"200px", borderRadius:"50%", background:"radial-gradient(circle,rgba(180,100,0,0.08) 0%,transparent 70%)", pointerEvents:"none" },
  container: { width:"100%", maxWidth:"680px", display:"flex", flexDirection:"column", height:"92vh", maxHeight:"820px", background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"24px", overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.1)", position:"relative", zIndex:1 },
  header: { padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(0,0,0,0.2)", flexShrink:0 },
  headerInner: { display:"flex", alignItems:"center", justifyContent:"space-between" },
  logoArea: { display:"flex", alignItems:"center", gap:"14px" },
  logoIcon: { fontSize:"32px", filter:"drop-shadow(0 0 12px rgba(139,0,0,0.6))" },
  logoTitle: { fontFamily:"'Cormorant Garamond',serif", fontSize:"20px", fontWeight:"600", color:"#f5e6d0", letterSpacing:"0.5px" },
  logoSub: { fontSize:"11px", color:"rgba(245,230,208,0.45)", letterSpacing:"1.5px", textTransform:"uppercase", marginTop:"1px" },
  statusBadge: { display:"flex", alignItems:"center", gap:"6px", fontSize:"12px", color:"rgba(245,230,208,0.6)", background:"rgba(255,255,255,0.05)", padding:"6px 12px", borderRadius:"20px", border:"1px solid rgba(255,255,255,0.08)" },
  statusDot: { width:"7px", height:"7px", borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 6px #4ade80", animation:"pulse 2s ease-in-out infinite", display:"inline-block" },
  messagesArea: { flex:1, overflowY:"auto", padding:"24px 20px 12px", display:"flex", flexDirection:"column", gap:"16px" },
  msgRow: { display:"flex", alignItems:"flex-end", gap:"10px", animation:"fadeIn 0.3s ease-out" },
  avatar: { width:"34px", height:"34px", borderRadius:"50%", background:"rgba(139,0,0,0.4)", border:"1px solid rgba(139,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0, boxShadow:"0 0 12px rgba(139,0,0,0.3)" },
  bubbleBot: { maxWidth:"78%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:"18px 18px 18px 4px", padding:"13px 16px", fontSize:"14.5px", lineHeight:"1.65", color:"#f0e0cc", boxShadow:"0 4px 16px rgba(0,0,0,0.2)" },
  bubbleUser: { maxWidth:"72%", background:"linear-gradient(135deg,#8b0000,#6b0020)", borderRadius:"18px 18px 4px 18px", padding:"13px 16px", fontSize:"14.5px", lineHeight:"1.65", color:"#ffe8d6", boxShadow:"0 4px 20px rgba(139,0,0,0.35)", border:"1px solid rgba(255,255,255,0.1)" },
  typing: { display:"flex", gap:"5px", alignItems:"center", padding:"2px 0" },
  dot: { width:"7px", height:"7px", borderRadius:"50%", background:"rgba(245,230,208,0.5)", display:"inline-block", animation:"bounce 1.2s ease-in-out infinite" },
  suggestionsArea: { padding:"0 20px 16px", flexShrink:0 },
  suggestLabel: { fontSize:"11px", color:"rgba(245,230,208,0.35)", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"10px" },
  chips: { display:"flex", flexWrap:"wrap", gap:"8px" },
  chip: { background:"rgba(139,0,0,0.07)", border:"1px solid rgba(139,0,0,0.25)", borderRadius:"20px", padding:"7px 14px", fontSize:"12.5px", color:"#f0d0b0", cursor:"pointer", transition:"all 0.2s ease", fontFamily:"'DM Sans',sans-serif" },
  inputArea: { padding:"16px 20px 20px", borderTop:"1px solid rgba(255,255,255,0.06)", background:"rgba(0,0,0,0.15)", flexShrink:0 },
  inputWrapper: { display:"flex", alignItems:"flex-end", gap:"10px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"16px", padding:"10px 10px 10px 16px" },
  textarea: { flex:1, background:"transparent", border:"none", outline:"none", resize:"none", color:"#f0e0cc", fontSize:"14.5px", lineHeight:"1.5", fontFamily:"'DM Sans',sans-serif", minHeight:"24px", maxHeight:"120px", overflowY:"auto" },
  sendBtn: { width:"38px", height:"38px", borderRadius:"10px", background:"linear-gradient(135deg,#8b0000,#6b0020)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#ffe8d6", transition:"all 0.2s ease", flexShrink:0, boxShadow:"0 2px 10px rgba(139,0,0,0.4)" },
  hint: { fontSize:"10.5px", color:"rgba(245,230,208,0.25)", textAlign:"center", marginTop:"10px", letterSpacing:"0.5px" },
};
