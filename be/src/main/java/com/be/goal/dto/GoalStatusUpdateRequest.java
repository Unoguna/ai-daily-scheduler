package com.be.goal.dto;

import com.be.goal.domain.GoalStatus;
import jakarta.validation.constraints.NotNull;

public record GoalStatusUpdateRequest(@NotNull GoalStatus status) {}
