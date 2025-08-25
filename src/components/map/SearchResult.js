const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;

function SearchResult({ result, onAdd, isAdded }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg transition-all hover:shadow-sm hover:border-blue-300">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 truncate">{result.place_name}</p>
        <p className="text-sm text-slate-500 truncate">{result.road_address_name || result.address_name}</p>
        {result.category_name && <p className="text-xs text-slate-400 truncate mt-1">{result.category_name}</p>}
      </div>
      <button
        onClick={() => onAdd(result)}
        disabled={isAdded}
        className={`ml-4 px-3 py-1.5 rounded-md text-sm font-semibold flex items-center justify-center transition-all duration-200 ${
          isAdded 
            ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
            : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
        }`}
      >
        {isAdded ? '추가됨' : <><PlusIcon /><span className="ml-1">추가</span></>}
      </button>
    </div>
  );
}

export default SearchResult;