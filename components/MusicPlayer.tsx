import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Flame, Music as MusicIcon, SkipForward } from 'lucide-react';

const TRACKS = [
  {
    name: "Cozy Lofi Beat",
    url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" // Placeholder - reliable CDN needed
  },
  {
    name: "Night Chill",
    url: "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3"
  }
];

const FIREPLACE_URL = "https://actions.google.com/sounds/v1/ambiences/fireplace.ogg";

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFireplaceOn, setIsFireplaceOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const musicRef = useRef<HTMLAudioElement>(null);
  const fireplaceRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = isMuted ? 0 : volume;
    }
    if (fireplaceRef.current) {
      fireplaceRef.current.volume = isMuted ? 0 : volume * 0.8; // Fireplace slightly quieter
    }
  }, [volume, isMuted]);

  useEffect(() => {
    // Attempt auto-play if interaction occurred, or just set state
    if (isPlaying) {
      musicRef.current?.play().catch(e => console.log("Audio play failed:", e));
    } else {
      musicRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (isFireplaceOn) {
      fireplaceRef.current?.play().catch(e => console.log("Fireplace play failed:", e));
    } else {
      fireplaceRef.current?.pause();
    }
  }, [isFireplaceOn]);

  const toggleMute = () => setIsMuted(!isMuted);
  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleFireplace = () => setIsFireplaceOn(!isFireplaceOn);
  
  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 p-3 bg-black/60 backdrop-blur-sm rounded-lg border-2 border-[#8B9BB4] text-[#E0E0E0] font-vt323 transition-all hover:bg-black/80">
      
      {/* Title Scroller */}
      <div className="text-sm truncate w-48 mb-1 text-[#8B9BB4]">
        {isPlaying ? `Now Playing: ${TRACKS[currentTrackIndex].name}` : "Music Paused"}
      </div>

      <div className="flex items-center gap-3">
        {/* Play/Pause Music */}
        <button 
          onClick={togglePlay}
          className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isPlaying ? 'text-green-400' : 'text-gray-400'}`}
          title="Toggle Music"
        >
          <MusicIcon size={20} />
        </button>

        {/* Toggle Fireplace */}
        <button 
          onClick={toggleFireplace}
          className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isFireplaceOn ? 'text-orange-400' : 'text-gray-400'}`}
          title="Toggle Fireplace Sounds"
        >
          <Flame size={20} />
        </button>

        {/* Next Track */}
        <button 
          onClick={nextTrack}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400"
          title="Next Track"
        >
          <SkipForward size={18} />
        </button>

        {/* Mute/Volume */}
        <button 
          onClick={toggleMute}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Volume Slider */}
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.05" 
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer mt-1 accent-[#8B9BB4]"
      />

      {/* Audio Elements */}
      <audio 
        ref={musicRef} 
        src={TRACKS[currentTrackIndex].url} 
        loop 
        onEnded={nextTrack}
        crossOrigin="anonymous" 
      />
      <audio 
        ref={fireplaceRef} 
        src={FIREPLACE_URL} 
        loop 
        crossOrigin="anonymous" 
      />
    </div>
  );
};
