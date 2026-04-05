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
    DAILY_CONDITION_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "S001", "해당 날짜의 상태 정보가 이미 존재합니다."),
    SCHEDULING_PROFILE_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "S002", "스케줄링 프로필이 이미 존재합니다."),

    //Auth
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "A001", "유효하지 않은 리프레시 토큰입니다."),
    REFRESH_TOKEN_NOT_FOUND(HttpStatus.NOT_FOUND, "A002", "리프레시 토큰이 존재하지 않습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}