package com.be.daily_condition.service;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.daily_condition.domain.DailyCondition;
import com.be.daily_condition.dto.DailyConditionCreateRequest;
import com.be.user.domain.User;
import com.be.daily_condition.repository.DailyConditionRepository;
import com.be.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class DailyConditionService {

    UserRepository userRepository;
    DailyConditionRepository dailyConditionRepository;

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

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
