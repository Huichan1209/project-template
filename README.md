# CRGDV 프로젝트

NestJS(백엔드) + React+Vite(프론트엔드) 풀스택 TypeScript 모노레포 프로젝트.

## 기술 스택

- **백엔드**: NestJS, TypeScript, TypeORM, MariaDB
- **프론트엔드**: React, Vite, TypeScript, React Router
- **공통**: ESLint, Prettier

## 디렉토리 구조

```
project-template/
├── backend/          # NestJS 프로젝트 (Domain-Driven)
├── frontend/         # React + Vite 프로젝트 (Feature-Based)
├── doc/              # 기획·설계·회의록 등 프로젝트 문서
├── .gitignore
└── README.md
```

문서 작성 규칙과 카테고리 안내는 [`doc/README.md`](./doc/README.md) 참고.

자세한 패키지 구조 및 코딩 컨벤션은 [`CLAUDE.md`](./CLAUDE.md), [`AI_RULES.md`](./AI_RULES.md), [`.cursorrules`](./.cursorrules) 를 참고한다.

## 시작하기

### 환경변수 설정

각 패키지의 `.env.sample` 파일을 `.env`로 복사한 뒤 실제 값으로 수정한다.

```bash
# backend
cp backend/.env.sample backend/.env

# frontend
cp frontend/.env.sample frontend/.env
```

### 백엔드 실행

```bash
cd backend
npm install
npm run start:dev    # 개발 서버 (watch mode, port 3000)
```

### 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev          # 개발 서버 (port 5173)
```

## 주요 명령어

| 위치 | 명령어 | 설명 |
| --- | --- | --- |
| backend | `npm run start:dev` | NestJS 개발 서버 (watch) |
| backend | `npm run build` | 프로덕션 빌드 |
| backend | `npm run test` | 단위 테스트 |
| backend | `npm run lint` | ESLint |
| frontend | `npm run dev` | Vite 개발 서버 |
| frontend | `npm run build` | tsc + vite build |
| frontend | `npm run lint` | ESLint |

## CI/CD 및 브랜치 전략

GitHub Actions로 CI/CD를 운영한다. 워크플로우 파일은 [`.github/workflows/`](./.github/workflows/) 에 위치한다.

> **`main` 브랜치에 push되는 즉시 운영 환경으로 자동 배포된다.**
> 따라서 `main` 브랜치에는 **최종 개발 및 테스트가 완료된 소스코드만** 올린다.

### 브랜치 규칙

| 브랜치 | 용도 |
| --- | --- |
| `main` | 운영 배포 브랜치. 직접 push 금지, 반드시 PR로 머지. |
| `feature/<작업명>` | 모든 개발 작업은 이 브랜치에서 진행. (`kebab-case`) |
| `fix/<작업명>` | 버그 수정용 보조 브랜치 (선택). |
| `chore/<작업명>` | 잡일/설정 변경용 보조 브랜치 (선택). |

작업명 예시: `feature/login-page`, `feature/user-crud`, `feature/db-schema-init`, `fix/login-redirect`.

### 작업 흐름

1. 최신 `main`에서 `feature/<작업명>` 브랜치를 분기.
2. 해당 브랜치에서 개발 + 로컬 검증(`lint`, `test`, `build`).
3. PR 생성 → 리뷰·CI 통과 → `main` 머지.
4. 머지 즉시 GitHub Actions가 운영 환경에 자동 배포.

### 머지 전 체크리스트

- [ ] `npm run lint` / `npm run test` / `npm run build` 모두 통과
- [ ] `.env` 등 민감 정보 포함 여부 점검
- [ ] 커밋 메시지가 아래 "커밋 컨벤션" 준수
- [ ] 운영 배포가 즉시 발생함을 인지

## 커밋 컨벤션

Conventional Commits 형식을 따르되 **메시지 본문은 한국어**로 작성한다.

```
<type>(<scope>): <subject>

<body>            # 선택. "왜" 변경했는지 설명, 한 줄 72자 이내.
<footer>          # 선택. BREAKING CHANGE, 이슈 참조 등.
```

- 제목(`<subject>`)은 50자 이내, 명령형/현재형, 마침표 없음.
- `<scope>` 예시: `backend`, `frontend`, `doc`, `users`, `auth`, `deps`, `config`.

| 타입 | 용도 |
| --- | --- |
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 (`doc/`, README, 주석 등) |
| `style` | 코드 의미에 영향 없는 포맷·공백 변경 |
| `refactor` | 기능 변경 없는 내부 구조 개선 |
| `perf` | 성능 개선 |
| `test` | 테스트 추가·수정 |
| `build` | 빌드 시스템·의존성 변경 (npm, tsconfig 등) |
| `ci` | CI 설정/스크립트 변경 |
| `chore` | 그 외 잡일 |
| `revert` | 이전 커밋 되돌리기 |

예시:

```
feat(frontend/auth): 로그인 페이지 추가
fix(backend/users): 존재하지 않는 사용자 조회 시 NotFoundException 처리
docs(planning): 온보딩 플로우 정책서 초안 작성
chore(deps): typeorm 0.3.20 적용
```

자세한 가이드는 [`CLAUDE.md`](./CLAUDE.md) / [`AI_RULES.md`](./AI_RULES.md) / [`.cursorrules`](./.cursorrules) 의 "커밋 컨벤션" 섹션 참조.
