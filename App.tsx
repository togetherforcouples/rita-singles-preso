/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef, useState } from 'react';
import { VoxelEngine } from './services/VoxelEngine';
import { UIOverlay } from './components/UIOverlay';
import { GameDialog } from './components/GameDialog';
import { generateRoom } from './utils/voxelGenerators';
import { MusicPlayer } from './components/MusicPlayer';
import { PROFILE_DATA } from './data/profile';
import { ProfileSection } from './types';

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<VoxelEngine | null>(null);
  
  const [activeSection, setActiveSection] = useState<ProfileSection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Engine with click handler
    const engine = new VoxelEngine(
      containerRef.current,
      (groupId) => {
          const data = PROFILE_DATA[groupId];
          if (data) {
              setActiveSection(data);
              setIsDialogOpen(true);
          }
      }
    );

    engineRef.current = engine;

    // Load the Room
    const roomData = generateRoom();
    engine.loadScene(roomData);

    // Resize Listener
    const handleResize = () => engine.handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      engine.cleanup();
    };
  }, []);

  useEffect(() => {
    if (!activeSection || !isDialogOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = Object.keys(PROFILE_DATA);
      const currentIndex = keys.indexOf(activeSection.id);
      
      if (e.key === 'ArrowRight') {
        const nextIndex = (currentIndex + 1) % keys.length;
        setActiveSection(PROFILE_DATA[keys[nextIndex]]);
      } else if (e.key === 'ArrowLeft') {
        const prevIndex = (currentIndex - 1 + keys.length) % keys.length;
        setActiveSection(PROFILE_DATA[keys[prevIndex]]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, isDialogOpen]);

  return (
    <div className="relative w-full h-screen bg-[#2D3A30] overflow-hidden">
      {/* 3D Container */}
      <div ref={containerRef} className="absolute inset-0 z-0" />
      
      {/* UI Overlay */}
      <UIOverlay 
        onOpenHelp={() => {}}
      />
      <MusicPlayer />

      {/* Content Dialog */}
      <GameDialog 
        isOpen={isDialogOpen}
        data={activeSection}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
};

export default App;