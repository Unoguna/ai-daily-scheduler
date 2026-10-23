package com.be.schedule.repository;

import com.be.schedule.domain.ConfirmedSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.time.LocalDate;
import java.util.Optional;

public interface ConfirmedScheduleRepository extends JpaRepository<ConfirmedSchedule, Long> {
    Optional<ConfirmedSchedule> findByUserIdAndDate(Long userId, LocalDate date);

    Optional<ConfirmedSchedule> findByIdAndUserId(Long id, Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from ConfirmedSchedule s where s.id = :id and s.user.id = :userId")
    Optional<ConfirmedSchedule> findForUpdate(@Param("id") Long id, @Param("userId") Long userId);
}
