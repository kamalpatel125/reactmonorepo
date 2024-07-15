// src/components/LogDisplay.tsx
import React from 'react';
import { useWorkflow } from '../context/WorkflowContext';

const LogDisplay: React.FC = () => {
    const { logs } = useWorkflow();

    return (
        <div>
            <h3>Execution Logs</h3>
            <ul>
                {logs.map((log, index) => (
                    <li key={index}>
                        <strong>Task:</strong> {log.taskId} | <strong>Input:</strong> {JSON.stringify(log.input)} | <strong>Output:</strong> {JSON.stringify(log.output)} | <strong>Timestamp:</strong> {log.timestamp.toISOString()}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LogDisplay;
