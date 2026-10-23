package com.be.schedule.service;

import com.be.schedule.domain.DailyScheduleFeedback;
import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class FeedbackAdjustmentTest {
    DailyScheduleFeedback feedback(int session, int rest, int penalty, LocalTime cutoff) {
        return DailyScheduleFeedback.create(null, LocalDate.of(2026, 10, 22), 3, "feedback", "summary", session, rest, penalty, cutoff);
    }

    @Test
    void emptyHistoryHasNoAdjustments() {
        var value = FeedbackAdjustment.from(List.of());
        assertEquals(0, value.sessionMinutesAdjustment());
        assertEquals(0, value.sampleCount());
        assertNull(value.lighterTasksAfter());
    }

    @Test
    void opposingFeedbackIsAveragedRatherThanTakingLatest() {
        var value = FeedbackAdjustment.from(List.of(feedback(-20, 10, 0, null), feedback(20, 0, 0, null)));
        assertEquals(0, value.sessionMinutesAdjustment());
        assertEquals(5, value.breakMinutesAdjustment());
        assertEquals(2, value.sampleCount());
    }

    @Test
    void isolatedCutoffDoesNotOverrideOtherDays() {
        var value = FeedbackAdjustment.from(List.of(feedback(0, 0, 0, LocalTime.NOON), feedback(0, 0, 0, null)));
        assertNull(value.avoidHeavyTasksAfter());
        assertNull(value.lighterTasksAfter());
    }

    @Test
    void majorityCutoffsAndAfternoonPenaltyDefineEffectiveTime() {
        var majority = FeedbackAdjustment.from(List.of(feedback(0, 0, 0, LocalTime.of(14, 0)),
                feedback(0, 0, 0, LocalTime.of(16, 0)), feedback(0, 0, 0, null)));
        assertEquals(LocalTime.of(15, 0), majority.lighterTasksAfter());
        var penalty = FeedbackAdjustment.from(List.of(feedback(0, 0, 40, LocalTime.of(16, 0))));
        assertEquals(LocalTime.of(14, 0), penalty.lighterTasksAfter());
    }

    @Test
    void malformedStoredAdjustmentsStayWithinBounds() {
        var value = FeedbackAdjustment.from(List.of(feedback(-999, 999, 999, null)));
        assertEquals(-30, value.sessionMinutesAdjustment());
        assertEquals(15, value.breakMinutesAdjustment());
        assertEquals(40, value.afternoonFocusPenalty());
    }
}
