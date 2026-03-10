// ===== STYLESENSE AI - MAIN JS =====

const USER_ID = "user_" + Math.random().toString(36).substr(2, 9);
let currentOccasion = "Party 🎉";
let chatHistory = [];
let currentRating = 0;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadDailyTip();
  loadProfile();
  loadWardrobe();
  loadSavedOutfits();
  loadStyleScore();
  setupNavLinks();
});

function setupNavLinks() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchSection(link.dataset.section);
    });
  });
}

// ===== NAVIGATION =====
function switchSection(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  
  const el = document.getElementById('section-' + section);
  if (el) el.classList.add('active');
  
  const link = document.querySelector(`[data-section="${section}"]`);
  if (link) link.classList.add('active');
  
  if (section === 'lookbook') loadSavedOutfits();
  if (section === 'profile') loadStyleScore();
}

// ===== PANELS =====
function showOccasionSuggestion() {
  closeAllPanels();
  document.getElementById('panel-occasion').style.display = 'block';
  document.getElementById('panel-occasion').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function showWeatherFashion() {
  closeAllPanels();
  document.getElementById('panel-weather').style.display = 'block';
  document.getElementById('panel-weather').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function showImageAnalysis() {
  closeAllPanels();
  document.getElementById('panel-image').style.display = 'block';
  document.getElementById('panel-image').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function showColorMatch() {
  closeAllPanels();
  document.getElementById('panel-color').style.display = 'block';
  document.getElementById('panel-color').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function closeAllPanels() {
  ['panel-occasion','panel-weather','panel-image','panel-color'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
}
function closePanel(id) {
  document.getElementById(id).style.display = 'none';
}

// ===== DAILY TIP =====
async function loadDailyTip() {
  try {
    const res = await fetch('/api/daily-tip');
    const data = await res.json();
    document.getElementById('tip-text').textContent = data.tip;
  } catch (e) {
    document.getElementById('tip-text').textContent = "Build a capsule wardrobe: 10 versatile pieces that mix and match into 30+ outfits! 🎯";
  }
}

// ===== CHIP SELECTION =====
function selectChip(btn, group) {
  btn.closest('.occasion-chips').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  currentOccasion = btn.textContent;
}

// ===== OCCASION OUTFIT =====
async function getOccasionOutfit() {
  const loader = document.getElementById('occ-loader');
  const result = document.getElementById('occ-result');
  const gender = document.getElementById('occ-gender').value;
  const season = document.getElementById('occ-season').value;
  
  loader.style.display = 'inline-block';
  result.style.display = 'none';
  
  try {
    const form = new FormData();
    form.append('occasion', currentOccasion);
    form.append('gender', gender);
    form.append('season', season);
    
    const res = await fetch('/api/outfit/occasion', { method: 'POST', body: form });
    const data = await res.json();
    
    result.innerHTML = formatMarkdown(data.recommendation) + renderResultActions(data.recommendation, currentOccasion);
    result.style.display = 'block';
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (e) {
    result.innerHTML = '<p>Error getting recommendation. Please try again.</p>';
    result.style.display = 'block';
  }
  loader.style.display = 'none';
}

// ===== WEATHER FASHION =====
async function getWeatherFashion() {
  const city = document.getElementById('weather-city').value.trim();
  if (!city) { showToast('Please enter a city name'); return; }
  
  const result = document.getElementById('weather-result');
  const weatherDisplay = document.getElementById('weather-display');
  result.style.display = 'none';
  
  result.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
  result.style.display = 'block';
  
  try {
    const form = new FormData();
    form.append('city', city);
    form.append('occasion', document.getElementById('weather-occasion').value);
    
    const res = await fetch('/api/weather/fashion', { method: 'POST', body: form });
    const data = await res.json();
    
    document.getElementById('w-temp').textContent = Math.round(data.weather.temp) + '°C';
    document.getElementById('w-condition').textContent = data.weather.condition;
    document.getElementById('w-city').textContent = city;
    weatherDisplay.style.display = 'block';
    
    result.innerHTML = formatMarkdown(data.recommendation) + renderResultActions(data.recommendation, 'Weather Fashion - ' + city);
    result.style.display = 'block';
  } catch (e) {
    result.innerHTML = '<p>Error getting weather data. Please check city name and try again.</p>';
    result.style.display = 'block';
  }
}

// ===== IMAGE ANALYSIS =====
function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('preview-img').src = e.target.result;
    document.getElementById('image-preview').style.display = 'block';
    document.getElementById('upload-zone').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

async function analyzeImage() {
  const fileInput = document.getElementById('image-input');
  const result = document.getElementById('image-result');
  
  if (!fileInput.files[0]) { showToast('Please upload an image first'); return; }
  
  result.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
  result.style.display = 'block';
  
  try {
    const form = new FormData();
    form.append('file', fileInput.files[0]);
    form.append('user_id', USER_ID);
    
    const res = await fetch('/api/outfit/analyze-image', { method: 'POST', body: form });
    const data = await res.json();
    
    result.innerHTML = formatMarkdown(data.analysis) + renderResultActions(data.analysis, 'Image Analysis');
    result.style.display = 'block';
  } catch (e) {
    result.innerHTML = '<p>Error analyzing image. Please try again.</p>';
    result.style.display = 'block';
  }
}

// ===== COLOR MATCH =====
function setColor(colorName) {
  document.getElementById('color-name').value = colorName;
}

async function getColorMatch() {
  const colorName = document.getElementById('color-name').value.trim() || 'Navy Blue';
  const result = document.getElementById('color-result');
  
  result.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
  result.style.display = 'block';
  
  try {
    const form = new FormData();
    form.append('base_color', colorName);
    
    const res = await fetch('/api/color/match', { method: 'POST', body: form });
    const data = await res.json();
    
    result.innerHTML = formatMarkdown(data.combinations);
    result.style.display = 'block';
  } catch (e) {
    result.innerHTML = '<p>Error getting color match. Please try again.</p>';
    result.style.display = 'block';
  }
}

// ===== PROFILE =====
function selectToggle(btn, groupId) {
  document.getElementById(groupId).querySelectorAll('.toggle-btn, .style-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

async function saveProfile() {
  const form = new FormData();
  form.append('user_id', USER_ID);
  form.append('name', document.getElementById('p-name').value);
  form.append('age', document.getElementById('p-age').value);
  form.append('gender', document.querySelector('#gender-group .active')?.textContent || '');
  form.append('body_type', document.querySelector('#body-group .active')?.textContent || '');
  form.append('preferred_style', document.querySelector('#style-group .active')?.textContent || '');
  form.append('budget_range', document.querySelector('#budget-group .active')?.textContent || '');
  form.append('skin_tone', document.querySelector('#skin-group .active')?.textContent || '');
  
  const checkedColors = [...document.querySelectorAll('#fav-colors input:checked')].map(c => c.value);
  form.append('favorite_colors', checkedColors.join(', '));
  
  try {
    const res = await fetch('/api/profile/save', { method: 'POST', body: form });
    const data = await res.json();
    
    document.getElementById('profile-confirm').style.display = 'block';
    setTimeout(() => document.getElementById('profile-confirm').style.display = 'none', 3000);
    showToast('Profile saved successfully! ✦');
    loadStyleScore();
  } catch (e) {
    showToast('Error saving profile');
  }
}

async function loadProfile() {
  try {
    const res = await fetch('/api/profile/' + USER_ID);
    const data = await res.json();
    const p = data.profile;
    if (!p || !p.name) return;
    
    if (p.name) document.getElementById('p-name').value = p.name;
    if (p.age) document.getElementById('p-age').value = p.age;
  } catch (e) {}
}

// ===== STYLE SCORE =====
async function loadStyleScore() {
  try {
    const res = await fetch('/api/style-score/' + USER_ID);
    const data = await res.json();
    
    document.getElementById('score-display').textContent = data.score;
    document.getElementById('score-level').textContent = data.level;
    document.getElementById('nav-score').textContent = data.score;
    
    const pct = data.score;
    document.querySelector('.score-circle').style.background = 
      `conic-gradient(var(--accent) ${pct * 3.6}deg, var(--bg-3) ${pct * 3.6}deg)`;
    
    const breakdown = document.getElementById('score-breakdown');
    breakdown.innerHTML = Object.entries(data.breakdown).map(([k,v]) => 
      `<span>+${v} ${k}</span>`
    ).join('');
  } catch (e) {}
}

// ===== WARDROBE =====
async function addToWardrobe() {
  const name = document.getElementById('item-name').value.trim();
  if (!name) { showToast('Please enter item name'); return; }
  
  const form = new FormData();
  form.append('user_id', USER_ID);
  form.append('item_name', name);
  form.append('category', document.getElementById('item-cat').value);
  form.append('color', document.getElementById('item-color').value);
  form.append('brand', document.getElementById('item-brand').value);
  form.append('occasion', document.getElementById('item-occasion').value);
  
  try {
    const res = await fetch('/api/wardrobe/add', { method: 'POST', body: form });
    const data = await res.json();
    
    document.getElementById('item-name').value = '';
    document.getElementById('item-color').value = '';
    document.getElementById('item-brand').value = '';
    
    showToast('Item added to wardrobe! 👚');
    loadWardrobe();
  } catch (e) {
    showToast('Error adding item');
  }
}

async function loadWardrobe() {
  try {
    const res = await fetch('/api/wardrobe/' + USER_ID);
    const data = await res.json();
    const grid = document.getElementById('wardrobe-grid');
    const countEl = document.getElementById('item-count');
    
    countEl.textContent = data.total + ' item' + (data.total !== 1 ? 's' : '');
    
    if (data.items.length === 0) {
      grid.innerHTML = '<div class="empty-state">Add your first item to get started! 👗</div>';
      return;
    }
    
    grid.innerHTML = data.items.map(item => `
      <div class="wardrobe-item">
        <span>${item.name}</span>
        <span class="item-cat">${item.category}</span>
      </div>
    `).join('');
  } catch (e) {}
}

async function getWardrobeSuggestions() {
  const result = document.getElementById('wardrobe-result');
  const occasion = document.getElementById('wardrobe-occasion').value;
  
  result.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
  result.style.display = 'block';
  
  try {
    const form = new FormData();
    form.append('user_id', USER_ID);
    form.append('occasion', occasion);
    
    const res = await fetch('/api/wardrobe/suggest', { method: 'POST', body: form });
    const data = await res.json();
    
    result.innerHTML = formatMarkdown(data.suggestions) + renderResultActions(data.suggestions, 'Wardrobe Combinations');
    result.style.display = 'block';
  } catch (e) {
    result.innerHTML = '<p>Error getting suggestions. Please try again.</p>';
  }
}

// ===== TRENDS =====
async function getTrends() {
  const result = document.getElementById('trends-result');
  
  result.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
  result.style.display = 'block';
  
  try {
    const form = new FormData();
    form.append('season', document.getElementById('trend-season').value);
    form.append('style', document.getElementById('trend-style').value);
    form.append('gender', document.getElementById('trend-gender').value);
    
    const res = await fetch('/api/trends', { method: 'POST', body: form });
    const data = await res.json();
    
    result.innerHTML = formatMarkdown(data.trends) + renderResultActions(data.trends, 'Fashion Trends');
    result.style.display = 'block';
  } catch (e) {
    result.innerHTML = '<p>Error fetching trends. Please try again.</p>';
  }
}

// ===== LOOKBOOK =====
async function generateLookbook() {
  const result = document.getElementById('lookbook-result');
  
  result.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
  result.style.display = 'block';
  
  try {
    const form = new FormData();
    form.append('theme', document.getElementById('lb-theme').value);
    form.append('style', document.getElementById('lb-style').value);
    
    const res = await fetch('/api/lookbook/generate', { method: 'POST', body: form });
    const data = await res.json();
    
    result.innerHTML = formatMarkdown(data.lookbook) + renderResultActions(data.lookbook, 'My Lookbook - ' + data.theme);
    result.style.display = 'block';
  } catch (e) {
    result.innerHTML = '<p>Error generating lookbook. Please try again.</p>';
  }
}

// ===== SAVE OUTFIT =====
async function saveOutfit(content, name) {
  const form = new FormData();
  form.append('user_id', USER_ID);
  form.append('outfit_data', content);
  form.append('outfit_name', name || 'Outfit ' + new Date().toLocaleDateString());
  
  try {
    await fetch('/api/outfit/save', { method: 'POST', body: form });
    showToast('Outfit saved! 💾');
    loadSavedOutfits();
  } catch (e) {
    showToast('Error saving outfit');
  }
}

async function loadSavedOutfits() {
  try {
    const res = await fetch('/api/outfit/saved/' + USER_ID);
    const data = await res.json();
    const grid = document.getElementById('saved-outfits-grid');
    
    if (data.outfits.length === 0) {
      grid.innerHTML = '<div class="empty-state">No saved outfits yet. Generate some outfits and save your favorites!</div>';
      return;
    }
    
    grid.innerHTML = data.outfits.map(o => `
      <div class="saved-outfit-card">
        <div>
          <div class="outfit-card-name">${o.name}</div>
          <div class="outfit-card-date">${new Date(o.saved_at).toLocaleDateString()}</div>
        </div>
        <div class="outfit-card-actions">
          <button class="outfit-action-btn" onclick="viewSavedOutfit('${o.id}', '${encodeURIComponent(o.data)}')">View</button>
          <button class="outfit-action-btn" onclick="shareOutfit('${encodeURIComponent(o.name)}')">Share 📤</button>
        </div>
      </div>
    `).join('');
  } catch (e) {}
}

function viewSavedOutfit(id, encodedData) {
  const data = decodeURIComponent(encodedData);
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:500;display:flex;align-items:center;justify-content:center;padding:1rem';
  modal.innerHTML = `
    <div style="background:var(--card);border-radius:24px;padding:2rem;max-width:600px;width:100%;max-height:80vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <h3 style="font-family:var(--font-display);color:var(--text)">Saved Outfit</h3>
        <button onclick="this.closest('div[style*=fixed]').remove()" style="background:var(--bg-3);border:none;color:var(--text-2);width:32px;height:32px;border-radius:50%;cursor:pointer">✕</button>
      </div>
      <div style="color:var(--text-2);line-height:1.7;white-space:pre-wrap;font-size:0.9rem">${formatMarkdown(data)}</div>
    </div>
  `;
  document.body.appendChild(modal);
}

function shareOutfit(encodedName) {
  const name = decodeURIComponent(encodedName);
  if (navigator.share) {
    navigator.share({ title: 'My StyleSense Outfit: ' + name, text: 'Check out my AI-generated outfit from StyleSense!' });
  } else {
    navigator.clipboard.writeText('My StyleSense Outfit: ' + name + '\nGenerated by StyleSense AI Fashion Platform');
    showToast('Outfit link copied! 📋');
  }
}

// ===== CHAT =====
function openChat() {
  document.getElementById('chatbot').style.display = 'flex';
  document.getElementById('chat-fab').style.display = 'none';
  document.getElementById('chat-input').focus();
}

function closeChat() {
  document.getElementById('chatbot').style.display = 'none';
  document.getElementById('chat-fab').style.display = 'flex';
}

function quickReply(msg) {
  document.getElementById('chat-input').value = msg;
  sendChat();
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  
  input.value = '';
  addChatMessage(msg, 'user');
  
  // Typing indicator
  const typingId = 'typing-' + Date.now();
  const messagesEl = document.getElementById('chat-messages');
  const typingEl = document.createElement('div');
  typingEl.className = 'chat-msg bot';
  typingEl.id = typingId;
  typingEl.innerHTML = '<div class="msg-content"><div class="typing"><span></span><span></span><span></span></div></div>';
  messagesEl.appendChild(typingEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  
  chatHistory.push({ role: 'user', content: msg });
  
  try {
    const form = new FormData();
    form.append('message', msg);
    form.append('user_id', USER_ID);
    form.append('history', JSON.stringify(chatHistory.slice(-10)));
    
    const res = await fetch('/api/chat', { method: 'POST', body: form });
    const data = await res.json();
    
    document.getElementById(typingId)?.remove();
    chatHistory.push({ role: 'assistant', content: data.response });
    addChatMessage(data.response, 'bot');
    
    // Mark challenge as done
    document.getElementById('challenge-chat')?.querySelector('span')?.textContent === '⬜' &&
      (document.getElementById('challenge-chat').innerHTML = '<span>✅</span> Chat with AI stylist');
  } catch (e) {
    document.getElementById(typingId)?.remove();
    addChatMessage("Sorry, I'm having trouble connecting. Please check your API key or try again!", 'bot');
  }
}

function addChatMessage(content, role) {
  const messagesEl = document.getElementById('chat-messages');
  const msgEl = document.createElement('div');
  msgEl.className = 'chat-msg ' + role;
  
  const formatted = role === 'bot' ? formatMarkdown(content) : escapeHtml(content);
  msgEl.innerHTML = `<div class="msg-content">${formatted}</div>`;
  messagesEl.appendChild(msgEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ===== RATING =====
function renderResultActions(content, name) {
  const outfitId = 'outfit_' + Date.now();
  return `
    <div class="result-actions">
      <div class="rating-area">
        <span class="rating-label">Rate this:</span>
        <div class="stars" id="stars-${outfitId}">
          ${[1,2,3,4,5].map(i => `<span class="star" onclick="rateOutfit('${outfitId}', ${i})" data-val="${i}">★</span>`).join('')}
        </div>
      </div>
      <button class="btn-ghost small" onclick="saveOutfit(\`${escapeForAttr(content)}\`, '${escapeForAttr(name)}')">💾 Save</button>
      <button class="btn-ghost small" onclick="copyToClipboard(\`${escapeForAttr(content)}\`)">📋 Copy</button>
      <button class="btn-ghost small" onclick="downloadOutfit(\`${escapeForAttr(content)}\`, '${escapeForAttr(name)}')">⬇ Download</button>
    </div>
  `;
}

async function rateOutfit(outfitId, rating) {
  const stars = document.querySelectorAll(`#stars-${outfitId} .star`);
  stars.forEach((s, i) => s.classList.toggle('active', i < rating));
  
  try {
    const form = new FormData();
    form.append('outfit_id', outfitId);
    form.append('rating', rating);
    form.append('user_id', USER_ID);
    await fetch('/api/outfit/rate', { method: 'POST', body: form });
    showToast(`Rated ${rating} star${rating>1?'s':''}! ⭐`);
  } catch (e) {}
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard! 📋'));
}

function downloadOutfit(content, name) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (name || 'outfit') + '.txt';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Downloaded! ⬇');
}

// ===== THEME =====
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.dataset.theme === 'dark';
  html.dataset.theme = isDark ? 'light' : 'dark';
  document.getElementById('theme-icon').textContent = isDark ? '🌙' : '☀️';
}

// ===== TOAST =====
function showToast(msg, duration = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ===== MARKDOWN FORMAT =====
function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^#{1,3} (.+)$/gm, '<h3>$1</h3>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^([^<\n].+)$/gm, (m) => m.startsWith('<') ? m : m)
    .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeForAttr(text) {
  return (text || '').replace(/`/g, "'").replace(/\\/g, '\\\\').substring(0, 500);
}
