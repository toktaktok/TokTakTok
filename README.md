# toktaktok — 프로그래머 포트폴리오 사이트

게임 클라이언트 프로그래머 포트폴리오. 빌드 도구 없는 정적 HTML/CSS/JS로,
콘텐츠는 전부 `data/` 폴더의 파일로 분리되어 있습니다.

## 구조

```
index.html          메인 페이지 (소개 → 경력 → 프로젝트 → 기술 → 연락)
project.html        프로젝트 상세 (project.html?id=<슬러그>)
css/tokens.css      디자인 토큰 (색·타이포·간격) — 테마를 바꾸려면 여기
css/site.css        레이아웃과 컴포넌트 스타일
js/render.js        data/ 를 읽어 페이지를 그리는 렌더러
data/profile.js     이름·직함·헤드라인·연락처·이력서 경로
data/career.js      경력 행
data/skills.js      기술 스택 표
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
- **이력서**: PDF를 `assets/`에 넣고 `data/profile.js`의 `resumeUrl`에 경로를
  적으면 상단 우측 버튼이 이력서 링크로 바뀝니다.
- **도우미 말풍선**: 우하단 캐릭터의 문구는 `data/profile.js`의
  `assistant.messages` 배열입니다. `enabled: false`로 끌 수 있습니다.

## 로컬 미리보기

```
python3 -m http.server 8000
# http://localhost:8000
```

## 배포 (GitHub Pages)

1. main 브랜치에 머지 후, 저장소 **Settings → Pages**
2. Source: *Deploy from a branch*, Branch: `main` / `/ (root)` 선택
3. 몇 분 뒤 `https://toktaktok.github.io/TokTakTok/` 에서 확인

## 디자인 시안

`design-drafts/`에 컨셉 비교용 시안 3종이 있습니다 (실제 사이트와 무관, 배포된
Pages URL + `/design-drafts/`로 폰에서도 바로 확인 가능):

- **01 다크 + 옐로** — 다크 모드 베이스, 기존 블루는 유지하고 옐로를 서브 포인트로 추가
- **02 레트로 (Win98풍)** — 베벨 버튼·네이비 타이틀바·풍선 도움말, 구성 요소는 정돈된 채로
- **03 게임 HUD** — 코너 브래킷, 글로우 액센트, 티어 미터바로 더 게임스럽게

마음에 드는 방향이 정해지면 그 팔레트/장식을 `css/tokens.css` · `css/site.css`에
반영해 본 사이트에 적용합니다.

## 디자인

[nutlope/hallmark](https://github.com/nutlope/hallmark) 스킬 규칙으로 제작
(`.claude/skills/hallmark/`). 매크로 구조 Portfolio Grid, 커스텀 테마
(오렌지 앵커 + 블루 서브, Space Grotesk · IBM Plex Sans KR · IBM Plex Mono).
토큰은 전부 `css/tokens.css`에 있습니다.
