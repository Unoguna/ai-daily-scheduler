package com.be.goal.service;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.goal.domain.Goal;
import com.be.goal.dto.GoalCreateRequest;
import com.be.goal.dto.GoalResponse;
import com.be.goal.dto.GoalUpdateRequest;
import com.be.goal.repository.GoalRepository;
import com.be.user.domain.User;
import com.be.user.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class GoalService {
    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

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

    @Transactional(readOnly = true)
    public List<GoalResponse> getGoals(Long userId) {
        getUser(userId);

        return goalRepository.findByUserIdOrderByIdDesc(userId).stream()
                .map(GoalResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public GoalResponse getGoal(Long userId, Long goalId) {
        getUser(userId);

        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

        return GoalResponse.from(goal);
    }

    public GoalResponse updateGoal(Long userId, Long goalId, GoalUpdateRequest request) {
        getUser(userId);

        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

        goal.update(
                request.title(),
                request.description(),
                request.priority(),
                request.targetDate()
        );

        return GoalResponse.from(goal);
    }

    public void deleteGoal(Long userId, Long goalId) {
        getUser(userId);

        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

        goalRepository.delete(goal);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
