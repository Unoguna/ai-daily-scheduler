package com.be.schedule.dto;

import com.be.schedule.domain.EnergyPattern;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

@Schema(description = "스케줄링 프로필 생성 요청 DTO")
public record SchedulingProfileCreateRequest(

        @Schema(description = "선호 활동 시작 시간", example = "09:00:00")
        @NotNull
        LocalTime preferredStartTime,

        @Schema(description = "선호 활동 종료 시간", example = "23:00:00")
        @NotNull
        LocalTime preferredEndTime,

        @Schema(description = "기상 시간", example = "07:30:00")
        @NotNull
        LocalTime wakeUpTime,

        @Schema(description = "취침 시간", example = "01:00:00")
        @NotNull
        LocalTime sleepTime,

        @Schema(description = "에너지 패턴 (활동 집중 시간대)", example = "MORNING_TYPE")
        @NotNull
        EnergyPattern energyPattern,

        @Schema(description = "선호 집중 세션 길이(분)", example = "50")
        @NotNull
        @Min(10)
        @Max(300)
        Integer preferredSessionMinutes,

        @Schema(description = "휴식 시간(분)", example = "10")
        @NotNull
        @Min(0)
        @Max(180)
        Integer breakMinutes
) {
}