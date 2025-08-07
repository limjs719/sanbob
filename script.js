
document.addEventListener('DOMContentLoaded', function() {
    const numberGrid = document.querySelector('.number-grid');
    const drawBtn = document.getElementById('drawBtn');
    const resetBtn = document.getElementById('resetBtn');
    const selectedNumbersDiv = document.getElementById('selectedNumbers');
    
    let selectedNumbers = [];
    let isDrawing = false;
    
    // Tailwind config for custom animations
    tailwind.config = {
        theme: {
            extend: {
                animation: {
                    'bounce-in': 'bounceIn 0.8s ease-out',
                    'float': 'float 3s ease-in-out infinite',
                    'glow': 'glow 1s ease-in-out infinite'
                }
            }
        }
    }
    
    // 1-25번까지 번호 그리드 생성
    function createNumberGrid() {
        numberGrid.innerHTML = '';
        for (let i = 1; i <= 25; i++) {
            const numberItem = document.createElement('div');
            numberItem.className = 'number-item';
            numberItem.textContent = i;
            numberItem.setAttribute('data-number', i);
            
            // 각 번호에 다른 지연시간으로 애니메이션 적용
            numberItem.style.animationDelay = `${(i * 0.1)}s`;
            
            numberGrid.appendChild(numberItem);
        }
    }
    
    // 성공 메시지 SweetAlert2
    function showSuccessAlert(numbers) {
        const numbersText = numbers.join(', ');
        Swal.fire({
            icon: 'success',
            title: '🎉 청소당번 선정 완료! 🎉',
            html: `
                <div class="text-center">
                    <p class="text-lg mb-4">선택된 번호:</p>
                    <div class="flex flex-wrap justify-center gap-2 mb-4">
                        ${numbers.map(num => `
                            <span class="inline-block bg-yellow-400 text-purple-800 px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                                ${num}번
                            </span>
                        `).join('')}
                    </div>
                    <p class="text-base opacity-90">선택된 분들은 청소 화이팅! 💪</p>
                </div>
            `,
            confirmButtonText: '확인',
            timer: 5000,
            timerProgressBar: true,
            showClass: {
                popup: 'animate__animated animate__bounceIn'
            },
            hideClass: {
                popup: 'animate__animated animate__bounceOut'
            }
        });
    }
    
    // 경고 메시지 SweetAlert2
    function showWarningAlert(message) {
        Swal.fire({
            icon: 'warning',
            title: '잠깐!',
            text: message,
            confirmButtonText: '알겠습니다',
            timer: 3000,
            timerProgressBar: true
        });
    }
    
    // 확인 대화상자 SweetAlert2
    function showConfirmAlert(message) {
        return Swal.fire({
            icon: 'question',
            title: '다시 뽑기',
            text: message,
            showCancelButton: true,
            confirmButtonText: '네, 다시 뽑겠습니다',
            cancelButtonText: '취소',
            reverseButtons: true
        });
    }
    
    // 랜덤으로 5개 번호 선택
    async function drawNumbers() {
        if (isDrawing) return;
        
        isDrawing = true;
        drawBtn.disabled = true;
        drawBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>뽑는 중...';
        selectedNumbers = [];
        
        // 기존 선택 초기화
        document.querySelectorAll('.number-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        selectedNumbersDiv.innerHTML = `
            <div class="drawing text-center">
                <i class="fas fa-dice fa-spin text-3xl mb-3 text-blue-600"></i>
                <div class="text-xl font-bold">신중하게 선택하는 중...</div>
                <div class="loading-spinner"></div>
            </div>
        `;
        
        // 1-25 중에서 중복 없이 5개 선택
        const availableNumbers = Array.from({length: 25}, (_, i) => i + 1);
        const selected = [];
        
        for (let i = 0; i < 5; i++) {
            const randomIndex = Math.floor(Math.random() * availableNumbers.length);
            selected.push(availableNumbers.splice(randomIndex, 1)[0]);
        }
        
        selected.sort((a, b) => a - b);
        selectedNumbers = selected;
        
        // 애니메이션 효과로 하나씩 선택
        setTimeout(() => {
            animateSelection(selected);
        }, 2000);
    }
    
    // 선택 애니메이션
    async function animateSelection(numbers) {
        selectedNumbersDiv.innerHTML = '';
        
        for (let i = 0; i < numbers.length; i++) {
            await new Promise(resolve => {
                setTimeout(() => {
                    const number = numbers[i];
                    
                    // 그리드에서 해당 번호 하이라이트
                    const numberItem = document.querySelector(`[data-number="${number}"]`);
                    numberItem.classList.add('selected');
                    
                    // 결과 영역에 번호 추가
                    const selectedNumberDiv = document.createElement('div');
                    selectedNumberDiv.className = 'selected-number';
                    selectedNumberDiv.innerHTML = `<span>${number}</span>`;
                    selectedNumbersDiv.appendChild(selectedNumberDiv);
                    
                    // 사운드 효과 시뮬레이션 (시각적 피드백)
                    numberItem.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        numberItem.style.transform = 'scale(1.1)';
                    }, 200);
                    
                    resolve();
                }, i * 500);
            });
        }
        
        // 모든 선택 완료 후
        setTimeout(() => {
            isDrawing = false;
            drawBtn.disabled = false;
            drawBtn.innerHTML = '<i class="fas fa-dice mr-2"></i>당번 뽑기!';
            resetBtn.style.display = 'inline-block';
            
            // 성공 알림 표시
            showSuccessAlert(numbers);
        }, 1000);
    }
    
    // 초기화
    async function reset() {
        const result = await showConfirmAlert('정말로 다시 뽑으시겠습니까?');
        
        if (result.isConfirmed) {
            selectedNumbers = [];
            selectedNumbersDiv.innerHTML = `
                <div class="text-gray-500 text-lg">
                    <i class="fas fa-arrow-up mr-2"></i>
                    위 버튼을 눌러 당번을 뽑아보세요!
                </div>
            `;
            resetBtn.style.display = 'none';
            
            document.querySelectorAll('.number-item').forEach((item, index) => {
                item.classList.remove('selected');
                // 리셋 애니메이션
                setTimeout(() => {
                    item.style.animation = 'float 3s ease-in-out infinite';
                    item.style.animationDelay = `${index * 0.1}s`;
                }, index * 50);
            });
            
            Swal.fire({
                icon: 'info',
                title: '초기화 완료!',
                text: '새로운 당번을 뽑아보세요!',
                timer: 1500,
                showConfirmButton: false
            });
        }
    }
    
    // 번호 클릭시 정보 표시
    function handleNumberClick(event) {
        const number = event.target.getAttribute('data-number');
        if (number && !isDrawing) {
            Swal.fire({
                icon: 'info',
                title: `${number}번`,
                text: '번호를 직접 선택할 수는 없어요! 공정한 뽑기를 위해 랜덤 선택만 가능합니다.',
                timer: 2000,
                showConfirmButton: false
            });
        }
    }
    
    // 이벤트 리스너
    drawBtn.addEventListener('click', drawNumbers);
    resetBtn.addEventListener('click', reset);
    
    // 번호 클릭 이벤트 (정보 표시용)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('number-item')) {
            handleNumberClick(e);
        }
    });
    
    // 키보드 단축키
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space' && !isDrawing) {
            e.preventDefault();
            drawNumbers();
        } else if (e.code === 'KeyR' && resetBtn.style.display !== 'none') {
            e.preventDefault();
            reset();
        }
    });
    
    // 초기 그리드 생성
    createNumberGrid();
    
    // 초기 환영 메시지
    setTimeout(() => {
        Swal.fire({
            icon: 'info',
            title: '🧹 청소당번 뽑기에 오신 것을 환영합니다!',
            html: `
                <div class="text-left">
                    <p class="mb-2">📋 <strong>사용법:</strong></p>
                    <ul class="text-sm list-disc list-inside space-y-1">
                        <li>당번 뽑기 버튼을 클릭하세요</li>
                        <li>1-25번 중 5명이 랜덤 선택됩니다</li>
                        <li><kbd class="bg-gray-200 px-2 py-1 rounded">스페이스바</kbd>로도 뽑기 가능</li>
                        <li><kbd class="bg-gray-200 px-2 py-1 rounded">R</kbd>키로 다시 뽑기</li>
                    </ul>
                </div>
            `,
            confirmButtonText: '시작하기',
            timer: 8000,
            timerProgressBar: true
        });
    }, 500);
});
