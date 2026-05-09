package com.be.schedule.domain;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "confirmed_schedule_items")
public class ConfirmedScheduleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "confirmed_schedule_id", nullable = false)
    private ConfirmedSchedule confirmedSchedule;

    @Column(nullable = false)
    private Integer sequence;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ScheduleItemType type;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    private Long goalId;

    private Long fixedScheduleId;

    @Column(length = 500)
    private String description;

    private ConfirmedScheduleItem(
            Integer sequence,
            ScheduleItemType type,
            String title,
            LocalTime startTime,
            LocalTime endTime,
            Long goalId,
            Long fixedScheduleId,
            String description
    ) {
        validateTime(startTime, endTime);
        this.sequence = sequence;
        this.type = type;
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.goalId = goalId;
        this.fixedScheduleId = fixedScheduleId;
        this.description = description;
    }

    public static ConfirmedScheduleItem create(
            Integer sequence,
            ScheduleItemType type,
            String title,
            LocalTime startTime,
            LocalTime endTime,
            Long goalId,
            Long fixedScheduleId,
            String description
    ) {
        return new ConfirmedScheduleItem(sequence, type, title, startTime, endTime, goalId, fixedScheduleId, description);
    }

    void assignConfirmedSchedule(ConfirmedSchedule confirmedSchedule) {
        this.confirmedSchedule = confirmedSchedule;
    }

    private void validateTime(LocalTime startTime, LocalTime endTime) {
        if (startTime == null || endTime == null || !startTime.isBefore(endTime)) {
            throw new BusinessException(ErrorCode.INVALID_TIME_RANGE);
        }
    }
}
