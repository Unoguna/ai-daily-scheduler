package com.be.schedule.service;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.schedule.domain.DailyCondition;
import com.be.schedule.domain.FixedSchedule;
import com.be.schedule.domain.Goal;
import com.be.schedule.domain.SchedulingProfile;
import com.be.schedule.dto.DailyConditionCreateRequest;
import com.be.schedule.dto.FixedScheduleCreateRequest;
import com.be.schedule.dto.GoalCreateRequest;
import com.be.schedule.dto.SchedulingProfileCreateRequest;
import com.be.schedule.repository.DailyConditionRepository;
import com.be.schedule.repository.FixedScheduleRepository;
import com.be.schedule.repository.GoalRepository;
import com.be.schedule.repository.SchedulingProfileRepository;
import com.be.user.domain.User;
import com.be.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleCommandService {

    private final UserRepository userRepository;
    private final SchedulingProfileRepository schedulingProfileRepository;
    private final GoalRepository goalRepository;
    private final FixedScheduleRepository fixedScheduleRepository;
    private final DailyConditionRepository dailyConditionRepository;

    public Long createSchedulingProfile(Long userId, SchedulingProfileCreateRequest request) {
        User user = getUser(userId);

        if (schedulingProfileRepository.existsByUserId(userId)) {
            throw new BusinessException(ErrorCode.SCHEDULING_PROFILE_ALREADY_EXISTS);
        }

        SchedulingProfile profile = SchedulingProfile.create(
                user,
                request.preferredStartTime(),
                request.preferredEndTime(),
                request.wakeUpTime(),
                request.sleepTime(),
                request.energyPattern(),
                request.preferredSessionMinutes(),
                request.breakMinutes()
        );

        return schedulingProfileRepository.save(profile).getId();
    }

    public Long createGoal(Long userId, GoalCreateRequest request) {
        User user = getUser(userId);

        Goal goal = Goal.create(
                user,
                request.title(),
                request.description(),
                request.priority(),
                request.targetDate()
        );

        return goalRepository.save(goal).getId();
    }

    public Long createFixedSchedule(Long userId, FixedScheduleCreateRequest request) {
        User user = getUser(userId);

        FixedSchedule fixedSchedule = FixedSchedule.create(
                user,
                request.dayOfWeek(),
                request.title(),
                request.category(),
                request.startTime(),
                request.endTime(),
                request.mandatory()
        );

        return fixedScheduleRepository.save(fixedSchedule).getId();
    }

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