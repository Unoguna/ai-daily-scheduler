package com.be.schedule.domain;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "사용자의 에너지 패턴 (집중이 잘 되는 시간대)")
public enum EnergyPattern {

    @Schema(description = "아침형 인간")
    MORNING_TYPE,

    @Schema(description = "오후 집중형")
    AFTERNOON_TYPE,

    @Schema(description = "저녁 집중형")
    EVENING_TYPE,

    @Schema(description = "불규칙")
    IRREGULAR
}
