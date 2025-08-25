import {
  useSortable,
} from '@dnd-kit/sortable';
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const GripVerticalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 3a1 1 0 110 2 1 1 0 010-2zm0 7a1 1 0 110 2 1 1 0 010-2zm0 7a1 1 0 110 2 1 1 0 010-2z" /></svg>;
import { CSS } from '@dnd-kit/utilities';


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
    <div ref={setNodeRef} style={style} className="flex items-center p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-slate-400"><GripVerticalIcon/></div>
      
      <div className="flex items-center flex-1 cursor-pointer" onClick={handleClick}>
        <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-sky-400 text-white text-sm font-bold rounded-full flex items-center justify-center mr-3 shadow-md">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">{marker.name || '장소'}</p>
          {marker.address && <p className="text-xs text-slate-500 truncate">{marker.address}</p>}
        </div>
      </div>
      
      <button onClick={() => onRemove(marker.id)} className="ml-2 p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="장소 제거">
        <TrashIcon />
      </button>
    </div>
  );
}

export default SortablePlaceItem;