// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Task, DAG } from './workflow';

const App: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [currentManualTask, setCurrentManualTask] = useState<Task | null>(null);

    const log = (message: string) => {
        setLogs(prevLogs => [...prevLogs, message]);
    };

    const runWorkflow = async () => {
        const taskA = new Task('A', 'automatic', async () => {
            log('Executing Task A');
            return 'Output of Task A';
        });

        const taskB = new Task('B', 'automatic', async (input) => {
            log(`Executing Task B with input: ${input}`);
            return `Output of Task B derived from ${input}`;
        });

        const taskC = new Task('C', 'manual', async (input) => {
            log(`Executing Task C with input: ${input}`);
            return `Output of Task C derived from ${input}`;
        });

        const taskD = new Task('D', 'automatic', async (input) => {
            log(`Executing Task D with input: ${input}`);
            return `Output of Task D derived from ${input}`;
        });

        const taskE = new Task('E', 'manual', async (input) => {
          log(`Executing Task E with input: ${input}`);
          return `Output of Task E derived from ${input}`;
      });

      const taskF = new Task('F', 'automatic', async (input) => {
        log(`Executing Task F with input: ${input}`);
        return `Output of Task F derived from ${input}`;
    });

        const dag = new DAG();

        // Workflow Task (Steps)
        dag.addTask(taskA);
        dag.addTask(taskB);
        dag.addTask(taskC);
        dag.addTask(taskD);
        dag.addTask(taskE);
        dag.addTask(taskF);

        // Workflow Task Dependencies 
        dag.addDependency('B', 'A'); // B depends on A - Automatic
        dag.addDependency('C', 'A'); // C depends on A - Manual
        dag.addDependency('D', 'B'); // D depends on B - Automatic
        dag.addDependency('D', 'C'); // D depends on C - Automatic
        dag.addDependency('E', 'D'); // E depends on D - Manual
        dag.addDependency('F', 'E'); // F depends on E - Automatic
        /* Workflow Steps
                  A
                  | 
                B - C M)
                  |
                  D
                  |
                  E (M)
                  |
                  F
        */
        try {
            await dag.execute(async (task) => {
                setCurrentManualTask(task);
                await new Promise(resolve => setCurrentManualTask(prev => {
                    if (prev !== null) {
                        return { ...prev, resolve };
                    }
                    return prev;
                }));
            });
            log('All tasks executed successfully');
        } catch (err: any) {
            log(`Error: ${err.message}`);
        }
    };

    const handleManualTask = () => {
        if (currentManualTask && currentManualTask?.resolve) {
            currentManualTask.resolve();
            setCurrentManualTask(null);
        }
    };

    useEffect(() => {
        runWorkflow(); // Execute the workflow on component mount
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>DAG Workflow Example</h1>
            <div>
                <h2>Logs:</h2>
                <ul>
                    {logs.map((log, index) => (
                        <li key={index}>{log}</li>
                    ))}
                </ul>
            </div>
            {currentManualTask && (
                <div>
                    <h2>Manual Task: {currentManualTask.id}</h2>
                    <button onClick={handleManualTask}>Run {currentManualTask.id}</button>
                </div>
            )}
        </div>
    );
};

export default App;
