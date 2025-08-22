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
 <section id=${d.title} class="grid">
  <article class="card">
    <h2>${d.title}</h2>
    ${d.paragraphs.map(p => `<p>${p}</p>`).join("")}
  </article>
</section>
`;

async function mountMarkdown(sectionId, url) {
  const el = document.querySelector(`[data-mount="${sectionId}"]`);
  if (!el) return;
  const md = await fetch(url, { cache: "no-store" }).then(r => r.text());
  el.innerHTML = marked.parse(md);
}


const renderCards = d => {
    const cards = d.cards || [];
    return cards.map(c => `
      <section id=${c.title} class="grid">
    <article class="card">
    <h2>${c.title}</h2>
    ${(c.paragraphs || []).map(p => `<p>${p}</p>`).join("")}
    </article>
    </section>
    `).join("");
};


/* Boot */
document.addEventListener("DOMContentLoaded", () => {
  mountJSON("about", "data/about.json", renderCards);
});
