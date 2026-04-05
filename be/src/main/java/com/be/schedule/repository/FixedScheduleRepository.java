package com.be.schedule.repository;

import com.be.schedule.domain.FixedSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface FixedScheduleRepository extends JpaRepository<FixedSchedule, Long> {
    List<FixedSchedule> findByUserId(Long userId);
    List<FixedSchedule> findByUserIdAndDayOfWeek(Long userId, DayOfWeek dayOfWeek);
}
