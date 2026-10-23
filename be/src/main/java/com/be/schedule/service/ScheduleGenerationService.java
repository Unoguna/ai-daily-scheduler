package com.be.schedule.service;

import com.be.daily_condition.domain.DailyCondition;
import com.be.daily_condition.repository.DailyConditionRepository;
import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.goal.domain.Goal;
import com.be.goal.domain.GoalPriority;
import com.be.goal.domain.GoalStatus;
import com.be.goal.repository.GoalRepository;
import com.be.schedule.domain.DailyScheduleFeedback;
import com.be.schedule.domain.DailyTimeWindow;
import com.be.schedule.domain.FixedSchedule;
import com.be.schedule.domain.ScheduleItemType;
import com.be.schedule.domain.SchedulingProfile;
import com.be.schedule.dto.GeneratedScheduleItemResponse;
import com.be.schedule.dto.ScheduleGenerationResponse;
import com.be.schedule.dto.UnscheduledGoalResponse;
import com.be.schedule.repository.DailyScheduleFeedbackRepository;
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
    private final DailyScheduleFeedbackRepository dailyScheduleFeedbackRepository;

    public ScheduleGenerationResponse generateSchedule(Long userId, LocalDate date) {
        userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        LocalDate scheduleDate = date == null ? com.be.global.time.KoreanDate.today() : date;
        DailyCondition condition = dailyConditionRepository.findByUserIdAndDate(userId, scheduleDate)
                .orElseThrow(() -> new BusinessException(ErrorCode.DAILY_CONDITION_NOT_FOUND));
        SchedulingProfile profile = schedulingProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SCHEDULING_PROFILE_NOT_FOUND));
        FeedbackAdjustment feedbackAdjustment = dailyScheduleFeedbackRepository
                .findTopByUserIdAndDateLessThanEqualOrderByDateDesc(userId, scheduleDate.minusDays(1))
                .map(FeedbackAdjustment::from)
                .orElse(FeedbackAdjustment.none());

        var windows = DailyTimeWindow.intersect(profile.getWakeUpTime(), profile.getSleepTime(),
                profile.getPreferredStartTime(), profile.getPreferredEndTime());

        List<FixedSchedule> fixedSchedules = fixedScheduleRepository
                .findByUserIdAndDayOfWeek(userId, scheduleDate.getDayOfWeek()).stream()
                .sorted(Comparator.comparing(FixedSchedule::getStartTime))
                .toList();

        for (int index = 1; index < fixedSchedules.size(); index++) {
            if (fixedSchedules.get(index - 1).getEndTime().isAfter(fixedSchedules.get(index).getStartTime()))
                throw new BusinessException(ErrorCode.FIXED_SCHEDULE_OVERLAP);
        }

        List<GoalCandidate> goalCandidates = goalRepository.findByUserId(userId).stream()
                .filter(goal -> goal.getStatus() == GoalStatus.ACTIVE)
                .map(goal -> new GoalCandidate(goal, calculateGoalScore(goal, scheduleDate, condition)))
                .sorted(Comparator.comparingInt(GoalCandidate::score).reversed())
                .toList();

        int sessionMinutes = calculateSessionMinutes(profile, condition, feedbackAdjustment);
        int breakMinutes = calculateBreakMinutes(profile, condition, feedbackAdjustment);

        List<GeneratedScheduleItemResponse> items = new ArrayList<>();
        addFixedScheduleItems(items, fixedSchedules);
        addGoalWorkItems(
                items,
                windows.stream().flatMap(window -> calculateAvailableBlocks(window.start(), window.end(), fixedSchedules).stream()).toList(),
                goalCandidates,
                sessionMinutes,
                breakMinutes,
                feedbackAdjustment
        );

        List<GeneratedScheduleItemResponse> sortedItems = items.stream()
                .sorted(Comparator.comparing(GeneratedScheduleItemResponse::startTime)
                        .thenComparing(GeneratedScheduleItemResponse::endTime))
                .toList();

        List<String> notices = new ArrayList<>();
        if (profile.getSleepTime().isBefore(profile.getWakeUpTime())
                || profile.getPreferredEndTime().isBefore(profile.getPreferredStartTime())) {
            notices.add("자정을 넘는 생활 패턴은 선택한 날짜의 00:00~23:59 범위로 나누어 생성합니다. 새벽 일정도 선택한 날짜에 속합니다.");
        }
        if (goalCandidates.isEmpty()) notices.add("활성 목표가 없어 고정 일정만 표시합니다. 목표를 추가하거나 다시 활성화해 주세요.");
        var scheduledGoalIds = sortedItems.stream().filter(item -> item.type() == ScheduleItemType.GOAL_WORK)
                .map(GeneratedScheduleItemResponse::goalId).collect(java.util.stream.Collectors.toSet());
        String reason = scheduledGoalIds.isEmpty()
                ? "연속 " + sessionMinutes + "분의 집중 시간을 확보할 수 없습니다. 고정 일정이나 활동·집중 시간을 조정해 주세요."
                : "활동 시간과 우선순위·피드백을 반영한 배치 결과, 이 목표의 집중 시간을 확보하지 못했습니다.";
        var unscheduled = goalCandidates.stream().map(GoalCandidate::goal)
                .filter(goal -> !scheduledGoalIds.contains(goal.getId()))
                .map(goal -> new UnscheduledGoalResponse(goal.getId(), goal.getTitle(), reason)).toList();
        if (!unscheduled.isEmpty()) notices.add("배치하지 못한 목표가 " + unscheduled.size() + "개 있습니다.");

        return new ScheduleGenerationResponse(
                scheduleDate,
                sessionMinutes,
                breakMinutes,
                sortedItems,
                List.copyOf(notices),
                unscheduled
        );
    }

    private void addFixedScheduleItems(List<GeneratedScheduleItemResponse> items, List<FixedSchedule> fixedSchedules) {
        for (FixedSchedule fixedSchedule : fixedSchedules) {
            items.add(new GeneratedScheduleItemResponse(
                    ScheduleItemType.FIXED_SCHEDULE,
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
            int breakMinutes,
            FeedbackAdjustment feedbackAdjustment
    ) {
        if (goalCandidates.isEmpty()) {
            return;
        }

        int goalIndex = 0;
        for (TimeBlock block : availableBlocks) {
            LocalTime cursor = block.start();
            while (ChronoUnit.MINUTES.between(cursor, block.end()) >= sessionMinutes) {
                Goal goal = selectGoal(goalCandidates, goalIndex, cursor, feedbackAdjustment).goal();
                LocalTime workEnd = cursor.plusMinutes(sessionMinutes);

                items.add(new GeneratedScheduleItemResponse(
                        ScheduleItemType.GOAL_WORK,
                        goal.getTitle(),
                        cursor,
                        workEnd,
                        goal.getId(),
                        null,
                        goal.getDescription()
                ));

                goalIndex++;
                cursor = workEnd;

                if (ChronoUnit.MINUTES.between(cursor, block.end()) >= breakMinutes + sessionMinutes) {
                    LocalTime breakEnd = cursor.plusMinutes(breakMinutes);
                    items.add(new GeneratedScheduleItemResponse(
                            ScheduleItemType.BREAK,
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

    private GoalCandidate selectGoal(
            List<GoalCandidate> goalCandidates,
            int goalIndex,
            LocalTime cursor,
            FeedbackAdjustment feedbackAdjustment
    ) {
        if (feedbackAdjustment.avoidHeavyTasksAfter() == null
                || cursor.isBefore(feedbackAdjustment.avoidHeavyTasksAfter())) {
            return goalCandidates.get(goalIndex % goalCandidates.size());
        }

        return goalCandidates.stream()
                .filter(candidate -> candidate.goal().getPriority() != GoalPriority.HIGH)
                .findFirst()
                .orElse(goalCandidates.get(goalIndex % goalCandidates.size()));
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

    private int calculateSessionMinutes(
            SchedulingProfile profile,
            DailyCondition condition,
            FeedbackAdjustment feedbackAdjustment
    ) {
        int sessionMinutes = profile.getPreferredSessionMinutes();

        if (condition.getFatigueLevel() >= 4 || condition.getFocusLevel() <= 2) {
            sessionMinutes = Math.min(sessionMinutes, 40);
        } else if (condition.getFocusLevel() >= 4 && condition.getFatigueLevel() <= 2) {
            sessionMinutes = Math.max(sessionMinutes, 60);
        }

        sessionMinutes += feedbackAdjustment.sessionMinutesAdjustment();

        return Math.max(20, Math.min(120, sessionMinutes));
    }

    private int calculateBreakMinutes(
            SchedulingProfile profile,
            DailyCondition condition,
            FeedbackAdjustment feedbackAdjustment
    ) {
        int breakMinutes = profile.getBreakMinutes();

        if (condition.getFatigueLevel() >= 4 || condition.getFocusLevel() <= 2) {
            breakMinutes += 5;
        }

        breakMinutes += feedbackAdjustment.breakMinutesAdjustment();

        return Math.max(5, Math.min(40, breakMinutes));
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

    private record FeedbackAdjustment(
            int sessionMinutesAdjustment,
            int breakMinutesAdjustment,
            int afternoonFocusPenalty,
            LocalTime avoidHeavyTasksAfter
    ) {
        static FeedbackAdjustment from(DailyScheduleFeedback feedback) {
            return new FeedbackAdjustment(
                    feedback.getSessionMinutesAdjustment(),
                    feedback.getBreakMinutesAdjustment(),
                    feedback.getAfternoonFocusPenalty(),
                    feedback.getAvoidHeavyTasksAfter()
            );
        }

        static FeedbackAdjustment none() {
            return new FeedbackAdjustment(0, 0, 0, null);
        }
    }
}
