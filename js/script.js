// ⭐ API URL - 실제 배포 URL로 변경하세요!
const API_URL =
  'https://script.google.com/macros/s/AKfycbwZXY8MD3pW07De_w3o7KSkpHVxbreJxWoopMTBzq9Nuln9CWh0OQubBN06ZhKmpkC14w/exec';

let currentData = {};
let selectedDate = '';
let selectedTime = '';
let reservations = {};
let currentReservation = null;

// 오늘 날짜 가져오기 함수
function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 내일 날짜 가져오기 함수
function getTomorrowString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 날짜 비교 함수
function compareDates(date1, date2) {
  return new Date(date1) - new Date(date2);
}

// 알림 메시지 표시
function showAlert(message, duration = 3000) {
  const alert = document.createElement('div');
  alert.className = 'alert';
  alert.textContent = message;
  document.body.appendChild(alert);

  setTimeout(() => {
    alert.remove();
  }, duration);
}

// 로딩 표시
function showLoading(message = '처리중입니다...') {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loadingOverlay';

  overlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <div class="loading-text">${message}</div>
                </div>
            `;

  document.body.appendChild(overlay);
}

// 로딩 숨기기
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.remove();
  }
}

// 화면 전환
function showScreen(screenId) {
  document.querySelectorAll('.card').forEach((card) => {
    card.classList.add('hidden');
  });
  document.getElementById(screenId).classList.remove('hidden');

  if (screenId === 'time') {
    loadReservations();
  } else if (screenId === 'date') {
    loadAvailableDates();
  }
}

// 예약 가능 날짜 로드
async function loadAvailableDates() {
  console.log('=== 날짜 로드 시작 ===');
  const container = document.getElementById('dateButtons');
  container.innerHTML = '<div class="loading">날짜를 불러오는 중...</div>';

  try {
    const response = await fetch(`${API_URL}?action=getReservations`);
    const data = await response.json();
    console.log('API 응답:', data);

    if (!data.success) {
      throw new Error('API 응답 실패');
    }

    if (data.reservations) {
      reservations = data.reservations;
      console.log('예약 건수:', Object.keys(reservations).length);
    } else {
      reservations = {};
    }

    let dates = [];

    if (data.availableDates && Array.isArray(data.availableDates)) {
      console.log('availableDates 발견:', data.availableDates);

      dates = data.availableDates.map((dateStr) => {
        let timeRange;
        if (dateStr === '2025-07-08') {
          timeRange = '오전 10시 ~ 오후 9시 30분';
        } else if (dateStr === '2025-07-15') {
          timeRange = '오전 10시 ~ 오후 10시';
        } else if (dateStr === '2025-07-24') {
          timeRange = '오전 10시 ~ 오후 9시 30분';
        } else if (dateStr === '2025-07-31') {
          timeRange = '오전 10시 ~ 오후 9시 30분';
        } else if (dateStr === '2025-08-02') {
          timeRange = '오전 10시 ~ 오후 5시';
        } else if (dateStr === '2025-08-05') {
          timeRange = '오전 10시 ~ 오후 2시';
        } else if (dateStr === '2025-08-07') {
          timeRange = '오전 10시 ~ 오후 8시';
        } else {
          timeRange = '오전 10시 ~ 오후 2시 30분';
        }

        return {
          date: dateStr,
          timeRange: timeRange,
        };
      });
    } else {
      console.log('availableDates 없음 - 기본값 사용');
      dates = [
        { date: '2025-07-08', timeRange: '오전 10시 ~ 오후 9시 30분' },
        { date: '2025-07-15', timeRange: '오전 10시 ~ 오후 10시' },
        { date: '2025-07-24', timeRange: '오전 10시 ~ 오후 9시 30분' },
        { date: '2025-07-29', timeRange: '오전 10시 ~ 오후 2시' },
        { date: '2025-07-31', timeRange: '오전 10시 ~ 오후 9시 30분' },
        { date: '2025-08-02', timeRange: '오전 10시 ~ 오후 5시' },
        { date: '2025-08-05', timeRange: '오전 10시 ~ 오후 2시' },
        { date: '2025-08-07', timeRange: '오전 10시 ~ 오후 8시' },
      ];
    }

    displayDateButtons(dates, reservations);
  } catch (error) {
    console.error('=== 오류 발생 ===');
    console.error('오류 상세:', error);
    displayDefaultDates();
  }
}

// 시간대 배열 생성
function getTimeSlotsForDate(date) {
  const slots = [];
  let start, end;

  if (date === '2025-07-08') {
    start = 10 * 60; // 10:00
    end = 21.5 * 60; // 21:30
  } else if (date === '2025-07-15') {
    start = 10 * 60; // 10:00
    end = 22 * 60; // 22:00
  } else if (date === '2025-07-24') {
    start = 10 * 60; // 10:00
    end = 21.5 * 60; // 21:30
  } else if (date === '2025-07-29') {
    start = 10 * 60; // 10:00
    end = 14 * 60; // 14:00
  } else if (date === '2025-07-31') {
    start = 10 * 60; // 10:00
    end = 21.5 * 60; // 21:30
  } else if (date === '2025-08-02') {
    start = 10 * 60; // 10:00
    end = 17 * 60; // 17:00
  } else if (date === '2025-08-05') {
    start = 10 * 60; // 10:00
    end = 14 * 60; // 14:00
  } else if (date === '2025-08-07') {
    start = 10 * 60; // 10:00
    end = 20 * 60; // 20:00
  } else {
    start = 10 * 60; // 10:00
    end = 14.5 * 60; // 14:30
  }

  for (let minutes = start; minutes < end; minutes += 30) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    slots.push(
      `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    );
  }

  return slots;
}

// 날짜별 잔여 좌석 계산
function calculateAvailableSlots(date, reservations) {
  const tomorrow = getTomorrowString();

  // 내일보다 이전 날짜는 예약 불가
  if (compareDates(date, tomorrow) < 0) {
    return 0;
  }

  const slots = getTimeSlotsForDate(date);
  let available = 0;

  slots.forEach((time) => {
    const key = `${date}-${time}`;
    if (!reservations[key]) {
      available++;
    }
  });

  return available;
}

// 날짜 버튼 표시
function displayDateButtons(dates, reservations) {
  console.log('=== 날짜 버튼 표시 ===');
  console.log('날짜 데이터:', dates);
  console.log('예약 데이터:', Object.keys(reservations || {}).length + '건');

  const container = document.getElementById('dateButtons');
  container.innerHTML = '';

  if (!dates || dates.length === 0) {
    container.innerHTML = '<div class="error">표시할 날짜가 없습니다.</div>';
    return;
  }

  const tomorrow = getTomorrowString();
  const todayStr = getTodayString();

  // 내일부터의 날짜만 필터링
  const futureDates = dates.filter((dateInfo) => {
    return compareDates(dateInfo.date, todayStr) > 0;
  });

  if (futureDates.length === 0) {
    container.innerHTML =
      '<div class="error">예약 가능한 날짜가 없습니다.</div>';
    return;
  }

  futureDates.forEach((dateInfo, index) => {
    try {
      const date = new Date(dateInfo.date);
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      const dayName = dayNames[date.getDay()];

      const availableCount = calculateAvailableSlots(
        dateInfo.date,
        reservations || {}
      );

      let statusText = '';
      let buttonClass = 'btn btn-primary';
      let badgeClass = '';
      let isDisabled = false;

      if (availableCount === 0) {
        statusText = '예약 마감';
        buttonClass = 'btn btn-disabled';
        badgeClass = 'badge-full';
        isDisabled = true;
      } else if (availableCount <= 4) {
        statusText = '잔여석 소수';
        buttonClass = 'btn btn-warning';
        badgeClass = 'badge-warning';
      } else {
        statusText = '예약 가능';
        buttonClass = 'btn btn-primary';
        badgeClass = 'badge-available';
      }

      const button = document.createElement('button');
      button.className = buttonClass;
      button.disabled = isDisabled;

      if (!isDisabled) {
        button.onclick = () =>
          selectDate(dateInfo.date, dayName, dateInfo.timeRange);
      }

      button.innerHTML = `
                ${date.getFullYear()}년 ${
        date.getMonth() + 1
      }월 ${date.getDate()}일 (${dayName})
                <span class="status-badge ${badgeClass}">${statusText}</span>
                <br><small style="font-size: 12px; opacity: 0.9;">${
                  dateInfo.timeRange
                }</small>
            `;

      container.appendChild(button);
    } catch (err) {
      console.error('날짜 버튼 생성 오류:', err, dateInfo);
    }
  });
}

// 기본 날짜 표시
function displayDefaultDates() {
  const container = document.getElementById('dateButtons');
  const defaultDates = [
    { date: '2025-07-08', timeRange: '오전 10시 ~ 오후 9시 30분' },
    { date: '2025-07-15', timeRange: '오전 10시 ~ 오후 10시' },
    { date: '2025-07-24', timeRange: '오전 10시 ~ 오후 9시 30분' },
    { date: '2025-07-29', timeRange: '오전 10시 ~ 오후 2시' },
    { date: '2025-07-31', timeRange: '오전 10시 ~ 오후 9시 30분' },
    { date: '2025-08-02', timeRange: '오전 10시 ~ 오후 5시' },
    { date: '2025-08-05', timeRange: '오전 10시 ~ 오후 2시' },
    { date: '2025-08-07', timeRange: '오전 10시 ~ 오후 8시' },
  ];

  displayDateButtons(defaultDates, reservations);
}

// 예약 정보 로드
async function loadReservations() {
  try {
    const response = await fetch(`${API_URL}?action=getReservations`);
    const data = await response.json();
    if (data.success) {
      reservations = data.reservations || {};
      showTimeSlots();
    } else {
      console.error('예약 로드 실패:', data);
      showAlert('예약 정보를 불러오는 중 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('Error loading reservations:', error);
    showAlert('예약 정보를 불러오는 중 오류가 발생했습니다.');
  }
}

// 개인정보 폼 제출
document.getElementById('infoForm').addEventListener('submit', function (e) {
  e.preventDefault();

  currentData = {
    studentName: document.getElementById('studentName').value,
    parentPhone: document.getElementById('parentPhone').value.replace(/-/g, ''),
    school: document.getElementById('school').value,
    grade: document.getElementById('grade').value,
    mathLevel: document.getElementById('mathLevel').value,
  };

  showScreen('date');
});

// 날짜 선택
function selectDate(date, day, timeRange) {
  const tomorrow = getTomorrowString();

  // 내일보다 이전 날짜 선택 방지
  if (compareDates(date, tomorrow) < 0) {
    showAlert('내일(' + tomorrow + ')부터 예약이 가능합니다.');
    return;
  }

  selectedDate = date;
  selectedTime = '';
  document.getElementById('confirmBtn').style.display = 'none';

  document.getElementById('selectedDateInfo').innerHTML = `
                <strong>선택된 날짜:</strong> ${date} (${day})<br>
                <strong>예약 가능 시간:</strong> ${
                  timeRange || getTimeRange(date)
                }
            `;

  document.getElementById('timeSlots').innerHTML =
    '<div class="loading">시간대를 불러오는 중...</div>';

  showScreen('time');
}

// 시간대 정보
function getTimeRange(date) {
  if (date === '2025-07-08') return '오전 10시 ~ 오후 9시 30분 (30분 단위)';
  if (date === '2025-07-15') return '오전 10시 ~ 오후 10시 (30분 단위)';
  if (date === '2025-07-24') return '오전 10시 ~ 오후 9시 30분 (30분 단위)';
  if (date === '2025-07-29') return '오전 10시 ~ 오후 2시 (30분 단위)';
  if (date === '2025-07-31') return '오전 10시 ~ 오후 9시 30분 (30분 단위)';
  if (date === '2025-08-02') return '오전 10시 ~ 오후 5시 (30분 단위)';
  if (date === '2025-08-05') return '오전 10시 ~ 오후 2시 (30분 단위)';
  if (date === '2025-08-07') return '오전 10시 ~ 오후 8시 (30분 단위)';
  return '오전 10시 ~ 오후 2시 30분 (30분 단위)';
}

// 시간 슬롯 생성
function showTimeSlots() {
  const currentDate = selectedDate;
  const slots = getTimeSlots(selectedDate);
  const container = document.getElementById('timeSlots');

  if (currentDate !== selectedDate) {
    return;
  }

  container.innerHTML = '';

  slots.forEach((time) => {
    const key = `${selectedDate}-${time}`;
    const isReserved = reservations[key];

    const slot = document.createElement('div');
    slot.className = `time-slot ${isReserved ? 'disabled' : ''}`;
    slot.textContent = isReserved ? `${time} (예약됨)` : time;
    slot.dataset.time = time;

    if (!isReserved) {
      slot.onclick = (e) => selectTime(time, e);
    }

    container.appendChild(slot);
  });
}

// 시간대 배열 생성
function getTimeSlots(date) {
  return getTimeSlotsForDate(date);
}

// 시간 선택
function selectTime(time, event) {
  const validSlots = getTimeSlots(selectedDate);
  if (!validSlots.includes(time)) {
    showAlert('잘못된 시간 선택입니다. 다시 선택해주세요.');
    loadReservations();
    return;
  }

  document.querySelectorAll('.time-slot').forEach((slot) => {
    slot.classList.remove('selected');
  });

  event.target.classList.add('selected');
  selectedTime = time;
  document.getElementById('confirmBtn').style.display = 'block';
}

// 예약 확정
async function confirmReservation() {
  const tomorrow = getTomorrowString();

  // 최종 확인 - 내일부터만 예약 가능
  if (compareDates(selectedDate, tomorrow) < 0) {
    showAlert('예약은 내일부터 가능합니다.');
    showScreen('date');
    return;
  }

  const validSlots = getTimeSlots(selectedDate);
  if (!validSlots.includes(selectedTime)) {
    showAlert('선택한 시간이 유효하지 않습니다. 다시 선택해주세요.');
    showScreen('date');
    return;
  }

  const confirmBtn = document.getElementById('confirmBtn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = '처리중...';

  try {
    const reservationData = {
      action: 'createReservation',
      date: selectedDate,
      time: selectedTime,
      ...currentData,
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(reservationData),
    });

    const result = await response.json();

    if (result.success) {
      showScreen('complete');
      document.getElementById('infoForm').reset();
      currentData = {};
      selectedDate = '';
      selectedTime = '';
    } else {
      if (result.existingReservation) {
        const existing = result.existingReservation;
        const message =
          `이미 예약이 존재합니다.\n\n` +
          `학생명: ${existing.studentName}\n` +
          `날짜: ${existing.date}\n` +
          `시간: ${existing.time}\n\n` +
          `예약 변경을 원하시면 기존 예약을 취소 후 다시 예약해주세요.`;

        if (confirm(message + '\n\n예약 확인 화면으로 이동하시겠습니까?')) {
          showScreen('check');
          document.getElementById('checkPhone').value = currentData.parentPhone;
        }
      } else {
        showAlert(result.message || '예약 중 오류가 발생했습니다.');
      }
      loadReservations();
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('예약 처리 중 오류가 발생했습니다.');
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = '예약 확정';
  }
}

// 예약 확인 폼
document
  .getElementById('checkForm')
  .addEventListener('submit', async function (e) {
    e.preventDefault();

    const phone = document.getElementById('checkPhone').value.replace(/-/g, '');

    showLoading('예약 정보를 확인하고 있습니다...');

    try {
      const response = await fetch(
        `${API_URL}?action=checkReservation&phone=${encodeURIComponent(phone)}`
      );
      const data = await response.json();

      hideLoading();

      if (data.success && data.reservation) {
        currentReservation = data.reservation;

        console.log('받은 예약 데이터:', data.reservation);

        const dateStr = data.reservation.date || '';
        const timeStr = data.reservation.time || '';

        document.getElementById('reservationInfo').innerHTML = `
                        <p><strong>예약번호:</strong> ${data.reservation.reservationId}</p>
                        <p><strong>날짜:</strong> ${dateStr}</p>
                        <p><strong>시간:</strong> ${timeStr}</p>
                        <p><strong>학생명:</strong> ${data.reservation.studentName}</p>
                        <p><strong>연락처:</strong> ${data.reservation.parentPhone}</p>
                        <p><strong>학교:</strong> ${data.reservation.school}</p>
                        <p><strong>학년:</strong> ${data.reservation.grade}</p>
                        <p><strong>수학 선행정도:</strong> ${data.reservation.mathLevel}</p>
                    `;
        showScreen('result');
      } else {
        showAlert('예약을 찾을 수 없습니다. 전화번호를 확인해주세요.');
      }
    } catch (error) {
      console.error('Error:', error);
      hideLoading();
      showAlert('예약 조회 중 오류가 발생했습니다.');
    }
  });

// 예약 취소
async function cancelReservation() {
  if (!confirm('정말로 예약을 취소하시겠습니까?')) {
    return;
  }

  showLoading('예약을 취소하고 있습니다...');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'cancelReservation',
        reservationId: currentReservation.reservationId,
      }),
    });

    const result = await response.json();

    hideLoading();

    if (result.success) {
      showAlert('예약이 취소되었습니다.');
      showScreen('home');
      document.getElementById('checkForm').reset();
      currentReservation = null;
    } else {
      showAlert(result.message || '취소 중 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('Error:', error);
    hideLoading();
    showAlert('예약 취소 중 오류가 발생했습니다.');
  }
}
