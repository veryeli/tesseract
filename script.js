async function mountJSON(sectionId, url, render) {
  const el = document.querySelector(`[data-mount="${sectionId}"]`);
  if (!el) return;
  const data = await fetch(url, { cache: "no-store" }).then(r => r.json());
  el.innerHTML = render(data);
}

async function mountHTML(sectionId, url) {
  const el = document.querySelector(`[data-mount="${sectionId}"]`);
  if (!el) return;
  const html = await fetch(url, { cache: "no-store" }).then(r => r.text());
  el.innerHTML = html;
}

/* Renderers */
const renderParagraphs = d => `
  <article class="card">
    <h2>${d.title}</h2>
    ${d.paragraphs.map(p => `<p>${p}</p>`).join("")}
  </article>
`;

const renderCards = d => {
    const cards = d.cards || [];
    return cards.map(c => `
    <article class="card">
    <h2>${c.title}</h2>
    ${(c.paragraphs || []).map(p => `<p>${p}</p>`).join("")}
    </article>
    `).join("");
};

const renderPractices = d => `
  <article class="card">
    <h2>${d.title}</h2>
    ${d.paragraphs.map(p => `<p>${p}</p>`).join("")}
  </article>
  </section>
  <section>
  <article class="card">
    <h2>sub‑practices</h2>
    <p>${d.subpractices.map(s => `<strong>${s.name}:</strong> ${s.desc}`).join("<br>")}</p>
  </article>
`;

const renderReadings = d => `
  <article class="card">
    <h2>${d.title}</h2>
    <ul>${d.items.map(i => `<li>${i.author} — <em>${i.work}</em></li>`).join("")}</ul>
  </article>
`;

/* Boot */
document.addEventListener("DOMContentLoaded", () => {
  mountJSON("about", "data/about.json", renderCards);
  mountJSON("enemies", "data/enemies.json", renderParagraphs);
  mountJSON("cosmology", "data/cosmology.json", renderParagraphs);
  mountJSON("practices", "data/practices.json", renderPractices);
  mountJSON("what-is-time", "data/time.json", renderParagraphs);
  mountJSON("readings", "data/readings.json", renderReadings);
});
