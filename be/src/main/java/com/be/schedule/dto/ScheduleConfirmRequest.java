package com.be.schedule.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record ScheduleConfirmRequest(
        @NotNull
        LocalDate date,

        @NotEmpty
        List<@Valid ScheduleConfirmItemRequest> items
) {
}
