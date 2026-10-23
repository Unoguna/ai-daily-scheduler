package com.be.schedule.dto;

import java.util.List;

public record ScheduleChangePlan(String summary, List<ScheduleChangeCommand> commands) {}
