# AI Rules

> 이 문서는 AI 코딩 도구가 본 프로젝트에서 코드를 생성·수정할 때 반드시 따라야 하는 규칙을 정의한다.

## 1. 프로젝트 개요

- **모노레포 구조**: 최상위에 `backend/`(NestJS), `frontend/`(React+Vite), `doc/`(프로젝트 문서) 분리
- **언어**: TypeScript (백엔드·프론트엔드 모두)
- **DB**: MariaDB + TypeORM
- **문서**: 기획·설계·회의록 등 코드 외 산출물은 `doc/` 하위에서 관리

## 2. 공통 규칙

- 모든 응답은 **한국어**로 작성한다.
- 커밋 메시지도 **한국어**로 작성한다.
- DB 조회 결과, 빌드 로그, 인코딩 깨짐으로 읽을 수 없는 한글을 **임의로 추측하지 않고** 사용자에게 확인을 요청한다.
- `.env` 파일의 실제 값(비밀번호, 키 등)을 코드에 하드코딩하지 않는다.
- 새 파일 생성 시 기존 프로젝트의 네이밍 컨벤션과 디렉토리 구조를 따른다.

## 3. 백엔드 (NestJS) 패키지 구조 및 규칙

```
backend/src/
├── common/              # 전역 공통 모듈
│   ├── decorators/      # 커스텀 데코레이터 (@CurrentUser 등)
│   ├── filters/         # 예외 필터 (HttpExceptionFilter)
│   ├── guards/          # 인증/인가 가드 (JwtAuthGuard 등)
│   ├── interceptors/    # 응답 인터셉터 (TransformInterceptor)
│   └── utils/           # 공통 유틸 함수
├── config/              # 환경변수 및 외부 설정
├── database/            # DB 연결·마이그레이션 설정
├── domains/             # 도메인(기능)별 모듈 — 핵심 비즈니스 로직
│   └── <domain>/
│       ├── dto/         # CreateXxxDto, UpdateXxxDto 등
│       ├── entities/    # TypeORM 엔티티
│       ├── <domain>.controller.ts
│       ├── <domain>.service.ts
│       └── <domain>.module.ts
├── app.module.ts        # 루트 모듈
└── main.ts              # 엔트리 포인트
```

### 3.1 도메인 추가 규칙

- 새 기능은 반드시 `domains/<도메인명>/` 하위에 모듈을 생성한다.
- 하나의 도메인 디렉토리에는 `module`, `controller`, `service`, `dto/`, `entities/` 가 포함된다.
- 도메인 간 의존이 필요하면 해당 모듈을 `exports`로 내보내고 상대 모듈에서 `imports`한다.
- Entity 클래스명은 PascalCase 단수형(`User`, `Post`), 테이블명은 복수형(`users`, `posts`)을 사용한다.
- DTO 파일명은 `create-<domain>.dto.ts`, `update-<domain>.dto.ts` 형식을 따른다.
- DTO에는 `class-validator` 데코레이터를 반드시 적용한다.

### 3.2 컨트롤러 규칙

- REST API prefix는 `/api`이다 (`main.ts`에서 `setGlobalPrefix('api')` 설정됨).
- 컨트롤러는 라우팅과 요청/응답 처리만 담당하고, 비즈니스 로직은 서비스에 위임한다.
- 파라미터 검증은 `ParseIntPipe` 등 내장 파이프를 활용한다.

### 3.3 서비스 규칙

- 서비스에서 TypeORM Repository를 `@InjectRepository()`로 주입받는다.
- 존재하지 않는 리소스 접근 시 `NotFoundException`을 던진다.
- 중복 검사 등 비즈니스 검증은 서비스 레이어에서 처리한다.

### 3.4 공통 모듈 규칙

- `common/` 하위 항목은 특정 도메인에 종속되지 않는 전역 코드만 둔다.
- 필터, 가드, 인터셉터는 각각의 전용 디렉토리에 배치한다.

## 4. 프론트엔드 (React + Vite) 패키지 구조 및 규칙

```
frontend/src/
├── assets/              # 이미지, 폰트 등 정적 파일
├── components/          # 도메인 무관 공통 UI 컴포넌트 (Layout, Button, Modal 등)
├── constants/           # 공통 상수 (URL, 에러 메시지 등)
├── features/            # 기능(Feature)별 컴포넌트·로직 묶음
│   └── <feature>/
│       ├── components/  # 해당 기능 전용 컴포넌트
│       ├── hooks/       # 해당 기능 전용 커스텀 훅
│       └── api.ts       # 해당 기능 API 호출 함수
├── hooks/               # 도메인 무관 공통 커스텀 훅
├── pages/               # 라우터에 연결될 페이지 컴포넌트 (레이아웃 배치 역할)
├── routes/              # React Router 설정
├── store/               # 전역 상태 관리
├── styles/              # 전역 스타일 (global.css, 테마 등)
├── utils/               # 유틸리티 함수
├── App.tsx
└── main.tsx
```

### 4.1 Feature 추가 규칙

- 새 기능은 `features/<기능명>/` 하위에 `components/`, `hooks/`, `api.ts`를 생성한다.
- Feature 내부 컴포넌트는 해당 feature에서만 사용하고, 범용 컴포넌트는 `components/`로 승격시킨다.
- API 호출 함수는 각 feature의 `api.ts`에 모아두고, axios 인스턴스를 공유한다.

### 4.2 컴포넌트 규칙

- 컴포넌트는 **함수형 컴포넌트**(function 선언)로 작성한다.
- 스타일은 **CSS Modules** (`*.module.css`)을 사용한다.
- 컴포넌트 파일명은 PascalCase(`UserForm.tsx`), 훅은 camelCase(`useUsers.ts`)로 작성한다.
- 페이지 컴포넌트(`pages/`)는 UI 배치만 담당하고, 데이터 로직은 feature 훅에 위임한다.

### 4.3 라우팅 규칙

- 라우팅 설정은 `routes/AppRouter.tsx`에 중앙 관리한다.
- 레이아웃 컴포넌트는 `<Outlet />`을 사용하여 중첩 라우팅을 지원한다.

### 4.4 경로 alias

- `@/*` → `src/*` alias가 설정되어 있으므로, import 시 `@/features/...`, `@/components/...` 형식을 사용한다.

## 5. 문서 패키지 구조 및 규칙 (doc)

```
doc/
├── README.md           # 문서 인덱스 및 작성 규칙
├── planning/           # 기획 문서 (요구사항, 화면 정의서, 정책서)
├── architecture/       # 아키텍처·설계 문서 (시스템 구조, 시퀀스, ADR)
├── db/                 # ERD, 스키마, 마이그레이션 노트
├── infrastructure/     # 인프라/배포 (서버 세팅, CI/CD 운영 메모)
└── meeting/            # 회의록 (YYYY-MM-DD- 접두어 사용)
```

### 5.1 문서 작성 규칙

- 모든 문서는 Markdown(`.md`)으로 작성하며, 다이어그램은 가능하면 Mermaid 코드 블록을 활용한다.
- 파일명은 `kebab-case`를 사용하고, 시점이 중요한 문서(회의록 등)는 `YYYY-MM-DD-` 접두어를 붙인다.
- 첨부 이미지·파일은 같은 디렉토리 내 `assets/` 하위에 보관한다.
- 새 카테고리를 추가할 경우 `doc/README.md`의 디렉토리 구조 표도 함께 갱신한다.
- 코드 변경을 동반하지 않는 기획·정책·결정 사항은 반드시 `doc/` 하위에 산출물을 남긴다.

## 6. CI/CD 및 브랜치 전략

GitHub Actions로 CI/CD를 운영한다. 워크플로우는 `.github/workflows/` 하위에 정의한다.

### 6.1 자동 배포

- `main` 브랜치에 push(또는 PR 머지)되는 즉시 운영 환경으로 **자동 배포**된다.
- 따라서 `main` 브랜치에는 **최종 개발 및 테스트가 완료된 소스코드만** 올린다.
- `main`에 직접 push 하지 않고 반드시 PR을 통해 머지한다. GitHub의 브랜치 보호 규칙(직접 push 차단, PR 필수, 상태 체크 통과 필수)을 적용한다.

### 6.2 브랜치 전략

- `main` — 운영 배포 브랜치. 항상 안정 상태를 유지한다.
- `feature/<작업명>` — 그 외 **모든 개발 작업은 이 브랜치에서 진행**한다.
  - 작업명은 `kebab-case`로, 작업 내용이 한눈에 드러나도록 짓는다.
  - 예: `feature/login-page`, `feature/user-crud`, `feature/db-schema-init`
- 버그 수정·잡일은 `fix/<작업명>`, `chore/<작업명>` 보조 브랜치를 사용할 수 있다.
- 한 번 머지된 작업 브랜치는 삭제하여 브랜치 목록을 깔끔하게 유지한다.

### 6.3 작업 흐름

1. 최신 `main`에서 `feature/<작업명>` 브랜치를 분기한다.
2. 해당 브랜치에서 개발 + 로컬 테스트(`lint`, `test`, `build`)를 완료한다.
3. PR을 생성하고 리뷰·CI 통과 후 `main`으로 머지한다.
4. 머지 직후 GitHub Actions가 운영 환경에 자동 배포한다.

### 6.4 머지 전 체크리스트

- [ ] `npm run lint`, `npm run test`, `npm run build` 가 모두 통과하는가
- [ ] `.env` 등 민감 정보가 포함되어 있지 않은가
- [ ] 커밋 메시지가 "7. 커밋 컨벤션" 규칙을 따르는가
- [ ] 운영 배포가 즉시 발생함을 인지하고 있는가 (불완전한 코드 머지 금지)

## 7. 커밋 컨벤션

Conventional Commits 형식을 따르되, **메시지 본문은 한국어**로 작성한다.

### 7.1 형식

```
<type>(<scope>): <subject>

<body>            # 선택. 변경 이유와 맥락 설명.

<footer>          # 선택. BREAKING CHANGE, 이슈 참조 등.
```

- `<type>`은 소문자 영어로 작성한다 (7.2 표 참조).
- `<scope>`는 선택이며 변경 범위를 나타낸다. 예: `backend`, `frontend`, `doc`, `users`, `auth`, `deps`, `config`.
- `<subject>`는 한국어로, **명령형/현재형**, 50자 이내, 끝에 마침표를 붙이지 않는다.
- 본문은 한 줄당 72자 이내로 줄바꿈하며 "왜" 변경했는지를 설명한다.
- 호환성을 깨는 변경이 있으면 footer에 `BREAKING CHANGE: <설명>` 을 추가한다.
- 한 커밋에는 가능하면 한 타입의 변경만 묶는다 (예: 기능 추가와 리팩터링은 분리).

### 7.2 타입 목록

| 타입 | 용도 |
| --- | --- |
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 (`doc/`, README, 코드 주석 등) |
| `style` | 코드 의미에 영향 없는 포맷·세미콜론·공백 변경 |
| `refactor` | 기능·버그 수정 없이 내부 구조 변경 |
| `perf` | 성능 개선 |
| `test` | 테스트 추가·수정 |
| `build` | 빌드 시스템 또는 외부 의존성 변경 (npm 패키지, tsconfig, vite 등) |
| `ci` | CI 설정/스크립트 변경 |
| `chore` | 위 항목에 해당하지 않는 잡일 |
| `revert` | 이전 커밋 되돌리기 (원본 커밋 해시를 본문에 명시) |

### 7.3 예시

```
feat(frontend/auth): 로그인 페이지 추가
fix(backend/users): 존재하지 않는 사용자 조회 시 NotFoundException 처리
docs(planning): 온보딩 플로우 정책서 초안 작성
refactor(backend/common): TransformInterceptor 응답 포맷 단순화
chore(deps): typeorm 0.3.20 적용
build(frontend): vite 5 alias 설정 정리
```

## 8. 금지 사항

- `any` 타입 사용을 최소화하고, 타입을 명시적으로 정의한다.
- `console.log`를 프로덕션 코드에 남기지 않는다.
- 컴포넌트 내에서 직접 API를 호출하지 않고, feature 훅 또는 api 모듈을 통한다.
- 백엔드 컨트롤러에 비즈니스 로직을 작성하지 않는다.
- `.env` 파일을 커밋하지 않는다.
- `main` 브랜치에 직접 push하지 않는다 (반드시 `feature/<작업명>` → PR → 머지 흐름을 따른다).
- 개발 중이거나 테스트가 끝나지 않은 코드를 `main`에 머지하지 않는다 (머지 즉시 운영 배포된다).
