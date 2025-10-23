import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from '../../services/chatbot.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-container">
      <!-- Chat Icon Button -->
      <button 
        (click)="toggleChat()"
        class="chat-icon-button"
        [class.active]="isOpen"
        title="Chat with HR Assistant">
        <img src="assets/images/chatbot-icon.png" alt="Chatbot" class="chatbot-icon-img" />
        <span *ngIf="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
      </button>

      <!-- Chat Window -->
      <div *ngIf="isOpen" class="chat-window animate-slide-in">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="chat-title">
            <img src="assets/images/chatbot-icon.png" alt="Chatbot" class="chatbot-icon-img-header" />
            HR Assistant
          </div>
          <button (click)="toggleChat()" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Chat Messages -->
        <div class="chat-messages" #chatMessages>
          <div *ngFor="let message of messages" 
               class="message"
               [ngClass]="{'user-message': message.sender === 'user', 'bot-message': message.sender === 'bot'}">
            <div class="message-content">
              {{ message.text }}
            </div>
            <div class="message-time">
              {{ message.timestamp | date:'shortTime' }}
            </div>
          </div>
          <div *ngIf="isTyping" class="message bot-message">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="chat-input">
          <input 
            type="text" 
            [(ngModel)]="userInput"
            (keyup.enter)="sendMessage()"
            placeholder="Type your message..."
            class="message-input"
            [disabled]="isTyping"
          />
          <button (click)="sendMessage()" class="send-button" [disabled]="isTyping">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Chatbot Container */

    
    .chatbot-container {
  position: fixed;
  bottom: 2rem;
  right: 3rem;
  z-index: 1000;
}

.chat-icon-button {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 8px 25px rgba(102, 126, 234, 0.3),
    0 0 0 0 rgba(102, 126, 234, 0.4);
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  animation: float 3s ease-in-out infinite;
}

/* Floating animation */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

/* Pulse ring animation */
.chat-icon-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.2);
  transform: translate(-50%, -50%) scale(1);
  animation: pulse-ring 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  z-index: -1;
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}

/* Shimmer effect */
.chat-icon-button::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: rotate(45deg);
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

/* Hover effects */
.chat-icon-button:hover {
  transform: scale(1.15) translateY(-5px);
  box-shadow: 
    0 15px 35px rgba(102, 126, 234, 0.4),
    0 0 0 8px rgba(102, 126, 234, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  animation: none; /* Stop floating on hover */
}

.chat-icon-button:hover::before {
  animation: pulse-ring-hover 1s ease-out infinite;
}

@keyframes pulse-ring-hover {
  0% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.8);
    opacity: 0;
  }
}

/* Active/click state */
.chat-icon-button:active {
  transform: scale(1.05);
  transition: transform 0.1s ease;
}

/* Notification dot */
.chat-icon-button .notification-dot {
  position: absolute;
  top: 0.2rem;
  right: 0.2rem;
  width: 0.8rem;
  height: 0.8rem;
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  border-radius: 50%;
  border: 2px solid white;
  animation: notification-pulse 2s ease-in-out infinite;
}

@keyframes notification-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* Responsive design */
@media (max-width: 768px) {
  .chatbot-container {
    bottom: 1.5rem;
    right: 1.5rem;
  }
  
  .chat-icon-button {
    width: 3.5rem;
    height: 3.5rem;
    font-size: 1.4rem;
  }
}

/* Dark mode variant */
@media (prefers-color-scheme: dark) {
  .chat-icon-button {
    background: linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%);
    box-shadow: 
      0 8px 25px rgba(76, 29, 149, 0.3),
      0 0 0 0 rgba(76, 29, 149, 0.4);
  }
  
  .chat-icon-button::before {
    background: rgba(76, 29, 149, 0.2);
  }
  
  .chat-icon-button:hover {
    background: linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%);
    box-shadow: 
      0 15px 35px rgba(76, 29, 149, 0.4),
      0 0 0 8px rgba(76, 29, 149, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
}


    /* Notification Badge */
    .notification-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ef4444;
      color: white;
      border-radius: 50%;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: bold;
    }

    .chat-window {
      position: absolute;
      bottom: 4rem;
      right: 0;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .chat-header {
      padding: 0.5rem;
      background: linear-gradient(135deg, #2D78E0, #0F172A);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-title {
      font-weight: 600;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
    }

    .close-button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0.25rem;
    }

    .chat-messages {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message {
      max-width: 80%;
      padding: 0.75rem 1rem;
      border-radius: 1rem;
      position: relative;
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .user-message {
      align-self: flex-end;
      background: #2D78E0;
      color: white;
      border-bottom-right-radius: 0.25rem;
    }

    .bot-message {
      align-self: flex-start;
      background: #f3f4f6;
      color: #1f2937;
      border-bottom-left-radius: 0.25rem;
    }

    .message-time {
      font-size: 0.7rem;
      margin-top: 0.25rem;
      opacity: 0.8;
    }

    .chat-input {
      padding: 1rem;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 0.5rem;
    }

    .message-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .message-input:focus {
      border-color: #2D78E0;
    }

    .message-input:disabled {
      background-color: #f3f4f6;
      cursor: not-allowed;
    }

    .send-button {
      background: #2D78E0;
      color: white;
      border: none;
      border-radius: 0.5rem;
      padding: 0.75rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .send-button:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .send-button:disabled {
      background: #93c5fd;
      cursor: not-allowed;
    }

    .typing-indicator {
      display: flex;
      gap: 0.3rem;
      padding: 0.5rem;
    }

    .typing-indicator span {
      width: 0.5rem;
      height: 0.5rem;
      background: #9ca3af;
      border-radius: 50%;
      animation: typing 1s infinite ease-in-out;
    }

    .typing-indicator span:nth-child(1) {
      animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: 0.3s;
    }

    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-0.5rem);
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }

    @media (max-width: 640px) {
      .chat-window {
        width: calc(100vw - 2rem);
        height: calc(100vh - 6rem);
        bottom: 5rem;
        right: 1rem;
      }
    }

    .chatbot-icon-img {
      width: 3rem;
      height: 3rem;
      object-fit: contain;
    }

    .chatbot-icon-img-header {
      width: 1.5rem;
      height: 1.5rem;
      object-fit: contain;
      margin-right: 0.5rem;
    }
  `]
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') private chatMessages!: ElementRef;
  
  isOpen = false;
  messages: ChatMessage[] = [];
  userInput = '';
  unreadCount = 0;
  isTyping = false;

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit() {
    // Add initial bot message
    this.addBotMessage('Hello! I\'m your HR Assistant. How can I help you today?');
  }

  ngAfterViewChecked() {
    if (this.isOpen && this.chatMessages) {
      this.scrollToBottom();
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0;
    }
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isTyping) return;

    const userMessage = this.userInput;
    this.addUserMessage(userMessage);
    this.userInput = '';
    this.isTyping = true;

    this.chatbotService.sendMessage(userMessage).subscribe({
      next: (response) => {
        this.addBotMessage(response);
        this.isTyping = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.addBotMessage('Sorry, I encountered an error. Please try again later.');
        this.isTyping = false;
      }
    });
  }

  private addUserMessage(text: string) {
    this.messages.push({
      text,
      sender: 'user',
      timestamp: new Date()
    });
    setTimeout(() => this.scrollToBottom(), 0);
  }

  private addBotMessage(text: string) {
    this.messages.push({
      text,
      sender: 'bot',
      timestamp: new Date()
    });
    setTimeout(() => this.scrollToBottom(), 0);
  }

  private scrollToBottom(): void {
    try {
      if (this.chatMessages && this.chatMessages.nativeElement) {
        const element = this.chatMessages.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
} 