(() => {
  if (window.__morph) return;

  const KW = {
    recruiter: ["skill", "experience", "project", "resume", "cv", "github", "education", "stack", "intern", "achievement", "certification"],
    client: ["service", "pricing", "testimonial", "client", "contact", "hire", "book", "offer", "package", "process", "review"],
    designer: ["case study", "design", "gallery", "work", "process", "visual", "brand", "figma", "behance", "dribbble", "ux"],
  };

  let state = null;

  function findGeneric() {
    let best = null;
    for (const el of document.querySelectorAll("body, body *")) {
      if (el.children.length < 3 || el.offsetHeight < 600) continue;
      const kids = [...el.children].filter((k) => {
        if (!["SECTION", "DIV", "ARTICLE"].includes(k.tagName)) return false;
        const pos = getComputedStyle(k).position;
        return k.offsetHeight > 150 && k.offsetWidth > innerWidth * 0.6 && pos !== "fixed" && pos !== "sticky";
      });
      if (kids.length >= 3 && (!best || kids.length > best.kids.length)) best = { parent: el, kids };
    }
    return best;
  }

  function findSections() {
    const targets = [];
    for (const a of document.querySelectorAll('a[href^="#"]')) {
      const id = decodeURIComponent(a.getAttribute("href").slice(1));
      if (!id) continue;
      const el = document.getElementById(id);
      if (el && !targets.includes(el) && el.offsetHeight > 100 && el.offsetWidth > innerWidth * 0.5) targets.push(el);
    }
    targets.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    const nested = targets.some((x) => targets.some((y) => x !== y && x.contains(y)));
    if (targets.length >= 3 && !nested) return { kids: targets };
    return findGeneric();
  }

  function headingOf(el) {
    const h = el.querySelector("h1, h2, h3");
    const t = h ? h.innerText : el.id || "";
    return t.replace(/\s+/g, " ").trim().slice(0, 80);
  }

  function collect() {
    if (!state) {
      const found = findSections();
      if (!found) return null;
      state = { original: found.kids.slice(0, 20) };
    }
    return state.original.map((el, i) => ({
      i,
      heading: headingOf(el),
      snippet: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 200),
    }));
  }

  function local(persona) {
    const scores = state.original.map((el) => {
      const text = (el.innerText || "").slice(0, 1500).toLowerCase();
      return KW[persona].reduce((n, k) => n + (text.split(k).length - 1), 0);
    });
    const idx = state.original.map((_, i) => i).slice(1);
    idx.sort((a, b) => scores[b] - scores[a] || a - b);
    return {
      order: [0, ...idx],
      dim: idx.filter((i) => scores[i] === 0).slice(0, Math.floor(state.original.length / 3)),
      reasoning: "Matched section text to what a " + persona + " looks for.",
      source: "keywords",
    };
  }

  function reorder(ordered) {
    const els = state.original;
    const before = new Map(els.map((el) => [el, el.getBoundingClientRect().top]));
    const current = [...els].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    const markers = current.map((el) => {
      const m = document.createComment("morph");
      el.before(m);
      return m;
    });
    ordered.forEach((el, i) => markers[i].replaceWith(el));
    els.forEach((el) => {
      const dy = before.get(el) - el.getBoundingClientRect().top;
      if (dy) el.animate([{ transform: "translateY(" + dy + "px)" }, { transform: "none" }], { duration: 500, easing: "ease-in-out" });
    });
  }

  function pill(title, why) {
    let p = document.getElementById("__morph_pill");
    if (!p) {
      p = document.createElement("div");
      p.id = "__morph_pill";
      p.style.cssText =
        "position:fixed;left:16px;bottom:16px;z-index:2147483647;max-width:280px;background:#16161d;color:#f4f4f5;font:13px system-ui,sans-serif;border:1px solid #333;border-radius:14px;padding:10px 14px;box-shadow:0 8px 30px rgba(0,0,0,.4)";
      document.documentElement.appendChild(p);
    }
    p.textContent = "";
    const t = document.createElement("div");
    t.style.fontWeight = "600";
    t.textContent = title;
    const w = document.createElement("div");
    w.style.cssText = "margin-top:4px;color:#a1a1aa";
    w.textContent = why;
    const b = document.createElement("button");
    b.textContent = "Show original";
    b.style.cssText = "margin-top:8px;background:#2a2a35;color:#f4f4f5;border:0;border-radius:999px;padding:4px 10px;cursor:pointer";
    b.onclick = () => window.__morph.reset();
    p.append(t, w, b);
  }

  function apply(persona, plan) {
    if (!state) return "Run again.";
    plan = plan || local(persona);
    const n = state.original.length;
    const seen = new Set([0]);
    const order = [0];
    for (const x of plan.order || []) {
      if (Number.isInteger(x) && x >= 0 && x < n && !seen.has(x)) {
        seen.add(x);
        order.push(x);
      }
    }
    for (let i = 0; i < n; i++) if (!seen.has(i)) order.push(i);
    const dim = new Set((plan.dim || []).filter((x) => x !== 0));

    reorder(order.map((i) => state.original[i]));
    state.original.forEach((el, i) => {
      el.style.transition = "opacity .4s";
      el.style.opacity = dim.has(i) ? "0.35" : "1";
      el.style.boxShadow = "";
    });
    order
      .slice(1)
      .filter((i) => !dim.has(i))
      .slice(0, 2)
      .forEach((i) => {
        state.original[i].style.boxShadow = "inset 4px 0 0 #7c5cff";
      });
    pill("MORPH · " + persona + " · " + (plan.source || "keywords"), plan.reasoning || "");
    return "Rearranged " + n + " sections for " + persona + " (" + (plan.source || "keywords") + ").";
  }

  function reset() {
    if (!state) return "Nothing to restore.";
    reorder(state.original);
    state.original.forEach((el) => {
      el.style.opacity = "";
      el.style.boxShadow = "";
    });
    const p = document.getElementById("__morph_pill");
    if (p) p.remove();
    return "Original restored.";
  }

  window.__morph = { collect, apply, reset };
})();
