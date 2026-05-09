package com.be.schedule.domain;

import com.be.user.domain.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "confirmed_schedules",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_confirmed_schedule_user_date", columnNames = {"user_id", "schedule_date"})
        }
)
public class ConfirmedSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "schedule_date", nullable = false)
    private LocalDate date;

    @OneToMany(mappedBy = "confirmedSchedule", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ConfirmedScheduleItem> items = new ArrayList<>();

    private ConfirmedSchedule(User user, LocalDate date) {
        this.user = user;
        this.date = date;
    }

    public static ConfirmedSchedule create(User user, LocalDate date) {
        return new ConfirmedSchedule(user, date);
    }

    public void addItem(ConfirmedScheduleItem item) {
        items.add(item);
        item.assignConfirmedSchedule(this);
    }
}
