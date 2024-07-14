// src/workflow.ts
export type TaskMode = 'automatic' | 'manual';

export class Task {
    id: string;
    execute: (input?: any) => Promise<any>;
    mode: TaskMode;
    resolve?: Function;

    constructor(id: string, mode: TaskMode, execute: (input?: any) => Promise<any>, resolve?: Function) {
        this.id = id;
        this.execute = execute;
        this.mode = mode;
        this.resolve = resolve;
    }
}

export class DAG {
    tasks: Map<string, Task>;
    edges: Map<string, string[]>;

    constructor() {
        this.tasks = new Map();
        this.edges = new Map();
    }

    addTask(task: Task): void {
        this.tasks.set(task.id, task);
        if (!this.edges.has(task.id)) {
            this.edges.set(task.id, []);
        }
    }

    addDependency(taskId: string, dependencyId: string): void {
        if (!this.tasks.has(taskId) || !this.tasks.has(dependencyId)) {
            throw new Error("Task or dependency not found");
        }
        this.edges.get(taskId)?.push(dependencyId);
    }

    async execute(onManualTask: (task: Task) => Promise<void>): Promise<void> {
        const visited = new Set<string>();
        const results = new Map<string, any>();

        const visit = async (taskId: string): Promise<void> => {
            if (visited.has(taskId)) return;

            const dependencies = this.edges.get(taskId) || [];
            for (const depId of dependencies) {
                await visit(depId);
            }

            const task = this.tasks.get(taskId);
            if (task) {
                const inputs = dependencies.map(depId => results.get(depId));
                const input = inputs.length > 1 ? inputs : inputs[0];

                if (task.mode === 'manual') {
                    await onManualTask(task);
                }

                const output = await task.execute(input);
                results.set(taskId, output);
            }

            visited.add(taskId);
        };

        for (const taskId of this.tasks.keys()) {
            await visit(taskId);
        }
    }
}
