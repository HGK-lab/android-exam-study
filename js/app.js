(function () {
  const { esc, topicBody, cheatsheet } = window.Render;
  const { topics, questions } = window.STUDY;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ── 저장소: 막혀 있어도 앱은 동작해야 함 ── */
  const KEY = "android-exam-study.v1";
  const empty = () => ({ drafts: {}, status: {}, checks: {}, theme: null, tab: "notes" });
  let state = empty();
  try { state = Object.assign(empty(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };

  /* ── 테마 ── */
  function applyTheme() {
    if (state.theme) document.documentElement.dataset.theme = state.theme;
    else delete document.documentElement.dataset.theme;
  }
  $("#theme").addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    state.theme = dark ? "light" : "dark";
    applyTheme(); save();
  });
  applyTheme();

  /* ── 탭 ── */
  function showTab(name) {
    state.tab = name; save();
    $$(".tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === name)));
    $$(".panel").forEach((p) => (p.hidden = p.id !== "panel-" + name));
    window.scrollTo({ top: 0 });
  }
  $$(".tab").forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));

  /* ── 요약 노트 ── */
  const topicTitle = (id) => topics.find((t) => t.id === id).title;
  function renderNotes() {
    $("#notes-list").innerHTML = topics
      .map(
        (t, i) => `
      <details class="card" data-topic="${t.id}" ${i === 0 ? "open" : ""}>
        <summary><div><h3>${i + 1}. ${t.title}</h3><div class="src">${t.source}</div></div><span class="chev">▶</span></summary>
        <div class="card-body">${topicBody(t)}</div>
      </details>`
      )
      .join("");
  }
  $("#expand").addEventListener("click", () => $$("#notes-list details").forEach((d) => (d.open = true)));
  $("#collapse").addEventListener("click", () => $$("#notes-list details").forEach((d) => (d.open = false)));
  $("#search").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    $$("#notes-list details").forEach((d) => {
      const hit = !q || d.textContent.toLowerCase().includes(q);
      d.hidden = !hit;
      if (q && hit) d.open = true;
    });
  });

  /* ── 서술형 ── */
  const view = { topic: "all", filter: "all", order: questions.map((q) => q.id) };
  const qById = Object.fromEntries(questions.map((q) => [q.id, q]));

  function fillTopicSelect() {
    $("#q-topic").innerHTML =
      `<option value="all">전체 주제</option>` +
      topics.map((t, i) => `<option value="${t.id}">${i + 1}. ${esc(t.title)}</option>`).join("");
  }

  function visibleIds() {
    return view.order.filter((id) => {
      const q = qById[id];
      if (view.topic !== "all" && q.topic !== view.topic) return false;
      const s = state.status[id];
      if (view.filter === "todo") return !s;
      if (view.filter === "bad") return s === "bad";
      if (view.filter === "ok") return s === "ok";
      return true;
    });
  }

  function updateStats() {
    const total = questions.length;
    const ok = questions.filter((q) => state.status[q.id] === "ok").length;
    const bad = questions.filter((q) => state.status[q.id] === "bad").length;
    $("#stats").textContent = `이해 ${ok} · 헷갈림 ${bad} · 남음 ${total - ok - bad} / ${total}`;
  }

  function badge(id) {
    const s = state.status[id];
    return s === "ok" ? `<span class="badge ok">이해함</span>` : s === "bad" ? `<span class="badge bad">헷갈림</span>` : "";
  }

  function renderQuestions() {
    const ids = visibleIds();
    updateStats();
    if (!ids.length) {
      $("#q-list").innerHTML = `<div class="empty">조건에 맞는 문제가 없어요.</div>`;
      return;
    }
    $("#q-list").innerHTML = ids
      .map((id) => {
        const q = qById[id];
        const n = questions.indexOf(q) + 1;
        const checks = state.checks[id] || [];
        const open = openAnswers.has(id);
        return `
      <article class="card q" data-id="${id}">
        <div class="q-head"><span class="q-num">Q${n} · ${esc(topicTitle(q.topic).split(" — ")[0].split(" · ")[0])}</span><span class="badge-slot">${badge(id)}</span></div>
        <div class="q-text">${esc(q.q)}</div>
        <textarea placeholder="여기에 내 답안을 직접 써 보세요 (이 브라우저에만 저장돼요)" data-draft="${id}">${esc(state.drafts[id] || "")}</textarea>
        <div class="q-actions">
          <button class="btn primary" data-act="toggle">${open ? "모범답안 숨기기" : "모범답안 보기"}</button>
        </div>
        ${
          open
            ? `<div class="answer">
          <h5>채점 포인트 — 내 답에 들어 있으면 체크</h5>
          <ul class="checks">${q.points
            .map((p, i) => `<li><label><input type="checkbox" data-chk="${i}" ${checks[i] ? "checked" : ""}> <span>${esc(p)}</span></label></li>`)
            .join("")}</ul>
          <h5 style="margin-top:12px">모범답안</h5>
          <div class="model">${esc(q.answer)}</div>
          <div class="q-actions">
            <button class="btn ok ${state.status[id] === "ok" ? "on" : ""}" data-act="ok">이해했어요</button>
            <button class="btn bad ${state.status[id] === "bad" ? "on" : ""}" data-act="bad">헷갈려요</button>
          </div>
        </div>`
            : ""
        }
      </article>`;
      })
      .join("");
  }

  const openAnswers = new Set();
  $("#q-list").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const card = btn.closest(".q");
    const id = card.dataset.id;
    const act = btn.dataset.act;
    if (act === "toggle") {
      openAnswers.has(id) ? openAnswers.delete(id) : openAnswers.add(id);
      renderQuestions();
      return;
    }
    state.status[id] = state.status[id] === act ? undefined : act;
    if (!state.status[id]) delete state.status[id];
    save();
    renderQuestions();
  });
  $("#q-list").addEventListener("input", (e) => {
    const id = e.target.dataset.draft;
    if (!id) return;
    state.drafts[id] = e.target.value;
    save();
  });
  $("#q-list").addEventListener("change", (e) => {
    if (e.target.dataset.chk === undefined) return;
    const id = e.target.closest(".q").dataset.id;
    const arr = state.checks[id] || [];
    arr[Number(e.target.dataset.chk)] = e.target.checked;
    state.checks[id] = arr;
    save();
  });

  $("#q-topic").addEventListener("change", (e) => { view.topic = e.target.value; renderQuestions(); });
  $$("[data-filter]").forEach((b) =>
    b.addEventListener("click", () => {
      view.filter = b.dataset.filter;
      $$("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      renderQuestions();
    })
  );
  $("#shuffle").addEventListener("click", () => {
    const a = view.order.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    view.order = a;
    renderQuestions();
  });
  $("#reset").addEventListener("click", () => {
    if (!confirm("진행 상황과 작성한 답안을 모두 지울까요?")) return;
    state = Object.assign(empty(), { theme: state.theme, tab: state.tab });
    openAnswers.clear();
    save();
    renderQuestions();
  });

  /* ── 치트시트 ── */
  $("#cheat-list").innerHTML = cheatsheet();

  /* ── 시작 ── */
  renderNotes();
  fillTopicSelect();
  renderQuestions();
  showTab(["notes", "quiz", "cheat"].includes(state.tab) ? state.tab : "notes");
})();
