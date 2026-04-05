package com.be.schedule.domain;

import com.be.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "scheduling_profiles")
public class SchedulingProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private LocalTime preferredStartTime;

    @Column(nullable = false)
    private LocalTime preferredEndTime;

    @Column(nullable = false)
    private LocalTime wakeUpTime;

    @Column(nullable = false)
    private LocalTime sleepTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EnergyPattern energyPattern;

    @Column(nullable = false)
    private Integer preferredSessionMinutes;

    @Column(nullable = false)
    private Integer breakMinutes;

    private SchedulingProfile(
            User user,
            LocalTime preferredStartTime,
            LocalTime preferredEndTime,
            LocalTime wakeUpTime,
            LocalTime sleepTime,
            EnergyPattern energyPattern,
            Integer preferredSessionMinutes,
            Integer breakMinutes
    ) {
        this.user = user;
        this.preferredStartTime = preferredStartTime;
        this.preferredEndTime = preferredEndTime;
        this.wakeUpTime = wakeUpTime;
        this.sleepTime = sleepTime;
        this.energyPattern = energyPattern;
        this.preferredSessionMinutes = preferredSessionMinutes;
        this.breakMinutes = breakMinutes;
    }

    public static SchedulingProfile create(
            User user,
            LocalTime preferredStartTime,
            LocalTime preferredEndTime,
            LocalTime wakeUpTime,
            LocalTime sleepTime,
            EnergyPattern energyPattern,
            Integer preferredSessionMinutes,
            Integer breakMinutes
    ) {
        return new SchedulingProfile(
                user,
                preferredStartTime,
                preferredEndTime,
                wakeUpTime,
                sleepTime,
                energyPattern,
                preferredSessionMinutes,
                breakMinutes
        );
    }

    public void updateProfile(
            LocalTime preferredStartTime,
            LocalTime preferredEndTime,
            LocalTime wakeUpTime,
            LocalTime sleepTime,
            EnergyPattern energyPattern,
            Integer preferredSessionMinutes,
            Integer breakMinutes
    ) {
        this.preferredStartTime = preferredStartTime;
        this.preferredEndTime = preferredEndTime;
        this.wakeUpTime = wakeUpTime;
        this.sleepTime = sleepTime;
        this.energyPattern = energyPattern;
        this.preferredSessionMinutes = preferredSessionMinutes;
        this.breakMinutes = breakMinutes;
    }
}