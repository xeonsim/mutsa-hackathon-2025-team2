// src/components/chat/ChatView.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import RoutePanel from './RoutePanel';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// SVG Icons for UI elements
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;


// --- New component for the initial empty chat screen ---
const InitialScreen = ({ onPromptClick }) => {
  const prompts = [
    { title: '부산 2박 3일 여행', description: '가족과 함께할 코스로 계획 짜줘' },
    { title: '서울 실내 데이트', description: '비 오는 날 즐길만한 곳 추천해줘' },
    { title: '제주도 동쪽 맛집', description: '현지인들이 자주 가는 곳 위주로 알려줘' },
    { title: '혼자 강릉 여행', description: '조용히 힐링할 수 있는 장소 포함해줘' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-600 animate-fade-in-up">
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-slate-800 mb-2">✈️ AI 여행 플래너</h1>
        <p className="text-2xl text-slate-500">무엇을 도와드릴까요?</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl px-4">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptClick(`${prompt.title} ${prompt.description}`)}
            className="p-4 bg-white/60 border border-slate-200 rounded-xl hover:bg-slate-100/80 hover:border-slate-300 transition-all duration-200 text-left shadow-sm"
          >
            <p className="font-semibold text-slate-700">{prompt.title}</p>
            <p className="text-sm text-slate-500">{prompt.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};


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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar visibility
  const messagesEndRef = useRef(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
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

  const handlePromptClick = (prompt) => {
    if (!activeConversation) return;
    onSendMessage(prompt);
  };

  return (
    <div className="h-full flex bg-slate-50 text-slate-800">
      {/* Sidebar for conversations */}
      <aside className={`transition-all duration-300 ease-in-out bg-white/80 backdrop-blur-sm border-r border-slate-200 flex flex-col ${isSidebarOpen ? 'w-72' : 'w-0'}`}>
        <div className="w-72 overflow-hidden h-full flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center">
            <button
              onClick={onNewChat}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <PlusIcon />
              새 채팅 시작
            </button>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="ml-2 p-1.5 text-slate-500 hover:bg-slate-200 rounded-md transition-colors"
              aria-label="Close sidebar"
            >
              <ChevronLeftIcon />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto">
            <ul className="p-2 space-y-1">
              {conversations.map((chat) => (
                <li key={chat.id} className={`group rounded-lg transition-colors duration-150 ${activeConversation?.id === chat.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-100'}`}>
                  <div className="p-2 flex items-center justify-between">
                    {editingChatId === chat.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename(chat.id)}
                        onBlur={() => handleRename(chat.id)}
                        className="flex-grow p-1 bg-transparent border-b-2 border-blue-400 focus:outline-none mr-2"
                        autoFocus
                      />
                    ) : (
                      <button onClick={() => onSelectChat(chat.id)} className={`flex-grow text-left p-1 truncate font-medium ${activeConversation?.id === chat.id ? 'font-semibold' : ''}`}>
                        {chat.name}
                      </button>
                    )}
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {editingChatId === chat.id ? (
                        <button onClick={() => handleRename(chat.id)} className="p-1 text-slate-500 hover:text-green-600"><CheckIcon /></button>
                      ) : (
                        <button onClick={() => startEditing(chat)} className="p-1 text-slate-500 hover:text-blue-600"><EditIcon /></button>
                      )}
                      <button onClick={() => onDeleteChat(chat.id)} className="p-1 text-slate-500 hover:text-red-600"><DeleteIcon /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-2.5 left-4 z-10 p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all"
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>
        )}

        <div className="flex-1 flex bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden m-4">
          {/* Chat Section */}
          <div className="flex-1 flex flex-col">
            <h1 className="text-lg font-semibold text-slate-900 p-4 border-b border-slate-200 text-center bg-slate-50/50">
              {activeConversation?.name || '채팅을 시작해주세요'}
            </h1>
            
            <div className="flex-1 overflow-y-auto">
              {messages.length <= 1 ? (
                <InitialScreen onPromptClick={handlePromptClick} />
              ) : (
                <div className="p-6 space-y-4">
                  {messages.map((msg) => {
                    const isUser = msg.author === 'user';
                    return (
                      <div key={msg.id} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${isUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                          {/* Markdown rendering applied here */}
                          <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                          </div>
                          
                          {msg.route && (
                            <div className="mt-3 p-3 bg-sky-50 rounded-lg border border-sky-200">
                              <p className="text-sm text-sky-800 font-semibold mb-2">
                                🗺️ 추천 경로가 준비되었습니다! ({msg.route.length}개 장소)
                              </p>
                              <div className="text-xs text-sky-700 space-y-1">
                                {msg.route.slice(0, 3).map((place, index) => (
                                  <div key={place.id}>
                                    {index + 1}. {place.name}
                                  </div>
                                ))}
                                {msg.route.length > 3 && (
                                  <div className="font-medium">... 외 {msg.route.length - 3}개 장소</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {botTyping && (
                    <div className="flex items-end gap-2 justify-start">
                      <div className="max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm bg-slate-100 text-slate-800 rounded-bl-none">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 h-12 px-5 bg-slate-100 border border-transparent rounded-full placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white focus:border-blue-400 transition-all duration-200"
                  placeholder={activeConversation ? "메시지를 입력하세요..." : "새 채팅을 시작해주세요."}
                  aria-label="채팅 메시지 입력"
                  disabled={!activeConversation}
                />
                <button 
                  type="button" 
                  onClick={onRecommend} 
                  disabled={isLoading || !activeConversation || messages.length <= 1} 
                  className="h-12 px-5 rounded-full bg-teal-500 text-white font-semibold hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? '분석중...' : '경로 추천'}
                </button>
                <button 
                  type="submit" 
                  disabled={!input.trim() || !activeConversation} 
                  className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  aria-label="메시지 전송"
                >
                  <SendIcon />
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
