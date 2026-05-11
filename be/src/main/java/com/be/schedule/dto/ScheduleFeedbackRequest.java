package com.be.schedule.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ScheduleFeedbackRequest(
        @NotNull
        LocalDate date,

        @NotNull
        @Min(1)
        @Max(5)
        Integer satisfactionScore,

        @NotBlank
        @Size(max = 1000)
        String rawFeedback
) {
}
