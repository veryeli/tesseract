// --- utils ---
const slug = (s) =>
  s.toLowerCase().trim()
   .replace(/[^a-z0-9\s-]/g, "")
   .replace(/\s+/g, "-")
   .replace(/-+/g, "-");

// Render one section block
const renderSection = (title, htmlBody) => `
  <section id="${slug(title)}" class="grid">
    <article class="card">
      <h2>${title}</h2>
      ${htmlBody}
    </article>
  </section>
`;

// Fetch .md, split by # Heading, render sections
async function mountMarkdownSections(mountId, mdUrl) {
  const el = document.querySelector(`[data-mount="${mountId}"]`);
  if (!el) return;

  const md = await fetch(mdUrl, { cache: "no-store" }).then(r => r.text());

  // Split by top-level headings: lines starting with "# "
  const parts = md.split(/\n(?=#\s+)/g); // keep first block even if it starts w/o heading
  const sections = [];

  for (const block of parts) {
    // Extract title (first line starting with '# ')
    const m = block.match(/^#\s+(.+)\s*$/m);
    if (!m) {
      // no title -> append to previous (or skip if empty)
      if (sections.length) sections[sections.length - 1].body += "\n" + block;
      continue;
    }
    const title = m[1].trim();
    // Everything after the heading line is the body
    const bodyMd = block.slice(block.indexOf(m[0]) + m[0].length).trim();
    const bodyHtml = marked.parse(bodyMd);
    sections.push({ title, html: bodyHtml });
  }

  el.innerHTML = sections.map(s => renderSection(s.title, s.html)).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  mountMarkdownSections("about", "data/about.md");
});
