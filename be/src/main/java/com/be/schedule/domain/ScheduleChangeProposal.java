package com.be.schedule.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "schedule_change_proposals")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ScheduleChangeProposal {
    @Id
    @Column(length = 36)
    private String id;
    @Column(nullable = false)
    private Long userId;
    @Column(nullable = false)
    private Long scheduleId;
    @Column(nullable = false, length = 64)
    private String snapshotHash;
    @Lob
    @Column(nullable = false)
    private String planJson;
    @Column(nullable = false)
    private Instant expiresAt;
    @Column(nullable = false)
    private boolean applied;

    public static ScheduleChangeProposal create(Long userId, Long scheduleId, String snapshotHash, String planJson) {
        ScheduleChangeProposal proposal = new ScheduleChangeProposal();
        proposal.id = UUID.randomUUID().toString();
        proposal.userId = userId;
        proposal.scheduleId = scheduleId;
        proposal.snapshotHash = snapshotHash;
        proposal.planJson = planJson;
        proposal.expiresAt = Instant.now().plusSeconds(600);
        return proposal;
    }

    public void markApplied() { applied = true; }
}
