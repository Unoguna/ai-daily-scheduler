package com.be.schedule.service;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.schedule.domain.*;
import com.be.schedule.dto.*;
import com.be.schedule.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class ScheduleChangeStore {
    private final ConfirmedScheduleRepository schedules;
    private final ScheduleChangeProposalRepository proposals;
    private final ScheduleChangeValidator validator;
    private final ScheduleChangeCodec codec;

    @Transactional
    public ConfirmedScheduleResponse apply(Long userId, Long scheduleId, String proposalId) {
        // All item mutation APIs lock the same schedule row before reading its items.
        ConfirmedSchedule schedule = schedules.findForUpdate(scheduleId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
        ScheduleChangeProposal proposal = proposals.findById(proposalId)
                .filter(value -> value.getUserId().equals(userId) && value.getScheduleId().equals(scheduleId))
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
        ConfirmedScheduleResponse before = ConfirmedScheduleResponse.from(schedule);
        if (proposal.isApplied() || !proposal.getExpiresAt().isAfter(Instant.now())
                || !proposal.getSnapshotHash().equals(codec.fingerprint(before))) {
            throw new BusinessException(ErrorCode.STALE_SCHEDULE_CHANGE);
        }
        // Revalidate the entire plan before performing any mutation.
        var after = validator.preview(userId, before, codec.decode(proposal.getPlanJson()));
        var retained = new HashSet<Long>();
        for (var item : after.items()) {
            if (item.scheduleItemId() == null) {
                schedule.addItem(ConfirmedScheduleItem.create(item.sequence(), item.type(), item.title(),
                        item.startTime(), item.endTime(), null, null, null));
            } else {
                retained.add(item.scheduleItemId());
                var existing = schedule.findItem(item.scheduleItemId()).orElseThrow();
                existing.update(item.type(), item.title(), item.startTime(), item.endTime(),
                        item.goalId(), item.fixedScheduleId(), item.description());
            }
        }
        schedule.getItems().removeIf(item -> item.getId() != null && !retained.contains(item.getId()));
        schedule.resequenceItems();
        proposal.markApplied();
        schedules.flush();
        return ConfirmedScheduleResponse.from(schedule);
    }
}
