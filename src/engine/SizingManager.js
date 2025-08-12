// 게임의 모든 크기 및 비율 관련 상수를 정의하는 매니저
export const SizingManager = {
    // 그리드 설정
    GRID_WIDTH: 16,      // 그리드의 가로 타일 수
    GRID_HEIGHT: 9,      // 그리드의 세로 타일 수
    TILE_SIZE: 64,       // 각 타일의 한 변 크기 (픽셀)

    // UI 및 기타 요소
    NAMEPLATE_FONT_SIZE: 32, // 이름표 폰트 크기 (고해상도 기준)
    NAMEPLATE_Y_OFFSET: -55, // 유닛 머리로부터 이름표가 떨어질 거리
    
    HEALTHBAR_WIDTH: 50,     // 체력바 너비
    HEALTHBAR_HEIGHT: 8,      // 체력바 높이
    HEALTHBAR_Y_OFFSET: -40   // 유닛 머리로부터 체력바가 떨어질 거리
};
