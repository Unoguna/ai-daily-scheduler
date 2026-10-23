package com.be.schedule.service;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.schedule.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Component
public class ScheduleChangeCodec {
    private final ObjectMapper mapper = new ObjectMapper()
            .enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS)
            .disable(DeserializationFeature.ACCEPT_FLOAT_AS_INT);

    public ScheduleChangePlan decode(String json) {
        try {
            if (json == null || json.length() > 30000) throw new IllegalArgumentException();
            String content = json.trim();
            if (content.startsWith("```")) {
                content = content.replaceFirst("^```(?:json)?\\s*", "").replaceFirst("\\s*```$", "");
            }
            return mapper.readValue(content, ScheduleChangePlan.class);
        } catch (Exception exception) {
            throw new BusinessException(ErrorCode.INVALID_SCHEDULE_CHANGE);
        }
    }

    public String encode(ScheduleChangePlan plan) { return json(plan); }

    private String json(Object value) {
        try {
            return mapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw new IllegalStateException("Cannot serialize schedule change", exception);
        }
    }

    public String fingerprint(ConfirmedScheduleResponse schedule) {
        try {
            var items = schedule.items().stream().map(item -> Arrays.asList(
                    item.scheduleItemId(), item.sequence(), item.type().name(), item.title(),
                    item.startTime().toString(), item.endTime().toString(), item.goalId(),
                    item.fixedScheduleId(), item.description(), item.completed())).toList();
            String snapshot = json(Arrays.asList(schedule.confirmedScheduleId(), schedule.date().toString(), items));
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(snapshot.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
    }

    // Only temporary item numbers and explicitly approved fields leave the server.
    public String aiContext(ConfirmedScheduleResponse schedule) {
        List<Object> items = new ArrayList<>();
        for (int index = 0; index < schedule.items().size(); index++) {
            var item = schedule.items().get(index);
            items.add(Map.of("itemId", index + 1, "title", item.title(), "type", item.type().name(),
                    "startTime", item.startTime().toString(), "endTime", item.endTime().toString(),
                    "completed", item.completed()));
        }
        return json(items);
    }

    public ScheduleChangePlan resolveItemNumbers(ConfirmedScheduleResponse schedule, ScheduleChangePlan plan) {
        if (plan == null || plan.commands() == null) throw new BusinessException(ErrorCode.INVALID_SCHEDULE_CHANGE);
        List<ScheduleChangeCommand> resolved = new ArrayList<>();
        for (var command : plan.commands()) {
            if (command == null || command.action() == null) throw new BusinessException(ErrorCode.INVALID_SCHEDULE_CHANGE);
            Long id = command.itemId();
            if (command.action() != ScheduleChangeCommand.Action.ADD_BREAK) {
                if (id == null || id < 1 || id > schedule.items().size())
                    throw new BusinessException(ErrorCode.INVALID_SCHEDULE_CHANGE);
                id = schedule.items().get(id.intValue() - 1).scheduleItemId();
            }
            resolved.add(new ScheduleChangeCommand(command.action(), id, command.startTime(), command.endTime(), command.title()));
        }
        return new ScheduleChangePlan(plan.summary(), resolved);
    }
}
