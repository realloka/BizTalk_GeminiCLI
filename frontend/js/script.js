document.addEventListener('DOMContentLoaded', () => {
    const originalTextInput = document.getElementById('original-text');
    const convertedTextDiv = document.getElementById('converted-text');
    const convertBtn = document.getElementById('convert-btn');
    const copyBtn = document.getElementById('copy-btn');
    const charCounter = document.getElementById('char-counter');
    const toast = document.getElementById('toast');

    const MAX_CHARS = 500;

    /**
     * 실시간 글자 수 카운터 업데이트
     */
    originalTextInput.addEventListener('input', () => {
        const currentLength = originalTextInput.value.length;
        charCounter.textContent = `${currentLength} / ${MAX_CHARS}`;
        if (currentLength > MAX_CHARS) {
            charCounter.style.color = 'var(--error-color)';
            originalTextInput.value = originalTextInput.value.substring(0, MAX_CHARS);
            charCounter.textContent = `${MAX_CHARS} / ${MAX_CHARS}`;
        } else {
            charCounter.style.color = '#888';
        }
    });

    /**
     * 텍스트 변환 API 호출
     */
    convertBtn.addEventListener('click', async () => {
        const text = originalTextInput.value.trim();
        if (!text) {
            showToast("변환할 내용을 입력해주세요.", 'error');
            return;
        }

        const selectedTarget = document.querySelector('input[name="target"]:checked').value;

        // 로딩 상태 시작
        setLoading(true);
        convertedTextDiv.classList.remove('placeholder');
        convertedTextDiv.textContent = "AI가 변환 중입니다...";

        try {
            // 1단계에서는 /api/convert 가 더미 응답을 반환
            const response = await fetch('http://127.0.0.1:5000/api/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    target: selectedTarget,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '알 수 없는 오류가 발생했습니다.');
            }

            const data = await response.json();
            convertedTextDiv.textContent = data.converted_text;

        } catch (error) {
            convertedTextDiv.textContent = `오류가 발생했습니다: ${error.message}`;
            convertedTextDiv.style.color = 'var(--error-color)';
        } finally {
            // 로딩 상태 종료
            setLoading(false);
        }
    });

    /**
     * 변환된 텍스트 클립보드에 복사
     */
    copyBtn.addEventListener('click', () => {
        const textToCopy = convertedTextDiv.textContent;
        if (textToCopy && !convertedTextDiv.classList.contains('placeholder')) {
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    showToast("결과가 클립보드에 복사되었습니다.");
                })
                .catch(err => {
                    console.error('Copy failed:', err);
                    showToast("복사에 실패했습니다.", 'error');
                });
        } else {
            showToast("복사할 내용이 없습니다.", 'error');
        }
    });

    /**
     * 로딩 상태 설정/해제
     * @param {boolean} isLoading - 로딩 상태 여부
     */
    function setLoading(isLoading) {
        convertBtn.disabled = isLoading;
        if (isLoading) {
            convertBtn.classList.add('loading');
        } else {
            convertBtn.classList.remove('loading');
        }
    }

    /**
     * 토스트 메시지 표시
     * @param {string} message - 표시할 메시지
     * @param {string} type - 메시지 타입 ('success' 또는 'error')
     */
    let toastTimer;
    function showToast(message, type = 'success') {
        clearTimeout(toastTimer);
        toast.textContent = message;
        toast.style.backgroundColor = type === 'success' ? 'var(--success-color)' : 'var(--error-color)';
        toast.classList.add('show');
        
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
