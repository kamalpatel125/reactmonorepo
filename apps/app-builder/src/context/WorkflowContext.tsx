// src/context/WorkflowContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';

interface Task {
    id: string;
    mode: 'automatic' | 'manual';
    funcId: string;
}

interface Dependency {
    taskId: string;
    dependencyId: string;
}

interface LogEntry {
    taskId: string;
    input: any;
    output: any;
    timestamp: Date;
}

interface WorkflowContextProps {
    tasks: Task[];
    dependencies: Dependency[];
    currentManualTask: Task | null;
    logs: LogEntry[];
    addTask: (id: string, mode: 'automatic' | 'manual', funcId: string) => void;
    addDependency: (taskId: string, dependencyId: string) => void;
    saveWorkflow: () => void;
    loadWorkflow: () => void;
    executeWorkflow: () => void;
    completeManualTask: (output: any) => void;
}

const WorkflowContext = createContext<WorkflowContextProps | undefined>(undefined);

export const useWorkflow = () => {
    const context = useContext(WorkflowContext);
    if (!context) {
        throw new Error('useWorkflow must be used within a WorkflowProvider');
    }
    return context;
};

const taskFunctions = {
    taskA: async (input: any) => {
        console.log('Executing Task A');
        return 'Output of Task A';
    },
    taskB: async (input: any) => {
        console.log(`Executing Task B with input: ${input}`);
        return `Output of Task B derived from ${input}`;
    },
    taskC: async (input: any) => {
        console.log(`Executing Task C with input: ${input}`);
        return `Output of Task C derived from ${input}`;
    },
    taskD: async (input: any) => {
        console.log(`Executing Task D with input: ${input}`);
        return `Output of Task D derived from ${input}`;
    }
};

class Task {
    constructor(public id: string, public mode: 'automatic' | 'manual', public funcId: string) {}

    async execute(input: any) {
        if (taskFunctions[this.funcId]) {
            return await taskFunctions[this.funcId](input);
        } else {
            throw new Error(`Function ${this.funcId} not found`);
        }
    }
}

class DAG {
    tasks: Map<string, Task>;
    edges: Map<string, string[]>;
    currentTaskId: string | null;
    results: Map<string, any>;
    visited: Set<string>;
    onManualTask: (task: Task) => Promise<void>;
    log: (entry: LogEntry) => void;

    constructor(onManualTask: (task: Task) => Promise<void>, log: (entry: LogEntry) => void) {
        this.tasks = new Map();
        this.edges = new Map();
        this.currentTaskId = null;
        this.results = new Map();
        this.visited = new Set();
        this.onManualTask = onManualTask;
        this.log = log;
    }

    addTask(task: Task) {
        this.tasks.set(task.id, task);
        if (!this.edges.has(task.id)) {
            this.edges.set(task.id, []);
        }
    }

    addDependency(taskId: string, dependencyId: string) {
        if (!this.tasks.has(taskId) || !this.tasks.has(dependencyId)) {
            throw new Error("Task or dependency not found");
        }
        this.edges.get(taskId)?.push(dependencyId);
    }

    async execute() {
        const visit = async (taskId: string) => {
            if (this.visited.has(taskId)) return;
            if (this.currentTaskId) throw new Error("Manual task pending");

            const dependencies = this.edges.get(taskId) || [];
            for (const depId of dependencies) {
                await visit(depId);
            }

            const task = this.tasks.get(taskId);
            if (task) {
                const inputs = dependencies.map(depId => this.results.get(depId));
                const input = inputs.length > 1 ? inputs : inputs[0];

                if (task.mode === 'manual') {
                    this.currentTaskId = taskId;
                    await this.onManualTask(task);
                    return;
                }

                const output = await task.execute(input);
                this.results.set(taskId, output);

                this.log({ taskId: task.id, input, output, timestamp: new Date() });
            }

            this.visited.add(taskId);
        };

        for (const taskId of this.tasks.keys()) {
            await visit(taskId);
        }

        alert('Workflow execution completed!');
    }

    async completeManualTask(output: any) {
        if (!this.currentTaskId) return;
        this.results.set(this.currentTaskId, output);
        this.log({ taskId: this.currentTaskId, input: null, output, timestamp: new Date() });
        this.visited.add(this.currentTaskId);
        this.currentTaskId = null;
        await this.execute();
    }
}

export const WorkflowProvider: React.FC = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [dependencies, setDependencies] = useState<Dependency[]>([]);
    const [currentManualTask, setCurrentManualTask] = useState<Task | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [dag, setDag] = useState<DAG | null>(null);

    useEffect(() => {
        loadWorkflow();
    }, []);

    const addTask = (id: string, mode: 'automatic' | 'manual', funcId: string) => {
        setTasks([...tasks, { id, mode, funcId }]);
    };

    const addDependency = (taskId: string, dependencyId: string) => {
        setDependencies([...dependencies, { taskId, dependencyId }]);
    };

    const saveWorkflow = () => {
        const workflow = { tasks, dependencies };
        localStorage.setItem('workflow', JSON.stringify(workflow));
        alert('Workflow saved!');
    };

    const loadWorkflow = () => {
        const savedWorkflow = localStorage.getItem('workflow');
        if (savedWorkflow) {
            const { tasks, dependencies } = JSON.parse(savedWorkflow);
            setTasks(tasks);
            setDependencies(dependencies);
        }
    };

    const executeWorkflow = async () => {
        const newDag = new DAG(
            async (task: Task) => {
                setCurrentManualTask(task);
            },
            (entry: LogEntry) => {
                setLogs(prevLogs => [...prevLogs, entry]);
            }
        );

        tasks.forEach(task => newDag.addTask(new Task(task.id, task.mode, task.funcId)));
        dependencies.forEach(dep => newDag.addDependency(dep.taskId, dep.dependencyId));

        setDag(newDag);

        try {
            await newDag.execute();
        } catch (error) {
            alert(error.message);
        }
    };

    const completeManualTask = async (output: any) => {
        if (!dag) return;
        await dag.completeManualTask(output);
        setCurrentManualTask(null);
    };

    return (
        <WorkflowContext.Provider value={{ tasks, dependencies, currentManualTask, logs, addTask, addDependency, saveWorkflow, loadWorkflow, executeWorkflow, completeManualTask }}>
            {children}
        </WorkflowContext.Provider>
    );
};
