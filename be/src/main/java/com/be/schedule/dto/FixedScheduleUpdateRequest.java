package com.be.schedule.dto;

import com.be.schedule.domain.ScheduleCategory;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Schema(description = "Fixed schedule update request DTO")
public record FixedScheduleUpdateRequest(

        @Schema(description = "Day of week", example = "MONDAY")
        @NotNull
        DayOfWeek dayOfWeek,

        @Schema(description = "Schedule title", example = "Operating systems class")
        @NotBlank
        @Size(max = 100)
        String title,

        @Schema(description = "Schedule category", example = "CLASS")
        @NotNull
        ScheduleCategory category,

        @Schema(description = "Start time", example = "10:00:00")
        @NotNull
        LocalTime startTime,

        @Schema(description = "End time", example = "12:00:00")
        @NotNull
        LocalTime endTime,

        @Schema(description = "Mandatory schedule", example = "true")
        @NotNull
        Boolean mandatory
) {
}
