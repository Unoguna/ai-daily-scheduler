package com.be.schedule.service;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.global.response.IdResponse;
import com.be.schedule.domain.ConfirmedSchedule;
import com.be.schedule.domain.ConfirmedScheduleItem;
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
}
