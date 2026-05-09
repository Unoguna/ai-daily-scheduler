package com.be.schedule.dto;

import java.time.LocalTime;

public record GeneratedScheduleItemResponse(
        GeneratedScheduleItemType type,
        String title,
        LocalTime startTime,
        LocalTime endTime,
        Long goalId,
        Long fixedScheduleId,
        String description
) {
}
