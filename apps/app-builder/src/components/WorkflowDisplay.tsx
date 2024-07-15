import React from 'react';
import { useWorkflow } from '../context/WorkflowContext';

const WorkflowDisplay: React.FC = () => {
    const { tasks, dependencies, saveWorkflow, loadWorkflow } = useWorkflow();

    return (
        <div>
            <button onClick={saveWorkflow}>Save Workflow</button>
            <button onClick={loadWorkflow}>Load Workflow</button>
            <div>
                <h2>Tasks</h2>
                <ul>
                    {tasks.map((task) => (
                        <li key={task.id}>{task.id} ({task.mode}) - Function: {task.funcId}</li>
                    ))}
                </ul>
                <h2>Dependencies</h2>
                <ul>
                    {dependencies.map((dep, index) => (
                        <li key={index}>{dep.taskId} depends on {dep.dependencyId}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default WorkflowDisplay;
