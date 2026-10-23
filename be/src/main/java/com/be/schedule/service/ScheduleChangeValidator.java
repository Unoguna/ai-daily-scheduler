package com.be.schedule.service;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.schedule.domain.ScheduleItemType;
import com.be.schedule.dto.*;
import com.be.schedule.repository.FixedScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.*;

@Component
@RequiredArgsConstructor
public class ScheduleChangeValidator {
    private final FixedScheduleRepository fixedSchedules;

    public ConfirmedScheduleResponse preview(Long userId, ConfirmedScheduleResponse before, ScheduleChangePlan plan) {
        if (plan == null || plan.summary() == null || plan.summary().isBlank() || plan.summary().length() > 1000
                || plan.commands() == null || plan.commands().isEmpty() || plan.commands().size() > 30) invalid();
        List<ConfirmedScheduleItemResponse> result = new ArrayList<>(before.items());
        Set<Long> touched = new HashSet<>();
        for (ScheduleChangeCommand command : plan.commands()) {
            if (command == null || command.action() == null) invalid();
            if (command.action() == ScheduleChangeCommand.Action.ADD_BREAK) {
                if (command.itemId() != null || command.title() == null || command.title().isBlank()
                        || command.title().length() > 100) invalid();
                result.add(new ConfirmedScheduleItemResponse(null, 0, ScheduleItemType.BREAK,
                        command.title().trim(), time(command.startTime()), time(command.endTime()), null, null, null, false));
                continue;
            }
            if (command.itemId() == null || !touched.add(command.itemId())) invalid();
            ConfirmedScheduleItemResponse item = before.items().stream()
                    .filter(candidate -> Objects.equals(candidate.scheduleItemId(), command.itemId()))
                    .findFirst().orElseThrow(() -> new BusinessException(ErrorCode.INVALID_SCHEDULE_CHANGE));
            if (item.completed() || item.type() == ScheduleItemType.FIXED_SCHEDULE || item.fixedScheduleId() != null)
                throw new BusinessException(ErrorCode.SCHEDULE_CHANGE_PROTECTED);
            if (command.title() != null) invalid();
            result.remove(item);
            if (command.action() == ScheduleChangeCommand.Action.UPDATE_TIME) {
                result.add(new ConfirmedScheduleItemResponse(item.scheduleItemId(), item.sequence(), item.type(), item.title(),
                        time(command.startTime()), time(command.endTime()), item.goalId(), item.fixedScheduleId(), item.description(), item.completed()));
            } else if (command.startTime() != null || command.endTime() != null) invalid();
        }
        if (result.isEmpty()) invalid();
        result.sort(Comparator.comparing(ConfirmedScheduleItemResponse::startTime).thenComparing(ConfirmedScheduleItemResponse::endTime));
        for (int index = 0; index < result.size(); index++) {
            var item = result.get(index);
            if (!item.startTime().isBefore(item.endTime())) throw new BusinessException(ErrorCode.INVALID_TIME_RANGE);
            if (index > 0 && result.get(index - 1).endTime().isAfter(item.startTime()))
                throw new BusinessException(ErrorCode.SCHEDULE_CHANGE_CONFLICT);
        }
        for (var fixed : fixedSchedules.findByUserIdAndDayOfWeek(userId, before.date().getDayOfWeek())) {
            for (var item : result) {
                if (!Objects.equals(item.fixedScheduleId(), fixed.getId()) && fixed.isMandatory()
                        && item.startTime().isBefore(fixed.getEndTime()) && item.endTime().isAfter(fixed.getStartTime()))
                    throw new BusinessException(ErrorCode.SCHEDULE_CHANGE_CONFLICT);
            }
        }
        List<ConfirmedScheduleItemResponse> ordered = new ArrayList<>();
        for (int index = 0; index < result.size(); index++) {
            var item = result.get(index);
            ordered.add(new ConfirmedScheduleItemResponse(item.scheduleItemId(), index + 1, item.type(), item.title(),
                    item.startTime(), item.endTime(), item.goalId(), item.fixedScheduleId(), item.description(), item.completed()));
        }
        if (ordered.equals(before.items())) invalid();
        return new ConfirmedScheduleResponse(before.confirmedScheduleId(), before.date(), List.copyOf(ordered));
    }

    private LocalTime time(String value) {
        try {
            if (value == null || !value.matches("\\d{2}:\\d{2}(:00)?")) invalid();
            return LocalTime.parse(value);
        } catch (RuntimeException exception) {
            throw new BusinessException(ErrorCode.INVALID_TIME_RANGE);
        }
    }

    private void invalid() { throw new BusinessException(ErrorCode.INVALID_SCHEDULE_CHANGE); }
}
