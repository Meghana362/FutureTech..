// ─── StyleSense Frontend App ─────────────────────────────────────────────────

const API = '';  // Same origin (FastAPI serves this)

// ── Custom Cursor ─────────────────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');

document.addEventListener('mousemove', e => {
  cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  setTimeout(() => {
    ring.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  }, 60);
});

// ── Section Navigation ────────────────────────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`section-${name}`).classList.add('active');
  const btns = document.querySelectorAll('.nav-btn');
  btns.forEach(b => { if (b.textContent.toLowerCase().includes(name.substring(0,3))) b.classList.add('active'); });
}

// ── Chip Groups ───────────────────────────────────────────────────────────────
document.querySelectorAll('.chip-group').forEach(group => {
  group.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
});

function getChipValue(groupId) {
  const active = document.querySelector(`#${groupId} .chip.active`);
  return active ? active.dataset.value : '';
}

// ── Loader ────────────────────────────────────────────────────────────────────
function showLoader(text = 'Consulting AI stylists…') {
  document.getElementById('loaderText').textContent = text;
  document.getElementById('loaderOverlay').classList.remove('hidden');
}
function hideLoader() {
  document.getElementById('loaderOverlay').classList.add('hidden');
}

// ── Fashion Recommendations ───────────────────────────────────────────────────
async function getRecommendations() {
  const payload = {
    body_type: getChipValue('bodyTypeGroup'),
    occasion: getChipValue('occasionGroup'),
    season: getChipValue('seasonGroup'),
    budget: getChipValue('budgetGroup'),
    colors: document.getElementById('colorsInput').value.split(',').map(s => s.trim()).filter(Boolean),
    style_keywords: document.getElementById('keywordsInput').value.split(',').map(s => s.trim()).filter(Boolean),
    gender: document.getElementById('genderInput').value,
    age_range: document.getElementById('ageInput').value,
  };

  showLoader('Crafting your personalized style…');
  try {
    const res = await fetch(`${API}/api/fashion/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    renderRecommendations(data);
  } catch (err) {
    renderError('recommendResults', err);
  } finally {
    hideLoader();
  }
}

function renderRecommendations(data) {
  const panel = document.getElementById('recommendResults');
  let html = '';

  // Style Profile
  if (data.style_profile) {
    html += `
      <div class="style-profile-block">
        <h4>Your Style Profile</h4>
        <p>${data.style_profile}</p>
      </div>`;
  }

  // Color Palette
  if (data.color_palette?.length) {
    html += `<div class="palette-section">
      <p class="palette-title">Your Color Palette</p>
      <div class="palette-swatches">
        ${data.color_palette.map(c => `<div class="swatch" style="background:${c}" data-color="${c}"></div>`).join('')}
      </div>
    </div>`;
  }

  // Key Pieces
  if (data.key_pieces?.length) {
    html += `<div class="key-pieces-grid" style="margin-bottom:24px">
      ${data.key_pieces.map(p => `<span class="key-piece-tag">${p}</span>`).join('')}
    </div>`;
  }

  // Outfit Recommendations
  if (data.outfit_recommendations?.length) {
    html += `<span class="section-label">Outfit Recommendations</span><div class="outfits-grid">`;
    data.outfit_recommendations.forEach(o => {
      const piecesHtml = (o.pieces || []).map(p => `
        <div class="outfit-piece">
          <div class="piece-color-dot" style="background:${p.color || '#ccc'}"></div>
          <div class="piece-info">
            <p class="piece-item">${p.item || ''}</p>
            <p class="piece-desc">${p.description || ''}</p>
          </div>
        </div>`).join('');
      html += `
        <div class="outfit-card">
          <div class="outfit-card-header">
            <span class="outfit-name">${o.outfit_name || 'Look'}</span>
            <span class="outfit-confidence">Confidence: ${o.confidence || '—'}%</span>
          </div>
          <div class="outfit-card-body">
            <div class="outfit-pieces">${piecesHtml}</div>
            ${o.styling_tip ? `<div class="outfit-tip">${o.styling_tip}</div>` : ''}
          </div>
        </div>`;
    });
    html += `</div>`;
  }

  // Styling Tips
  if (data.styling_tips?.length) {
    html += `<span class="section-label" style="margin-top:24px">Styling Tips</span>
      <div class="tips-list">
        ${data.styling_tips.map((t, i) => `
          <div class="tip-item">
            <span class="tip-num">0${i+1}</span>
            <p>${t}</p>
          </div>`).join('')}
      </div>`;
  }

  // AI Model Tag
  if (data.ai_model_used) {
    html += `<p style="margin-top:20px;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1px;color:var(--taupe);text-align:right">Powered by ${data.ai_model_used}</p>`;
  }

  panel.innerHTML = html || '<p style="color:var(--taupe)">No recommendations returned.</p>';
}

// ── Outfit Builder ────────────────────────────────────────────────────────────
async function buildOutfit() {
  const baseItem = document.getElementById('baseItemInput').value.trim();
  if (!baseItem) return;

  showLoader('Building your outfit…');
  try {
    const res = await fetch(`${API}/api/fashion/outfit-builder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_item: baseItem,
        occasion: getChipValue('occasionGroup') || 'casual',
        season: getChipValue('seasonGroup') || 'spring',
        budget: getChipValue('budgetGroup') || 'moderate',
        style_preference: 'classic',
      }),
    });
    const data = await res.json();
    renderOutfitBuilder(data);
  } catch (err) {
    renderError('outfitBuilderResult', err);
  } finally {
    hideLoader();
  }
}

function renderOutfitBuilder(data) {
  const el = document.getElementById('outfitBuilderResult');
  el.classList.remove('hidden');
  let html = `<span class="section-label">Complete Outfit</span>`;
  if (data.overall_vibe) {
    html += `<p style="font-size:18px;font-style:italic;color:var(--rust);margin-bottom:16px">"${data.overall_vibe}"</p>`;
  }
  if (data.complete_outfit) {
    html += data.complete_outfit.map(p => `
      <div class="outfit-piece">
        <div class="piece-color-dot" style="background:${p.color || '#ccc'}"></div>
        <div class="piece-info">
          <p class="piece-item">${p.piece || ''}</p>
          <p class="piece-desc">${p.why_it_works || ''}</p>
        </div>
      </div>`).join('');
  }
  if (data.shoes) html += `<p style="margin-top:12px;font-family:'DM Mono',monospace;font-size:12px;color:var(--taupe)">👟 SHOES: ${data.shoes}</p>`;
  if (data.bag) html += `<p style="font-family:'DM Mono',monospace;font-size:12px;color:var(--taupe)">👜 BAG: ${data.bag}</p>`;
  if (data.styling_tip) html += `<div class="outfit-tip" style="margin-top:16px">${data.styling_tip}</div>`;
  if (data.total_budget_estimate) html += `<p style="margin-top:12px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:1px;color:var(--gold)">ESTIMATED BUDGET: ${data.total_budget_estimate}</p>`;
  el.innerHTML = html;
}

// ── Image Analysis ─────────────────────────────────────────────────────────────
let uploadedFile = null;

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  uploadedFile = file;
  const preview = document.getElementById('uploadPreview');
  const placeholder = document.getElementById('uploadPlaceholder');
  preview.src = URL.createObjectURL(file);
  preview.classList.remove('hidden');
  placeholder.classList.add('hidden');
  document.getElementById('analyzeBtn').classList.remove('hidden');
}

async function analyzeImage() {
  if (!uploadedFile) return;
  showLoader('Analyzing outfit with Gemini Vision…');
  const formData = new FormData();
  formData.append('file', uploadedFile);
  try {
    const res = await fetch(`${API}/api/image/analyze`, { method: 'POST', body: formData });
    const data = await res.json();
    renderAnalysis(data);
  } catch (err) {
    renderError('analysisResults', err);
  } finally {
    hideLoader();
  }
}

function renderAnalysis(data) {
  const panel = document.getElementById('analysisResults');
  panel.className = '';
  let html = '';

  if (data.style_category) {
    html += `<div class="analysis-result-card">
      <div class="arc-header">Style Category</div>
      <div class="arc-body">${data.style_category}</div>
    </div>`;
  }
  if (data.detected_items?.length) {
    html += `<div class="analysis-result-card">
      <div class="arc-header">Detected Items</div>
      <div class="arc-body"><div class="arc-tags">${data.detected_items.map(i => `<span class="arc-tag">${i}</span>`).join('')}</div></div>
    </div>`;
  }
  if (data.color_palette?.length) {
    html += `<div class="analysis-result-card">
      <div class="arc-header">Color Palette</div>
      <div class="arc-body">
        <div class="palette-swatches">${data.color_palette.map(c => `<div class="swatch" style="background:${c}"></div>`).join('')}</div>
      </div>
    </div>`;
  }
  if (data.outfit_suggestions) {
    html += `<div class="analysis-result-card">
      <div class="arc-header">Outfit Suggestions</div>
      <div class="arc-body">${data.outfit_suggestions}</div>
    </div>`;
  }
  if (data.style_improvements) {
    html += `<div class="analysis-result-card">
      <div class="arc-header">Style Improvements</div>
      <div class="arc-body">${data.style_improvements}</div>
    </div>`;
  }
  if (data.trend_alignment) {
    html += `<div class="analysis-result-card">
      <div class="arc-header">Trend Alignment 2025</div>
      <div class="arc-body">${data.trend_alignment}</div>
    </div>`;
  }
  panel.innerHTML = html || '<p style="color:var(--taupe)">No analysis data returned.</p>';
}

// ── Trends ─────────────────────────────────────────────────────────────────────
async function getTrends() {
  const payload = {
    category: getChipValue('trendCategoryGroup') || 'womenswear',
    season: getChipValue('trendSeasonGroup') || 'spring',
  };
  showLoader('Fetching trend intelligence via Groq…');
  try {
    const res = await fetch(`${API}/api/trends/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    renderTrends(data);
  } catch (err) {
    const grid = document.getElementById('trendsResults');
    grid.classList.remove('hidden');
    grid.innerHTML = `<p style="color:var(--rust)">Error: ${err.message}</p>`;
  } finally {
    hideLoader();
  }
}

function renderTrends(data) {
  const grid = document.getElementById('trendsResults');
  grid.classList.remove('hidden');
  const trends = data.trends || [];
  let html = '';
  if (data.overall_direction) {
    html += `<div style="grid-column:1/-1;padding:20px 24px;background:var(--ink);color:var(--bone);margin-bottom:4px">
      <p style="font-family:'DM Mono',monospace;font-size:10px;letter-spacing:2px;opacity:.5;margin-bottom:6px">SEASON DIRECTION</p>
      <p style="font-size:16px;font-style:italic">${data.overall_direction}</p>
    </div>`;
  }
  trends.forEach((t, i) => {
    const confidence = t.confidence_score || 75;
    const palette = Array.isArray(t.color_palette) ? t.color_palette : [];
    const pieces = Array.isArray(t.key_pieces) ? t.key_pieces : [];
    html += `
      <div class="trend-card">
        <div class="trend-confidence-bar">
          <div class="trend-confidence-fill" style="width:${confidence}%"></div>
        </div>
        <div class="trend-card-header">
          <span class="trend-number">0${i+1}</span>
          <span style="font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1px;color:var(--taupe)">${confidence}% CONFIDENCE</span>
        </div>
        <div class="trend-card-body">
          <p class="trend-name">${t.name || 'Trend'}</p>
          <p class="trend-desc">${t.description || ''}</p>
          ${pieces.length ? `<div class="trend-pieces">${pieces.map(p=>`<span class="trend-piece">→ ${p}</span>`).join('')}</div>` : ''}
          ${palette.length ? `<div class="trend-palette">${palette.map(c=>`<div class="trend-swatch" style="background:${c}" title="${c}"></div>`).join('')}</div>` : ''}
          ${t.style_tip ? `<div class="trend-tip">${t.style_tip}</div>` : ''}
        </div>
      </div>`;
  });
  grid.innerHTML = html || '<p style="color:var(--taupe)">No trend data returned.</p>';
}

// ── Chat ───────────────────────────────────────────────────────────────────────
let chatHistory = [];

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  appendChatMessage('user', message);
  chatHistory.push({ role: 'user', content: message });
  const typingEl = showTypingIndicator();

  try {
    const res = await fetch(`${API}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: chatHistory.slice(-10) }),
    });
    const data = await res.json();
    typingEl.remove();
    const reply = data.reply || 'I could not generate a response.';
    appendChatMessage('assistant', reply);
    chatHistory.push({ role: 'assistant', content: reply });
  } catch (err) {
    typingEl.remove();
    appendChatMessage('assistant', `Connection error: ${err.message}. Make sure the FastAPI server is running.`);
  }
}

function sendSuggestion(btn) {
  document.getElementById('chatInput').value = btn.textContent;
  sendChatMessage();
}

function appendChatMessage(role, content) {
  const messages = document.getElementById('chatMessages');
  const initials = role === 'user' ? 'YOU' : 'SS';
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = `
    <div class="msg-avatar">${initials}</div>
    <div class="msg-bubble"><p>${content.replace(/\n/g, '<br>')}</p></div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function showTypingIndicator() {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg assistant typing-indicator';
  div.innerHTML = `
    <div class="msg-avatar">SS</div>
    <div class="msg-bubble">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

// ── Error Renderer ─────────────────────────────────────────────────────────────
function renderError(panelId, err) {
  const panel = document.getElementById(panelId);
  if (panel) {
    panel.innerHTML = `<div style="padding:20px;color:var(--rust);border:1px solid var(--rust);background:rgba(196,92,46,.05)">
      <p style="font-family:'DM Mono',monospace;font-size:12px;letter-spacing:1px">API ERROR</p>
      <p style="margin-top:8px;font-size:14px">${err.message}</p>
      <p style="margin-top:8px;font-size:13px;opacity:.7">Make sure the FastAPI server is running: <code>uvicorn main:app --reload</code></p>
    </div>`;
  }
}
