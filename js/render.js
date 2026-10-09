/* 웹앱(index.html)과 PDF용 페이지(print.html)가 함께 쓰는 렌더러 */
(function () {
  const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const LIFECYCLE_SVG = `
<svg class="lc" viewBox="0 0 600 610" role="img" aria-label="액티비티 생명주기 흐름도">
  <defs>
    <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" class="lc-arrow-head"/>
    </marker>
  </defs>
  <g class="lc-line">
    <path d="M300 46 V70" marker-end="url(#ah)"/>
    <path d="M300 98 V125" marker-end="url(#ah)"/>
    <path d="M300 153 V180" marker-end="url(#ah)"/>
    <path d="M300 208 V235" marker-end="url(#ah)"/>
    <path d="M300 275 V340" marker-end="url(#ah)"/>
    <path d="M300 368 V420" marker-end="url(#ah)"/>
    <path d="M300 448 V495" marker-end="url(#ah)"/>
    <path d="M300 523 V552" marker-end="url(#ah)"/>
    <path d="M240 354 H90 V276" marker-end="url(#ah)"/>
    <path d="M240 434 H90 V354"/>
    <path d="M90 235 V84 H240" marker-end="url(#ah)"/>
    <path d="M360 354 H420 V194 H360" marker-end="url(#ah)"/>
    <path d="M360 434 H510 V154" marker-end="url(#ah)"/>
    <path d="M450 139 H360" marker-end="url(#ah)"/>
  </g>
  <g class="lc-nodes">
    <ellipse class="lc-blue" cx="300" cy="28" rx="62" ry="18"/>
    <ellipse class="lc-green" cx="300" cy="255" rx="62" ry="20"/>
    <ellipse class="lc-orange" cx="90" cy="255" rx="72" ry="20"/>
    <ellipse class="lc-orange" cx="300" cy="570" rx="62" ry="18"/>
    <rect class="lc-box" x="240" y="70" width="120" height="28" rx="3"/>
    <rect class="lc-box" x="240" y="125" width="120" height="28" rx="3"/>
    <rect class="lc-box" x="240" y="180" width="120" height="28" rx="3"/>
    <rect class="lc-box" x="240" y="340" width="120" height="28" rx="3"/>
    <rect class="lc-box" x="240" y="420" width="120" height="28" rx="3"/>
    <rect class="lc-box" x="240" y="495" width="120" height="28" rx="3"/>
    <rect class="lc-box" x="450" y="125" width="120" height="28" rx="3"/>
  </g>
  <g class="lc-text" text-anchor="middle">
    <text x="300" y="32">액티비티 시작</text>
    <text x="300" y="259">실행 중</text>
    <text x="90" y="259">프로세스 종료됨</text>
    <text x="300" y="574">액티비티 소멸</text>
    <text class="lc-fn" x="300" y="89">onCreate()</text>
    <text class="lc-fn" x="300" y="144">onStart()</text>
    <text class="lc-fn" x="300" y="199">onResume()</text>
    <text class="lc-fn" x="300" y="359">onPause()</text>
    <text class="lc-fn" x="300" y="439">onStop()</text>
    <text class="lc-fn" x="300" y="514">onDestroy()</text>
    <text class="lc-fn" x="510" y="144">onRestart()</text>
  </g>
  <g class="lc-label">
    <text x="308" y="300">다른 액티비티가</text>
    <text x="308" y="314">전면으로 올라옴</text>
    <text x="308" y="388">더 이상 보이지 않음</text>
    <text x="308" y="466">종료(finish)되거나 시스템이 제거</text>
    <text x="428" y="290">사용자가 돌아옴</text>
    <text x="502" y="414" text-anchor="end">사용자가 다시 이동</text>
    <text x="98" y="322">우선순위 높은 앱이</text>
    <text x="98" y="336">메모리를 필요로 함</text>
    <text x="98" y="170">사용자가</text>
    <text x="98" y="184">다시 이동</text>
  </g>
</svg>`;

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
      case "svg":
        return `<figure class="diagram">${LIFECYCLE_SVG}</figure>`;
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
