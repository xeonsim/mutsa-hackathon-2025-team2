// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getInitialMessages, getRecommendedRoute, getBotResponse } from '@/api/mock';
import ChatView from '@/components/chat/ChatView';

/**
 * @file 초기 페이지(채팅)의 로직을 담당합니다.
 * [담당자]는 이 파일의 로직을 기반으로 ChatView 컴포넌트를 구현합니다.
 */
export default function HomePage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [botTyping, setBotTyping] = useState(false);

  // 페이지 로드 시 초기 메시지 로드
  useEffect(() => {
    getInitialMessages().then(initialMessages => {
      setMessages(initialMessages);
    });
  }, []);

  /**
   * 사용자가 메시지를 전송했을 때 호출되는 함수
   * @param {string} userInput - 사용자가 입력한 텍스트
   */
  const handleSendMessage = async (userInput) => {
    const newMessage = { id: Date.now(), author: 'user', text: userInput };
    setMessages(prev => [...prev, newMessage]);
    
    // 봇 응답 로직
    setBotTyping(true);
    try {
      const botResponse = await getBotResponse(userInput, messages);
      const botMessage = { id: Date.now() + 1, author: 'bot', text: botResponse };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('봇 응답 실패:', error);
      const errorMessage = { id: Date.now() + 1, author: 'bot', text: '죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setBotTyping(false);
    }
  };

  /**
   * '경로 추천' 버튼을 클릭했을 때 호출되는 함수
   */
  const handleRecommend = async () => {
    setIsLoading(true);
    try {
      const route = await getRecommendedRoute(messages);
      const routeQuery = encodeURIComponent(JSON.stringify(route));
      router.push(`/map?route=${routeQuery}`);
    } catch (error) {
      console.error('경로 추천 실패:', error);
      alert('경로를 추천하는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatView 
      messages={messages}
      onSendMessage={handleSendMessage}
      onRecommend={handleRecommend}
      isLoading={isLoading}
      botTyping={botTyping}
    />
  );
}