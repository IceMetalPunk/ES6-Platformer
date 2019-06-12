import { AIWalkLedgeBounce } from "./ai";

let globalLevel = 0;
class Entity {
    constructor(x = 0, y = 0) {
        this.pos = [x,y];
        this.aiTasks = [];
        this.level = globalLevel;
    }
    addAITask(newTask, priority = -1) {
        const existing = this.aiTasks.find(entry => {
            if (entry.task.constructor === newTask.constructor) {
                return true;
            }
            return false;
        });
        if (existing) {
            return existing.task;
        }
        else {
            newTask.initialize(this);
            const priorityCount = this.aiTasks.reduce((count, entry) => count + Number(entry.priority === priority), 0);
            this.aiTasks.push({task: newTask, priority: priority, insertionIndex: priorityCount});;
            this.aiTasks.sort((a,b) => {
                if (a.priority < b.priority) { return -1; }
                else if (b.priority < a.priority) { return 1; }
                return Math.sign(a.insertionIndex - b.insertionIndex);
            });
            return newTask;
        }
    }

    removeAITask(task) {
        this.aiTasks = this.aiTasks.filter(entry => entry.task.constructor !== task.constructor);
    }

    update() {
        for (let entry of this.aiTasks) {
            if (lastPrio === null || entry.priority === lastPrio || entry.priority === -1) {
                if (entry.task.canRun()) {
                    lastPrio = entry.priority;
                    entry.task.run();
                }
            } else if (lastPrio !== null) {
                break;
            }
        };
    }
};

class BasicEnemy extends Entity {
    constructor(x, y) {
        super(x,y);
        this.addAITask(new AIWalkLedgeBounce(), -1);
    }
}

export const Entities = {
    setLevel: level => globalLevel = level,
    BasicEnemy
};