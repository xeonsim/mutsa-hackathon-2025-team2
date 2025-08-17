// src/components/map/MapView.js
'use client';

import { useState } from 'react';

/**
 * @file 지도 UI를 담당하는 순수 UI 컴포넌트입니다.
 * [지도 담당자]는 이 파일에 TailwindCSS나 다른 라이브러리를 사용하여 디자인을 구현합니다.
 * page.js로부터 받은 마커 데이터를 사용하여 지도 위에 경로와 마커를 렌더링합니다.
 */
export default function MapView({ markers, onSearch }) {
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
    setQuery('');
  };
  return (
    <div className="h-screen flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">지도</h1>
      
      {/* 가이드라인: 장소 검색 UI 구현 */}
      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
        {/* TODO: 검색창과 버튼을 스타일링 해주세요. */}
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
          placeholder="장소를 검색해보세요..."
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">검색</button>
      </form>

      {/* 가이드라인: 지도 및 마커 UI 구현 */}
      <div className="flex-1 bg-gray-200 rounded-lg relative shadow-inner">
        {/* 
          TODO: 지도 UI를 구현해주세요.
          - 실제 지도 라이브러리(Naver, Kakao, Google Maps)를 사용하거나, 
          - 혹은 이 div를 지도로 가정하고 그 위에 마커를 절대 위치로 표시할 수 있습니다.
          - 아래는 후자의 간단한 예시입니다.
        */}

        {/* TODO: markers 배열을 순회하며 마커와 경로를 그려주세요. */}
        {markers.map((marker, index) => (
          <div 
            key={marker.id}
            // lat, lng를 화면 좌표로 변환하는 로직이 필요합니다.
            // 아래는 임시 스타일입니다.
            style={{ 
              position: 'absolute', 
              top: `${(marker.lat - 37.5) * 1000}%`, // 예시 좌표 변환
              left: `${(marker.lng - 126.9) * 500}%`, // 예시 좌표 변환
              transform: 'translate(-50%, -50%)'
            }}
            className="p-2 bg-red-500 text-white rounded-full shadow-lg"
          >
            {marker.name}
          </div>
        ))}

        {/* TODO: 마커들을 잇는 경로(선)를 SVG나 다른 방식으로 그려주세요. */}
      </div>
      <div className="mt-4 p-4 bg-white rounded-lg shadow">
        <h2 className="font-bold">추천 경로</h2>
        {/* TODO: 마커(경로) 목록을 텍스트로 표시해주세요. */}
        <ul className="list-disc pl-5">
            {markers.map(m => <li key={m.id}>{m.name}</li>)}
        </ul>
      </div>
    </div>
  );
}
