# doc — 프로젝트 문서

기획·설계·운영 등 코드 외 산출물을 모아두는 디렉토리.

## 디렉토리 구조

```
doc/
├── README.md           # 본 문서 (인덱스)
├── planning/           # 기획 문서 (요구사항, 화면 정의서, 정책서 등)
├── architecture/       # 아키텍처·설계 문서 (시스템 구조, 시퀀스 다이어그램 등)
├── db/                 # 데이터베이스 (ERD, 스키마, 마이그레이션 노트)
├── infrastructure/     # 인프라/배포 (서버 세팅, 배포 절차, 운영 메모)
└── meeting/            # 회의록
```

## 작성 규칙

- 모든 문서는 **Markdown(`.md`)** 으로 작성한다. 다이어그램은 가능하면 **Mermaid** 코드 블록을 사용해 텍스트로 관리한다.
- 파일명은 `kebab-case`로 작성하고, 회의록처럼 시점이 중요한 문서는 앞에 `YYYY-MM-DD-` 접두어를 붙인다.
  - 예: `planning/user-onboarding-flow.md`, `meeting/2026-04-28-kickoff.md`
- 이미지 등 첨부 파일은 같은 디렉토리 내 `assets/` 하위에 둔다.
  - 예: `planning/assets/onboarding-wireframe.png`
- 한국어로 작성하며, 핵심 용어는 영문 병기를 허용한다.

## 카테고리별 가이드

| 폴더 | 다루는 문서 |
| --- | --- |
| `planning/` | 제품 요구사항(PRD), 사용자 시나리오, 화면 정의서, 정책서 |
| `architecture/` | 시스템 아키텍처, 모듈 의존 관계, 주요 시퀀스, ADR(아키텍처 결정 기록) |
| `db/` | ERD, 테이블 정의, 인덱스 전략, 마이그레이션 메모 |
| `infrastructure/` | 배포 서버 세팅, CI/CD 운영 메모, 인프라 변경 이력 |
| `meeting/` | 회의록, 의사결정 기록, 액션 아이템 |
