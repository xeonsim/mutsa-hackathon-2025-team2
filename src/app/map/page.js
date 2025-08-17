// src/app/map/page.js
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getDefaultMarkers, searchPlace } from '@/api/mock';
import MapView from '@/components/map/MapView';

/**
 * @file 지도 페이지의 로직(데이터 수신, API 호출)을 담당합니다.
 * [담당자]는 이 파일의 로직을 기반으로 MapView 컴포넌트를 구현합니다.
 */
function MapPageContent() {
  const searchParams = useSearchParams();
  const [markers, setMarkers] = useState([]);

  /**
   * 검색창의 입력값을 처리하는 함수
   * @param {string} query - 사용자가 입력한 검색어
   */
  const handleSearch = async (query) => {
    if (!query.trim()) return;
    try {
      const place = await searchPlace(query);
      // 기존 마커 목록에 새로운 검색 결과 추가
      setMarkers(prevMarkers => [...prevMarkers, place]);
    } catch (error) {
      console.error('장소 검색 실패:', error);
      alert('장소를 검색하는 데 실패했습니다.');
    }
  };


  useEffect(() => {
    const routeQuery = searchParams.get('route');
    if (routeQuery) {
      // URL에 route 데이터가 있으면, 파싱하여 마커로 설정
      try {
        const routeData = JSON.parse(decodeURIComponent(routeQuery));
        setMarkers(routeData);
      } catch (error) {
        console.error("경로 데이터 파싱 실패:", error);
        // 파싱 실패 시 기본 마커 로드
        getDefaultMarkers().then(setMarkers);
      }
    } else {
      // URL에 route 데이터가 없으면, 기본 마커 API 호출
      getDefaultMarkers().then(setMarkers);
    }
  }, [searchParams]);

  return (
    <MapView markers={markers} onSearch={handleSearch} />
  );
}

// Suspense를 사용하여 useSearchParams가 클라이언트에서 렌더링되도록 합니다.
export default function MapPage() {
    return (
        <Suspense fallback={<div>Loading map...</div>}>
            <MapPageContent />
        </Suspense>
    );
}
