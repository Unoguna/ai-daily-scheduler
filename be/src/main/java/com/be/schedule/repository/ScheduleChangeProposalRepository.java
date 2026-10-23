package com.be.schedule.repository;

import com.be.schedule.domain.ScheduleChangeProposal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleChangeProposalRepository extends JpaRepository<ScheduleChangeProposal, String> {}
