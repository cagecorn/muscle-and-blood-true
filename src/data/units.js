// 유닛들의 기본 정보를 정의하는 파일입니다.
export const UNITS = {
    WARRIOR: {
        // 사용할 스프라이트 키와 이미지 경로
        key: 'unit_warrior',
        name: '전사',
        image: 'assets/images/unit/warrior.png',

        // --- 기본 스탯 ---
        hp: 100,
        attack: 10,       // 물리 공격력
        defense: 5,       // 물리 방어력
        attackSpeed: 1000, // 1초에 한 번 공격
        speed: 200,        // 이동 속도
        range: 1,
        ability: 'melee'
    },

    GUNNER: {
        key: 'unit_gunner',
        name: '거너',
        image: 'assets/images/unit/gunner.png',

        hp: 80,
        attack: 12,
        defense: 3,
        attackSpeed: 800,
        speed: 220,
        range: 3,
        ability: 'ranged'
    },

    MEDIC: {
        key: 'unit_medic',
        name: '메딕',
        image: 'assets/images/unit/medic.png',

        hp: 70,
        attack: 5,
        defense: 4,
        attackSpeed: 900,
        speed: 210,
        range: 2,
        ability: 'heal'
    }
};
