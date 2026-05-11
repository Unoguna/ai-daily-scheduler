package com.be.schedule.domain;

import com.be.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "daily_schedule_feedbacks",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_daily_schedule_feedback_user_date", columnNames = {"user_id", "feedback_date"})
        }
)
public class DailyScheduleFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "feedback_date", nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Integer satisfactionScore;

    @Column(nullable = false, length = 1000)
    private String rawFeedback;

    @Column(length = 1000)
    private String aiSummary;

    @Column(nullable = false)
    private Integer sessionMinutesAdjustment;

    @Column(nullable = false)
    private Integer breakMinutesAdjustment;

    @Column(nullable = false)
    private Integer afternoonFocusPenalty;

    private LocalTime avoidHeavyTasksAfter;

    private DailyScheduleFeedback(
            User user,
            LocalDate date,
            Integer satisfactionScore,
            String rawFeedback,
            String aiSummary,
            Integer sessionMinutesAdjustment,
            Integer breakMinutesAdjustment,
            Integer afternoonFocusPenalty,
            LocalTime avoidHeavyTasksAfter
    ) {
        this.user = user;
        this.date = date;
        this.satisfactionScore = satisfactionScore;
        this.rawFeedback = rawFeedback;
        this.aiSummary = aiSummary;
        this.sessionMinutesAdjustment = sessionMinutesAdjustment;
        this.breakMinutesAdjustment = breakMinutesAdjustment;
        this.afternoonFocusPenalty = afternoonFocusPenalty;
        this.avoidHeavyTasksAfter = avoidHeavyTasksAfter;
    }

    public static DailyScheduleFeedback create(
            User user,
            LocalDate date,
            Integer satisfactionScore,
            String rawFeedback,
            String aiSummary,
            Integer sessionMinutesAdjustment,
            Integer breakMinutesAdjustment,
            Integer afternoonFocusPenalty,
            LocalTime avoidHeavyTasksAfter
    ) {
        return new DailyScheduleFeedback(
                user,
                date,
                satisfactionScore,
                rawFeedback,
                aiSummary,
                sessionMinutesAdjustment,
                breakMinutesAdjustment,
                afternoonFocusPenalty,
                avoidHeavyTasksAfter
        );
    }
}
