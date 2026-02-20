import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
# from groq import Groq

# .env 파일에서 환경 변수 로드
load_dotenv()

# frontend 폴더를 정적 파일 루트로 설정
app = Flask(__name__, static_folder='../frontend', static_url_path='')
# 모든 도메인에서의 요청을 허용하도록 CORS 설정 (개발용)
CORS(app)

# Groq 클라이언트 초기화 (1단계에서는 주석 처리)
# api_key = os.environ.get("GROQ_API_KEY")
# if not api_key:
#     print("경고: GROQ_API_KEY 환경 변수가 설정되지 않았습니다.")
# client = Groq(api_key=api_key)

@app.route('/')
def serve_index():
    """- frontend/index.html 을 기본 페이지로 제공"""
    return app.send_static_file('index.html')

@app.route('/health')
def health_check():
    """서버 상태를 확인하기 위한 헬스 체크 엔드포인트"""
    return jsonify({"status": "ok"}), 200

@app.route('/api/convert', methods=['POST'])
def convert_text():
    """
    텍스트 변환을 처리하는 API 엔드포인트.
    1단계에서는 실제 AI 연동 대신 더미 응답을 반환합니다.
    """
    try:
        data = request.get_json()
        original_text = data.get('text', '')
        target = data.get('target', 'unknown')

        if not original_text:
            return jsonify({"error": "텍스트를 입력해주세요."}), 400

        # 1단계: 더미 응답 로직
        dummy_response = f"'{original_text}'에 대한 '{target}' 대상의 더미 변환 결과입니다. "
        
        # 실제 Groq API 호출 로직 (3단계에서 구현 예정)
        # chat_completion = client.chat.completions.create(...)
        # converted_text = chat_completion.choices[0].message.content

        return jsonify({
            "original_text": original_text,
            "converted_text": dummy_response
        })

    except Exception as e:
        # 간단한 에러 로깅
        print(f"Error in /api/convert: {e}")
        return jsonify({"error": "서버에서 오류가 발생했습니다."}), 500

if __name__ == '__main__':
    # Vercel 환경에서는 gunicorn과 같은 WSGI 서버를 사용하므로,
    # 이 부분은 로컬 개발 시에만 실행됩니다.
    app.run(debug=True, port=5000)
