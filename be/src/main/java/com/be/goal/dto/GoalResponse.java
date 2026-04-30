package com.be.goal.dto;

import com.be.goal.domain.Goal;
import com.be.goal.domain.GoalPriority;
import com.be.goal.domain.GoalStatus;

import java.time.LocalDate;

public record GoalResponse(
        Long goalId,
        String title,
        String description,
        GoalPriority priority,
        GoalStatus status,
        LocalDate targetDate
) {
    public static GoalResponse from(Goal goal) {
        return new GoalResponse(
                goal.getId(),
                goal.getTitle(),
                goal.getDescription(),
                goal.getPriority(),
                goal.getStatus(),
                goal.getTargetDate()
        );
    }
}
