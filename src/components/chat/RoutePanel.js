// src/components/chat/RoutePanel.js
'use client';

import { useState } from 'react';
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
const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 3l6-3m0 0l-6-3m6 3v10" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

function SortablePlaceItem({ item, index, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
      >
        <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center mr-3">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">{item.name || '장소'}</p>
          {item.address && <p className="text-xs text-gray-500 truncate">{item.address}</p>}
        </div>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="ml-2 p-1 text-gray-500 hover:text-red-600 transition-colors"
        title="장소 제거"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

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
        {isAdded ? '추가됨' : <PlusIcon />}
      </button>
    </div>
  );
}

export default function RoutePanel({ route, onRouteReorder, onRouteUpdate, onViewMap }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = route.findIndex((item) => item.id === active.id);
      const newIndex = route.findIndex((item) => item.id === over.id);
      onRouteReorder(arrayMove(route, oldIndex, newIndex));
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        throw new Error('카카오 지도 API가 로드되지 않았습니다.');
      }

      const ps = new window.kakao.maps.services.Places();
      
      await new Promise((resolve, reject) => {
        ps.keywordSearch(searchQuery, (data, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            setSearchResults(data.slice(0, 5)); // 상위 5개 결과만
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

    if (route.some(item => item.id === newPlace.id)) {
      alert('이미 추가된 장소입니다.');
      return;
    }

    onRouteUpdate([...route, newPlace]);
    setSearchResults([]); // 검색 결과 초기화
    setSearchQuery(''); // 검색어 초기화
  };

  const handleRemovePlace = (placeId) => {
    onRouteUpdate(route.filter(item => item.id !== placeId));
  };

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">📍 여행 경로</h2>
          {route.length > 0 && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {route.length}개 장소
            </span>
          )}
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="장소를 검색하세요"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SearchIcon />
            </button>
          </div>
        </form>

        {/* View Map Button */}
        {route.length > 0 && (
          <button
            onClick={onViewMap}
            className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <MapIcon />
            <span className="ml-2">지도에서 보기</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">검색 결과</h3>
            <div className="space-y-2">
              {searchResults.map((result) => (
                <SearchResult
                  key={result.id}
                  result={result}
                  onAdd={handleAddPlace}
                  isAdded={route.some(item => item.id === result.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Route List */}
        <div className="p-4">
          {route.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={route} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {route.map((item, index) => (
                    <SortablePlaceItem
                      key={item.id}
                      item={item}
                      index={index}
                      onRemove={handleRemovePlace}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm mb-2">아직 경로가 없습니다.</p>
              <p className="text-xs text-gray-400">
                채팅에서 경로를 추천받거나<br />
                위에서 장소를 검색해보세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
