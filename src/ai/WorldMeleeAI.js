import { Blackboard } from './Blackboard.js';
import { Sequence, ConditionNode, ActionNode } from './BehaviorTree.js';
import { VisionEngine } from '../engine/VisionEngine.js';
import { PathfindingEngine } from '../engine/PathfindingEngine.js';

export class WorldMeleeAI {
    constructor(owner, scene) {
        this.owner = owner;
        this.scene = scene;
        this.blackboard = new Blackboard();
        this.blackboard.set('self', owner);
        this.blackboard.set('scene', scene);

        this.tree = new Sequence([
            new ConditionNode(bb => {
                const self = bb.get('self');
                const player = bb.get('player');
                const start = self.getGridPosition();
                const end = player.getGridPosition();
                return VisionEngine.hasLineOfSight(scene.dungeonManager.tiles, start, end, 8);
            }),
            new ActionNode(bb => {
                const self = bb.get('self');
                const player = bb.get('player');
                const start = self.getGridPosition();
                const end = player.getGridPosition();
                const path = PathfindingEngine.findPath(scene.dungeonManager.tiles, start, end);
                if (path && path.length > 1) {
                    const next = path[1];
                    return { type: 'move', target: next };
                }
                return null;
            })
        ]);
    }

    decideAction(playerEntity) {
        this.blackboard.set('player', playerEntity);
        const result = this.tree.tick(this.blackboard);
        if (result && result.action) {
            return {
                type: 'move',
                unit: this.owner,
                targetPosition: result.action.target
            };
        }
        return null;
    }
}
