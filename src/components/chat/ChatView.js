// src/components/chat/ChatView.js
'use client';

import { useState } from 'react';

/**
 * @file 채팅 UI를 담당하는 순수 UI 컴포넌트입니다.
 * [채팅 담당자]는 이 파일에 TailwindCSS를 사용하여 디자인을 구현합니다.
 * page.js로부터 받은 props를 사용하여 UI를 렌더링하고, 사용자 인터랙션을 처리하여 부모에게 알립니다.
 */
export default function ChatView({ messages, onSendMessage, onRecommend, isLoading, botTyping }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="h-screen flex flex-col p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">채팅</h1>
      
      {/* 메시지 목록 UI */}
      <div className="flex-1 overflow-y-auto bg-white p-4 rounded-lg shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.author === 'user';
          return (
            <div
              key={msg.id}
              className={`mb-2 flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 border shadow-sm ${
                  isUser
                    ? 'bg-black text-white border-white'
                    : 'bg-white text-gray-900 border-black'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <p className="mt-2 text-center text-gray-500">경로를 추천받고 있습니다...</p>
        )}
        {botTyping && (
          <div className="mb-2 flex justify-start">
            <div className="max-w-[75%] rounded-2xl px-4 py-2 border shadow-sm bg-white text-gray-900 border-black">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">봇이 입력 중</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 입력 폼 및 추천 버튼 UI */}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 h-11 px-4 border border-gray-300 rounded-full bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          placeholder="메시지를 입력하세요..."
          aria-label="채팅 메시지 입력"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="h-11 px-5 rounded-full bg-blue-500 text-white border border-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="메시지 전송"
        >
          전송
        </button>

        <button
          type="button"
          onClick={onRecommend}
          disabled={isLoading}
          className="h-11 px-5 rounded-full bg-green-500 text-white border border-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="경로 추천 요청"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              분석중...
            </span>
          ) : (
            '경로 추천'
          )}
        </button>
      </form>
    </div>
  );
}