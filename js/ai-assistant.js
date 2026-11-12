/**
 * StarX - AI Celestial Companion (Astra & Leo)
 * Natural, casual, human-like chat companion supporting both Male and Female avatars
 * matching the user's cozy chibi reference art.
 * Answers any question simply and clearly like a real friend, and operates StarX in real time.
 */

class AIAssistant {
  constructor(universe, constellationManager) {
    this.universe = universe;
    this.constellation = constellationManager;
    this.isOpen = false;
    this.isExpanded = false;
    this.isTyping = false;
    this.isTouring = false;
    this.conversation = [];

    // User profile state
    this.userName = 'Teja';
    this.gender = 'female'; // 'male' or 'female'
    this.companionName = 'Astra';

    this.init();
  }

  init() {
    this.createChatGPTDOM();
    this.setupEventListeners();
    this.updateAvatarVisuals();

    // Friendly initial greeting
    setTimeout(() => {
      this.addAssistantMessage(
        `Hey ${this.userName}! 😊 I'm ${this.companionName}, your cosmic friend. How are you doing today? Ready to explore infinite space or write your name in the stars?`
      );
    }, 1200);
  }

  setUser(name, gender) {
    if (name && name.trim()) this.userName = name.trim();
    if (gender) this.gender = gender;
    this.companionName = this.gender === 'male' ? 'Leo' : 'Astra';

    const titleEl = this.container.querySelector('.chat-companion-name');
    if (titleEl) titleEl.textContent = this.companionName;

    const subEl = this.container.querySelector('.chat-header-subtitle');
    if (subEl) {
      subEl.textContent = this.gender === 'male' ? 'Your Cosmic Buddy · StarX' : 'Your Celestial Guide · StarX';
    }

    this.updateAvatarVisuals();
  }

  createChatGPTDOM() {
    const container = document.createElement('aside');
    container.id = 'ai-doll-container';
    container.className = 'ai-doll-container';
    container.setAttribute('aria-label', 'Celestial AI Assistant');

    container.innerHTML = `
      <!-- Human-like Conversational Chat Window -->
      <div id="astra-chat-window" class="astra-chat-window">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="chat-header-identity">
            <div class="chat-avatar-mini">
              <span id="chat-header-avatar-emoji">👧</span>
              <span class="chat-status-dot" title="Online"></span>
            </div>
            <div>
              <div class="chat-header-title">
                <span class="chat-companion-name">Astra</span>
                <span class="chat-header-badge">AI Friend</span>
              </div>
              <div class="chat-header-subtitle">Your Celestial Guide · StarX</div>
            </div>
          </div>
          
          <div class="chat-header-actions">
            <button id="astra-expand-btn" class="chat-action-btn" title="Expand / Shrink Window">⤢</button>
            <button id="astra-clear-btn" class="chat-action-btn" title="Clear Conversation">🧹</button>
            <button id="astra-close-btn" class="chat-action-btn" title="Minimize Chat">✕</button>
          </div>
        </div>

        <!-- Chat Conversation Messages Stream -->
        <div id="astra-messages" class="astra-messages"></div>

        <!-- Thinking Indicator -->
        <div id="astra-thinking" class="astra-thinking">
          <div class="thinking-dots">
            <span>•</span><span>•</span><span>•</span>
          </div>
          <span class="thinking-text"><span class="chat-companion-name">Astra</span> is typing...</span>
        </div>

        <!-- Quick Suggestions Prompt Chips -->
        <div class="astra-prompt-chips">
          <button class="prompt-chip" data-query="Hi!">👋 Say Hi</button>
          <button class="prompt-chip" data-query="How are you?">😊 How are you?</button>
          <button class="prompt-chip" data-query="What can you do?">✨ What can you do?</button>
          <button class="prompt-chip" data-query="What is a constellation?">🌟 What's a constellation?</button>
          <button class="prompt-chip" data-query="What happens inside a black hole?">🌀 Black Holes</button>
          <button class="prompt-chip" data-query="Tell me a space joke">😄 Tell a joke</button>
          <button class="prompt-chip" data-query="Write TEJA in the stars">✍️ Write TEJA</button>
          <button class="prompt-chip" data-query="Let's fly through space!">🚀 Fly with me</button>
        </div>

        <!-- Chat Input Form -->
        <form id="astra-chat-form" class="astra-chat-form">
          <div class="chat-input-wrapper">
            <textarea
              id="astra-chat-input"
              class="astra-chat-input"
              placeholder="Chat naturally with Astra or ask any question..."
              rows="1"
              maxlength="400"
            ></textarea>
            <button type="submit" id="astra-chat-send" class="astra-chat-send" title="Send message">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <div class="chat-form-footer">
            <span>Natural human-like chat · Answers questions & operates StarX</span>
          </div>
        </form>
      </div>

      <!-- Floating Animated Chibi Doll Avatar (Trigger) -->
      <div id="ai-doll-avatar" class="ai-doll-avatar" title="Click to chat!">
        <div class="doll-orbital-ring"></div>
        <div class="doll-orbital-sparkle s1">✦</div>
        <div class="doll-orbital-sparkle s2">✧</div>
        
        <!-- Chibi Doll SVG Container (Dynamic Male / Female) -->
        <div id="chibi-avatar-svg-wrap" class="chibi-avatar-svg-wrap"></div>

        <span class="doll-ping"></span>
      </div>
    `;

    document.body.appendChild(container);

    this.container = container;
    this.chatWindow = container.querySelector('#astra-chat-window');
    this.messagesContainer = container.querySelector('#astra-messages');
    this.thinkingEl = container.querySelector('#astra-thinking');
    this.avatar = container.querySelector('#ai-doll-avatar');
    this.svgWrap = container.querySelector('#chibi-avatar-svg-wrap');
    this.chatForm = container.querySelector('#astra-chat-form');
    this.chatInput = container.querySelector('#astra-chat-input');
    this.closeBtn = container.querySelector('#astra-close-btn');
    this.expandBtn = container.querySelector('#astra-expand-btn');
    this.clearBtn = container.querySelector('#astra-clear-btn');
  }

  updateAvatarVisuals() {
    const isMale = this.gender === 'male';
    const headerEmoji = document.getElementById('chat-header-avatar-emoji');
    if (headerEmoji) headerEmoji.textContent = isMale ? '👦' : '👧';

    // Update avatar trigger SVG matching Image 2 reference faces
    if (this.svgWrap) {
      this.svgWrap.innerHTML = isMale ? this.getBoyChibiSVG() : this.getGirlChibiSVG();
    }
  }

  /**
   * Cozy Boy Chibi SVG (matching top-right & bottom-left in Image 2)
   */
  getBoyChibiSVG() {
    return `
      <svg class="doll-svg" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="boy-skin" x1="0" y1="0" x2="0" y2="100%">
            <stop offset="0%" stop-color="#fff5eb"/>
            <stop offset="100%" stop-color="#ffe4cf"/>
          </linearGradient>
          <linearGradient id="boy-hair" x1="0" y1="0" x2="0" y2="100%">
            <stop offset="0%" stop-color="#6d5447"/>
            <stop offset="100%" stop-color="#4a372c"/>
          </linearGradient>
          <linearGradient id="boy-coat" x1="0" y1="0" x2="0" y2="100%">
            <stop offset="0%" stop-color="#a68069"/>
            <stop offset="100%" stop-color="#8c644d"/>
          </linearGradient>
          <linearGradient id="boy-scarf" x1="0" y1="0" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#d6c5b8"/>
            <stop offset="100%" stop-color="#b8a598"/>
          </linearGradient>
        </defs>

        <!-- Body & Winter Coat -->
        <path d="M34 68 L66 68 L74 102 C60 106, 40 106, 26 102 Z" fill="url(#boy-coat)" stroke="#3a281e" stroke-width="1.8"/>
        <!-- Inner Dark Sweater -->
        <polygon points="50,68 44,84 56,84" fill="#3a3636"/>
        <!-- Coat Lapels -->
        <path d="M34 68 L44 86 L36 94" stroke="#3a281e" stroke-width="1.5" fill="none"/>
        <path d="M66 68 L56 86 L64 94" stroke="#3a281e" stroke-width="1.5" fill="none"/>
        <!-- Hands in Pockets -->
        <ellipse cx="32" cy="88" rx="4" ry="5" fill="url(#boy-skin)" stroke="#3a281e" stroke-width="1.4"/>
        <ellipse cx="68" cy="88" rx="4" ry="5" fill="url(#boy-skin)" stroke="#3a281e" stroke-width="1.4"/>
        <!-- Pants & Shoes -->
        <rect x="36" y="100" width="12" height="12" fill="#5a524c" rx="2"/>
        <rect x="52" y="100" width="12" height="12" fill="#5a524c" rx="2"/>
        <ellipse cx="42" cy="112" rx="7" ry="4" fill="#422e23"/>
        <ellipse cx="58" cy="112" rx="7" ry="4" fill="#422e23"/>

        <!-- Cozy Winter Scarf -->
        <path d="M36 62 C42 66, 58 66, 64 62 C68 70, 62 76, 50 75 C38 76, 32 70, 36 62 Z" fill="url(#boy-scarf)" stroke="#3a281e" stroke-width="1.6"/>
        <path d="M46 72 L44 86 L52 86 L54 73 Z" fill="url(#boy-scarf)" stroke="#3a281e" stroke-width="1.4"/>

        <!-- Chibi Head -->
        <ellipse cx="50" cy="44" rx="23" ry="21" fill="url(#boy-skin)" stroke="#3a281e" stroke-width="1.8"/>

        <!-- Cute Rosy Cheeks -->
        <ellipse cx="34" cy="50" rx="4.5" ry="2.5" fill="rgba(244, 114, 182, 0.45)"/>
        <ellipse cx="66" cy="50" rx="4.5" ry="2.5" fill="rgba(244, 114, 182, 0.45)"/>

        <!-- Sparkling Eyes (Blinking Group) -->
        <g class="doll-eyes">
          <ellipse cx="39" cy="45" rx="4" ry="5.5" fill="#2d221c"/>
          <circle cx="37.5" cy="43" r="1.6" fill="#ffffff"/>
          <ellipse cx="61" cy="45" rx="4" ry="5.5" fill="#2d221c"/>
          <circle cx="59.5" cy="43" r="1.6" fill="#ffffff"/>
        </g>

        <!-- Sweet Warm Smile -->
        <path d="M46 51 Q50 55 54 51" stroke="#3a281e" stroke-width="1.8" stroke-linecap="round" fill="none"/>

        <!-- Styled Hair (Messy / Layered with cute top tips) -->
        <path d="M26 42 C24 26, 36 18, 50 18 C64 18, 76 26, 74 42 C72 34, 66 30, 58 32 C52 28, 44 28, 38 34 C32 30, 28 36, 26 42 Z" fill="url(#boy-hair)" stroke="#3a281e" stroke-width="1.6"/>
        <!-- Bangs -->
        <path d="M30 38 C36 44, 42 42, 44 38 C46 44, 54 44, 58 38 C62 43, 68 41, 70 38" fill="url(#boy-hair)" stroke="#3a281e" stroke-width="1.5"/>
        <!-- Cute hair strands on top -->
        <path d="M48 18 Q46 12 50 10 Q52 14 53 18" fill="url(#boy-hair)"/>
      </svg>
    `;
  }

  /**
   * Cozy Girl Chibi SVG (matching top-left & bottom-right in Image 2)
   */
  getGirlChibiSVG() {
    return `
      <svg class="doll-svg" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="girl-skin" x1="0" y1="0" x2="0" y2="100%">
            <stop offset="0%" stop-color="#fff5eb"/>
            <stop offset="100%" stop-color="#ffe4cf"/>
          </linearGradient>
          <linearGradient id="girl-hair" x1="0" y1="0" x2="0" y2="100%">
            <stop offset="0%" stop-color="#c99d66"/>
            <stop offset="100%" stop-color="#a67c48"/>
          </linearGradient>
          <linearGradient id="girl-coat" x1="0" y1="0" x2="0" y2="100%">
            <stop offset="0%" stop-color="#ab826c"/>
            <stop offset="100%" stop-color="#8f624c"/>
          </linearGradient>
          <linearGradient id="girl-scarf" x1="0" y1="0" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e0d0c3"/>
            <stop offset="100%" stop-color="#c4b0a1"/>
          </linearGradient>
        </defs>

        <!-- Wavy Back Hair -->
        <path d="M24 45 C18 60, 16 85, 26 95 C30 84, 28 65, 30 50 Z" fill="url(#girl-hair)" stroke="#3a281e" stroke-width="1.6"/>
        <path d="M76 45 C82 60, 84 85, 74 95 C70 84, 72 65, 70 50 Z" fill="url(#girl-hair)" stroke="#3a281e" stroke-width="1.6"/>

        <!-- Cozy Winter Coat & Skirt -->
        <path d="M34 68 L66 68 L72 98 C60 102, 40 102, 28 98 Z" fill="url(#girl-coat)" stroke="#3a281e" stroke-width="1.8"/>
        <!-- Skirt & Boots -->
        <path d="M32 96 C42 101, 58 101, 68 96 L66 104 C56 107, 44 107, 34 104 Z" fill="#6d4c3d"/>
        <ellipse cx="40" cy="112" rx="6" ry="4" fill="#3a281e"/>
        <ellipse cx="60" cy="112" rx="6" ry="4" fill="#3a281e"/>

        <!-- Cute Handbag / Coffee -->
        <rect x="68" y="86" width="10" height="9" rx="2" fill="#d9c2a7" stroke="#3a281e" stroke-width="1.3"/>
        <path d="M71 86 C71 82, 75 82, 75 86" stroke="#3a281e" stroke-width="1.2" fill="none"/>

        <!-- Cozy Plaid Scarf -->
        <path d="M36 62 C42 66, 58 66, 64 62 C68 70, 62 76, 50 75 C38 76, 32 70, 36 62 Z" fill="url(#girl-scarf)" stroke="#3a281e" stroke-width="1.6"/>
        <path d="M44 72 L42 86 L50 86 L52 73 Z" fill="url(#girl-scarf)" stroke="#3a281e" stroke-width="1.4"/>

        <!-- Chibi Head -->
        <ellipse cx="50" cy="44" rx="23" ry="21" fill="url(#girl-skin)" stroke="#3a281e" stroke-width="1.8"/>

        <!-- Cute Rosy Cheeks -->
        <ellipse cx="34" cy="50" rx="4.5" ry="2.5" fill="rgba(251, 113, 133, 0.5)"/>
        <ellipse cx="66" cy="50" rx="4.5" ry="2.5" fill="rgba(251, 113, 133, 0.5)"/>

        <!-- Sparkling Eyes (Blinking Group) -->
        <g class="doll-eyes">
          <ellipse cx="39" cy="45" rx="4" ry="5.5" fill="#2d221c"/>
          <circle cx="37.5" cy="43" r="1.6" fill="#ffffff"/>
          <ellipse cx="61" cy="45" rx="4" ry="5.5" fill="#2d221c"/>
          <circle cx="59.5" cy="43" r="1.6" fill="#ffffff"/>
        </g>

        <!-- Sweet Happy Smile -->
        <path d="M46 51 Q50 55 54 51" stroke="#3a281e" stroke-width="1.8" stroke-linecap="round" fill="none"/>

        <!-- Hair Bangs & Headband -->
        <path d="M26 40 C28 24, 72 24, 74 40 C70 34, 58 32, 50 36 C42 32, 30 34, 26 40 Z" fill="url(#girl-hair)" stroke="#3a281e" stroke-width="1.6"/>
        <path d="M28 36 C34 42, 42 41, 46 37 C50 42, 58 42, 64 36 C68 40, 71 38, 72 36" fill="url(#girl-hair)"/>

        <!-- Cute Headband with Bear Ears (matching Image 2 top-left) -->
        <path d="M30 32 C38 24, 62 24, 70 32" stroke="#5c4335" stroke-width="2.5" fill="none"/>
        <circle cx="34" cy="24" r="4.5" fill="#5c4335"/>
        <circle cx="34" cy="24" r="2.2" fill="#d9c2a7"/>
        <circle cx="66" cy="24" r="4.5" fill="#5c4335"/>
        <circle cx="66" cy="24" r="2.2" fill="#d9c2a7"/>
      </svg>
    `;
  }

  setupEventListeners() {
    // 1. Avatar click toggles Chat window
    this.avatar.addEventListener('click', () => {
      this.toggleChatWindow();
      this.playChime();
    });

    // 2. Window action buttons
    this.closeBtn.addEventListener('click', () => this.hideChatWindow());

    this.expandBtn.addEventListener('click', () => {
      this.isExpanded = !this.isExpanded;
      this.chatWindow.classList.toggle('expanded', this.isExpanded);
      this.expandBtn.textContent = this.isExpanded ? '⤦' : '⤢';
    });

    this.clearBtn.addEventListener('click', () => {
      this.messagesContainer.innerHTML = '';
      this.conversation = [];
      this.addAssistantMessage(`Chat cleared! What's on your mind now, ${this.userName}? 😊`);
    });

    // 3. Prompt chips click
    this.container.querySelectorAll('.prompt-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        if (query) {
          this.submitUserMessage(query);
        }
      });
    });

    // 4. Input auto-resizing
    this.chatInput.addEventListener('input', () => {
      this.chatInput.style.height = 'auto';
      this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 100) + 'px';
    });

    // 5. Enter sends message (Shift+Enter for new line)
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.chatForm.dispatchEvent(new Event('submit'));
      }
    });

    // 6. Form submission
    this.chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = this.chatInput.value.trim();
      if (!text || this.isTyping) return;
      this.chatInput.value = '';
      this.chatInput.style.height = 'auto';
      this.submitUserMessage(text);
    });
  }

  toggleChatWindow() {
    if (this.chatWindow.classList.contains('active')) {
      this.hideChatWindow();
    } else {
      this.showChatWindow();
    }
  }

  showChatWindow() {
    this.chatWindow.classList.add('active');
    this.avatar.classList.add('talking');
    setTimeout(() => this.chatInput.focus(), 250);
    this.scrollToBottom();
  }

  hideChatWindow() {
    this.chatWindow.classList.remove('active');
    this.avatar.classList.remove('talking');
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }, 40);
  }

  playChime() {
    if (window.cosmicAudio && typeof window.cosmicAudio.playStarlightTwinkle === 'function') {
      window.cosmicAudio.playStarlightTwinkle();
    }
  }

  addUserMessage(text) {
    this.conversation.push({ sender: 'user', text });

    const msgEl = document.createElement('div');
    msgEl.className = 'chat-msg chat-msg-user';
    msgEl.innerHTML = `
      <div class="msg-bubble">
        <div class="msg-text">${this.escapeHTML(text)}</div>
      </div>
    `;
    this.messagesContainer.appendChild(msgEl);
    this.scrollToBottom();
  }

  /**
   * Add a simple, natural message from the companion
   */
  addAssistantMessage(text, callback) {
    this.conversation.push({ sender: 'assistant', text });

    const isMale = this.gender === 'male';
    const avatarEmoji = isMale ? '👦' : '👧';

    const msgEl = document.createElement('div');
    msgEl.className = 'chat-msg chat-msg-astra';
    msgEl.innerHTML = `
      <div class="msg-avatar">
        <span>${avatarEmoji}</span>
      </div>
      <div class="msg-bubble">
        <div class="msg-text">${this.formatCasualText(text)}</div>
      </div>
    `;

    this.messagesContainer.appendChild(msgEl);
    this.scrollToBottom();
    this.playChime();

    if (typeof callback === 'function') callback();
  }

  say(message, callback) {
    this.showChatWindow();
    this.addAssistantMessage(message, callback);
  }

  submitUserMessage(text) {
    this.addUserMessage(text);
    this.showThinking();

    // Natural conversation delay (500ms - 900ms)
    setTimeout(() => {
      const response = this.generateCasualResponse(text);
      this.hideThinking();
      this.addAssistantMessage(response.text);

      if (response.execution) {
        response.execution();
      }
    }, 550 + Math.random() * 350);
  }

  showThinking() {
    this.thinkingEl.classList.add('visible');
    this.scrollToBottom();
  }

  hideThinking() {
    this.thinkingEl.classList.remove('visible');
  }

  /**
   * Natural, human-to-human casual conversational replies
   * Like a friendly chat between two people!
   */
  generateCasualResponse(query) {
    const raw = query.trim();
    const clean = raw.toLowerCase();

    // 1. Natural Casual Greetings (Hi, Hello, Hey)
    if (/^(hi|hello|hey|heyy|heya|yo|hlo|hii|greetings)\b/i.test(clean)) {
      const greetings = [
        `Hey ${this.userName}! 😊 Great to see you! How's your day going?`,
        `Hi ${this.userName}! 👋 Ready to explore some stars today? What's on your mind?`,
        `Hey there! 😊 Loving this cosmic view. What do you want to check out together?`
      ];
      return { text: greetings[Math.floor(Math.random() * greetings.length)] };
    }

    // 2. How are you?
    if (/how are you|how r u|how you doing/i.test(clean)) {
      return {
        text: `I'm doing really good, thanks for asking! 😊 Feeling lucky to float out here in space with you. How are you feeling today, ${this.userName}?`
      };
    }

    // 3. What are you doing / What's up?
    if (/what are you doing|what's up|wassup|sup\b/i.test(clean)) {
      return {
        text: `Just admiring the nebula clouds and watching the stars drift by! Want to fly somewhere cool, or should we write something in the stars? ✨`
      };
    }

    // 4. Who are you?
    if (/who are you|what is your name|your name/i.test(clean)) {
      const intro = this.gender === 'male'
        ? `I'm **Leo**, your cosmic buddy here in StarX! 👦 I can answer your space questions, show you around the universe, or connect stars to spell whatever you like!`
        : `I'm **Astra**, your celestial guide here in StarX! 👧 I love chatting, answering space doubts, and helping you create constellations in the sky!`;
      return { text: intro };
    }

    // 5. What can you do? / Help
    if (/what can you do|help me|what do you do/i.test(clean)) {
      return {
        text: `Lots of fun things! 😊\n\n1. You can ask me to **write any name** in stars (like *"write TEJA"*).\n2. Ask me to make **shapes** like a heart, star, or butterfly.\n3. Chat with me about **black holes, planets, or stars**.\n4. Or tell me to **fly faster** or **take you on a galaxy tour**!\n\nWhat sounds fun right now?`
      };
    }

    // 6. Thank you / Thanks
    if (/thank you|thanks|thx/i.test(clean)) {
      return {
        text: `You're so welcome, ${this.userName}! 😊 I'm always right here if you want to chat or explore more.`
      };
    }

    // 7. Space Joke
    if (/joke|funny|laugh/i.test(clean)) {
      const jokes = [
        `Why did the sun go to school? To get a little brighter! 😄☀️`,
        `How do astronomers organize a party? They planet! 🪐🎉`,
        `Why can't you trust atoms? Because they literally make up everything! 😂⚛️`
      ];
      return { text: jokes[Math.floor(Math.random() * jokes.length)] };
    }

    // 8. Secret / Fun Fact
    if (/secret|easter egg|fun fact/i.test(clean)) {
      return {
        text: `Here's a cool secret! 🎮 If you press **W, A, S, D** or the **arrow keys**, you can steer this whole spaceship through infinite space like an endless space game! Try it out!`
      };
    }

    // -------------------------------------------------------------
    // DIRECT STARX COMMANDS (Warm & Casual)
    // -------------------------------------------------------------

    // Name Constellation Command: e.g. "write Teja", "make starx"
    const nameMatch = raw.match(/(?:create|write|cast|make|spell|draw)\s+(?:the\s+name\s+)?([a-zA-Z]{2,14})/i);
    if (nameMatch && !['heart', 'star', 'moon', 'flower', 'cat', 'tour', 'what', 'love', 'why', 'who', 'joke', 'help'].includes(nameMatch[1].toLowerCase())) {
      const chosenName = nameMatch[1].toUpperCase();
      return {
        text: `On it! Connecting the stars to spell **"${chosenName}"** right now ✨ Look at the center of your screen!`,
        execution: () => {
          const nameInput = document.getElementById('name-input');
          const castBtn = document.getElementById('cast-btn');
          if (nameInput) nameInput.value = chosenName;
          if (castBtn) castBtn.click();
        }
      };
    }

    // Shapes: Heart, Star, Moon, Butterfly, etc.
    if (/heart|love/i.test(clean) && /make|create|draw|cast|show/i.test(clean)) {
      return {
        text: `Aww, making a glowing Heart constellation for you right now! ❤️ Look how bright it shines!`,
        execution: () => {
          const btn = document.querySelector('.shape-btn[data-shape="heart"]');
          if (btn) btn.click();
        }
      };
    }
    if (/butterfly/i.test(clean) && /make|create|draw|show/i.test(clean)) {
      return {
        text: `Connecting stars into a butterfly pattern! 🦋 Isn't that beautiful?`,
        execution: () => {
          const btn = document.querySelector('.shape-btn[data-shape="butterfly"]');
          if (btn) btn.click();
        }
      };
    }
    if (/moon/i.test(clean) && /make|create|draw|show/i.test(clean)) {
      return {
        text: `Forging a crescent Moon constellation for you right now! 🌙`,
        execution: () => {
          const btn = document.querySelector('.shape-btn[data-shape="moon"]');
          if (btn) btn.click();
        }
      };
    }
    if (/\bstar\b/i.test(clean) && /make|create|draw|show/i.test(clean) && !/what|why/i.test(clean)) {
      return {
        text: `Connecting a 5-pointed celestial star in the sky! ⭐ Check it out!`,
        execution: () => {
          const btn = document.querySelector('.shape-btn[data-shape="star"]');
          if (btn) btn.click();
        }
      };
    }

    // Tour / Fly / Warp
    if (/tour|show me around|guide me/i.test(clean)) {
      return {
        text: `Sit back and enjoy! 💫 Taking you on a smooth flight across the Andromeda galaxy and the accretion vortex right now!`,
        execution: () => this.actionTourGalaxy()
      };
    }
    if (/fly|fast|warp|boost|speed/i.test(clean) && !/why|what/i.test(clean)) {
      return {
        text: `Engaging warp speed! 🚀 Look at those stars streaming past! You can steer using W, A, S, D or arrow keys.`,
        execution: () => {
          if (this.universe) {
            this.universe.isInfiniteWarp = true;
            this.universe.cruiseSpeed = 1.4;
          }
        }
      };
    }

    // -------------------------------------------------------------
    // CLEAR USER DOUBTS (Simple, Direct, 2-3 Sentences)
    // -------------------------------------------------------------

    // What is a constellation?
    if (/what is (a )?constellation/i.test(clean)) {
      return {
        text: `A constellation is basically a connect-the-dots picture made of stars in the night sky! 🌟 Ancient stargazers named them after heroes, animals, and myths. In StarX, you can connect real stars to create your own!`
      };
    }

    // Black Hole doubt
    if (/black hole|event horizon|singularity/i.test(clean)) {
      return {
        text: `Think of a black hole like a cosmic whirlpool where gravity is so intense that nothing—not even light—can escape once it gets too close! 🌀 There's a 3D model of one right behind your view in StarX.`
      };
    }

    // How are stars born?
    if (/how (are )?stars born|star birth|where do stars come from/i.test(clean)) {
      return {
        text: `Stars are born inside giant clouds of gas and dust called nebulae! Gravity pulls all that dust tightly together until it gets so hot (15 million degrees!) that nuclear fusion ignites, and boom—a new star shines! ✨`
      };
    }

    // Can stars die / Supernova
    if (/can stars die|supernova|exploding star/i.test(clean)) {
      return {
        text: `Yes! When massive stars run out of fuel after millions of years, they collapse and explode in a giant blast called a **supernova**! 💥 All the gold, iron, and carbon in the universe came from dying stars.`
      };
    }

    // Why do stars twinkle?
    if (/twinkle/i.test(clean)) {
      return {
        text: `Stars twinkle because their light gets bent back and forth by warm and cool air moving in Earth's atmosphere! If you were out in space, stars would shine with steady, crystal-clear light. ✨`
      };
    }

    // Speed of light
    if (/speed of light/i.test(clean)) {
      return {
        text: `Light travels at roughly **300,000 kilometers per second** (about 186,000 miles/sec)! That means sunlight takes about 8 minutes and 20 seconds to reach your eyes on Earth. ⚡`
      };
    }

    // Are aliens real / Are we alone?
    if (/alien|alone in the universe|life on other planet/i.test(clean)) {
      return {
        text: `With trillions of galaxies and billions of Earth-like planets out there, it's very likely life exists somewhere! Scientists are actively looking for water and biosignatures on distant exoplanets right now. 👽🔭`
      };
    }

    // Saturn / Rings
    if (/saturn/i.test(clean)) {
      return {
        text: `Saturn's rings are made of billions of chunks of ice and rock, some tiny like pebbles and some big like houses! 🪐 They look solid from afar, but they're super thin—often just 10 to 30 meters thick!`
      };
    }

    // Love / Romance
    if (/what is love/i.test(clean)) {
      return {
        text: `Love is the bond that makes this vast universe feel warm and meaningful! ❤️ As Carl Sagan once said, in an infinite cosmos, the vastness is bearable only through love.`
      };
    }

    // General fallback: Friendly, helpful, casual answer
    return {
      text: `That's a great question, ${this.userName}! In short, everything in space is connected by gravity, light, and time. What specifically would you like to know more about, or should we make a constellation together? 😊`
    };
  }

  formatCasualText(text) {
    let html = this.escapeHTML(text);
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italics
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Line breaks
    html = html.replace(/\n\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  actionTourGalaxy() {
    if (this.isTouring || !this.universe || !this.universe.camera || !this.universe.controls) {
      this.addAssistantMessage("We're already touring right now! Enjoy the view!");
      return;
    }

    this.isTouring = true;
    const camera = this.universe.camera;
    const controls = this.universe.controls;

    const tourWaypoints = [
      {
        pos: new THREE.Vector3(600, 250, 400),
        target: new THREE.Vector3(0, 0, 0),
        speech: "Here we go! Soaring above the stellar plane to view the grand spiral arms of Andromeda! 💫",
        duration: 3200
      },
      {
        pos: new THREE.Vector3(-450, -180, 250),
        target: new THREE.Vector3(-200, 50, -100),
        speech: "Approaching the Cosmic Accretion Vortex! Look at how matter swirls at relativistic speeds! 🌀",
        duration: 3400
      },
      {
        pos: new THREE.Vector3(0, 0, 850),
        target: new THREE.Vector3(0, 0, 0),
        speech: "And we're back at your constellation nexus! Pretty breathtaking, right? ✨",
        duration: 2500
      }
    ];

    let currentStage = 0;

    const executeWaypoint = () => {
      if (currentStage >= tourWaypoints.length) {
        this.isTouring = false;
        return;
      }

      const wp = tourWaypoints[currentStage];
      this.addAssistantMessage(wp.speech);

      const startPos = camera.position.clone();
      const startTarget = controls.target.clone();
      const startTime = performance.now();

      const animateFlight = (now) => {
        const elapsed = (now - startTime) / wp.duration;
        if (elapsed < 1.0) {
          const t = elapsed < 0.5 ? 4 * elapsed * elapsed * elapsed : 1 - Math.pow(-2 * elapsed + 2, 3) / 2;
          camera.position.lerpVectors(startPos, wp.pos, t);
          controls.target.lerpVectors(startTarget, wp.target, t);
          requestAnimationFrame(animateFlight);
        } else {
          camera.position.copy(wp.pos);
          controls.target.copy(wp.target);
          currentStage++;
          setTimeout(executeWaypoint, 800);
        }
      };

      requestAnimationFrame(animateFlight);
    };

    executeWaypoint();
  }

  onConstellationCreated(title, nodeCount) {
    setTimeout(() => {
      this.addAssistantMessage(
        `Look at that, ${this.userName}! "${title}" is officially lit up in the stars with ${nodeCount} connected nodes! ✨ It looks amazing!`
      );
    }, 1200);
  }
}

window.AIAssistant = AIAssistant;
