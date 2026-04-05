package com.be.schedule.dto;

import com.be.schedule.domain.EmotionState;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record DailyConditionCreateRequest(

        @NotNull
        LocalDate date,

        @NotNull
        @Min(1)
        @Max(5)
        Integer fatigueLevel,

        @NotNull
        @Min(1)
        @Max(5)
        Integer focusLevel,

        @NotNull
        EmotionState emotionState,

        @Size(max = 300)
        String memo
) {
}