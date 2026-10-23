package com.be.schedule.dto;

public record ScheduleChangePreview(String proposalId, String summary,
                                    ConfirmedScheduleResponse before, ConfirmedScheduleResponse after) {}
