import React, { useRef, useState, useEffect } from 'react';
import './ResizableEdge.css';

type Edge =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

interface ResizableEdgeProps {
  edge: Edge;
  size?: number | 'auto';
  minSize?: number;
  maxSize?: number;
  onResize?: (size: { width: number; height: number }) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  storageKey?: string;
}

const isHorizontal = (edge: Edge) =>
  edge.includes('left') || edge.includes('right');

const isVertical = (edge: Edge) =>
  edge.includes('top') || edge.includes('bottom');

const ResizableEdge: React.FC<ResizableEdgeProps> = ({
  edge,
  size = 'auto',
  minSize = 50,
  maxSize = 2000,
  onResize,
  children,
  style = {},
  storageKey,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    }
    return { width: typeof size === 'number' ? size : 300, height: 200 };
  });

  useEffect(() => {
    if (typeof size === 'number') {
      if (isHorizontal(edge)) {
        setDimensions((d) => ({ ...d, width: size }));
      } else if (isVertical(edge)) {
        setDimensions((d) => ({ ...d, height: size }));
      }
    }
  }, [size, edge]);

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(dimensions));
    }
  }, [dimensions, storageKey]);

  const start = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    start.current = {
      x: e.clientX,
      y: e.clientY,
      width: dimensions.width,
      height: dimensions.height,
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    let deltaX = e.clientX - start.current.x;
    let deltaY = e.clientY - start.current.y;

    let newWidth = start.current.width;
    let newHeight = start.current.height;

    if (edge.includes('right')) newWidth += deltaX;
    if (edge.includes('left')) newWidth -= deltaX;
    if (edge.includes('bottom')) newHeight += deltaY;
    if (edge.includes('top')) newHeight -= deltaY;

    newWidth = Math.min(Math.max(newWidth, minSize), maxSize);
    newHeight = Math.min(Math.max(newHeight, minSize), maxSize);

    setDimensions({ width: newWidth, height: newHeight });
    onResize?.({ width: newWidth, height: newHeight });
  };

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      ref={containerRef}
      className={`resizable-container edge-${edge}`}
      style={{
        ...style,
        width: size === 'auto' && isHorizontal(edge) ? 'auto' : dimensions.width,
        height: size === 'auto' && isVertical(edge) ? 'auto' : dimensions.height,
      }}
    >
      {children}
      <div className={`resizer-handle resizer-${edge}`} onMouseDown={onMouseDown} />
    </div>
  );
};

export default ResizableEdge;




.resizable-container {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid #ccc;
}

.resizer-handle {
  position: absolute;
  background: #888;
  opacity: 0.5;
  z-index: 10;
}

.resizer-left,
.resizer-right {
  top: 0;
  bottom: 0;
  width: 10px;
  cursor: ew-resize;
}

.resizer-left {
  left: 0;
}

.resizer-right {
  right: 0;
}

.resizer-top,
.resizer-bottom {
  left: 0;
  right: 0;
  height: 10px;
  cursor: ns-resize;
}

.resizer-top {
  top: 0;
}

.resizer-bottom {
  bottom: 0;
}

.resizer-top-left,
.resizer-top-right,
.resizer-bottom-left,
.resizer-bottom-right {
  width: 10px;
  height: 10px;
}

.resizer-top-left {
  top: 0;
  left: 0;
  cursor: nwse-resize;
}

.resizer-top-right {
  top: 0;
  right: 0;
  cursor: nesw-resize;
}

.resizer-bottom-left {
  bottom: 0;
  left: 0;
  cursor: nesw-resize;
}

.resizer-bottom-right {
  bottom: 0;
  right: 0;
  cursor: nwse-resize;
}
