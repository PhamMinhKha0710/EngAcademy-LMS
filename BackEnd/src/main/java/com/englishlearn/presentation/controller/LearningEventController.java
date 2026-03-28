package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.BatchEventRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.service.LearningEventService;
import com.englishlearn.application.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
@Tag(name = "Events", description = "Behavioral event tracking — batch REST API, Kafka-ready contract")
public class LearningEventController {

    private final LearningEventService eventService;
    private final UserService userService;

    @PostMapping("/batch")
    @Operation(summary = "Track batch of behavioral events (Kafka-ready contract)")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> trackBatch(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BatchEventRequest request) {

        Long userId = userService.getUserByUsername(userDetails.getUsername()).getId();
        LearningEventService.BatchSaveResult result = eventService.saveBatch(userId, request.getEvents());

        Map<String, Object> body = Map.of(
                "received", request.getEvents() != null ? request.getEvents().size() : 0,
                "saved", result.savedCount(),
                "failed", result.failedCount()
        );

        return ResponseEntity.ok(ApiResponse.success("Events tracked", body));
    }
}
