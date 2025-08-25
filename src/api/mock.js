// src/api/mock.js

/**
 * @file Mock API 함수를 정의합니다.
 * 실제 API가 구현되면 이 파일의 함수들을 실제 API 호출로 대체하면 됩니다.
 */

/**
 * 채팅 페이지에 처음 진입했을 때 보여줄 초기 메시지를 반환합니다.
 * @returns {Promise<Array<object>>} 초기 메시지 객체 배열
 */
export const getInitialMessages = async () => {
  console.log("API: getInitialMessages 호출됨");
  return new Promise(resolve => setTimeout(() => resolve([
    { id: 1, author: 'bot', text: '안녕하세요! 여행 계획을 도와드릴까요? 가고 싶은 곳이나 하고 싶은 활동을 말씀해주세요.' }
  ]), 500));
};

/**
 * 사용자와의 대화 내용을 바탕으로 여행 경로를 추천합니다.
 * 현재는 미리 정의된 경로를 반환합니다.
 * @param {Array<object>} messages - 현재까지의 대화 내용
 * @returns {Promise<Array<object>>} 추천 경로 데이터 배열
 */
export const getRecommendedRoute = async (messages) => {
  console.log("API: getRecommendedRoute 호출됨", messages);
  // TODO: 실제로는 messages 내용을 기반으로 경로를 생성해야 합니다.
  // 현재는 목업 데이터로 고정된 경로를 반환합니다.
  const route = [
    { id: 'a', name: '경복궁', lat: 37.5796, lng: 126.9770 },
    { id: 'b', name: 'N서울타워', lat: 37.5512, lng: 126.9882 },
    { id: 'c', name: '동대문디자인플라자', lat: 37.5663, lng: 127.0077 }
  ];
  return new Promise(resolve => setTimeout(() => resolve(route), 1000));
};

/**
 * 지도에 표시할 기본 마커 목록을 반환합니다.
 * (추천 경로가 없을 때 사용)
 * @returns {Promise<Array<object>>} 기본 마커 데이터 배열
 */
/**
 * 장소를 검색하는 API를 시뮬레이션합니다.
 * @param {string} query - 검색어
 * @returns {Promise<object>} 검색된 장소 객체
 */
export const searchPlace = async (query) => {
  console.log(`API: searchPlace 호출됨 (검색어: ${query})`);
  // 실제 검색 로직 대신, 항상 같은 장소를 반환합니다.
  const place = { id: 'search-result', name: `'${query}'(으)로 검색된 장소`, lat: 37.5665, lng: 126.9780 }; // 서울 시청
  return new Promise(resolve => setTimeout(() => resolve(place), 500));
};

export const getDefaultMarkers = async () => {
    console.log("API: getDefaultMarkers 호출됨");
    const markers = [
        { id: 'd', name: '광화문', lat: 37.5759, lng: 126.9768 },
        { id: 'e', name: '코엑스', lat: 37.5127, lng: 127.0589 },
    ];
    return new Promise(resolve => setTimeout(() => resolve(markers), 500));
};

/**
 * 사용자 메시지에 대한 봇 응답을 생성합니다.
 * @param {string} userMessage - 사용자가 입력한 메시지
 * @param {Array<object>} conversationHistory - 현재까지의 대화 기록
 * @returns {Promise<string>} 봇의 응답 메시지
 */
export const getBotResponse = async (userMessage, conversationHistory = []) => {
  console.log("API: getBotResponse 호출됨", { userMessage, conversationHistory });
  
  // 간단한 키워드 기반 응답 로직
  const lowerMessage = userMessage.toLowerCase();
  
  // 여행 관련 키워드들
  if (lowerMessage.includes('서울') || lowerMessage.includes('경복궁') || lowerMessage.includes('궁궐')) {
    return new Promise(resolve => setTimeout(() => resolve(
      '서울의 경복궁은 정말 멋진 곳이에요! 조선왕조의 정궁으로, 아름다운 전통 건축물을 볼 수 있어요. 근처에 창덕궁과 창경궁도 있어서 함께 둘러보시는 것을 추천드려요.'
    ), 800));
  }
  
  if (lowerMessage.includes('부산') || lowerMessage.includes('해운대') || lowerMessage.includes('바다')) {
    return new Promise(resolve => setTimeout(() => resolve(
      '부산의 해운대 해수욕장은 한국에서 가장 유명한 해변 중 하나예요! 맛있는 해산물도 즐기실 수 있고, 부산타워에서 아름다운 야경도 감상하실 수 있어요.'
    ), 800));
  }
  
  if (lowerMessage.includes('제주') || lowerMessage.includes('제주도')) {
    return new Promise(resolve => setTimeout(() => resolve(
      '제주도는 정말 아름다운 곳이에요! 한라산, 성산일출봉, 만장굴 등 자연 경관이 풍부하고, 흑돼지와 해산물도 유명해요. 렌터카로 둘러보시는 것을 추천드려요.'
    ), 800));
  }
  
  if (lowerMessage.includes('맛집') || lowerMessage.includes('음식') || lowerMessage.includes('먹을')) {
    return new Promise(resolve => setTimeout(() => resolve(
      '한국의 음식은 정말 다양하고 맛있어요! 김치, 불고기, 비빔밥, 삼겹살 등이 유명해요. 지역별로 특색있는 음식들이 많으니, 가시는 곳의 현지 맛집을 찾아보시는 것을 추천드려요.'
    ), 800));
  }
  
  if (lowerMessage.includes('쇼핑') || lowerMessage.includes('상점') || lowerMessage.includes('물건')) {
    return new Promise(resolve => setTimeout(() => resolve(
      '한국의 쇼핑은 정말 재미있어요! 명동, 홍대, 강남 등 지역별로 특색있는 쇼핑 거리가 있어요. 화장품, 패션, 전자제품 등 다양한 상품을 구매하실 수 있어요.'
    ), 800));
  }
  
  if (lowerMessage.includes('교통') || lowerMessage.includes('이동') || lowerMessage.includes('버스') || lowerMessage.includes('지하철')) {
    return new Promise(resolve => setTimeout(() => resolve(
      '한국의 대중교통은 매우 편리해요! 지하철, 버스, 택시 등이 잘 발달되어 있어요. T-money 카드를 사용하시면 더욱 편리하게 이용하실 수 있어요.'
    ), 800));
  }
  
  // 기본 응답
  const defaultResponses = [
    '흥미로운 질문이네요! 더 구체적으로 말씀해주시면 더 자세한 정보를 제공해드릴 수 있어요.',
    '좋은 질문이에요! 여행 계획을 세우실 때 도움이 될 만한 정보를 더 알려드릴까요?',
    '그 부분에 대해 더 자세히 알고 싶으시군요! 어떤 특정 지역이나 활동에 관심이 있으신가요?',
    '멋진 계획이네요! 여행 준비에 도움이 될 만한 팁을 더 알려드릴 수 있어요.'
  ];
  
  const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  return new Promise(resolve => setTimeout(() => resolve(randomResponse), 800));
};