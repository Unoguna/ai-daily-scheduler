package com.be.daily_condition.dto;

import com.be.daily_condition.domain.DailyCondition;
import com.be.daily_condition.domain.EmotionState;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class DailyConditionResponse {

    private Long dailyConditionId;
    private LocalDate conditionDate;
    private Integer fatigueLevel;
    private Integer focusLevel;
    private EmotionState emotionStatus;
    private String memo;

    public static DailyConditionResponse from(DailyCondition dailyCondition) {
        return DailyConditionResponse.builder()
                .dailyConditionId(dailyCondition.getId())
                .conditionDate(dailyCondition.getDate())
                .fatigueLevel(dailyCondition.getFatigueLevel())
                .focusLevel(dailyCondition.getFocusLevel())
                .emotionStatus(dailyCondition.getEmotionState())
                .memo(dailyCondition.getMemo())
                .build();
    }
}