package com.be.schedule.dto;

import jakarta.validation.constraints.NotNull;

public record ScheduleCompletionRequest(@NotNull Boolean completed) {}
