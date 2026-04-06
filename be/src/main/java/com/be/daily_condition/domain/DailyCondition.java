package com.be.daily_condition.domain;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "daily_conditions",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_daily_condition_user_date", columnNames = {"user_id", "condition_date"})
        }
)
public class DailyCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "condition_date", nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Integer fatigueLevel; // 1~5

    @Column(nullable = false)
    private Integer focusLevel;   // 1~5

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EmotionState emotionState;

    @Column(length = 300)
    private String memo;

    private DailyCondition(
            User user,
            LocalDate date,
            Integer fatigueLevel,
            Integer focusLevel,
            EmotionState emotionState,
            String memo
    ) {
        validateRange(fatigueLevel, ErrorCode.INVALID_FATIGUE_LEVEL);
        validateRange(focusLevel, ErrorCode.INVALID_FOCUS_LEVEL);

        this.user = user;
        this.date = date;
        this.fatigueLevel = fatigueLevel;
        this.focusLevel = focusLevel;
        this.emotionState = emotionState;
        this.memo = memo;
    }

    public static DailyCondition create(
            User user,
            LocalDate date,
            Integer fatigueLevel,
            Integer focusLevel,
            EmotionState emotionState,
            String memo
    ) {
        return new DailyCondition(
                user,
                date,
                fatigueLevel,
                focusLevel,
                emotionState,
                memo
        );
    }

    public void update(Integer fatigueLevel, Integer focusLevel, EmotionState emotionState, String memo) {
        validateRange(fatigueLevel, ErrorCode.INVALID_FATIGUE_LEVEL);
        validateRange(focusLevel, ErrorCode.INVALID_FOCUS_LEVEL);

        this.fatigueLevel = fatigueLevel;
        this.focusLevel = focusLevel;
        this.emotionState = emotionState;
        this.memo = memo;
    }

    private void validateRange(Integer value, ErrorCode errorCode) {
        if (value == null || value < 1 || value > 5) {
            throw new BusinessException(errorCode);
        }
    }
}