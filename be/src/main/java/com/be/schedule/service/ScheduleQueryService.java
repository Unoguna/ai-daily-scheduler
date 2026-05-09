package com.be.schedule.service;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.schedule.domain.ConfirmedSchedule;
import com.be.schedule.dto.ConfirmedScheduleResponse;
import com.be.schedule.repository.ConfirmedScheduleRepository;
import com.be.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleQueryService {

    private final UserRepository userRepository;
    private final ConfirmedScheduleRepository confirmedScheduleRepository;

    public ConfirmedScheduleResponse getDailySchedule(Long userId, LocalDate date) {
        userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        LocalDate scheduleDate = date == null ? LocalDate.now() : date;
        ConfirmedSchedule confirmedSchedule = confirmedScheduleRepository.findByUserIdAndDate(userId, scheduleDate)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

        return ConfirmedScheduleResponse.from(confirmedSchedule);
    }
}
