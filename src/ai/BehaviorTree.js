export const NodeStatus = {
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE',
    RUNNING: 'RUNNING'
};

class BTNode {
    tick(blackboard) {
        return { status: NodeStatus.SUCCESS };
    }
}

export class Sequence extends BTNode {
    constructor(children) {
        super();
        this.children = children;
    }

    tick(bb) {
        let action = null;
        for (const child of this.children) {
            const result = child.tick(bb);
            if (result.status !== NodeStatus.SUCCESS) {
                return result;
            }
            if (result.action) {
                action = result.action;
            }
        }
        return { status: NodeStatus.SUCCESS, action };
    }
}

export class ConditionNode extends BTNode {
    constructor(fn) {
        super();
        this.fn = fn;
    }

    tick(bb) {
        return this.fn(bb)
            ? { status: NodeStatus.SUCCESS }
            : { status: NodeStatus.FAILURE };
    }
}

export class ActionNode extends BTNode {
    constructor(fn) {
        super();
        this.fn = fn;
    }

    tick(bb) {
        const action = this.fn(bb);
        if (action) {
            return { status: NodeStatus.SUCCESS, action };
        }
        return { status: NodeStatus.FAILURE };
    }
}
