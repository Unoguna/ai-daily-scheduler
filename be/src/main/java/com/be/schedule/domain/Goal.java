package com.be.schedule.domain;

import com.be.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "goals")
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GoalPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GoalStatus status;

    private LocalDate targetDate;

    @Builder
    private Goal(User user, String title, String description, GoalPriority priority, GoalStatus status, LocalDate targetDate) {
        this.user = user;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.targetDate = targetDate;
    }

    public static Goal create(User user, String title, String description, GoalPriority priority, LocalDate targetDate) {
        return Goal.builder()
                .user(user)
                .title(title)
                .description(description)
                .priority(priority)
                .status(GoalStatus.ACTIVE)
                .targetDate(targetDate)
                .build();
    }

    public void update(String title, String description, GoalPriority priority, LocalDate targetDate) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.targetDate = targetDate;
    }

    public void complete() {
        this.status = GoalStatus.COMPLETED;
    }

    public void deactivate() {
        this.status = GoalStatus.INACTIVE;
    }
}