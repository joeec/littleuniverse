import * as THREE from 'three';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  private target: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private currentPosition: THREE.Vector3 = new THREE.Vector3(0, 16, 14);
  private offset: THREE.Vector3 = new THREE.Vector3(0, 14, 12);
  private targetOffset: THREE.Vector3 = new THREE.Vector3(0, 14, 12);

  private smoothFactor: number = 0.08;
  private shakeIntensity: number = 0;
  private shakeDecay: number = 0.9;
  private shakeOffset: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  constructor(fov: number = 45, aspect: number = window.innerWidth / window.innerHeight) {
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.target);
  }

  public setTarget(x: number, y: number, z: number): void {
    this.target.set(x, y, z);
  }

  public addScreenShake(intensity: number): void {
    this.shakeIntensity = Math.min(this.shakeIntensity + intensity, 1.2);
  }

  public setZoom(zoomLevel: 'normal' | 'close' | 'boss'): void {
    if (zoomLevel === 'close') {
      this.targetOffset.set(0, 8, 7);
    } else if (zoomLevel === 'boss') {
      this.targetOffset.set(0, 18, 16);
    } else {
      this.targetOffset.set(0, 14, 12);
    }
  }

  public update(delta: number): void {
    // Lerp zoom offset
    this.offset.lerp(this.targetOffset, 0.05);

    // Calcular posición deseada
    const desiredPos = this.target.clone().add(this.offset);

    // Shake calculation
    if (this.shakeIntensity > 0.01) {
      this.shakeOffset.set(
        (Math.random() - 0.5) * this.shakeIntensity,
        (Math.random() - 0.5) * this.shakeIntensity,
        (Math.random() - 0.5) * this.shakeIntensity
      );
      this.shakeIntensity *= Math.pow(this.shakeDecay, delta * 60);
    } else {
      this.shakeOffset.set(0, 0, 0);
      this.shakeIntensity = 0;
    }

    // Suave seguimiento lerp
    this.camera.position.lerp(desiredPos.add(this.shakeOffset), this.smoothFactor);

    // Mirar hacia el objetivo suavizado
    const lookTarget = this.target.clone().add(new THREE.Vector3(0, 1.0, 0));
    this.camera.lookAt(lookTarget);
  }

  public onResize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}

