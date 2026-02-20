import os
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

# .env 파일에서 환경 변수 로드
load_dotenv()

# frontend 폴더를 정적 파일 루트로 설정
app = Flask(__name__, static_folder='../frontend', static_url_path='')
# 모든 도메인에서의 요청을 허용하도록 CORS 설정 (개발용)
CORS(app)

# --- Groq 클라이언트 초기화 ---
api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    # 프로덕션 환경에서는 API 키가 없으면 실행을 중지하는 것이 더 안전할 수 있습니다.
    # 여기서는 경고만 출력하고 넘어갑니다.
    print("경고: GROQ_API_KEY 환경 변수가 설정되지 않았습니다. API 호출이 실패합니다.")
    # 로컬 개발 시 키가 없어도 앱이 실행되도록 None으로 설정
    client = None
else:
    client = Groq(api_key=api_key)

# --- 대상별 프롬프트 정의 ---
PROMPTS = {
    "upward": "당신은 부하 직원의 보고를 상사에게 전달하기에 가장 적합하고 정중한 비즈니스 어투로 바꾸는 전문 비서입니다. 다음은 당신이 따라야 할 원칙입니다:\n1. 결론부터 명확하게 제시하세요.\n2. 보고의 목적과 배경을 간결하게 설명하세요.\n3. 감정적인 표현은 제거하고 객관적인 사실을 기반으로 작성하세요.\n4. 정중하고 격식 있는 어체를 사용하세요. (예: ~습니다, ~하셨습니다)\n5. 문장의 끝을 명확하게 맺어 신뢰감을 주세요.",
    "lateral": "당신은 타 부서 동료와의 원활한 협업을 위한 커뮤니케이션 전문가입니다. 다음은 당신이 따라야 할 원칙입니다:\n1. 요청의 목적과 배경을 친절하게 설명하여 공감대를 형성하세요.\n2. 요청 사항을 명확하고 구체적으로 전달하여 오해의 소지를 없애세요.\n3. 기대하는 결과와 마감 기한을 정중하게 제시하세요.\n4. '부탁드립니다', '감사합니다'와 같은 표현을 사용하여 긍정적인 협업 분위기를 만드세요.\n5. 상호 존중의 태도가 드러나는 어체를 사용하세요. (예: ~해주실 수 있을까요?, ~일 것 같습니다)",
    "external": "당신은 고객에게 최상의 경험을 제공하는 CS 및 영업 전문가입니다. 다음은 당신이 따라야 할 원칙입니다:\n1. 고객을 존중하는 극존칭을 일관되게 사용하세요. (예: ~하셨습니다, ~이십니다, 고객님)\n2. 문의나 요청에 대해 공감과 감사의 표현을 먼저 전달하세요.\n3. 해결책이나 대안을 명확하고 이해하기 쉽게 안내하세요.\n4. 전문성과 신뢰감을 주는 공식적인 톤앤매너를 유지하세요.\n5. 긍정적이고 친절한 인상을 남길 수 있도록 문장을 마무리하세요."
}

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
    Groq AI를 사용하여 입력된 텍스트를 대상에 맞는 업무용 말투로 변환합니다.
    """
    if not client:
        return jsonify({"error": "서버의 AI 서비스가 설정되지 않았습니다. 관리자에게 문의하세요."}), 503

    try:
        data = request.get_json()
        if not data:
            abort(400, description="잘못된 요청 형식입니다. JSON 본문이 필요합니다.")

        original_text = data.get('text', '').strip()
        target = data.get('target', 'upward') # 기본값을 'upward'로 설정

        if not original_text:
            return jsonify({"error": "변환할 텍스트를 입력해주세요."}), 400
        
        if len(original_text) > 500:
            return jsonify({"error": "입력 가능한 최대 글자 수(500자)를 초과했습니다."}), 400
        
        if target not in PROMPTS:
            return jsonify({"error": "지원하지 않는 변환 대상입니다."}), 400

        # 대상에 맞는 시스템 프롬프트 선택
        system_prompt = PROMPTS[target]

        # Groq API 호출
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": f"다음 문장을 비즈니스 상황에 맞게 변환해 줘: \"{original_text}\"",
                }
            ],
            model="moonshotai/kimi-k2-instruct-0905",
            temperature=0.7, # Adjusted to 0.7 as per common usage in examples
            max_tokens=1024,
            top_p=1,
            stop=None,
        )

        converted_text = chat_completion.choices[0].message.content

        return jsonify({
            "original_text": original_text,
            "converted_text": converted_text.strip()
        })

    except Exception as e:
        # 실제 운영 환경에서는 더 상세한 로깅 필요
        print(f"Error in /api/convert: {e}")
        # Groq API 관련 에러를 더 구체적으로 처리할 수도 있습니다.
        return jsonify({"error": "텍스트 변환 중 서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}), 500

if __name__ == '__main__':
    # Vercel 환경에서는 gunicorn과 같은 WSGI 서버를 사용하므로,
    # 이 부분은 로컬 개발 시에만 실행됩니다.
    app.run(debug=True, port=5000)
