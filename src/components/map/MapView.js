'use client';

import { useEffect, useRef, useState } from 'react';

export default function MapView({ markers = [], onSearch }) {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [polyline, setPolyline] = useState(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [state, setState] = useState({
    center: {
      lat: 33.450701,
      lng: 126.570667,
    },
    errMsg: null,
    isLoading: true,
  });

  // 카카오 지도 API 동적 로딩 및 초기화
  useEffect(() => {
    let isMounted = true; // 컴포넌트 언마운트 체크

    const loadKakaoMapAPI = async () => {
      try {
        // 이미 로드되어 있는지 확인
        if (window.kakao && window.kakao.maps && window.kakao.maps.Map) {
          console.log('✅ 카카오 지도 API 이미 로드됨');

          // kakao.maps.load()로 안전하게 초기화
          if (typeof window.kakao.maps.load === 'function') {
            window.kakao.maps.load(() => {
              if (isMounted) {
                console.log('✅ 기존 API로 초기화 완료');
                setApiLoaded(true);
                initializeMap();
              }
            });
          } else {
            if (isMounted) {
              setApiLoaded(true);
              initializeMap();
            }
          }
          return;
        }

        console.log('🔄 카카오 지도 API 동적 로딩 시작...');

        const API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

        if (!API_KEY) {
          throw new Error(
            'NEXT_PUBLIC_KAKAO_MAP_KEY 환경변수가 설정되지 않았습니다.'
          );
        }

        console.log('🔑 API 키 확인:', API_KEY.substring(0, 8) + '...');

        // 기존 카카오 스크립트 제거 (중복 방지)
        const existingScripts = document.querySelectorAll(
          'script[src*="dapi.kakao.com"]'
        );
        existingScripts.forEach((script) => script.remove());

        // 새 스크립트 엘리먼트 생성
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${API_KEY}&autoload=false`;
        script.async = true;

        // 로드 성공 처리
        script.onload = () => {
          console.log('✅ 카카오 스크립트 로드 완료');

          if (!isMounted) return;

          if (window.kakao && window.kakao.maps) {
            console.log('🔧 kakao.maps.load() 호출');

            window.kakao.maps.load(() => {
              if (isMounted) {
                console.log('✅ kakao.maps.load() 완료');
                setApiLoaded(true);
                initializeMap();
              }
            });
          } else {
            throw new Error('카카오 객체를 찾을 수 없습니다.');
          }
        };

        // 로드 실패 처리
        script.onerror = (event) => {
          console.error('❌ 카카오 스크립트 로드 실패');

          if (!isMounted) return;

          // 상세한 에러 분석
          let errorMessage = '카카오 지도 API 로드에 실패했습니다. ';

          if (!navigator.onLine) {
            errorMessage += '인터넷 연결을 확인해주세요.';
          } else {
            errorMessage += '카카오 개발자 콘솔 설정을 확인해주세요.';
          }

          setError(errorMessage);
          setIsLoading(false);
        };

        // DOM에 스크립트 추가
        document.head.appendChild(script);

        // 타임아웃 설정 (15초)
        setTimeout(() => {
          if (isMounted && (!window.kakao || !window.kakao.maps)) {
            setError(
              'API 로드 시간이 초과되었습니다. 새로고침 후 다시 시도해주세요.'
            );
            setIsLoading(false);
          }
        }, 15000);
      } catch (error) {
        console.error('❌ API 로딩 중 예외 발생:', error);
        if (isMounted) {
          setError(error.message);
          setIsLoading(false);
        }
      }
    };

    // 지도 초기화 함수
    const initializeMap = () => {
      if (!mapContainer.current) {
        setError('지도 컨테이너를 찾을 수 없습니다.');
        setIsLoading(false);
        return;
      }

      try {
        console.log('🗺️ 지도 인스턴스 생성 시작');
        // 기본 좌표: 서울
        const defaultCenter = new window.kakao.maps.LatLng(37.5665, 126.978);

        const mapInstance = new window.kakao.maps.Map(mapContainer.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 5,
        });

        console.log('✅ 지도 생성 성공!');

        setMap(mapInstance);
        setError(null);
        setIsLoading(false);
        // 사용자 위치 가져오기
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLatLng = new window.kakao.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
              );
              mapInstance.setCenter(userLatLng); // 지도 중심 이동

              // 내 위치 마커 생성
              const userMarker = new window.kakao.maps.Marker({
                position: userLatLng,
                map: mapInstance,
                title: '현재 위치',
              });

              // 옵션: 아이콘 변경
              const markerImage = new window.kakao.maps.MarkerImage(
                'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                new window.kakao.maps.Size(24, 35),
                { offset: new window.kakao.maps.Point(12, 35) }
              );
              userMarker.setImage(markerImage);

              setState((prev) => ({
                ...prev,
                center: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                },
                isLoading: false,
              }));
            },
            (err) => {
              console.warn('사용자 위치를 가져오지 못했습니다:', err.message);
              setState((prev) => ({
                ...prev,
                errMsg: err.message,
                isLoading: false,
              }));
            }
          );
        } else {
          setState((prev) => ({
            ...prev,
            errMsg: 'geolocation을 사용할 수 없습니다.',
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('❌ 지도 초기화 실패:', error);
        setError(`지도 초기화에 실패했습니다: ${error.message}`);
        setIsLoading(false);
      }
    };

    loadKakaoMapAPI();

    // 컴포넌트 언마운트 시 정리
    return () => {
      isMounted = false;
    };
  }, []);

  // 검색 폼 제출 처리
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  // 마커 및 경로 업데이트
  useEffect(() => {
    if (!map || !window.kakao || !window.kakao.maps || !apiLoaded) return;

    try {
      console.log('🔄 마커 업데이트 시작, 마커 수:', markers.length);

      // 기존 마커 제거
      mapMarkers.forEach((marker) => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
        if (marker.customOverlay) {
          marker.customOverlay.setMap(null);
        }
        if (marker.infoWindow) {
          marker.infoWindow.close();
        }
      });

      // 기존 경로선 제거
      if (polyline) {
        polyline.setMap(null);
      }

      if (!markers || markers.length === 0) {
        setMapMarkers([]);
        setPolyline(null);
        return;
      }

      const newMarkers = [];
      const pathCoords = [];

      // 새 마커 생성
      markers.forEach((markerData, index) => {
        if (
          markerData &&
          typeof markerData.lat === 'number' &&
          typeof markerData.lng === 'number'
        ) {
          try {
            console.log(
              `📍 마커 ${index + 1} 생성:`,
              markerData.name,
              markerData.lat,
              markerData.lng
            );

            const position = new window.kakao.maps.LatLng(
              markerData.lat,
              markerData.lng
            );

            // 기본 마커 생성
            const marker = new window.kakao.maps.Marker({
              position: position,
              map: map,
            });

            // 마커 번호 표시를 위한 커스텀 오버레이
            const content = `
              <div style="
                background: #ff5722; 
                color: white; 
                border-radius: 50%; 
                width: 30px; 
                height: 30px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-weight: bold;
                font-size: 12px;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                z-index: 10;
              ">
                ${index + 1}
              </div>
            `;

            const customOverlay = new window.kakao.maps.CustomOverlay({
              position: position,
              content: content,
              yAnchor: 1.2,
            });

            customOverlay.setMap(map);

            // 정보창 추가
            const infoWindow = new window.kakao.maps.InfoWindow({
              content: `
                <div style="padding: 10px; min-width: 150px; text-align: center;">
                  <strong>${index + 1}. ${markerData.name || '장소'}</strong>
                  ${
                    markerData.address
                      ? `<br><small style="color: #666;">${markerData.address}</small>`
                      : ''
                  }
                </div>
              `,
            });

            // 마커 클릭 이벤트
            window.kakao.maps.event.addListener(marker, 'click', () => {
              // 다른 정보창들 닫기
              mapMarkers.forEach((m) => {
                if (m.infoWindow) {
                  m.infoWindow.close();
                }
              });
              infoWindow.open(map, marker);
            });

            // 마커 객체에 참조 저장
            marker.infoWindow = infoWindow;
            marker.customOverlay = customOverlay;

            newMarkers.push(marker);
            pathCoords.push(position);
          } catch (err) {
            console.warn(`마커 ${index + 1} 생성 실패:`, err);
          }
        } else {
          console.warn(`마커 ${index + 1} 데이터 오류:`, markerData);
        }
      });

      console.log('✅ 마커 생성 완료:', newMarkers.length);
      setMapMarkers(newMarkers);

      // 경로선 그리기
      if (pathCoords.length > 1) {
        try {
          const newPolyline = new window.kakao.maps.Polyline({
            path: pathCoords,
            strokeWeight: 4,
            strokeColor: '#FF5722',
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
          });

          newPolyline.setMap(map);
          setPolyline(newPolyline);
          console.log('✅ 경로선 생성 완료');
        } catch (err) {
          console.warn('경로선 생성 실패:', err);
        }
      }

      // 지도 범위 조정
      if (pathCoords.length > 0) {
        try {
          const bounds = new window.kakao.maps.LatLngBounds();
          pathCoords.forEach((coord) => {
            bounds.extend(coord);
          });

          map.setBounds(bounds, 50);
          console.log('✅ 지도 범위 조정 완료');
        } catch (err) {
          console.warn('지도 범위 조정 실패:', err);
        }
      }
    } catch (err) {
      console.warn('마커 업데이트 실패:', err);
    }
  }, [map, markers, apiLoaded]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 마커 정리
      if (mapMarkers.length > 0) {
        mapMarkers.forEach((marker) => {
          if (marker.setMap) marker.setMap(null);
          if (marker.customOverlay) marker.customOverlay.setMap(null);
          if (marker.infoWindow) marker.infoWindow.close();
        });
      }

      // 경로선 정리
      if (polyline) {
        polyline.setMap(null);
      }
    };
  }, [mapMarkers, polyline]);

  // 에러 화면
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-6">🗺️</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            지도 로딩 실패
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">
              문제 해결 방법:
            </h3>
            <ul className="text-sm text-blue-700 text-left space-y-1">
              <li>
                • 카카오 개발자 콘솔에서 <strong>카카오맵 서비스 활성화</strong>
              </li>
              <li>
                • 웹 플랫폼에 <code>http://localhost:3000</code> 도메인 등록
              </li>
              <li>
                • <strong>JavaScript 키</strong> 사용 확인 (REST API 키 아님)
              </li>
              <li>• 새로운 앱 생성 후 테스트</li>
            </ul>
          </div>

          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              새로고침
            </button>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                setApiLoaded(false);
                // 강제 재시도
                window.location.reload();
              }}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              강제 재시도
            </button>
          </div>

          {/* 디버깅 정보 */}
          <div className="mt-6 text-xs text-gray-400">
            <details>
              <summary className="cursor-pointer">디버깅 정보</summary>
              <div className="mt-2 text-left">
                <p>
                  API KEY:{' '}
                  {process.env.NEXT_PUBLIC_KAKAO_MAP_KEY?.substring(0, 8)}...
                </p>
                <p>window.kakao: {String(!!window.kakao)}</p>
                <p>navigator.onLine: {String(navigator.onLine)}</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b p-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          🗺️ 여행 경로 지도
        </h1>

        {/* 검색 폼 */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-2xl mx-auto flex gap-3"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="어디로 떠나볼까요? (예: 경복궁, 명동, 홍대)"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                검색
              </div>
            ) : (
              '🔍 검색'
            )}
          </button>
        </form>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 p-4 space-y-4">
        {/* 지도 */}
        <div className="flex-1 relative bg-white rounded-xl shadow-lg overflow-hidden min-h-96">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">
                  {apiLoaded
                    ? '지도를 초기화하는 중...'
                    : '카카오 지도 API 로딩 중...'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  잠시만 기다려주세요
                </p>
              </div>
            </div>
          )}
          <div ref={mapContainer} className="w-full h-full min-h-96" />

          {/* 지도 컨트롤 정보 */}
          {!isLoading && (
            <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-md">
              <p className="text-xs text-gray-600 mb-1">💡 지도 사용법</p>
              <p className="text-xs text-gray-500">• 드래그: 지도 이동</p>
              <p className="text-xs text-gray-500">• 휠: 확대/축소</p>
              <p className="text-xs text-gray-500">• 마커 클릭: 상세 정보</p>
            </div>
          )}
        </div>

        {/* 경로 목록 */}
        {markers && markers.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                📍 추천 여행 경로
              </h2>
              <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {markers.length}개 장소
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-40 overflow-y-auto">
              {markers.map((marker, index) => (
                <div
                  key={marker.id || index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    // 해당 마커로 지도 이동
                    if (map && marker.lat && marker.lng && window.kakao) {
                      const position = new window.kakao.maps.LatLng(
                        marker.lat,
                        marker.lng
                      );
                      map.setCenter(position);
                      map.setLevel(3);

                      // 해당 마커의 정보창 열기
                      const targetMarker = mapMarkers[index];
                      if (targetMarker && targetMarker.infoWindow) {
                        targetMarker.infoWindow.open(map, targetMarker);
                      }
                    }
                  }}
                >
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {marker.name || '장소'}
                    </p>
                    {marker.address && (
                      <p className="text-xs text-gray-500 truncate">
                        {marker.address}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 flex items-center">
                <span className="w-4 h-1 bg-orange-500 rounded mr-2"></span>
                주황색 선을 따라 여행 경로가 표시됩니다
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}