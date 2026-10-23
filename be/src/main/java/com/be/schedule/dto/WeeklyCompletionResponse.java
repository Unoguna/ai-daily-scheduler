package com.be.schedule.dto;

import java.time.LocalDate;
import java.util.List;

public record WeeklyCompletionResponse(LocalDate weekStart, LocalDate weekEnd, long totalCount,
                                       long completedCount, long incompleteCount, Double completionRate,
                                       List<Day> days) {
    public record Day(LocalDate date, long totalCount, long completedCount, long incompleteCount,
                      Double completionRate) {}
}
