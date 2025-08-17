// src/components/chat/ChatView.js
'use client';

import { useState } from 'react';

/**
 * @file 채팅 UI를 담당하는 순수 UI 컴포넌트입니다.
 * [채팅 담당자]는 이 파일에 TailwindCSS를 사용하여 디자인을 구현합니다.
 * page.js로부터 받은 props를 사용하여 UI를 렌더링하고, 사용자 인터랙션을 처리하여 부모에게 알립니다.
 */
export default function ChatView({ messages, onSendMessage, onRecommend, isLoading }) {
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
      
      {/* 가이드라인: 메시지 목록 UI 구현 */}
      <div className="flex-1 overflow-y-auto bg-white p-4 rounded-lg shadow-inner">
        {/* TODO: messages 배열을 순회하며 메시지 버블(bot, user)을 스타일링하여 보여주세요. */}
        {messages.map(msg => (
          <div key={msg.id} className={`chat ${msg.author === 'user' ? 'chat-end' : 'chat-start'}`}>
             <div className="chat-bubble">
                <p>{msg.text}</p>
             </div>
          </div>
        ))}
        {isLoading && <p className="text-center text-gray-500">경로를 추천받고 있습니다...</p>}
      </div>

      {/* 가이드라인: 입력 폼 및 추천 버튼 UI 구현 */}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        {/* TODO: 입력창과 전송 버튼을 스타일링 해주세요. */}
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
          placeholder="메시지를 입력하세요..."
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">전송</button>
        
        {/* TODO: 추천 버튼을 스타일링 해주세요. isLoading 상태일 때 비활성화/다른 텍스트 표시 처리를 해주세요. */}
        <button 
          type="button"
          onClick={onRecommend}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-green-300"
        >
          {isLoading ? '분석중...' : '경로 추천'}
        </button>
      </form>
    </div>
  );
}
