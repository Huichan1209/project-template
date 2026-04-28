# CLAUDE.md — CRGDV 프로젝트

이 파일은 Claude Code가 이 저장소에서 작업할 때 참고해야 하는 프로젝트 컨텍스트이다.

## 프로젝트 개요

NestJS(백엔드) + React+Vite(프론트엔드) 풀스택 TypeScript 모노레포 프로젝트.
DB는 MariaDB를 사용하며, TypeORM으로 연동한다.
프로젝트 문서(기획·설계·회의록 등)는 루트의 `doc/` 디렉토리에서 관리한다.

## 빌드 및 실행 명령어

```bash
# 백엔드
cd backend
npm install
npm run start:dev          # 개발 서버 (watch mode, port 3000)
npm run build              # 빌드
npm run test               # 단위 테스트
npm run lint               # ESLint

# 프론트엔드
cd frontend
npm install
npm run dev                # 개발 서버 (port 5173)
npm run build              # 프로덕션 빌드 (tsc + vite build)
```

## 백엔드 패키지 구조 (Domain-Driven)

```
backend/src/
├── common/                # 전역 공통 모듈
│   ├── decorators/        # 커스텀 데코레이터
│   ├── filters/           # 예외 필터 (HttpExceptionFilter)
│   ├── guards/            # 인증/인가 가드
│   ├── interceptors/      # 응답 인터셉터 (TransformInterceptor)
│   └── utils/             # 공통 유틸
├── config/                # 환경변수·외부 설정
├── database/              # DB 연결·마이그레이션
├── domains/               # 도메인별 모듈
│   └── <domain>/
│       ├── dto/           # CreateXxxDto, UpdateXxxDto
│       ├── entities/      # TypeORM 엔티티
│       ├── <domain>.controller.ts
│       ├── <domain>.service.ts
│       └── <domain>.module.ts
├── app.module.ts
└── main.ts
```

### 백엔드 규칙

- 새 기능은 `domains/<도메인명>/` 하위에 모듈을 생성한다.
- Entity 클래스: PascalCase 단수형(`User`), 테이블명: 복수형(`users`).
- DTO: `create-<domain>.dto.ts`, `update-<domain>.dto.ts` 형식. `class-validator` 필수 적용.
- API prefix: `/api` (main.ts에서 `setGlobalPrefix('api')` 설정됨).
- 컨트롤러는 라우팅·요청/응답 처리만 담당, 비즈니스 로직은 서비스에 위임.
- Repository는 `@InjectRepository()`로 주입, 리소스 미존재 시 `NotFoundException`.
- `common/`에는 도메인 비종속 전역 코드만 배치.

## 프론트엔드 패키지 구조 (Feature-Based)

```
frontend/src/
├── assets/                # 정적 파일 (이미지, 폰트)
├── components/            # 도메인 무관 공통 UI (Layout, Button, Modal)
├── constants/             # 공통 상수
├── features/              # 기능별 묶음
│   └── <feature>/
│       ├── components/    # 기능 전용 컴포넌트
│       ├── hooks/         # 기능 전용 훅
│       └── api.ts         # 기능 API 호출
├── hooks/                 # 공통 커스텀 훅
├── pages/                 # 페이지 컴포넌트 (라우터 연결)
├── routes/                # React Router 설정 (AppRouter.tsx)
├── store/                 # 전역 상태 관리
├── styles/                # 전역 스타일 (global.css)
├── utils/                 # 유틸리티 함수
├── App.tsx
└── main.tsx
```

### 프론트엔드 규칙

- 새 기능은 `features/<기능명>/` 하위에 `components/`, `hooks/`, `api.ts` 생성.
- 함수형 컴포넌트(function 선언), 스타일은 CSS Modules(`*.module.css`).
- 파일명: 컴포넌트는 PascalCase(`UserForm.tsx`), 훅은 camelCase(`useUsers.ts`).
- import 시 `@/` alias 사용 (`@/features/...`, `@/components/...`).
- 페이지 컴포넌트는 UI 배치만, 데이터 로직은 feature 훅에 위임.
- 라우팅: `routes/AppRouter.tsx`에 중앙 관리.
- API 호출: feature `api.ts`에서 axios 인스턴스 사용.

## 문서 패키지 구조 (doc)

```
doc/
├── README.md           # 문서 인덱스 및 작성 규칙
├── planning/           # 기획 문서 (요구사항, 화면 정의서, 정책서)
├── architecture/       # 아키텍처·설계 문서 (시스템 구조, 시퀀스, ADR)
├── db/                 # 데이터베이스 (ERD, 스키마, 마이그레이션 노트)
├── infrastructure/     # 인프라/배포 (서버 세팅, CI/CD 운영 메모)
└── meeting/            # 회의록
```

### 문서 작성 규칙

- 모든 문서는 Markdown(`.md`)으로 작성한다. 다이어그램은 가능하면 Mermaid 코드 블록을 사용한다.
- 파일명은 `kebab-case`로 작성한다. 시점이 중요한 문서(회의록 등)는 `YYYY-MM-DD-` 접두어를 붙인다.
- 첨부 이미지는 동일 디렉토리 내 `assets/` 하위에 둔다.
- 새 문서는 카테고리에 맞는 하위 폴더에 추가하고, 새 카테고리가 필요하면 `doc/README.md`에 항목을 함께 갱신한다.
- 코드(`backend/`, `frontend/`)에 직접 영향을 주지 않는 산출물은 모두 `doc/` 하위에 보관한다.

## 코딩 컨벤션

- `any` 타입 사용 최소화, 명시적 타입 정의.
- `console.log`를 프로덕션 코드에 남기지 않는다.
- 컴포넌트 내 직접 API 호출 금지 (feature 훅/api 모듈 사용).
- 컨트롤러에 비즈니스 로직 작성 금지.
- `.env` 파일 커밋 금지. 실제 값 하드코딩 금지.

## CI/CD 및 브랜치 전략

GitHub Actions로 CI/CD를 운영하며, 워크플로우는 `.github/workflows/` 하위에 정의한다.

### 자동 배포

- `main` 브랜치에 push(또는 PR 머지)되는 순간 운영 환경으로 **자동 배포**된다.
- 따라서 `main` 브랜치에는 **최종 개발 및 테스트가 완료된 소스코드만** 올린다.
- `main`에 직접 push 하지 않고, 항상 PR을 통해 머지한다 (가능하면 GitHub에서 브랜치 보호 규칙으로 강제).

### 브랜치 전략

- `main` — 운영 배포 브랜치. 항상 안정 상태를 유지한다.
- `feature/<작업명>` — 그 외 모든 개발 작업은 이 브랜치에서 진행한다.
  - 작업명은 `kebab-case`로 작성하며 작업 내용을 알 수 있게 짓는다.
  - 예: `feature/login-page`, `feature/user-crud`, `feature/db-schema-init`
- 버그 수정·잡일도 동일 규칙을 따른다 (`fix/<작업명>`, `chore/<작업명>` 보조 브랜치 사용 가능).

### 작업 흐름

1. 최신 `main`에서 `feature/<작업명>` 브랜치를 분기한다.
2. 해당 브랜치에서 개발 + 로컬 테스트(`lint`, `test`, `build`)를 완료한다.
3. PR을 생성하고 리뷰·테스트가 통과하면 `main`으로 머지한다.
4. 머지 즉시 GitHub Actions가 운영 환경에 자동 배포한다.

### 머지 전 체크리스트

- `npm run lint`, `npm run test`, `npm run build` 가 모두 통과하는가
- `.env` 등 민감 정보가 포함되어 있지 않은가
- 커밋 메시지가 아래 "커밋 컨벤션"을 따르는가

## 커밋 컨벤션

Conventional Commits를 기반으로 하되, **메시지 본문은 한국어**로 작성한다.

### 형식

```
<type>(<scope>): <subject>

<body>            # 선택. "왜" 변경했는지 설명.

<footer>          # 선택. BREAKING CHANGE, 이슈 참조 등.
```

- `<type>`은 소문자 영어로 작성 (아래 표 참조).
- `<scope>`는 선택이며 변경 범위를 표기한다. 예: `backend`, `frontend`, `doc`, `users`, `auth`, `deps`, `config`.
- `<subject>`는 한국어, **명령형/현재형**으로 50자 이내, 마침표 없음.
- 본문은 한 줄당 72자 이내로 줄바꿈하며 변경 이유와 맥락을 설명한다.
- 호환성을 깨는 변경은 footer에 `BREAKING CHANGE: ...` 로 명시한다.

### 타입 목록

| 타입 | 용도 |
| --- | --- |
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 (`doc/`, README, 주석 등) |
| `style` | 코드 의미에 영향 없는 포맷·세미콜론·공백 변경 |
| `refactor` | 기능·버그 수정 없이 내부 구조 변경 |
| `perf` | 성능 개선 |
| `test` | 테스트 추가·수정 |
| `build` | 빌드 시스템·외부 의존성 변경 (npm 패키지, tsconfig 등) |
| `ci` | CI 설정/스크립트 변경 |
| `chore` | 그 외 잡일 (코드/문서/테스트 외 변경) |
| `revert` | 이전 커밋 되돌리기 |

### 예시

```
feat(frontend/auth): 로그인 페이지 추가
fix(backend/users): 존재하지 않는 사용자 조회 시 NotFoundException 처리
docs(planning): 온보딩 플로우 정책서 초안 작성
refactor(backend/common): TransformInterceptor 응답 포맷 단순화
chore(deps): typeorm 0.3.20 적용
build(frontend): vite 5 alias 설정 정리
```

## 응답 규칙

- 항상 한국어로 응답한다.
- 커밋 메시지도 위 컨벤션에 따라 한국어로 작성한다.
- DB 조회 결과나 인코딩 깨진 한글을 임의 추측하지 않고, 사용자에게 확인을 요청한다.