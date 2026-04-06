package com.be.user.domain;

import com.be.schedule.domain.DailyCondition;
import com.be.schedule.domain.FixedSchedule;
import com.be.goal.domain.Goal;
import com.be.schedule.domain.SchedulingProfile;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuthProvider provider;   // KAKAO, GOOGLE

    @Column(nullable = false, length = 100)
    private String providerId;       // 카카오 회원 고유 id

    @Column(length = 100)
    private String email;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 300)
    private String profileImageUrl;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private SchedulingProfile schedulingProfile;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<Goal> goals = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<FixedSchedule> fixedSchedules = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<DailyCondition> dailyConditions = new ArrayList<>();

    private User(AuthProvider provider, String providerId, String email, String name, String profileImageUrl) {
        this.provider = provider;
        this.providerId = providerId;
        this.email = email;
        this.name = name;
        this.profileImageUrl = profileImageUrl;
    }

    public static User create(
            AuthProvider provider,
            String providerId,
            String email,
            String name,
            String profileImageUrl
    ) {
        return new User(provider, providerId, email, name, profileImageUrl);
    }

    public void assignSchedulingProfile(SchedulingProfile schedulingProfile) {
        this.schedulingProfile = schedulingProfile;
    }

    public void updateProfile(String email, String name, String profileImageUrl) {
        this.email = email;
        this.name = name;
        this.profileImageUrl = profileImageUrl;
    }
}