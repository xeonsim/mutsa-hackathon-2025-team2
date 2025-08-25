// --- New component for the initial empty chat screen ---
const InitialScreen = ({ onPromptClick }) => {
  const prompts = [
    { title: '부산 2박 3일 여행', description: '가족과 함께할 코스로 계획 짜줘' },
    { title: '서울 실내 데이트', description: '비 오는 날 즐길만한 곳 추천해줘' },
    { title: '제주도 동쪽 맛집', description: '현지인들이 자주 가는 곳 위주로 알려줘' },
    { title: '혼자 강릉 여행', description: '조용히 힐링할 수 있는 장소 포함해줘' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-600 animate-fade-in-up">
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-slate-800 mb-2">✈️ 여행의 아이들</h1>
        <p className="text-2xl text-slate-500">무엇을 도와드릴까요?</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-3xl px-4">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptClick(`${prompt.title} ${prompt.description}`)}
            className="p-4 bg-white/60 border border-slate-200 rounded-xl hover:bg-slate-100/80 hover:border-slate-300 transition-all duration-200 text-left shadow-sm"
          >
            <p className="font-semibold text-slate-700">{prompt.title}</p>
            <p className="text-sm text-slate-500">{prompt.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InitialScreen;