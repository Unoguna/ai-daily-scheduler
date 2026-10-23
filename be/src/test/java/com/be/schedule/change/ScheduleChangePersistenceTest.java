package com.be.schedule.change;

import com.be.global.exception.*;
import com.be.schedule.domain.*;
import com.be.schedule.dto.*;
import com.be.schedule.repository.*;
import com.be.schedule.service.*;
import com.be.user.domain.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@DataJpaTest
@Import({ScheduleChangeService.class, ScheduleChangeStore.class, ScheduleChangeValidator.class,
        ScheduleChangeCodec.class, ScheduleQueryService.class, ScheduleConfirmService.class})
class ScheduleChangePersistenceTest {
    @Autowired EntityManager em;
    @Autowired ScheduleChangeService changes;
    @Autowired ScheduleChangeStore store;
    @Autowired ScheduleChangeValidator validator;
    @Autowired ScheduleQueryService queries;
    @Autowired ScheduleConfirmService commands;
    @Autowired ScheduleChangeProposalRepository proposals;
    @MockitoBean ScheduleChangeAiService ai;
    Long owner;
    Long other;
    Long scheduleId;
    Long workId;
    Long fixedId;
    final LocalDate date = LocalDate.of(2026, 10, 23);

    @BeforeEach
    void setup() {
        User user = User.create(AuthProvider.GOOGLE, "owner", "owner@example.com", "Owner", null);
        User outsider = User.create(AuthProvider.KAKAO, "other", "other@example.com", "Other", null);
        em.persist(user);
        em.persist(outsider);
        owner = user.getId();
        other = outsider.getId();
        ConfirmedSchedule schedule = ConfirmedSchedule.create(user, date);
        var work = ConfirmedScheduleItem.create(1, ScheduleItemType.GOAL_WORK, "Study",
                LocalTime.of(9, 0), LocalTime.of(10, 0), null, null, "private memo");
        var fixed = ConfirmedScheduleItem.create(2, ScheduleItemType.FIXED_SCHEDULE, "Class",
                LocalTime.of(11, 0), LocalTime.of(12, 0), null, null, null);
        schedule.addItem(work);
        schedule.addItem(fixed);
        em.persist(schedule);
        reload();
        scheduleId = schedule.getId();
        workId = work.getId();
        fixedId = fixed.getId();
    }

    void reload() { em.flush(); em.clear(); }
    ConfirmedScheduleResponse snapshot() { return queries.getSchedule(owner, scheduleId); }
    ScheduleChangeCommand update(Long id, String start, String end) {
        return new ScheduleChangeCommand(ScheduleChangeCommand.Action.UPDATE_TIME, id, start, end, null);
    }
    ScheduleChangePlan plan(ScheduleChangeCommand... commands) { return new ScheduleChangePlan("시간을 조정합니다.", List.of(commands)); }
    ScheduleChangePreview propose(ScheduleChangePlan plan) {
        when(ai.generate(any(), anyString())).thenReturn(plan);
        return changes.preview(owner, scheduleId, "공부 시간을 줄여줘");
    }

    @Test
    void previewDoesNotSaveUntilApplyAndCompletionIsPreserved() {
        commands.updateCompletion(owner, scheduleId, fixedId, true);
        var preview = propose(plan(update(workId, "09:00", "09:30"),
                new ScheduleChangeCommand(ScheduleChangeCommand.Action.ADD_BREAK, null, "09:30", "10:00", "휴식")));
        assertEquals(2, snapshot().items().size());
        assertEquals(LocalTime.of(10, 0), snapshot().items().getFirst().endTime());
        assertEquals(3, preview.after().items().size());
        var saved = store.apply(owner, scheduleId, preview.proposalId());
        assertTrue(saved.items().getLast().completed());
        assertNotNull(saved.items().get(1).scheduleItemId());
        reload();
        var loaded = snapshot();
        assertEquals(3, loaded.items().size());
        assertEquals(LocalTime.of(9, 30), loaded.items().getFirst().endTime());
        assertEquals("private memo", loaded.items().getFirst().description());
        assertTrue(loaded.items().getLast().completed());
        assertTrue(proposals.findById(preview.proposalId()).orElseThrow().isApplied());
    }

    @Test
    void deletionAndMovingWorkPersist() {
        var move = propose(plan(update(workId, "13:00", "14:00")));
        store.apply(owner, scheduleId, move.proposalId());
        reload();
        assertEquals(LocalTime.of(13, 0), snapshot().items().getLast().startTime());
        var deletion = propose(plan(new ScheduleChangeCommand(ScheduleChangeCommand.Action.DELETE, workId, null, null, null)));
        store.apply(owner, scheduleId, deletion.proposalId());
        reload();
        assertEquals(1, snapshot().items().size());
        assertEquals(fixedId, snapshot().items().getFirst().scheduleItemId());
    }

    @Test
    void fixedAndCompletedItemsAreProtected() {
        assertEquals(ErrorCode.SCHEDULE_CHANGE_PROTECTED, assertThrows(BusinessException.class,
                () -> propose(plan(update(fixedId, "12:00", "13:00")))).getErrorCode());
        commands.updateCompletion(owner, scheduleId, workId, true);
        assertEquals(ErrorCode.SCHEDULE_CHANGE_PROTECTED, assertThrows(BusinessException.class,
                () -> propose(plan(new ScheduleChangeCommand(ScheduleChangeCommand.Action.DELETE, workId, null, null, null)))).getErrorCode());
        assertEquals(0, proposals.count());
    }

    @Test
    void overlappingAndMalformedPlansAreRejectedWithoutSaving() {
        assertEquals(ErrorCode.SCHEDULE_CHANGE_CONFLICT, assertThrows(BusinessException.class,
                () -> propose(plan(update(workId, "10:30", "11:30")))).getErrorCode());
        for (var command : List.of(update(workId, "25:00", "26:00"), update(workId, "23:00", "01:00"),
                update(999999L, "09:00", "10:00"), update(workId, "09:00", "09:00"))) {
            assertThrows(BusinessException.class, () -> propose(plan(command)));
        }
        assertThrows(BusinessException.class, () -> propose(new ScheduleChangePlan("unsupported", List.of())));
        assertEquals(0, proposals.count());
        assertEquals(2, snapshot().items().size());
    }

    @Test
    void previewAndApplyEnforceOwnership() {
        assertThrows(BusinessException.class, () -> changes.preview(other, scheduleId, "request"));
        verifyNoInteractions(ai);
        var preview = propose(plan(update(workId, "09:00", "09:30")));
        assertThrows(BusinessException.class, () -> store.apply(other, scheduleId, preview.proposalId()));
        assertFalse(proposals.findById(preview.proposalId()).orElseThrow().isApplied());
    }

    @Test
    void stalePreviewCannotOverwriteCompletionOrEdits() {
        var preview = propose(plan(update(workId, "09:00", "09:30")));
        commands.updateCompletion(owner, scheduleId, workId, true);
        reload();
        assertEquals(ErrorCode.STALE_SCHEDULE_CHANGE, assertThrows(BusinessException.class,
                () -> store.apply(owner, scheduleId, preview.proposalId())).getErrorCode());
        assertEquals(LocalTime.of(10, 0), snapshot().items().getFirst().endTime());
    }

    @Test
    void expiredOrAlreadyAppliedProposalCannotApply() {
        var expired = propose(plan(update(workId, "09:00", "09:30")));
        var entity = proposals.findById(expired.proposalId()).orElseThrow();
        ReflectionTestUtils.setField(entity, "expiresAt", Instant.now().minusSeconds(1));
        reload();
        assertThrows(BusinessException.class, () -> store.apply(owner, scheduleId, expired.proposalId()));
        var current = propose(plan(update(workId, "09:00", "09:30")));
        store.apply(owner, scheduleId, current.proposalId());
        assertThrows(BusinessException.class, () -> store.apply(owner, scheduleId, current.proposalId()));
    }

    @Test
    void newMandatoryFixedScheduleIsRecheckedOnApply() {
        var preview = propose(plan(update(workId, "13:00", "14:00")));
        var user = em.find(User.class, owner);
        em.persist(FixedSchedule.create(user, date.getDayOfWeek(), "New meeting", ScheduleCategory.MEETING,
                LocalTime.of(13, 0), LocalTime.of(14, 0), true));
        reload();
        assertEquals(ErrorCode.SCHEDULE_CHANGE_CONFLICT, assertThrows(BusinessException.class,
                () -> store.apply(owner, scheduleId, preview.proposalId())).getErrorCode());
        assertEquals(LocalTime.of(9, 0), snapshot().items().getFirst().startTime());
    }

    @Test
    void providerFailureNeverMutatesSchedule() {
        when(ai.generate(any(), anyString())).thenThrow(new BusinessException(ErrorCode.SCHEDULE_AI_UNAVAILABLE));
        assertThrows(BusinessException.class, () -> changes.preview(owner, scheduleId, "request"));
        assertEquals(0, proposals.count());
        assertEquals(LocalTime.of(10, 0), snapshot().items().getFirst().endTime());
    }
}
