package com.be.schedule.domain;

import com.be.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "fixed_schedules")
public class FixedSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private DayOfWeek dayOfWeek;

    @Column(nullable = false, length = 100)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ScheduleCategory category;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private boolean mandatory;

    private FixedSchedule(
            User user,
            DayOfWeek dayOfWeek,
            String title,
            ScheduleCategory category,
            LocalTime startTime,
            LocalTime endTime,
            boolean mandatory
    ) {
        validateTime(startTime, endTime);
        this.user = user;
        this.dayOfWeek = dayOfWeek;
        this.title = title;
        this.category = category;
        this.startTime = startTime;
        this.endTime = endTime;
        this.mandatory = mandatory;
    }

    public static FixedSchedule create(
            User user,
            DayOfWeek dayOfWeek,
            String title,
            ScheduleCategory category,
            LocalTime startTime,
            LocalTime endTime,
            boolean mandatory
    ) {
        return new FixedSchedule(
                user,
                dayOfWeek,
                title,
                category,
                startTime,
                endTime,
                mandatory
        );
    }

    public void update(
            DayOfWeek dayOfWeek,
            String title,
            ScheduleCategory category,
            LocalTime startTime,
            LocalTime endTime,
            boolean mandatory
    ) {
        validateTime(startTime, endTime);
        this.dayOfWeek = dayOfWeek;
        this.title = title;
        this.category = category;
        this.startTime = startTime;
        this.endTime = endTime;
        this.mandatory = mandatory;
    }

    private void validateTime(LocalTime startTime, LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("고정 일정의 시작 시간은 종료 시간보다 빨라야 합니다.");
        }
    }
}