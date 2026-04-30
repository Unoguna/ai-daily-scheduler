package com.be.goal.repository;

import com.be.goal.domain.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserId(Long userId);

    List<Goal> findByUserIdOrderByIdDesc(Long userId);

    Optional<Goal> findByIdAndUserId(Long id, Long userId);
}
