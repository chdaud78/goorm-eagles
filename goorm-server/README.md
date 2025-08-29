
# 📦 Express + MongoDB 서버 필수 패키지 설명

Node.js 환경에서 **Express + MongoDB 기반 REST API 서버**를 구축할 때 자주 사용하는 패키지들의 용도와 역할을 정리한 문서입니다.

---

## 🌐 서버 & 데이터베이스 관련

### 설치

```bash
npm i express mongoose cors helmet express-rate-limit morgan
npm i jose argon2
npm i dotenv
# (선택) 개발용: nodemon
npm i -D nodemon
```

### 폴더구조
```bash
.
├─ .env
├─ src
│  ├─ server.js
│  ├─ db.js
│  ├─ models/User.js
│  ├─ routes/auth.js
│  ├─ routes/me.js
│  └─ middleware/auth.js
└─ package.json
```

### `express`
- Node.js를 위한 **웹 프레임워크**
- 라우팅(`/users`, `/login` 등), 미들웨어 처리(요청/응답 가공), 에러 핸들링을 지원
- API 서버의 **기본 뼈대**

### `mongoose`
- **MongoDB ODM(Object Data Modeling) 라이브러리**
- MongoDB 컬렉션을 JavaScript 객체/클래스로 다룰 수 있도록 해줌
- 스키마 정의, 유효성 검증, 모델 메서드 등 ORM처럼 편리하게 사용 가능

---

## 🛡️ 보안 & 안전성

### `cors`
- **Cross-Origin Resource Sharing** 설정
- 프론트엔드(예: React/Vite)가 다른 도메인/포트(`http://localhost:5173` ↔ `http://localhost:4000`)에서 API 호출할 수 있도록 허용
- 허용 origin, 메서드, 헤더 등을 제어 가능

### `helmet`
- **HTTP 헤더 보안 미들웨어**
- 기본 보안 헤더를 자동 추가 (`X-Frame-Options`, `Content-Security-Policy`, `X-XSS-Protection` 등)
- 클릭재킹, XSS, MIME-sniffing 같은 취약점 완화

### `express-rate-limit`
- **요청 속도 제한** 미들웨어
- 예: 같은 IP가 15분 동안 100번 이상 로그인 시도 → 차단
- **브루트포스 공격 방지**에 효과적

---

## 📊 로깅 & 운영

### `morgan`
- **HTTP 요청 로거(logger)**
- 콘솔에 `GET /login 200 15ms` 같은 요청/응답 로그 출력
- 개발 시 디버깅, 운영 시 접근 로그 기록에 활용

---

## 🔑 인증 & 암호화

### `jose`
- **JWT & JWE/JWS/JWK 등 최신 표준 암호화 라이브러리**
- Access Token(JWT) 발급 및 검증
- 공개키/비밀키 관리
- 기존 `jsonwebtoken`보다 최신 스펙과 보안 강화된 구현체

### `argon2`
- **비밀번호 해시 함수**
- bcrypt보다 최신이고 보안성이 강력함 (메모리-하드성, GPU 공격 방어)
- 회원가입 시 비밀번호 해시 저장, 로그인 시 해시 검증에 활용

---

## ⚙️ 설정 관리

### `dotenv`
- `.env` 파일에서 환경 변수를 불러와 `process.env`에 주입
- DB URL, JWT 시크릿, 포트 번호 등 민감한 값을 코드에 직접 노출하지 않고 관리

---

## 🛠️ 개발 편의

### `nodemon` (개발용)
- 코드 변경 시 서버를 자동으로 재시작해주는 툴
- 개발 생산성을 크게 향상

---

## 🧩 전체 정리

| 범주         | 패키지                     | 역할 |
|--------------|----------------------------|------|
| 서버 기본    | `express`                  | 웹 서버 & API 라우팅 |
| 데이터베이스 | `mongoose`                 | MongoDB ODM |
| 보안         | `cors`, `helmet`, `express-rate-limit` | CORS 제어, 보안 헤더, 속도 제한 |
| 로깅         | `morgan`                   | 요청/응답 로깅 |
| 인증/암호화  | `jose`, `argon2`           | JWT 발급·검증, 비밀번호 해시 |
| 설정 관리    | `dotenv`                   | 환경 변수 관리 |
| 개발 편의    | `nodemon` (Dev Only)       | 서버 자동 재시작 |

---
## 테스트
```bash
# 헬스체크
curl http://localhost:4000/health
# {"ok":true}

# 회원가입
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"a@a.com","password":"123456","name":"Alice"}'

# 로그인
curl -i -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@a.com","password":"123456"}'
# 응답에 access_token 쿠키 + JSON { accessToken, user } 반환

# 로그인 정보 확인
TOKEN=<<위 로그인 응답의 accessToken>>
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/me

```
---

이 패키지들을 조합하면 **안전하고 확장 가능한 인증/회원가입 가능한 Node.js + MongoDB REST API 서버**를 빠르게 구축할 수 있습니다.
