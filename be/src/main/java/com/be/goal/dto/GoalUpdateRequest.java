package com.be.goal.dto;

import com.be.goal.domain.GoalPriority;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Schema(description = "Goal update request DTO")
public record GoalUpdateRequest(

        @Schema(description = "Goal title", example = "Prepare capstone presentation")
        @NotBlank
        @Size(max = 100)
        String title,

        @Schema(description = "Goal description", example = "Start presentation materials and implement demo features")
        @Size(max = 500)
        String description,

        @Schema(description = "Goal priority", example = "HIGH")
        @NotNull
        GoalPriority priority,

        @Schema(description = "Goal target date", example = "2026-05-01")
        LocalDate targetDate
) {
}
