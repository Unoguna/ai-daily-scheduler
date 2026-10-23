package com.be.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    //Common
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "잘못된 입력값입니다."),
    ENTITY_NOT_FOUND(HttpStatus.NOT_FOUND, "C002", "대상을 찾을 수 없습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C003", "서버 내부 오류가 발생했습니다."),

    //User
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "사용자를 찾을 수 없습니다."),
    INVALID_USER_NAME(HttpStatus.BAD_REQUEST, "U002", "이름은 비어 있을 수 없습니다."),

    //Auth
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "A001", "유효하지 않은 리프레시 토큰입니다."),
    REFRESH_TOKEN_NOT_FOUND(HttpStatus.NOT_FOUND, "A002", "리프레시 토큰이 존재하지 않습니다."),

    //DailyCondition
    INVALID_FATIGUE_LEVEL(HttpStatus.BAD_REQUEST, "DC001", "피로도는 1~5 범위여야 합니다."),
    INVALID_FOCUS_LEVEL(HttpStatus.BAD_REQUEST, "DC002", "집중도는 1~5 범위여야 합니다."),
    DAILY_CONDITION_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "DC003", "해당 날짜의 상태 정보가 이미 존재합니다."),
    DAILY_CONDITION_NOT_FOUND(HttpStatus.NOT_FOUND, "DC004", "오늘의 컨디션 정보가 존재하지 않습니다."),

    //Schedule
    INVALID_TIME_RANGE(HttpStatus.BAD_REQUEST, "S001", "시작 시간은 종료 시간보다 빨라야 합니다."),
    SCHEDULING_PROFILE_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "S002", "스케줄링 프로필이 이미 존재합니다."),
    SCHEDULING_PROFILE_NOT_FOUND(HttpStatus.NOT_FOUND, "S003", "프로필에서 스케줄링 프로필(기상·취침 시간, 집중·휴식 시간)을 먼저 저장해 주세요."),
    INVALID_SCHEDULE_CHANGE(HttpStatus.BAD_REQUEST, "S004", "변경안을 만들 수 없습니다. 대상 일정과 시간을 구체적으로 입력해 주세요."),
    SCHEDULE_CHANGE_CONFLICT(HttpStatus.CONFLICT, "S005", "변경 후 시간이 겹치거나 고정 일정과 충돌합니다. 다른 시간을 요청해 주세요."),
    SCHEDULE_CHANGE_PROTECTED(HttpStatus.BAD_REQUEST, "S006", "고정 일정과 완료한 일정은 대화로 변경할 수 없습니다."),
    STALE_SCHEDULE_CHANGE(HttpStatus.CONFLICT, "S007", "일정이 변경되었거나 변경안이 만료되었습니다. 새 변경안을 만들어 주세요."),
    SCHEDULE_AI_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "S008", "AI 변경안 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");


    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}
