import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const LogisticsCity3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x2563EB, 3);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x22C55E, 2, 50);
    pointLight.position.set(-10, 5, -10);
    scene.add(pointLight);

    // Materials
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x051424, roughness: 0.8 });
    const buildingMat = new THREE.MeshStandardMaterial({ color: 0x1c2b3c, metalness: 0.5, roughness: 0.2 });
    const routeMat = new THREE.MeshBasicMaterial({ color: 0x2563EB, transparent: true, opacity: 0.4 });
    const truckMat = new THREE.MeshStandardMaterial({ color: 0xd4e4fa });

    // Logistics City Elements
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Grid Helper for technical feel
    const grid = new THREE.GridHelper(100, 50, 0x1c2b3c, 0x0d1c2d);
    scene.add(grid);

    // Warehouses
    function createWarehouse(x: number, z: number) {
      const group = new THREE.Group();
      const mainBody = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 6), buildingMat);
      mainBody.position.y = 1;
      group.add(mainBody);

      // Windows/Lights
      const lightGeo = new THREE.BoxGeometry(0.1, 0.5, 4);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0x2563EB });
      const windowRow = new THREE.Mesh(lightGeo, lightMat);
      windowRow.position.set(2, 1.2, 0);
      group.add(windowRow);

      group.position.set(x, 0, z);
      scene.add(group);
    }

    createWarehouse(-10, -10);
    createWarehouse(12, 5);
    createWarehouse(-5, 15);

    // Animated Routes
    interface RouteConfig {
      curve: THREE.QuadraticBezierCurve3;
      line: THREE.Line;
    }
    const routes: RouteConfig[] = [];
    function createRoute(start: { x: number; z: number }, end: { x: number; z: number }) {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(start.x, 0.05, start.z),
        new THREE.Vector3((start.x + end.x) / 2, 2, (start.z + end.z) / 2),
        new THREE.Vector3(end.x, 0.05, end.z)
      );
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, routeMat);
      scene.add(line);
      routes.push({ curve, line });
    }

    createRoute({ x: -10, z: -10 }, { x: 12, z: 5 });
    createRoute({ x: 12, z: 5 }, { x: -5, z: 15 });
    createRoute({ x: -5, z: 15 }, { x: -10, z: -10 });

    // Moving Trucks
    interface TruckConfig {
      mesh: THREE.Mesh;
      progress: number;
      routeIndex: number;
      speed: number;
    }
    const trucks: TruckConfig[] = [];
    function createTruck() {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 1.2), truckMat);
      scene.add(mesh);
      const routeIndex = Math.floor(Math.random() * routes.length);
      trucks.push({ 
        mesh, 
        progress: Math.random(), 
        routeIndex, 
        speed: 0.001 + Math.random() * 0.002 
      });
    }

    for (let i = 0; i < 8; i++) createTruck();

    let animationId: number;

    // Animation Loop
    function animate() {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      trucks.forEach(t => {
        t.progress += t.speed;
        if (t.progress > 1) t.progress = 0;

        const pos = routes[t.routeIndex].curve.getPointAt(t.progress);
        const tangent = routes[t.routeIndex].curve.getTangentAt(t.progress);

        t.mesh.position.copy(pos);
        t.mesh.lookAt(pos.clone().add(tangent));
      });

      // Camera orbital path rotation
      camera.position.x = 20 + Math.sin(time * 0.1) * 2;
      camera.position.z = 20 + Math.cos(time * 0.1) * 2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      const wWidth = container.clientWidth || window.innerWidth;
      const wHeight = container.clientHeight || window.innerHeight;
      camera.aspect = wWidth / wHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(wWidth, wHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px]" />;
};
