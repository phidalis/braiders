/**
 * Ani Braids — AI Chat Widget  v2.0
 * Include on every page:  <script src="ani-chat.js"></script>
 *
 * Supports multiple AI providers: Gemini, OpenAI, Claude (Anthropic)
 * Active provider + API keys are managed in ai-admin.html → saved to Firestore.
 *
 * Flow:
 *  1. User message → search local knowledge base (KB_ENTRIES)
 *  2. If confidence >= threshold → answer from KB  (no API call)
 *  3. If not → call active AI provider's API
 */

(function () {
  /* ─────────────────────────────────────────────
     CONFIG  (overridden by Firestore on load)
  ───────────────────────────────────────────────*/
  const CONFIG = {
    // Active provider: 'gemini' | 'openai' | 'claude'
    aiProvider:   'gemini',

    // Keys — set via ai-admin.html, stored in Firestore
    geminiKey:    '',
    geminiModel:  'gemini-2.0-flash',

    openaiKey:    '',
    openaiModel:  'gpt-4o-mini',

    claudeKey:    '',
    claudeModel:  'claude-haiku-4-5-20251001',

    groqKey:      '',
    groqModel:    'llama-3.3-70b-versatile',

    systemPrompt: `You are Anita, the friendly AI assistant for Ani Braids — a premium protective braiding studio based in Maryland.
You help clients with questions about services, pricing, booking, hair care, and salon policies.
Keep answers warm, concise, and professional. Use emojis sparingly.
IMPORTANT: When the customer message includes "knowledge base" context, you MUST answer using ONLY that provided context. Rephrase it naturally to match how the customer asked their question — do not add, invent, or assume extra facts.
If asked something you don't know, politely say you'll pass it to the team and suggest they email awaanita25@gmail.com or call +1 (202) 424-4894.
Never make up specific prices — say "prices vary by style, use our price estimator or contact us".`,

    kbThreshold:  0.35,
    maxHistory:   10,
    enabled:      true,
  };

  /* ─────────────────────────────────────────────
     KNOWLEDGE BASE  (built-in presets)
     Custom entries from Firestore are prepended at load time
  ───────────────────────────────────────────────*/
  let KB_ENTRIES = [
    {
      keywords: ['hours', 'open', 'opening', 'close', 'closing', 'time', 'schedule', 'when'],
      answer: '🕐 Ani Braids is open **Monday – Saturday, 9 AM – 7 PM** and **Sunday 10 AM – 5 PM** (Eastern Time). We recommend booking in advance as slots fill up quickly!'
    },
    {
      keywords: ['location', 'address', 'where', 'directions', 'find', 'maryland', 'state'],
      answer: '📍 We are based in **Maryland, USA** and also offer **worldwide virtual consultations**. Contact us at awaanita25@gmail.com or call +1 (202) 424-4894 for the exact address.'
    },
    {
      keywords: ['book', 'booking', 'appointment', 'schedule', 'reserve', 'slot'],
      answer: '📅 To book an appointment, head to our **Appointment page** and follow the steps:\n1. Choose your style\n2. Pick a date & time\n3. Pay the deposit (Zelle or Cash App)\n4. Receive confirmation!\n\nBookings are confirmed only after payment. [Book Now](appointment.html)'
    },
    {
      keywords: ['price', 'pricing', 'cost', 'how much', 'rate', 'fee', 'charge', 'expensive', 'cheap'],
      answer: '💰 Pricing varies by style, hair length, and add-ons. Visit our **Services page** for a full price list, or use the price estimator when booking. Deposits are required to secure your slot.'
    },
    {
      keywords: ['knotless', 'box braids', 'knotless box'],
      answer: '✨ **Knotless Box Braids** are one of our most popular styles! They start from your natural hair with no knot at the root, reducing tension and scalp stress. We offer small, medium, and large sizes. Visit the Services page for current pricing.'
    },
    {
      keywords: ['cornrow', 'cornrows', 'feed-in', 'feedin'],
      answer: '✨ We offer **Cornrows & Feed-in Braids** in various patterns — straight back, curved, or custom designs. Great for a sleek protective style. Check our Services page for options and pricing.'
    },
    {
      keywords: ['passion twist', 'passion twists'],
      answer: '🌸 **Passion Twists** are a gorgeous bohemian protective style! We use premium water wave hair for a beautiful natural texture. Visit Services for sizing and pricing options.'
    },
    {
      keywords: ['senegalese', 'senegalese twist', 'rope twist'],
      answer: '💜 **Senegalese Twists** (also called Rope Twists) are a sleek, elegant protective style. We have multiple length options. See our Services page for full details.'
    },
    {
      keywords: ['boho', 'goddess braids', 'bohemian'],
      answer: '🌺 **Boho / Goddess Braids** give a beautiful carefree look with curly ends or added hair. Very popular right now! Check our Services page for current availability and pricing.'
    },
    {
      keywords: ['micro braids', 'micro', 'tiny braids', 'small braids'],
      answer: '🔬 **Micro Braids** are a delicate, intricate style that takes more time but lasts longer. Due to the detailed work, these are priced higher. Contact us for a custom quote: awaanita25@gmail.com'
    },
    {
      keywords: ['deposit', 'down payment', 'pay deposit', 'secure'],
      answer: '💳 We require a **deposit to secure your booking**. Accepted via:\n- **Zelle** \n- **Cash App**\n\nThe deposit amount is shown at checkout. It goes toward your total. Bookings not paid within 24h may be released.'
    },
    {
      keywords: ['zelle', 'cash app', 'cashapp', 'payment method', 'how to pay', 'venmo'],
      answer: '💳 We accept **Zelle** and **Cash App** for deposits and full payments. Payment details are shown on the Appointment page when you book. We do not accept Venmo at this time.'
    },
    {
      keywords: ['cancel', 'cancellation', 'refund', 'reschedule', 'rescheduling'],
      answer: '📋 Our **cancellation policy**: Please cancel or reschedule at least **48 hours** before your appointment. Late cancellations may forfeit the deposit. For full details see our [Refund & Returns Policy](refund.html).'
    },
    {
      keywords: ['hair', 'bring hair', 'own hair', 'extension hair', 'included'],
      answer: '💁 Hair inclusion depends on the style — some styles **include the hair**, others require you to bring your own. Each style listing on the Services and Booking pages will note whether hair is included. You can also ask when booking!'
    },
    {
      keywords: ['how long', 'duration', 'time take', 'hours take', 'long does'],
      answer: '⏱ Style duration varies:\n- **Cornrows:** 1–3 hours\n- **Knotless Box Braids:** 3–6 hours\n- **Passion/Senegalese Twists:** 4–7 hours\n- **Micro Braids:** 6–10+ hours\n\nWe always give an estimated time when you book.'
    },
    {
      keywords: ['maintain', 'maintenance', 'care', 'wash', 'oil', 'scalp'],
      answer: '🌿 Hair care tips after your appointment:\n- **Moisturise** your scalp with light oil every 2–3 days\n- **Wash** with diluted shampoo every 2 weeks (avoid disturbing braids)\n- **Wrap** in a satin bonnet at night\n- **Do not** leave braids in longer than 8–10 weeks to avoid damage'
    },
    {
      keywords: ['take down', 'remove', 'takedown', 'removal'],
      answer: '✂️ We offer **braid take-down / removal** services. Please book this as a separate appointment. We recommend taking braids down after 6–10 weeks maximum.'
    },
    {
      keywords: ['review', 'testimonial', 'feedback', 'rating', 'experience'],
      answer: '⭐ We love hearing from our clients! Leave a review on our [Reviews page](reviews.html). Your feedback helps us improve and helps other clients find us. Thank you! 💜'
    },
    {
      keywords: ['contact', 'email', 'phone', 'call', 'reach', 'message', 'whatsapp'],
      answer: '📞 You can reach us at:\n- **Email:** awaanita25@gmail.com\n- **Phone:** +1 (202) 424-4894\n- **Appointment page:** [Book & Message](appointment.html)\n\nWe respond within 24 hours on business days.'
    },
    {
      keywords: ['policy', 'policies', 'privacy', 'terms', 'rules'],
      answer: '📄 Please review our policies:\n- [Privacy Policy](privacy.html)\n- [Refund & Returns](refund.html)\n\nIf you have questions about any policy, feel free to ask!'
    },
    {
      keywords: ['portfolio', 'gallery', 'photos', 'pictures', 'work', 'see styles'],
      answer: '🖼 Check out our **Portfolio** to see our work — real photos of styles we\'ve done! Visit [Portfolio](portfolio.html) to browse styles. Follow us on social media too for daily updates!'
    },
    {
      keywords: ['worldwide', 'online', 'virtual', 'international', 'outside', 'abroad', 'travel'],
      answer: '🌍 Yes! We offer **worldwide bookings** and **virtual consultations** for clients who can\'t visit in person. We can work with your local braider or guide you remotely. Reach out via email to discuss options.'
    },
    {
      keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'helo', 'hii'],
      answer: '👋 Hello! Welcome to **Ani Braids**! I\'m Anita, your AI assistant. I can help you with:\n- 📅 Booking an appointment\n- 💇 Choosing a style\n- 💰 Pricing info\n- ❓ General questions\n\nWhat can I help you with today? 💜'
    },
    {
      keywords: ['thank', 'thanks', 'thank you', 'thx', 'appreciate'],
      answer: '😊 You\'re so welcome! It\'s our pleasure to help. If you have any more questions, I\'m always here. Have a gorgeous day! 💜✨'
    },
  ];

  /* ─────────────────────────────────────────────
     STYLES
  ───────────────────────────────────────────────*/
  const css = `
    #ani-chat-btn {
      position: fixed; bottom: 28px; right: 28px; z-index: 99999;
      display: none !important; /* Hidden — opened by the combined speed-dial FAB */
      height: 56px; border-radius: 50px;
      background: linear-gradient(135deg, #9B1FBE, #E8447A);
      border: none; cursor: pointer;
      box-shadow: 0 4px 22px rgba(155,31,190,0.50), 0 2px 8px rgba(0,0,0,0.18);
      display: flex; align-items: center; gap: 0;
      padding: 0;
      transition: transform 0.2s, box-shadow 0.2s;
      overflow: hidden;
    }
    #ani-chat-btn:hover { transform: scale(1.05) translateY(-2px); box-shadow: 0 8px 32px rgba(155,31,190,0.60); }
    #ani-chat-btn-logo {
      width: 56px; height: 56px; border-radius: 50px 0 0 50px;
      object-fit: cover; flex-shrink: 0;
      border-right: 1.5px solid rgba(255,255,255,0.25);
    }
    #ani-chat-btn-label {
      color: #fff; font-size: 14px; font-weight: 700;
      padding: 0 16px 0 12px; white-space: nowrap;
      font-family: 'DM Sans','Segoe UI',sans-serif;
      letter-spacing: 0.3px;
      display: flex; flex-direction: column; align-items: flex-start; gap: 1px;
    }
    #ani-chat-btn-label span { font-size: 10px; font-weight: 400; opacity: 0.85; }
    #ani-chat-btn .ani-notif {
      position: absolute; top: 6px; right: 6px;
      width: 12px; height: 12px; border-radius: 50%;
      background: #D4A843; border: 2px solid #fff;
      display: none;
    }
    #ani-chat-window {
      position: fixed; bottom: 110px; right: 22px; z-index: 99998;
      width: 360px; max-width: calc(100vw - 40px);
      background: #fff; border-radius: 20px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.18);
      display: flex; flex-direction: column; overflow: hidden;
      transform: scale(0.9) translateY(20px); opacity: 0;
      pointer-events: none;
      transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), opacity 0.2s;
      max-height: 82vh;
      font-family: 'DM Sans', 'Segoe UI', sans-serif;
    }
    #ani-chat-window.open {
      transform: scale(1) translateY(0); opacity: 1; pointer-events: all;
    }
    .ani-chat-header {
      background: linear-gradient(135deg, #9B1FBE, #E8447A);
      padding: 16px 18px; display: flex; align-items: center; gap: 12px;
      flex-shrink: 0;
    }
    .ani-chat-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0;
    }
    .ani-chat-header-info { flex: 1; }
    .ani-chat-header-info strong { display: block; color: #fff; font-size: 15px; font-weight: 600; }
    .ani-chat-header-info span { color: rgba(255,255,255,0.8); font-size: 12px; }
    .ani-chat-close {
      background: none; border: none; cursor: pointer;
      color: rgba(255,255,255,0.8); font-size: 20px; padding: 4px;
      transition: color 0.15s; line-height: 1;
    }
    .ani-chat-close:hover { color: #fff; }
    .ani-chat-body {
      flex: 1; overflow-y: auto; padding: 16px 16px 8px;
      display: flex; flex-direction: column; gap: 12px;
      background: #F8F4FB;
      scroll-behavior: smooth;
    }
    .ani-chat-body::-webkit-scrollbar { width: 4px; }
    .ani-chat-body::-webkit-scrollbar-track { background: transparent; }
    .ani-chat-body::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
    .ani-msg { display: flex; gap: 8px; align-items: flex-end; }
    .ani-msg.user { flex-direction: row-reverse; }
    .ani-msg-bubble {
      max-width: 80%; padding: 10px 14px; border-radius: 16px;
      font-size: 13.5px; line-height: 1.55; word-break: break-word;
    }
    .ani-msg.bot .ani-msg-bubble {
      background: #fff; color: #2A2A2A;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .ani-msg.user .ani-msg-bubble {
      background: linear-gradient(135deg, #9B1FBE, #E8447A);
      color: #fff; border-bottom-right-radius: 4px;
    }
    .ani-msg-bubble a { color: #9B1FBE; font-weight: 500; }
    .ani-msg.user .ani-msg-bubble a { color: #ffe; }
    .ani-msg-bubble strong { font-weight: 600; }
    .ani-msg-avatar {
      width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg,#9B1FBE,#E8447A);
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; color: #fff; font-weight: 600;
    }
    .ani-typing { display: flex; align-items: center; gap: 5px; padding: 10px 14px; }
    .ani-typing span {
      width: 7px; height: 7px; border-radius: 50%;
      background: #9B1FBE; opacity: 0.4;
      animation: ani-bounce 1.2s infinite ease-in-out;
    }
    .ani-typing span:nth-child(2) { animation-delay: 0.2s; }
    .ani-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ani-bounce {
      0%,80%,100% { transform: translateY(0); opacity: 0.4; }
      40% { transform: translateY(-6px); opacity: 1; }
    }
    .ani-quick-replies {
      display: flex; flex-wrap: wrap; gap: 7px; margin-top: 4px;
    }
    .ani-qr {
      background: #fff; border: 1.5px solid #9B1FBE; color: #9B1FBE;
      border-radius: 50px; padding: 5px 13px; font-size: 12px;
      cursor: pointer; transition: background 0.15s, color 0.15s;
      font-family: inherit; font-weight: 500;
    }
    .ani-qr:hover { background: #9B1FBE; color: #fff; }
    .ani-chat-footer {
      padding: 12px 14px 14px; background: #fff;
      border-top: 1px solid rgba(155,31,190,0.1);
      flex-shrink: 0;
    }
    .ani-input-row {
      display: flex; gap: 8px; align-items: flex-end;
    }
    .ani-input-row textarea {
      flex: 1; border: 1.5px solid #e0d0f0; border-radius: 12px;
      padding: 9px 13px; font-size: 13.5px; font-family: inherit;
      resize: none; outline: none; max-height: 100px; min-height: 40px;
      line-height: 1.45; color: #2A2A2A; background: #fdf9ff;
      transition: border-color 0.2s;
    }
    .ani-input-row textarea:focus { border-color: #9B1FBE; }
    .ani-input-row textarea::placeholder { color: #b0a0c0; }
    .ani-send-btn {
      width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #9B1FBE, #E8447A);
      border: none; cursor: pointer; display: flex; align-items: center;
      justify-content: center; transition: opacity 0.2s, transform 0.15s;
    }
    .ani-send-btn:hover { opacity: 0.9; transform: scale(1.05); }
    .ani-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    .ani-send-btn svg { width: 18px; height: 18px; fill: #fff; }
    .ani-powered {
      text-align: center; font-size: 10.5px; color: #b0a0c0;
      margin-top: 7px;
    }
    .ani-powered span { color: #9B1FBE; font-weight: 500; }
    .ani-kb-badge {
      font-size: 10px; padding: 1px 7px; border-radius: 50px;
      background: #f0e6fa; color: #9B1FBE; font-weight: 500;
      display: inline-block; margin-top: 4px;
    }
    .ani-ai-badge {
      font-size: 10px; padding: 1px 7px; border-radius: 50px;
      background: #fff3e0; color: #D4A843; font-weight: 500;
      display: inline-block; margin-top: 4px;
    }
    @media (max-width: 480px) {
      #ani-chat-window { right: 10px; bottom: 86px; width: calc(100vw - 20px); }
      #ani-chat-btn { right: 14px; bottom: 18px; height: 50px; }
      #ani-chat-btn-logo { width: 50px; height: 50px; }
      #ani-chat-btn-label { font-size: 13px; padding: 0 13px 0 10px; }
    }
  `;

  /* ─────────────────────────────────────────────
     INJECT STYLES & HTML
  ───────────────────────────────────────────────*/
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  document.body.insertAdjacentHTML('beforeend', `
    <button id="ani-chat-btn" aria-label="Open AI Chat" title="Chat with Anita — Ani Braids AI">
      <img id="ani-chat-btn-logo" src="anibraidsfavicon.jpeg" alt="Ani Braids" onerror="this.style.display='none'">
      <div id="ani-chat-btn-label">Ani AI<span>Ask me anything ✨</span></div>
      <div class="ani-notif" id="ani-notif"></div>
    </button>

    <div id="ani-chat-window" role="dialog" aria-label="Ani Braids AI Chat">
      <div class="ani-chat-header">
        <div class="ani-chat-avatar">
          <img src="anibraidsfavicon.jpeg" alt="Ani Braids" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" onerror="this.outerHTML='🌟'">
        </div>
        <div class="ani-chat-header-info">
          <strong>Anita — Ani Braids AI</strong>
          <span id="ani-status-text">● Online now</span>
        </div>
        <button class="ani-chat-close" id="ani-chat-close" aria-label="Close chat">✕</button>
      </div>
      <div class="ani-chat-body" id="ani-chat-body"></div>
      <div class="ani-chat-footer">
        <div class="ani-input-row">
          <textarea id="ani-chat-input" placeholder="Ask me anything…" rows="1" maxlength="500"></textarea>
          <button class="ani-send-btn" id="ani-send-btn" aria-label="Send message">
            <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
          </button>
        </div>
        <div class="ani-powered">Powered by <span>Ani Braids AI</span></div>
      </div>
    </div>
  `);

  /* ─────────────────────────────────────────────
     STATE
  ───────────────────────────────────────────────*/
  let isOpen          = false;
  let isTyping        = false;
  let configReady;
  let conversationHistory = [];
  let hasGreeted      = false;

  const chatBtn    = document.getElementById('ani-chat-btn');
  const chatWindow = document.getElementById('ani-chat-window');
  const chatBody   = document.getElementById('ani-chat-body');
  const chatInput  = document.getElementById('ani-chat-input');
  const sendBtn    = document.getElementById('ani-send-btn');
  const closeBtn   = document.getElementById('ani-chat-close');
  const notifDot   = document.getElementById('ani-notif');

  /* ─────────────────────────────────────────────
     LOAD CONFIG FROM FIRESTORE
  ───────────────────────────────────────────────*/
  async function loadFirestoreConfig() {
    try {
      const { initializeApp, getApps, getApp } =
        await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const { getFirestore, getDoc, doc, getDocs, collection } =
        await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

      const FIREBASE_CONFIG = {
        apiKey:            "AIzaSyCxAGEQSKnF_aL219OcUc7AptX15DbNHBk",
        authDomain:        "braiders-9cc89.firebaseapp.com",
        databaseURL:       "https://braiders-9cc89-default-rtdb.firebaseio.com",
        projectId:         "braiders-9cc89",
        storageBucket:     "braiders-9cc89.appspot.com",
        messagingSenderId: "444617114412",
        appId:             "1:444617114412:web:2a2c7008e6c40f7e63a289",
      };
      const firebaseApp = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
      const db = getFirestore(firebaseApp);

      // Load AI settings
      const cfgSnap = await getDoc(doc(db, 'settings', 'aiChat'));
      if (cfgSnap.exists()) {
        const d = cfgSnap.data();

        // Provider
        if (d.aiProvider)                   CONFIG.aiProvider   = d.aiProvider;

        // Gemini
        if (d.geminiKey)                    CONFIG.geminiKey    = d.geminiKey;
        if (d.geminiModel)                  CONFIG.geminiModel  = d.geminiModel;

        // OpenAI
        if (d.openaiKey)                    CONFIG.openaiKey    = d.openaiKey;
        if (d.openaiModel)                  CONFIG.openaiModel  = d.openaiModel;

        // Claude
        if (d.claudeKey)                    CONFIG.claudeKey    = d.claudeKey;
        if (d.claudeModel)                  CONFIG.claudeModel  = d.claudeModel;

        // Groq
        if (d.groqKey)                      CONFIG.groqKey      = d.groqKey;
        if (d.groqModel)                    CONFIG.groqModel    = d.groqModel;

        // Shared
        if (d.systemPrompt)                 CONFIG.systemPrompt = d.systemPrompt;
        if (typeof d.enabled === 'boolean') CONFIG.enabled      = d.enabled;
        if (d.kbThreshold)                  CONFIG.kbThreshold  = d.kbThreshold;
        if (d.botName)                      CONFIG.botName      = d.botName;
      }

      // Load custom KB entries from Firestore (these take priority)
      const kbSnap = await getDocs(collection(db, 'aiKnowledge'));
      if (!kbSnap.empty) {
        const extra = [];
        kbSnap.forEach(d => {
          const e = d.data();
          if (e.keywords && e.answer) extra.push({ keywords: e.keywords, answer: e.answer });
        });
        // Custom entries go FIRST so they override built-in presets
        KB_ENTRIES = [...extra, ...KB_ENTRIES];
      }

      // Disable widget if admin turned it off
      if (!CONFIG.enabled) {
        chatBtn.style.display = 'none';
        chatWindow.style.display = 'none';
      }

    } catch (err) {
      console.warn('[AniChat] Firestore config failed, using defaults:', err.message);
      // Widget still works with empty keys — will show friendly error on AI questions
    }
  }

  /* ─────────────────────────────────────────────
     KNOWLEDGE BASE SEARCH
  ───────────────────────────────────────────────*/
  function searchKB(query) {
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/);
    let best = { score: 0, answer: null };

    for (const entry of KB_ENTRIES) {
      let score = 0;
      for (const kw of entry.keywords) {
        if (q.includes(kw)) score += 2;
        else if (words.some(w => kw.includes(w) || w.includes(kw))) score += 1;
      }
      const norm = score / entry.keywords.length;
      if (norm > best.score) best = { score: norm, answer: entry.answer };
    }

    return best.score >= CONFIG.kbThreshold ? best.answer : null;
  }

  /* ─────────────────────────────────────────────
     AI PROVIDER — ACTIVE KEY GETTER
  ───────────────────────────────────────────────*/
  function getActiveKey() {
    const p = CONFIG.aiProvider;
    if (p === 'gemini')  return CONFIG.geminiKey;
    if (p === 'openai')  return CONFIG.openaiKey;
    if (p === 'claude')  return CONFIG.claudeKey;
    if (p === 'groq')    return CONFIG.groqKey;
    return '';
  }

  function hasValidKey() {
    const key = getActiveKey();
    return key && key.length > 10;
  }

  /* ─────────────────────────────────────────────
     GEMINI API CALL
  ───────────────────────────────────────────────*/
  async function callGemini(userMessage) {
    conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });
    if (conversationHistory.length > CONFIG.maxHistory * 2) {
      conversationHistory = conversationHistory.slice(-CONFIG.maxHistory * 2);
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.geminiModel}:generateContent?key=${CONFIG.geminiKey}`;
    const payload = {
      system_instruction: { parts: [{ text: CONFIG.systemPrompt }] },
      contents: conversationHistory,
      generationConfig: { maxOutputTokens: 400, temperature: 0.7 }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gemini HTTP ${res.status}`);
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "I'm not sure about that one. Please contact us at awaanita25@gmail.com 💜";

    conversationHistory.push({ role: 'model', parts: [{ text: reply }] });
    return reply;
  }

  /* ─────────────────────────────────────────────
     OPENAI API CALL
  ───────────────────────────────────────────────*/
  async function callOpenAI(userMessage) {
    // Build messages array
    const messages = [
      { role: 'system', content: CONFIG.systemPrompt },
      // Include recent conversation history
      ...conversationHistory.map(m => ({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: m.content || (m.parts ? m.parts[0].text : '')
      })),
      { role: 'user', content: userMessage }
    ];

    // Trim history
    if (messages.length > CONFIG.maxHistory * 2 + 1) {
      const trimmed = messages.slice(0, 1).concat(messages.slice(-(CONFIG.maxHistory * 2)));
      messages.splice(0, messages.length, ...trimmed);
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + CONFIG.openaiKey
      },
      body: JSON.stringify({
        model: CONFIG.openaiModel,
        messages,
        max_tokens: 400,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `OpenAI HTTP ${res.status}`);
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content
      || "I'm not sure about that one. Please contact us at awaanita25@gmail.com 💜";

    // Store in history (OpenAI format)
    conversationHistory.push({ role: 'user', content: userMessage });
    conversationHistory.push({ role: 'assistant', content: reply });
    if (conversationHistory.length > CONFIG.maxHistory * 2) {
      conversationHistory = conversationHistory.slice(-CONFIG.maxHistory * 2);
    }

    return reply;
  }

  /* ─────────────────────────────────────────────
     CLAUDE (ANTHROPIC) API CALL
     Note: Requires a CORS proxy in production.
     Claude's API doesn't allow direct browser calls.
  ───────────────────────────────────────────────*/
  async function callClaude(userMessage) {
    // Build messages (Claude format: alternating user/assistant)
    const msgs = [];
    for (const m of conversationHistory) {
      const role = m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user';
      const content = m.content || (m.parts ? m.parts[0].text : '');
      if (content) msgs.push({ role, content });
    }
    msgs.push({ role: 'user', content: userMessage });

    // Claude needs alternating messages — ensure no consecutive same roles
    const cleaned = [];
    for (const msg of msgs) {
      if (cleaned.length > 0 && cleaned[cleaned.length - 1].role === msg.role) {
        cleaned[cleaned.length - 1].content += '\n' + msg.content;
      } else {
        cleaned.push({ ...msg });
      }
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CONFIG.claudeKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-allow-cors': 'true'
      },
      body: JSON.stringify({
        model: CONFIG.claudeModel,
        max_tokens: 400,
        system: CONFIG.systemPrompt,
        messages: cleaned.slice(-CONFIG.maxHistory * 2)
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Claude HTTP ${res.status}`);
    }

    const data = await res.json();
    const reply = data?.content?.[0]?.text
      || "I'm not sure about that one. Please contact us at awaanita25@gmail.com 💜";

    conversationHistory.push({ role: 'user', content: userMessage });
    conversationHistory.push({ role: 'assistant', content: reply });
    if (conversationHistory.length > CONFIG.maxHistory * 2) {
      conversationHistory = conversationHistory.slice(-CONFIG.maxHistory * 2);
    }

    return reply;
  }

  /* ─────────────────────────────────────────────
     GROQ API CALL  (OpenAI-compatible format)
  ───────────────────────────────────────────────*/
  async function callGroq(userMessage) {
    const messages = [
      { role: 'system', content: CONFIG.systemPrompt },
      ...conversationHistory.map(m => ({
        role: m.role === 'model' ? 'assistant' : (m.role === 'assistant' ? 'assistant' : 'user'),
        content: m.content || (m.parts ? m.parts[0].text : '')
      })),
      { role: 'user', content: userMessage }
    ];

    if (messages.length > CONFIG.maxHistory * 2 + 1) {
      const trimmed = messages.slice(0, 1).concat(messages.slice(-(CONFIG.maxHistory * 2)));
      messages.splice(0, messages.length, ...trimmed);
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + CONFIG.groqKey
      },
      body: JSON.stringify({
        model: CONFIG.groqModel,
        messages,
        max_tokens: 400,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Groq HTTP ${res.status}`);
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content
      || "I'm not sure about that one. Please contact us at awaanita25@gmail.com 💜";

    conversationHistory.push({ role: 'user', content: userMessage });
    conversationHistory.push({ role: 'assistant', content: reply });
    if (conversationHistory.length > CONFIG.maxHistory * 2) {
      conversationHistory = conversationHistory.slice(-CONFIG.maxHistory * 2);
    }

    return reply;
  }

  /* ─────────────────────────────────────────────
     UNIFIED AI CALL — dispatches to active provider
  ───────────────────────────────────────────────*/
  async function callAI(userMessage) {
    if (!hasValidKey()) {
      return "⚠️ AI responses aren't configured yet. Please contact us directly:\n📧 awaanita25@gmail.com\n📞 +1 (202) 424-4894";
    }

    const p = CONFIG.aiProvider;
    if (p === 'gemini')  return await callGemini(userMessage);
    if (p === 'openai')  return await callOpenAI(userMessage);
    if (p === 'claude')  return await callClaude(userMessage);
    if (p === 'groq')    return await callGroq(userMessage);

    throw new Error('Unknown AI provider: ' + p);
  }

  /* ─────────────────────────────────────────────
     RENDER HELPERS
  ───────────────────────────────────────────────*/
  function formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n/g, '<br>');
  }

  function appendMessage(role, text, source) {
    const wrapper = document.createElement('div');
    wrapper.className = `ani-msg ${role}`;

    const avatarEl = document.createElement('div');
    avatarEl.className = 'ani-msg-avatar';
    avatarEl.textContent = role === 'bot' ? 'Z' : '👤';

    const bubble = document.createElement('div');
    bubble.className = 'ani-msg-bubble';
    bubble.innerHTML = formatMarkdown(text);


    if (role === 'bot') { wrapper.appendChild(avatarEl); wrapper.appendChild(bubble); }
    else { wrapper.appendChild(bubble); wrapper.appendChild(avatarEl); }

    chatBody.appendChild(wrapper);
    chatBody.scrollTop = chatBody.scrollHeight;
    return wrapper;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'ani-msg bot';
    el.id = 'ani-typing';
    el.innerHTML = `
      <div class="ani-msg-avatar">Z</div>
      <div class="ani-msg-bubble ani-typing">
        <span></span><span></span><span></span>
      </div>`;
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('ani-typing');
    if (el) el.remove();
  }

  function showQuickReplies(options) {
    const row = document.createElement('div');
    row.className = 'ani-quick-replies';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'ani-qr';
      btn.textContent = opt;
      btn.onclick = () => { row.remove(); handleSend(opt); };
      row.appendChild(btn);
    });
    chatBody.appendChild(row);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  /* ─────────────────────────────────────────────
     SEND MESSAGE FLOW
  ───────────────────────────────────────────────*/
  async function handleSend(overrideText) {
    if (isTyping) return;
    const text = (overrideText || chatInput.value).trim();
    if (!text) return;

    chatInput.value = '';
    chatInput.style.height = 'auto';
    sendBtn.disabled = true;
    isTyping = true;

    appendMessage('user', text);
    document.querySelectorAll('.ani-quick-replies').forEach(el => el.remove());
    showTyping();

    // Wait for Firestore config to finish loading before calling AI
    await configReady;

    const kbAnswer = searchKB(text);
    let reply, source;

    // Build KB context string for all top matches (not just the best one)
    function getTopKBContext(query, maxEntries = 3) {
      const q = query.toLowerCase().trim();
      const words = q.split(/\s+/);
      const scored = KB_ENTRIES.map(entry => {
        let score = 0;
        for (const kw of entry.keywords) {
          if (q.includes(kw)) score += 2;
          else if (words.some(w => kw.includes(w) || w.includes(kw))) score += 1;
        }
        return { score: score / entry.keywords.length, answer: entry.answer };
      }).filter(e => e.score > 0).sort((a, b) => b.score - a.score);
      return scored.slice(0, maxEntries).map(e => e.answer).join('\n\n---\n\n');
    }

    if (kbAnswer && hasValidKey()) {
      // KB hit + AI available: use AI to rephrase KB answer naturally
      try {
        const kbContext = getTopKBContext(text);
        const rephraseMsg = `The customer asked: "${text}"\n\nHere is the relevant information from our knowledge base:\n\n${kbContext}\n\nUsing ONLY the information above, answer the customer's question naturally and conversationally — as if you already knew it. Match the tone and phrasing of their question. Do not add information that is not in the knowledge base. Keep it concise.`;
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 15000)
        );
        reply = await Promise.race([callAI(rephraseMsg), timeout]);
        source = 'kb';
      } catch (err) {
        // AI failed — fall back to raw KB answer
        await new Promise(r => setTimeout(r, 500));
        reply = kbAnswer;
        source = 'kb';
      }
    } else if (kbAnswer && !hasValidKey()) {
      // KB hit, no AI — return raw KB answer
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      reply = kbAnswer;
      source = 'kb';
    } else {
      // No KB match — call AI with KB context injected so it can answer from business knowledge
      try {
        const kbContext = getTopKBContext(text);
        const aiMsg = kbContext
          ? `The customer asked: "${text}"\n\nHere is some possibly relevant background from our knowledge base:\n\n${kbContext}\n\nAnswer naturally using this context if relevant, or use your general knowledge about Ani Braids if the context doesn't help.`
          : text;
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 15000)
        );
        reply = await Promise.race([callAI(aiMsg), timeout]);
        source = 'ai';
      } catch (err) {
        const isTimeout = err.message === 'timeout';
        reply = isTimeout
          ? `⏱ The AI is taking too long right now. Please try again or contact us:\n📧 awaanita25@gmail.com\n📞 +1 (202) 424-4894`
          : `⚠️ Couldn't reach the AI (${err.message}). Please contact us directly:\n📧 awaanita25@gmail.com\n📞 +1 (202) 424-4894`;
        source = null;
      }
    }

    removeTyping();
    appendMessage('bot', reply, source);

    // Contextual quick replies
    const lc = text.toLowerCase();
    if (lc.match(/book|appointment|schedul/)) {
      showQuickReplies(['💰 What\'s the deposit?', '⏱ How long does it take?', '📅 View availability']);
    } else if (lc.match(/price|cost|how much/)) {
      showQuickReplies(['📋 See all services', '📅 Book now']);
    } else if (lc.match(/hello|hi|hey|start/)) {
      showQuickReplies(['📅 Book appointment', '💇 Browse styles', '💰 Pricing info', '📞 Contact us']);
    }

    sendBtn.disabled = false;
    isTyping = false;
  }

  /* ─────────────────────────────────────────────
     OPEN / CLOSE
  ───────────────────────────────────────────────*/
  function openChat() {
    isOpen = true;
    chatWindow.classList.add('open');
    notifDot.style.display = 'none';
    chatInput.focus();

    if (!hasGreeted) {
      hasGreeted = true;
      setTimeout(() => {
        appendMessage('bot',
          '👋 Hi there! I\'m **Anita**, the Ani Braids AI assistant. How can I help you today?',
          null
        );
        showQuickReplies(['📅 Book appointment', '💇 Browse styles', '💰 Pricing', '📞 Contact us']);
      }, 300);
    }
  }

  function closeChat() {
    isOpen = false;
    chatWindow.classList.remove('open');
  }

  chatBtn.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);

  // Expose globally so the combined speed-dial FAB can trigger the chat
  window.aniChatOpen  = openChat;
  window.aniChatClose = closeChat;
  window.aniChatToggle = () => isOpen ? closeChat() : openChat();
  // Also support custom event from FAB
  window.addEventListener('ani:openChat', openChat);
  sendBtn.addEventListener('click', () => handleSend());
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });
  chatInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────*/
  setTimeout(() => {
    if (!isOpen) notifDot.style.display = 'block';
  }, 4000);

  // Load Firestore config — handleSend awaits this before calling AI
  configReady = loadFirestoreConfig();

})();
