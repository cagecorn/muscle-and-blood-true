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
        speed: 200        // 이동 속도
    }
};
