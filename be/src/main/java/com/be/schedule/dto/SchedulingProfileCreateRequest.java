package com.be.schedule.dto;

import com.be.schedule.domain.EnergyPattern;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record SchedulingProfileCreateRequest(

        @NotNull
        LocalTime preferredStartTime,

        @NotNull
        LocalTime preferredEndTime,

        @NotNull
        LocalTime wakeUpTime,

        @NotNull
        LocalTime sleepTime,

        @NotNull
        EnergyPattern energyPattern,

        @NotNull
        @Min(10)
        @Max(300)
        Integer preferredSessionMinutes,

        @NotNull
        @Min(0)
        @Max(180)
        Integer breakMinutes
) {
}