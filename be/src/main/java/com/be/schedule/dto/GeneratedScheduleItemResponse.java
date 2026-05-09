package com.be.schedule.dto;

import com.be.schedule.domain.ScheduleItemType;

import java.time.LocalTime;

public record GeneratedScheduleItemResponse(
        ScheduleItemType type,
        String title,
        LocalTime startTime,
        LocalTime endTime,
        Long goalId,
        Long fixedScheduleId,
        String description
) {
}
