import React, { useRef, useState, useEffect } from 'react';

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
  onResize?: (newSize: { width: number; height: number }) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 200 });

  const start = useRef({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current && size === 'auto') {
      const update = () => {
        setDimensions({
          width: containerRef.current!.offsetWidth,
          height: containerRef.current!.offsetHeight,
        });
      };
      update();
      const ro = new ResizeObserver(update);
      ro.observe(containerRef.current);
      return () => ro.disconnect();
    } else if (typeof size === 'number') {
      if (isHorizontal(edge)) {
        setDimensions((d) => ({ ...d, width: size }));
      } else if (isVertical(edge)) {
        setDimensions((d) => ({ ...d, height: size }));
      }
    }
  }, [size, edge]);

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

  const getHandleStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      background: '#888',
      opacity: 0.5,
      zIndex: 10,
    };
    const size = 10;

    switch (edge) {
      case 'left':
        return { ...base, top: 0, bottom: 0, left: 0, width: size, cursor: 'ew-resize' };
      case 'right':
        return { ...base, top: 0, bottom: 0, right: 0, width: size, cursor: 'ew-resize' };
      case 'top':
        return { ...base, top: 0, left: 0, right: 0, height: size, cursor: 'ns-resize' };
      case 'bottom':
        return { ...base, bottom: 0, left: 0, right: 0, height: size, cursor: 'ns-resize' };
      case 'top-left':
        return { ...base, top: 0, left: 0, width: size, height: size, cursor: 'nwse-resize' };
      case 'top-right':
        return { ...base, top: 0, right: 0, width: size, height: size, cursor: 'nesw-resize' };
      case 'bottom-left':
        return { ...base, bottom: 0, left: 0, width: size, height: size, cursor: 'nesw-resize' };
      case 'bottom-right':
        return { ...base, bottom: 0, right: 0, width: size, height: size, cursor: 'nwse-resize' };
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
        border: '1px solid #ccc',
        ...style,
        width: size === 'auto' && isHorizontal(edge) ? 'auto' : dimensions.width,
        height: size === 'auto' && isVertical(edge) ? 'auto' : dimensions.height,
      }}
    >
      {children}
      <div style={getHandleStyle()} onMouseDown={onMouseDown} />
    </div>
  );
};

export default ResizableEdge;
