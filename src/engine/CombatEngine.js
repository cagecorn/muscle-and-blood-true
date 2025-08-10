// 전투와 관련된 모든 계산을 담당하는 엔진입니다.
export class CombatEngine {
    /**
     * 기본 데미지를 계산합니다.
     * @param {object} attacker - 공격하는 유닛의 스탯
     * @param {object} defender - 방어하는 유닛의 스탯
     * @returns {number} 최종 데미지
     */
    static calculateDamage(attacker, defender) {
        // 데미지 공식: 공격력 - 방어력
        const damage = attacker.attack - defender.defense;

        // 최소 데미지는 1로 보정
        return Math.max(1, damage);
    }
}

