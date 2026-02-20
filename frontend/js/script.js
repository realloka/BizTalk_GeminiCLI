document.addEventListener('DOMContentLoaded', () => {
    const originalTextInput = document.getElementById('original-text');
    const convertedTextDiv = document.getElementById('converted-text');
    const convertBtn = document.getElementById('convert-btn');
    const copyBtn = document.getElementById('copy-btn');
    const charCounter = document.getElementById('char-counter');
    const toast = document.getElementById('toast');
    const spinner = document.getElementById('spinner');
    const btnText = convertBtn.querySelector('.btn-text');
    const targetGroup = document.getElementById('target-group');

    const MAX_CHARS = 500;

    // --- Event Listeners ---

    originalTextInput.addEventListener('input', handleCharCounter);
    convertBtn.addEventListener('click', handleConvert);
    copyBtn.addEventListener('click', handleCopy);
    targetGroup.addEventListener('change', handleRadioSelection);

    // --- Initial State ---

    updateRadioLabels();
    checkInitialOutput();


    // --- Handler Functions ---

    function handleCharCounter() {
        const currentLength = originalTextInput.value.length;
        charCounter.textContent = `${currentLength} / ${MAX_CHARS}`;
        
        if (currentLength > MAX_CHARS) {
            charCounter.classList.remove('text-gray-500');
            charCounter.classList.add('text-red-500');
            originalTextInput.value = originalTextInput.value.substring(0, MAX_CHARS);
            charCounter.textContent = `${MAX_CHARS} / ${MAX_CHARS}`;
        } else {
            charCounter.classList.remove('text-red-500');
            charCounter.classList.add('text-gray-500');
        }
    }

    async function handleConvert() {
        const text = originalTextInput.value.trim();
        if (!text) {
            showToast("변환할 내용을 입력해주세요.", 'error');
            return;
        }

        const selectedTarget = document.querySelector('input[name="target"]:checked').value;

        setLoading(true);
        convertedTextDiv.textContent = "AI가 변환 중입니다...";
        convertedTextDiv.classList.remove('text-red-500', 'placeholder-center');

        try {
            const response = await fetch('http://127.0.0.1:5000/api/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, target: selectedTarget }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '알 수 없는 오류가 발생했습니다.');
            }

            const data = await response.json();
            convertedTextDiv.textContent = data.converted_text;

        } catch (error) {
            convertedTextDiv.textContent = `오류: ${error.message}`;
            convertedTextDiv.classList.add('text-red-500');
        } finally {
            setLoading(false);
            checkInitialOutput();
        }
    }

    function handleCopy() {
        const textToCopy = convertedTextDiv.textContent;
        const isPlaceholder = convertedTextDiv.dataset.placeholder === textToCopy;

        if (textToCopy && !isPlaceholder) {
            navigator.clipboard.writeText(textToCopy)
                .then(() => showToast("결과가 클립보드에 복사되었습니다."))
                .catch(err => {
                    console.error('Copy failed:', err);
                    showToast("복사에 실패했습니다.", 'error');
                });
        } else {
            showToast("복사할 내용이 없습니다.", 'error');
        }
    }

    function handleRadioSelection(event) {
        if (event.target.type === 'radio') {
            updateRadioLabels();
        }
    }


    // --- UI Helper Functions ---

    function updateRadioLabels() {
        const radios = document.querySelectorAll('input[name="target"]');
        radios.forEach(radio => {
            const label = document.querySelector(`label[for="${radio.id}"]`);
            if (radio.checked) {
                label.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
                label.classList.remove('hover:bg-indigo-50', 'text-gray-700', 'border-gray-300');
            } else {
                label.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600');
                label.classList.add('hover:bg-indigo-50', 'text-gray-700', 'border-gray-300');
            }
        });
    }

    function setLoading(isLoading) {
        convertBtn.disabled = isLoading;
        if (isLoading) {
            btnText.classList.add('invisible');
            spinner.classList.remove('hidden');
        } else {
            btnText.classList.remove('invisible');
            spinner.classList.add('hidden');
        }
    }

    function checkInitialOutput() {
        if (!convertedTextDiv.textContent.trim()) {
            convertedTextDiv.classList.add('placeholder-center');
        } else {
            convertedTextDiv.classList.remove('placeholder-center');
        }
        copyBtn.disabled = !convertedTextDiv.textContent.trim();
    }

    let toastTimer;
    function showToast(message, type = 'success') {
        clearTimeout(toastTimer);
        
        toast.textContent = message;
        toast.classList.remove('invisible', 'opacity-0', 'bg-green-500', 'bg-red-500');

        if (type === 'success') {
            toast.classList.add('bg-green-500', 'text-white');
        } else {
            toast.classList.add('bg-red-500', 'text-white');
        }

        toast.classList.remove('invisible', 'opacity-0');

        toastTimer = setTimeout(() => {
            toast.classList.add('opacity-0', 'invisible');
        }, 3000);
    }
});
