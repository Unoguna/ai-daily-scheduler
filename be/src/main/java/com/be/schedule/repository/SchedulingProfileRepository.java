package com.be.schedule.repository;

import com.be.schedule.domain.SchedulingProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SchedulingProfileRepository extends JpaRepository<SchedulingProfile, Long> {
    Optional<SchedulingProfile> findByUserId(Long userId);
}
