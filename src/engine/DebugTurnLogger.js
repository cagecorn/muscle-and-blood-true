/**
 * 이 엔진은 앞으로 턴당 모든 게임의 연산을 개발자 콘솔 로그에 출력해주는 장치이다. 코덱스 나 자신이 후에 이 개발자 콘솔 로그의 로그 기록을 보며 스스로 게임의 오류를 잡아내기 위함이다.
 */
export class DebugTurnLogger {
    static _unitName(unit) {
        return unit?.label || unit?.name || 'Unknown';
    }

    static turnStart(turnNumber) {
        console.groupCollapsed(`--- Turn ${turnNumber} Start ---`);
    }

    static intent(unit, intent) {
        console.log(`[Intent] ${this._unitName(unit)}`, intent);
    }

    static action(action) {
        console.log(`[Action] ${this._unitName(action.unit)}`, action);
    }

    static result(unit, result) {
        console.log(`[Result] ${this._unitName(unit)}`, result);
    }

    static turnEnd(turnNumber) {
        console.groupEnd();
        console.log(`--- Turn ${turnNumber} End ---`);
    }
}
