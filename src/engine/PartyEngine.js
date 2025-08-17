import { Unit } from '../game/Unit.js';

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
        const formation = [
            { x: 0, y: 0 },
            { x: -1, y: 1 },
            { x: 1, y: 1 },
            { x: -2, y: 2 },
            { x: 2, y: 2 }
        ];

        return unitDatas.map((data, index) => {
            const offset = { ...(formation[index] || { x: index, y: 0 }) };
            if (label === '적') {
                offset.x = -offset.x; // Mirror formation horizontally for enemies
            }
            const gridX = start.x + offset.x;
            const gridY = start.y + offset.y;
            const name = label ? `${label} ${data.name}` : data.name;
            const unit = new Unit(this.scene, gridX, gridY, data, name);
            if (label === '적') {
                unit.setFlipX(true); // Face left towards the player
            }
            return unit;
        });
    }
}

