(function () {
  const { esc, topicBody, cheatsheet } = window.Render;
  const { topics, questions } = window.STUDY;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const narrow = matchMedia("(max-width: 640px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 저장소: 막혀 있어도 앱은 동작해야 함 ── */
  const KEY = "android-exam-study.v1";
  const empty = () => ({ drafts: {}, status: {}, checks: {}, theme: null, tab: "notes", qmode: null, qidx: 0 });
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

  /* ── 상단 고정 영역 높이 → 주제 바로가기·스크롤 위치 계산에 씀 ── */
  const topH = () => $(".top").offsetHeight;
  const setTopH = () => document.documentElement.style.setProperty("--top-h", topH() + "px");
  window.addEventListener("resize", setTopH);

  /* ── 탭 ── */
  function showTab(name) {
    state.tab = name; save();
    $$(".tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.tab === name)));
    $$(".panel").forEach((p) => (p.hidden = p.id !== "panel-" + name));
    window.scrollTo({ top: 0 });
    if (name === "notes") markTopic();
  }
  $$(".tab").forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));

  /* ── 요약 노트 ── */
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
    $("#topic-nav").innerHTML = topics
      .map((t, i) => `<button type="button" data-goto="${t.id}"><span class="n">${i + 1}</span>${esc(t.short)}</button>`)
      .join("");
  }
  $("#topic-nav").addEventListener("click", (e) => {
    const b = e.target.closest("[data-goto]");
    if (!b) return;
    const d = $(`#notes-list details[data-topic="${b.dataset.goto}"]`);
    d.hidden = false;
    d.open = true;
    d.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });
  /* 화면 위쪽에 걸린 주제를 바로가기에서 강조하고, 가로 스크롤 안에 보이게 맞춤 */
  function markTopic() {
    if ($("#panel-notes").hidden) return;
    const off = topH() + 64;
    const shown = $$("#notes-list details:not([hidden])");
    let cur = shown.length ? shown[0].dataset.topic : null;
    shown.forEach((d) => { if (d.getBoundingClientRect().top <= off) cur = d.dataset.topic; });
    const nav = $("#topic-nav");
    $$("[data-goto]", nav).forEach((b) => b.classList.toggle("on", b.dataset.goto === cur));
    const on = $(".on", nav);
    if (!on) return;
    const l = on.offsetLeft, r = l + on.offsetWidth;
    if (l < nav.scrollLeft) nav.scrollLeft = l - 12;
    else if (r > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = r - nav.clientWidth + 12;
  }
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; markTopic(); });
  }, { passive: true });

  $("#expand").addEventListener("click", () => $$("#notes-list details").forEach((d) => (d.open = true)));
  $("#collapse").addEventListener("click", () => $$("#notes-list details").forEach((d) => (d.open = false)));
  $("#search").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    $$("#notes-list details").forEach((d) => {
      const hit = !q || d.textContent.toLowerCase().includes(q);
      d.hidden = !hit;
      if (q && hit) d.open = true;
    });
    markTopic();
  });

  /* ── 생명주기 시뮬레이터: 흐름도(넓은 화면용·폰용 둘 다)의 data-fn 노드를 호출 순서대로 켠다 ── */
  function setupSim() {
    const host = $(".lc-sim");
    if (!host) return;
    const fig = host.closest("figure");
    const nodes = (sel = "") => $$(`svg.lc [data-fn]${sel}`, fig);
    const STATES = {
      none: "실행 전",
      running: "활성(running) — 맨 앞에 보이고 입력 가능",
      paused: "중지(paused) — 일부 보이지만 입력 불가",
      stopped: "정지(stopped) — 안 보이지만 상태는 메모리에 남음",
      destroyed: "소멸 — 다시 실행하면 onCreate부터",
      killed: "프로세스 종료됨 — 돌아오면 onCreate부터 다시",
    };
    const NODE = { none: "launched", running: "running", destroyed: "destroyed", killed: "killed" };
    const ACTIONS = [
      { label: "앱 실행", from: ["none", "destroyed"], calls: () => ["onCreate", "onStart", "onResume"], to: "running" },
      { label: "팝업이 일부를 가림 [보충]", from: ["running"], calls: () => ["onPause"], to: "paused" },
      { label: "팝업 닫기", from: ["paused"], calls: () => ["onResume"], to: "running" },
      { label: "홈 버튼", from: ["running"], calls: () => ["onPause", "onStop"], to: "stopped" },
      {
        label: "앱으로 돌아오기",
        from: ["stopped", "killed"],
        calls: (s) => (s === "killed" ? ["onCreate", "onStart", "onResume"] : ["onRestart", "onStart", "onResume"]),
        to: "running",
      },
      { label: "메모리 부족으로 종료", from: ["stopped"], calls: () => [], to: "killed" },
      { label: "뒤로 가기 (finish)", from: ["running"], calls: () => ["onPause", "onStop", "onDestroy"], to: "destroyed" },
    ];
    let cur = "none";
    let timers = [];

    host.innerHTML = `
      <div class="sim-head"><b>직접 눌러 보기</b><span class="sim-state"></span></div>
      <div class="sim-btns">${ACTIONS.map((a, i) => `<button type="button" class="chip" data-sim="${i}">${a.label}</button>`).join("")}
        <button type="button" class="chip" data-sim="reset">처음부터</button></div>
      <div class="sim-log" aria-live="polite"></div>`;

    function paint() {
      $(".sim-state", host).textContent = "현재 상태: " + STATES[cur];
      $$("[data-sim]", host).forEach((b) => {
        if (b.dataset.sim !== "reset") b.disabled = !ACTIONS[b.dataset.sim].from.includes(cur);
      });
      nodes().forEach((g) => g.classList.toggle("now", g.dataset.fn === NODE[cur]));
    }
    function run(i) {
      timers.forEach(clearTimeout);
      timers = [];
      const a = ACTIONS[i];
      const calls = a.calls(cur);
      nodes().forEach((g) => g.classList.remove("lit"));
      const log = $(".sim-log", host);
      log.innerHTML = `<span class="sim-act">${esc(a.label)}</span> ` + (calls.length ? "" : `<span class="sim-none">콜백 없이 프로세스가 제거될 수 있음</span>`);
      cur = a.to;
      paint();
      calls.forEach((fn, k) => {
        const step = () => {
          nodes(`[data-fn="${fn}"]`).forEach((g) => g.classList.add("lit"));
          log.insertAdjacentHTML("beforeend", `${k ? "→ " : ""}<code>${fn}()</code> `);
        };
        reduce ? step() : timers.push(setTimeout(step, 450 * (k + 1)));
      });
    }
    host.addEventListener("click", (e) => {
      const b = e.target.closest("[data-sim]");
      if (!b) return;
      if (b.dataset.sim === "reset") {
        timers.forEach(clearTimeout);
        cur = "none";
        nodes().forEach((g) => g.classList.remove("lit"));
        $(".sim-log", host).innerHTML = "";
        paint();
        return;
      }
      run(Number(b.dataset.sim));
    });
    paint();
  }

  /* ── 서술형 ── */
  const view = { topic: "all", filter: "all", order: questions.map((q) => q.id) };
  const qById = Object.fromEntries(questions.map((q) => [q.id, q]));
  const openAnswers = new Set();
  const openDrafts = new Set();
  const mode = () => state.qmode || (narrow.matches ? "card" : "list");

  function fillTopicSelect() {
    $("#q-topic").innerHTML =
      `<option value="all">전체 주제</option>` +
      topics.map((t, i) => `<option value="${t.id}">${i + 1}. ${esc(t.short)}</option>`).join("");
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

  function cardHtml(id) {
    const q = qById[id];
    const n = questions.indexOf(q) + 1;
    const checks = state.checks[id] || [];
    const open = openAnswers.has(id);
    const draftOpen = openDrafts.has(id) || !!state.drafts[id] || !narrow.matches;
    return `
      <article class="card q" data-id="${id}">
        <div class="q-head"><span class="q-num">Q${n} · ${esc(topics.find((t) => t.id === q.topic).short)}</span><span class="badge-slot">${badge(id)}</span></div>
        <div class="q-text">${esc(q.q)}</div>
        ${q.code ? `<pre class="q-code"><code>${esc(q.code)}</code></pre>` : ""}
        <details class="draft" ${draftOpen ? "open" : ""}><summary>내 답 써보기</summary>
          <textarea placeholder="여기에 내 답안을 직접 써 보세요 (이 브라우저에만 저장돼요)" data-draft="${id}">${esc(state.drafts[id] || "")}</textarea>
        </details>
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
          <div class="q-actions grade">
            <button class="btn ok ${state.status[id] === "ok" ? "on" : ""}" data-act="ok">이해했어요</button>
            <button class="btn bad ${state.status[id] === "bad" ? "on" : ""}" data-act="bad">헷갈려요</button>
          </div>
        </div>`
            : ""
        }
      </article>`;
  }

  function renderQuestions() {
    const ids = visibleIds();
    updateStats();
    $$("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode())));
    if (!ids.length) {
      $("#q-list").innerHTML = `<div class="empty">조건에 맞는 문제가 없어요.</div>`;
      return;
    }
    if (mode() === "list") {
      $("#q-list").innerHTML = ids.map(cardHtml).join("");
      return;
    }
    const i = (state.qidx = Math.min(Math.max(state.qidx || 0, 0), ids.length - 1));
    $("#q-list").innerHTML =
      `<div class="qprog" aria-hidden="true"><i style="width:${((i + 1) / ids.length) * 100}%"></i></div>` +
      cardHtml(ids[i]) +
      `<div class="qnav">
        <button class="btn" data-nav="-1" ${i === 0 ? "disabled" : ""}>◀ 이전</button>
        <span class="pos">${i + 1} / ${ids.length}</span>
        <button class="btn" data-nav="1" ${i === ids.length - 1 ? "disabled" : ""}>다음 ▶</button>
      </div>`;
  }

  function go(delta) {
    const ids = visibleIds();
    const next = Math.min(Math.max((state.qidx || 0) + delta, 0), ids.length - 1);
    if (next === state.qidx) return;
    state.qidx = next;
    save();
    renderQuestions();
    window.scrollTo({ top: 0 });
  }

  $("#q-list").addEventListener("click", (e) => {
    const nav = e.target.closest("[data-nav]");
    if (nav) return go(Number(nav.dataset.nav));
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const id = btn.closest(".q").dataset.id;
    const act = btn.dataset.act;
    if (act === "toggle") {
      openAnswers.has(id) ? openAnswers.delete(id) : openAnswers.add(id);
      renderQuestions();
      return;
    }
    const marking = state.status[id] !== act;
    if (marking) state.status[id] = act;
    else delete state.status[id];
    save();
    renderQuestions();
    /* 카드 모드: 채점하면 잠깐 보여 준 뒤 다음 문제로. 필터에서 빠진 문제면 같은 자리에 다음 문제가 이미 와 있음 */
    if (mode() === "card" && marking) {
      setTimeout(() => {
        const ids = visibleIds();
        const at = ids.indexOf(id);
        if (at >= 0 && at < ids.length - 1) state.qidx = at + 1;
        save();
        renderQuestions();
        window.scrollTo({ top: 0 });
      }, reduce ? 0 : 350);
    }
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
  /* toggle 이벤트는 버블링되지 않아서 캡처로 받음 */
  $("#q-list").addEventListener("toggle", (e) => {
    if (!e.target.classList.contains("draft")) return;
    const id = e.target.closest(".q").dataset.id;
    e.target.open ? openDrafts.add(id) : openDrafts.delete(id);
  }, true);

  /* 카드 모드 넘기기: 좌우 스와이프, 방향키 */
  let sx = 0, sy = 0, st = 0;
  $("#q-list").addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    sx = t.clientX; sy = t.clientY; st = Date.now();
  }, { passive: true });
  $("#q-list").addEventListener("touchend", (e) => {
    if (mode() !== "card" || e.target.closest("textarea, pre, input")) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dy) < 50 && Date.now() - st < 700) go(dx < 0 ? 1 : -1);
  }, { passive: true });
  document.addEventListener("keydown", (e) => {
    if (mode() !== "card" || $("#panel-quiz").hidden) return;
    if (e.target.closest("textarea, input, select")) return;
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  });

  $$("[data-mode]").forEach((b) => b.addEventListener("click", () => {
    state.qmode = b.dataset.mode;
    save();
    renderQuestions();
  }));
  $("#q-topic").addEventListener("change", (e) => { view.topic = e.target.value; state.qidx = 0; renderQuestions(); });
  $$("[data-filter]").forEach((b) =>
    b.addEventListener("click", () => {
      view.filter = b.dataset.filter;
      state.qidx = 0;
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
    state.qidx = 0;
    renderQuestions();
  });
  $("#reset").addEventListener("click", () => {
    if (!confirm("진행 상황과 작성한 답안을 모두 지울까요?")) return;
    state = Object.assign(empty(), { theme: state.theme, tab: state.tab, qmode: state.qmode });
    openAnswers.clear();
    openDrafts.clear();
    save();
    renderQuestions();
  });

  /* ── 치트시트 ── */
  $("#cheat-list").innerHTML = cheatsheet();

  /* ── 오프라인 캐시 (https에서만; 파일로 열 때는 건너뜀) ── */
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  /* ── 시작 ── */
  renderNotes();
  setupSim();
  fillTopicSelect();
  renderQuestions();
  setTopH();
  showTab(["notes", "quiz", "cheat"].includes(state.tab) ? state.tab : "notes");
})();
