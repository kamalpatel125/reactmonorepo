// src/components/ManualTaskHandler.tsx
import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';

const ManualTaskHandler: React.FC = () => {
    const { currentManualTask, completeManualTask } = useWorkflow();
    const [output, setOutput] = useState('');

    if (!currentManualTask) return null;

    const handleSubmit = () => {
        completeManualTask(output);
        setOutput('');
    };

    return (
        <div>
            <h3>Manual Task: {currentManualTask.id}</h3>
            <input
                type="text"
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                placeholder="Enter output"
            />
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
};

export default ManualTaskHandler;
