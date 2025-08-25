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
} from '@dnd-kit/sortable';
import SearchResult from './SearchResult';
import SortablePlaceItem from './SortablePlaceItem';  
import { loadKakaoMapAPI } from '@/services/kakaomap';

// --- Icons ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const EmptyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 3l6-3m0 0l6-3m-6 3v10" /></svg>;

// --- Main MapView Component ---

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
    const initializeMap = () => {
        if (!mapContainer.current) return;
        try {
            const mapInstance = new window.kakao.maps.Map(mapContainer.current, {
                center: new window.kakao.maps.LatLng(37.5665, 126.978),
                level: 5,
            });
            setMap(mapInstance);
            setApiLoaded(true);
        } catch (err) {
            setError('Failed to initialize map.');
        } finally {
            setIsLoading(false);
        }
    };
    loadKakaoMapAPI(isMounted,initializeMap,setError);
    return () => { isMounted = false; };
  }, []);

  // Load/Save route from/to localStorage
  useEffect(() => {
    try {
      const savedRoute = localStorage.getItem('currentTravelRoute');
      if (savedRoute) setMarkers(JSON.parse(savedRoute));
    } catch (e) { console.error('Failed to load route:', e); }
  }, [setMarkers]);

  useEffect(() => {
    if (markers?.length > 0) {
      try {
        localStorage.setItem('currentTravelRoute', JSON.stringify(markers));
      } catch (e) { console.error('Failed to save route:', e); }
    }
  }, [markers]);
  
  // Marker and Polyline update logic
  useEffect(() => {
    if (!map || !apiLoaded) return;
    mapMarkers.forEach(m => {
        m.setMap(null);
        m.customOverlay?.setMap(null);
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
        
        const content = `<div style="background: linear-gradient(135deg, #3B82F6, #0EA5E9); color: white; border-radius: 9999px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">${index + 1}</div>`;
        const customOverlay = new window.kakao.maps.CustomOverlay({ position, content, yAnchor: 1.3 });
        customOverlay.setMap(map);
        
        const mapMarker = new window.kakao.maps.Marker({ position }); // Invisible marker for click events
        const infoWindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding: 10px; min-width: 150px; text-align: center; font-family: sans-serif;"><strong>${index + 1}. ${markerData.name || '장소'}</strong></div>`,
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
            path: pathCoords, strokeWeight: 5, strokeColor: '#3B82F6', strokeOpacity: 0.8, strokeStyle: 'solid',
        });
        newPolyline.setMap(map);
        setPolyline(newPolyline);
    }
    if (pathCoords.length > 0) map.setBounds(bounds, 60, 60, 60, 60);
  }, [map, markers, apiLoaded]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || !window.kakao?.maps?.services) return;
    setIsSearching(true);
    try {
        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(query, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK) setSearchResults(data.slice(0, 5));
            else setSearchResults([]);
            setIsSearching(false);
        });
    } catch (error) {
        console.error('Search error:', error);
        setIsSearching(false);
    }
  };

  const handleAddPlace = (place) => {
    const newPlace = {
        id: place.id, name: place.place_name, lat: parseFloat(place.y), lng: parseFloat(place.x), address: place.road_address_name || place.address_name
    };
    if (markers.some(item => item.id === newPlace.id)) return;
    setMarkers(prev => [...prev, newPlace]);
    setSearchResults([]);
    setQuery('');
  };

  const handleRemovePlace = (placeId) => setMarkers(prev => prev.filter(item => item.id !== placeId));
  const goToChat = () => window.location.href = '/';

  if (error) return <div className="h-full flex items-center justify-center bg-red-50 text-red-700">Error: {error}</div>;

  return (
    <div className="flex flex-col bg-slate-50 h-full pt-3">
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 p-4 mx-3 rounded-xl">
        <div className="mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">🗺️ 여행 경로 지도</h1>
          <button onClick={goToChat} className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors">
            <HomeIcon />
            <span className="ml-2">채팅으로 돌아가기</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 w-full mx-auto h-11/12">
        <div className="lg:col-span-2 relative bg-slate-200 rounded-xl shadow-md overflow-hidden min-h-[400px] lg:min-h-0 border border-slate-200">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-600 font-semibold">지도를 로딩 중...</p>
              </div>
            </div>
          )}
          <div ref={mapContainer} className="w-full h-full" />
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 flex flex-col border border-slate-200 overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">📍 여행 경로</h2>
            {markers.length > 0 && <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">{markers.length}개 장소</span>}
          </div>

          <form onSubmit={handleSearchSubmit} className="mb-4">
             <div className="relative">
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full h-12 pl-5 pr-12 text-base bg-slate-100 border border-transparent rounded-full placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white focus:border-blue-400 transition-all" placeholder="장소를 검색해 추가하세요" disabled={isLoading || isSearching}/>
                <button type="submit" disabled={isLoading || isSearching || !query.trim()} className="absolute top-1/2 right-2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors">
                    <SearchIcon />
                </button>
             </div>
          </form>

          {searchResults.length > 0 && (
            <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-md font-semibold text-slate-700 mb-3">검색 결과</h3>
              <div className="space-y-2">
                {searchResults.map((result) => <SearchResult key={result.id} result={result} onAdd={handleAddPlace} isAdded={markers.some(item => item.id === result.id)}/>)}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto pr-2 -mr-4 custom-scrollbar">
            {markers?.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={markers.map(m => m.id)} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col gap-3">
                            {markers.map((marker, index) => <SortablePlaceItem key={marker.id} marker={marker} index={index} map={map} mapMarkers={mapMarkers} onRemove={handleRemovePlace}/>)}
                        </div>
                    </SortableContext>
                </DndContext>
            ) : (
                <div className="flex-1 flex items-center justify-center text-center text-slate-500 py-10">
                    <div>
                        <EmptyIcon/>
                        <p className="font-semibold mt-4">경로가 비어있습니다.</p>
                        <p className="text-sm text-slate-400 mt-1">위에서 장소를 검색하여 추가하거나<br/>채팅에서 경로를 추천받아 보세요.</p>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}