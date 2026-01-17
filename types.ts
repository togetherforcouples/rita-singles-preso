/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import * as THREE from 'three';

export interface VoxelData {
  x: number;
  y: number;
  z: number;
  color: number;
  groupId?: string; // If present, this voxel belongs to an interactive object
}

export interface InteractiveGroup {
  id: string;
  voxelIndices: number[];
  baseY: number[]; // Store initial Y for each voxel in the group
  hoverOffset: number; // Random offset for wave animation
}

export interface ProfileSection {
  id: string;
  title: string;
  slides: {
    title: string;
    text: string[]; // Array of paragraphs
    imagePlaceholder?: string; // Text description of image to place here
    image?: string; // Path/URL to the image
  }[];
}