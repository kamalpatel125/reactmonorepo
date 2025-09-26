using Microsoft.ApplicationInsights.Channel;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.ApplicationInsights.Extensibility;
using System;
using System.Web;

public class SensitiveDataFilter : ITelemetryInitializer
{
    public void Initialize(ITelemetry telemetry)
    {
        if (telemetry is RequestTelemetry requestTelemetry && requestTelemetry.Url != null)
        {
            // Replace sensitive data in query strings
            var uriBuilder = new UriBuilder(requestTelemetry.Url);
            var query = HttpUtility.ParseQueryString(uriBuilder.Query);
            
            // Replace or remove sensitive parameters, e.g., "password"
            if (query["sensitiveParam"] != null)
            {
                query["sensitiveParam"] = "REDACTED";
            }
            
            uriBuilder.Query = query.ToString();
            requestTelemetry.Url = uriBuilder.Uri;
        }
    }
}

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddApplicationInsightsTelemetry();
        services.AddSingleton<ITelemetryInitializer, SensitiveDataFilter>();
    }
}


const activeRequests = new Map();

async function fetchWithCancellation(endpoint, options = {}) {
  // If there's already an active request for the endpoint, cancel it
  if (activeRequests.has(endpoint)) {
    activeRequests.get(endpoint).abortController.abort();
  }

  // Create a new AbortController for the new request
  const abortController = new AbortController();
  const signal = abortController.signal;

  // Store the new AbortController in the activeRequests Map
  activeRequests.set(endpoint, { abortController });

  try {
    // Make the fetch request
    const response = await fetch(endpoint, {
      ...options,
      signal,
    });

    // Remove the entry from the Map after a successful fetch
    activeRequests.delete(endpoint);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    // Parse the JSON response
    const data = await response.json();
    return data;

  } catch (error) {
    // Check if the error is due to an aborted request
    if (error.name === 'AbortError') {
      console.log(`Request to ${endpoint} was cancelled`);
    } else {
      console.error(`Fetch error: ${error.message}`);
    }

    // Clean up if there's an error
    activeRequests.delete(endpoint);
    throw error;
  }
}



async function decompressGzip(compressedData) {
    const compressedBuffer = Uint8Array.from(atob(compressedData), c => c.charCodeAt(0));
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(compressedBuffer);
            controller.close();
        }
    });

    const decompressionStream = new DecompressionStream("gzip");
    const decompressedStream = stream.pipeThrough(decompressionStream);
    const reader = decompressedStream.getReader();

    let result = '';
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
    }
    result += decoder.decode();

    return result;
}

// Usage
connection.on("ReceiveCompressedMessage", async (compressedData) => {
    const decompressedMessage = await decompressGzip(compressedData);
    console.log("Decompressed Message:", decompressedMessage);
});







import React, { useState, useEffect, useRef } from 'react';
import './Resizable.css';

type ResizeDirection =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

interface ResizableProps {
  children: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  className?: string;
  style?: React.CSSProperties;
}

const Resizable: React.FC<ResizableProps> = ({
  children,
  minWidth = 100,
  minHeight = 100,
  maxWidth = 1000,
  maxHeight = 1000,
  defaultWidth = 300,
  defaultHeight = 200,
  className = '',
  style = {}
}) => {
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState(false);
  const [direction, setDirection] = useState<ResizeDirection | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const onMouseDown = (e: React.MouseEvent, dir: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    setDirection(dir);
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    };

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({ x: rect.left, y: rect.top });
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!resizing || !direction) return;

    const deltaX = e.clientX - startRef.current.x;
    const deltaY = e.clientY - startRef.current.y;

    let newWidth = startRef.current.width;
    let newHeight = startRef.current.height;

    if (direction.includes('right')) {
      newWidth = Math.min(maxWidth, Math.max(minWidth, startRef.current.width + deltaX));
    }
    if (direction.includes('left')) {
      newWidth = Math.min(maxWidth, Math.max(minWidth, startRef.current.width - deltaX));
    }
    if (direction.includes('bottom')) {
      newHeight = Math.min(maxHeight, Math.max(minHeight, startRef.current.height + deltaY));
    }
    if (direction.includes('top')) {
      newHeight = Math.min(maxHeight, Math.max(minHeight, startRef.current.height - deltaY));
    }

    setSize({ width: newWidth, height: newHeight });
  };

  const onMouseUp = () => {
    setResizing(false);
    setDirection(null);
  };

  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [resizing, direction]);

  return (
    <div
      ref={containerRef}
      className={`resizable-container ${className}`}
      style={{
        ...style,
        width: size.width,
        height: size.height,
      }}
    >
      {children}

      {/* Resize handles */}
      {['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'].map((dir) => (
        <div
          key={dir}
          className={`resize-handle ${dir}`}
          onMouseDown={(e) => onMouseDown(e, dir as ResizeDirection)}
        />
      ))}
    </div>
  );
};

export default Resizable;


---------------

    .resizable-container {
  position: relative;
  display: inline-block;
  user-select: none;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

/* All 8 handles */
.resize-handle {
  position: absolute;
  background: transparent;
  z-index: 10;
}

.resize-handle.top {
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  cursor: ns-resize;
}

.resize-handle.right {
  top: 0;
  right: 0;
  bottom: 0;
  width: 6px;
  cursor: ew-resize;
}

.resize-handle.bottom {
  left: 0;
  bottom: 0;
  right: 0;
  height: 6px;
  cursor: ns-resize;
}

.resize-handle.left {
  top: 0;
  left: 0;
  bottom: 0;
  width: 6px;
  cursor: ew-resize;
}

.resize-handle.top-left {
  top: 0;
  left: 0;
  width: 10px;
  height: 10px;
  cursor: nwse-resize;
}

.resize-handle.top-right {
  top: 0;
  right: 0;
  width: 10px;
  height: 10px;
  cursor: nesw-resize;
}

.resize-handle.bottom-left {
  bottom: 0;
  left: 0;
  width: 10px;
  height: 10px;
  cursor: nesw-resize;
}

.resize-handle.bottom-right {
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  cursor: nwse-resize;
}







import React from 'react';
import Resizable from './components/Resizable';

const App = () => {
  return (
    <div style={{ padding: 50 }}>
      <Resizable defaultWidth={400} defaultHeight={250}>
        <div style={{ width: '100%', height: '100%', padding: 10 }}>
          <h3>Resizable from all sides</h3>
          <p>Try dragging any edge or corner.</p>
        </div>
      </Resizable>
    </div>
  );
};

export default App;



import React, { useState, useEffect } from "react";

export default function PriceTypeValueFilter(props: any) {
  const [type, setType] = useState<"all" | "stale" | "future">("all");
  const [priceQuery, setPriceQuery] = useState("");

  useEffect(() => {
    props.filterChangedCallback();
  }, [type, priceQuery]);

  // AG Grid lifecycle
  const isFilterActive = () => type !== "all" || priceQuery.trim() !== "";

  const doesFilterPass = (params: any) => {
    const { isStale, isFuture, price } = params.data;

    // --- filter by type ---
    if (type === "stale" && !isStale) return false;
    if (type === "future" && !isFuture) return false;

    // --- filter by numeric input ---
    if (priceQuery) {
      const match = priceQuery.match(/(>=|<=|>|<|=)?\s*(\d+(\.\d+)?)/);
      if (match) {
        const operator = match[1] || "=";
        const value = parseFloat(match[2]);

        switch (operator) {
          case ">": return price > value;
          case "<": return price < value;
          case ">=": return price >= value;
          case "<=": return price <= value;
          case "=": return price === value;
          default: return true;
        }
      }
    }

    return true;
  };

  const getModel = () => ({ type, priceQuery });
  const setModel = (model: any) => {
    if (model) {
      setType(model.type);
      setPriceQuery(model.priceQuery);
    }
  };

  return (
    <div style={{ padding: 8, width: 180 }}>
      <div style={{ marginBottom: 6 }}>
        <label>Type: </label>
        <select value={type} onChange={e => setType(e.target.value as any)}>
          <option value="all">All</option>
          <option value="stale">⚠️ Stale</option>
          <option value="future">⏳ Future</option>
        </select>
      </div>
      <div>
        <label>Price: </label>
        <input
          style={{ width: "100%" }}
          type="text"
          value={priceQuery}
          onChange={e => setPriceQuery(e.target.value)}
          placeholder="> 100"
        />
      </div>
    </div>
  );
}

// attach AG Grid filter API
(PriceTypeValueFilter as any).prototype.isFilterActive = function () { return false; };
(PriceTypeValueFilter as any).prototype.doesFilterPass = function () { return false; };
(PriceTypeValueFilter as any).prototype.getModel = function () { return null; };
(PriceTypeValueFilter as any).prototype.setModel = function () {};









// MySimpleSetFilter.tsx
import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  IFilterComp,
  IFilterParams,
  IDoesFilterPassParams,
} from "ag-grid-community";

const MySimpleSetFilter = forwardRef<IFilterComp, IFilterParams>((props, ref) => {
  const [allValues, setAllValues] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());

  // function to refresh values list
  const refreshValues = () => {
    const values = new Set<string>();
    props.api.forEachNodeAfterFilterAndSort((node) => {
      const v = props.valueGetter(node);
      if (v != null) values.add(String(v));
    });
    const unique = Array.from(values).sort();
    setAllValues(unique);

    // if selected values are empty (first load), select all
    if (selectedValues.size === 0) {
      setSelectedValues(new Set(unique));
    } else {
      // clean up removed values
      const stillValid = new Set(
        Array.from(selectedValues).filter((v) => unique.includes(v))
      );
      setSelectedValues(stillValid);
    }
  };

  // refresh on init + whenever other filters change
  useEffect(() => {
    refreshValues();
    props.api.addEventListener("filterChanged", refreshValues);
    return () => {
      props.api.removeEventListener("filterChanged", refreshValues);
    };
  }, []);

  const toggleSelectAll = (checked: boolean) => {
    setSelectedValues(checked ? new Set(allValues) : new Set());
    props.filterChangedCallback();
  };

  const toggleValue = (val: string, checked: boolean) => {
    const newSet = new Set(selectedValues);
    if (checked) newSet.add(val);
    else newSet.delete(val);
    setSelectedValues(newSet);
    props.filterChangedCallback();
  };

  useImperativeHandle(ref, () => ({
    isFilterActive() {
      return selectedValues.size !== allValues.length;
    },
    doesFilterPass(params: IDoesFilterPassParams) {
      const value = props.valueGetter(params.node);
      return selectedValues.has(String(value));
    },
    getModel() {
      return { values: Array.from(selectedValues) };
    },
    setModel(model: any) {
      if (model?.values) {
        setSelectedValues(new Set(model.values));
      } else {
        setSelectedValues(new Set(allValues));
      }
    },
  }));

  const allSelected = selectedValues.size === allValues.length;

  return (
    <div style={{ padding: 4 }}>
      {/* Select All */}
      <label style={{ display: "block", fontWeight: "bold" }}>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => toggleSelectAll(e.target.checked)}
        />
        Select All
      </label>

      {/* Values */}
      <div style={{ maxHeight: 150, overflowY: "auto" }}>
        {allValues.map((val) => (
          <label key={val} style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={selectedValues.has(val)}
              onChange={(e) => toggleValue(val, e.target.checked)}
            />
            {val}
          </label>
        ))}
      </div>
    </div>
  );
});

export default MySimpleSetFilter;




