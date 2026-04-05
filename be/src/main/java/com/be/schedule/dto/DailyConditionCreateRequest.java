package com.be.schedule.dto;

import com.be.schedule.domain.EmotionState;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Schema(description = "일일 상태 생성 요청")
public record DailyConditionCreateRequest(

        @Schema(description = "날짜", example = "2026-04-06")
        @NotNull
        LocalDate date,

        @Schema(description = "피곤함 정도(1~5)", example = "4")
        @NotNull
        @Min(1)
        @Max(5)
        Integer fatigueLevel,

        @Schema(description = "집중도(1~5)", example = "2")
        @NotNull
        @Min(1)
        @Max(5)
        Integer focusLevel,

        @Schema(description = "감정 상태", example = "NEUTRAL")
        @NotNull
        EmotionState emotionState,

        @Schema(description = "메모", example = "어제 늦게 자서 조금 피곤함")
        @Size(max = 300)
        String memo
) {
}