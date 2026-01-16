import type { AppState } from '../state/AppState';
import type { Hunt } from '../types/Hunt';

interface Message {
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: number;
}

/**
 * ChatWidget component - AI-powered hunt discovery assistant
 */
export class ChatWidget {
  private state: AppState;
  private chatToggle!: HTMLButtonElement;
  private chatWidget!: HTMLElement;
  private messagesContainer!: HTMLElement;
  private chatInput!: HTMLInputElement;
  private sendButton!: HTMLButtonElement;
  private closeButton!: HTMLButtonElement;
  private minimizeBtn!: HTMLButtonElement;
  private maximizeBtn!: HTMLButtonElement;
  private quickReplyContainer!: HTMLElement;
  private themeSwatches!: NodeListOf<HTMLButtonElement>;

  private isOpen = false;
  private currentTypingIndicator: HTMLElement | null = null;
  private messages: Message[] = [];
  private isMaximized = false;

  private quickReplyTemplates = [
    'Show me the latest persistence hunts',
    'What is the PEAK framework?',
    'Recommend hunts for data exfiltration',
    'How do I submit a new hunt?'
  ];

  private readonly themeKey = 'hearth.chat.theme';
  private readonly availableThemes = ['forge', 'ember', 'frost'];
  private currentTheme: string;

  constructor(state: AppState) {
    this.state = state;
    this.currentTheme = this.getStoredTheme();
    this.init();
  }

  private init(): void {
    this.createChatWidget();
    this.setupEventListeners();
    this.addWelcomeMessage();
    this.renderQuickReplies();
    this.applyTheme(this.currentTheme);
  }

  private createChatWidget(): void {
    // Create chat toggle button
    const chatToggle = document.createElement('button');
    chatToggle.className = 'chat-toggle';
    chatToggle.innerHTML = '💬';
    chatToggle.setAttribute('aria-label', 'Open HEARTH Hunt Assistant');
    document.body.appendChild(chatToggle);

    // Create chat widget
    const chatWidget = document.createElement('div');
    chatWidget.className = 'chat-widget';
    chatWidget.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-meta">
          <span class="presence-dot" aria-hidden="true"></span>
          <div class="chat-title-block">
            <span class="chat-title">🔥 HEARTH Hunt Assistant</span>
            <span class="chat-status">Online • threat hunting support</span>
          </div>
        </div>
        <div class="chat-header-controls">
          <div class="chat-theme-palette" aria-label="Select assistant theme">
            ${this.availableThemes.map(theme =>
              `<button class="chat-theme-swatch" data-theme="${theme}" title="${theme} mode"></button>`
            ).join('')}
          </div>
          <button class="chat-size-btn" id="minimize-btn" title="Minimize">−</button>
          <button class="chat-size-btn" id="maximize-btn" title="Maximize">□</button>
          <button class="close-btn" aria-label="Close chat">×</button>
        </div>
      </div>
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-quick-replies" id="chat-quick-replies" aria-label="Quick replies"></div>
      <div class="chat-input-container">
        <input type="text" class="chat-input" placeholder="Ask about threat hunts..." maxlength="500">
        <button class="chat-send-btn">Send</button>
      </div>
    `;
    document.body.appendChild(chatWidget);

    // Store references
    this.chatToggle = chatToggle;
    this.chatWidget = chatWidget;
    this.messagesContainer = this.getElement('chat-messages');
    this.chatInput = chatWidget.querySelector('.chat-input') as HTMLInputElement;
    this.sendButton = chatWidget.querySelector('.chat-send-btn') as HTMLButtonElement;
    this.closeButton = chatWidget.querySelector('.close-btn') as HTMLButtonElement;
    this.minimizeBtn = chatWidget.querySelector('#minimize-btn') as HTMLButtonElement;
    this.maximizeBtn = chatWidget.querySelector('#maximize-btn') as HTMLButtonElement;
    this.quickReplyContainer = this.getElement('chat-quick-replies');
    this.themeSwatches = chatWidget.querySelectorAll('.chat-theme-swatch');
  }

  private setupEventListeners(): void {
    // Toggle chat widget
    this.chatToggle.addEventListener('click', () => this.toggleChat());
    this.closeButton.addEventListener('click', () => this.closeChat());

    // Send message on button click or Enter key
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Enable/disable send button based on input
    this.chatInput.addEventListener('input', () => {
      this.sendButton.disabled = this.chatInput.value.trim().length === 0;
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeChat();
      }
    });

    // Size control buttons
    this.minimizeBtn.addEventListener('click', () => this.minimizeChat());
    this.maximizeBtn.addEventListener('click', () => this.toggleMaximize());

    // Theme switcher
    this.themeSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        const theme = swatch.getAttribute('data-theme');
        if (theme) {
          this.applyTheme(theme);
        }
      });
    });
  }

  private toggleChat(): void {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  private openChat(): void {
    this.isOpen = true;
    this.chatWidget.classList.add('open');
    this.chatToggle.classList.add('hidden');
    this.chatInput.focus();

    setTimeout(() => this.scrollToBottom(), 100);
  }

  private closeChat(): void {
    this.isOpen = false;
    this.chatWidget.classList.remove('open');
    this.chatToggle.classList.remove('hidden');
  }

  private minimizeChat(): void {
    this.closeChat();
  }

  private toggleMaximize(): void {
    this.isMaximized = !this.isMaximized;
    this.chatWidget.classList.toggle('maximized');
    this.maximizeBtn.innerHTML = this.isMaximized ? '❐' : '□';
  }

  private addWelcomeMessage(): void {
    const welcomeText = `👋 Welcome to the HEARTH Hunt Assistant! I can help you:

🔍 **Search hunts** - "Show me lateral movement hunts"
🎯 **Explore tactics** - "What hunts target persistence?"
🔥 **PEAK guidance** - "When should I use Flames vs Embers?"
📊 **Hunt stats** - "How many hunts do we have?"

What would you like to explore?`;

    this.addMessage('bot', welcomeText);
  }

  private renderQuickReplies(): void {
    this.quickReplyContainer.innerHTML = '';
    this.quickReplyTemplates.forEach(template => {
      const button = document.createElement('button');
      button.className = 'chat-quick-reply';
      button.type = 'button';
      button.textContent = template;
      button.addEventListener('click', () => {
        this.chatInput.value = template;
        this.sendMessage();
      });
      this.quickReplyContainer.appendChild(button);
    });
  }

  private getStoredTheme(): string {
    try {
      const stored = window.localStorage.getItem(this.themeKey);
      if (stored && this.availableThemes.includes(stored)) {
        return stored;
      }
    } catch (error) {
      console.warn('Unable to load chat theme', error);
    }
    return 'forge';
  }

  private applyTheme(theme: string): void {
    const chosenTheme = this.availableThemes.includes(theme) ? theme : 'forge';
    this.currentTheme = chosenTheme;
    this.chatWidget.dataset.theme = chosenTheme;
    this.highlightActiveTheme();

    try {
      window.localStorage.setItem(this.themeKey, chosenTheme);
    } catch (error) {
      console.warn('Unable to persist chat theme', error);
    }
  }

  private highlightActiveTheme(): void {
    this.themeSwatches.forEach(swatch => {
      const theme = swatch.getAttribute('data-theme');
      swatch.classList.toggle('is-active', theme === this.currentTheme);
    });
  }

  private sendMessage(): void {
    const message = this.chatInput.value.trim();
    if (!message) {
      return;
    }

    // Add user message
    this.addMessage('user', message);
    this.chatInput.value = '';
    this.sendButton.disabled = true;

    // Show typing indicator
    this.showTypingIndicator();

    // Process message with slight delay for better UX
    setTimeout(() => {
      this.processMessage(message);
    }, 500 + Math.random() * 1000);
  }

  private addMessage(type: 'user' | 'bot' | 'system', content: string): void {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    messageDiv.textContent = content;

    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();

    // Store message
    this.messages.push({ type, content, timestamp: Date.now() });
  }

  private addHuntResult(hunt: Hunt): void {
    const huntDiv = document.createElement('div');
    huntDiv.className = 'chat-hunt-result';
    huntDiv.innerHTML = `
      <div class="hunt-result-header">
        <span class="hunt-result-id">${hunt.id}</span>
        <span class="hunt-result-category ${hunt.category.toLowerCase()}">${hunt.category}</span>
      </div>
      <h4 class="hunt-result-title">${hunt.title}</h4>
      <p class="hunt-result-tactic">${hunt.tactic}</p>
      <div class="hunt-result-tags">
        ${hunt.tags.slice(0, 3).map(tag => `<span class="hunt-result-tag">${tag}</span>`).join('')}
      </div>
    `;

    huntDiv.addEventListener('click', () => {
      // Open modal for this hunt
      const modal = document.querySelector('.hunt-modal');
      if (modal) {
        const event = new CustomEvent('openHuntModal', { detail: { huntId: hunt.id } });
        document.dispatchEvent(event);
      }
    });

    this.messagesContainer.appendChild(huntDiv);
    this.scrollToBottom();
  }

  private showTypingIndicator(): void {
    if (this.currentTypingIndicator) {
      this.currentTypingIndicator.remove();
    }

    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;

    this.messagesContainer.appendChild(typingDiv);
    this.currentTypingIndicator = typingDiv;
    this.scrollToBottom();
  }

  private hideTypingIndicator(): void {
    if (this.currentTypingIndicator) {
      this.currentTypingIndicator.remove();
      this.currentTypingIndicator = null;
    }
  }

  private processMessage(message: string): void {
    this.hideTypingIndicator();

    const lowerMessage = message.toLowerCase();

    // Intent detection and routing
    if (this.isSearchQuery(lowerMessage)) {
      this.handleHuntSearch(message);
    } else if (this.isTacticQuery(lowerMessage)) {
      this.handleTacticExploration(message);
    } else if (this.isPeakFrameworkQuery(lowerMessage)) {
      this.handlePeakFrameworkGuidance();
    } else if (this.isStatsQuery(lowerMessage)) {
      this.handleStatsQuery();
    } else if (this.isHelpQuery(lowerMessage)) {
      this.handleHelpQuery();
    } else {
      this.handleGeneralQuery(message);
    }
  }

  // Intent detection methods
  private isSearchQuery(message: string): boolean {
    const searchKeywords = ['show me', 'find', 'search', 'look for', 'hunts for', 'related to'];
    return searchKeywords.some(keyword => message.includes(keyword));
  }

  private isTacticQuery(message: string): boolean {
    const tacticKeywords = ['tactic', 'persistence', 'execution', 'lateral movement', 'exfiltration', 'command and control'];
    return tacticKeywords.some(keyword => message.includes(keyword));
  }

  private isPeakFrameworkQuery(message: string): boolean {
    const peakKeywords = ['peak', 'flames', 'embers', 'alchemy', 'framework', 'category', 'when to use'];
    return peakKeywords.some(keyword => message.includes(keyword));
  }

  private isStatsQuery(message: string): boolean {
    const statsKeywords = ['how many', 'count', 'stats', 'statistics', 'total'];
    return statsKeywords.some(keyword => message.includes(keyword));
  }

  private isHelpQuery(message: string): boolean {
    const helpKeywords = ['help', 'what can you do', 'commands', 'how to'];
    return helpKeywords.some(keyword => message.includes(keyword));
  }

  // Handler methods
  private handleHuntSearch(query: string): void {
    const results = this.searchHunts(query);

    if (results.length === 0) {
      this.addMessage('bot', "I couldn't find any hunts matching your query. Try searching for different keywords like 'persistence', 'network traffic', or 'suspicious processes'.");
      return;
    }

    const responseText = `Found ${results.length} hunt${results.length > 1 ? 's' : ''} matching your query:`;
    this.addMessage('bot', responseText);

    // Show hunt results
    results.slice(0, 5).forEach(hunt => {
      this.addHuntResult(hunt);
    });

    if (results.length > 5) {
      this.addMessage('system', `Showing top 5 results. ${results.length - 5} more hunts match your query.`);
    }
  }

  private handleTacticExploration(message: string): void {
    const tactic = this.extractTactic(message);
    const allHunts = this.state.getAllHunts();
    const hunts = allHunts.filter(hunt =>
      hunt.tactic.toLowerCase().includes(tactic.toLowerCase())
    );

    if (hunts.length === 0) {
      this.addMessage('bot', `I couldn't find hunts specifically for "${tactic}". Try these common tactics: Persistence, Execution, Lateral Movement, Exfiltration, Command and Control.`);
      return;
    }

    this.addMessage('bot', `Found ${hunts.length} hunt${hunts.length > 1 ? 's' : ''} targeting **${tactic}**:`);

    hunts.slice(0, 3).forEach(hunt => {
      this.addHuntResult(hunt);
    });
  }

  private handlePeakFrameworkGuidance(): void {
    const guidance = `🔥 **PEAK Framework Guidance:**

**🔥 Flames** - Hypothesis-driven hunts
- Use when you have a specific threat or technique to investigate
- Clear, testable objectives
- Example: "Hunt for suspicious PowerShell execution"

**🪵 Embers** - Baselining and exploratory analysis
- Use to understand your environment's normal behavior
- Foundation for detecting anomalies
- Example: "Establish network traffic baselines"

**🔮 Alchemy** - Model-assisted and algorithmic approaches
- Use advanced analytics and machine learning
- Pattern detection and automated analysis
- Example: "ML-based user behavior anomaly detection"

Would you like to see examples of hunts in any specific category?`;

    this.addMessage('bot', guidance);
  }

  private handleStatsQuery(): void {
    const stats = this.generateStats();
    const response = `📊 **HEARTH Database Stats:**

🎯 **Total Hunts:** ${stats.total}
🔥 **Flames:** ${stats.flames} hunts
🪵 **Embers:** ${stats.embers} hunts
🔮 **Alchemy:** ${stats.alchemy} hunts

**Top Tactics:**
${stats.topTactics.map(t => `• ${t.tactic}: ${t.count} hunts`).join('\n')}

**Recent Contributors:** ${stats.contributors} people`;

    this.addMessage('bot', response);
  }

  private handleHelpQuery(): void {
    const helpText = `🤖 **I can help you with:**

🔍 **Hunt Search**
- "Show me persistence hunts"
- "Find hunts about lateral movement"
- "Search for PowerShell hunts"

🎯 **Tactic Exploration**
- "What hunts target execution?"
- "Show me command and control hunts"

🔥 **PEAK Framework**
- "When should I use Flames?"
- "Explain the PEAK framework"
- "Difference between Embers and Alchemy"

📊 **Statistics**
- "How many hunts do we have?"
- "Show me database stats"

Just ask me in natural language! What would you like to explore?`;

    this.addMessage('bot', helpText);
  }

  private handleGeneralQuery(message: string): void {
    const keywords = this.extractKeywords(message);
    const results = this.searchHuntsByKeywords(keywords);

    if (results.length > 0) {
      this.addMessage('bot', 'Based on your message, here are some relevant hunts:');
      results.slice(0, 3).forEach(hunt => {
        this.addHuntResult(hunt);
      });
    } else {
      const suggestions = [
        "Try asking me to 'show me persistence hunts' or 'find lateral movement hunts'",
        "Ask about the PEAK framework: 'when should I use Flames?'",
        "Get stats: 'how many hunts do we have?'",
        "Need help? Just ask 'what can you help with?'"
      ];

      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      this.addMessage('bot', `I'm not sure how to help with that. ${randomSuggestion}`);
    }
  }

  // Search and utility methods
  private searchHunts(query: string): Hunt[] {
    const lowerQuery = query.toLowerCase();
    const allHunts = this.state.getAllHunts();

    return allHunts.filter(hunt => {
      return hunt.title.toLowerCase().includes(lowerQuery) ||
             hunt.tactic.toLowerCase().includes(lowerQuery) ||
             hunt.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
             hunt.submitter.name.toLowerCase().includes(lowerQuery) ||
             hunt.notes.toLowerCase().includes(lowerQuery);
    }).sort((a, b) => {
      // Prioritize exact matches in title
      const aScore = a.title.toLowerCase().includes(lowerQuery) ? 2 : 1;
      const bScore = b.title.toLowerCase().includes(lowerQuery) ? 2 : 1;
      return bScore - aScore;
    });
  }

  private searchHuntsByKeywords(keywords: string[]): Hunt[] {
    if (keywords.length === 0) {
      return [];
    }

    const allHunts = this.state.getAllHunts();
    return allHunts.filter(hunt => {
      return keywords.some(keyword =>
        hunt.title.toLowerCase().includes(keyword) ||
        hunt.tactic.toLowerCase().includes(keyword) ||
        hunt.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
    }).slice(0, 10);
  }

  private extractTactic(message: string): string {
    const commonTactics = [
      'persistence', 'execution', 'lateral movement', 'exfiltration',
      'command and control', 'privilege escalation', 'defense evasion',
      'credential access', 'discovery', 'collection', 'impact'
    ];

    for (const tactic of commonTactics) {
      if (message.toLowerCase().includes(tactic)) {
        return tactic;
      }
    }

    return 'persistence';
  }

  private extractKeywords(message: string): string[] {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = message.toLowerCase().split(/\s+/);
    return words.filter(word => word.length > 3 && !stopWords.includes(word));
  }

  private generateStats() {
    const allHunts = this.state.getAllHunts();
    const flames = allHunts.filter(h => h.category === 'Flames').length;
    const embers = allHunts.filter(h => h.category === 'Embers').length;
    const alchemy = allHunts.filter(h => h.category === 'Alchemy').length;

    // Count tactics
    const tacticCounts = new Map<string, number>();
    allHunts.forEach(hunt => {
      const tactic = hunt.tactic;
      tacticCounts.set(tactic, (tacticCounts.get(tactic) || 0) + 1);
    });

    const topTactics = Array.from(tacticCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tactic, count]) => ({ tactic, count }));

    return {
      total: allHunts.length,
      flames,
      embers,
      alchemy,
      topTactics,
      contributors: this.state.getUniqueContributors().size
    };
  }

  private scrollToBottom(): void {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  private getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`ChatWidget: Required element #${id} not found`);
    }
    return element;
  }
}
