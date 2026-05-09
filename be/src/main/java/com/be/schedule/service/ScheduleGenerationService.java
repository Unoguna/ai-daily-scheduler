package com.be.schedule.service;

import com.be.daily_condition.domain.DailyCondition;
import com.be.daily_condition.repository.DailyConditionRepository;
import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.goal.domain.Goal;
import com.be.goal.domain.GoalPriority;
import com.be.goal.domain.GoalStatus;
import com.be.goal.repository.GoalRepository;
import com.be.schedule.domain.FixedSchedule;
import com.be.schedule.domain.SchedulingProfile;
import com.be.schedule.dto.GeneratedScheduleItemResponse;
import com.be.schedule.dto.GeneratedScheduleItemType;
import com.be.schedule.dto.ScheduleGenerationResponse;
import com.be.schedule.repository.FixedScheduleRepository;
import com.be.schedule.repository.SchedulingProfileRepository;
import com.be.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleGenerationService {

    private final UserRepository userRepository;
    private final DailyConditionRepository dailyConditionRepository;
    private final GoalRepository goalRepository;
    private final FixedScheduleRepository fixedScheduleRepository;
    private final SchedulingProfileRepository schedulingProfileRepository;

    public ScheduleGenerationResponse generateSchedule(Long userId, LocalDate date) {
        userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        LocalDate scheduleDate = date == null ? LocalDate.now() : date;
        DailyCondition condition = dailyConditionRepository.findByUserIdAndDate(userId, scheduleDate)
                .orElseThrow(() -> new BusinessException(ErrorCode.DAILY_CONDITION_NOT_FOUND));
        SchedulingProfile profile = schedulingProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

        LocalTime scheduleStart = max(profile.getWakeUpTime(), profile.getPreferredStartTime());
        LocalTime scheduleEnd = min(profile.getSleepTime(), profile.getPreferredEndTime());
        if (!scheduleStart.isBefore(scheduleEnd)) {
            throw new BusinessException(ErrorCode.INVALID_TIME_RANGE);
        }

        List<FixedSchedule> fixedSchedules = fixedScheduleRepository
                .findByUserIdAndDayOfWeek(userId, scheduleDate.getDayOfWeek()).stream()
                .sorted(Comparator.comparing(FixedSchedule::getStartTime))
                .toList();

        List<GoalCandidate> goalCandidates = goalRepository.findByUserId(userId).stream()
                .filter(goal -> goal.getStatus() == GoalStatus.ACTIVE)
                .map(goal -> new GoalCandidate(goal, calculateGoalScore(goal, scheduleDate, condition)))
                .sorted(Comparator.comparingInt(GoalCandidate::score).reversed())
                .toList();

        int sessionMinutes = calculateSessionMinutes(profile, condition);
        int breakMinutes = calculateBreakMinutes(profile, condition);

        List<GeneratedScheduleItemResponse> items = new ArrayList<>();
        addFixedScheduleItems(items, fixedSchedules);
        addGoalWorkItems(
                items,
                calculateAvailableBlocks(scheduleStart, scheduleEnd, fixedSchedules),
                goalCandidates,
                sessionMinutes,
                breakMinutes
        );

        List<GeneratedScheduleItemResponse> sortedItems = items.stream()
                .sorted(Comparator.comparing(GeneratedScheduleItemResponse::startTime)
                        .thenComparing(GeneratedScheduleItemResponse::endTime))
                .toList();

        return new ScheduleGenerationResponse(
                scheduleDate,
                sessionMinutes,
                breakMinutes,
                sortedItems
        );
    }

    private void addFixedScheduleItems(List<GeneratedScheduleItemResponse> items, List<FixedSchedule> fixedSchedules) {
        for (FixedSchedule fixedSchedule : fixedSchedules) {
            items.add(new GeneratedScheduleItemResponse(
                    GeneratedScheduleItemType.FIXED_SCHEDULE,
                    fixedSchedule.getTitle(),
                    fixedSchedule.getStartTime(),
                    fixedSchedule.getEndTime(),
                    null,
                    fixedSchedule.getId(),
                    fixedSchedule.getCategory().name()
            ));
        }
    }

    private void addGoalWorkItems(
            List<GeneratedScheduleItemResponse> items,
            List<TimeBlock> availableBlocks,
            List<GoalCandidate> goalCandidates,
            int sessionMinutes,
            int breakMinutes
    ) {
        if (goalCandidates.isEmpty()) {
            return;
        }

        int goalIndex = 0;
        for (TimeBlock block : availableBlocks) {
            LocalTime cursor = block.start();
            while (!cursor.plusMinutes(sessionMinutes).isAfter(block.end())) {
                Goal goal = goalCandidates.get(goalIndex % goalCandidates.size()).goal();
                LocalTime workEnd = cursor.plusMinutes(sessionMinutes);

                items.add(new GeneratedScheduleItemResponse(
                        GeneratedScheduleItemType.GOAL_WORK,
                        goal.getTitle(),
                        cursor,
                        workEnd,
                        goal.getId(),
                        null,
                        goal.getDescription()
                ));

                goalIndex++;
                cursor = workEnd;

                if (!cursor.plusMinutes(breakMinutes + sessionMinutes).isAfter(block.end())) {
                    LocalTime breakEnd = cursor.plusMinutes(breakMinutes);
                    items.add(new GeneratedScheduleItemResponse(
                            GeneratedScheduleItemType.BREAK,
                            "Break",
                            cursor,
                            breakEnd,
                            null,
                            null,
                            null
                    ));
                    cursor = breakEnd;
                } else {
                    break;
                }
            }
        }
    }

    private List<TimeBlock> calculateAvailableBlocks(
            LocalTime scheduleStart,
            LocalTime scheduleEnd,
            List<FixedSchedule> fixedSchedules
    ) {
        List<TimeBlock> blocks = new ArrayList<>();
        LocalTime cursor = scheduleStart;

        for (FixedSchedule fixedSchedule : fixedSchedules) {
            LocalTime fixedStart = max(fixedSchedule.getStartTime(), scheduleStart);
            LocalTime fixedEnd = min(fixedSchedule.getEndTime(), scheduleEnd);

            if (!fixedStart.isBefore(fixedEnd)) {
                continue;
            }

            if (cursor.isBefore(fixedStart)) {
                blocks.add(new TimeBlock(cursor, fixedStart));
            }

            if (cursor.isBefore(fixedEnd)) {
                cursor = fixedEnd;
            }
        }

        if (cursor.isBefore(scheduleEnd)) {
            blocks.add(new TimeBlock(cursor, scheduleEnd));
        }

        return blocks;
    }

    private int calculateGoalScore(Goal goal, LocalDate scheduleDate, DailyCondition condition) {
        int score = switch (goal.getPriority()) {
            case HIGH -> 50;
            case MEDIUM -> 30;
            case LOW -> 10;
        };

        if (goal.getTargetDate() != null) {
            long daysUntilTarget = ChronoUnit.DAYS.between(scheduleDate, goal.getTargetDate());
            if (daysUntilTarget < 0) {
                score += 60;
            } else if (daysUntilTarget == 0) {
                score += 50;
            } else if (daysUntilTarget <= 3) {
                score += 35;
            } else if (daysUntilTarget <= 7) {
                score += 20;
            }
        }

        if (condition.getFocusLevel() >= 4 && goal.getPriority() == GoalPriority.HIGH) {
            score += 10;
        }
        if (condition.getFatigueLevel() >= 4 && goal.getPriority() == GoalPriority.LOW) {
            score += 5;
        }

        return score;
    }

    private int calculateSessionMinutes(SchedulingProfile profile, DailyCondition condition) {
        int sessionMinutes = profile.getPreferredSessionMinutes();

        if (condition.getFatigueLevel() >= 4 || condition.getFocusLevel() <= 2) {
            sessionMinutes = Math.min(sessionMinutes, 40);
        } else if (condition.getFocusLevel() >= 4 && condition.getFatigueLevel() <= 2) {
            sessionMinutes = Math.max(sessionMinutes, 60);
        }

        return Math.max(20, sessionMinutes);
    }

    private int calculateBreakMinutes(SchedulingProfile profile, DailyCondition condition) {
        int breakMinutes = profile.getBreakMinutes();

        if (condition.getFatigueLevel() >= 4 || condition.getFocusLevel() <= 2) {
            breakMinutes += 5;
        }

        return Math.max(5, breakMinutes);
    }

    private LocalTime max(LocalTime first, LocalTime second) {
        return first.isAfter(second) ? first : second;
    }

    private LocalTime min(LocalTime first, LocalTime second) {
        return first.isBefore(second) ? first : second;
    }

    private record TimeBlock(LocalTime start, LocalTime end) {
    }

    private record GoalCandidate(Goal goal, int score) {
    }
}
