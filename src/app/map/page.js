// src/app/map/page.js
'use client';

import { useState, Suspense } from 'react';
import MapView from '@/components/map/MapView';

/**
 * @file 지도 페이지 - 여행 경로를 지도에서 확인하고 관리합니다.
 */
function MapPageContent() {
  const [markers, setMarkers] = useState([]);

  return (
    <MapView
      markers={markers}
      setMarkers={setMarkers}
    />
  );
}

// Suspense를 사용하여 클라이언트 사이드 렌더링을 보장합니다.
export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">지도를 로딩 중...</p>
        </div>
      </div>
    }>
      <MapPageContent />
    </Suspense>
  );
}
