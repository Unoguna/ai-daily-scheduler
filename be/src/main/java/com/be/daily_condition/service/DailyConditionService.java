package com.be.daily_condition.service;

import com.be.daily_condition.dto.DailyConditionResponse;
import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.daily_condition.domain.DailyCondition;
import com.be.daily_condition.dto.DailyConditionCreateRequest;
import com.be.user.domain.User;
import com.be.daily_condition.repository.DailyConditionRepository;
import com.be.user.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
public class DailyConditionService {

    private final UserRepository userRepository;
    private final DailyConditionRepository dailyConditionRepository;

    public Long createDailyCondition(Long userId, DailyConditionCreateRequest request) {
        User user = getUser(userId);

        if (dailyConditionRepository.existsByUserIdAndDate(userId, request.date())) {
            throw new BusinessException(ErrorCode.DAILY_CONDITION_ALREADY_EXISTS);
        }

        DailyCondition dailyCondition = DailyCondition.create(
                user,
                request.date(),
                request.fatigueLevel(),
                request.focusLevel(),
                request.emotionState(),
                request.memo()
        );

        return dailyConditionRepository.save(dailyCondition).getId();
    }

    @Transactional(readOnly = true)
    public DailyConditionResponse getDailyCondition(Long userId, LocalDate date) {
        LocalDate conditionDate = date == null ? LocalDate.now() : date;

        DailyCondition dailyCondition = dailyConditionRepository
                .findByUserIdAndDate(userId, conditionDate)
                .orElseThrow(() -> new BusinessException(ErrorCode.DAILY_CONDITION_NOT_FOUND));

        return DailyConditionResponse.from(dailyCondition);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
