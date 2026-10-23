package com.be.schedule.service;

import com.be.schedule.domain.DailyScheduleFeedback;
import java.time.LocalTime;
import java.util.List;
import java.util.function.ToIntFunction;

/** Average of the preceding seven calendar days. Same-day data is excluded by the query. */
record FeedbackAdjustment(int sessionMinutesAdjustment, int breakMinutesAdjustment,
                          int afternoonFocusPenalty, LocalTime avoidHeavyTasksAfter, int sampleCount) {
    LocalTime lighterTasksAfter() {
        LocalTime afternoon = LocalTime.of(14, 0);
        if (afternoonFocusPenalty < 20) return avoidHeavyTasksAfter;
        return avoidHeavyTasksAfter == null || afternoon.isBefore(avoidHeavyTasksAfter) ? afternoon : avoidHeavyTasksAfter;
    }

    static FeedbackAdjustment from(List<DailyScheduleFeedback> feedbacks) {
        if (feedbacks.isEmpty()) return new FeedbackAdjustment(0, 0, 0, null, 0);
        var cutoffs = feedbacks.stream().map(DailyScheduleFeedback::getAvoidHeavyTasksAfter)
                .filter(java.util.Objects::nonNull).toList();
        // An isolated time preference must not override the majority of recent feedback.
        LocalTime cutoff = cutoffs.size() * 2 > feedbacks.size()
                ? LocalTime.ofSecondOfDay(Math.round(cutoffs.stream().mapToInt(LocalTime::toSecondOfDay).average().orElseThrow()))
                : null;
        return new FeedbackAdjustment(
                average(feedbacks, DailyScheduleFeedback::getSessionMinutesAdjustment, -30, 20),
                average(feedbacks, DailyScheduleFeedback::getBreakMinutesAdjustment, -5, 15),
                average(feedbacks, DailyScheduleFeedback::getAfternoonFocusPenalty, 0, 40),
                cutoff, feedbacks.size());
    }

    private static int average(List<DailyScheduleFeedback> feedbacks, ToIntFunction<DailyScheduleFeedback> value, int min, int max) {
        return (int) Math.round(feedbacks.stream().mapToInt(feedback -> Math.max(min, Math.min(max, value.applyAsInt(feedback))))
                .average().orElse(0));
    }
}
