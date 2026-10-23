package com.be.schedule.domain;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/** Minute-based intervals belonging to the selected calendar date. */
public record DailyTimeWindow(LocalTime start, LocalTime end) {
    private static final LocalTime DAY_END = LocalTime.of(23, 59);

    public static List<DailyTimeWindow> intersect(LocalTime wake, LocalTime sleep,
                                                 LocalTime preferredStart, LocalTime preferredEnd) {
        List<DailyTimeWindow> result = new ArrayList<>();
        for (var awake : split(wake, sleep)) {
            for (var preferred : split(preferredStart, preferredEnd)) {
                LocalTime start = awake.start.isAfter(preferred.start) ? awake.start : preferred.start;
                LocalTime end = awake.end.isBefore(preferred.end) ? awake.end : preferred.end;
                if (start.isBefore(end)) result.add(new DailyTimeWindow(start, end));
            }
        }
        if (result.isEmpty()) throw new BusinessException(ErrorCode.INVALID_SCHEDULING_WINDOW);
        result.sort(Comparator.comparing(DailyTimeWindow::start));
        return List.copyOf(result);
    }

    private static List<DailyTimeWindow> split(LocalTime start, LocalTime end) {
        if (start == null || end == null || start.equals(end))
            throw new BusinessException(ErrorCode.INVALID_SCHEDULING_WINDOW);
        if (start.isBefore(end)) return List.of(new DailyTimeWindow(start, end));
        List<DailyTimeWindow> parts = new ArrayList<>();
        if (end.isAfter(LocalTime.MIDNIGHT)) parts.add(new DailyTimeWindow(LocalTime.MIDNIGHT, end));
        if (start.isBefore(DAY_END)) parts.add(new DailyTimeWindow(start, DAY_END));
        return parts;
    }
}
