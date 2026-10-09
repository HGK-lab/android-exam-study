/* 웹앱(index.html)과 PDF용 페이지(print.html)가 함께 쓰는 렌더러 */
(function () {
  const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");


  function table(head, rows) {
    return (
      `<div class="tbl-wrap"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>` +
      rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("") +
      `</tbody></table></div>`
    );
  }

  function block(b) {
    switch (b.t) {
      case "h":
        return `<h4>${b.text}</h4>`;
      case "list":
        return `<ul>${b.items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
      case "steps":
        return `<ol class="steps">${b.items.map((i) => `<li>${i}</li>`).join("")}</ol>`;
      case "table":
        return table(b.head, b.rows);
      case "tip":
        return `<div class="tip">${b.html}</div>`;
      case "fig":
        return (
          `<figure class="diagram"><div class="fig-scroll">${window.Diagrams[b.id]()}</div>` +
          `<figcaption>${b.cap}</figcaption>` +
          (b.id === "lifecycle" ? `<div class="lc-sim"></div>` : "") +
          `</figure>`
        );
      case "code": {
        let h = `<div class="codeblock"><div class="code-title">${esc(b.title || "")}<span>${esc(b.lang || "")}</span></div><pre><code>${esc(b.code)}</code></pre>`;
        if (b.notes && b.notes.length) {
          h +=
            `<dl class="notes">` +
            b.notes.map(([k, v]) => `<div><dt><code>${esc(k)}</code></dt><dd>${v}</dd></div>`).join("") +
            `</dl>`;
        }
        return h + `</div>`;
      }
      default:
        return "";
    }
  }

  function topicBody(topic) {
    return topic.blocks.map(block).join("");
  }

  function cheatsheet() {
    return window.STUDY.cheatsheet
      .map((c) => `<section class="cheat"><h4>${c.title}</h4>${table(c.table.head, c.table.rows)}</section>`)
      .join("");
  }

  window.Render = { esc, block, topicBody, table, cheatsheet };
})();
