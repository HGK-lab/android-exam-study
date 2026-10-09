# 안드로이드 시험 대비 노트

모바일 프로그래밍 서술형 시험 범위를 직접 정리한 학습용 웹앱입니다. 빌드 없이 정적 파일만으로 동작하고, 휴대폰에서 쓰기 좋게 만들었습니다.

- **요약 노트** — 범위별 개념, 코드 해설, 시험 포인트, 개념 그림 10개 (폰에서는 세로로 다시 그린 그림이 나옴), 주제 바로가기
- **생명주기 시뮬레이터** — 홈 버튼·뒤로 가기 등을 눌러 어떤 콜백이 어떤 순서로 불리는지 흐름도에서 확인
- **서술형 연습** — 32문항. 카드 모드(한 문제씩, 좌우로 넘기기)와 목록 모드. 답안을 써 보고 채점 포인트로 자기 채점, 헷갈린 문제만 다시 풀기 (진행 상황은 브라우저에 저장)
- **치트시트** — 호출 순서, 코드 조각, XML 속성 모음
- `android-exam-study-mobile.pdf` — 휴대폰 화면 비율(110×196mm)로 만든 PDF
- `android-exam-study.pdf` — A4 인쇄용 PDF

> 직접 정리한 노트이며 강의자료 원본이 아닙니다. `[보충]` 표시는 강의자료 외 보충 설명입니다.

## 휴대폰에서 쓰기
GitHub Pages 같은 https 주소로 열고, 브라우저 메뉴에서 **홈 화면에 추가**를 누르면 앱처럼 열립니다. 한 번 열어 둔 뒤에는 인터넷 없이도 볼 수 있습니다(`sw.js`가 앱 파일을 저장해 둠).

## 로컬 실행
`index.html`을 브라우저로 열면 됩니다. 파일로 열 때는 오프라인 저장 기능만 꺼집니다.

## PDF 다시 만들기
```
chrome --headless=new --no-pdf-header-footer --print-to-pdf=android-exam-study.pdf print.html
chrome --headless=new --no-pdf-header-footer --print-to-pdf=android-exam-study-mobile.pdf "print.html#mobile"
```

## 고칠 때
- 내용은 `js/content.js`, 그림은 `js/diagrams.js`만 고치면 웹앱과 PDF에 모두 반영됩니다.
- 앱 파일을 추가하거나 이름을 바꾸면 `sw.js`의 `ASSETS` 목록과 `CACHE` 이름의 숫자를 함께 바꿔야 오프라인 저장본이 갱신됩니다.
