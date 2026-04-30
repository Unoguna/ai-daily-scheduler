package com.be.schedule.repository;

import com.be.schedule.domain.FixedSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface FixedScheduleRepository extends JpaRepository<FixedSchedule, Long> {
    List<FixedSchedule> findByUserId(Long userId);
    List<FixedSchedule> findByUserIdAndDayOfWeek(Long userId, DayOfWeek dayOfWeek);
    Optional<FixedSchedule> findByIdAndUserId(Long id, Long userId);
}
