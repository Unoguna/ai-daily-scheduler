package com.be.schedule.dto;

import com.be.schedule.domain.ConfirmedSchedule;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

public record ConfirmedScheduleResponse(
        Long confirmedScheduleId,
        LocalDate date,
        List<ConfirmedScheduleItemResponse> items
) {
    public static ConfirmedScheduleResponse from(ConfirmedSchedule confirmedSchedule) {
        List<ConfirmedScheduleItemResponse> items = confirmedSchedule.getItems().stream()
                .sorted(Comparator.comparingInt(item -> item.getSequence() == null ? 0 : item.getSequence()))
                .map(ConfirmedScheduleItemResponse::from)
                .toList();

        return new ConfirmedScheduleResponse(
                confirmedSchedule.getId(),
                confirmedSchedule.getDate(),
                items
        );
    }
}
