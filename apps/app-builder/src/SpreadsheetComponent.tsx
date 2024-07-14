import React, { useState } from 'react';
import DAG from './Calculator';

const dag = new DAG();

interface Cell {
  id: string;
  value: string;
}

const SpreadsheetComponent: React.FC = () => {
  const [cells, setCells] = useState<Cell[]>([
    { id: 'A1', value: '' },
    { id: 'A2', value: '' },
    { id: 'B1', value: '' },
    { id: 'B2', value: '' },
  ]);

  const handleChange = (id: string, value: string) => {
    const formulaPattern = /^=[A-Za-z]+\d+(\s*[\+\-\*\/]\s*[A-Za-z]+\d+)*$/;
    if (formulaPattern.test(value)) {
      dag.setFormula(id, value.slice(1));
    } else {
      dag.setFormula(id, value);
    }

    const newCells = cells.map(cell => ({
      ...cell,
      value: dag.getValue(cell.id),
    }));

    setCells(newCells);
  };

  return (
    <div>
      <h1>Spreadsheet with Addition Calculator</h1>
      <table>
        <thead><tr><th>A</th><th>B</th></tr></thead>
        <tbody>
          {['A', 'B'].map((col) => (
            <tr key={col}>
              {[1, 2].map((row) => {
                const cellId = `${col}${row}`;
                const cell = cells.find(c => c.id === cellId)!;
                return (
                  <td key={cellId}>
                    <input
                      type="text"
                      value={cell.value}
                      onChange={e => handleChange(cellId, e.target.value)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SpreadsheetComponent;
