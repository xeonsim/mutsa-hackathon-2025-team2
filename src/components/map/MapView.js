// src/components/map/MapView.js
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Simple icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

// Search result component
function SearchResult({ result, onAdd, isAdded }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 truncate">{result.place_name}</p>
        <p className="text-sm text-gray-500 truncate">{result.road_address_name || result.address_name}</p>
        {result.category_name && <p className="text-xs text-gray-400 truncate">{result.category_name}</p>}
      </div>
      <button
        onClick={() => onAdd(result)}
        disabled={isAdded}
        className={`ml-3 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
          isAdded 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isAdded ? '추가됨' : <><PlusIcon /><span className="ml-1">추가</span></>}
      </button>
    </div>
  );
}

// A separate component for the sortable item
function SortablePlaceItem({ marker, index, map, mapMarkers, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: marker.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    if (map && marker.lat && marker.lng && window.kakao) {
      const position = new window.kakao.maps.LatLng(marker.lat, marker.lng);
      map.setCenter(position);
      map.setLevel(3);

      const targetMarker = mapMarkers[index];
      if (targetMarker && targetMarker.infoWindow) {
        mapMarkers.forEach(m => m.infoWindow?.close());
        targetMarker.infoWindow.open(map, targetMarker);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing flex items-center flex-1"
        onClick={handleClick}
      >
        <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center mr-3">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">{marker.name || '장소'}</p>
          {marker.address && <p className="text-xs text-gray-500 truncate">{marker.address}</p>}
        </div>
      </div>
      <button
        onClick={() => onRemove(marker.id)}
        className="ml-2 p-1 text-gray-500 hover:text-red-600 transition-colors"
        title="장소 제거"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

export default function MapView({ markers = [], setMarkers }) {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [polyline, setPolyline] = useState(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [apiLoaded, setApiLoaded] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // DnD drag end handler
  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      setMarkers((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  // Kakao Map API Loading and Initialization
  useEffect(() => {
    let isMounted = true;

    const loadKakaoMapAPI = async () => {
      try {
        if (window.kakao && window.kakao.maps && window.kakao.maps.Map) {
          if (typeof window.kakao.maps.load === 'function') {
            window.kakao.maps.load(() => {
              if (isMounted) {
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

        const API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
        if (!API_KEY) throw new Error('NEXT_PUBLIC_KAKAO_MAP_KEY is not set.');

        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${API_KEY}&autoload=false&libraries=services`;
        script.async = true;
        script.onload = () => {
          if (isMounted && window.kakao && window.kakao.maps) {
            window.kakao.maps.load(() => {
              if (isMounted) {
                setApiLoaded(true);
                initializeMap();
              }
            });
          } else if (isMounted) {
            throw new Error('Failed to load Kakao Maps SDK.');
          }
        };
        script.onerror = () => {
          if (isMounted) setError('Failed to load Kakao Maps script.');
        };
        document.head.appendChild(script);
      } catch (err) {
        if (isMounted) setError(err.message);
      }
    };

    const initializeMap = () => {
      if (!mapContainer.current) return;
      try {
        const mapInstance = new window.kakao.maps.Map(mapContainer.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 5,
        });
        setMap(mapInstance);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to initialize map.');
        setIsLoading(false);
      }
    };

    loadKakaoMapAPI();

    return () => { isMounted = false; };
  }, []);

  // Load route from localStorage on mount
  useEffect(() => {
    try {
      const savedRoute = localStorage.getItem('currentTravelRoute');
      if (savedRoute) {
        const routeData = JSON.parse(savedRoute);
        setMarkers(routeData);
      }
    } catch (error) {
      console.error('Failed to load route from localStorage:', error);
    }
  }, [setMarkers]);

  // Save route to localStorage when markers change
  useEffect(() => {
    if (markers && markers.length > 0) {
      try {
        localStorage.setItem('currentTravelRoute', JSON.stringify(markers));
      } catch (error) {
        console.error('Failed to save route to localStorage:', error);
      }
    }
  }, [markers]);

  // Marker and Polyline update logic
  useEffect(() => {
    if (!map || !window.kakao || !apiLoaded) return;

    // Clear existing overlays
    mapMarkers.forEach((marker) => {
      marker.setMap(null);
      if (marker.customOverlay) marker.customOverlay.setMap(null);
    });
    if (polyline) polyline.setMap(null);

    if (!markers || markers.length === 0) {
      setMapMarkers([]);
      setPolyline(null);
      return;
    }

    const newMapMarkers = [];
    const pathCoords = [];
    const bounds = new window.kakao.maps.LatLngBounds();

    markers.forEach((markerData, index) => {
      if (typeof markerData.lat !== 'number' || typeof markerData.lng !== 'number') return;

      const position = new window.kakao.maps.LatLng(markerData.lat, markerData.lng);
      pathCoords.push(position);
      bounds.extend(position);

      const mapMarker = new window.kakao.maps.Marker({ position, map });
      
      const content = `<div style="background: #ff5722; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${index + 1}</div>`;
      const customOverlay = new window.kakao.maps.CustomOverlay({ position, content, yAnchor: 1.2 });
      customOverlay.setMap(map);

      const infoWindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding: 10px; min-width: 150px; text-align: center;"><strong>${index + 1}. ${markerData.name || '장소'}</strong></div>`,
      });

      window.kakao.maps.event.addListener(mapMarker, 'click', () => {
        newMapMarkers.forEach(m => m.infoWindow?.close());
        infoWindow.open(map, mapMarker);
      });

      mapMarker.customOverlay = customOverlay;
      mapMarker.infoWindow = infoWindow;
      newMapMarkers.push(mapMarker);
    });

    setMapMarkers(newMapMarkers);

    if (pathCoords.length > 1) {
      const newPolyline = new window.kakao.maps.Polyline({
        path: pathCoords,
        strokeWeight: 4,
        strokeColor: '#FF5722',
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
      });
      newPolyline.setMap(map);
      setPolyline(newPolyline);
    }

    if (pathCoords.length > 0) {
      map.setBounds(bounds, 50, 50, 50, 50);
    }

  }, [map, markers, apiLoaded]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        throw new Error('카카오 지도 API가 로드되지 않았습니다.');
      }

      const ps = new window.kakao.maps.services.Places();
      
      await new Promise((resolve, reject) => {
        ps.keywordSearch(query, (data, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            setSearchResults(data.slice(0, 5));
            resolve();
          } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
            setSearchResults([]);
            resolve();
          } else {
            reject(new Error('검색 중 오류가 발생했습니다.'));
          }
        });
      });
    } catch (error) {
      console.error('Search error:', error);
      alert(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddPlace = (place) => {
    const newPlace = {
      id: place.id,
      name: place.place_name,
      lat: parseFloat(place.y),
      lng: parseFloat(place.x),
      address: place.road_address_name || place.address_name
    };

    if (markers.some(item => item.id === newPlace.id)) {
      alert('이미 추가된 장소입니다.');
      return;
    }

    setMarkers(prev => [...prev, newPlace]);
    setSearchResults([]);
    setQuery('');
  };

  const handleRemovePlace = (placeId) => {
    setMarkers(prev => prev.filter(item => item.id !== placeId));
  };

  const goToChat = () => {
    window.location.href = '/';
  };

  if (error) return <div className="h-screen flex items-center justify-center">Error: {error}</div>;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">🗺️ 여행 경로 지도</h1>
          <button
            onClick={goToChat}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <HomeIcon />
            <span className="ml-2">채팅으로 돌아가기</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Map Container */}
        <div className="lg:col-span-2 relative bg-white rounded-xl shadow-lg overflow-hidden min-h-[400px] lg:min-h-0">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">지도를 로딩 중...</p>
              </div>
            </div>
          )}
          <div ref={mapContainer} className="w-full h-full" />
        </div>

        {/* Route Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">📍 여행 경로</h2>
            {markers.length > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {markers.length}개 장소
              </span>
            )}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="장소 검색..."
              disabled={isLoading || isSearching}
            />
            <button 
              type="submit" 
              disabled={isLoading || isSearching || !query.trim()} 
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
            >
              <SearchIcon />
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">검색 결과</h3>
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <SearchResult
                    key={result.id}
                    result={result}
                    onAdd={handleAddPlace}
                    isAdded={markers.some(item => item.id === result.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            {markers && markers.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={markers.map(m => m.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-3">
                      {markers.map((marker, index) => (
                        <SortablePlaceItem 
                          key={marker.id} 
                          marker={marker} 
                          index={index} 
                          map={map} 
                          mapMarkers={mapMarkers}
                          onRemove={handleRemovePlace}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center text-gray-500">
                  <div>
                    <p className="text-sm mb-2">아직 경로가 없습니다.</p>
                    <p className="text-xs text-gray-400">
                      채팅에서 경로를 추천받거나<br />
                      위에서 장소를 검색해 추가하세요.
                    </p>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
