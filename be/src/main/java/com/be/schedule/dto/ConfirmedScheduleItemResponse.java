package com.be.schedule.dto;

import com.be.schedule.domain.ConfirmedScheduleItem;
import com.be.schedule.domain.ScheduleItemType;

import java.time.LocalTime;

public record ConfirmedScheduleItemResponse(
        Long scheduleItemId,
        Integer sequence,
        ScheduleItemType type,
        String title,
        LocalTime startTime,
        LocalTime endTime,
        Long goalId,
        Long fixedScheduleId,
        String description
) {
    public static ConfirmedScheduleItemResponse from(ConfirmedScheduleItem item) {
        return new ConfirmedScheduleItemResponse(
                item.getId(),
                item.getSequence(),
                item.getType(),
                item.getTitle(),
                item.getStartTime(),
                item.getEndTime(),
                item.getGoalId(),
                item.getFixedScheduleId(),
                item.getDescription()
        );
    }
}
