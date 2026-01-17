/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { VoxelData } from '../types';
import { COLORS } from './voxelConstants';

// --- Helper Functions ---

function add(list: VoxelData[], x: number, y: number, z: number, color: number, groupId?: string) {
    list.push({ x: Math.floor(x), y: Math.floor(y), z: Math.floor(z), color, groupId });
}

// Add a solid box
function addBox(list: VoxelData[], x: number, y: number, z: number, w: number, h: number, d: number, color: number, groupId?: string) {
    for(let i=0; i<w; i++) {
        for(let j=0; j<h; j++) {
            for(let k=0; k<d; k++) {
                add(list, x+i, y+j, z+k, color, groupId);
            }
        }
    }
}

// Add a box with random noise/texture variation
function addTexturedBox(list: VoxelData[], x: number, y: number, z: number, w: number, h: number, d: number, baseColor: number, varColor1: number, varColor2: number, groupId?: string) {
    for(let i=0; i<w; i++) {
        for(let j=0; j<h; j++) {
            for(let k=0; k<d; k++) {
                const r = Math.random();
                let col = baseColor;
                if (r > 0.85) col = varColor1;
                else if (r > 0.95) col = varColor2;
                add(list, x+i, y+j, z+k, col, groupId);
            }
        }
    }
}

// --- Procedural Asset Generators ---

const createMonstera = (list: VoxelData[], bx: number, by: number, bz: number) => {
    // Pot
    addBox(list, bx, by, bz, 6, 6, 6, COLORS.POT_CLAY);
    addBox(list, bx+1, by+6, bz+1, 4, 1, 4, COLORS.SOIL);
    
    // Stems & Leaves
    const stems = [
        { dx: 2, dz: 2, h: 8, leanX: 1, leanZ: 1 },
        { dx: 3, dz: 3, h: 12, leanX: -2, leanZ: 1 },
        { dx: 2, dz: 3, h: 10, leanX: 1, leanZ: -2 },
    ];

    stems.forEach(stem => {
        let cx = bx + stem.dx;
        let cy = by + 6;
        let cz = bz + stem.dz;
        
        // Draw Stem
        for(let i=0; i<stem.h; i++) {
            add(list, cx, cy+i, cz, COLORS.LEAF_DARK);
            if(i % 3 === 0) cx += Math.sign(stem.leanX);
            if(i % 4 === 0) cz += Math.sign(stem.leanZ);
        }
        
        // Draw Leaf (Heart shape-ish)
        const lx = cx, ly = cy + stem.h, lz = cz;
        for(let lx_ = -3; lx_ <= 3; lx_++) {
            for(let lz_ = -3; lz_ <= 3; lz_++) {
                if (Math.abs(lx_) + Math.abs(lz_) < 5) {
                     // Add holes (fenestration) to leaf
                     if (!((lx_ === 1 && lz_ === 1) || (lx_ === -2 && lz_ === -1))) {
                        add(list, lx + lx_, ly, lz + lz_, COLORS.LEAF_MID);
                     }
                }
            }
        }
    });
};

const createBooks = (list: VoxelData[], x: number, y: number, z: number, width: number, depth: number) => {
    let currentX = 0;
    while(currentX < width - 2) {
        const thickness = 2 + Math.floor(Math.random() * 3);
        const height = 6 + Math.floor(Math.random() * 6);
        const color = [COLORS.BOOK_RED, COLORS.BOOK_BLUE, COLORS.BOOK_GREEN, COLORS.WOOD_MAHOGANY][Math.floor(Math.random()*4)];
        
        if(currentX + thickness > width) break;
        
        // Book Spine
        addBox(list, x + currentX, y, z, thickness, height, depth, color);
        // Page edges (top)
        addBox(list, x + currentX + 1, y + height - 1, z + 1, thickness - 2, 1, depth - 1, COLORS.BOOK_PAGES);
        
        currentX += thickness;
    }
};

// --- Main Room Generator ---

export const generateRoom = (): VoxelData[] => {
    const voxels: VoxelData[] = [];
    
    // Dimensions
    const SIZE = 140; // Total width/depth
    const HEIGHT = 100;
    const FLOOR_LEVEL = 0;
    
    // 1. FLOOR (Herringbone-ish noise pattern)
    // We only build a corner floor: 0 to SIZE, 0 to SIZE
    for(let x = 0; x < SIZE; x++) {
        for(let z = 0; z < SIZE; z++) {
            // Base pattern
            let col = COLORS.FLOOR_BASE;
            if ((x + z) % 4 === 0) col = COLORS.FLOOR_VAR_1;
            if (Math.random() > 0.97) col = COLORS.FLOOR_VAR_2; // Noise
            add(voxels, x, FLOOR_LEVEL, z, col);
        }
    }
    // Skirting Board
    addBox(voxels, 0, 1, 0, SIZE, 4, 2, COLORS.SKIRTING); // Back wall skirting
    addBox(voxels, 0, 1, 0, 2, 4, SIZE, COLORS.SKIRTING); // Left wall skirting

    // 2. WALLS (Corner Only - Back and Left)
    // Left Wall (x=0 plane)
    addTexturedBox(voxels, 0, 0, 0, 2, HEIGHT, SIZE, COLORS.WALL_BASE, COLORS.WALL_NOISE_1, COLORS.WALL_NOISE_2);
    // Back Wall (z=0 plane)
    addTexturedBox(voxels, 0, 0, 0, SIZE, HEIGHT, 2, COLORS.WALL_BASE, COLORS.WALL_NOISE_1, COLORS.WALL_NOISE_2);
    
    // Top Trim
    addBox(voxels, 0, HEIGHT-4, 0, SIZE, 4, 3, COLORS.WOOD_OAK_DARK);
    addBox(voxels, 0, HEIGHT-4, 0, 3, 4, SIZE, COLORS.WOOD_OAK_DARK);


    // 3. ARCHED CATHEDRAL WINDOW (Left Wall)
    // Position
    const wZ = 60, wY = 30;
    const wWidth = 30, wHeight = 50;
    
    // Cutout (Black void behind)
    addBox(voxels, 0, wY, wZ, 3, wHeight, wWidth, COLORS.BLACK);
    
    // Frame
    addBox(voxels, 2, wY, wZ, 1, wHeight, wWidth, COLORS.WIN_GLASS); // Glass
    
    // Arched Frame sculpting
    for(let i=0; i<wWidth; i++) {
        const archH = Math.sin((i/wWidth) * Math.PI) * 10;
        addBox(voxels, 1, wY + wHeight + archH, wZ + i, 3, 2, 1, COLORS.WIN_FRAME);
    }
    // Vertical bars
    addBox(voxels, 1, wY, wZ + wWidth/2, 2, wHeight + 10, 1, COLORS.WIN_FRAME);
    // Horizontal bars
    addBox(voxels, 1, wY + wHeight/2, wZ, 2, 1, wWidth, COLORS.WIN_FRAME);
    
    // Sill
    addBox(voxels, 2, wY-2, wZ-2, 6, 2, wWidth+4, COLORS.WOOD_OAK);


    // 4. FIREPLACE (Back Wall, Right side)
    // Rebuilt as hollow structure to ensure fire is visible
    const fX = 80;
    const fW = 34, fH = 30, fD = 12;
    const fZ = 2; // Start just in front of wall

    // Hearth (Floor)
    addBox(voxels, fX, 0, fZ, fW, 2, fD, COLORS.STONE_MAIN, 'animated_fire');
    
    // Left Pillar
    addBox(voxels, fX, 2, fZ, 8, fH-2, fD, COLORS.STONE_MAIN, 'animated_fire');
    
    // Right Pillar
    addBox(voxels, fX+fW-8, 2, fZ, 8, fH-2, fD, COLORS.STONE_MAIN, 'animated_fire');
    
    // Back Wall (Inside Fireplace - Darkened)
    // Only 4 deep, leaving 8 units of space in front for fire
    addBox(voxels, fX+8, 2, fZ, fW-16, fH-10, 4, COLORS.STONE_SHADOW, 'animated_fire'); 
    
    // Top Bar (Above Fire)
    addBox(voxels, fX+8, fH-8, fZ, fW-16, 8, fD, COLORS.STONE_MAIN, 'animated_fire');

    // Mantle Shelf
    addBox(voxels, fX-2, fH, fZ, fW+4, 4, fD+2, COLORS.WOOD_OAK_DARK, 'animated_fire');
    
    // Fire Logs (Placed in the hollow space)
    addBox(voxels, fX+12, 2, fZ+6, 10, 3, 3, COLORS.LOG, 'animated_fire');
    
    // ANIMATED FIRE (Placed above logs, in front of back wall)
    for(let i=0; i<60; i++) {
        const r = Math.random();
        const fc = r > 0.6 ? COLORS.FIRE_CORE : (r > 0.3 ? COLORS.FIRE_MID : COLORS.FIRE_OUTER);
        
        // Randomize position in the "void"
        const fxr = fX + 10 + Math.random() * 14; // Center X
        const fy = 5 + Math.random() * 10; // Height
        const fzr = fZ + 6 + Math.random() * 4; // Depth (Front half of fireplace)
        
        add(voxels, fxr, fy, fzr, fc, 'animated_fire'); 
    }
    
    // Chimney Stack (Upper Wall)
    addBox(voxels, fX+4, fH+4, 2, fW-8, HEIGHT-fH-4, 6, COLORS.STONE_HIGHLIGHT, 'animated_fire');
    
    // Mantle Decor
    addBox(voxels, fX+4, fH+4, 6, 2, 6, 2, COLORS.RUG_WHITE, 'animated_fire'); // Candle
    add(voxels, fX+4, fH+10, 6, COLORS.FIRE_CORE, 'animated_fire'); // Flame on candle
    createBooks(voxels, fX+15, fH+4, 6, 10, 4); // Books on mantle


    // 5. CORNER SHELF (The "Gnomecore" display) -> Back Left Corner
    const sX = 4, sZ = 4;
    const sW = 30, sD = 12;
    
    // Vertical supports
    addBox(voxels, sX, 0, sZ, 2, 90, 2, COLORS.WOOD_OAK);
    addBox(voxels, sX+sW, 0, sZ, 2, 90, 2, COLORS.WOOD_OAK);
    addBox(voxels, sX, 0, sZ+sD, 2, 90, 2, COLORS.WOOD_OAK);
    addBox(voxels, sX+sW, 0, sZ+sD, 2, 90, 2, COLORS.WOOD_OAK);
    
    // Shelves
    for(let y=10; y<90; y+=25) {
        addBox(voxels, sX, y, sZ, sW+2, 2, sD+2, COLORS.WOOD_OAK);
        
        // Items on shelves
        if(y === 10) {
            // Boxes
            addBox(voxels, sX+4, y+2, sZ+2, 8, 6, 8, COLORS.WOOD_MAHOGANY);
        } else if (y === 35) {
            // Wine Bottles
            addBox(voxels, sX+5, y+2, sZ+5, 3, 8, 3, COLORS.BOTTLE_GLASS);
            addBox(voxels, sX+6, y+10, sZ+6, 1, 3, 1, COLORS.RUG_RED);
            addBox(voxels, sX+12, y+2, sZ+4, 3, 8, 3, COLORS.BOTTLE_WINE);
        } else if (y === 60) {
            // Plants
            createMonstera(voxels, sX+15, y+2, sZ+6);
        }
    }


    // 6. BED (Interactive 'bed')
    const bX = 10, bZ = 80;
    const bW = 50, bL = 70;
    
    // Legs
    addBox(voxels, bX, 0, bZ, 3, 12, 3, COLORS.BED_FRAME, 'bed');
    addBox(voxels, bX+bW-3, 0, bZ, 3, 12, 3, COLORS.BED_FRAME, 'bed');
    addBox(voxels, bX, 0, bZ+bL, 3, 12, 3, COLORS.BED_FRAME, 'bed');
    addBox(voxels, bX+bW-3, 0, bZ+bL, 3, 12, 3, COLORS.BED_FRAME, 'bed');
    
    // Frame
    addBox(voxels, bX, 12, bZ, bW, 4, bL+3, COLORS.BED_FRAME, 'bed');
    
    // Headboard
    for(let x=bX; x<bX+bW; x+=4) {
        addBox(voxels, x, 12, bZ, 2, 25, 2, COLORS.BED_FRAME, 'bed');
    }
    addBox(voxels, bX, 35, bZ, bW, 2, 2, COLORS.BED_FRAME, 'bed');

    // Mattress & Sheets
    addBox(voxels, bX+2, 16, bZ+2, bW-4, 6, bL-2, COLORS.WHITE, 'bed'); // Mattress
    
    // Messy Duvet (Noise height map)
    for(let x=0; x<bW-4; x++) {
        for(let z=20; z<bL-2; z++) {
            const h = Math.floor(Math.sin(x/5)*Math.cos(z/5)*2 + 2);
            let col = COLORS.BED_SHEET_MAIN;
            if(h>2) col = COLORS.BED_SHEET_HIGHLIGHT;
            add(voxels, bX+2+x, 22+h, bZ+2+z, col, 'bed');
        }
    }
    
    // Pillows
    addBox(voxels, bX+6, 22, bZ+4, 16, 4, 10, COLORS.BED_PILLOW, 'bed');
    addBox(voxels, bX+26, 22, bZ+4, 16, 4, 10, COLORS.BED_PILLOW, 'bed');

    // Plushie on Bed
    const px = bX+35, pz = bZ+40, py = 26;
    addBox(voxels, px, py, pz, 6, 6, 6, COLORS.LEAF_LIGHT, 'bed'); // Body
    addBox(voxels, px+1, py+4, pz+6, 1, 1, 1, COLORS.WHITE, 'bed'); // Eye
    addBox(voxels, px+4, py+4, pz+6, 1, 1, 1, COLORS.WHITE, 'bed'); // Eye


    // 7. DESK AREA (Interactive 'notepad') -> Right Wall area
    const dX = 90, dZ = 80;
    const dW = 45, dD = 20, dH = 22;
    
    // Desk
    addBox(voxels, dX, 0, dZ, 3, dH, 3, COLORS.WOOD_OAK, 'notepad');
    addBox(voxels, dX+dW-3, 0, dZ, 3, dH, 3, COLORS.WOOD_OAK, 'notepad');
    addBox(voxels, dX, 0, dZ+dD, 3, dH, 3, COLORS.WOOD_OAK, 'notepad');
    addBox(voxels, dX+dW-3, 0, dZ+dD, 3, dH, 3, COLORS.WOOD_OAK, 'notepad');
    addBox(voxels, dX-2, dH, dZ-2, dW+4, 2, dD+4, COLORS.WOOD_OAK_DARK, 'notepad');
    
    // Laptop
    addBox(voxels, dX+15, dH+2, dZ+6, 14, 1, 10, COLORS.LAPTOP_GREY, 'notepad'); // Base
    for(let i=0; i<10; i++) {
        addBox(voxels, dX+15, dH+2+i, dZ+6-i*0.3, 14, 1, 1, COLORS.LAPTOP_SCREEN, 'notepad'); // Screen
    }
    
    // Coffee Mug
    addBox(voxels, dX+35, dH+2, dZ+4, 3, 4, 3, COLORS.WHITE, 'notepad');
    addBox(voxels, dX+36, dH+5, dZ+5, 1, 1, 1, COLORS.WOOD_MAHOGANY, 'notepad'); // Coffee
    
    // Notepad
    addBox(voxels, dX+5, dH+2, dZ+10, 8, 1, 6, COLORS.GOLD, 'notepad');


    // 8. EASEL (Interactive 'easel') -> Center Right
    const eX = 70, eZ = 50;
    // Tripod Legs
    for(let i=0; i<25; i++) {
        add(voxels, eX + i*0.3, i, eZ + i*0.3, COLORS.EASEL, 'easel'); // Back leg
        add(voxels, eX - 6 + i*0.1, i, eZ - 6 + i*0.1, COLORS.EASEL, 'easel'); // Front L
        add(voxels, eX + 6 - i*0.1, i, eZ - 6 + i*0.1, COLORS.EASEL, 'easel'); // Front R
    }
    // Canvas Holder
    addBox(voxels, eX-8, 15, eZ-7, 16, 1, 2, COLORS.EASEL, 'easel');
    // Canvas
    addBox(voxels, eX-7, 16, eZ-8, 14, 18, 1, COLORS.CANVAS, 'easel');
    // Paint Splatter (Abstract Art)
    addBox(voxels, eX-4, 20, eZ-9, 4, 4, 1, COLORS.PAINT_SPLATTER, 'easel');
    addBox(voxels, eX+2, 26, eZ-9, 2, 6, 1, COLORS.BOOK_BLUE, 'easel');
    
    // Palette on floor
    addBox(voxels, eX+8, 0, eZ, 6, 1, 5, COLORS.PALETTE_WOOD, 'easel');
    add(voxels, eX+9, 1, eZ+1, COLORS.RUG_RED, 'easel');
    add(voxels, eX+11, 1, eZ+1, COLORS.BOOK_BLUE, 'easel');


    // 9. MUSHROOM RUG (Center Room)
    const rX = 60, rZ = 60;
    const rRad = 26;
    
    for(let x=rX-rRad; x<=rX+rRad; x++) {
        for(let z=rZ-rRad; z<=rZ+rRad; z++) {
            if ((x-rX)**2 + (z-rZ)**2 <= rRad**2) {
                // Circle check
                let col = COLORS.RUG_RED;
                // Shadow/Texture ring
                if ((x-rX)**2 + (z-rZ)**2 > (rRad-4)**2) col = COLORS.RUG_RED_SHADOW;
                
                // White Spots
                const spots = [
                    {sx: rX-10, sz: rZ-8, sr: 4},
                    {sx: rX+12, sz: rZ+6, sr: 5},
                    {sx: rX-5, sz: rZ+14, sr: 3}
                ];
                spots.forEach(s => {
                    if((x-s.sx)**2 + (z-s.sz)**2 <= s.sr**2) col = COLORS.RUG_WHITE;
                });
                
                add(voxels, x, 1, z, col);
            }
        }
    }


    // 10. RITA (Character) -> Standing on Rug
    // ROTATED 180 degrees: Face is now towards +Z (User), Back is towards -Z
    const cX = 55, cZ = 55, cY = 2;
    
    // Shoes
    addBox(voxels, cX, cY, cZ, 3, 2, 4, COLORS.OUTFIT_DARK, 'rita');
    addBox(voxels, cX+5, cY, cZ, 3, 2, 4, COLORS.OUTFIT_DARK, 'rita');
    
    // Socks
    addBox(voxels, cX, cY+2, cZ+1, 3, 3, 3, COLORS.WHITE, 'rita');
    addBox(voxels, cX+5, cY+2, cZ+1, 3, 3, 3, COLORS.WHITE, 'rita');
    
    // Legs
    addBox(voxels, cX, cY+5, cZ+1, 3, 6, 3, COLORS.SKIN, 'rita');
    addBox(voxels, cX+5, cY+5, cZ+1, 3, 6, 3, COLORS.SKIN, 'rita');
    
    // Skirt
    for(let i=0; i<6; i++) {
        addBox(voxels, cX-2-i/2, cY+11+i, cZ-1-i/2, 12+i, 1, 6+i, COLORS.OUTFIT_RED, 'rita');
    }
    
    // Torso
    addBox(voxels, cX, cY+17, cZ, 8, 10, 5, COLORS.OUTFIT_WHITE, 'rita');
    
    // Vest
    addBox(voxels, cX, cY+17, cZ, 8, 6, 5, COLORS.OUTFIT_DARK, 'rita');
    
    // Head (Main Box)
    addBox(voxels, cX-1, cY+27, cZ-1, 10, 9, 8, COLORS.SKIN, 'rita');
    
    // Eyes (Now visible on +Z face)
    addBox(voxels, cX+1, cY+30, cZ+7, 2, 2, 1, COLORS.BLACK, 'rita'); // Left Eye
    addBox(voxels, cX+6, cY+30, cZ+7, 2, 2, 1, COLORS.BLACK, 'rita'); // Right Eye
    
    // Hair
    addBox(voxels, cX-2, cY+32, cZ-2, 12, 5, 10, COLORS.HAIR, 'rita'); // Top Hat/Hair
    
    // Hair Sides (Framing face)
    addBox(voxels, cX-2, cY+25, cZ, 2, 12, 8, COLORS.HAIR, 'rita'); // Side L
    addBox(voxels, cX+8, cY+25, cZ, 2, 12, 8, COLORS.HAIR, 'rita'); // Side R
    
    // Hair Back (Now at -Z)
    addBox(voxels, cX-2, cY+25, cZ-2, 12, 12, 2, COLORS.HAIR, 'rita'); // Back


    // 11. FAIRY LIGHTS (Hanging string)
    // Catenary curve from window to shelf
    const startX = 2, startY = 60, startZ = 60;
    const endX = 40, endY = 70, endZ = 10;
    const steps = 40;
    
    for(let i=0; i<=steps; i++) {
        const t = i/steps;
        const x = startX + (endX - startX) * t;
        const z = startZ + (endZ - startZ) * t;
        // Sag in the middle
        const sag = Math.sin(t * Math.PI) * 15;
        const y = startY + (endY - startY) * t - sag;
        
        add(voxels, x, y, z, COLORS.LIGHT_STRING_OFF);
        // Bulb every few steps
        if (i % 4 === 0) addBox(voxels, x, y-1, z, 1, 1, 1, COLORS.LIGHT_STRING_ON);
    }
    
    // 12. WALL DECOR
    // Bouldering Poster
    addBox(voxels, 0, 50, 20, 1, 16, 12, COLORS.BOOK_BLUE); // Frame
    addBox(voxels, 1, 52, 22, 1, 12, 8, COLORS.WHITE); // Art
    
    // Trench Coat Hook
    addBox(voxels, 60, 60, 1, 2, 4, 1, COLORS.GOLD);
    addBox(voxels, 58, 48, 2, 6, 14, 2, COLORS.POT_CLAY); // Coat


    return voxels;
};