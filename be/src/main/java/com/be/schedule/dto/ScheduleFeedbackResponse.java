package com.be.schedule.dto;

import com.be.schedule.domain.DailyScheduleFeedback;

import java.time.LocalDate;
import java.time.LocalTime;

public record ScheduleFeedbackResponse(
        Long feedbackId,
        LocalDate date,
        Integer satisfactionScore,
        String rawFeedback,
        String aiSummary,
        Integer sessionMinutesAdjustment,
        Integer breakMinutesAdjustment,
        Integer afternoonFocusPenalty,
        LocalTime avoidHeavyTasksAfter
) {
    public static ScheduleFeedbackResponse from(DailyScheduleFeedback feedback) {
        return new ScheduleFeedbackResponse(
                feedback.getId(),
                feedback.getDate(),
                feedback.getSatisfactionScore(),
                feedback.getRawFeedback(),
                feedback.getAiSummary(),
                feedback.getSessionMinutesAdjustment(),
                feedback.getBreakMinutesAdjustment(),
                feedback.getAfternoonFocusPenalty(),
                feedback.getAvoidHeavyTasksAfter()
        );
    }
}
