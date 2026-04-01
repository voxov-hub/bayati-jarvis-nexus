interface GeneratingAnimationProps {
  currentStep: 0 | 1 | 2 | 3;
  statusMessage: string;
}

const STEPS = [
  "Reading brief",
  "Crafting prompt",
  "Generating image",
  "Reviewing against brand",
];

export function GeneratingAnimation({ currentStep, statusMessage }: GeneratingAnimationProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <style>{`
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes orb-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes ring-cw {
          from { transform: rotateX(60deg) rotateZ(0deg); }
          to { transform: rotateX(60deg) rotateZ(360deg); }
        }
        @keyframes ring-ccw {
          from { transform: rotateX(70deg) rotateZ(0deg); }
          to { transform: rotateX(70deg) rotateZ(-360deg); }
        }
        @keyframes scan-line {
          0% { transform: translateY(-60px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(60px); opacity: 0; }
        }
        @keyframes particle-drift {
          0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
        }
        @keyframes step-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
        .orb-core {
          animation: orb-pulse 2.5s ease-in-out infinite;
        }
        .orb-glow-layer {
          animation: orb-glow 2.5s ease-in-out infinite;
        }
        .ring-cw {
          animation: ring-cw 4s linear infinite;
        }
        .ring-ccw {
          animation: ring-ccw 5s linear infinite;
        }
        .scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }
        .particle {
          animation: particle-drift 3s ease-out infinite;
        }
        .step-fill-bar {
          animation: step-fill 2s ease-in-out infinite;
        }
      `}</style>

      {/* Orb container */}
      <div style={{ position: "relative", width: 160, height: 160 }}>
        {/* Glow */}
        <div
          className="orb-glow-layer"
          style={{
            position: "absolute",
            inset: -20,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(193,123,47,0.4) 0%, transparent 70%)",
          }}
        />

        {/* Core orb */}
        <div
          className="orb-core"
          style={{
            position: "absolute",
            inset: 20,
            borderRadius: "50%",
            background: "radial-gradient(circle at 40% 35%, #d4943a, #C17B2F, #9a6224)",
            boxShadow: "0 0 40px rgba(193,123,47,0.5), inset 0 -8px 20px rgba(0,0,0,0.3)",
          }}
        />

        {/* Scan line */}
        <div
          className="scan-line"
          style={{
            position: "absolute",
            left: 30,
            right: 30,
            top: "50%",
            height: 2,
            background: "linear-gradient(90deg, transparent, rgba(193,123,47,0.8), transparent)",
            borderRadius: 1,
          }}
        />

        {/* Rings (SVG) */}
        <svg
          viewBox="-90 -90 180 180"
          style={{ position: "absolute", inset: -10, width: 180, height: 180 }}
        >
          <ellipse
            className="ring-cw"
            cx="0" cy="0" rx="75" ry="30"
            fill="none" stroke="#C17B2F" strokeWidth="1.5"
            strokeDasharray="8 6" opacity="0.6"
            style={{ transformOrigin: "center" }}
          />
          <ellipse
            className="ring-ccw"
            cx="0" cy="0" rx="70" ry="25"
            fill="none" stroke="#C17B2F" strokeWidth="1"
            strokeDasharray="5 8" opacity="0.4"
            style={{ transformOrigin: "center" }}
          />
        </svg>

        {/* Particles */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * 360;
          const rad = (angle * Math.PI) / 180;
          const dx = Math.cos(rad) * 60;
          const dy = Math.sin(rad) * 60;
          return (
            <div
              key={i}
              className="particle"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#C17B2F",
                marginLeft: -2,
                marginTop: -2,
                "--dx": `${dx}px`,
                "--dy": `${dy}px`,
                animationDelay: `${i * 0.375}s`,
                opacity: 0.8,
              } as React.CSSProperties}
            />
          );
        })}
      </div>

      {/* Step tracker */}
      <div className="w-full max-w-sm space-y-2">
        {STEPS.map((label, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          return (
            <div key={label} className="flex items-center gap-3">
              {/* Dot */}
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: isActive ? "#C17B2F" : isDone ? "rgba(193,123,47,0.4)" : "hsl(220 10% 75%)",
                  boxShadow: isActive ? "0 0 8px rgba(193,123,47,0.6)" : "none",
                  flexShrink: 0,
                }}
              />
              {/* Label + bar */}
              <div className="flex-1 min-w-0">
                <span
                  className="text-xs font-medium"
                  style={{
                    color: isActive ? "#C17B2F" : isDone ? "hsl(220 10% 45%)" : "hsl(220 10% 65%)",
                  }}
                >
                  {label}
                </span>
                {isActive && (
                  <div
                    style={{
                      height: 2,
                      marginTop: 4,
                      borderRadius: 1,
                      background: "hsl(220 10% 88%)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="step-fill-bar"
                      style={{
                        height: "100%",
                        background: "#C17B2F",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status message */}
      {statusMessage && (
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          {statusMessage}
        </p>
      )}
    </div>
  );
}
