// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getInitialMessages, getRecommendedRoute } from '@/api/mock';
import ChatView from '@/components/chat/ChatView';

/**
 * @file 초기 페이지(채팅)의 로직을 담당합니다.
 * [담당자]는 이 파일의 로직을 기반으로 ChatView 컴포넌트를 구현합니다.
 */
export default function HomePage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
  const handleSendMessage = (userInput) => {
    const newMessage = { id: Date.now(), author: 'user', text: userInput };
    setMessages(prev => [...prev, newMessage]);
    // TODO: 봇 응답 로직 추가
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
    />
  );
}