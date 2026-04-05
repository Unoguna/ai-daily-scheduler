package com.be.schedule.dto;

import com.be.schedule.domain.GoalPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record GoalCreateRequest(

        @NotBlank
        @Size(max = 100)
        String title,

        @Size(max = 500)
        String description,

        @NotNull
        GoalPriority priority,

        LocalDate targetDate
) {
}