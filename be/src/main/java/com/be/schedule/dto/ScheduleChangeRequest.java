package com.be.schedule.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ScheduleChangeRequest(@NotBlank @Size(max = 1000) String message) {}
