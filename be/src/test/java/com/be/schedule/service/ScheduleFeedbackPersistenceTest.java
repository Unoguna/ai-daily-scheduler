package com.be.schedule.service;

import com.be.global.exception.BusinessException;
import com.be.global.time.KoreanDate;
import com.be.daily_condition.domain.*;
import com.be.goal.domain.*;
import com.be.schedule.domain.*;
import com.be.schedule.dto.*;
import com.be.schedule.repository.DailyScheduleFeedbackRepository;
import com.be.user.domain.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@DataJpaTest
@Import({ScheduleFeedbackService.class, ScheduleGenerationService.class})
class ScheduleFeedbackPersistenceTest {
    @Autowired EntityManager em;
    @Autowired ScheduleFeedbackService feedbacks;
    @Autowired ScheduleGenerationService generation;
    @Autowired DailyScheduleFeedbackRepository repository;
    @MockitoBean ScheduleFeedbackAnalysisService analysis;
    User owner;
    User other;
    Long highId;
    Long lowId;
    final LocalDate date = LocalDate.of(2026, 10, 23);

    @BeforeEach
    void setup() {
        owner = User.create(AuthProvider.GOOGLE, "owner", "owner@example.com", "Owner", null);
        other = User.create(AuthProvider.KAKAO, "other", "other@example.com", "Other", null);
        em.persist(owner);
        em.persist(other);
        em.persist(SchedulingProfile.create(owner, LocalTime.of(9, 0), LocalTime.of(17, 0),
                LocalTime.of(7, 0), LocalTime.of(23, 0), EnergyPattern.MORNING_TYPE, 50, 10));
        em.persist(DailyCondition.create(owner, date, 3, 3, EmotionState.NEUTRAL, null));
        Goal high = Goal.create(owner, "Hard task", null, GoalPriority.HIGH, date);
        Goal low = Goal.create(owner, "Light task", null, GoalPriority.LOW, date);
        em.persist(high);
        em.persist(low);
        highId = high.getId();
        lowId = low.getId();
        when(analysis.analyze(any())).thenReturn(new ScheduleFeedbackAnalysis("휴식을 늘려 주세요.", -10, 5, 20, LocalTime.of(14, 0)));
        em.flush();
    }

    DailyScheduleFeedback record(User user, LocalDate day, int session, int rest, int penalty, LocalTime cutoff) {
        var feedback = DailyScheduleFeedback.create(user, day, 3, "피곤했어요", "분석 결과", session, rest, penalty, cutoff);
        em.persist(feedback);
        return feedback;
    }

    void reload() { em.flush(); em.clear(); }

    @Test
    void savingAndReloadingReturnsAllFeedbackAndAnalysisFields() {
        var saved = feedbacks.createFeedback(owner.getId(), new ScheduleFeedbackRequest(date, 2, "오늘 너무 피곤했어요"));
        reload();
        var loaded = feedbacks.getFeedback(owner.getId(), date);
        assertEquals(saved, loaded);
        assertEquals("오늘 너무 피곤했어요", loaded.rawFeedback());
        assertEquals(2, loaded.satisfactionScore());
        assertEquals(-10, loaded.sessionMinutesAdjustment());
        assertEquals(5, loaded.breakMinutesAdjustment());
        assertEquals(20, loaded.afternoonFocusPenalty());
        assertEquals(LocalTime.of(14, 0), loaded.avoidHeavyTasksAfter());
    }

    @Test
    void editingSameDateUpdatesRecordWithoutCreatingAnotherSample() {
        var first = feedbacks.createFeedback(owner.getId(), new ScheduleFeedbackRequest(date, 2, "피곤했어요"));
        when(analysis.analyze(any())).thenReturn(new ScheduleFeedbackAnalysis("괜찮습니다.", 5, 0, 0, null));
        var updated = feedbacks.createFeedback(owner.getId(), new ScheduleFeedbackRequest(date, 4, "괜찮았어요"));
        reload();
        assertEquals(first.feedbackId(), updated.feedbackId());
        assertEquals(1, repository.count());
        assertEquals("괜찮았어요", feedbacks.getFeedback(owner.getId(), date).rawFeedback());
        assertNull(feedbacks.getFeedback(owner.getId(), date).avoidHeavyTasksAfter());
    }

    @Test
    void missingDateReturnsNullAndOtherUsersDataIsNotVisible() {
        record(other, date, -10, 5, 20, LocalTime.of(14, 0));
        reload();
        assertNull(feedbacks.getFeedback(owner.getId(), date));
        assertNull(feedbacks.getFeedback(other.getId(), date.minusDays(1)));
        assertNotNull(feedbacks.getFeedback(other.getId(), date));
        assertThrows(BusinessException.class, () -> feedbacks.getFeedback(-1L, date));
    }

    @Test
    void omittedDateUsesKoreanToday() {
        LocalDate today = KoreanDate.today();
        record(owner, today, 0, 0, 0, null);
        reload();
        assertEquals(today, feedbacks.getFeedback(owner.getId(), null).date());
    }

    @Test
    void generationAveragesOnlyOwnersPreviousSevenDays() {
        record(owner, date.minusDays(1), -20, 10, 0, null);
        record(owner, date.minusDays(7), 0, 0, 0, null);
        record(owner, date.minusDays(8), -30, 15, 40, LocalTime.NOON);
        record(owner, date, 20, -5, 40, LocalTime.NOON);
        record(owner, date.plusDays(1), 20, -5, 40, LocalTime.NOON);
        record(other, date.minusDays(1), 20, -5, 40, LocalTime.NOON);
        reload();
        var result = generation.generateSchedule(owner.getId(), date);
        assertEquals(40, result.sessionMinutes());
        assertEquals(15, result.breakMinutes());
        assertTrue(result.notices().stream().anyMatch(notice -> notice.contains("2건 평균")));
        assertEquals(2, repository.findByUserIdAndDateGreaterThanEqualAndDateLessThanOrderByDateDesc(
                owner.getId(), date.minusDays(7), date).size());
    }

    @Test
    void afternoonPenaltyAffectsGoalSelectionAndPreservesValidTimes() {
        record(owner, date.minusDays(1), 0, 0, 40, null);
        reload();
        var result = generation.generateSchedule(owner.getId(), date);
        var afternoon = result.items().stream().filter(item -> item.type() == ScheduleItemType.GOAL_WORK
                && !item.startTime().isBefore(LocalTime.of(14, 0))).toList();
        assertFalse(afternoon.isEmpty());
        assertTrue(afternoon.stream().allMatch(item -> item.goalId().equals(lowId)));
        for (int i = 1; i < result.items().size(); i++)
            assertFalse(result.items().get(i - 1).endTime().isAfter(result.items().get(i).startTime()));
    }

    @Test
    void noRecentFeedbackKeepsDefaultRules() {
        record(owner, date.minusDays(8), -30, 15, 40, LocalTime.NOON);
        reload();
        var result = generation.generateSchedule(owner.getId(), date);
        assertEquals(50, result.sessionMinutes());
        assertEquals(10, result.breakMinutes());
        assertFalse(result.notices().stream().anyMatch(notice -> notice.contains("피드백")));
    }

    @Test
    void feedbackOnlyChangesNewGeneratedPlans() {
        var before = generation.generateSchedule(owner.getId(), date);
        record(owner, date.minusDays(1), -20, 10, 0, null);
        var after = generation.generateSchedule(owner.getId(), date);
        assertEquals(50, before.sessionMinutes());
        assertEquals(30, after.sessionMinutes());
        assertEquals(20, after.breakMinutes());
    }
}
