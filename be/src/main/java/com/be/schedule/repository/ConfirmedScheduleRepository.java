package com.be.schedule.repository;

import com.be.schedule.domain.ConfirmedSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.time.LocalDate;
import java.util.Optional;
import java.util.List;
import com.be.schedule.dto.DailyCompletionCount;

public interface ConfirmedScheduleRepository extends JpaRepository<ConfirmedSchedule, Long> {
    @Query("""
        select new com.be.schedule.dto.DailyCompletionCount(
            s.date, count(i), sum(case when i.completed = true then 1L else 0L end))
        from ConfirmedSchedule s join s.items i
        where s.user.id = :userId and s.date between :start and :end
        group by s.date order by s.date
        """)
    List<DailyCompletionCount> countCompletionByDate(@Param("userId") Long userId,
                                                   @Param("start") LocalDate start, @Param("end") LocalDate end);

    Optional<ConfirmedSchedule> findByUserIdAndDate(Long userId, LocalDate date);

    Optional<ConfirmedSchedule> findByIdAndUserId(Long id, Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from ConfirmedSchedule s where s.id = :id and s.user.id = :userId")
    Optional<ConfirmedSchedule> findForUpdate(@Param("id") Long id, @Param("userId") Long userId);
}
