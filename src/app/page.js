// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatView from '@/components/chat/ChatView';

const initialBotMessage = { 
  id: 1, 
  author: 'bot', 
  text: '안녕하세요! 여행 계획을 도와드릴까요? 가고 싶은 곳이나 하고 싶은 활동을 말씀해주세요.' 
};

export default function HomePage() {
  const router = useRouter();
  const [conversations, setConversations] = useState({});
  const [activeChatId, setActiveChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [currentRoute, setCurrentRoute] = useState([]);

  // Load conversations from localStorage on initial render
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem('chatConversations');
      if (savedConversations) {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed);
        const chatIds = Object.keys(parsed);
        const latestChatId = chatIds[chatIds.length - 1] || null;
        setActiveChatId(latestChatId);
        
        // Load the route for the active conversation
        if (latestChatId && parsed[latestChatId]) {
          setCurrentRoute(parsed[latestChatId].route || []);
        }
      } else {
        handleNewChat();
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      handleNewChat();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(conversations).length > 0) {
      try {
        localStorage.setItem('chatConversations', JSON.stringify(conversations));
      } catch (error) {
        console.error("Failed to save to localStorage:", error);
      }
    }
  }, [conversations]);

  // Update route when active conversation changes
  useEffect(() => {
    if (activeChatId && conversations[activeChatId]) {
      setCurrentRoute(conversations[activeChatId].route || []);
    } else {
      setCurrentRoute([]);
    }
  }, [activeChatId, conversations]);

  const handleNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    const newConversation = {
      id: newChatId,
      name: `새로운 대화 ${Object.keys(conversations).length}`,
      messages: [initialBotMessage],
      route: [], // Initialize empty route
    };
    setConversations(prev => ({ ...prev, [newChatId]: newConversation }));
    setActiveChatId(newChatId);
    setCurrentRoute([]);
  };

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
  };

  const handleDeleteChat = (chatId) => {
    if (!confirm('정말로 이 대화를 삭제하시겠습니까?')) return;

    const newConversations = { ...conversations };
    delete newConversations[chatId];
    setConversations(newConversations);

    if (activeChatId === chatId) {
      const remainingIds = Object.keys(newConversations);
      if (remainingIds.length > 0) {
        setActiveChatId(remainingIds[remainingIds.length - 1]);
      } else {
        handleNewChat();
      }
    }
  };
  
  const handleRenameChat = (chatId, newName) => {
    if (!newName || !newName.trim()) return;
    setConversations(prev => ({
      ...prev,
      [chatId]: { ...prev[chatId], name: newName.trim() }
    }));
  };

  const addMessageToConversation = (message) => {
    if (!activeChatId) return;
    setConversations(prev => {
      const activeConvo = prev[activeChatId];
      if (!activeConvo) return prev;
      return {
        ...prev,
        [activeChatId]: {
          ...activeConvo,
          messages: [...activeConvo.messages, message]
        }
      };
    });
  };

  const handleSendMessage = async (userInput) => {
    if (!activeChatId) return;

    const newMessage = { id: Date.now(), author: 'user', text: userInput };
    addMessageToConversation(newMessage);

    setBotTyping(true);
    try {
      const currentMessages = conversations[activeChatId].messages;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...currentMessages, newMessage] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get bot response.');
      }

      const data = await response.json();
      const botMessage = { id: Date.now() + 1, author: 'bot', text: data.text };
      addMessageToConversation(botMessage);

    } catch (error) {
      console.error('봇 응답 실패:', error);
      const errorMessage = { id: Date.now() + 1, author: 'bot', text: `죄송합니다. 응답 생성 중 오류가 발생했습니다: ${error.message}` };
      addMessageToConversation(errorMessage);
    } finally {
      setBotTyping(false);
    }
  };

  const handleRecommend = async () => {
    if (!activeChatId) return;
    
    setIsLoading(true);
    try {
      const messages = conversations[activeChatId].messages;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, recommend: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '경로 추천에 실패했습니다.');
      }

      const route = await response.json();
      
      // Update the conversation with the new route
      setConversations(prev => ({
        ...prev,
        [activeChatId]: {
          ...prev[activeChatId],
          route: route
        }
      }));
      
      // Update current route state
      setCurrentRoute(route);

      const botMessage = {
        id: Date.now(),
        author: 'bot',
        text: '경로 추천이 준비되었어요! 오른쪽 패널에서 경로를 확인하고 순서를 변경하거나 장소를 추가할 수 있습니다.',
        route: route,
      };
      addMessageToConversation(botMessage);

    } catch (error) {
      console.error('경로 추천 실패:', error);
      alert(`경로를 추천하는 데 실패했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteUpdate = (newRoute) => {
    if (!activeChatId) return;
    
    setCurrentRoute(newRoute);
    setConversations(prev => ({
      ...prev,
      [activeChatId]: {
        ...prev[activeChatId],
        route: newRoute
      }
    }));
  };

  const activeConversation = conversations[activeChatId];

  return (
    <ChatView 
      conversations={Object.values(conversations).sort((a, b) => b.id.localeCompare(a.id))}
      activeConversation={activeConversation}
      onSelectChat={handleSelectChat}
      onNewChat={handleNewChat}
      onDeleteChat={handleDeleteChat}
      onRenameChat={handleRenameChat}
      messages={activeConversation?.messages || []}
      onSendMessage={handleSendMessage}
      onRecommend={handleRecommend}
      isLoading={isLoading}
      botTyping={botTyping}
      currentRoute={currentRoute}
      onRouteUpdate={handleRouteUpdate}
    />
  );
}
