
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
}
