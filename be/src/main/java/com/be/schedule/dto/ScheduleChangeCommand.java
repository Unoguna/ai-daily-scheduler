package com.be.schedule.dto;

public record ScheduleChangeCommand(Action action, Long itemId, String startTime, String endTime, String title) {
    public enum Action { UPDATE_TIME, DELETE, ADD_BREAK }
}
