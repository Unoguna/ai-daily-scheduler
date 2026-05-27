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
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

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

    public Optional<ConfirmedScheduleItem> findItem(Long itemId) {
        return items.stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst();
    }

    public void removeItem(ConfirmedScheduleItem item) {
        items.remove(item);
        resequenceItems();
    }

    public void trimOverlappingItems(ConfirmedScheduleItem targetItem) {
        List<ConfirmedScheduleItem> snapshot = new ArrayList<>(items);

        for (ConfirmedScheduleItem item : snapshot) {
            if (isSameItem(item, targetItem) || !isOverlapping(item, targetItem)) {
                continue;
            }

            boolean hasBefore = item.getStartTime().isBefore(targetItem.getStartTime());
            boolean hasAfter = item.getEndTime().isAfter(targetItem.getEndTime());

            if (hasBefore && hasAfter) {
                ConfirmedScheduleItem afterItem = item.copyWithTime(
                        item.getSequence(),
                        targetItem.getEndTime(),
                        item.getEndTime()
                );
                item.updateTime(item.getStartTime(), targetItem.getStartTime());
                addItem(afterItem);
                continue;
            }

            if (hasBefore) {
                item.updateTime(item.getStartTime(), targetItem.getStartTime());
                continue;
            }

            if (hasAfter) {
                item.updateTime(targetItem.getEndTime(), item.getEndTime());
                continue;
            }

            items.remove(item);
        }
    }

    public void resequenceItems() {
        List<ConfirmedScheduleItem> sortedItems = items.stream()
                .sorted(Comparator.comparing(ConfirmedScheduleItem::getStartTime)
                        .thenComparing(ConfirmedScheduleItem::getEndTime))
                .toList();

        for (int i = 0; i < sortedItems.size(); i++) {
            sortedItems.get(i).updateSequence(i + 1);
        }
    }

    private boolean isSameItem(ConfirmedScheduleItem item, ConfirmedScheduleItem targetItem) {
        return item == targetItem || item.getId().equals(targetItem.getId());
    }

    private boolean isOverlapping(ConfirmedScheduleItem item, ConfirmedScheduleItem targetItem) {
        return item.getStartTime().isBefore(targetItem.getEndTime())
                && item.getEndTime().isAfter(targetItem.getStartTime());
    }
}
