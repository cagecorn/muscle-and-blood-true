import { Unit } from '../game/Unit.js';
import { SizingManager } from './SizingManager.js';

export class PartyEngine {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Create a party of units.
     * @param {Array<Object>} unitDatas Array of unit data objects from UNITS.
     * @param {{x:number, y:number}} start Starting grid position of the leader.
     * @param {{label?: string}} options Additional options.
     * @returns {Array<Unit>} The created units.
     */
    createParty(unitDatas, start, options = {}) {
        const { label = '' } = options;
        const rowSpacing = 2;
        const formation = [
            { x: 0, y: 0 },
            { x: -1, y: rowSpacing },
            { x: 1, y: rowSpacing },
            { x: -2, y: rowSpacing * 2 },
            { x: 2, y: rowSpacing * 2 }
        ];

        return unitDatas.map((data, index) => {
            const offset = { ...(formation[index] || { x: index, y: 0 }) };
            if (label === '적') {
                offset.x = -offset.x; // Mirror formation horizontally for enemies
            }
            const gridX = start.x + offset.x;
            const gridY = start.y + offset.y;
            const name = label ? `${label} ${data.name}` : data.name;
            const scale = index === 0
                ? SizingManager.WORLD_LEADER_SCALE
                : SizingManager.WORLD_UNIT_SCALE;
            const unit = new Unit(this.scene, gridX, gridY, data, name, { scale });
            if (label === '적') {
                unit.setFlipX(true); // Face left towards the player
            }
            return unit;
        });
    }
}

