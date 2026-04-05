package com.be.schedule.dto;

import com.be.schedule.domain.ScheduleCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record FixedScheduleCreateRequest(

        @NotNull
        DayOfWeek dayOfWeek,

        @NotBlank
        @Size(max = 100)
        String title,

        @NotNull
        ScheduleCategory category,

        @NotNull
        LocalTime startTime,

        @NotNull
        LocalTime endTime,

        @NotNull
        Boolean mandatory
) {
}