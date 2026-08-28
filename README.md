# toktaktok — 프로그래머 포트폴리오 사이트

게임 클라이언트 프로그래머 포트폴리오. 빌드 도구 없는 정적 HTML/CSS/JS로,
콘텐츠는 전부 `data/` 폴더의 파일로 분리되어 있습니다.

## 구조

```
index.html          메인 페이지 (소개 → 경력 → 프로젝트 → 기술 → 학력·활동 → 연락)
project.html        프로젝트 상세 (project.html?id=<슬러그>)
css/tokens.css      디자인 토큰 (색·타이포·간격) — 테마를 바꾸려면 여기
css/site.css        레이아웃과 컴포넌트 스타일
js/render.js        data/ 를 읽어 페이지를 그리는 렌더러
data/profile.js     이름·직함·헤드라인·연락처·이력서 경로
data/career.js      경력 행
data/skills.js      기술 스택 표
data/education.js   학력·교육·소모임 (비우면 그 섹션 자체가 안 보임)
data/projects.js    프로젝트 카드 + 상세 (문제→접근→결과 형식)
assets/images/      프로젝트 이미지·GIF를 여기에
assets/favicon.svg  파비콘 (마스코트 캐릭터)
```

## 콘텐츠 수정

HTML은 건드릴 필요 없습니다. `data/*.js`의 값만 바꾸면 됩니다.

- **프로젝트 추가**: `data/projects.js` 배열에 항목 하나 복사해서 수정.
  `id`가 상세 페이지 주소가 됩니다. 스크린샷/플레이 GIF는 `assets/images/`에
  넣고 `thumb` / `media[].src`에 경로를 적으세요. 경로를 비워 두면 캐릭터
  자리 표시가 나옵니다.
- **수치 없는 성과**: `metrics`의 `value`는 `"—"` 로 두세요. 지어내지 않기.
- **학력·활동**: `data/education.js` 배열에 `{ period, label, title, note }`
  형태로 행 추가. `label`은 "학력"/"교육"/"소모임"처럼 짧은 분류표입니다.
  배열을 비우면 "학력·활동" 섹션이 페이지에서 통째로 사라집니다.
- **이력서**: PDF를 `assets/`에 넣고 `data/profile.js`의 `resumeUrl`에 경로를
  적으면 상단 우측 버튼이 이력서 링크로 바뀝니다.
- **도우미 말풍선**: 우하단 캐릭터의 기본 문구는 `data/profile.js`의
  `assistant.messages` 배열이고, 캐릭터를 누를 때마다 순서대로 바뀝니다.
  `assistant.sectionMessages`에 `career`/`projects`/`skills`/`contact` 키로
  문구를 넣으면, 스크롤해서 그 섹션이 화면에 들어올 때 자동으로 그 문구가 뜹니다
  (한 번이라도 캐릭터를 눌러 수동으로 넘기면 그 뒤로는 스크롤이 덮어쓰지 않음).
  두 곳 다 `<a href="...">` 같은 HTML을 그대로 써서 링크를 넣을 수 있습니다.
  `enabled: false`로 도우미 전체를 끌 수 있습니다.

## 로컬 미리보기

```
python3 -m http.server 8000
# http://localhost:8000
```

## 배포 (GitHub Pages)

1. main 브랜치에 머지 후, 저장소 **Settings → Pages**
2. Source: *Deploy from a branch*, Branch: `main` / `/ (root)` 선택
3. 몇 분 뒤 `https://toktaktok.github.io/TokTakTok/` 에서 확인

## 디자인

여러 시안(다크+옐로, Win98 레트로, 다크 게임 HUD, 게임 라이트, 모던 글래스,
레트로 Aero Glass)을 비교해 본 뒤 **Aero Glass**를 본 사이트에 반영했습니다.
[nutlope/hallmark](https://github.com/nutlope/hallmark) 스킬 규칙으로 제작
(`.claude/skills/hallmark/`). 매크로 구조 Portfolio Grid, 커스텀 테마:

- **팔레트** — 하늘색 유리 배경(`--color-paper`), 코발트 블루 앵커
  (`--color-accent`, 캐릭터와 같은 색), 연락 버튼 옆 상태 점과 선택된 필터에만
  쓰는 초록 포인트(`--color-status`) — 그 시절 메신저 "온라인" 표시 오마주.
- **유리(glass)** — 네비게이션은 떠 있는 알약, 필터·카드·기술 표는 위쪽 밝은
  하이라이트/중앙 이음선/아래쪽 톤다운의 4단 그라디언트로 광택 있는 유리
  패널이 됩니다(레시피는 `--glass-hi/mid/seam/lo`, `css/tokens.css`).
- **타이포** — Pretendard Variable(표시+본문) · IBM Plex Mono(날짜·메타 전용).
  이전엔 Space Grotesk를 표시용으로 썼지만 한글 글리프가 없어 한글은 전부
  IBM Plex Sans KR로 폴백되고 있었습니다 — Pretendard 하나로 통일해
  "개발자 문서" 톤 대신 프로덕트 UI 톤으로 정리했습니다. Pretendard는 jsDelivr
  CDN에서 로드합니다(`index.html`/`project.html`의 `<link>`).
- **헤딩 마커** — 이전의 플랫 사각형 대신, 같은 유리 레시피를 쓰는 작은 광택
  구슬로 교체했습니다. 숫자를 붙인 "01 · 라벨" 형태의 에디토리얼 넘버링은
  일부러 쓰지 않았습니다 — 경력/프로젝트/기술/연락은 순서가 있는 챕터가
  아니라 카테고리라서, 장식용 섹션 번호는 hallmark의 anti-pattern 기본
  금지 대상입니다.

토큰은 전부 `css/tokens.css`에 있습니다. `design-drafts/`에는 비교에 쓰인
시안 원본이 남아 있습니다(실제 사이트에서는 더 이상 링크되지 않는 참고용 —
지워도 무방합니다).
