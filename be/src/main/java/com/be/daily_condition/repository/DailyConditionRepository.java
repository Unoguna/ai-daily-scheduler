package com.be.daily_condition.repository;

import com.be.daily_condition.domain.DailyCondition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface DailyConditionRepository extends JpaRepository<DailyCondition, Long> {
    Optional<DailyCondition> findByUserIdAndDate(Long userId, LocalDate date);
    boolean existsByUserIdAndDate(Long userId, LocalDate date);
}