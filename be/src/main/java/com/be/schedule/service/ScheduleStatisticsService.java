package com.be.schedule.service;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.global.time.KoreanDate;
import com.be.schedule.dto.DailyCompletionCount;
import com.be.schedule.dto.WeeklyCompletionResponse;
import com.be.schedule.repository.ConfirmedScheduleRepository;
import com.be.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleStatisticsService {
    private final UserRepository users;
    private final ConfirmedScheduleRepository schedules;

    public WeeklyCompletionResponse weekly(Long userId, LocalDate date) {
        users.findById(userId).orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        LocalDate selected = date == null ? KoreanDate.today() : date;
        LocalDate start = selected.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate end = start.plusDays(6);
        Map<LocalDate, DailyCompletionCount> counts = schedules.countCompletionByDate(userId, start, end).stream()
                .collect(Collectors.toMap(DailyCompletionCount::date, Function.identity()));
        var days = new ArrayList<WeeklyCompletionResponse.Day>();
        long total = 0;
        long completed = 0;
        for (int index = 0; index < 7; index++) {
            LocalDate day = start.plusDays(index);
            var count = counts.get(day);
            long dayTotal = count == null ? 0 : count.totalCount();
            long dayCompleted = count == null ? 0 : count.completedCount();
            days.add(new WeeklyCompletionResponse.Day(day, dayTotal, dayCompleted,
                    dayTotal - dayCompleted, rate(dayCompleted, dayTotal)));
            total += dayTotal;
            completed += dayCompleted;
        }
        return new WeeklyCompletionResponse(start, end, total, completed, total - completed,
                rate(completed, total), java.util.List.copyOf(days));
    }

    private Double rate(long completed, long total) {
        return total == 0 ? null : Math.round(completed * 1000.0 / total) / 10.0;
    }
}
