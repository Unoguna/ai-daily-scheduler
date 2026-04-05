package com.be.global.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.util.Map;

@Getter
@Schema(description = "공통 응답 형식")
public class CommonResponse<T> {

    @Schema(description = "성공 여부", example = "true")
    private final boolean success;

    @Schema(description = "응답 데이터")
    private final T data;

    @Schema(description = "응답 메시지", example = "요청 성공")
    private final String message;

    @Schema(description = "에러 상세 정보")
    private final Map<String, String> errors;

    private CommonResponse(boolean success, T data, String message, Map<String, String> errors) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.errors = errors;
    }

    public static <T> CommonResponse<T> success(T data) {
        return new CommonResponse<>(true, data, "요청 성공", null);
    }

    public static <T> CommonResponse<T> success(T data, String message) {
        return new CommonResponse<>(true, data, message, null);
    }

    public static <T> CommonResponse<T> fail(String message) {
        return new CommonResponse<>(false, null, message, null);
    }

    public static <T> CommonResponse<T> validationFail(Map<String, String> errors) {
        return new CommonResponse<>(false, null, "유효성 검사 실패", errors);
    }
}