const API = "https://morph-inky.vercel.app";
const out = document.getElementById("out");

async function run(persona) {
  out.textContent = "Working...";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const target = { tabId: tab.id };
    await chrome.scripting.executeScript({ target, files: ["morph.js"] });

    if (persona === "reset") {
      const [{ result }] = await chrome.scripting.executeScript({ target, func: () => window.__morph.reset() });
      out.textContent = result;
      return;
    }

    const [{ result: found }] = await chrome.scripting.executeScript({ target, func: () => window.__morph.collect() });
    if (!found) {
      out.textContent = "No sections found on this page.";
      return;
    }

    let plan = null;
    try {
      const res = await fetch(API + "/api/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona, sections: found }),
      });
      const data = await res.json();
      if (data && data.order) plan = { ...data, source: "AI" };
    } catch (e) {}

    const [{ result }] = await chrome.scripting.executeScript({
      target,
      func: (p, pl) => window.__morph.apply(p, pl),
      args: [persona, plan],
    });
    out.textContent = result;
  } catch (e) {
    out.textContent = "Can't run on this page.";
  }
}

document.querySelectorAll("button[data-p]").forEach((b) => (b.onclick = () => run(b.dataset.p)));
