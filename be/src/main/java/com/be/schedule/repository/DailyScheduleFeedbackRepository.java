package com.be.schedule.repository;

import com.be.schedule.domain.DailyScheduleFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

public interface DailyScheduleFeedbackRepository extends JpaRepository<DailyScheduleFeedback, Long> {
    Optional<DailyScheduleFeedback> findByUserIdAndDate(Long userId, LocalDate date);

    List<DailyScheduleFeedback> findByUserIdAndDateGreaterThanEqualAndDateLessThanOrderByDateDesc(
            Long userId, LocalDate fromInclusive, LocalDate toExclusive);
}
