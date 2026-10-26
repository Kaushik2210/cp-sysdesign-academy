const COLORS = ["--accent", "--hot", "--cool", "--sun", "--leaf"];

/** Bursts a short-lived shower of coloured squares from a point. Uses the Web Animations API, no dependencies. */
export function fireConfetti(origin: { x: number; y: number }, count = 36) {
  if (typeof document === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.dataset.confetti = "";
  host.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:80;overflow:hidden";
  document.body.appendChild(host);
  let finished = 0;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    const size = 6 + Math.random() * 6;
    p.style.cssText = `position:absolute;left:${origin.x}px;top:${origin.y}px;width:${size}px;height:${size * 0.6}px;border-radius:2px;background:hsl(var(${COLORS[i % COLORS.length]}))`;
    host.appendChild(p);
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 150;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 70;
    const anim = p.animate(
      [
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) rotate(${Math.random() * 540}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${dx * 1.1}px,${dy + 140}px) rotate(${Math.random() * 720}deg)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.2,.7,.3,1)" },
    );
    anim.onfinish = () => {
      if (++finished === count) host.remove();
    };
  }
  window.setTimeout(() => host.remove(), 2200);
}
