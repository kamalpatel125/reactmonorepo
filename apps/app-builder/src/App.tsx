// src/App.tsx
import React from 'react';
import { WorkflowProvider } from './context/WorkflowContext';
import TaskForm from './components/TaskForm';
import DependencyForm from './components/DependencyForm';
import WorkflowDisplay from './components/WorkflowDisplay';
import ExecuteWorkflow from './components/ExecuteWorkflow';
import ManualTaskHandler from './components/ManualTaskHandler';
import LogDisplay from './components/LogDisplay';

const App: React.FC = () => {
    return (
        <WorkflowProvider>
            <div style={{ padding: '20px' }}>
                <h1>Create Workflow</h1>
                <TaskForm />
                <DependencyForm />
                <WorkflowDisplay />
                <ExecuteWorkflow />
                <ManualTaskHandler />
                <LogDisplay />
            </div>
        </WorkflowProvider>
    );
};

export default App;
