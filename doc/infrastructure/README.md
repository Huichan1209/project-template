# infrastructure — 배포 서버 구축 가이드

> 본 문서는 **Ubuntu 22.04 LTS** 기준 배포 서버 초기 세팅 절차를 정리한다.
> 배포 자동화 워크플로우(`.github/workflows/deploy.yml`)가 정상 동작하기 위한 사전 준비이다.

## 0. 개요

| 항목 | 사용 기술 |
| --- | --- |
| OS | Ubuntu 22.04 LTS (또는 24.04 LTS) |
| 백엔드 런타임 | Node.js (LTS) + PM2 |
| 프론트엔드 | nginx로 정적 파일 서빙 + `/api` 리버스 프록시 |
| DB | MariaDB |
| 배포 흐름 | GitHub Actions → SSH → 서버에서 `git pull` + 빌드 + PM2 재기동 |

배포 스크립트는 [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) 참고.

---

## 1. 사용자 및 SSH 준비

### 1.1 배포용 사용자 (선택)

`root` 직접 사용 대신 일반 사용자 사용을 권장한다. (기본 `ubuntu` 사용자 그대로 활용 가능.)

```bash
sudo adduser deploy
sudo usermod -aG sudo deploy
```

### 1.2 SSH 키 발급 (서버에서)

GitHub Actions가 사용할 비공개 키를 서버에서 발급한다.

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

- `~/.ssh/github_deploy` (비공개 키) 내용을 GitHub Secrets `SSH_KEY`에 그대로 등록한다 (`-----BEGIN ... -----END` 줄 포함, 마지막 줄바꿈까지).
- 서버 재진입 테스트:
  ```bash
  ssh -i ~/.ssh/github_deploy <user>@<host>
  ```

---

## 2. 기본 패키지 설치

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential rsync
```

---

## 3. Node.js 설치 (nvm 권장)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm alias default lts/*
node -v && npm -v
```

> `deploy.yml` 스크립트는 `~/.nvm/nvm.sh` 를 자동으로 로드한다. 시스템 패키지로 Node를 설치한 경우에는 해당 두 줄을 deploy.yml에서 삭제해도 된다.

---

## 4. PM2 설치 및 부팅 자동 시작

```bash
npm i -g pm2
pm2 startup systemd
# 출력되는 sudo env PATH=... pm2 startup ... 명령을 그대로 복사해 실행
```

배포 후에는 항상 `pm2 save`를 호출해 현재 상태를 디스크에 기록한다 (재부팅 시 자동 복원).

---

## 5. MariaDB 설치 및 초기 설정

```bash
sudo apt install -y mariadb-server
sudo systemctl enable --now mariadb
sudo mysql_secure_installation
```

DB와 애플리케이션 사용자 생성:

```sql
CREATE DATABASE crgdv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crgdv'@'localhost' IDENTIFIED BY '<강한 비밀번호>';
GRANT ALL PRIVILEGES ON crgdv.* TO 'crgdv'@'localhost';
FLUSH PRIVILEGES;
```

위 값은 `backend/.env` 의 `DB_*` 값과 일치시킨다.

---

## 6. nginx 설치 및 설정

```bash
sudo apt install -y nginx
sudo systemctl enable --now nginx
```

`/etc/nginx/sites-available/crgdv`:

```nginx
server {
    listen 80;
    server_name your-domain.com;   # 도메인이 없으면 _ 또는 서버 IP

    root /var/www/frontend;
    index index.html;

    # SPA 라우팅 fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 백엔드 API 프록시
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 20M;
}
```

활성화:

```bash
sudo ln -s /etc/nginx/sites-available/crgdv /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

정적 파일 디렉토리 생성 및 권한:

```bash
sudo mkdir -p /var/www/frontend
sudo chown -R "$USER":"$USER" /var/www/frontend
```

> 위처럼 배포 사용자 소유로 바꿔두면 `deploy.yml`의 `sudo rsync ... /var/www/frontend/` 에서 **`sudo`를 제거**할 수 있다 (권장). 그러면 sudoers 설정이 필요 없다.

---

## 7. 프로젝트 클론 및 환경변수 배치

```bash
cd ~
git clone <repo-url> project-template
cd project-template
```

각 패키지의 `.env.sample` 을 `.env`로 복사 후 실제 값으로 수정한다 (DB 비밀번호, JWT 시크릿 등).

```bash
cp backend/.env.sample backend/.env
nano backend/.env

cp frontend/.env.sample frontend/.env
nano frontend/.env
```

> `.env` 파일은 `.gitignore`에 등록되어 있어 git pull로 덮어써지지 않는다.
> 서버에서 한 번만 작성해두면 된다.

---

## 8. sudo 권한 (선택)

배포 스크립트에서 `sudo rsync`를 그대로 두려면 다음 중 하나 선택:

### 옵션 A: nginx 디렉토리 소유권 변경 + `sudo` 제거 (권장)

```bash
sudo chown -R "$USER":"$USER" /var/www/frontend
```

이 경우 `deploy.yml`의 `sudo rsync ...` → `rsync ...` 로 수정하면 sudoers 설정이 불필요하다.

### 옵션 B: NOPASSWD sudoers 설정

```bash
sudo visudo -f /etc/sudoers.d/deploy
```

```text
ubuntu ALL=(ALL) NOPASSWD: /usr/bin/rsync
```

> `ubuntu`는 실제 배포 사용자명으로 바꾼다.

---

## 9. 방화벽 (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 10. (선택) HTTPS — Let's Encrypt

도메인이 있는 경우:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
sudo systemctl status certbot.timer   # 자동 갱신 확인
```

---

## 11. 첫 배포 검증 (수동)

GitHub Actions를 돌리기 전에 서버에서 직접 한 번 빌드/구동을 검증한다.

```bash
# 백엔드
cd ~/project-template/backend
npm ci
npm run build
pm2 start dist/main.js --name backend --update-env
pm2 save
pm2 logs backend --lines 50

# 프론트엔드
cd ~/project-template/frontend
npm ci
npm run build
rsync -av --delete dist/ /var/www/frontend/
```

확인:

- 브라우저 `http://<server-ip>/` → 프론트 화면 표시
- `http://<server-ip>/api/...` → 백엔드 응답
- `pm2 status` 에서 `backend` 가 `online`

---

## 12. GitHub Secrets 등록

저장소 → **Settings → Secrets and variables → Actions → New repository secret**

| 이름 | 값 |
| --- | --- |
| `HOST` | 서버 IP 또는 도메인 (`123.45.67.89` 또는 `your-domain.com`) |
| `USERNAME` | SSH 접속 사용자명 (`ubuntu`, `deploy` 등) |
| `SSH_KEY` | `~/.ssh/github_deploy` 비공개 키의 **전체 내용** (BEGIN/END 라인 포함) |
| `PORT` *(선택)* | SSH 포트가 22 외인 경우. 사용 시 `deploy.yml`에 `port: ${{ secrets.PORT }}` 추가 |

> Secrets 미등록 상태에서 `main`에 push해도 워크플로우는 경고만 남기고 **success**로 끝난다 (배포 단계가 자동으로 스킵됨). 모든 secret 등록 후 다음 push부터 실제 배포가 진행된다.

---

## 13. 트러블슈팅

| 증상 | 점검 |
| --- | --- |
| 워크플로우 실패: `dial tcp: ... i/o timeout` | 보안그룹/방화벽에서 SSH 포트 허용 여부, `HOST` 값 확인 |
| 워크플로우 실패: `Permission denied (publickey)` | `SSH_KEY` 값(개행 포함 전체 내용), `authorized_keys` 등록 확인 |
| 사이트 502 Bad Gateway | `pm2 status`로 백엔드 동작 확인, `pm2 logs backend` 로 에러 확인 |
| 사이트 404 / 빈 화면 | `/var/www/frontend/index.html` 존재 확인, nginx `root` 경로 일치 확인 |
| `npm ci` 실패 | Node 버전 mismatch — nvm으로 LTS 사용, `node -v` 확인 |
| DB 연결 실패 | `backend/.env` 의 `DB_*` 값과 MariaDB 사용자/비밀번호 일치 확인 |
| 빌드는 성공했는데 변경사항 미반영 | 브라우저 캐시 / `pm2 reload backend --update-env` 누락 / `rsync --delete` 미동작 여부 확인 |

---

## 14. 체크리스트 요약

- [ ] 배포 사용자 + SSH 키 등록 완료
- [ ] Node.js (LTS) + PM2 설치, `pm2 startup` 등록
- [ ] MariaDB 설치 및 `crgdv` DB/사용자 생성
- [ ] nginx 설치 + `sites-available/crgdv` 설정 + reload
- [ ] `~/project-template` git clone
- [ ] `backend/.env`, `frontend/.env` 작성
- [ ] `/var/www/frontend` 디렉토리 생성 + 권한 설정
- [ ] UFW 방화벽 규칙 적용
- [ ] (선택) Let's Encrypt HTTPS 인증서 발급
- [ ] 수동 빌드/배포로 동작 검증
- [ ] GitHub Secrets (`HOST`, `USERNAME`, `SSH_KEY`) 등록
