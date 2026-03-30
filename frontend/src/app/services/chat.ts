import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ChatRequest,
  ChatResponse,
  ConversationListResponse,
  ConversationDetailResponse
} from '../models/chat';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:5102/api/chat';
  private http = inject(HttpClient);

  ask(message: string, conversationId?: string): Observable<ChatResponse> {
    const body: ChatRequest = { message, conversationId };
    return this.http.post<ChatResponse>(`${this.apiUrl}/ask`, body);
  }

  getConversations(): Observable<ConversationListResponse> {
    return this.http.get<ConversationListResponse>(`${this.apiUrl}/conversations`);
  }

  getConversation(id: string): Observable<ConversationDetailResponse> {
    return this.http.get<ConversationDetailResponse>(`${this.apiUrl}/conversations/${id}`);
  }

  deleteConversation(id: string): Observable<ChatResponse> {
    return this.http.delete<ChatResponse>(`${this.apiUrl}/conversations/${id}`);
  }
}
