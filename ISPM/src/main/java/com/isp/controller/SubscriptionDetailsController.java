package com.isp.controller;

import com.isp.repository.SubscriptionDetailsProjection;
import com.isp.repository.SubscriptionRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionDetailsController {

    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionDetailsController(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    @GetMapping("/details")
    public List<SubscriptionDetailsProjection> getSubscriptionDetails() {
        return subscriptionRepository.findSubscriptionDetails();
    }
}