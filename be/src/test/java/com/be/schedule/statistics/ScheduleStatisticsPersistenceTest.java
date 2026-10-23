package com.be.schedule.statistics;

import com.be.global.exception.BusinessException;
import com.be.global.time.KoreanDate;
import com.be.schedule.domain.*;
import com.be.schedule.dto.*;
import com.be.schedule.service.*;
import com.be.user.domain.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.time.*;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@Import({ScheduleStatisticsService.class, ScheduleConfirmService.class})
class ScheduleStatisticsPersistenceTest {
    @Autowired EntityManager em;
    @Autowired ScheduleStatisticsService statistics;
    @Autowired ScheduleConfirmService commands;
    User owner;
    User other;
    final LocalDate monday = LocalDate.of(2026, 10, 19);

    @BeforeEach
    void setup() {
        owner = User.create(AuthProvider.GOOGLE, "owner", null, "Owner", null);
        other = User.create(AuthProvider.KAKAO, "other", null, "Other", null);
        em.persist(owner);
        em.persist(other);
    }

    ConfirmedSchedule schedule(User user, LocalDate date, boolean... states) {
        ConfirmedSchedule schedule = ConfirmedSchedule.create(user, date);
        ScheduleItemType[] types = ScheduleItemType.values();
        for (int i = 0; i < states.length; i++) {
            var item = ConfirmedScheduleItem.create(i + 1, types[i % types.length], "Item " + i,
                    LocalTime.of(9 + i, 0), LocalTime.of(10 + i, 0), null, null, null);
            item.setCompleted(states[i]);
            schedule.addItem(item);
        }
        em.persist(schedule);
        em.flush();
        return schedule;
    }

    @Test
    void weeklyRateUsesAllItemsRatherThanAverageOfDailyRates() {
        schedule(owner, monday, true);
        schedule(owner, monday.plusDays(1), false, false, false);
        em.clear();
        var result = statistics.weekly(owner.getId(), monday.plusDays(4));
        assertEquals(monday, result.weekStart());
        assertEquals(monday.plusDays(6), result.weekEnd());
        assertEquals(4, result.totalCount());
        assertEquals(1, result.completedCount());
        assertEquals(3, result.incompleteCount());
        assertEquals(25.0, result.completionRate());
        assertEquals(7, result.days().size());
        assertEquals(100.0, result.days().getFirst().completionRate());
        assertEquals(0.0, result.days().get(1).completionRate());
        assertNull(result.days().get(2).completionRate());
    }

    @Test
    void rangeIncludesMondayAndSundayButExcludesAdjacentWeeksAndOtherUsers() {
        schedule(owner, monday.minusDays(1), true);
        schedule(owner, monday, true);
        schedule(owner, monday.plusDays(6), false);
        schedule(owner, monday.plusDays(7), true);
        schedule(other, monday, true, true, true);
        em.clear();
        var result = statistics.weekly(owner.getId(), monday.plusDays(6));
        assertEquals(2, result.totalCount());
        assertEquals(50.0, result.completionRate());
        assertEquals(1, result.days().getLast().incompleteCount());
    }

    @Test
    void emptyWeekReturnsSevenEmptyDaysAndNoRate() {
        var result = statistics.weekly(owner.getId(), monday);
        assertEquals(0, result.totalCount());
        assertEquals(0, result.completedCount());
        assertEquals(0, result.incompleteCount());
        assertNull(result.completionRate());
        assertEquals(7, result.days().size());
        assertTrue(result.days().stream().allMatch(day -> day.totalCount() == 0 && day.completionRate() == null));
    }

    @Test
    void checkingUncheckingAndDeletingImmediatelyChangeCounts() {
        var schedule = schedule(owner, monday, false, true);
        Long scheduleId = schedule.getId();
        Long first = schedule.getItems().getFirst().getId();
        Long second = schedule.getItems().getLast().getId();
        commands.updateCompletion(owner.getId(), scheduleId, first, true);
        em.flush(); em.clear();
        assertEquals(100.0, statistics.weekly(owner.getId(), monday).completionRate());
        commands.updateCompletion(owner.getId(), scheduleId, first, false);
        em.flush(); em.clear();
        assertEquals(50.0, statistics.weekly(owner.getId(), monday).completionRate());
        commands.deleteConfirmedScheduleItem(owner.getId(), scheduleId, second);
        em.flush(); em.clear();
        assertEquals(0.0, statistics.weekly(owner.getId(), monday).completionRate());
        commands.deleteConfirmedScheduleItem(owner.getId(), scheduleId, first);
        em.flush(); em.clear();
        assertNull(statistics.weekly(owner.getId(), monday).completionRate());
    }

    @Test
    void roundingIsToOneDecimalAndIncludesAllItemTypes() {
        schedule(owner, monday, true, false, false);
        var result = statistics.weekly(owner.getId(), monday);
        assertEquals(3, result.totalCount());
        assertEquals(33.3, result.completionRate());
    }

    @Test
    void crossingYearAndLeapDayUseCalendarWeeks() {
        var newYear = statistics.weekly(owner.getId(), LocalDate.of(2027, 1, 1));
        assertEquals(LocalDate.of(2026, 12, 28), newYear.weekStart());
        assertEquals(LocalDate.of(2027, 1, 3), newYear.weekEnd());
        var leap = statistics.weekly(owner.getId(), LocalDate.of(2028, 2, 29));
        assertEquals(LocalDate.of(2028, 2, 28), leap.weekStart());
        assertEquals(LocalDate.of(2028, 3, 5), leap.weekEnd());
    }

    @Test
    void omittedDateUsesKoreanCurrentWeekAndUnknownUserIsRejected() {
        var implicit = statistics.weekly(owner.getId(), null);
        var explicit = statistics.weekly(owner.getId(), KoreanDate.today());
        assertEquals(explicit, implicit);
        assertThrows(BusinessException.class, () -> statistics.weekly(-1L, monday));
    }

    @Test
    void reconfirmingDateReplacesPreviousTotals() {
        schedule(owner, monday, true, true, true);
        commands.confirmSchedule(owner.getId(), new ScheduleConfirmRequest(monday, List.of(
                new ScheduleConfirmItemRequest(ScheduleItemType.BREAK, "New rest", LocalTime.of(9, 0), LocalTime.of(10, 0), null, null, null))));
        em.flush(); em.clear();
        var result = statistics.weekly(owner.getId(), monday);
        assertEquals(1, result.totalCount());
        assertEquals(0, result.completedCount());
        assertEquals(0.0, result.completionRate());
    }
}
