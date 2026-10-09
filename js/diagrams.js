/* 개념 그림 (inline SVG). 색은 css/style.css의 .d-* 클래스가 테마 변수로 칠한다.
   그림마다 넓은 화면용(m=false)과 폰용 세로 배치(m=true) 두 가지를 그린다.
   marker id는 그림·배치마다 달라야 함 — 숨겨진 그림 안의 marker를 다른 그림이 참조하면 화살촉이 사라짐 */
(function () {
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const marker = (id, cls) =>
    `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="${cls}"/></marker>`;

  function svg(name, w, h, label, body, cls = "") {
    return (
      `<svg class="dg ${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">` +
      `<defs>${marker(name + "-m", "d-head")}${marker(name + "-a", "d-head-acc")}${marker(name + "-b", "d-head-bad")}${marker(name + "-g", "d-head-ok")}</defs>` +
      body +
      `</svg>`
    );
  }

  /* 그리기 도우미 — n: marker id 접두사 */
  const t = (x, y, s, cls = "d-t", anchor = "start") =>
    `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${esc(s)}</text>`;
  const lines = (x, y, arr, cls = "d-t", anchor = "start", lh = 16) =>
    arr.map((s, i) => t(x, y + i * lh, s, cls, anchor)).join("");
  const r = (x, y, w, h, cls = "d-box", rx = 6) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" class="${cls}"/>`;
  const arrow = (n, d, kind = "m", extra = "") => {
    const cls = { m: "d-line", a: "d-acc", b: "d-badl", g: "d-okl" }[kind];
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
  D.files = (m) => {
    const n = m ? "filesn" : "files";
    const label =
      "AndroidManifest.xml이 MainActivity를 등록하고, MainActivity가 setContentView로 activity_main.xml을, findViewById로 그 안의 button01을 연결하는 관계도";
    const MAN = ["<activity", "  android:name=", '  ".MainActivity">', "  <intent-filter>", "   MAIN + LAUNCHER", "  </intent-filter>"];
    const JAVA = ["class MainActivity", " extends AppCompatActivity {", " onCreate(...) {", "  setContentView(", "   R.layout.activity_main);", "  btn = findViewById(", "   R.id.button01);", " }"];
    const XML = ["<ConstraintLayout ...>", " <Button", "  android:id=", '  "@+id/button01"', '  android:text="Clear"/>', "</ConstraintLayout>"];

    if (!m) {
      const card = (x, w, h, path, name, code) =>
        r(x, 30, w, h, "d-box") + t(x + 12, 46, path, "d-s") + t(x + 12, 60, name, "d-t d-b") +
        `<line x1="${x}" y1="68" x2="${x + w}" y2="68" class="d-line"/>` + lines(x + 12, 86, code, "d-m", "start", 18);
      return svg(
        n, 760, 270, label,
        r(16, 109, 178, 18, "d-hl", 3) + r(286, 127, 188, 36, "d-hl", 3) + r(286, 163, 188, 36, "d-hl2", 3) + r(566, 109, 178, 36, "d-hl2", 3) +
          card(10, 190, 160, "manifests/", "AndroidManifest.xml", MAN) +
          card(280, 200, 196, "java/패키지/", "MainActivity.java", JAVA) +
          card(560, 190, 160, "res/layout/", "activity_main.xml", XML) +
          arrow(n, "M196 118 C238 118 238 82 276 82", "a") + t(240, 142, "클래스 등록", "d-s d-acc-t", "middle") +
          arrow(n, "M476 145 C520 145 516 54 556 54", "a") + t(516, 40, "화면 연결", "d-s d-acc-t", "middle") +
          arrow(n, "M476 181 C520 181 518 127 556 127", "a") + t(521, 206, "id로 위젯 찾기", "d-s d-acc-t", "middle") +
          r(24, 222, 30, 30, "d-soft", 8) + `<circle cx="39" cy="237" r="7" class="d-acc-fill"/>` +
          arrow(n, "M39 220 V194", "a") + t(64, 234, "앱 아이콘 터치", "d-t") + t(64, 252, "→ MAIN + LAUNCHER인 액티비티가 첫 화면", "d-s")
      );
    }
    /* 폰: 세 파일을 위에서 아래로 */
    const card = (y0, path, name, code) =>
      r(20, y0, 300, 48 + code.length * 17 + 6, "d-box") + t(32, y0 + 16, path, "d-s") + t(32, y0 + 31, name, "d-t d-b") +
      `<line x1="20" y1="${y0 + 39}" x2="320" y2="${y0 + 39}" class="d-line"/>` + lines(32, y0 + 57, code, "d-m", "start", 17);
    return svg(
      n, 340, 646, label,
      r(20, 6, 26, 26, "d-soft", 7) + `<circle cx="33" cy="19" r="6" class="d-acc-fill"/>` +
        t(54, 18, "앱 아이콘 터치", "d-t") + t(54, 32, "→ MAIN + LAUNCHER 액티비티가 첫 화면", "d-s") +
        arrow(n, "M33 34 V48", "a") +
        r(26, 112, 288, 34, "d-hl", 3) +
        card(50, "manifests/", "AndroidManifest.xml", MAN) +
        arrow(n, "M170 206 V244", "a") + t(178, 230, "클래스 등록", "d-s d-acc-t") +
        r(26, 344, 288, 34, "d-hl", 3) + r(26, 378, 288, 34, "d-hl2", 3) +
        card(248, "java/패키지/", "MainActivity.java", JAVA) +
        t(310, 356, "화면 연결 ↓", "d-s d-acc-t", "end") + t(310, 390, "id로 찾기 ↓", "d-s d-ok-t", "end") +
        arrow(n, "M90 438 V476", "a") + arrow(n, "M250 438 V476", "g") +
        r(21, 481, 298, 37, "d-hl", 5) + r(26, 559, 288, 34, "d-hl2", 3) +
        card(480, "res/layout/", "activity_main.xml", XML)
    );
  };

  /* ── 2. width 값 비교 ── */
  D.size = (m) => {
    const n = m ? "sizen" : "size";
    const label = "layout_width가 match_parent면 부모 너비 전체, wrap_content면 글자 크기만큼, 0dp면 ConstraintLayout의 양쪽 제약 사이를 채우는 것을 비교한 그림";
    if (!m) {
      const col = (x, title, child, dim, note) =>
        t(x + 90, 34, title, "d-m d-b", "middle") + r(x, 46, 180, 112, "d-frame", 8) + t(x + 8, 62, "부모", "d-s") + child + dim + t(x + 90, 182, note, "d-s", "middle");
      return svg(
        n, 660, 196, label,
        col(20, "match_parent", r(20, 82, 180, 32, "d-soft", 4) + t(110, 103, "TextView", "d-t", "middle"),
          both(n, "M22 134 H198") + t(110, 150, "부모 너비만큼", "d-s", "middle"), "부모 기준으로 꽉 채움") +
        col(240, "wrap_content", r(252, 82, 74, 32, "d-soft", 4) + t(289, 103, "Hello", "d-t", "middle"),
          both(n, "M254 134 H324") + t(289, 150, "글자만큼", "d-s", "middle"), "내용에 필요한 만큼") +
        col(460, "0dp (match_constraint)",
          r(476, 82, 148, 32, "d-soft", 4) + t(550, 103, "EditText", "d-t", "middle") +
            `<path d="M460 98 H476 M624 98 H640" class="d-acc"/><circle cx="476" cy="98" r="3" class="d-acc-fill"/><circle cx="624" cy="98" r="3" class="d-acc-fill"/>`,
          both(n, "M478 134 H622", "a") + t(550, 150, "양쪽 제약 사이를 채움", "d-s d-acc-t", "middle"), "ConstraintLayout 전용")
      );
    }
    const rows = [
      ["match_parent", "부모 너비만큼", (y) => r(20, y + 44, 300, 28, "d-soft", 4) + t(170, y + 63, "TextView", "d-t", "middle"), [22, 318], "m"],
      ["wrap_content", "글자만큼", (y) => r(32, y + 44, 74, 28, "d-soft", 4) + t(69, y + 63, "Hello", "d-t", "middle"), [34, 104], "m"],
      ["0dp (match_constraint)", "양쪽 제약 사이를 채움",
        (y) => r(36, y + 44, 268, 28, "d-soft", 4) + t(170, y + 63, "EditText", "d-t", "middle") +
          `<path d="M20 ${y + 58} H36 M304 ${y + 58} H320" class="d-acc"/><circle cx="36" cy="${y + 58}" r="3" class="d-acc-fill"/><circle cx="304" cy="${y + 58}" r="3" class="d-acc-fill"/>`,
        [38, 302], "a"],
    ];
    return svg(
      n, 340, 356, label,
      rows.map(([title, note, child, [a, b], k], i) => {
        const y = 8 + i * 116;
        return t(20, y + 14, title, "d-m d-b") + t(320, y + 14, note, k === "a" ? "d-s d-acc-t" : "d-s", "end") +
          r(20, y + 22, 300, 76, "d-frame", 8) + t(26, y + 37, "부모", "d-s") + child(y) + both(n, `M${a} ${y + 86} H${b}`, k);
      }).join("")
    );
  };

  /* ── 3. 생명주기 (시뮬레이터가 data-fn으로 강조) ── */
  D.lifecycle = (m) => {
    const n = m ? "lcn" : "lc";
    /* X: 가운데 줄, BW: 상자 폭, K: 왼쪽 '프로세스 종료' 타원, RS: onRestart 상자 */
    const G = m
      ? { W: 360, X: 190, BW: 110, R: 56, K: [60, 52, "프로세스 종료"], RS: [262, 90], PL: 300, SL: 340 }
      : { W: 600, X: 300, BW: 120, R: 62, K: [90, 72, "프로세스 종료됨"], RS: [450, 120], PL: 420, SL: 510 };
    const L = G.X - G.BW / 2, Rt = G.X + G.BW / 2;
    const [KX, KR, KT] = G.K;
    const [RX, RW] = G.RS;
    const box = (fn, x, y, w = G.BW) =>
      `<g data-fn="${fn}">${r(x, y, w, 28, "lc-box", 3)}${t(x + w / 2, y + 19, fn + "()", "lc-fn", "middle")}</g>`;
    const oval = (fn, cx, cy, rx, ry, cls, text) =>
      `<g data-fn="${fn}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" class="${cls}"/>${t(cx, cy + 4, text, "lc-state", "middle")}</g>`;
    const P = (d, end = true) => `<path d="${d}" class="d-line"${end ? ` marker-end="url(#${n}-m)"` : ""}/>`;
    const X = G.X;
    const labels = m
      ? lines(198, 298, ["다른 액티비티가", "앞으로 옴"], "d-s", "start", 14) +
        t(198, 390, "더 이상 안 보임", "d-s") +
        t(198, 470, "종료되거나 시스템이 제거", "d-s") +
        t(296, 226, "사용자가 돌아옴", "d-s", "end") +
        t(334, 410, "사용자가 다시 이동", "d-s", "end") +
        lines(66, 316, ["우선순위 높은 앱이", "메모리 필요"], "d-s", "start", 14) +
        lines(66, 160, ["사용자가", "다시 이동"], "d-s", "start", 14)
      : lines(308, 300, ["다른 액티비티가", "전면으로 올라옴"], "d-s", "start", 14) +
        t(308, 388, "더 이상 보이지 않음", "d-s") +
        t(308, 466, "종료(finish)되거나 시스템이 제거", "d-s") +
        lines(428, 284, ["사용자가", "돌아옴"], "d-s", "start", 14) +
        t(502, 414, "사용자가 다시 이동", "d-s", "end") +
        lines(98, 322, ["우선순위 높은 앱이", "메모리를 필요로 함"], "d-s", "start", 14) +
        lines(98, 170, ["사용자가", "다시 이동"], "d-s", "start", 14);
    return svg(
      n, G.W, 600,
      "액티비티 생명주기 흐름도: onCreate, onStart, onResume을 거쳐 실행 중이 되고, onPause, onStop, onDestroy로 소멸한다. onStop 뒤 다시 돌아오면 onRestart, 프로세스가 종료됐다가 돌아오면 onCreate부터 다시 시작한다.",
      P(`M${X} 46 V70`) + P(`M${X} 98 V125`) + P(`M${X} 153 V180`) + P(`M${X} 208 V235`) +
        P(`M${X} 275 V340`) + P(`M${X} 368 V420`) + P(`M${X} 448 V495`) + P(`M${X} 523 V552`) +
        P(`M${L} 354 H${KX} V276`) + P(`M${L} 434 H${KX} V354`, false) + P(`M${KX} 235 V84 H${L}`) +
        P(`M${Rt} 354 H${G.PL} V194 H${Rt}`) + P(`M${Rt} 434 H${G.SL} V154`) + P(`M${RX} 139 H${Rt}`) +
        oval("launched", X, 28, G.R, 18, "lc-blue", "액티비티 시작") +
        oval("running", X, 255, G.R, 20, "lc-green", "실행 중") +
        oval("killed", KX, 255, KR, 20, "lc-orange", KT) +
        oval("destroyed", X, 570, G.R, 18, "lc-orange", "액티비티 소멸") +
        box("onCreate", L, 70) + box("onStart", L, 125) + box("onResume", L, 180) +
        box("onPause", L, 340) + box("onStop", L, 420) + box("onDestroy", L, 495) +
        box("onRestart", RX, 125, RW) +
        labels,
      "lc"
    );
  };

  /* ── 4. A→B 실행·복귀 호출 순서 ── */
  D.ab = (m) => {
    const n = m ? "abn" : "ab";
    const [AX, BX, W, VW] = m ? [95, 265, 116, 360] : [160, 480, 136, 640];
    const MID = VW / 2;
    const steps = [
      ["A", "onPause", 84], ["B", "onCreate", 114], ["B", "onStart", 144], ["B", "onResume", 174], ["A", "onStop", 204],
      ["B", "onPause", 264], ["A", "onRestart", 294], ["A", "onStart", 324], ["A", "onResume", 354], ["B", "onStop", 384], ["B", "onDestroy", 414],
    ];
    const HW = m ? 75 : 80;
    let body =
      r(AX - HW, 12, HW * 2, 30, "d-box-a") + t(AX, 32, "A (MainActivity)", "d-t d-b", "middle") +
      r(BX - HW, 12, HW * 2, 30, "d-box-b") + t(BX, 32, "B (SecondActivity)", "d-t d-b", "middle") +
      `<path d="M${AX} 42 V430 M${BX} 42 V430" class="d-line d-dash"/>` +
      t(MID, 62, "A에서 B 실행 (startActivity)", "d-s d-b", "middle") +
      `<path d="M${m ? 10 : 20} 230 H${VW - (m ? 10 : 20)}" class="d-line d-dash"/>` +
      t(MID, 246, "B에서 뒤로 가기 (finish)", "d-s d-b", "middle");
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
    if (!m) {
      body +=
        t(552, 178, "B가 보임", "d-s d-acc-t") + t(84, 208, "A 가려짐", "d-s", "end") +
        t(84, 358, "A 다시 보임", "d-s d-acc-t", "end") + t(552, 418, "B 소멸", "d-s");
    }
    return svg(n, VW, 436, "A에서 B를 실행하면 A.onPause, B.onCreate, B.onStart, B.onResume, A.onStop 순서로, B에서 뒤로 가면 B.onPause, A.onRestart, A.onStart, A.onResume, B.onStop, B.onDestroy 순서로 호출된다", body);
  };

  /* ── 5. 실습 2 화면과 제약 ── */
  D.ex2 = (m) => {
    const n = m ? "ex2n" : "ex2";
    const ox = m ? 70 : 30;
    const legend = [
      ["editText01  Start·End → parent", "양옆에 붙이고 width 0dp → 가로로 꽉 참"],
      ['editText01  Top_toTopOf="parent"', "화면 위쪽에 붙임 (margin 16dp)"],
      ['button01  Top_toBottomOf="@+id/editText01"', "입력란 바로 아래 — Clear"],
      ['button02  Top_toBottomOf="@+id/button01"', "Clear 버튼 아래 — Close"],
      ['button01·02  Start_toStartOf="parent"', "둘 다 왼쪽 정렬, 크기는 wrap_content"],
    ];
    let body =
      phone(ox, 26, 220, 282, "실습 2 실행 화면") +
      r(ox + 16, 54, 188, 28, "d-field", 3) + t(ox + 24, 73, "text type", "d-s") +
      btn(ox + 16, 98, 60, "Clear", 24) + btn(ox + 16, 138, 60, "Close", 24) +
      `<path d="M${ox} 68 H${ox + 16} M${ox + 204} 68 H${ox + 220} M${ox} 110 H${ox + 16} M${ox} 150 H${ox + 16}" class="d-acc"/>` +
      arrow(n, `M${ox + 160} 42 V52`, "a") + arrow(n, `M${ox + 46} 84 V96`, "a") + arrow(n, `M${ox + 46} 124 V136`, "a") +
      num(ox + 8, 92, 1) + num(ox + 174, 46, 2) + num(ox + 88, 110, 3) + num(ox + 88, 150, 4) + num(ox + 8, 176, 5);
    legend.forEach(([code, desc], i) => {
      const [bx, y] = m ? [28, 336 + i * 46] : [290, 66 + i * 50];
      body += num(bx, y - 4, i + 1) + t(bx + 14, y, code, "d-m") + t(bx + 14, y + 17, desc, "d-s");
    });
    return svg(n, m ? 360 : 640, m ? 556 : 316, "실습 2 화면에서 EditText는 양옆과 위를 parent에 붙이고, Clear 버튼은 EditText 아래, Close 버튼은 Clear 아래에 붙는 제약 관계", body);
  };

  /* ── 6. 클릭 이벤트 흐름 ── */
  D.click = (m) => {
    const n = m ? "clickn" : "click";
    const label = "등록된 버튼을 클릭하면 onClick이 호출되고 getId로 button01이면 setText, button02면 finish를 실행한다. 등록하지 않은 View는 onClick이 불리지 않는다";
    if (!m) {
      return svg(
        n, 700, 252, label,
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
    }
    return svg(
      n, 340, 410, label,
      r(100, 10, 140, 48) + lines(170, 30, ["사용자가", "Clear 버튼 클릭"], "d-t", "middle") +
        arrow(n, "M170 58 V100", "a") + lines(178, 76, ["등록돼 있으면", "리스너에 통지"], "d-s d-acc-t", "start", 14) +
        r(95, 102, 150, 48, "d-soft") + t(170, 123, "onClick(View v)", "d-m d-b", "middle") + t(170, 140, "콜백 자동 호출", "d-s", "middle") +
        arrow(n, "M170 150 V182", "a") +
        r(110, 184, 120, 48) + t(170, 205, "v.getId()", "d-m d-b", "middle") + t(170, 222, "어느 버튼?", "d-s", "middle") +
        arrow(n, "M170 232 V248 H90 V270") + arrow(n, "M170 248 H250 V270") +
        r(20, 272, 140, 62, "d-box-a") + lines(30, 290, ["== R.id.button01", 'setText("")'], "d-m", "start", 17) + t(30, 326, "→ 입력란 비움", "d-s") +
        r(180, 272, 140, 62, "d-box-b") + lines(190, 290, ["== R.id.button02", "finish()"], "d-m", "start", 17) + t(190, 326, "→ 액티비티 종료", "d-s") +
        r(20, 356, 120, 44, "d-box d-faded") + lines(80, 374, ["등록 안 한 View", "클릭"], "d-s", "middle", 15) +
        arrow(n, "M140 378 H176", "b", "d-dash") + lines(182, 374, ["통지 없음", "onClick 안 불림"], "d-s d-bad-t", "start", 15)
    );
  };

  /* ── 7. 인텐트로 화면 전환 + 액티비티 스택 ── */
  D.intent = (m) => {
    const n = m ? "intentn" : "intent";
    const label = "MainActivity가 Intent와 startActivity로 SecondActivity를 실행하면 스택 맨 위에 쌓이고, finish로 SecondActivity를 꺼내면 MainActivity가 다시 보인다";
    /* 스택 그림: cx 가운데, hw 반폭, top/bottom 위치 */
    const stack = (cx, hw, top, bot, cards, cap, capY) => {
      let s = `<path d="M${cx - hw} ${top} V${bot} H${cx + hw} V${top}" class="d-line"/>`;
      cards.forEach(([txt, cls], i) => {
        const y = bot - 36 - i * (m ? 32 : 34);
        const h = m ? 28 : 30;
        s += r(cx - hw + 6, y, hw * 2 - 12, h, cls, 4) + t(cx, y + h / 2 + 5, txt, cls.includes("d-ghost") ? "d-s" : "d-t", "middle");
      });
      return s + t(cx, capY, cap, "d-s", "middle");
    };
    if (!m) {
      return svg(
        n, 700, 380, label,
        phone(40, 30, 150, 190, "MainActivity") + btn(52, 52, 126, "Start Activity", 24) +
          phone(510, 30, 150, 190, "SecondActivity") + btn(555, 113, 60, "Close", 24) +
          arrow(n, "M196 76 H504", "a") +
          t(350, 52, "① new Intent(현재, 대상.class)", "d-s d-acc-t", "middle") +
          t(350, 68, "MainActivity.this → SecondActivity.class", "d-m", "middle") +
          t(350, 94, "② startActivity(intent)", "d-s d-acc-t", "middle") +
          t(350, 130, "※ Manifest에 등록된 액티비티만 실행 가능", "d-s d-bad-t", "middle") +
          arrow(n, "M504 170 H196") + t(350, 190, "③ finish() → 이전 화면으로", "d-s", "middle") +
          t(20, 252, "액티비티 스택", "d-t d-b") +
          stack(130, 60, 268, 350, [["Main", "d-box-a"]], "Main이 맨 위 → 보임", 370) +
          arrow(n, "M196 312 H284", "a") + t(240, 302, "startActivity", "d-s", "middle") +
          stack(350, 60, 268, 350, [["Main", "d-box-a"], ["Second", "d-box-b"]], "Second가 맨 위 → 보임", 370) +
          arrow(n, "M416 312 H504") + t(460, 302, "finish()", "d-s", "middle") +
          stack(570, 60, 268, 350, [["Main", "d-box-a"], ["Second (꺼냄)", "d-ghost"]], "Main이 다시 맨 위", 370)
      );
    }
    return svg(
      n, 340, 412, label,
      phone(14, 30, 130, 140, "MainActivity") + btn(24, 50, 110, "Start Activity", 24) +
        phone(196, 30, 130, 140, "SecondActivity") + btn(231, 88, 60, "Close", 24) +
        arrow(n, "M146 76 H192", "a") + num(169, 62, 1) +
        arrow(n, "M194 128 H148") + num(171, 114, 2) +
        num(22, 196, 1) + t(36, 200, "new Intent(현재, 대상.class)", "d-m") +
        t(36, 217, "→ startActivity(intent)로 실행", "d-s d-acc-t") +
        num(22, 240, 2) + t(36, 244, "finish() → 이전 화면(Main)으로", "d-s") +
        t(20, 270, "※ Manifest에 등록된 액티비티만 실행 가능", "d-s d-bad-t") +
        t(20, 302, "액티비티 스택", "d-t d-b") +
        stack(55, 44, 318, 384, [["Main", "d-box-a"]], "처음 실행", 402) +
        arrow(n, "M101 366 H122", "a") +
        stack(170, 44, 318, 384, [["Main", "d-box-a"], ["Second", "d-box-b"]], "startActivity 후", 402) +
        arrow(n, "M216 366 H237") +
        stack(285, 44, 318, 384, [["Main", "d-box-a"], ["Second (꺼냄)", "d-ghost"]], "finish() 후", 402)
    );
  };

  /* ── 8. putExtra로 데이터 전달 ── */
  D.extra = (m) => {
    const n = m ? "extran" : "extra";
    const label = "MainActivity가 putExtra로 key01과 value\\nData를 Intent에 담아 보내고, SecondActivity가 getIntent와 getStringExtra로 꺼내 회색 TextView에 두 줄로 표시한다";
    const mainBtns = (x, y) => btn(x, y, 104, "Start SecondActivity", 22, "d-mbtn-t d-xs") + btn(x + 107, y, 32, "Close", 22, "d-mbtn-t d-xs");
    /* Intent 봉투: (x, y) 왼쪽 위, w 폭 */
    const envelope = (x, y, w) => {
      const tx = x + 12, tw = w - 24, kx = tx + Math.round(tw * 0.31);
      return r(x, y, w, m ? 118 : 150, "d-soft", 10) +
        t(tx, y + 22, "Intent intent01", "d-m d-b") + t(tx, y + 40, "대상: SecondActivity.class", "d-s") +
        r(tx, y + 50, tw, 50, "d-box", 4) + `<path d="M${tx} ${y + 68} H${tx + tw} M${kx} ${y + 50} V${y + 100}" class="d-line"/>` +
        t((tx + kx) / 2, y + 64, "키", "d-s", "middle") + t((kx + tx + tw) / 2, y + 64, "값", "d-s", "middle") +
        t((tx + kx) / 2, y + 89, '"key01"', "d-m", "middle") + t((kx + tx + tw) / 2, y + 89, '"value\\nData"', "d-m d-b", "middle");
    };
    if (!m) {
      return svg(
        n, 760, 290, label,
        phone(20, 30, 150, 240, "MainActivity") + t(32, 66, "Intent", "d-t d-b d-big") + mainBtns(27, 80) +
          arrow(n, "M172 100 H278", "a") +
          t(225, 90, "① putExtra(키, 값)", "d-s d-acc-t", "middle") + t(225, 118, "② startActivity()", "d-s d-acc-t", "middle") +
          envelope(280, 70, 200) + t(380, 200, "(키, 값) 쌍으로 실려 감", "d-s", "middle") +
          arrow(n, "M470 158 H588", "a") +
          t(529, 148, "③ getIntent()", "d-s d-acc-t", "middle") + t(529, 176, "④ getStringExtra(키)", "d-s d-acc-t", "middle") +
          phone(590, 30, 150, 240, "SecondActivity") + t(600, 64, "전달된 값 출력", "d-s") +
          r(598, 74, 134, 156, "d-gray", 2) + lines(606, 96, ["value", "Data"], "d-gray-t", "start", 20) + btn(645, 238, 40, "Button")
      );
    }
    return svg(
      n, 340, 552, label,
      phone(20, 30, 150, 120, "MainActivity") + t(32, 64, "Intent", "d-t d-b d-big") + mainBtns(27, 78) +
        t(186, 84, "① putExtra(키, 값)", "d-s d-acc-t") + t(186, 102, "② startActivity()", "d-s d-acc-t") +
        arrow(n, "M95 152 V182", "a") +
        envelope(20, 184, 300) +
        arrow(n, "M245 304 V336", "a") +
        t(236, 318, "③ getIntent()", "d-s d-acc-t", "end") + t(236, 334, "④ getStringExtra(키)", "d-s d-acc-t", "end") +
        phone(170, 340, 150, 200, "") + t(160, 364, "SecondActivity", "d-t d-b", "end") +
        t(180, 370, "전달된 값 출력", "d-s") + r(178, 380, 134, 124, "d-gray", 2) +
        lines(186, 400, ["value", "Data"], "d-gray-t", "start", 20) + btn(225, 512, 40, "Button") +
        /* 역슬래시는 한글 글꼴(맑은 고딕)에서 ₩로 보여서 고정폭 글꼴로 따로 씀 */
        `<text x="20" y="440" class="d-s"><tspan class="d-m">\\n</tspan>은 줄바꿈이라</text>` + t(20, 456, "두 줄로 보임", "d-s")
    );
  };

  /* ── 9. 한 방향(실습 4) vs 왕복(실습 5) ── */
  D.ret = (m) => {
    const n = m ? "retn" : "ret";
    const label = "실습 4는 MainActivity가 SecondActivity로 값을 보내기만 하고, 실습 5는 SecondActivity가 종료되면서 값을 MainActivity로 되돌려 주는 왕복 구조";
    if (!m) {
      const node = (x, y, h, cls, title, sub) =>
        r(x, y, 160, h, cls) + t(x + 80, y + 22, title, "d-t d-b", "middle") + lines(x + 80, y + 40, sub, "d-s", "middle", 15);
      return svg(
        n, 700, 300, label,
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
    }
    const node = (y, h, cls, title, sub) => r(20, y, 300, h, cls) + t(32, y + 19, title, "d-t d-b") + lines(32, y + 36, sub, "d-s", "start", 15);
    return svg(
      n, 360, 430, label,
      t(20, 20, "실습 4 · 한 방향", "d-t d-b") +
        node(32, 46, "d-box-a", "MainActivity", ["putExtra로 값 담음"]) +
        arrow(n, "M70 80 V112", "a") + t(78, 100, "값을 보내며 실행", "d-s d-acc-t") +
        arrow(n, "M250 112 V80", "m", "d-dash") + lines(258, 92, ["finish()", "돌려주는 값 없음"], "d-s", "start", 14) +
        node(114, 46, "d-box-b", "SecondActivity", ["getStringExtra로 받음"]) +
        t(20, 194, "실습 5 · 왕복 (결과 리턴)", "d-t d-b") +
        node(206, 62, "d-box-a", "MainActivity", ["EditText: data sample", "Result 영역에 결과 표시"]) +
        arrow(n, "M70 270 V310", "a") + t(78, 294, "① 입력값을 보내며 실행", "d-s d-acc-t") +
        arrow(n, "M250 310 V270", "a") + lines(258, 286, ["② 종료하며", "결과를 돌려줌"], "d-s d-acc-t", "start", 14) +
        node(312, 62, "d-box-b", "SecondActivity", ["EditText에서 수정", "data sample - return data"]) +
        lines(20, 400, ["돌려받는 코드(ActivityResultLauncher · setResult)는", "시험 범위 밖"], "d-s", "start", 15)
    );
  };

  /* ── 10. LinearLayout 방향 + 실습 5 중첩 구조 ── */
  D.linear = (m) => {
    const n = m ? "linearn" : "linear";
    const kid = (x, y, w, h, k, cls = "d-box-a") => r(x, y, w, h, cls, 4) + t(x + w / 2, y + h / 2 + 4, String(k), "d-t d-b", "middle");
    /* 실습 5 화면 목업: (ox, oy)는 폰의 왼쪽 위 */
    const screen = (ox, oy) => {
      const tag = (dy, k, l1, l2) => {
        const y = oy + dy;
        return `<path d="M${ox + 176} ${y} H${ox + 192}" class="d-line"/>` + num(ox + 202, y, k) +
          t(ox + 214, y + 4, l1, "d-s d-b") + (l2 ? t(ox + 214, y + 18, l2, "d-s") : "");
      };
      return phone(ox, oy, 176, 312, "실습 5 · activity_main") +
        r(ox + 8, oy + 14, 160, 290, "d-lin1", 4) +
        r(ox + 16, oy + 22, 144, 26, "d-field", 3) + t(ox + 22, oy + 39, "data sample", "d-s") +
        r(ox + 16, oy + 54, 144, 32, "d-lin2", 3) + btn(ox + 37, oy + 59, 48, "start") + btn(ox + 93, oy + 59, 48, "close") +
        t(ox + 88, oy + 106, "Result :", "d-t d-b", "middle") +
        r(ox + 16, oy + 114, 144, 182, "d-gray", 2) +
        tag(35, 1, "EditText") + tag(70, 2, "가로 LinearLayout", "start · close 가운데") +
        tag(102, 3, "TextView", '"Result :" 24sp 굵게') + tag(206, 4, "TextView (회색)", "match_parent → 나머지") +
        t(ox + 88, oy + 330, "바깥 = 세로 LinearLayout (padding 8dp)", "d-s d-acc-t", "middle");
    };
    const label = "vertical은 위에서 아래로, horizontal은 왼쪽에서 오른쪽으로 쌓인다. 실습 5 화면은 세로 LinearLayout 안에 가로 LinearLayout을 넣은 중첩 구조";
    if (!m) {
      return svg(
        n, 800, 366, label,
        t(20, 26, "orientation", "d-m d-b") +
          r(20, 40, 120, 142, "d-frame", 6) + kid(32, 50, 96, 34, 1) + kid(32, 92, 96, 34, 2) + kid(32, 134, 96, 34, 3) +
          arrow(n, "M150 54 V170") + t(80, 200, '"vertical"', "d-m", "middle") +
          r(180, 40, 210, 56, "d-frame", 6) + kid(190, 50, 58, 36, 1) + kid(256, 50, 58, 36, 2) + kid(322, 50, 58, 36, 3) +
          arrow(n, "M190 106 H380") + t(285, 126, '"horizontal"', "d-m", "middle") +
          t(180, 230, "[보충] layout_weight 1 : 2", "d-s d-b") +
          r(180, 240, 210, 44, "d-frame", 6) + kid(186, 246, 64, 32, "weight 1") + kid(256, 246, 128, 32, "weight 2", "d-box-b") +
          t(285, 302, "남은 공간을 비율대로 나눔", "d-s", "middle") +
          screen(450, 30)
      );
    }
    return svg(
      n, 360, 604, label,
      t(20, 22, "orientation", "d-m d-b") +
        r(20, 34, 100, 132, "d-frame", 6) + kid(32, 44, 76, 30, 1) + kid(32, 82, 76, 30, 2) + kid(32, 120, 76, 30, 3) +
        arrow(n, "M128 44 V150") + t(70, 184, '"vertical"', "d-m", "middle") +
        r(140, 34, 190, 50, "d-frame", 6) + kid(150, 44, 52, 30, 1) + kid(210, 44, 52, 30, 2) + kid(270, 44, 52, 30, 3) +
        arrow(n, "M150 96 H322") + t(235, 114, '"horizontal"', "d-m", "middle") +
        t(140, 140, "[보충] layout_weight 1 : 2", "d-s d-b") +
        r(140, 148, 190, 40, "d-frame", 6) + kid(146, 154, 58, 28, 1) + kid(210, 154, 114, 28, 2, "d-box-b") +
        t(235, 204, "남은 공간을 1:2로 나눔", "d-s", "middle") +
        screen(20, 262)
    );
  };

  window.Diagrams = D;
})();
