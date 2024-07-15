import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';

const TaskForm: React.FC = () => {
    const [id, setId] = useState('');
    const [mode, setMode] = useState<'automatic' | 'manual'>('automatic');
    const [funcId, setFuncId] = useState('');
    const { addTask } = useWorkflow();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addTask(id, mode, funcId);
        setId('');
        setMode('automatic');
        setFuncId('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Task ID"
                required
            />
            <select value={mode} onChange={(e) => setMode(e.target.value as 'automatic' | 'manual')}>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
            </select>
            <input
                type="text"
                value={funcId}
                onChange={(e) => setFuncId(e.target.value)}
                placeholder="Function ID"
                required
            />
            <button type="submit">Add Task</button>
        </form>
    );
};

export default TaskForm;
