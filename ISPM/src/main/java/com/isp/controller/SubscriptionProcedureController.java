package com.isp.controller;

import com.isp.service.SubscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionProcedureController {

    private final SubscriptionService subscriptionService;

    public SubscriptionProcedureController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<String> activateSubscription(@PathVariable Integer id) {

        subscriptionService.activateSubscription(id);

        return ResponseEntity.ok("Subscription activated successfully");
    }
}