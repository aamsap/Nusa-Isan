import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { cultureByCode, selectionFor } from './content';

type Feature = { properties: { code: string; province: string }; geometry: { type: 'Polygon'|'MultiPolygon'; coordinates: number[][][] | number[][][][] } };
type FeatureCollection = { features: Feature[] };
type Props = { onSelect: (code: string) => void; onHover: (code: string | null) => void; selectedHover: string | null; loadingText: string; errorText: string };
const PALETTE = ['#8ed462', '#a9d981', '#b8dd96', '#a2d8ac'].map(value => new THREE.Color(value));
const HIGHLIGHT = new THREE.Color('#ff705d');
const BLUE = new THREE.Color('#2ba0ff');
const point = ([lon, lat]: number[]) => new THREE.Vector2((lon - 118) * 1.02, (lat + 2.4) * 1.17);

function makeShape(rings: number[][][]): THREE.Shape {
  const outer = rings[0].map(point);
  const shape = new THREE.Shape();
  shape.moveTo(outer[0].x, outer[0].y);
  for (const p of outer.slice(1)) shape.lineTo(p.x, p.y);
  for (const ring of rings.slice(1)) {
    const path = new THREE.Path();
    const pts = ring.map(point);
    path.moveTo(pts[0].x, pts[0].y);
    for (const p of pts.slice(1)) path.lineTo(p.x, p.y);
    shape.holes.push(path);
  }
  return shape;
}
function shapesOf(feature: Feature): THREE.Shape[] {
  const polygons = feature.geometry.type === 'Polygon'
    ? [feature.geometry.coordinates as number[][][]]
    : feature.geometry.coordinates as number[][][][];
  return polygons.filter(rings => rings[0]?.length >= 4).map(makeShape);
}

export default function ProvinceMap({ onSelect, onHover, selectedHover, loadingText, errorText }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const selected = useRef(selectedHover);
  const onSelectRef = useRef(onSelect);
  const onHoverRef = useRef(onHover);
  const [status, setStatus] = useState<'loading'|'ready'|'error'>('loading');
  selected.current = selectedHover;
  onSelectRef.current = onSelect;
  onHoverRef.current = onHover;

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let renderer: THREE.WebGLRenderer;
    let resizeObserver: ResizeObserver;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-26, 26, 13, -13, 0.1, 100);
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const meshes: THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>[] = [];
    let glints: THREE.Points | undefined;
    let hoveredCode: string | null = null;
    let frame = 0;

    const setActive = (code: string | null) => {
      if (hoveredCode === code) return;
      hoveredCode = code;
      onHoverRef.current(code);
      const active = code ? selectionFor(code) : [];
      for (const mesh of meshes) {
        const activeMesh = active.includes(mesh.userData.code as string);
        gsap.to(mesh.position, { z: activeMesh ? 1.6 : 0, duration: .28, ease: 'power2.out', overwrite: true });
        const base = mesh.userData.baseColor as THREE.Color;
        gsap.to(mesh.material.color, { r: activeMesh ? HIGHLIGHT.r : base.r, g: activeMesh ? HIGHLIGHT.g : base.g, b: activeMesh ? HIGHLIGHT.b : base.b, duration: .25, overwrite: true });
      }
      element.style.cursor = code ? 'pointer' : 'default';
    };
    const hit = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(meshes, false)[0]?.object.userData.code as string | undefined;
    };
    // Zoom/pan state: the base view fits the whole archipelago; zoom narrows the frustum around (cx, cy).
    const MAX_ZOOM = 8;
    let baseW = 52, baseH = 26, zoom = 1, cx = 0, cy = 0;
    const applyCamera = () => {
      const w = baseW / zoom, h = baseH / zoom;
      cx = Math.max(-(baseW - w) / 2, Math.min((baseW - w) / 2, cx));
      cy = Math.max(-(baseH - h) / 2, Math.min((baseH - h) / 2, cy));
      camera.left = cx - w / 2; camera.right = cx + w / 2;
      camera.top = cy + h / 2; camera.bottom = cy - h / 2;
      camera.updateProjectionMatrix();
    };
    const ndc = (clientX: number, clientY: number) => {
      const bounds = element.getBoundingClientRect();
      return { x: ((clientX - bounds.left) / bounds.width) * 2 - 1, y: -(((clientY - bounds.top) / bounds.height) * 2 - 1) };
    };
    // Zoom by `factor` while keeping the world point under (nx, ny) fixed on screen.
    const zoomAt = (factor: number, nx: number, ny: number) => {
      const next = Math.max(1, Math.min(MAX_ZOOM, zoom * factor));
      const wx = cx + nx * baseW / zoom / 2, wy = cy + ny * baseH / zoom / 2;
      zoom = next;
      cx = wx - nx * baseW / zoom / 2; cy = wy - ny * baseH / zoom / 2;
      applyCamera();
    };
    const pointers = new Map<number, { x: number; y: number }>();
    let dragged = false, pinchDistance = 0, downAt = { x: 0, y: 0 };
    const distance = () => { const [a, b] = [...pointers.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
    const down = (event: PointerEvent) => {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 1) { dragged = false; downAt = { x: event.clientX, y: event.clientY }; }
      if (pointers.size === 2) { dragged = true; pinchDistance = distance(); }
    };
    const move = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) { setActive(hit(event) ?? null); return; }
      const dx = event.clientX - previous.x, dy = event.clientY - previous.y;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) {
        const now = distance();
        const [a, b] = [...pointers.values()];
        const mid = ndc((a.x + b.x) / 2, (a.y + b.y) / 2);
        if (pinchDistance > 0) zoomAt(now / pinchDistance, mid.x, mid.y);
        pinchDistance = now;
        return;
      }
      if (!dragged && Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y) > 5) dragged = true;
      if (dragged && zoom > 1) {
        const bounds = element.getBoundingClientRect();
        cx -= dx / bounds.width * baseW / zoom; cy += dy / bounds.height * baseH / zoom;
        applyCamera();
        element.style.cursor = 'grabbing';
      } else if (!dragged) setActive(hit(event) ?? null);
    };
    const leave = (event: PointerEvent) => { if (!pointers.has(event.pointerId)) setActive(null); };
    const up = (event: PointerEvent) => {
      const wasTap = pointers.has(event.pointerId) && pointers.size === 1 && !dragged;
      pointers.delete(event.pointerId);
      pinchDistance = 0;
      if (pointers.size === 1) { const [rest] = [...pointers.values()]; downAt = { ...rest }; }
      element.style.cursor = hoveredCode ? 'pointer' : 'default';
      if (!wasTap) return;
      const code = hit(event);
      if (code) onSelectRef.current(code);
    };
    const cancel = (event: PointerEvent) => { pointers.delete(event.pointerId); pinchDistance = 0; };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : 1;
      const speed = event.ctrlKey ? 0.01 : 0.0015; // ctrlKey = trackpad pinch
      const p = ndc(event.clientX, event.clientY);
      zoomAt(Math.exp(-event.deltaY * unit * speed), p.x, p.y);
    };
    const resize = () => {
      if (!renderer) return;
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (!width || !height) return;
      baseH = Math.max(25.5, 51 / (width / height));
      baseW = baseH * width / height;
      applyCamera();
      renderer.setSize(width, height, false);
    };
    const controller = new AbortController();
    fetch('/data/indonesia.geojson', { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Map unavailable'); return response.json() as Promise<FeatureCollection>; })
      .then(data => {
        if (disposed) return;
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        element.appendChild(renderer.domElement);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let paletteIndex = 0;
        for (const feature of data.features) {
          const code = feature.properties.code;
          if (!cultureByCode[code]) continue;
          const shapes = shapesOf(feature);
          if (!shapes.length) continue;
          const geometry = new THREE.ShapeGeometry(shapes, 2);
          const base = PALETTE[paletteIndex++ % PALETTE.length];
          const material = new THREE.MeshBasicMaterial({ color: base, side: THREE.DoubleSide, transparent: true, opacity: reduceMotion ? 1 : 0 });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.userData.code = code;
          mesh.userData.baseColor = base;
          const borderMaterial = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: reduceMotion ? .8 : 0 });
          const border = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), borderMaterial);
          border.position.z = .04;
          mesh.add(border);
          scene.add(mesh);
          meshes.push(mesh);
          if (!reduceMotion) {
            gsap.to(material, { opacity: 1, duration: .55, delay: Math.min(paletteIndex * .022, .65), ease: 'power2.out' });
            gsap.to(borderMaterial, { opacity: .8, duration: .55, delay: Math.min(paletteIndex * .022, .65), ease: 'power2.out' });
          }
        }
        // Small static glints are rendered beneath the map; provinces retain the only interactive surface.
        glints = new THREE.Points(new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-20,-7,-2), new THREE.Vector3(-12,8,-2), new THREE.Vector3(3,-9,-2), new THREE.Vector3(17,9,-2)
        ]), new THREE.PointsMaterial({ color: BLUE, size: .16 }));
        scene.add(glints);
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(element);
        resize();
        const animate = () => { frame = requestAnimationFrame(animate); renderer.render(scene, camera); };
        animate();
        element.style.touchAction = 'none';
        element.addEventListener('pointerdown', down);
        element.addEventListener('pointermove', move);
        element.addEventListener('pointerleave', leave);
        element.addEventListener('pointerup', up);
        element.addEventListener('pointercancel', cancel);
        element.addEventListener('wheel', wheel, { passive: false });
        setStatus('ready');
      })
      .catch(error => { if (!disposed && error.name !== 'AbortError') setStatus('error'); });
    return () => {
      disposed = true;
      controller.abort();
      cancelAnimationFrame(frame);
      if (resizeObserver) resizeObserver.disconnect();
      element.removeEventListener('pointerdown', down);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', leave);
      element.removeEventListener('pointerup', up);
      element.removeEventListener('pointercancel', cancel);
      element.removeEventListener('wheel', wheel);
      gsap.killTweensOf(meshes.map(mesh => mesh.position));
      gsap.killTweensOf(meshes.map(mesh => mesh.material.color));
      for (const mesh of meshes) {
        gsap.killTweensOf(mesh.material);
        for (const child of mesh.children) if (child instanceof THREE.LineSegments) {
          gsap.killTweensOf(child.material);
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) child.material.dispose();
        }
        mesh.geometry.dispose(); mesh.material.dispose();
      }
      if (glints) { glints.geometry.dispose(); (glints.material as THREE.Material).dispose(); }
      if (renderer) { renderer.dispose(); renderer.domElement.remove(); }
    };
  }, []);
  return <div className="map-surface" ref={host} role="img" aria-label="Interactive map of the provinces of Indonesia">
    {status !== 'ready' && <p className="map-status">{status === 'error' ? errorText : loadingText}</p>}
    {selectedHover && status === 'ready' && <span className="map-hover-label" aria-hidden="true">{cultureByCode[selectedHover]?.province}</span>}
  </div>;
}
