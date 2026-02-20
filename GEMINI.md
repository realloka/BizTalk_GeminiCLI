# GEMINI.md: BizTone Converter 프로젝트 개요

이 문서는 "BizTone Converter - 업무 말투 자동 변환 솔루션" 프로젝트에 대한 개요를 제공하며, Gemini AI와의 향후 상호작용을 위한 지침으로 사용됩니다.

## 1. 프로젝트 개요

BizTone Converter는 일상적인 표현을 특정 대상(상사, 동료, 고객)에 맞춰 전문적인 비즈니스 언어로 변환하는 AI 기반 웹 솔루션입니다. 이는 전문적인 환경 내에서 커뮤니케이션 효율성과 품질을 향상시키는 것을 목표로 합니다.

### 주요 기능:
-   **대상별 어조 변환(Audience-Specific Tone Conversion):** 의도된 수신자(상사, 동료, 고객)에 따라 텍스트를 조정합니다.
-   **직관적인 웹 인터페이스(Intuitive Web Interface):** 다양한 장치에서 사용하기 쉽고 반응형(responsive) 사용자 경험(UX)을 제공합니다.
-   **빠르고 신뢰성 있는(Fast and Reliable) 서비스:** 빠른 응답 시간(평균 3초)과 높은 서비스 가용성을 목표로 합니다.

### 주요 기술 스택:
-   **프론트엔드(Frontend):** HTML5, CSS3 (스타일링에 Tailwind CSS 사용), JavaScript (ES6+)
-   **백엔드(Backend):** Python 3.1.x, Flask 2.3.x (RESTful API), Flask-CORS, python-dotenv
-   **AI 통합:** Groq AI API ("kimi-k2-instruct-0905" 모델 사용)
-   **배포(Deployment):** Vercel (정적 호스팅 및 서버리스 함수), GitHub (버전 관리)

### 아키텍처:
프로젝트는 클라이언트-서버(client-server) 아키텍처를 따릅니다. Flask 백엔드는 정적 프론트엔드 파일을 제공하고 `/api/convert` 엔드포인트(endpoint)를 노출합니다. 프론트엔드(HTML, CSS, JS)는 이 백엔드 API에 비동기(asynchronous) 호출을 수행하며, 백엔드는 텍스트 변환을 위해 Groq AI API와 상호작용합니다.

## 2. 빌드 및 실행 방법

BizTone Converter를 로컬에서 설정하고 실행하려면 다음 단계를 따르십시오:

### 전제 조건:
-   Python 3.10 이상
-   `pip` (Python 패키지 설치 관리자)
-   Groq API 키

### 설정:

1.  **리포지토리(repository) 클론(Clone):**
    ```bash
    git clone <repository-url>
    cd biztone-converter
    ```

2.  **백엔드 환경 설정:**
    *   `backend/` 디렉토리로 이동:
        ```bash
        cd backend
        ```
    *   Python 가상 환경(virtual environment) 생성 (권장):
        ```bash
        python -m venv .venv
        source .venv/bin/activate  # Linux/macOS
        .venv\Scripts\activate     # Windows
        ```
    *   Python 의존성(dependencies) 설치:
        ```bash
        pip install -r requirements.txt
        ```
    *   **Groq API 키 구성:**
        프로젝트 루트 디렉토리(예: `C:\gemini-biztalk\.env`)에 `.env` 파일을 생성하고 Groq API 키를 추가합니다:
        ```
        GROQ_API_KEY="YOUR_GROQ_API_KEY_HERE"
        ```
        `"YOUR_GROQ_API_KEY_HERE"`를 실제 Groq API 키로 교체하십시오.

### 애플리케이션 실행:

1.  **Flask 백엔드 서버 시작:**
    *   가상 환경이 활성화되어 있고 `backend/` 디렉토리에 있는지 확인합니다.
    *   Flask 애플리케이션 실행:
        ```bash
        python app.py
        ```
    *   서버는 일반적으로 `http://127.0.0.1:5000/`에서 실행됩니다.

2.  **프론트엔드 접속:**
    *   Flask 백엔드가 실행되면 웹 브라우저를 열고 `http://127.0.0.1:5000/`로 이동합니다. Flask 애플리케이션은 `frontend/` 디렉토리에서 `index.html`을 제공합니다.

## 3. 개발 규칙

### 버전 관리:
-   프로젝트는 Git을 사용하여 버전 관리를 하며, `feature` -> `develop` -> `main` 브랜치(branch) 전략을 권장합니다.
-   모든 코드 변경 사항은 코드 리뷰(code review)를 위해 Pull Request(PR)를 통해 이루어져야 합니다.
-   의미 있고 설명적인 커밋 메시지(commit message)를 사용하는 것이 좋습니다.

### 환경 변수:
-   `GROQ_API_KEY`와 같은 민감한 정보는 환경 변수를 사용하여 관리해야 합니다.
-   로컬 개발을 위해 프로젝트 루트에 `.env` 파일을 사용합니다(`python-dotenv`가 로딩 처리).
-   배포(예: Vercel)를 위해서는 클라이언트 측 코드에 노출되지 않도록 배포 플랫폼 설정에서 환경 변수를 직접 구성해야 합니다.

### 프론트엔드 스타일링:
-   프론트엔드는 Tailwind CSS를 활용하여 유틸리티 우선(utility-first) 접근 방식으로 스타일링되어 현대적이고 반응형(responsive) 디자인을 보장합니다.

### 반응형 디자인:
-   애플리케이션은 데스크톱, 태블릿 및 모바일 장치 전반에 걸쳐 최적의 사용자 경험을 제공하도록 완전히 반응형으로 설계되었습니다.

### 오류 처리:
-   프론트엔드와 백엔드 모두 API 실패 또는 기타 문제 발생 시 사용자에게 친숙한 피드백과 시스템 로깅(logging)을 제공하는 오류 처리 메커니즘을 포함합니다.
