const API = "https://morph-inky.vercel.app";
const out = document.getElementById("out");
const buttons = [...document.querySelectorAll("button[data-p]")];

async function run(persona) {
  buttons.forEach((b) => (b.disabled = true));
  buttons.forEach((b) => b.classList.toggle("active", b.dataset.p === persona && persona !== "reset"));
  out.textContent = persona === "reset" ? "Restoring..." : "Reading the page...";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const target = { tabId: tab.id };
    await chrome.scripting.executeScript({ target, files: ["morph.js"] });
    await chrome.scripting.insertCSS({ target, files: ["pill.css"] });

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

    out.textContent = "Asking the AI...";
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
  } finally {
    buttons.forEach((b) => (b.disabled = false));
  }
}

buttons.forEach((b) => (b.onclick = () => run(b.dataset.p)));
