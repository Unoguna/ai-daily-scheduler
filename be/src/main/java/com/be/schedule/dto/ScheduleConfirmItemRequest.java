package com.be.schedule.dto;

import com.be.schedule.domain.ScheduleItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;

public record ScheduleConfirmItemRequest(
        @NotNull
        ScheduleItemType type,

        @NotBlank
        @Size(max = 100)
        String title,

        @NotNull
        LocalTime startTime,

        @NotNull
        LocalTime endTime,

        Long goalId,

        Long fixedScheduleId,

        @Size(max = 500)
        String description
) {
}
