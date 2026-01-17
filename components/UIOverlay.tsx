/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface UIOverlayProps {
    onOpenHelp: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ onOpenHelp }) => {
  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-end">
      
      {/* Bottom attribution */}
      <div className="text-center text-[#8FA876]/50 text-sm animate-pulse">
        Drag to rotate • Scroll to zoom • Click items to explore
      </div>

    </div>
  );
};