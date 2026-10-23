package com.be.schedule.service;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.schedule.domain.DailyScheduleFeedback;
import com.be.schedule.dto.ScheduleFeedbackAnalysis;
import com.be.schedule.dto.ScheduleFeedbackRequest;
import com.be.schedule.dto.ScheduleFeedbackResponse;
import com.be.schedule.repository.DailyScheduleFeedbackRepository;
import com.be.user.domain.User;
import com.be.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import com.be.global.time.KoreanDate;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleFeedbackService {

    private final UserRepository userRepository;
    private final DailyScheduleFeedbackRepository dailyScheduleFeedbackRepository;
    private final ScheduleFeedbackAnalysisService scheduleFeedbackAnalysisService;

    @Transactional(readOnly = true)
    public ScheduleFeedbackResponse getFeedback(Long userId, LocalDate date) {
        userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return dailyScheduleFeedbackRepository.findByUserIdAndDate(userId, date == null ? KoreanDate.today() : date)
                .map(ScheduleFeedbackResponse::from).orElse(null);
    }

    public ScheduleFeedbackResponse createFeedback(Long userId, ScheduleFeedbackRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ScheduleFeedbackAnalysis analysis = scheduleFeedbackAnalysisService.analyze(request);

        var existing = dailyScheduleFeedbackRepository.findByUserIdAndDate(userId, request.date());
        if (existing.isPresent()) {
            DailyScheduleFeedback feedback = existing.get();
            feedback.update(request.satisfactionScore(), request.rawFeedback(), analysis.summary(),
                    analysis.sessionMinutesAdjustment(), analysis.breakMinutesAdjustment(),
                    analysis.afternoonFocusPenalty(), analysis.avoidHeavyTasksAfter());
            return ScheduleFeedbackResponse.from(feedback);
        }

        DailyScheduleFeedback feedback = DailyScheduleFeedback.create(
                user,
                request.date(),
                request.satisfactionScore(),
                request.rawFeedback(),
                analysis.summary(),
                analysis.sessionMinutesAdjustment(),
                analysis.breakMinutesAdjustment(),
                analysis.afternoonFocusPenalty(),
                analysis.avoidHeavyTasksAfter()
        );

        return ScheduleFeedbackResponse.from(dailyScheduleFeedbackRepository.save(feedback));
    }
}
