package com.be.schedule.service;

import com.be.daily_condition.domain.*;
import com.be.daily_condition.repository.DailyConditionRepository;
import com.be.global.exception.*;
import com.be.global.time.KoreanDate;
import com.be.goal.domain.*;
import com.be.goal.repository.GoalRepository;
import com.be.schedule.domain.*;
import com.be.schedule.dto.*;
import com.be.schedule.repository.*;
import com.be.user.domain.*;
import com.be.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ScheduleGenerationBoundaryTest {
    final UserRepository users = mock(UserRepository.class);
    final DailyConditionRepository conditions = mock(DailyConditionRepository.class);
    final GoalRepository goals = mock(GoalRepository.class);
    final FixedScheduleRepository fixed = mock(FixedScheduleRepository.class);
    final SchedulingProfileRepository profiles = mock(SchedulingProfileRepository.class);
    final DailyScheduleFeedbackRepository feedback = mock(DailyScheduleFeedbackRepository.class);
    final ScheduleGenerationService service = new ScheduleGenerationService(users, conditions, goals, fixed, profiles, feedback);
    final LocalDate date = LocalDate.of(2026, 10, 23);
    final User user = User.create(AuthProvider.GOOGLE, "owner", null, "Owner", null);

    @BeforeEach
    void setup() {
        when(users.findById(1L)).thenReturn(Optional.of(user));
        when(conditions.findByUserIdAndDate(1L, date)).thenReturn(Optional.of(DailyCondition.create(user, date, 3, 3, EmotionState.NEUTRAL, null)));
        when(feedback.findByUserIdAndDateGreaterThanEqualAndDateLessThanOrderByDateDesc(1L, date.minusDays(7), date)).thenReturn(List.of());
        when(fixed.findByUserIdAndDayOfWeek(1L, date.getDayOfWeek())).thenReturn(List.of());
        profile("07:30", "23:30", "09:00", "22:00", 50);
        when(goals.findByUserId(1L)).thenReturn(List.of(goal(1L)));
    }

    void profile(String wake, String sleep, String start, String end, int session) {
        var value = SchedulingProfile.create(user, LocalTime.parse(start), LocalTime.parse(end),
                LocalTime.parse(wake), LocalTime.parse(sleep), EnergyPattern.MORNING_TYPE, session, 10);
        when(profiles.findByUserId(1L)).thenReturn(Optional.of(value));
    }
    Goal goal(Long id) {
        Goal goal = Goal.create(user, "Goal " + id, null, GoalPriority.HIGH, date);
        ReflectionTestUtils.setField(goal, "id", id);
        return goal;
    }
    FixedSchedule appointment(String start, String end) {
        return FixedSchedule.create(user, date.getDayOfWeek(), "Class", ScheduleCategory.CLASS,
                LocalTime.parse(start), LocalTime.parse(end), true);
    }
    ScheduleGenerationResponse generate() { return service.generateSchedule(1L, date); }

    @Test
    void afterMidnightSleepDoesNotInvalidateOrdinaryDaytimePreference() {
        profile("07:30", "01:00", "09:00", "22:00", 50);
        var result = generate();
        assertFalse(result.items().isEmpty());
        assertTrue(result.items().stream().allMatch(item -> !item.startTime().isBefore(LocalTime.of(9, 0))
                && !item.endTime().isAfter(LocalTime.of(22, 0))));
    }

    @Test
    void overnightWindowsAreSplitWithinSelectedDateAndTerminate() {
        profile("07:00", "01:00", "23:00", "01:00", 50);
        var result = assertTimeoutPreemptively(Duration.ofSeconds(2), this::generate);
        assertEquals(date, result.date());
        assertTrue(result.items().stream().anyMatch(item -> item.startTime().equals(LocalTime.MIDNIGHT)));
        assertTrue(result.items().stream().anyMatch(item -> item.startTime().equals(LocalTime.of(23, 0))));
        assertTrue(result.items().stream().allMatch(item -> item.startTime().isBefore(item.endTime())
                && !item.endTime().isAfter(LocalTime.of(23, 59))));
        assertTrue(result.notices().stream().anyMatch(notice -> notice.contains("00:00~23:59")));
    }

    @Test
    void midnightEndDoesNotWrapAndCreateAnInfiniteLoop() {
        profile("07:00", "00:00", "23:00", "00:00", 50);
        var result = assertTimeoutPreemptively(Duration.ofSeconds(2), this::generate);
        assertEquals(1, result.items().size());
        assertEquals(LocalTime.of(23, 50), result.items().getFirst().endTime());
    }

    @Test
    void overlappingFixedSchedulesAreRejectedIncludingNestedIntervals() {
        when(fixed.findByUserIdAndDayOfWeek(1L, date.getDayOfWeek()))
                .thenReturn(List.of(appointment("10:00", "11:00"), appointment("09:00", "12:00")));
        assertEquals(ErrorCode.FIXED_SCHEDULE_OVERLAP, assertThrows(BusinessException.class, this::generate).getErrorCode());
    }

    @Test
    void touchingFixedSchedulesAreValidAndDoNotOverlapWork() {
        when(fixed.findByUserIdAndDayOfWeek(1L, date.getDayOfWeek()))
                .thenReturn(List.of(appointment("10:00", "11:00"), appointment("11:00", "12:00")));
        var items = generate().items();
        for (int index = 1; index < items.size(); index++)
            assertFalse(items.get(index - 1).endTime().isAfter(items.get(index).startTime()));
    }

    @Test
    void noActiveGoalsKeepsFixedSchedulesAndExplainsWhy() {
        Goal completed = goal(2L);
        completed.complete();
        when(goals.findByUserId(1L)).thenReturn(List.of(completed));
        when(fixed.findByUserIdAndDayOfWeek(1L, date.getDayOfWeek())).thenReturn(List.of(appointment("10:00", "11:00")));
        var result = generate();
        assertEquals(1, result.items().size());
        assertEquals(ScheduleItemType.FIXED_SCHEDULE, result.items().getFirst().type());
        assertTrue(result.notices().stream().anyMatch(notice -> notice.contains("활성 목표")));
    }

    @Test
    void insufficientContinuousTimeListsUnscheduledGoal() {
        profile("07:00", "23:00", "09:00", "09:30", 50);
        var result = generate();
        assertTrue(result.items().isEmpty());
        assertEquals(1, result.unscheduledGoals().size());
        assertEquals(1L, result.unscheduledGoals().getFirst().goalId());
        assertTrue(result.unscheduledGoals().getFirst().reason().contains("50분"));
    }

    @Test
    void completelyBlockedDayKeepsFixedScheduleAndReportsNoGoalTime() {
        profile("07:00", "23:00", "09:00", "10:00", 50);
        when(fixed.findByUserIdAndDayOfWeek(1L, date.getDayOfWeek())).thenReturn(List.of(appointment("08:00", "12:00")));
        var result = generate();
        assertEquals(1, result.items().size());
        assertEquals(1, result.unscheduledGoals().size());
    }

    @Test
    void partialCapacityListsOnlyGoalsThatWereNotScheduled() {
        profile("07:00", "23:00", "09:00", "10:00", 50);
        when(goals.findByUserId(1L)).thenReturn(List.of(goal(1L), goal(2L)));
        var result = generate();
        assertEquals(1L, result.items().getFirst().goalId());
        assertEquals(2L, result.unscheduledGoals().getFirst().goalId());
    }

    @Test
    void invalidProfileWindowsAreRejectedBeforeSaving() {
        assertThrows(BusinessException.class, () -> profile("07:00", "07:00", "09:00", "10:00", 50));
        assertThrows(BusinessException.class, () -> profile("07:00", "08:00", "09:00", "10:00", 50));
        assertThrows(BusinessException.class, () -> profile("07:00", "23:00", "09:00", "09:00", 50));
    }

    @Test
    void koreanDateIgnoresHostTimezoneAtDayAndYearBoundaries() {
        assertEquals(LocalDate.of(2026, 10, 23), KoreanDate.today(Clock.fixed(Instant.parse("2026-10-22T15:00:00Z"), ZoneOffset.UTC)));
        assertEquals(LocalDate.of(2026, 10, 22), KoreanDate.today(Clock.fixed(Instant.parse("2026-10-22T14:59:59Z"), ZoneId.of("America/Los_Angeles"))));
        assertEquals(LocalDate.of(2027, 1, 1), KoreanDate.today(Clock.fixed(Instant.parse("2026-12-31T15:00:00Z"), ZoneOffset.UTC)));
    }
}
