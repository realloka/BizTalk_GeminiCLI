# GEMINI.md: BizTone Converter 백엔드 개요

이 문서는 BizTone Converter 프로젝트의 백엔드(backend) 부분에 특화된 개요를 제공하며, Gemini AI와의 향후 상호작용을 위한 지침으로 사용됩니다.

## 1. 백엔드 프로젝트 개요

BizTone Converter의 백엔드는 Python 기반의 Flask 웹 프레임워크를 사용하여 구축된 RESTful API 서버입니다. 이 서버는 프론트엔드(frontend) 애플리케이션의 요청을 처리하고, Groq AI API와 통신하여 텍스트 변환의 핵심 로직을 수행합니다. 또한, 정적(static) 프론트엔드 파일을 클라이언트에 제공하는 역할도 담당합니다.

### 주요 역할:
-   프론트엔드 정적 파일 서빙(serving)
-   API 엔드포인트(endpoint)를 통한 텍스트 변환 요청 처리
-   Groq AI API 호출 및 응답 처리
-   데이터 유효성 검사(validation) 및 오류(error) 처리

## 2. 기술 스택 (Technical Stack)

-   **언어:** Python 3.1.x
-   **웹 프레임워크:** Flask==2.3.2
-   **환경 변수 관리:** python-dotenv==1.0.0
-   **CORS 처리:** Flask-Cors==4.0.0
-   **AI 클라이언트:** groq==0.9.0 (현재 `requirements.txt`에 명시된 버전)
-   **AI 모델:** Groq AI API (kimi-k2-instruct-0905 모델 사용)

## 3. 백엔드 빌드 및 실행 방법

### 전제 조건:
-   Python 3.10+
-   `pip` (Python 패키지 설치 관리자)
-   Groq API 키

### 설정:

1.  **`backend/` 디렉토리로 이동:**
    ```bash
    cd backend
    ```

2.  **Python 가상 환경(virtual environment) 생성 및 활성화 (권장):**
    ```bash
    python -m venv .venv
    # Windows:
    .venv\Scripts\activate
    # Linux/macOS:
    source .venv/bin/activate
    ```

3.  **Python 의존성(dependencies) 설치:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Groq API 키 구성:**
    프로젝트 **루트 디렉토리** (즉, `backend` 폴더의 상위 폴더)에 `.env` 파일을 생성하고, 다음과 같이 Groq API 키를 추가합니다:
    ```
    GROQ_API_KEY="YOUR_GROQ_API_KEY_HERE"
    ```
    `"YOUR_GROQ_API_KEY_HERE"`를 실제 Groq API 키로 교체하십시오.

### 백엔드 서버 실행:

1.  **Flask 애플리케이션 실행:**
    *   가상 환경이 활성화되어 있고 `backend/` 디렉토리에 있는지 확인합니다.
    *   다음 명령어를 사용하여 Flask 서버를 시작합니다:
        ```bash
        python app.py
        ```
    *   서버는 기본적으로 `http://127.0.0.1:5000/`에서 실행되며, 프론트엔드 파일들을 서빙(serving)하고 API 요청을 처리할 준비가 됩니다.

## 4. API 엔드포인트 (API Endpoints)

백엔드는 다음과 같은 주요 엔드포인트(endpoint)를 제공합니다:

### 4.1. 정적 파일 서빙 (GET `/`)
-   **경로:** `/`
-   **메서드:** `GET`
-   **설명:** 프론트엔드의 `index.html` 파일을 포함한 정적 웹 자산(static web assets)을 제공합니다. 사용자가 브라우저에서 서비스에 접근할 때 사용됩니다.

### 4.2. 헬스 체크 (GET `/health`)
-   **경로:** `/health`
-   **메서드:** `GET`
-   **설명:** 서버의 현재 상태를 확인하기 위한 헬스 체크(health check) 엔드포인트입니다.
-   **응답 (Response):** `application/json`
    ```json
    {
        "status": "ok"
    }
    ```

### 4.3. 텍스트 변환 (POST `/api/convert`)
-   **경로:** `/api/convert`
-   **메서드:** `POST`
-   **설명:** 사용자가 입력한 텍스트를 지정된 대상에 맞춰 업무용 말투로 변환을 요청합니다. Groq AI API를 호출하여 변환을 수행합니다.
-   **요청 (Request):** `application/json`
    -   `text` (string, 필수): 변환할 원본 텍스트 (최대 500자).
    -   `target` (string, 필수): 변환 대상 ("upward", "lateral", "external" 중 하나).
    ```json
    {
        "text": "안녕하세요, 점심 메뉴 뭐 먹을까요?",
        "target": "lateral"
    }
    ```
-   **응답 (Response):** `application/json`
    -   `original_text` (string): 요청에 포함된 원본 텍스트.
    -   `converted_text` (string): Groq AI를 통해 변환된 텍스트.
    ```json
    {
        "original_text": "안녕하세요, 점심 메뉴 뭐 먹을까요?",
        "converted_text": "안녕하세요, 점심 식사 메뉴에 대해 여쭤보고자 합니다."
    }
    ```
-   **오류 응답 (Error Responses):**
    -   **400 Bad Request:** 잘못된 요청 형식, `text` 누락, `text` 길이 초과(500자), 지원하지 않는 `target` 값.
    -   **500 Internal Server Error:** 백엔드 처리 중 예외 발생, Groq AI API 호출 실패.
    -   **503 Service Unavailable:** Groq API 키가 설정되지 않아 AI 서비스가 비활성화된 경우.

## 5. 환경 변수 (Environment Variables)

-   `GROQ_API_KEY`: Groq AI 서비스와의 인증에 사용되는 API 키입니다. 보안을 위해 `.env` 파일 또는 배포 환경의 설정을 통해 관리해야 합니다.

## 6. 개발 규칙 (Development Conventions)

### 환경 변수 관리:
-   민감한 정보(예: API 키)는 `os.environ.get()`을 통해 로드되며, 프로젝트 **루트 디렉토리**의 `.env` 파일에 저장됩니다. `.env` 파일은 `.gitignore`에 포함되어 버전 관리 시스템에 의해 추적되지 않습니다.

### CORS 설정:
-   개발 편의를 위해 `Flask-CORS`를 사용하여 모든 출처(origin)에서의 요청을 허용하도록 설정되어 있습니다. 프로덕션(production) 환경에서는 보안 강화를 위해 허용된 출처를 명시적으로 지정하는 것이 권장됩니다.

### 오류 처리 및 로깅:
-   API 엔드포인트는 입력 유효성 검사 및 Groq AI API 호출 중 발생할 수 있는 잠재적인 오류를 처리합니다.
-   오류 발생 시 콘솔에 기본 로깅(logging)이 이루어지며, 클라이언트에는 사용자 친화적인 오류 메시지를 JSON 형태로 반환합니다.

### AI 프롬프트 엔지니어링:
-   `PROMPTS` 딕셔너리(dictionary)에 각 대상("upward", "lateral", "external")에 최적화된 시스템 프롬프트가 한국어로 정의되어 있습니다. 이 프롬프트는 Groq AI 모델의 응답 톤과 스타일을 안내하는 데 사용됩니다.
