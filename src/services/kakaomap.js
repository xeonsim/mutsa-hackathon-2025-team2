const loadKakaoMapAPI = async (isMounted, onLoad, setError) => {
    try {
        if (window.kakao && window.kakao.maps) {
            return;
        }
        const API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
        if (!API_KEY) throw new Error('NEXT_PUBLIC_KAKAO_MAP_KEY is not set.');
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${API_KEY}&autoload=false&libraries=services`;
        script.async = true;
        script.onload = () => {
            if (isMounted && window.kakao && window.kakao.maps) {
                window.kakao.maps.load(() => isMounted && onLoad());
            }
        };
        script.onerror = () => isMounted && setError('Failed to load Kakao Maps script.');
        document.head.appendChild(script);
    } catch (err) {
        if (isMounted) setError(err.message);
    }
};
export { loadKakaoMapAPI };