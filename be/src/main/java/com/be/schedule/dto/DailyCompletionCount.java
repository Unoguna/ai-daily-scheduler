package com.be.schedule.dto;

import java.time.LocalDate;

public record DailyCompletionCount(LocalDate date, Long totalCount, Long completedCount) {}
