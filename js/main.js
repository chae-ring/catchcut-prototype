// ===== Page Navigation =====
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function goLanding() { showPage('landing-page'); }
function showArch() { showPage('arch-page'); }

function showDemo() {
  showPage('demo-page');
  // Reset to init step
  showStep('step-init');
}

// ===== Extension Steps =====
function showStep(id) {
  document.querySelectorAll('.ext-step').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const el = document.getElementById(id);
  el.style.display = 'flex';
  el.classList.add('active');
}

function startAnalysis() {
  showStep('step-analyzing');
  // Animate progress
  const fill = document.getElementById('progressFill');
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress >= 100) {
      progress = 100;
      fill.style.width = progress + '%';
      clearInterval(interval);
      setTimeout(() => {
        showStep('step-result');
        highlightAllClauses();
      }, 400);
    } else {
      fill.style.width = progress + '%';
    }
  }, 200);
}

// ===== Highlight clauses in document =====
function highlightAllClauses() {
  // Already highlighted via CSS, just add animation
  document.querySelectorAll('.highlight-red-bg, .highlight-yellow-bg').forEach((el, i) => {
    setTimeout(() => {
      el.style.transform = 'scale(1.01)';
      setTimeout(() => { el.style.transform = ''; }, 300);
    }, i * 150);
  });
}

function highlightClause(clauseId) {
  // Find the element with that data attribute and scroll to it
  const el = document.querySelector(`[data-clause="${clauseId}"]`);
  if (el) {
    // Switch to doc panel if on mobile
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('clause-focused');
    setTimeout(() => el.classList.remove('clause-focused'), 1500);
  }
}

// ===== Tabs =====
function switchTab(tabName, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + tabName).classList.add('active');
}

// ===== Ping (click on clause) =====
let selectedText = '';
let pingActive = false;

document.addEventListener('DOMContentLoaded', () => {
  const body = document.getElementById('contractBody');
  if (!body) return;

  body.addEventListener('click', (e) => {
    const tooltip = document.getElementById('pingTooltip');
    const li = e.target.closest('li');
    if (!li) {
      tooltip.classList.add('hidden');
      return;
    }
    selectedText = li.innerText.trim();
    // Show tooltip near click
    const rect = li.getBoundingClientRect();
    const docPanel = document.querySelector('.doc-content');
    const panelRect = docPanel.getBoundingClientRect();
    tooltip.style.top = (rect.bottom - panelRect.top + docPanel.scrollTop + 4) + 'px';
    tooltip.style.left = Math.min(rect.left - panelRect.left, panelRect.width - 200) + 'px';
    tooltip.classList.remove('hidden');
  });

  // Hide tooltip on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#contractBody') && !e.target.closest('#pingTooltip')) {
      document.getElementById('pingTooltip').classList.add('hidden');
    }
  });
});

function pingAction(type) {
  document.getElementById('pingTooltip').classList.add('hidden');
  const modal = document.getElementById('pingModal');
  const result = document.getElementById('pingResult');
  modal.classList.remove('hidden');

  const text = selectedText.substring(0, 120) + (selectedText.length > 120 ? '...' : '');

  const responses = {
    easy: `
      <div class="ping-response">
        <div class="ping-response-type">💡 쉬운 설명</div>
        <div class="ping-original">"${text}"</div>
        <div class="ping-result-text">
          <strong>쉽게 말하면:</strong><br>
          ${getEasyExplanation(selectedText)}
        </div>
      </div>
    `,
    comic: `
      <div class="ping-response">
        <div class="ping-response-type">🎬 만화로 보기</div>
        <div class="ping-original">"${text}"</div>
        <div class="mini-comic">
          <div class="mini-panel">
            <div class="mini-scene">🧑‍💼<br><small>계약서에 서명</small></div>
          </div>
          <div class="mini-arrow">→</div>
          <div class="mini-panel warn">
            <div class="mini-scene">⚠️<br><small>${getComicSituation(selectedText)}</small></div>
          </div>
          <div class="mini-arrow">→</div>
          <div class="mini-panel safe">
            <div class="mini-scene">🤖<br><small>${getComicAdvice(selectedText)}</small></div>
          </div>
        </div>
      </div>
    `,
    danger: `
      <div class="ping-response">
        <div class="ping-response-type">⚠️ 위험 이유</div>
        <div class="ping-original">"${text}"</div>
        <div class="danger-analysis">
          <div class="danger-level">위험도: <span class="risk-badge red">🔴 높음</span></div>
          <div class="ping-result-text">
            ${getDangerAnalysis(selectedText)}
          </div>
        </div>
      </div>
    `,
    question: `
      <div class="ping-response">
        <div class="ping-response-type">❓ 질문 만들기</div>
        <div class="ping-original">"${text}"</div>
        <div class="question-list">
          <strong>상대방에게 이렇게 물어보세요:</strong>
          <ol>
            ${getQuestions(selectedText)}
          </ol>
        </div>
      </div>
    `
  };

  result.innerHTML = responses[type] || '';
}

function getEasyExplanation(text) {
  if (text.includes('잔액조회') || text.includes('이상 유무')) {
    return '거래가 잘못되어도 은행이 다 확인해주지 않습니다. <strong>내가 직접 수시로 통장 내역을 확인해야 하고, 이상한 거래가 있으면 빨리 신고해야</strong> 합니다. 늦게 신고하면 피해를 보상받지 못할 수 있어요.';
  }
  if (text.includes('서비스가 제한')) {
    return '일부 기능은 약속과 달리 <strong>나중에 마음대로 줄이거나 없앨 수 있다</strong>는 뜻입니다. 어떤 기능이 제한될 수 있는지 미리 확인하는 게 좋아요.';
  }
  if (text.includes('이의를 제기하지')) {
    return '나중에 문제가 생겨도 <strong>은행이나 본사에 불만을 말할 수 없다</strong>고 미리 포기하는 조항입니다. 계약 후에는 이의 제기가 어려울 수 있습니다.';
  }
  if (text.includes('이용자의 부담')) {
    return 'VPN이나 전용선 같은 보안 시스템을 <strong>회사가 돈을 내고 설치해줘야 하는데, 이 비용을 내가 내야</strong> 한다는 뜻입니다. 비용이 수백만원이 될 수도 있습니다.';
  }
  return '이 조항은 서비스 이용 중 <strong>사용자의 책임이나 의무가 강화</strong>되는 내용입니다. 계약 전에 담당자에게 자세한 설명을 요청하세요.';
}

function getComicSituation(text) {
  if (text.includes('잔액조회')) return '이상 거래를 늦게 발견';
  if (text.includes('서비스가 제한')) return '갑자기 기능이 사라짐';
  if (text.includes('이의를 제기')) return '문제가 생겼지만 항의 불가';
  if (text.includes('이용자의 부담')) return '예상치 못한 비용 청구';
  return '불리한 조항 발동';
}

function getComicAdvice(text) {
  if (text.includes('잔액조회')) return '주 1회 이상 내역 확인하세요';
  if (text.includes('서비스가 제한')) return '제한 범위를 서면으로 확인';
  if (text.includes('이의를 제기')) return '분쟁 처리 절차를 미리 확인';
  if (text.includes('이용자의 부담')) return '비용 견적을 먼저 받아보세요';
  return '계약 전 담당자에게 확인하세요';
}

function getDangerAnalysis(text) {
  if (text.includes('잔액조회')) {
    return '<strong>책임 전가 조항입니다.</strong><br><br>은행이 처리해야 할 이상 거래 모니터링 의무를 사용자에게 넘기고 있습니다. 사용자가 수시로 확인하지 않으면, 피해 발생 시 은행의 책임이 줄어들 수 있습니다.';
  }
  if (text.includes('서비스가 제한')) {
    return '<strong>포괄적 면책 조항입니다.</strong><br><br>"일부 업무"의 범위가 명확하지 않아, 나중에 어떤 서비스든 제한할 수 있는 빌미가 됩니다. 어떤 서비스가 제한 대상인지 명시를 요구해야 합니다.';
  }
  if (text.includes('이의를 제기')) {
    return '<strong>권리 포기 조항입니다.</strong><br><br>사전에 불만 제기 권리를 포기하도록 요구합니다. 법적으로 무효가 될 수 있지만, 분쟁 발생 시 불리하게 작용할 수 있습니다.';
  }
  if (text.includes('이용자의 부담')) {
    return '<strong>비용 전가 조항입니다.</strong><br><br>보안 인프라 구축 비용을 이용자가 부담해야 하며, VPN·전용회선 비용은 수백만원~수천만원에 달할 수 있습니다. 계약 전 비용 규모를 반드시 확인하세요.';
  }
  return '<strong>주의가 필요한 조항입니다.</strong><br><br>이 조항은 사용자보다 사업자에게 유리하게 작성되어 있습니다. 구체적인 상황을 담당자에게 확인하고 서면으로 답변을 받아두세요.';
}

function getQuestions(text) {
  if (text.includes('잔액조회')) {
    return `
      <li>이상 거래가 발생했을 때 은행에서 자동으로 알림을 보내주나요?</li>
      <li>확인 주기는 어느 정도가 적당한가요?</li>
      <li>이상 거래 발견 시 보상 기준이 있나요?</li>
    `;
  }
  if (text.includes('서비스가 제한')) {
    return `
      <li>현재 제한될 수 있는 업무 목록을 서면으로 받을 수 있나요?</li>
      <li>서비스 제한 전에 사전 고지를 해주나요?</li>
      <li>제한 시 계약 해지가 가능한가요?</li>
    `;
  }
  if (text.includes('이용자의 부담')) {
    return `
      <li>VPN 및 전용회선 설치 비용이 얼마나 드나요?</li>
      <li>은행에서 추천하는 보안 업체가 있나요?</li>
      <li>보안 시스템 유지보수 비용도 제가 부담해야 하나요?</li>
    `;
  }
  return `
    <li>이 조항의 구체적인 적용 사례를 알 수 있나요?</li>
    <li>이 조항을 수정하거나 예외를 둘 수 있나요?</li>
    <li>비슷한 상황에서 다른 고객은 어떻게 처리되었나요?</li>
  `;
}

function closePingModal() {
  document.getElementById('pingModal').classList.add('hidden');
}

// ===== Comic regenerate =====
const comicVariants = [
  {
    title: '📋 이의제기 포기 조항이라고?',
    subtitle: '제13조 ④항 — 이런 상황이 생길 수 있어요',
    scenes: [
      { bg: 'scene1', icon: '🤝', bubble: '계약 잘 됐다!<br>앞으로 잘 부탁해요', caption: '계약을 체결했습니다' },
      { bg: 'scene2', icon: '😟', bubble: '서비스 문제가<br>생겼는데...', caption: '문제가 발생했습니다' },
      { bg: 'scene3', icon: '📄', bubble: '"이의 제기하지<br>않기로 함" 13조④', caption: '약관이 발목을 잡습니다' },
      { bg: 'scene4', icon: '🤖', bubble: '계약 전 분쟁처리<br>절차를 확인하세요!', caption: 'CATCHCUT이 미리 알려드립니다', isAdvice: true },
    ]
  },
  {
    title: '🔒 서비스 제한 조항이라고?',
    subtitle: '제13조 ②항 — 이런 상황이 생길 수 있어요',
    scenes: [
      { bg: 'scene1', icon: '😊', bubble: '이 기능 믿고<br>계약했어!', caption: '핵심 기능을 보고 계약했습니다' },
      { bg: 'scene2', icon: '📨', bubble: '"서비스 일부<br>제한 안내"', caption: '갑자기 공지가 왔습니다' },
      { bg: 'scene3', icon: '😤', bubble: '왜 갑자기?<br>항의하려는데...', caption: '항의하려 했지만' },
      { bg: 'scene4', icon: '🤖', bubble: '제한 가능한 기능<br>목록을 서면으로 받으세요!', caption: 'CATCHCUT이 미리 알려드립니다', isAdvice: true },
    ]
  }
];

let comicIdx = 0;

function regenComic() {
  comicIdx = (comicIdx + 1) % comicVariants.length;
  const v = comicVariants[comicIdx];
  const strip = document.getElementById('comicStrip');
  strip.querySelector('.comic-title').textContent = v.title;
  strip.querySelector('.comic-subtitle').textContent = v.subtitle;
  const panels = strip.querySelectorAll('.panel');
  v.scenes.forEach((s, i) => {
    const scene = panels[i].querySelector('.panel-scene');
    scene.className = 'panel-scene ' + s.bg;
    if (s.isAdvice) {
      scene.innerHTML = `<div class="catchcut-advice"><div class="advice-icon">${s.icon}</div><div class="advice-text">${s.bubble}</div></div>`;
    } else {
      scene.innerHTML = `<div class="stick-figure">${s.icon}</div><div class="speech-bubble">${s.bubble}</div>`;
    }
    panels[i].querySelector('.panel-caption').textContent = s.caption;
  });
}

// ===== Ping modal extra styles (injected) =====
const extraStyles = `
  .ping-response { display: flex; flex-direction: column; gap: 1rem; }
  .ping-response-type { font-weight: 700; font-size: 1rem; color: var(--red); }
  .ping-original {
    background: var(--gray-light);
    border-radius: 8px;
    padding: 0.75rem;
    font-size: 0.8rem;
    color: var(--gray);
    line-height: 1.6;
    border-left: 3px solid var(--red);
    font-style: italic;
  }
  .ping-result-text {
    font-size: 0.9rem;
    line-height: 1.8;
    color: var(--dark);
  }
  .mini-comic {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .mini-panel {
    flex: 1;
    background: #EFF6FF;
    border-radius: 8px;
    padding: 0.75rem 0.5rem;
    text-align: center;
    font-size: 0.8rem;
    border: 1.5px solid var(--border);
  }
  .mini-panel.warn { background: #FEF2F2; }
  .mini-panel.safe { background: #F0FDF4; }
  .mini-scene { line-height: 1.6; }
  .mini-arrow { color: var(--gray); font-size: 1rem; flex-shrink: 0; }
  .danger-analysis { display: flex; flex-direction: column; gap: 0.75rem; }
  .danger-level { font-size: 0.85rem; font-weight: 600; }
  .risk-badge { font-size: 0.82rem; }
  .question-list ol { padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.6rem; }
  .question-list li { font-size: 0.88rem; line-height: 1.6; }
  .question-list strong { display: block; margin-bottom: 0.75rem; }
`;

const styleEl = document.createElement('style');
styleEl.textContent = extraStyles;
document.head.appendChild(styleEl);
