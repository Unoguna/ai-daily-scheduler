package com.be.schedule.service;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.global.response.IdResponse;
import com.be.schedule.domain.ConfirmedSchedule;
import com.be.schedule.domain.ConfirmedScheduleItem;
import com.be.schedule.dto.ConfirmedScheduleResponse;
import com.be.schedule.dto.ScheduleConfirmItemRequest;
import com.be.schedule.dto.ScheduleConfirmRequest;
import com.be.schedule.repository.ConfirmedScheduleRepository;
import com.be.user.domain.User;
import com.be.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleConfirmService {

    private final UserRepository userRepository;
    private final ConfirmedScheduleRepository confirmedScheduleRepository;

    public IdResponse confirmSchedule(Long userId, ScheduleConfirmRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        confirmedScheduleRepository.findByUserIdAndDate(userId, request.date())
                .ifPresent(confirmedScheduleRepository::delete);
        confirmedScheduleRepository.flush();

        ConfirmedSchedule confirmedSchedule = ConfirmedSchedule.create(user, request.date());
        List<ScheduleConfirmItemRequest> sortedItems = request.items().stream()
                .sorted(Comparator.comparing(ScheduleConfirmItemRequest::startTime)
                        .thenComparing(ScheduleConfirmItemRequest::endTime))
                .toList();

        for (int i = 0; i < sortedItems.size(); i++) {
            ScheduleConfirmItemRequest item = sortedItems.get(i);
            confirmedSchedule.addItem(ConfirmedScheduleItem.create(
                    i + 1,
                    item.type(),
                    item.title(),
                    item.startTime(),
                    item.endTime(),
                    item.goalId(),
                    item.fixedScheduleId(),
                    item.description()
            ));
        }

        Long confirmedScheduleId = confirmedScheduleRepository.save(confirmedSchedule).getId();
        return new IdResponse(confirmedScheduleId);
    }

    public ConfirmedScheduleResponse updateConfirmedScheduleItem(
            Long userId,
            Long scheduleId,
            Long itemId,
            ScheduleConfirmItemRequest request
    ) {
        ConfirmedSchedule confirmedSchedule = getConfirmedSchedule(userId, scheduleId);
        ConfirmedScheduleItem item = getConfirmedScheduleItem(confirmedSchedule, itemId);

        item.update(
                request.type(),
                request.title(),
                request.startTime(),
                request.endTime(),
                request.goalId(),
                request.fixedScheduleId(),
                request.description()
        );
        confirmedSchedule.resequenceItems();

        return ConfirmedScheduleResponse.from(confirmedSchedule);
    }

    public ConfirmedScheduleResponse deleteConfirmedScheduleItem(Long userId, Long scheduleId, Long itemId) {
        ConfirmedSchedule confirmedSchedule = getConfirmedSchedule(userId, scheduleId);
        ConfirmedScheduleItem item = getConfirmedScheduleItem(confirmedSchedule, itemId);

        confirmedSchedule.removeItem(item);
        if (confirmedSchedule.getItems().isEmpty()) {
            confirmedScheduleRepository.delete(confirmedSchedule);
            return null;
        }

        return ConfirmedScheduleResponse.from(confirmedSchedule);
    }

    private ConfirmedSchedule getConfirmedSchedule(Long userId, Long scheduleId) {
        return confirmedScheduleRepository.findByIdAndUserId(scheduleId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
    }

    private ConfirmedScheduleItem getConfirmedScheduleItem(ConfirmedSchedule confirmedSchedule, Long itemId) {
        return confirmedSchedule.findItem(itemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
    }
}
