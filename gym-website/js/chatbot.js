// Wellness Gym Chatbot
class WellnessGymChatbot {
  constructor(config = {}) {
    this.apiEndpoint = config.apiEndpoint || WellnessGymChatbot.resolveDefaultApiEndpoint();
    this.fallbackApiEndpoint = config.fallbackApiEndpoint || null;
    this.sessionId = config.sessionId || this.generateSessionId();
    this.container = config.container || null;
    this.isOpen = false;
    this.isLoading = false;
    this.unreadCount = 0;
    this.init();
  }

  generateSessionId() { return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; }

  static resolveDefaultApiEndpoint() {
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') return `${window.location.origin}/api/chat`;
    return 'http://localhost:5000/api/chat';
  }

  init() { this.createHTML(); this.attachEventListeners(); this.renderQuickQuestions(); this.addGreeting(); }

  createHTML() {
    const html = `
      <div class="chatbot-container">
        <button class="chatbot-button" id="chatbotButton" title="Chat with us">💬<span class="chatbot-badge" id="chatbotBadge">0</span></button>
        <div class="chatbot-window" id="chatbotWindow">
          <div class="chatbot-header"><h3>Wellness Gym Assistant</h3><button class="chatbot-close" id="chatbotCloseBtn">✕</button></div>
          <div class="chatbot-messages" id="chatbotMessages"></div>
          <div class="chatbot-input-area">
            <div class="chatbot-quick-questions" id="chatbotQuickQuestions"></div>
            <div class="chatbot-input-row">
              <input type="text" class="chatbot-input" id="chatbotInput" placeholder="Ask about our gym, classes, pricing..." autocomplete="off">
              <button class="chatbot-send" id="chatbotSendBtn">📤</button>
            </div>
          </div>
        </div>
      </div>`;
    const container = this.container || document.body;
    container.insertAdjacentHTML('beforeend', html);
  }

  attachEventListeners() {
    const chatbotButton = document.getElementById('chatbotButton');
    const chatbotCloseBtn = document.getElementById('chatbotCloseBtn');
    const chatbotSendBtn = document.getElementById('chatbotSendBtn');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotQuickQuestions = document.getElementById('chatbotQuickQuestions');
    chatbotButton.addEventListener('click', () => this.toggleChat());
    chatbotCloseBtn.addEventListener('click', () => this.closeChat());
    chatbotSendBtn.addEventListener('click', () => this.sendMessage());
    chatbotInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !this.isLoading) { e.preventDefault(); this.sendMessage(); }
    });
    const closestByClass = (target, className) => {
      if (!target) return null;
      if (typeof target.closest === 'function') return target.closest('.' + className);
      let node = target;
      while (node && node !== document) {
        if (node.classList && node.classList.contains(className)) return node;
        node = node.parentNode;
      }
      return null;
    };
    if (chatbotQuickQuestions) {
      chatbotQuickQuestions.addEventListener('click', (e) => {
        const quickBtn = closestByClass(e.target, 'chatbot-quick-question');
        if (!quickBtn || this.isLoading) return;
        const question = quickBtn.getAttribute('data-question');
        if (!question) return;
        chatbotInput.value = question;
        this.sendMessage();
      });
    }
    chatbotWindow.addEventListener('click', () => { this.unreadCount = 0; this.updateBadge(); });
  }

  getQuickQuestions() { return ['What are your gym timings?','Do you have personal trainers?','Tell me about membership plans','Do you provide diet plans?']; }

  renderQuickQuestions() {
    const container = document.getElementById('chatbotQuickQuestions');
    if (!container) return;
    container.innerHTML = '';
    this.getQuickQuestions().forEach((question) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'chatbot-quick-question'; button.setAttribute('data-question', question); button.textContent = question;
      container.appendChild(button);
    });
  }

  setQuickQuestionsDisabled(disabled) { document.querySelectorAll('.chatbot-quick-question').forEach((button) => { button.disabled = disabled; }); }
  toggleChat() { this.isOpen ? this.closeChat() : this.openChat(); }
  openChat() { const w=document.getElementById('chatbotWindow'),i=document.getElementById('chatbotInput'); this.isOpen=true; w.classList.add('open'); i.focus(); this.unreadCount=0; this.updateBadge(); }
  closeChat() { this.isOpen=false; document.getElementById('chatbotWindow').classList.remove('open'); }
  addGreeting() { setTimeout(() => this.addMessageToChat("Hello! 👋 I'm the Wellness Gym Assistant. How can I help you today? Feel free to ask about our membership, classes, trainers, or anything else about our gym!", 'bot'), 500); }

  addMessageToChat(text, sender = 'user') {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageEl = document.createElement('div');
    messageEl.className = `chatbot-message ${sender}`;
    messageEl.innerHTML = `<div class="chatbot-message-content">${this.escapeHtml(text)}</div>`;
    messagesContainer.appendChild(messageEl); messagesContainer.scrollTop = messagesContainer.scrollHeight;
    if (!this.isOpen && sender === 'bot') { this.unreadCount++; this.updateBadge(); }
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbotMessages');
    const typingEl = document.createElement('div');
    typingEl.className='chatbot-message bot'; typingEl.id='typingIndicator';
    typingEl.innerHTML='<div class="chatbot-typing"><span></span><span></span><span></span></div>';
    messagesContainer.appendChild(typingEl); messagesContainer.scrollTop=messagesContainer.scrollHeight;
  }
  removeTypingIndicator() { const el=document.getElementById('typingIndicator'); if(el) el.remove(); }
  updateBadge() { const badge=document.getElementById('chatbotBadge'); if(this.unreadCount>0){badge.textContent=this.unreadCount>9?'9+':this.unreadCount;badge.classList.add('show');}else badge.classList.remove('show'); }
  escapeHtml(text) { const div=document.createElement('div'); div.textContent=text; return div.innerHTML; }

  async sendMessage() {
    const input=document.getElementById('chatbotInput'); const message=input.value.trim();
    if(!message||this.isLoading) return;
    this.addMessageToChat(message,'user'); input.value=''; input.focus(); this.showTypingIndicator(); this.isLoading=true; this.setQuickQuestionsDisabled(true);
    try {
      let response; let endpointUsed=this.apiEndpoint;
      try { response=await this.postMessage(this.apiEndpoint,message); }
      catch(primaryError){
        const shouldTryFallback=this.fallbackApiEndpoint&&this.fallbackApiEndpoint!==this.apiEndpoint;
        if(!shouldTryFallback) throw primaryError;
        response=await this.postMessage(this.fallbackApiEndpoint,message); endpointUsed=this.fallbackApiEndpoint; this.apiEndpoint=this.fallbackApiEndpoint;
      }
      const canRetryWithFallback=!response.ok&&this.fallbackApiEndpoint&&endpointUsed!==this.fallbackApiEndpoint;
      if(canRetryWithFallback){ response=await this.postMessage(this.fallbackApiEndpoint,message); this.apiEndpoint=this.fallbackApiEndpoint; }
      this.removeTypingIndicator();
      const payload=await this.parseJsonSafe(response);
      if(!response.ok) throw new Error(payload.error||payload.message||`Request failed with status ${response.status}`);
      if(!payload.message) throw new Error('Server returned an empty response');
      this.addMessageToChat(payload.message,'bot');
    } catch(error) {
      this.removeTypingIndicator(); this.addMessageToChat(this.getLocalFallbackReply(message),'bot'); console.error('Chatbot error:',error);
    } finally { this.isLoading=false; this.setQuickQuestionsDisabled(false); }
  }

  getLocalFallbackReply(message) {
    const text=String(message||'').toLowerCase();
    if(/hello|hi\b|hey\b|good (morning|afternoon|evening)/.test(text)) return 'Hi. I can help with memberships, class timings, personal training, diet plans, supplements, and general gym questions. Ask me anything about Wellness Gym and I will give you a clear answer.';
    if(/hour|open|close|timing|time/.test(text)) return 'We are open 24/7 for members, so you can train at a time that fits your schedule. If you want staffed desk timings or the best time for a visit, use the contact page and our team will confirm it.';
    if(/price|pricing|cost|fee|membership|plan/.test(text)) return 'We offer multiple membership plans based on your goals, whether you want basic access, coaching, or a more complete transformation package. For the latest pricing, offers, and discounts, please use the contact page so our team can guide you properly.';
    if(/trainer|personal|coach/.test(text)) return 'Yes. We have 50+ expert trainers and personal training options for strength, fat loss, muscle gain, and form correction. Share your goal on the contact page and we can suggest the right trainer for you.';
    if(/diet|nutrition|meal/.test(text)) return 'Absolutely. We provide diet guidance and nutrition support tailored to your fitness goal, whether you want to cut fat, build muscle, or improve energy. Reach out through the contact page for a personalized plan.';
    if(/supplement|protein|vitamin/.test(text)) return 'You can explore gym supplements on our Supplements page, including products for recovery, energy, and training support. If you want a recommendation, contact us and we will suggest options based on your goal.';
    if(/class|workout|training|program|routine/.test(text)) return 'We can help you choose the right training style, from strength work and hypertrophy to fat-loss conditioning and coaching-based plans. Tell me your goal and I will suggest the best direction.';
    if(/guest|trial|visit|tour|touring/.test(text)) return 'If you want to visit first, the best option is to contact us for a trial or guided visit. That way our team can explain the facilities and help you choose the right membership.';
    if(/location|address|where/.test(text)) return 'You can find the gym location and contact details on the contact page. If you want, I can also help you with what to ask before your first visit.';
    return 'I can help with gym hours, memberships, trainers, diet plans, supplements, classes, and trial visits. If you share a little more detail, I will give you a more specific answer instead of a generic one.';
  }

  async postMessage(endpoint,message){ return fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,sessionId:this.sessionId})}); }
  async parseJsonSafe(response){ const text=await response.text(); if(!text) return {}; try{return JSON.parse(text);}catch(error){return {message:text};} }

  clearSession(){
    const messagesContainer=document.getElementById('chatbotMessages'); messagesContainer.innerHTML=''; this.sessionId=this.generateSessionId(); this.unreadCount=0; this.updateBadge(); this.renderQuickQuestions(); this.addGreeting();
    fetch(this.apiEndpoint.replace('/api/chat','/api/chat/clear-session'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:this.sessionId})}).catch(err=>console.error('Error clearing session:',err));
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  const configuredEndpoint=document.documentElement.getAttribute('data-chatbot-api');
  const apiEndpoint=configuredEndpoint||WellnessGymChatbot.resolveDefaultApiEndpoint();
  let storedSessionId;
  try{storedSessionId=sessionStorage.getItem('chatbot_session_id')||undefined;}catch(error){storedSessionId=undefined;}
  window.gymChatbot=new WellnessGymChatbot({apiEndpoint,fallbackApiEndpoint:null,sessionId:storedSessionId});
  try{sessionStorage.setItem('chatbot_session_id',window.gymChatbot.sessionId);}catch(error){}
});
