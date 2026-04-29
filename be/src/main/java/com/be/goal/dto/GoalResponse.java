package com.be.goal.dto;

import com.be.goal.domain.Goal;
import com.be.goal.domain.GoalPriority;
import com.be.goal.domain.GoalStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class GoalResponse {

    private Long goalId;
    private String title;
    private String description;
    private GoalPriority priority;
    private GoalStatus status;
    private LocalDate targetDate;

    public static GoalResponse from(Goal goal) {
        return GoalResponse.builder()
                .goalId(goal.getId())
                .title(goal.getTitle())
                .description(goal.getDescription())
                .priority(goal.getPriority())
                .status(goal.getStatus())
                .targetDate(goal.getTargetDate())
                .build();
    }
}
