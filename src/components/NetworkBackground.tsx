import { useMemo } from "react";

/** Animated blockchain-style network nodes + connections for hero background */
export const NetworkBackground = () => {
  const nodes = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${5 + Math.random() * 90}%`,
        top: `${5 + Math.random() * 90}%`,
        size: 3 + Math.random() * 5,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 6,
      })),
    [],
  );

  const lines = useMemo(() => {
    const l: { x1: string; y1: string; x2: string; y2: string; delay: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const j = (i + 1 + Math.floor(Math.random() * 3)) % nodes.length;
      l.push({
        x1: nodes[i].left,
        y1: nodes[i].top,
        x2: nodes[j].left,
        y2: nodes[j].top,
        delay: Math.random() * 4,
      });
    }
    return l;
  }, [nodes]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(199_89%_48%/0.1)_0%,_transparent_65%)]" />

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="hsl(var(--primary))"
            strokeWidth="0.5"
            className="animate-line-pulse"
            style={{ animationDelay: `${l.delay}s` }}
          />
        ))}
      </svg>

      {/* Nodes */}
      {nodes.map((n) => (
        <div
          key={n.id}
          className="absolute rounded-full bg-primary animate-float-node"
          style={{
            left: n.left,
            top: n.top,
            width: n.size,
            height: n.size,
            animationDelay: `${n.delay}s`,
            animationDuration: `${n.duration}s`,
          }}
        />
      ))}

      {/* Scrolling hashes (decorative) */}
      <div className="absolute right-4 top-0 bottom-0 w-48 overflow-hidden opacity-[0.04] font-mono text-[10px] text-primary">
        <div className="animate-hash-scroll">
          {Array.from({ length: 40 }, (_, i) => (
            <p key={i} className="whitespace-nowrap leading-5">
              {Array.from({ length: 32 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
