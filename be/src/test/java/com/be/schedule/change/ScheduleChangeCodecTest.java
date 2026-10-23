package com.be.schedule.change;

import com.be.global.exception.BusinessException;
import com.be.schedule.domain.ScheduleItemType;
import com.be.schedule.dto.*;
import com.be.schedule.service.*;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.ObjectProvider;

import java.time.*;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ScheduleChangeCodecTest {
    final ScheduleChangeCodec codec = new ScheduleChangeCodec();
    final ConfirmedScheduleResponse schedule = new ConfirmedScheduleResponse(987654L, LocalDate.of(2026, 10, 23), List.of(
            new ConfirmedScheduleItemResponse(654321L, 1, ScheduleItemType.GOAL_WORK, "Study", LocalTime.of(9, 0),
                    LocalTime.of(10, 0), 789123L, null, "private-description@example.com", false)));

    @Test
    void providerContextUsesTemporaryIdsAndOmitsPrivateFields() {
        String context = codec.aiContext(schedule);
        assertTrue(context.contains("\"itemId\":1"));
        assertTrue(context.contains("Study"));
        for (String excluded : List.of("987654", "654321", "789123", "private-description@example.com", "description", "goalId"))
            assertFalse(context.contains(excluded));
        var plan = codec.decode("{\"summary\":\"Move\",\"commands\":[{\"action\":\"UPDATE_TIME\",\"itemId\":1,\"startTime\":\"10:00\",\"endTime\":\"11:00\",\"title\":null}]}");
        assertEquals(654321L, codec.resolveItemNumbers(schedule, plan).commands().getFirst().itemId());
    }

    @Test
    void invalidProviderResponsesAndUnknownItemNumbersAreRejected() {
        for (String bad : List.of("not json", "{} trailing", "{\"commands\":[{\"action\":\"EXECUTE\"}]}"))
            assertThrows(BusinessException.class, () -> codec.decode(bad));
        assertThrows(BusinessException.class, () -> codec.resolveItemNumbers(schedule,
                new ScheduleChangePlan("bad", List.of(new ScheduleChangeCommand(ScheduleChangeCommand.Action.DELETE, 654321L, null, null, null)))));
    }

    @Test
    void fencedJsonAndStoredPlanRoundTrip() {
        var plan = new ScheduleChangePlan("휴식 추가", List.of(new ScheduleChangeCommand(
                ScheduleChangeCommand.Action.ADD_BREAK, null, "10:00", "10:10", "휴식")));
        assertEquals(plan, codec.decode("```json\n" + codec.encode(plan) + "\n```"));
        assertEquals(codec.fingerprint(schedule), codec.fingerprint(schedule));
    }

    @Test
    @SuppressWarnings("unchecked")
    void unavailableProviderReturnsAnError() {
        ObjectProvider<ChatClient.Builder> builders = mock(ObjectProvider.class);
        try (var ai = new ScheduleChangeAiService(builders, codec)) {
            assertThrows(BusinessException.class, () -> ai.generate(schedule, "request"));
        }
    }

    @Test
    void blankAndOversizedMessagesAreRejected() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            assertFalse(validator.validate(new ScheduleChangeRequest("  ")).isEmpty());
            assertFalse(validator.validate(new ScheduleChangeRequest("a".repeat(1001))).isEmpty());
            assertTrue(validator.validate(new ScheduleChangeRequest("공부를 30분 줄여줘")).isEmpty());
        }
    }
}
