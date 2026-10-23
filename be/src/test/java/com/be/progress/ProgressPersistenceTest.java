package com.be.progress;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.goal.domain.*;
import com.be.goal.dto.GoalStatusUpdateRequest;
import com.be.goal.service.GoalService;
import com.be.schedule.domain.*;
import com.be.schedule.dto.*;
import com.be.schedule.service.ScheduleConfirmService;
import com.be.schedule.service.ScheduleQueryService;
import com.be.user.domain.*;
import jakarta.persistence.EntityManager;
import jakarta.validation.Validation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@Import({GoalService.class, ScheduleConfirmService.class, ScheduleQueryService.class})
class ProgressPersistenceTest {
    @Autowired EntityManager em;
    @Autowired GoalService goals;
    @Autowired ScheduleConfirmService commands;
    @Autowired ScheduleQueryService queries;
    Long userId;
    Long otherUserId;
    Long goalId;
    Long scheduleId;
    Long itemId;
    final LocalDate date = LocalDate.of(2026, 10, 23);

    @BeforeEach
    void setup() {
        User user = User.create(AuthProvider.GOOGLE, "owner", "owner@example.com", "Owner", null);
        User other = User.create(AuthProvider.GOOGLE, "other", "other@example.com", "Other", null);
        em.persist(user);
        em.persist(other);
        Goal goal = Goal.create(user, "Study", null, GoalPriority.HIGH, date);
        em.persist(goal);
        userId = user.getId();
        otherUserId = other.getId();
        goalId = goal.getId();
        ConfirmedSchedule schedule = ConfirmedSchedule.create(user, date);
        ConfirmedScheduleItem item = ConfirmedScheduleItem.create(1, ScheduleItemType.GOAL_WORK,
                "Study", LocalTime.of(9, 0), LocalTime.of(12, 0), goalId, null, null);
        schedule.addItem(item);
        em.persist(schedule);
        reload();
        scheduleId = schedule.getId();
        itemId = item.getId();
    }

    void reload() {
        em.flush();
        em.clear();
    }

    @Test
    void goalCanCompleteDeactivateAndReactivateAfterReload() {
        for (GoalStatus status : List.of(GoalStatus.COMPLETED, GoalStatus.INACTIVE, GoalStatus.ACTIVE)) {
            assertEquals(status, goals.updateGoalStatus(userId, goalId, new GoalStatusUpdateRequest(status)).status());
            reload();
            assertEquals(status, goals.getGoal(userId, goalId).status());
        }
    }

    @Test
    void completionAndUndoPersistInDailyQuery() {
        assertFalse(queries.getDailySchedule(userId, date).items().getFirst().completed());
        for (boolean completed : List.of(true, true, false)) {
            assertEquals(completed, commands.updateCompletion(userId, scheduleId, itemId, completed).items().getFirst().completed());
            reload();
            assertEquals(completed, queries.getDailySchedule(userId, date).items().getFirst().completed());
        }
        assertNull(queries.getDailySchedule(userId, date.plusDays(1)));
        assertEquals(GoalStatus.ACTIVE, goals.getGoal(userId, goalId).status());
    }

    @Test
    void otherUserCannotChangeGoalOrSchedule() {
        assertEquals(ErrorCode.ENTITY_NOT_FOUND, assertThrows(BusinessException.class,
                () -> goals.updateGoalStatus(otherUserId, goalId, new GoalStatusUpdateRequest(GoalStatus.COMPLETED))).getErrorCode());
        assertEquals(ErrorCode.ENTITY_NOT_FOUND, assertThrows(BusinessException.class,
                () -> commands.updateCompletion(otherUserId, scheduleId, itemId, true)).getErrorCode());
        reload();
        assertEquals(GoalStatus.ACTIVE, goals.getGoal(userId, goalId).status());
        assertFalse(queries.getDailySchedule(userId, date).items().getFirst().completed());
    }

    @Test
    void itemMustBelongToRequestedSchedule() {
        var second = commands.confirmSchedule(userId, new ScheduleConfirmRequest(date.plusDays(1),
                List.of(new ScheduleConfirmItemRequest(ScheduleItemType.BREAK, "Rest",
                        LocalTime.of(13, 0), LocalTime.of(14, 0), null, null, null))));
        assertThrows(BusinessException.class, () -> commands.updateCompletion(userId, second.id(), itemId, true));
    }

    @Test
    void editingAndSplittingPreservesCompletion() {
        commands.updateCompletion(userId, scheduleId, itemId, true);
        reload();
        commands.updateConfirmedScheduleItem(userId, scheduleId, itemId,
                new ScheduleConfirmItemRequest(ScheduleItemType.GOAL_WORK, "Updated study",
                        LocalTime.of(9, 0), LocalTime.of(12, 0), goalId, null, null));
        ConfirmedSchedule schedule = em.find(ConfirmedSchedule.class, scheduleId);
        ConfirmedScheduleItem rest = ConfirmedScheduleItem.create(2, ScheduleItemType.BREAK,
                "Rest", LocalTime.of(13, 0), LocalTime.of(14, 0), null, null, null);
        schedule.addItem(rest);
        reload();
        commands.updateConfirmedScheduleItem(userId, scheduleId, rest.getId(),
                new ScheduleConfirmItemRequest(ScheduleItemType.BREAK, "Rest",
                        LocalTime.of(10, 0), LocalTime.of(11, 0), null, null, null));
        reload();
        var items = queries.getDailySchedule(userId, date).items();
        assertEquals(3, items.size());
        assertTrue(items.getFirst().completed());
        assertFalse(items.get(1).completed());
        assertTrue(items.getLast().completed());
    }

    @Test
    void deletionRemovesCompletedItemFromDailyResult() {
        commands.updateCompletion(userId, scheduleId, itemId, true);
        assertNull(commands.deleteConfirmedScheduleItem(userId, scheduleId, itemId));
        reload();
        assertNull(queries.getDailySchedule(userId, date));
    }

    @Test
    void reConfirmingDateCreatesNewUncheckedItems() {
        commands.updateCompletion(userId, scheduleId, itemId, true);
        commands.confirmSchedule(userId, new ScheduleConfirmRequest(date,
                List.of(new ScheduleConfirmItemRequest(ScheduleItemType.GOAL_WORK, "New plan",
                        LocalTime.of(14, 0), LocalTime.of(15, 0), goalId, null, null))));
        reload();
        assertFalse(queries.getDailySchedule(userId, date).items().getFirst().completed());
    }

    @Test
    void statusAndCompletedFieldsAreRequired() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            assertFalse(validator.validate(new GoalStatusUpdateRequest(null)).isEmpty());
            assertFalse(validator.validate(new ScheduleCompletionRequest(null)).isEmpty());
            assertTrue(validator.validate(new ScheduleCompletionRequest(false)).isEmpty());
        }
    }
}
