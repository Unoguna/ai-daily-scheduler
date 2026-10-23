package com.be.schedule.service;

import com.be.schedule.domain.ScheduleChangeProposal;
import com.be.schedule.dto.*;
import com.be.schedule.repository.ScheduleChangeProposalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScheduleChangeService {
    private final ScheduleQueryService queries;
    private final ScheduleChangeAiService ai;
    private final ScheduleChangeValidator validator;
    private final ScheduleChangeCodec codec;
    private final ScheduleChangeProposalRepository proposals;

    // AI calls run outside a database transaction; previews never mutate schedules.
    public ScheduleChangePreview preview(Long userId, Long scheduleId, String message) {
        var before = queries.getSchedule(userId, scheduleId);
        var plan = ai.generate(before, message);
        var after = validator.preview(userId, before, plan);
        var proposal = proposals.save(ScheduleChangeProposal.create(userId, scheduleId,
                codec.fingerprint(before), codec.encode(plan)));
        return new ScheduleChangePreview(proposal.getId(), plan.summary(), before, after);
    }
}
