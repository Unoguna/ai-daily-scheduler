package com.be.schedule.dto;

import java.time.LocalTime;

public record ScheduleFeedbackAnalysis(
        String summary,
        Integer sessionMinutesAdjustment,
        Integer breakMinutesAdjustment,
        Integer afternoonFocusPenalty,
        LocalTime avoidHeavyTasksAfter
) {
}
