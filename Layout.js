import React from 'react';
import './LayoutContainer.css';

interface LayoutContainerProps {
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  topSidebar?: React.ReactNode;
  bottomSidebar?: React.ReactNode;
  children: React.ReactNode; // main content
}

const LayoutContainer: React.FC<LayoutContainerProps> = ({
  leftSidebar,
  rightSidebar,
  topSidebar,
  bottomSidebar,
  children
}) => {
  return (
    <div className="layout-root">
      {topSidebar && <div className="layout-top">{topSidebar}</div>}

      <div className="layout-middle">
        {leftSidebar && <div className="layout-left">{leftSidebar}</div>}

        <div className="layout-content">{children}</div>

        {rightSidebar && <div className="layout-right">{rightSidebar}</div>}
      </div>

      {bottomSidebar && <div className="layout-bottom">{bottomSidebar}</div>}
    </div>
  );
};

export default LayoutContainer;


.layout-root {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.layout-top,
.layout-bottom {
  flex-shrink: 0;
  width: 100%;
  height: auto;
}

.layout-middle {
  flex: 1;
  display: flex;
  flex-direction: row;
  min-height: 0;
}

.layout-left,
.layout-right {
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
}

.layout-content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 1rem;
  background: #f9f9f9;
}

import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef
} from 'react';

const ResizableSidebar = forwardRef((props: ResizableSidebarProps, ref) => {
  const {
    id,
    position,
    minSize = 100,
    maxSize = 500,
    defaultSize = 250,
    collapsible = true,
    autoCollapseOnMobile = true,
    className = '',
    style = {},
    children
  } = props;

  const localKeySize = `${id}-size`;
  const localKeyCollapsed = `${id}-collapsed`;

  const [size, setSize] = useState(() => {
    const stored = localStorage.getItem(localKeySize);
    return stored ? parseInt(stored, 10) : defaultSize;
  });

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(localKeyCollapsed) === 'true';
  });

  const [resizing, setResizing] = useState(false);
  const startRef = useRef({ x: 0, y: 0, size: 0 });

  const isHorizontal = position === 'top' || position === 'bottom';

  const actualSize = collapsed ? 0 : size;

  const updateSize = (newSize: number) => {
    const clamped = Math.max(minSize, Math.min(maxSize, newSize));
    setSize(clamped);
    localStorage.setItem(localKeySize, clamped.toString());
  };

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(localKeyCollapsed, String(next));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      size
    };
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!resizing) return;

    const delta = isHorizontal ? e.clientY - startRef.current.y : e.clientX - startRef.current.x;
    let newSize = startRef.current.size;

    if (position === 'left' || position === 'top') {
      newSize += delta;
    } else {
      newSize -= delta;
    }

    updateSize(newSize);
  };

  const onMouseUp = () => setResizing(false);

  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [resizing]);

  useEffect(() => {
    if (autoCollapseOnMobile && window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, [autoCollapseOnMobile]);

  // ✅ Imperative API
  useImperativeHandle(ref, () => ({
    toggleCollapse,
    expand: () => setCollapsed(false),
    collapse: () => setCollapsed(true),
    setSize: (newSize: number) => updateSize(newSize)
  }));

  return (
    <div
      className={`resizable-sidebar ${position} ${collapsed ? 'collapsed' : ''} ${className}`}
      style={{
        ...style,
        [isHorizontal ? 'height' : 'width']: actualSize,
        transition: 'width 0.3s ease, height 0.3s ease'
      }}
    >
      {collapsible && (
        <button className={`collapse-button ${position}`} onClick={toggleCollapse}>
          {collapsed ? '▶' : '◀'}
        </button>
      )}
      <div className="sidebar-content">{children}</div>
      <div
        className={`resize-handle handle-${position}`}
        onMouseDown={onMouseDown}
      />
    </div>
  );
});

export default ResizableSidebar;
interface ResizableSidebarProps {
  id: string; // Unique ID for localStorage
  position: SidebarPosition;
  minSize?: number;
  maxSize?: number;
  defaultSize?: number;
  collapsible?: boolean;
  autoCollapseOnMobile?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

.resizable-sidebar {
  position: absolute;
  background-color: #f4f4f4;
  overflow: hidden;
  z-index: 100;
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
}

.sidebar-content {
  flex: 1;
  overflow: auto;
  padding: 8px;
}

/* Positioning */
.resizable-sidebar.left {
  top: 0;
  left: 0;
  bottom: 0;
}

.resizable-sidebar.right {
  top: 0;
  right: 0;
  bottom: 0;
}

.resizable-sidebar.top {
  top: 0;
  left: 0;
  right: 0;
}

.resizable-sidebar.bottom {
  bottom: 0;
  left: 0;
  right: 0;
}

/* Resize handles */
.resize-handle {
  position: absolute;
  background-color: transparent;
  z-index: 10;
}

.handle-left {
  right: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: ew-resize;
}

.handle-right {
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: ew-resize;
}

.handle-top {
  bottom: 0;
  left: 0;
  right: 0;
  height: 6px;
  cursor: ns-resize;
}

.handle-bottom {
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  cursor: ns-resize;
}

/* Collapse buttons */
.collapse-button {
  position: absolute;
  background: #ddd;
  border: none;
  padding: 4px;
  font-size: 12px;
  z-index: 15;
  cursor: pointer;
}

.collapse-button.left {
  right: 0;
  top: 10px;
}

.collapse-button.right {
  left: 0;
  top: 10px;
}

.collapse-button.top {
  bottom: 0;
  left: 10px;
}

.collapse-button.bottom {
  top: 0;
  left: 10px;
}

@media (max-width: 768px) {
  .resizable-sidebar.left,
  .resizable-sidebar.right {
    width: 100% !important;
  }

  .resizable-sidebar.top,
  .resizable-sidebar.bottom {
    height: 100% !important;
  }
}



import React from 'react';
import LayoutContainer from './components/LayoutContainer';
import ResizableSidebar from './components/ResizableSidebar';

function App() {
  return (
    <LayoutContainer
      leftSidebar={
        <ResizableSidebar
          id="left"
          position="left"
          defaultSize={220}
          minSize={160}
          collapsible
        >
          <div style={{ padding: 16 }}>Left Sidebar</div>
        </ResizableSidebar>
      }
      rightSidebar={
        <ResizableSidebar
          id="right"
          position="right"
          defaultSize={300}
          collapsible
        >
          <div style={{ padding: 16 }}>Right Sidebar</div>
        </ResizableSidebar>
      }
      topSidebar={
        <ResizableSidebar
          id="top"
          position="top"
          defaultSize={60}
          collapsible
        >
          <div style={{ padding: 10, textAlign: 'center' }}>Top Bar</div>
        </ResizableSidebar>
      }
      bottomSidebar={
        <ResizableSidebar
          id="bottom"
          position="bottom"
          defaultSize={60}
          collapsible
        >
          <div style={{ padding: 10, textAlign: 'center' }}>Bottom Bar</div>
        </ResizableSidebar>
      }
    >
      <div>
        <h1>Main Content</h1>
        <p>Scroll or resize to test layout flexibility.</p>
      </div>
    </LayoutContainer>
  );
}

export default App;


export { default as ResizableSidebar } from './components/ResizableSidebar';
export { default as LayoutContainer } from './components/LayoutContainer';
import './components/ResizableSidebar.css';
import './components/LayoutContainer.css';
