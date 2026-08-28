# toktaktok — 프로그래머 포트폴리오 사이트

게임 클라이언트 프로그래머 포트폴리오. 빌드 도구 없는 정적 HTML/CSS/JS로,
콘텐츠는 전부 `data/` 폴더의 파일로 분리되어 있습니다.

## 구조

```
index.html          메인 페이지 (온보딩 씬 → 경력 → 프로젝트 → 기술 → 학력·활동 → 연락)
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
assets/images/Aero.png  썸네일을 안 넣었을 때 쓰는 기본 이미지
assets/favicon.svg  파비콘 (마스코트 캐릭터)
```

## 첫 화면 (온보딩 씬)

- **풀스크린 씬** — 히어로가 `100dvh`(화면 높이 전체)를 채우고, 네비/마퀴/
  캐릭터/소개 카드가 전부 그 위에 얹힙니다. 씬 아트(하늘·구름·언덕·덤불·꽃)는
  8비트 픽셀 스타일로 손으로 그린 SVG(`index.html`의 `.hero__scene-art`,
  직각 스텝 실루엣 + 블록 구름) — 외부 이미지 없음, 색은 `css/tokens.css`의
  `--scene-*` 토큰으로 조절합니다.
- **마퀴 타이포** — `data/profile.js`의 `headline`이 화면 가로를 가득 채우는
  롤링 텍스트로 흐릅니다. 폰트는 **Black Han Sans**(Google Fonts,
  `index.html`에서만 로드) — 처음엔 한글 픽셀 폰트(갈무리11)를 셀프호스팅
  했었지만 대형 사이즈에서 픽셀 그리드 때문에 가독성이 떨어져 교체했습니다.
  실제 `<h1>`은 스크린리더용으로 따로 있고 마퀴는 장식(aria-hidden)이며,
  마우스를 올리면 정지합니다(WCAG 2.2.2).
- **캐릭터 도킹** — 첫 진입 시 마스코트가 들판 위(씬 좌표 `.hero__dock`)에
  서서 웃으며 손을 흔들고, 아래로 스크롤하면 평소의 우하단 도우미 위치로
  돌아갑니다(다시 올라오면 재도킹). 두 자리를 오갈 때는 순간이동이 아니라
  **캐릭터가 실제로 그 자리까지 걸어갑니다** — 걷는 모션(`pix--travel`)을
  켜고 진행 방향으로 살짝 기운 채 화면을 가로지릅니다. 두 자리는 부모도
  (씬 안 `absolute` ↔ 화면 기준 `fixed`) 크기도 달라 CSS 트랜지션만으로는
  이을 수 없어서, `render.js`의 `flyTo()`가 FLIP 기법으로 처리합니다:
  옮기기 전 좌표를 재고 → DOM을 옮긴 뒤 새 좌표를 재서 → 그 차이만큼
  거꾸로 밀어 둔 다음 → 0으로 풀며 애니메이션. 이동 시간은 `--dur-travel`.
  이동 중에 스크롤 방향이 바뀌어도 그 순간 위치에서 이어서 갑니다.
- **소개 카드** — 씬 안, 왼쪽 하단에 얹힌 유리 패널. 이름·직함·소개·메타만
  담습니다(경력 요약 등은 없음 — 본문 경력 섹션 참고).
- **상단바** — 씬 맨 위에 떠 있는(호버) 워드마크 · 섹션 링크(경력/프로젝트/
  기술/학력·활동) · 연락. 좁은 화면(≤40rem)에서는 링크 줄이 안 보이고
  워드마크·연락만 남습니다(스크롤로 각 섹션에 닿을 수 있어서).

## 캐릭터 표정·동작 모듈

svg 루트(`.pix`)에 클래스를 얹는 방식으로 표정과 동작을 조합합니다
(`css/site.css`의 mascot 섹션, `js/render.js`의 `setPixState`):

- 표정(mood): 기본 무표정(뜬 눈) · `pix--smile` — 뜬 눈이 **웃는 눈**(호)으로
  바뀝니다. 입은 그리지 않습니다. 호의 기하는 뜬 눈에서 그대로 따와서,
  칠해지는 잉크 기준으로 **가로 폭이 뜬 눈의 폭과 같고**(11) **아래끝이 뜬 눈의
  맨 아래 모서리에 맞습니다**. 선 끝이 둥글어(`stroke-linecap: round`) 끝점
  바깥으로 선 두께의 절반만큼 번지므로, 끝점 좌표는 그만큼 안으로 당겨 둡니다.
- 동작(anim): 기본 아이들(숨쉬기+팔 흔들림+깜빡임) · `pix--wave` (오른팔 손
  흔들기) · `pix--travel` (자리를 옮기는 동안의 걷는 모션 — 도킹 전환 전용)

새 표정/동작을 추가하려면 ① `site.css`에 `.pix--<이름>` 모듈 CSS를 쓰고
② `render.js`의 `PIX_MOODS`/`PIX_ANIMS` 배열에 이름을 등록하면 됩니다.
눈동자가 마우스를 따라가는 동작은 모든 상태에서 항상 켜져 있습니다.

## 콘텐츠 수정

HTML은 건드릴 필요 없습니다. `data/*.js`의 값만 바꾸면 됩니다.

- **프로젝트 추가**: `data/projects.js` 배열에 항목 하나 복사해서 수정.
  `id`가 상세 페이지 주소가 됩니다. 스크린샷/플레이 GIF는 `assets/images/`에
  넣고 `thumb` / `media[].src`에 경로를 적으세요. 경로를 비워 두면 기본
  이미지(`assets/images/Aero.png`)가 들어갑니다 — 기본 이미지를 바꾸려면 그
  파일을 교체하거나 `js/render.js`의 `DEFAULT_MEDIA` 값을 고치면 됩니다.
  기본 이미지마저 없으면 캐릭터 자리 표시로 떨어집니다.
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
