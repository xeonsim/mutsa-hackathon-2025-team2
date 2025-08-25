// src/components/chat/ChatView.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import RoutePanel from './RoutePanel';

// Simple icons for UI elements
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;

export default function ChatView({ 
  conversations,
  activeConversation,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  messages, 
  onSendMessage, 
  onRecommend, 
  isLoading, 
  botTyping,
  currentRoute,
  onRouteUpdate
}) {
  const [input, setInput] = useState('');
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const messagesEndRef = useRef(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, botTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConversation) return;
    onSendMessage(input);
    setInput('');
  };

  const handleRename = (chatId) => {
    onRenameChat(chatId, editingName);
    setEditingChatId(null);
    setEditingName('');
  };

  const startEditing = (chat) => {
    setEditingChatId(chat.id);
    setEditingName(chat.name);
  };

  const handleViewMap = () => {
    if (!currentRoute || currentRoute.length === 0) {
      alert('표시할 경로가 없습니다.');
      return;
    }

    try {
      // Save the current route to localStorage for the map page
      localStorage.setItem('currentTravelRoute', JSON.stringify(currentRoute));
      router.push('/map');
    } catch (error) {
      console.error('Failed to save route or navigate:', error);
      alert('지도 페이지로 이동하는 데 실패했습니다.');
    }
  };

  const handleRouteReorder = (newRoute) => {
    onRouteUpdate(newRoute);
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar for conversations */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <button
            onClick={onNewChat}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            + 새 채팅 시작
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul>
            {conversations.map((chat) => (
              <li key={chat.id} className={`border-b ${activeConversation?.id === chat.id ? 'bg-blue-50' : ''}`}>
                <div className="p-2 flex items-center justify-between">
                  {editingChatId === chat.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRename(chat.id)}
                      onBlur={() => handleRename(chat.id)}
                      className="flex-grow p-1 border rounded mr-2"
                      autoFocus
                    />
                  ) : (
                    <button onClick={() => onSelectChat(chat.id)} className="flex-grow text-left p-1 truncate">
                      {chat.name}
                    </button>
                  )}
                  <div className="flex items-center">
                    {editingChatId === chat.id ? (
                      <button onClick={() => handleRename(chat.id)} className="p-1 text-gray-600 hover:text-green-600"><CheckIcon /></button>
                    ) : (
                      <button onClick={() => startEditing(chat)} className="p-1 text-gray-600 hover:text-blue-600"><EditIcon /></button>
                    )}
                    <button onClick={() => onDeleteChat(chat.id)} className="p-1 text-gray-600 hover:text-red-600"><DeleteIcon /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex bg-white rounded-lg shadow-md overflow-hidden m-4">
          {/* Chat Section */}
          <div className="flex-1 flex flex-col">
            <h1 className="text-xl font-bold p-4 border-b text-center bg-gray-50">
              {activeConversation?.name || '채팅'}
            </h1>
            
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((msg) => {
                const isUser = msg.author === 'user';
                return (
                  <div key={msg.id} className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${isUser ? 'bg-black text-white' : 'bg-gray-200 text-gray-900'}`}>
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      {msg.route && (
                        <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800 font-medium mb-2">
                            🗺️ 추천 경로가 준비되었습니다! ({msg.route.length}개 장소)
                          </p>
                          <div className="text-xs text-blue-600 space-y-1">
                            {msg.route.slice(0, 3).map((place, index) => (
                              <div key={place.id}>
                                {index + 1}. {place.name}
                              </div>
                            ))}
                            {msg.route.length > 3 && (
                              <div>... 외 {msg.route.length - 3}개 장소</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {botTyping && (
                <div className="mb-3 flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-4 py-2 shadow-sm bg-gray-200 text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">봇이 입력 중...</span>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-gray-50">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 h-11 px-4 border border-gray-300 rounded-full bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder={activeConversation ? "메시지를 입력하세요..." : "새 채팅을 시작해주세요."}
                  aria-label="채팅 메시지 입력"
                  disabled={!activeConversation}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || !activeConversation} 
                  className="h-11 px-5 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  전송
                </button>
                <button 
                  type="button" 
                  onClick={onRecommend} 
                  disabled={isLoading || !activeConversation || messages.length <= 1} 
                  className="h-11 px-5 rounded-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                >
                  {isLoading ? '분석중...' : '경로 추천'}
                </button>
              </form>
            </div>
          </div>

          {/* Route Panel */}
          <RoutePanel
            route={currentRoute}
            onRouteReorder={handleRouteReorder}
            onRouteUpdate={onRouteUpdate}
            onViewMap={handleViewMap}
          />
        </div>
      </main>
    </div>
  );
}
