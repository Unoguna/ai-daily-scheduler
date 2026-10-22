package com.be.schedule.service;

import com.be.daily_condition.domain.DailyCondition;
import com.be.daily_condition.repository.DailyConditionRepository;
import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.goal.repository.GoalRepository;
import com.be.schedule.repository.*;
import com.be.user.domain.User;
import com.be.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ScheduleGenerationServiceTest {
    @Test
    void missingProfileExplainsRequiredSetup() {
        UserRepository users = mock(UserRepository.class);
        DailyConditionRepository conditions = mock(DailyConditionRepository.class);
        SchedulingProfileRepository profiles = mock(SchedulingProfileRepository.class);
        GoalRepository goals = mock(GoalRepository.class);
        FixedScheduleRepository fixed = mock(FixedScheduleRepository.class);
        DailyScheduleFeedbackRepository feedback = mock(DailyScheduleFeedbackRepository.class);
        LocalDate date = LocalDate.of(2026, 10, 22);
        when(users.findById(1L)).thenReturn(Optional.of(mock(User.class)));
        when(conditions.findByUserIdAndDate(1L, date)).thenReturn(Optional.of(mock(DailyCondition.class)));
        when(profiles.findByUserId(1L)).thenReturn(Optional.empty());
        ScheduleGenerationService service = new ScheduleGenerationService(
                users, conditions, goals, fixed, profiles, feedback);

        BusinessException error = assertThrows(BusinessException.class,
                () -> service.generateSchedule(1L, date));
        assertEquals(ErrorCode.SCHEDULING_PROFILE_NOT_FOUND, error.getErrorCode());
        verifyNoInteractions(goals, fixed, feedback);
    }
}
