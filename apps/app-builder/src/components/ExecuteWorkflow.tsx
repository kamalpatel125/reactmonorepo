// src/components/ExecuteWorkflow.tsx
import React from 'react';
import { useWorkflow } from '../context/WorkflowContext';

const ExecuteWorkflow: React.FC = () => {
    const { executeWorkflow } = useWorkflow();

    return (
        <button onClick={executeWorkflow}>Execute Workflow</button>
    );
};

export default ExecuteWorkflow;
