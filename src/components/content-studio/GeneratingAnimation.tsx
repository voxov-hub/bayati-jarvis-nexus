import { useEffect, useRef } from "react";

interface Props {
  currentStep: 0 | 1 | 2 | 3;
  statusMessage: string;
}

const STEP_COLORS = ["#C17B2F", "#7DBDD7", "#F0B8D0", "#B0CAA2"];

const STEP_MESSAGES: string[][] = [
  ["Reading your brief...", "Analysing context...", "Understanding the scene..."],
  ["Claude is writing...", "Composing the prompt...", "Setting the atmosphere...", "Describing the light..."],
  ["Flux is rendering...", "Building the image...", "Applying LoRA weights...", "Refining details...", "Generating pass 2...", "Checking composition..."],
  ["Checking brand integrity...", "Scoring against Voxov criteria...", "Evaluating the light...", "Almost there...", "Final quality check..."],
];

const STEP_LABELS = ["Reading brief", "Crafting prompt", "Generating image", "Reviewing against brand"];

export function GeneratingAnimation({ currentStep, statusMessage }: Props) {
  const statusRef = useRef<HTMLParagraphElement | null>(null);
  const msgIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const color = STEP_COLORS[currentStep];
    const msgs = STEP_MESSAGES[currentStep];
    msgIndexRef.current = 0;

    function setMsg(text: string) {
      if (!statusRef.current) return;
      statusRef.current.style.transition = "none";
      statusRef.current.style.opacity = "0";
      statusRef.current.style.transform = "translateY(4px)";
      statusRef.current.textContent = text;
      statusRef.current.style.color = color;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!statusRef.current) return;
          statusRef.current.style.transition = "opacity 0.4s ease, transform 0.4s ease";
          statusRef.current.style.opacity = "1";
          statusRef.current.style.transform = "translateY(0)";
        });
      });
    }

    if (timerRef.current) clearInterval(timerRef.current);
    setMsg(statusMessage || msgs[0]);
    timerRef.current = setInterval(() => {
      msgIndexRef.current = (msgIndexRef.current + 1) % msgs.length;
      setMsg(msgs[msgIndexRef.current]);
    }, 3000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentStep, statusMessage]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, padding: "32px 0" }}>
      {/* Orb stage */}
      <div style={{ position: "relative", width: 200, height: 200 }}>
        {/* Ring 1: amber, slowest */}
        <div style={{ position: "absolute", inset: 0, animation: "vx-cw 7s linear infinite" }}>
          <svg viewBox="-100 -100 200 200" style={{ width: "100%", height: "100%" }}>
            <ellipse cx="0" cy="0" rx="90" ry="34" fill="none" stroke="#C17B2F" strokeWidth="1.2" strokeDasharray="12 8" opacity="0.5" />
            <ellipse cx="0" cy="0" rx="90" ry="34" fill="none" stroke="#C17B2F" strokeWidth="0.6" strokeDasharray="4 14" opacity="0.25" transform="rotate(45)" />
            <ellipse cx="0" cy="0" rx="90" ry="34" fill="none" stroke="#C17B2F" strokeWidth="0.6" strokeDasharray="4 14" opacity="0.25" transform="rotate(90)" />
            <ellipse cx="0" cy="0" rx="90" ry="34" fill="none" stroke="#C17B2F" strokeWidth="0.6" strokeDasharray="4 14" opacity="0.25" transform="rotate(135)" />
            <ellipse cx="0" cy="0" rx="90" ry="34" fill="none" stroke="#C17B2F" strokeWidth="1.2" strokeDasharray="6 10" opacity="0.35" transform="rotate(60)" />
          </svg>
        </div>

        {/* Ring 2: cloud blue, medium counter */}
        <div style={{ position: "absolute", inset: 10, animation: "vx-ccw 5.5s linear infinite" }}>
          <svg viewBox="-100 -100 200 200" style={{ width: "100%", height: "100%" }}>
            <ellipse cx="0" cy="0" rx="78" ry="28" fill="none" stroke="#7DBDD7" strokeWidth="1" strokeDasharray="10 6" opacity="0.4" />
            <ellipse cx="0" cy="0" rx="78" ry="28" fill="none" stroke="#7DBDD7" strokeWidth="0.5" strokeDasharray="3 12" opacity="0.2" transform="rotate(50)" />
            <ellipse cx="0" cy="0" rx="78" ry="28" fill="none" stroke="#7DBDD7" strokeWidth="0.5" strokeDasharray="3 12" opacity="0.2" transform="rotate(100)" />
            <ellipse cx="0" cy="0" rx="78" ry="28" fill="none" stroke="#7DBDD7" strokeWidth="0.5" strokeDasharray="3 12" opacity="0.2" transform="rotate(150)" />
            <ellipse cx="0" cy="0" rx="78" ry="28" fill="none" stroke="#7DBDD7" strokeWidth="1" strokeDasharray="5 9" opacity="0.3" transform="rotate(75)" />
          </svg>
        </div>

        {/* Ring 3: blush pink, faster */}
        <div style={{ position: "absolute", inset: 22, animation: "vx-cw 4s linear infinite" }}>
          <svg viewBox="-100 -100 200 200" style={{ width: "100%", height: "100%" }}>
            <ellipse cx="0" cy="0" rx="65" ry="22" fill="none" stroke="#F0B8D0" strokeWidth="0.8" strokeDasharray="8 5" opacity="0.35" />
            <ellipse cx="0" cy="0" rx="65" ry="22" fill="none" stroke="#F0B8D0" strokeWidth="0.4" strokeDasharray="2 10" opacity="0.15" transform="rotate(55)" />
            <ellipse cx="0" cy="0" rx="65" ry="22" fill="none" stroke="#F0B8D0" strokeWidth="0.4" strokeDasharray="2 10" opacity="0.15" transform="rotate(110)" />
            <ellipse cx="0" cy="0" rx="65" ry="22" fill="none" stroke="#F0B8D0" strokeWidth="0.8" strokeDasharray="4 8" opacity="0.25" transform="rotate(30)" />
            <ellipse cx="0" cy="0" rx="65" ry="22" fill="none" stroke="#F0B8D0" strokeWidth="0.4" strokeDasharray="2 10" opacity="0.15" transform="rotate(165)" />
          </svg>
        </div>

        {/* Ring 4: olive green, fastest */}
        <div style={{ position: "absolute", inset: 34, animation: "vx-ccw 3s linear infinite" }}>
          <svg viewBox="-100 -100 200 200" style={{ width: "100%", height: "100%" }}>
            <ellipse cx="0" cy="0" rx="52" ry="16" fill="none" stroke="#B0CAA2" strokeWidth="0.6" strokeDasharray="6 4" opacity="0.3" />
            <ellipse cx="0" cy="0" rx="52" ry="16" fill="none" stroke="#B0CAA2" strokeWidth="0.6" strokeDasharray="3 8" opacity="0.2" transform="rotate(70)" />
          </svg>
        </div>

        {/* Scan line */}
        <div style={{ position: "absolute", left: 40, right: 40, top: "50%", height: 2, background: "linear-gradient(90deg, transparent, rgba(193,123,47,0.7), transparent)", borderRadius: 1, animation: "vx-scan 2.5s ease-in-out infinite" }} />

        {/* Particles */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {[
            { color: "#C17B2F", anim: "vx-p1", delay: "0s" },
            { color: "#7DBDD7", anim: "vx-p2", delay: "0.43s" },
            { color: "#F0B8D0", anim: "vx-p3", delay: "0.86s" },
            { color: "#B0CAA2", anim: "vx-p4", delay: "1.3s" },
            { color: "#C17B2F", anim: "vx-p5", delay: "1.73s" },
            { color: "#7DBDD7", anim: "vx-p6", delay: "2.16s" },
          ].map((p, i) => (
            <div key={i} style={{ position: "absolute", left: "50%", top: "50%", width: 4, height: 4, borderRadius: "50%", background: p.color, marginLeft: -2, marginTop: -2, animation: `${p.anim} 3s ease-out infinite`, animationDelay: p.delay }} />
          ))}
        </div>

        {/* Core */}
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 56, height: 56, transform: "translate(-50%, -50%)", animation: "vx-pulse 3s ease-in-out infinite" }}>
          <svg viewBox="0 0 56 56" style={{ width: "100%", height: "100%" }}>
            <defs>
              <radialGradient id="vx-core-g" cx="40%" cy="35%">
                <stop offset="0%" stopColor="#d4943a" />
                <stop offset="100%" stopColor="#9a6224" />
              </radialGradient>
            </defs>
            <circle cx="28" cy="28" r="26" fill="url(#vx-core-g)" />
            <circle cx="28" cy="28" r="26" fill="none" stroke="#C17B2F" strokeWidth="1" opacity="0.4" />
            <circle cx="28" cy="28" r="28" fill="none" stroke="#C17B2F" strokeWidth="0.5" opacity="0.15" />
          </svg>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 320 }}>
        {STEP_LABELS.map((label, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          const color = STEP_COLORS[i];
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: isActive ? color : isDone ? color : "hsl(220 10% 78%)", opacity: isActive ? 1 : isDone ? 0.5 : 0.4, boxShadow: isActive ? `0 0 8px ${color}` : "none", animation: isActive ? "vx-dot 1.8s ease-in-out infinite" : "none" }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: isActive ? color : isDone ? "hsl(220 10% 50%)" : "hsl(220 10% 65%)", flex: 1 }}>{label}</span>
              <div style={{ width: 48, height: 3, borderRadius: 2, background: isDone ? color : "hsl(220 10% 90%)", overflow: "hidden", opacity: isDone ? 0.5 : 1 }}>
                <div style={{ height: "100%", background: color, width: isActive ? undefined : isDone ? "100%" : "0%", animation: isActive ? "vx-fill 2.5s ease-in-out infinite" : "none" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Status text */}
      <p ref={statusRef} style={{ fontSize: 13, fontWeight: 500, textAlign: "center", minHeight: 20 }} />

      {/* Keyframes */}
      <style>{`
        @keyframes vx-cw{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes vx-ccw{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
        @keyframes vx-pulse{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.2)}}
        @keyframes vx-scan{0%{transform:translateY(-80px);opacity:0}15%{opacity:0.8}85%{opacity:0.8}100%{transform:translateY(80px);opacity:0}}
        @keyframes vx-dot{0%,100%{opacity:0.2;transform:scale(0.7)}50%{opacity:1;transform:scale(1.3)}}
        @keyframes vx-fill{from{width:0%}to{width:100%}}
        @keyframes vx-p1{0%{transform:translate(0,0);opacity:0}20%{opacity:1}100%{transform:translate(30px,-42px);opacity:0}}
        @keyframes vx-p2{0%{transform:translate(0,0);opacity:0}20%{opacity:1}100%{transform:translate(-36px,-26px);opacity:0}}
        @keyframes vx-p3{0%{transform:translate(0,0);opacity:0}20%{opacity:1}100%{transform:translate(40px,20px);opacity:0}}
        @keyframes vx-p4{0%{transform:translate(0,0);opacity:0}20%{opacity:1}100%{transform:translate(-22px,44px);opacity:0}}
        @keyframes vx-p5{0%{transform:translate(0,0);opacity:0}20%{opacity:1}100%{transform:translate(14px,-50px);opacity:0}}
        @keyframes vx-p6{0%{transform:translate(0,0);opacity:0}20%{opacity:1}100%{transform:translate(-44px,12px);opacity:0}}
      `}</style>
    </div>
  );
}
