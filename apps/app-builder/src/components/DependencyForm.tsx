import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';

const DependencyForm: React.FC = () => {
    const { tasks, addDependency } = useWorkflow();
    const [taskId, setTaskId] = useState('');
    const [dependencyId, setDependencyId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addDependency(taskId, dependencyId);
        setTaskId('');
        setDependencyId('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <select value={taskId} onChange={(e) => setTaskId(e.target.value)} required>
                <option value="" disabled>Select Task</option>
                {tasks.map((task) => (
                    <option key={task.id} value={task.id}>{task.id}</option>
                ))}
            </select>
            <select value={dependencyId} onChange={(e) => setDependencyId(e.target.value)} required>
                <option value="" disabled>Select Dependency</option>
                {tasks.map((task) => (
                    <option key={task.id} value={task.id}>{task.id}</option>
                ))}
            </select>
            <button type="submit">Add Dependency</button>
        </form>
    );
};

export default DependencyForm;
