package com.be.goal.domain;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "목표 우선순위")
public enum GoalPriority {

    @Schema(description = "낮음")
    LOW,

    @Schema(description = "보통")
    MEDIUM,

    @Schema(description = "높음")
    HIGH
}
