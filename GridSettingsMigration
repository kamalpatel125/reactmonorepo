export interface ColDefLite {
  field?: string;
  colId?: string;
  children?: ColDefLite[];
}

export interface AgGridState {
  filterModel?: Record<string, any>;
  columnState?: Array<{ colId: string; [key: string]: any }>;
  version?: string;
}

export interface MigrationOptions {
  enableLogging?: boolean;
  currentVersion?: string; // e.g. "v3"
  assumeLegacyAutoIds?: boolean; // assume old col_0, col_1 pattern
}

/**
 * Ultimate ag-Grid state migration utility
 * - Uses old columnState for full mapping (not just filterModel)
 * - Handles grouped columns and missing old defs
 * - Automatically skips migration if unnecessary
 * - Supports optional versioning
 */
export function migrateAgGridStateUltimate(
  oldState: AgGridState,
  newDefs: ColDefLite[],
  options: MigrationOptions = {}
): AgGridState {
  const { enableLogging = false, currentVersion, assumeLegacyAutoIds = true } = options;

  // 🧱 1️⃣ Flatten newDefs (recursively handles groups)
  const flattenDefs = (defs: ColDefLite[]): ColDefLite[] => {
    const flat: ColDefLite[] = [];
    for (const d of defs) {
      if (d.children?.length) flat.push(...flattenDefs(d.children));
      else flat.push(d);
    }
    return flat;
  };
  const newFlatDefs = flattenDefs(newDefs);
  const newIds = newFlatDefs.map(d => d.colId ?? d.field ?? '');

  // 🧩 2️⃣ Build mapping from old columnState
  const oldIds = (oldState.columnState ?? []).map(c => c.colId);
  const idMap: Record<string, string> = {};

  let autoCounter = 0;

  for (let i = 0; i < oldIds.length; i++) {
    const oldId = oldIds[i];

    // If already matches new colId, retain
    if (newIds.includes(oldId)) {
      idMap[oldId] = oldId;
      continue;
    }

    // Try to match legacy auto IDs like col_0, col_1 by order
    if (assumeLegacyAutoIds && oldId.startsWith('col_') && newFlatDefs[autoCounter]) {
      idMap[oldId] = newFlatDefs[autoCounter].colId ?? newFlatDefs[autoCounter].field ?? oldId;
      autoCounter++;
      continue;
    }

    // Fallback: try fuzzy match (by field or prefix match)
    const byField = newFlatDefs.find(d => d.field === oldId);
    if (byField) {
      idMap[oldId] = byField.colId ?? byField.field!;
      continue;
    }

    // If no match found, drop
    if (enableLogging) console.warn(`⚠️ Could not map old columnId "${oldId}"`);
  }

  // 🧠 3️⃣ Detect if migration actually needed
  const oldIdSet = new Set(oldIds);
  const newIdSet = new Set(newIds);
  const needsMigration =
    currentVersion && oldState.version && oldState.version !== currentVersion
      ? true
      : [...oldIdSet].some(id => !newIdSet.has(id)) ||
        [...newIdSet].some(id => !oldIdSet.has(id));

  if (!needsMigration) {
    if (enableLogging) console.info('✅ Migration skipped (schema unchanged).');
    return oldState;
  }

  if (enableLogging) console.info('⚙️ Performing ag-Grid state migration...');

  // 🧮 4️⃣ Migrate filterModel
  const newFilterModel: Record<string, any> = {};
  if (oldState.filterModel) {
    for (const [oldKey, val] of Object.entries(oldState.filterModel)) {
      const newKey = idMap[oldKey];
      if (newKey && newIdSet.has(newKey)) {
        newFilterModel[newKey] = val;
      } else if (enableLogging) {
        console.warn(`⚠️ Dropping filter for "${oldKey}" (unmapped)`);
      }
    }
  }

  // 📊 5️⃣ Migrate columnState
  const newColumnState = oldState.columnState
    ? oldState.columnState
        .map(c => {
          const newId = idMap[c.colId] ?? c.colId;
          return { ...c, colId: newId };
        })
        .filter(c => newIdSet.has(c.colId))
    : undefined;

  if (enableLogging) {
    console.info(
      `✅ Migration complete: ${Object.keys(idMap).length} mapped, ${newColumnState?.length ?? 0} columns preserved.`
    );
  }

  return {
    ...oldState,
    version: currentVersion ?? oldState.version,
    filterModel: newFilterModel,
    columnState: newColumnState
  };
}


=======
import { migrateAgGridStateUltimate } from './migrateAgGridStateUltimate';

// Old saved state (with columnState for all columns)
const savedState = {
  version: 'v1',
  filterModel: {
    col_0: { type: 'contains', filter: 'AAPL' },
    col_1: { type: 'greaterThan', filter: 100 }
  },
  columnState: [
    { colId: 'col_0', sort: 'asc', width: 140 },
    { colId: 'name', hide: false },
    { colId: 'col_1', hide: true }
  ]
};

// New columnDefs (schema evolved + grouped)
const newDefs = [
  {
    headerName: 'Stock Info',
    children: [
      { colId: 'ticker', valueGetter: p => p.data.symbol },
      { colId: 'name', valueGetter: p => p.data.company }
    ]
  },
  {
    headerName: 'Trading',
    children: [{ colId: 'price', valueGetter: p => p.data.lastPrice }]
  }
];

// 🧠 Run migration
const migrated = migrateAgGridStateUltimate(savedState, newDefs, {
  enableLogging: true,
  currentVersion: 'v2'
});

// Apply
gridApi.setColumnState(migrated.columnState!);
gridApi.setFilterModel(migrated.filterModel!);

=========

// gridStateManager.ts
import { migrateAgGridStateUltimate } from './migrateAgGridStateUltimate';

export interface GridStateManagerOptions {
  gridId: string; // unique key for localStorage
  version: string; // schema version
  newDefs: any[];
  gridApi: any;
  enableLogging?: boolean;
}

export class GridStateManager {
  private readonly key: string;
  private readonly version: string;
  private readonly newDefs: any[];
  private readonly gridApi: any;
  private readonly enableLogging: boolean;

  constructor(opts: GridStateManagerOptions) {
    this.key = `aggrid-state-${opts.gridId}`;
    this.version = opts.version;
    this.newDefs = opts.newDefs;
    this.gridApi = opts.gridApi;
    this.enableLogging = !!opts.enableLogging;
  }

  loadAndApply() {
    const raw = localStorage.getItem(this.key);
    if (!raw) return;

    try {
      const saved = JSON.parse(raw);
      const migrated = migrateAgGridStateUltimate(saved, this.newDefs, {
        currentVersion: this.version,
        enableLogging: this.enableLogging
      });

      if (migrated.columnState) {
        this.gridApi.applyColumnState({ state: migrated.columnState, applyOrder: true });
      }
      if (migrated.filterModel) {
        this.gridApi.setFilterModel(migrated.filterModel);
      }

      if (this.enableLogging) console.info(`✅ Applied migrated state for ${this.key}`);
    } catch (err) {
      console.error(`❌ Failed to load grid state (${this.key})`, err);
    }
  }

  save() {
    try {
      const state = {
        version: this.version,
        filterModel: this.gridApi.getFilterModel(),
        columnState: this.gridApi.getColumnState()
      };
      localStorage.setItem(this.key, JSON.stringify(state));
      if (this.enableLogging) console.info(`💾 Saved state for ${this.key}`);
    } catch (err) {
      console.error(`❌ Failed to save grid state (${this.key})`, err);
    }
  }

  bindAutoSave() {
    const api = this.gridApi;
    const saveFn = this.save.bind(this);
    api.addEventListener('columnMoved', saveFn);
    api.addEventListener('columnVisible', saveFn);
    api.addEventListener('columnPinned', saveFn);
    api.addEventListener('sortChanged', saveFn);
    api.addEventListener('filterChanged', saveFn);
    api.addEventListener('columnResized', saveFn);
  }
}


=======
// MyAgGrid.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { GridStateManager } from './gridStateManager';

export function MyAgGrid() {
  const gridApiRef = useRef<any>(null);

  const columnDefs = [
    { colId: 'ticker', headerName: 'Ticker', valueGetter: p => p.data.symbol },
    { colId: 'name', headerName: 'Name', valueGetter: p => p.data.company },
    { colId: 'price', headerName: 'Price', valueGetter: p => p.data.price }
  ];

  const onGridReady = useCallback((params: any) => {
    gridApiRef.current = params.api;

    const manager = new GridStateManager({
      gridId: 'portfolio-grid',
      version: 'v2',
      newDefs: columnDefs,
      gridApi: params.api,
      enableLogging: true
    });

    manager.loadAndApply();   // 🧠 Load + migrate automatically
    manager.bindAutoSave();   // 💾 Auto-save on user actions
  }, []);

  return (
    <div className="ag-theme-quartz" style={{ height: 600 }}>
      <AgGridReact
        onGridReady={onGridReady}
        columnDefs={columnDefs}
        rowData={[
          { symbol: 'AAPL', company: 'Apple', price: 192.5 },
          { symbol: 'MSFT', company: 'Microsoft', price: 379.2 }
        ]}
      />
    </div>
  );
}
======
// each grid gets a unique ID + version
const portfolioGrid = new GridStateManager({
  gridId: 'portfolio',
  version: 'v3',
  gridApi,
  newDefs: portfolioColumnDefs
});

const ordersGrid = new GridStateManager({
  gridId: 'orders',
  version: 'v1',
  gridApi,
  newDefs: ordersColumnDefs
});

