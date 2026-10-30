import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * 指標事件拖曳：同時支援滑鼠與手指觸控（HTML5 drag 在手機上不可用）。
 * - <Draggable payload> 按住拖曳，放開時尋找最上層的 data-drop 區域
 * - useDropZone(id, handler) 註冊放置區，handler 會收到 payload 與放開時的螢幕座標
 * - 輕點（未移動）則觸發 onTap，可作為點選查看資訊
 */
export interface DragPayload {
  kind: string;
  id: string;
}

type DropHandler = (payload: DragPayload, clientX: number, clientY: number) => void;

interface DragCtx {
  dragging: DragPayload | null;
  hoverZone: string | null;
  register: (id: string, handler: DropHandler) => () => void;
  begin: (payload: DragPayload, preview: ReactNode, e: React.PointerEvent) => void;
}

const Ctx = createContext<DragCtx | null>(null);

export function DragDropProvider({ children }: { children: ReactNode }) {
  const handlers = useRef(new Map<string, DropHandler>());
  const [dragging, setDragging] = useState<DragPayload | null>(null);
  const [preview, setPreview] = useState<ReactNode>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hoverZone, setHoverZone] = useState<string | null>(null);

  const register = useCallback((id: string, handler: DropHandler) => {
    handlers.current.set(id, handler);
    return () => {
      handlers.current.delete(id);
    };
  }, []);

  const zoneAt = (x: number, y: number) => {
    for (const el of document.elementsFromPoint(x, y)) {
      const z = (el as HTMLElement).closest?.('[data-drop]') as HTMLElement | null;
      if (z) return z.dataset.drop ?? null;
    }
    return null;
  };

  const begin = useCallback((payload: DragPayload, node: ReactNode, e: React.PointerEvent) => {
    setDragging(payload);
    setPreview(node);
    setPos({ x: e.clientX, y: e.clientY });
    const move = (ev: PointerEvent) => {
      setPos({ x: ev.clientX, y: ev.clientY });
      setHoverZone(zoneAt(ev.clientX, ev.clientY));
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      const zone = zoneAt(ev.clientX, ev.clientY);
      setDragging(null);
      setHoverZone(null);
      if (zone && ev.type === 'pointerup') handlers.current.get(zone)?.(payload, ev.clientX, ev.clientY);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }, []);

  return (
    <Ctx.Provider value={{ dragging, hoverZone, register, begin }}>
      {children}
      {dragging && (
        <div className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-1/2 drop-shadow-xl" style={{ left: pos.x, top: pos.y }}>
          {preview}
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useDragDrop() {
  const c = useContext(Ctx);
  if (!c) throw new Error('DragDropProvider missing');
  return c;
}

export function useDropZone(id: string, handler: DropHandler) {
  const { register, dragging, hoverZone } = useDragDrop();
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => register(id, (p, x, y) => ref.current(p, x, y)), [id, register]);
  return { active: !!dragging, over: hoverZone === id, dragging };
}

/** 只讀取拖曳狀態（用於高亮放置區），不註冊處理函式 */
export function useDropState(id: string) {
  const { dragging, hoverZone } = useDragDrop();
  return { active: !!dragging, over: hoverZone === id };
}

const DRAG_THRESHOLD = 6;

export function Draggable({
  payload,
  preview,
  children,
  onTap,
  disabled,
  className,
}: {
  payload: DragPayload;
  preview: ReactNode;
  children: ReactNode;
  onTap?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const { begin } = useDragDrop();
  const start = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled || e.button > 0) return;
    start.current = { x: e.clientX, y: e.clientY };
    const move = (ev: PointerEvent) => {
      if (!start.current) return;
      if (Math.hypot(ev.clientX - start.current.x, ev.clientY - start.current.y) > DRAG_THRESHOLD) {
        start.current = null;
        cleanup();
        begin(payload, preview, { clientX: ev.clientX, clientY: ev.clientY } as React.PointerEvent);
      }
    };
    const up = () => {
      if (start.current) onTap?.();
      start.current = null;
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div onPointerDown={onPointerDown} className={`${disabled ? 'opacity-40' : 'cursor-grab active:cursor-grabbing'} touch-none select-none ${className ?? ''}`}>
      {children}
    </div>
  );
}
