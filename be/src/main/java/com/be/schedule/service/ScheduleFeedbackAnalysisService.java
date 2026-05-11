package com.be.schedule.service;

import com.be.schedule.dto.ScheduleFeedbackAnalysis;
import com.be.schedule.dto.ScheduleFeedbackRequest;
import org.springframework.stereotype.Service;

import java.time.LocalTime;

@Service
public class ScheduleFeedbackAnalysisService {

    public ScheduleFeedbackAnalysis analyze(ScheduleFeedbackRequest request) {
        String feedback = request.rawFeedback().toLowerCase();

        int sessionAdjustment = 0;
        int breakAdjustment = 0;
        int afternoonPenalty = 0;
        LocalTime avoidHeavyTasksAfter = null;

        if (containsAny(
                feedback,
                "\uBE61\uC14C",
                "\uD798\uB4E4",
                "\uD53C\uACE4",
                "\uC9C0\uCCE4",
                "\uBB34\uB9AC",
                "\uB9CE\uC558"
        )) {
            sessionAdjustment -= 15;
            breakAdjustment += 5;
        }

        if (containsAny(
                feedback,
                "\uB108\uBB34 \uC26C\uC6E0",
                "\uB110\uB110",
                "\uC5EC\uC720",
                "\uBD80\uC871\uD588"
        )) {
            sessionAdjustment += 10;
        }

        if (containsAny(
                feedback,
                "\uC624\uD6C4",
                "\uC810\uC2EC \uC774\uD6C4",
                "\uB0AE \uC774\uD6C4"
        )) {
            afternoonPenalty += 20;
            avoidHeavyTasksAfter = LocalTime.of(14, 0);
        }

        if (containsAny(
                feedback,
                "\uC624\uC804 \uC9D1\uC911",
                "\uC544\uCE68 \uC9D1\uC911",
                "\uC624\uC804\uC5D0 \uC9D1\uC911"
        )) {
            avoidHeavyTasksAfter = LocalTime.of(14, 0);
        }

        if (request.satisfactionScore() <= 2) {
            sessionAdjustment -= 10;
            breakAdjustment += 5;
        } else if (request.satisfactionScore() >= 4) {
            sessionAdjustment += 5;
        }

        sessionAdjustment = clamp(sessionAdjustment, -30, 20);
        breakAdjustment = clamp(breakAdjustment, -5, 15);
        afternoonPenalty = clamp(afternoonPenalty, 0, 40);

        String summary = buildSummary(sessionAdjustment, breakAdjustment, afternoonPenalty, avoidHeavyTasksAfter);

        return new ScheduleFeedbackAnalysis(
                summary,
                sessionAdjustment,
                breakAdjustment,
                afternoonPenalty,
                avoidHeavyTasksAfter
        );
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private String buildSummary(
            int sessionAdjustment,
            int breakAdjustment,
            int afternoonPenalty,
            LocalTime avoidHeavyTasksAfter
    ) {
        StringBuilder summary = new StringBuilder();
        summary.append("User feedback analyzed for schedule generation.");
        if (sessionAdjustment < 0) {
            summary.append(" Shorter work sessions are recommended.");
        } else if (sessionAdjustment > 0) {
            summary.append(" Longer work sessions are acceptable.");
        }
        if (breakAdjustment > 0) {
            summary.append(" More break time is recommended.");
        }
        if (afternoonPenalty > 0 || avoidHeavyTasksAfter != null) {
            summary.append(" Heavy tasks should be reduced in the afternoon.");
        }
        return summary.toString();
    }
}
