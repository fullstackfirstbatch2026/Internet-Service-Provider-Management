package com.isp.controller;

import com.isp.entity.Subscription;
import com.isp.repository.SubscriptionRepository;
import com.isp.service.SubscriptionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionService subscriptionService;

    public SubscriptionController(
            SubscriptionRepository subscriptionRepository,
            SubscriptionService subscriptionService) {

        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public List<Subscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    @PostMapping
    public Subscription createSubscription(
            @RequestBody Subscription subscription) {

        return subscriptionRepository.save(subscription);
    }

    // Activate subscription using MySQL Procedure

}