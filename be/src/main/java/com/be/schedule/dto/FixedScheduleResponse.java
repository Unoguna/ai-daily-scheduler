package com.be.schedule.dto;

import com.be.schedule.domain.FixedSchedule;
import com.be.schedule.domain.ScheduleCategory;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record FixedScheduleResponse(
        Long fixedScheduleId,
        DayOfWeek dayOfWeek,
        String title,
        ScheduleCategory category,
        LocalTime startTime,
        LocalTime endTime,
        boolean mandatory
) {
    public static FixedScheduleResponse from(FixedSchedule fixedSchedule) {
        return new FixedScheduleResponse(
                fixedSchedule.getId(),
                fixedSchedule.getDayOfWeek(),
                fixedSchedule.getTitle(),
                fixedSchedule.getCategory(),
                fixedSchedule.getStartTime(),
                fixedSchedule.getEndTime(),
                fixedSchedule.isMandatory()
        );
    }
}
