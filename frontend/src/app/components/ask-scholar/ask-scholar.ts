import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat';
import { ChatMessage, ConversationSummary, ChatSource } from '../../models/chat';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
}

@Component({
  selector: 'app-ask-scholar',
  templateUrl: './ask-scholar.html',
  styleUrl: './ask-scholar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MarkdownPipe]
})
export class AskScholar implements OnInit, AfterViewChecked {
  private chatService = inject(ChatService);

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  private shouldScroll = false;

  messages = signal<DisplayMessage[]>([]);
  conversations = signal<ConversationSummary[]>([]);
  activeConversationId = signal<string | null>(null);
  inputMessage = signal('');
  isLoading = signal(false);
  error = signal('');
  showHistory = signal(false);

  hasMessages = computed(() => this.messages().length > 0);

  exampleQuestions = [
    'What is nisab and how do I calculate it?',
    'Do I pay zakat on my 401(k) retirement account?',
    'Is zakat due on my primary residence?',
    'Who is eligible to receive zakat?',
    'How do I calculate zakat on gold jewelry?'
  ];

  ngOnInit(): void {
    this.loadConversations();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  sendMessage(messageText?: string): void {
    const message = (messageText ?? this.inputMessage()).trim();
    if (!message || this.isLoading()) return;

    this.inputMessage.set('');
    this.error.set('');

    this.messages.update(msgs => [...msgs, { role: 'user', content: message }]);
    this.shouldScroll = true;
    this.isLoading.set(true);

    this.chatService.ask(message, this.activeConversationId() ?? undefined).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success && response.answer) {
          this.messages.update(msgs => [...msgs, {
            role: 'assistant',
            content: response.answer!,
            sources: response.sources
          }]);
          this.shouldScroll = true;

          if (response.conversationId) {
            this.activeConversationId.set(response.conversationId);
          }

          this.loadConversations();
        } else {
          this.error.set(response.message || 'Failed to get response');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('Failed to connect. Please try again.');
      }
    });
  }

  loadConversations(): void {
    this.chatService.getConversations().subscribe({
      next: (response) => {
        if (response.success) {
          this.conversations.set(response.conversations);
        }
      }
    });
  }

  selectConversation(conv: ConversationSummary): void {
    this.activeConversationId.set(conv.id);
    this.isLoading.set(true);
    this.showHistory.set(false);

    this.chatService.getConversation(conv.id).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.messages.set(response.messages.map(m => ({
            role: m.role,
            content: m.content
          })));
          this.shouldScroll = true;
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('Failed to load conversation');
      }
    });
  }

  startNewConversation(): void {
    this.activeConversationId.set(null);
    this.messages.set([]);
    this.error.set('');
    this.showHistory.set(false);
  }

  deleteConversation(conv: ConversationSummary, event: Event): void {
    event.stopPropagation();
    this.chatService.deleteConversation(conv.id).subscribe({
      next: () => {
        if (this.activeConversationId() === conv.id) {
          this.startNewConversation();
        }
        this.loadConversations();
      }
    });
  }

  toggleHistory(): void {
    this.showHistory.update(v => !v);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    const el = this.messagesContainer?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
