package com.be.schedule.repository;

import com.be.schedule.domain.ConfirmedSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface ConfirmedScheduleRepository extends JpaRepository<ConfirmedSchedule, Long> {
    Optional<ConfirmedSchedule> findByUserIdAndDate(Long userId, LocalDate date);

    Optional<ConfirmedSchedule> findByIdAndUserId(Long id, Long userId);
}
