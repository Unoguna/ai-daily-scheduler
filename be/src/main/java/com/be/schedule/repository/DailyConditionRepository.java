package com.be.schedule.repository;

import com.be.schedule.domain.DailyCondition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface DailyConditionRepository extends JpaRepository<DailyCondition, Long> {
    Optional<DailyCondition> findByUserIdAndDate(Long userId, LocalDate date);
}