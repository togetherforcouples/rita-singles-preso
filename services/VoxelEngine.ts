/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VoxelData, InteractiveGroup } from '../types';
import { CONFIG, COLORS } from '../utils/voxelConstants';

export class VoxelEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  
  private rootGroup: THREE.Group; 
  private instanceMesh: THREE.InstancedMesh | null = null;
  private dummy = new THREE.Object3D();
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  
  private voxels: VoxelData[] = [];
  private interactiveGroups: Map<string, InteractiveGroup> = new Map();
  private fireIndices: number[] = []; 
  private ritaIndices: number[] = []; // Store indices for Rita character

  private hoverTime = 0;
  
  private animationId: number = 0;
  private onObjectClick: (id: string) => void;

  // Movement State
  private keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false
  };
  private characterPos = new THREE.Vector3(0, 0, 0);

  constructor(
    container: HTMLElement, 
    onObjectClick: (id: string) => void
  ) {
    this.container = container;
    this.onObjectClick = onObjectClick;

    // Init Three.js
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONFIG.BG_COLOR);

    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);

    // ORTHOGRAPHIC CAMERA SETUP (Isometric view)
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 120; // Scale of view
    this.camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2, 
      frustumSize * aspect / 2, 
      frustumSize / 2, 
      frustumSize / -2, 
      1, 
      1000
    );
    
    // ISO Angle
    this.camera.position.set(200, 200, 200); 
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = false;
    this.controls.enableZoom = true;
    this.controls.minZoom = 0.5;
    this.controls.maxZoom = 2;

    // --- LIGHTING SETUP (High Fidelity + Boosted for Brightness) ---
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2); 
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(-100, 150, -50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    this.scene.add(dirLight);

    const windowLight = new THREE.PointLight(COLORS.WIN_GLOW, 2.0, 100);
    windowLight.position.set(20, 60, 60);
    this.rootGroup.add(windowLight);

    const fireLight = new THREE.PointLight(COLORS.FIRE_MID, 2.5, 80);
    fireLight.position.set(80, 20, 10);
    this.rootGroup.add(fireLight);


    // Listeners
    this.renderer.domElement.addEventListener('pointermove', this.onMouseMove.bind(this));
    this.renderer.domElement.addEventListener('pointerdown', this.onMouseDown.bind(this));
    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    this.animate = this.animate.bind(this);
    this.animate();
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key in this.keys) {
      this.keys[e.key as keyof typeof this.keys] = true;
    }
  }

  private handleKeyUp = (e: KeyboardEvent) => {
    if (e.key in this.keys) {
      this.keys[e.key as keyof typeof this.keys] = false;
    }
  }

  private onMouseMove(event: MouseEvent) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      this.raycaster.setFromCamera(this.mouse, this.camera);
      /*
      if (this.instanceMesh) {
          const intersection = this.raycaster.intersectObject(this.instanceMesh);
          if (intersection.length > 0) {
              const instanceId = intersection[0].instanceId;
              if (instanceId !== undefined) {
                  const voxel = this.voxels[instanceId];
                  if (voxel.groupId && voxel.groupId !== 'animated_fire') {
                      // this.container.style.cursor = 'pointer';
                      return;
                  }
              }
          }
      }
      // this.container.style.cursor = 'default';
      */
  }

  private onMouseDown(event: MouseEvent) {
      if(event.button !== 0) return;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      if (this.instanceMesh) {
          const intersection = this.raycaster.intersectObject(this.instanceMesh);
          if (intersection.length > 0) {
              const instanceId = intersection[0].instanceId;
              if (instanceId !== undefined) {
                  const voxel = this.voxels[instanceId];
                  if (voxel.groupId && voxel.groupId !== 'animated_fire') {
                      this.onObjectClick(voxel.groupId);
                  }
              }
          }
      }
  }

  public loadScene(data: VoxelData[]) {
    this.voxels = data;
    this.interactiveGroups.clear();
    this.fireIndices = [];
    this.ritaIndices = [];

    data.forEach((v, idx) => {
        // Interactive Groups
        if (v.groupId && v.groupId !== 'animated_fire' && v.groupId !== 'rita') {
            if (!this.interactiveGroups.has(v.groupId)) {
                this.interactiveGroups.set(v.groupId, {
                    id: v.groupId,
                    voxelIndices: [],
                    baseY: [],
                    hoverOffset: Math.random() * Math.PI * 2
                });
            }
            const group = this.interactiveGroups.get(v.groupId)!;
            group.voxelIndices.push(idx);
            group.baseY.push(v.y);
        }
        
        // Special Groups
        if (v.groupId === 'animated_fire') {
             this.fireIndices.push(idx);
        } else if (v.groupId === 'rita') {
            this.ritaIndices.push(idx);
            // Also make Rita interactive for clicking
             if (!this.interactiveGroups.has('rita')) {
                this.interactiveGroups.set('rita', {
                    id: 'rita',
                    voxelIndices: [],
                    baseY: [],
                    hoverOffset: 0 // No bobbing for walking character
                });
            }
            this.interactiveGroups.get('rita')!.voxelIndices.push(idx);
            this.interactiveGroups.get('rita')!.baseY.push(v.y);
        }
    });

    if (this.instanceMesh) {
      this.rootGroup.remove(this.instanceMesh);
      this.instanceMesh.geometry.dispose();
      (this.instanceMesh.material as THREE.Material).dispose();
    }

    const geometry = new THREE.BoxGeometry(CONFIG.VOXEL_SIZE, CONFIG.VOXEL_SIZE, CONFIG.VOXEL_SIZE);
    
    const material = new THREE.MeshStandardMaterial({ 
        roughness: 0.9, 
        metalness: 0.1,
    });
    
    this.instanceMesh = new THREE.InstancedMesh(geometry, material, this.voxels.length);
    this.instanceMesh.castShadow = true;
    this.instanceMesh.receiveShadow = true;
    
    this.voxels.forEach((v, i) => {
        this.dummy.position.set(v.x * CONFIG.VOXEL_SIZE, v.y * CONFIG.VOXEL_SIZE, v.z * CONFIG.VOXEL_SIZE);
        this.dummy.scale.set(1, 1, 1);
        this.dummy.updateMatrix();
        this.instanceMesh!.setMatrixAt(i, this.dummy.matrix);
        
        const color = new THREE.Color(v.color);
        if (v.color === COLORS.LIGHT_STRING_ON || v.color === COLORS.WIN_GLASS || v.color === COLORS.FIRE_CORE || v.color === COLORS.FIRE_MID) {
            color.multiplyScalar(1.5);
        }
        this.instanceMesh!.setColorAt(i, color);
    });

    this.rootGroup.add(this.instanceMesh);
    this.rootGroup.position.set(-35, -20, -35);
  }

  private updateAnimations() {
      if (!this.instanceMesh) return;
      
      this.hoverTime += 0.03;
      let needsUpdate = false;

      // 1. Movement Logic
      const speed = 0.5;
      if (this.keys.ArrowUp || this.keys.w) this.characterPos.z -= speed;
      if (this.keys.ArrowDown || this.keys.s) this.characterPos.z += speed;
      if (this.keys.ArrowLeft || this.keys.a) this.characterPos.x -= speed;
      if (this.keys.ArrowRight || this.keys.d) this.characterPos.x += speed;

      // Clamp to room bounds (approx 0-140)
      // Rita starts at ~55. Offset + Start should be within 0-140.
      const startX = 55;
      const startZ = 55;
      if (startX + this.characterPos.x < 2) this.characterPos.x = 2 - startX;
      if (startX + this.characterPos.x > 138) this.characterPos.x = 138 - startX;
      if (startZ + this.characterPos.z < 2) this.characterPos.z = 2 - startZ;
      if (startZ + this.characterPos.z > 138) this.characterPos.z = 138 - startZ;


      // 2. Bobbing Animation (Interactive Objects EXCEPT Rita)
      this.interactiveGroups.forEach(group => {
          if (group.id === 'rita') return; // Skip Rita here, handled below
          
          const hoverY = Math.sin(this.hoverTime + group.hoverOffset) * 2.0;
          group.voxelIndices.forEach((idx, i) => {
              const v = this.voxels[idx];
              const worldY = (v.y * CONFIG.VOXEL_SIZE) + (hoverY * 0.1); 
              this.dummy.position.set(v.x * CONFIG.VOXEL_SIZE, worldY, v.z * CONFIG.VOXEL_SIZE);
              this.dummy.scale.set(1, 1, 1);
              this.dummy.updateMatrix();
              this.instanceMesh!.setMatrixAt(idx, this.dummy.matrix);
          });
          needsUpdate = true;
      });
      
      // 3. Rita Character Animation (Movement + Hop)
      const walkHop = (this.keys.ArrowUp || this.keys.ArrowDown || this.keys.ArrowLeft || this.keys.ArrowRight) 
          ? Math.abs(Math.sin(this.hoverTime * 4)) * 1.5 
          : 0;
          
      this.ritaIndices.forEach(idx => {
          const v = this.voxels[idx];
          const wx = (v.x + this.characterPos.x) * CONFIG.VOXEL_SIZE;
          const wz = (v.z + this.characterPos.z) * CONFIG.VOXEL_SIZE;
          const wy = (v.y + walkHop) * CONFIG.VOXEL_SIZE;
          
          this.dummy.position.set(wx, wy, wz);
          this.dummy.scale.set(1, 1, 1);
          this.dummy.updateMatrix();
          this.instanceMesh!.setMatrixAt(idx, this.dummy.matrix);
          needsUpdate = true;
      });
      
      // 4. Fire Animation
      this.fireIndices.forEach(idx => {
          const v = this.voxels[idx];
          const scaleY = 0.5 + Math.random() * 0.8;
          const jitterY = Math.random() * 0.2;
          
          this.dummy.position.set(v.x * CONFIG.VOXEL_SIZE, (v.y + jitterY) * CONFIG.VOXEL_SIZE, v.z * CONFIG.VOXEL_SIZE);
          this.dummy.scale.set(1, scaleY, 1);
          this.dummy.updateMatrix();
          this.instanceMesh!.setMatrixAt(idx, this.dummy.matrix);
          needsUpdate = true;
      });

      if (needsUpdate) {
          this.instanceMesh.instanceMatrix.needsUpdate = true;
      }
  }

  private animate() {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.updateAnimations();
    this.renderer.render(this.scene, this.camera);
  }

  public handleResize() {
      if (this.camera && this.renderer) {
        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = 120;
        
        this.camera.left = -frustumSize * aspect / 2;
        this.camera.right = frustumSize * aspect / 2;
        this.camera.top = frustumSize / 2;
        this.camera.bottom = -frustumSize / 2;
        
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }
  }

  public cleanup() {
    cancelAnimationFrame(this.animationId);
    this.container.removeChild(this.renderer.domElement);
    this.renderer.dispose();
    window.removeEventListener('resize', this.handleResize.bind(this));
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}