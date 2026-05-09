package com.be.schedule.dto;

import java.time.LocalDate;
import java.util.List;

public record ScheduleGenerationResponse(
        LocalDate date,
        Integer sessionMinutes,
        Integer breakMinutes,
        List<GeneratedScheduleItemResponse> items
) {
}
