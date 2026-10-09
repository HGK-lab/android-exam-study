/* 개념 그림 (inline SVG). 색은 css/style.css의 .d-* 클래스가 테마 변수로 칠한다.
   marker id는 그림마다 달라야 함 — 접힌 <details> 안의 marker를 다른 그림이 참조하면 화살촉이 사라짐 */
(function () {
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const marker = (id, cls) =>
    `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="${cls}"/></marker>`;

  function svg(name, w, h, label, body, cls = "") {
    return (
      `<svg class="dg ${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">` +
      `<defs>${marker(name + "-m", "d-head")}${marker(name + "-a", "d-head-acc")}${marker(name + "-b", "d-head-bad")}</defs>` +
      body +
      `</svg>`
    );
  }

  /* 그리기 도우미 — n: 그림 이름(marker id 접두사) */
  const t = (x, y, s, cls = "d-t", anchor = "start") =>
    `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${esc(s)}</text>`;
  const lines = (x, y, arr, cls = "d-t", anchor = "start", lh = 16) =>
    arr.map((s, i) => t(x, y + i * lh, s, cls, anchor)).join("");
  const r = (x, y, w, h, cls = "d-box", rx = 6) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" class="${cls}"/>`;
  const arrow = (n, d, kind = "m", extra = "") => {
    const cls = { m: "d-line", a: "d-acc", b: "d-badl" }[kind];
    return `<path d="${d}" class="${cls} ${extra}" marker-end="url(#${n}-${kind})"/>`;
  };
  const both = (n, d, kind = "m") =>
    `<path d="${d}" class="${kind === "a" ? "d-acc" : "d-line"}" marker-start="url(#${n}-${kind})" marker-end="url(#${n}-${kind})"/>`;
  const num = (x, y, k) =>
    `<g class="d-num"><circle cx="${x}" cy="${y}" r="8"/>${t(x, y + 4, String(k), "d-num-t", "middle")}</g>`;
  const btn = (x, y, w, label, h = 22, tcls = "d-mbtn-t") =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" class="d-mbtn"/>` +
    t(x + w / 2, y + h / 2 + 3.5, label, tcls, "middle");
  const phone = (x, y, w, h, title) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" class="d-phone"/>` +
    `<line x1="${x + w / 2 - 14}" y1="${y + 8}" x2="${x + w / 2 + 14}" y2="${y + 8}" class="d-notch"/>` +
    (title ? t(x + w / 2, y - 8, title, "d-t d-b", "middle") : "");

  const D = {};

  /* ── 1. 파일 연결 관계 ── */
  D.files = () => {
    const n = "files";
    const card = (x, w, h, path, name, code) =>
      r(x, 30, w, h, "d-box") +
      t(x + 12, 46, path, "d-s") +
      t(x + 12, 60, name, "d-t d-b") +
      `<line x1="${x}" y1="68" x2="${x + w}" y2="68" class="d-line"/>` +
      lines(x + 12, 86, code, "d-m", "start", 18);
    return svg(
      n, 760, 270,
      "AndroidManifest.xml이 MainActivity를 등록하고, MainActivity가 setContentView로 activity_main.xml을, findViewById로 그 안의 button01을 연결하는 관계도",
      r(16, 109, 178, 18, "d-hl", 3) +
        r(286, 127, 188, 36, "d-hl", 3) +
        r(286, 163, 188, 36, "d-hl2", 3) +
        r(566, 109, 178, 36, "d-hl2", 3) +
        card(10, 190, 160, "manifests/", "AndroidManifest.xml",
          ["<activity", '  android:name=', '  ".MainActivity">', "  <intent-filter>", "   MAIN + LAUNCHER", "  </intent-filter>"]) +
        card(280, 200, 196, "java/패키지/", "MainActivity.java",
          ["class MainActivity", " extends AppCompatActivity {", " onCreate(...) {", "  setContentView(", "   R.layout.activity_main);", "  btn = findViewById(", "   R.id.button01);", " }"]) +
        card(560, 190, 160, "res/layout/", "activity_main.xml",
          ["<ConstraintLayout ...>", " <Button", "  android:id=", '  "@+id/button01"', '  android:text="Clear"/>', "</ConstraintLayout>"]) +
        arrow(n, "M196 118 C238 118 238 82 276 82", "a") +
        t(240, 142, "클래스 등록", "d-s d-acc-t", "middle") +
        arrow(n, "M476 145 C520 145 516 54 556 54", "a") +
        t(516, 40, "화면 연결", "d-s d-acc-t", "middle") +
        arrow(n, "M476 181 C520 181 518 127 556 127", "a") +
        t(521, 206, "id로 위젯 찾기", "d-s d-acc-t", "middle") +
        r(24, 222, 30, 30, "d-soft", 8) +
        `<circle cx="39" cy="237" r="7" class="d-acc-fill"/>` +
        arrow(n, "M39 220 V194", "a") +
        t(64, 234, "앱 아이콘 터치", "d-t") +
        t(64, 252, "→ MAIN + LAUNCHER인 액티비티가 첫 화면", "d-s")
    );
  };

  /* ── 2. width 값 비교 ── */
  D.size = () => {
    const n = "size";
    const col = (x, title, child, dim, note) =>
      t(x + 90, 34, title, "d-m d-b", "middle") +
      r(x, 46, 180, 112, "d-frame", 8) +
      t(x + 8, 62, "부모", "d-s") +
      child +
      dim +
      t(x + 90, 182, note, "d-s", "middle");
    return svg(
      n, 660, 196,
      "layout_width가 match_parent면 부모 너비 전체, wrap_content면 글자 크기만큼, 0dp면 ConstraintLayout의 양쪽 제약 사이를 채우는 것을 비교한 그림",
      col(20, "match_parent",
        r(20, 82, 180, 32, "d-soft", 4) + t(110, 103, "TextView", "d-t", "middle"),
        both(n, "M22 134 H198") + t(110, 150, "부모 너비만큼", "d-s", "middle"),
        "부모 기준으로 꽉 채움") +
      col(240, "wrap_content",
        r(252, 82, 74, 32, "d-soft", 4) + t(289, 103, "Hello", "d-t", "middle"),
        both(n, "M254 134 H324") + t(289, 150, "글자만큼", "d-s", "middle"),
        "내용에 필요한 만큼") +
      col(460, "0dp (match_constraint)",
        r(476, 82, 148, 32, "d-soft", 4) + t(550, 103, "EditText", "d-t", "middle") +
          `<path d="M460 98 H476 M624 98 H640" class="d-acc"/>` +
          `<circle cx="476" cy="98" r="3" class="d-acc-fill"/><circle cx="624" cy="98" r="3" class="d-acc-fill"/>`,
        both(n, "M478 134 H622", "a") + t(550, 150, "양쪽 제약 사이를 채움", "d-s d-acc-t", "middle"),
        "ConstraintLayout 전용")
    );
  };

  /* ── 3. 생명주기 (시뮬레이터가 data-fn으로 강조) ── */
  D.lifecycle = () => {
    const n = "lc";
    const box = (fn, x, y) =>
      `<g data-fn="${fn}">${r(x, y, 120, 28, "lc-box", 3)}${t(x + 60, y + 19, fn + "()", "lc-fn", "middle")}</g>`;
    const oval = (fn, cx, cy, rx, ry, cls, label) =>
      `<g data-fn="${fn}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" class="${cls}"/>${t(cx, cy + 4, label, "lc-state", "middle")}</g>`;
    const P = (d, end = true) => `<path d="${d}" class="d-line"${end ? ` marker-end="url(#${n}-m)"` : ""}/>`;
    return svg(
      n, 600, 600,
      "액티비티 생명주기 흐름도: onCreate, onStart, onResume을 거쳐 실행 중이 되고, onPause, onStop, onDestroy로 소멸한다. onStop 뒤 다시 돌아오면 onRestart, 프로세스가 종료됐다가 돌아오면 onCreate부터 다시 시작한다.",
      P("M300 46 V70") + P("M300 98 V125") + P("M300 153 V180") + P("M300 208 V235") +
        P("M300 275 V340") + P("M300 368 V420") + P("M300 448 V495") + P("M300 523 V552") +
        P("M240 354 H90 V276") + P("M240 434 H90 V354", false) + P("M90 235 V84 H240") +
        P("M360 354 H420 V194 H360") + P("M360 434 H510 V154") + P("M450 139 H360") +
        oval("launched", 300, 28, 62, 18, "lc-blue", "액티비티 시작") +
        oval("running", 300, 255, 62, 20, "lc-green", "실행 중") +
        oval("killed", 90, 255, 72, 20, "lc-orange", "프로세스 종료됨") +
        oval("destroyed", 300, 570, 62, 18, "lc-orange", "액티비티 소멸") +
        box("onCreate", 240, 70) + box("onStart", 240, 125) + box("onResume", 240, 180) +
        box("onPause", 240, 340) + box("onStop", 240, 420) + box("onDestroy", 240, 495) +
        box("onRestart", 450, 125) +
        lines(308, 300, ["다른 액티비티가", "전면으로 올라옴"], "d-s", "start", 14) +
        t(308, 388, "더 이상 보이지 않음", "d-s") +
        t(308, 466, "종료(finish)되거나 시스템이 제거", "d-s") +
        lines(428, 284, ["사용자가", "돌아옴"], "d-s", "start", 14) +
        t(502, 414, "사용자가 다시 이동", "d-s", "end") +
        lines(98, 322, ["우선순위 높은 앱이", "메모리를 필요로 함"], "d-s", "start", 14) +
        lines(98, 170, ["사용자가", "다시 이동"], "d-s", "start", 14),
      "lc"
    );
  };

  /* ── 4. A→B 실행·복귀 호출 순서 ── */
  D.ab = () => {
    const n = "ab";
    const AX = 160, BX = 480, W = 136;
    const steps = [
      ["A", "onPause", 84], ["B", "onCreate", 114], ["B", "onStart", 144], ["B", "onResume", 174], ["A", "onStop", 204],
      ["B", "onPause", 264], ["A", "onRestart", 294], ["A", "onStart", 324], ["A", "onResume", 354], ["B", "onStop", 384], ["B", "onDestroy", 414],
    ];
    let body =
      r(AX - 80, 12, 160, 30, "d-box-a") + t(AX, 32, "A (MainActivity)", "d-t d-b", "middle") +
      r(BX - 80, 12, 160, 30, "d-box-b") + t(BX, 32, "B (SecondActivity)", "d-t d-b", "middle") +
      `<path d="M${AX} 42 V430 M${BX} 42 V430" class="d-line d-dash"/>` +
      t(320, 62, "A에서 B 실행 (startActivity)", "d-s d-b", "middle") +
      `<path d="M20 230 H620" class="d-line d-dash"/>` +
      t(320, 246, "B에서 뒤로 가기 (finish)", "d-s d-b", "middle");
    steps.forEach(([lane, fn, y], i) => {
      const x = lane === "A" ? AX : BX;
      if (i > 0 && i !== 5) {
        const [pl, , py] = steps[i - 1];
        const px = pl === "A" ? AX : BX;
        body += pl === lane
          ? arrow(n, `M${x} ${py + 11} V${y - 12}`)
          : arrow(n, `M${px + (pl === "A" ? W / 2 : -W / 2)} ${py} L${x + (lane === "A" ? W / 2 : -W / 2)} ${y}`);
      }
      body += r(x - W / 2, y - 11, W, 22, lane === "A" ? "d-box-a" : "d-box-b", 4) + t(x, y + 4, `${i + 1}. ${fn}()`, "d-m", "middle");
    });
    body +=
      t(552, 178, "B가 보임", "d-s d-acc-t") + t(84, 208, "A 가려짐", "d-s", "end") +
      t(84, 358, "A 다시 보임", "d-s d-acc-t", "end") + t(552, 418, "B 소멸", "d-s");
    return svg(n, 640, 436, "A에서 B를 실행하면 A.onPause, B.onCreate, B.onStart, B.onResume, A.onStop 순서로, B에서 뒤로 가면 B.onPause, A.onRestart, A.onStart, A.onResume, B.onStop, B.onDestroy 순서로 호출된다", body);
  };

  /* ── 5. 실습 2 화면과 제약 ── */
  D.ex2 = () => {
    const n = "ex2";
    const legend = [
      ["editText01  Start·End → parent", "양옆에 붙이고 width 0dp → 가로로 꽉 참"],
      ['editText01  Top_toTopOf="parent"', "화면 위쪽에 붙임 (margin 16dp)"],
      ['button01  Top_toBottomOf="@+id/editText01"', "입력란 바로 아래 — Clear"],
      ['button02  Top_toBottomOf="@+id/button01"', "Clear 버튼 아래 — Close"],
      ['button01·02  Start_toStartOf="parent"', "둘 다 왼쪽 정렬, 크기는 wrap_content"],
    ];
    let body =
      phone(30, 26, 220, 282, "실습 2 실행 화면") +
      r(46, 54, 188, 28, "d-field", 3) + t(54, 73, "text type", "d-s") +
      btn(46, 98, 60, "Clear", 24) + btn(46, 138, 60, "Close", 24) +
      `<path d="M30 68 H46 M234 68 H250 M30 110 H46 M30 150 H46" class="d-acc"/>` +
      arrow(n, "M190 42 V52", "a") + arrow(n, "M76 84 V96", "a") + arrow(n, "M76 124 V136", "a") +
      num(38, 92, 1) + num(204, 46, 2) + num(118, 110, 3) + num(118, 150, 4) + num(38, 176, 5);
    legend.forEach(([code, desc], i) => {
      const y = 66 + i * 50;
      body += num(290, y - 4, i + 1) + t(304, y, code, "d-m") + t(304, y + 17, desc, "d-s");
    });
    return svg(n, 640, 316, "실습 2 화면에서 EditText는 양옆과 위를 parent에 붙이고, Clear 버튼은 EditText 아래, Close 버튼은 Clear 아래에 붙는 제약 관계", body);
  };

  /* ── 6. 클릭 이벤트 흐름 ── */
  D.click = () => {
    const n = "click";
    return svg(
      n, 700, 252,
      "등록된 버튼을 클릭하면 onClick이 호출되고 getId로 button01이면 setText, button02면 finish를 실행한다. 등록하지 않은 View는 onClick이 불리지 않는다",
      r(10, 70, 120, 56) + lines(70, 94, ["사용자가", "Clear 버튼 클릭"], "d-t", "middle") +
        arrow(n, "M130 98 H212", "a") + t(171, 88, "등록돼 있으면", "d-s d-acc-t", "middle") + t(171, 116, "리스너에 통지", "d-s d-acc-t", "middle") +
        r(214, 70, 142, 56, "d-soft") + t(285, 94, "onClick(View v)", "d-m d-b", "middle") + t(285, 112, "콜백 자동 호출", "d-s", "middle") +
        arrow(n, "M356 98 H408", "a") +
        r(410, 70, 112, 56) + t(466, 94, "v.getId()", "d-m d-b", "middle") + t(466, 112, "어느 버튼?", "d-s", "middle") +
        arrow(n, "M522 88 H546 V45 H566") + arrow(n, "M522 108 H546 V153 H566") +
        r(568, 14, 124, 62, "d-box-a") + lines(578, 32, ["== R.id.button01", 'setText("")'], "d-m", "start", 17) + t(578, 68, "→ 입력란 비움", "d-s") +
        r(568, 122, 124, 62, "d-box-b") + lines(578, 140, ["== R.id.button02", "finish()"], "d-m", "start", 17) + t(578, 176, "→ 액티비티 종료", "d-s") +
        r(10, 196, 120, 44, "d-box d-faded") + lines(70, 214, ["등록 안 한 View", "클릭"], "d-s", "middle", 15) +
        arrow(n, "M130 218 H212", "b", "d-dash") + t(220, 222, "통지 없음 → onClick 안 불림", "d-s d-bad-t")
    );
  };

  /* ── 7. 인텐트로 화면 전환 + 액티비티 스택 ── */
  D.intent = () => {
    const n = "intent";
    const stack = (cx, cards, label) => {
      let s = `<path d="M${cx - 60} 268 V350 H${cx + 60} V268" class="d-line"/>`;
      cards.forEach(([txt, cls], i) => {
        const y = 314 - i * 34;
        s += r(cx - 54, y, 108, 30, cls, 4) + t(cx, y + 20, txt, cls.includes("d-ghost") ? "d-s" : "d-t", "middle");
      });
      return s + t(cx, 370, label, "d-s", "middle");
    };
    return svg(
      n, 700, 380,
      "MainActivity가 Intent와 startActivity로 SecondActivity를 실행하면 스택 맨 위에 쌓이고, finish로 SecondActivity를 꺼내면 MainActivity가 다시 보인다",
      phone(40, 30, 150, 190, "MainActivity") + btn(52, 52, 126, "Start Activity", 24) +
        phone(510, 30, 150, 190, "SecondActivity") + btn(555, 113, 60, "Close", 24) +
        arrow(n, "M196 76 H504", "a") +
        t(350, 52, "① new Intent(현재, 대상.class)", "d-s d-acc-t", "middle") +
        t(350, 68, "MainActivity.this → SecondActivity.class", "d-m", "middle") +
        t(350, 94, "② startActivity(intent)", "d-s d-acc-t", "middle") +
        t(350, 130, "※ Manifest에 등록된 액티비티만 실행 가능", "d-s d-bad-t", "middle") +
        arrow(n, "M504 170 H196") + t(350, 190, "③ finish() → 이전 화면으로", "d-s", "middle") +
        t(20, 252, "액티비티 스택", "d-t d-b") +
        stack(130, [["Main", "d-box-a"]], "Main이 맨 위 → 보임") +
        arrow(n, "M196 312 H284", "a") + t(240, 302, "startActivity", "d-s", "middle") +
        stack(350, [["Main", "d-box-a"], ["Second", "d-box-b"]], "Second가 맨 위 → 보임") +
        arrow(n, "M416 312 H504") + t(460, 302, "finish()", "d-s", "middle") +
        stack(570, [["Main", "d-box-a"], ["Second (꺼냄)", "d-ghost"]], "Main이 다시 맨 위")
    );
  };

  /* ── 8. putExtra로 데이터 전달 ── */
  D.extra = () => {
    const n = "extra";
    return svg(
      n, 760, 290,
      "MainActivity가 putExtra로 key01과 value\\nData를 Intent에 담아 보내고, SecondActivity가 getIntent와 getStringExtra로 꺼내 회색 TextView에 두 줄로 표시한다",
      phone(20, 30, 150, 240, "MainActivity") +
        t(32, 66, "Intent", "d-t d-b d-big") +
        btn(27, 80, 104, "Start SecondActivity", 22, "d-mbtn-t d-xs") + btn(134, 80, 32, "Close", 22, "d-mbtn-t d-xs") +
        arrow(n, "M172 100 H278", "a") +
        t(225, 90, "① putExtra(키, 값)", "d-s d-acc-t", "middle") + t(225, 118, "② startActivity()", "d-s d-acc-t", "middle") +
        r(280, 70, 200, 150, "d-soft", 10) +
        t(292, 92, "Intent intent01", "d-m d-b") +
        t(292, 112, "대상: SecondActivity.class", "d-s") +
        r(292, 122, 176, 50, "d-box", 4) + `<path d="M292 140 H468 M346 122 V172" class="d-line"/>` +
        t(319, 136, "키", "d-s", "middle") + t(407, 136, "값", "d-s", "middle") +
        t(319, 161, '"key01"', "d-m", "middle") + t(407, 161, '"value\\nData"', "d-m d-b", "middle") +
        t(380, 200, "(키, 값) 쌍으로 실려 감", "d-s", "middle") +
        arrow(n, "M470 158 H588", "a") +
        t(529, 148, "③ getIntent()", "d-s d-acc-t", "middle") + t(529, 176, "④ getStringExtra(키)", "d-s d-acc-t", "middle") +
        phone(590, 30, 150, 240, "SecondActivity") +
        t(600, 64, "전달된 값 출력", "d-s") +
        r(598, 74, 134, 156, "d-gray", 2) +
        lines(606, 96, ["value", "Data"], "d-gray-t", "start", 20) +
        btn(645, 238, 40, "Button")
    );
  };

  /* ── 9. 한 방향(실습 4) vs 왕복(실습 5) ── */
  D.ret = () => {
    const n = "ret";
    const node = (x, y, h, cls, title, sub) =>
      r(x, y, 160, h, cls) + t(x + 80, y + 22, title, "d-t d-b", "middle") + lines(x + 80, y + 40, sub, "d-s", "middle", 15);
    return svg(
      n, 700, 300,
      "실습 4는 MainActivity가 SecondActivity로 값을 보내기만 하고, 실습 5는 SecondActivity가 종료되면서 값을 MainActivity로 되돌려 주는 왕복 구조",
      t(20, 24, "실습 4 · 한 방향", "d-t d-b") +
        node(60, 36, 60, "d-box-a", "MainActivity", ["putExtra로 값 담음"]) +
        node(480, 36, 60, "d-box-b", "SecondActivity", ["getStringExtra로 받음"]) +
        arrow(n, "M220 56 H476", "a") + t(348, 48, "값을 보내며 실행", "d-s d-acc-t", "middle") +
        arrow(n, "M478 82 H224", "m", "d-dash") + t(348, 104, "finish() — 돌려주는 값 없음", "d-s", "middle") +
        t(20, 146, "실습 5 · 왕복 (결과 리턴)", "d-t d-b") +
        node(60, 160, 74, "d-box-a", "MainActivity", ["EditText: data sample", "Result: ← 여기에 표시"]) +
        node(480, 160, 74, "d-box-b", "SecondActivity", ["EditText에서 수정", "data sample - return data"]) +
        arrow(n, "M220 180 H476", "a") + t(348, 172, "① 입력값을 보내며 실행", "d-s d-acc-t", "middle") +
        arrow(n, "M478 216 H224", "a") + t(348, 236, "② 종료하면서 결과를 돌려줌", "d-s d-acc-t", "middle") +
        t(348, 284, "돌려받는 코드(ActivityResultLauncher · setResult)는 시험 범위 밖", "d-s", "middle")
    );
  };

  /* ── 10. LinearLayout 방향 + 실습 5 중첩 구조 ── */
  D.linear = () => {
    const n = "linear";
    const kid = (x, y, w, h, k, cls = "d-box-a") => r(x, y, w, h, cls, 4) + t(x + w / 2, y + h / 2 + 4, String(k), "d-t d-b", "middle");
    const tag = (y, k, l1, l2) =>
      `<path d="M626 ${y} H642" class="d-line"/>` + num(652, y, k) + t(664, y + 4, l1, "d-s d-b") + (l2 ? t(664, y + 18, l2, "d-s") : "");
    return svg(
      n, 800, 366,
      "vertical은 위에서 아래로, horizontal은 왼쪽에서 오른쪽으로 쌓인다. 실습 5 화면은 세로 LinearLayout 안에 가로 LinearLayout을 넣은 중첩 구조",
      t(20, 26, "orientation", "d-m d-b") +
        r(20, 40, 120, 142, "d-frame", 6) + kid(32, 50, 96, 34, 1) + kid(32, 92, 96, 34, 2) + kid(32, 134, 96, 34, 3) +
        arrow(n, "M150 54 V170") + t(80, 200, '"vertical"', "d-m", "middle") +
        r(180, 40, 210, 56, "d-frame", 6) + kid(190, 50, 58, 36, 1) + kid(256, 50, 58, 36, 2) + kid(322, 50, 58, 36, 3) +
        arrow(n, "M190 106 H380") + t(285, 126, '"horizontal"', "d-m", "middle") +
        t(180, 230, "[보충] layout_weight 1 : 2", "d-s d-b") +
        r(180, 240, 210, 44, "d-frame", 6) + kid(186, 246, 64, 32, "weight 1") + kid(256, 246, 128, 32, "weight 2", "d-box-b") +
        t(285, 302, "남은 공간을 비율대로 나눔", "d-s", "middle") +
        phone(450, 30, 176, 312, "실습 5 · activity_main") +
        r(458, 44, 160, 290, "d-lin1", 4) +
        r(466, 52, 144, 26, "d-field", 3) + t(472, 69, "data sample", "d-s") +
        r(466, 84, 144, 32, "d-lin2", 3) + btn(487, 89, 48, "start") + btn(543, 89, 48, "close") +
        t(538, 136, "Result :", "d-t d-b", "middle") +
        r(466, 144, 144, 182, "d-gray", 2) +
        tag(65, 1, "EditText") +
        tag(100, 2, "가로 LinearLayout", "start · close 가운데") +
        tag(132, 3, "TextView", '"Result :" 24sp 굵게') +
        tag(236, 4, "TextView (회색)", "match_parent → 나머지") +
        t(538, 360, "바깥 = 세로 LinearLayout (padding 8dp)", "d-s d-acc-t", "middle")
    );
  };

  window.Diagrams = D;
})();
