package com.isp.controller;

import com.isp.repository.SubscriptionRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/subscriptions")
public class MonthlyBillController {

    private final SubscriptionRepository subscriptionRepository;

    public MonthlyBillController(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    @GetMapping("/{id}/bill")
    public BigDecimal getMonthlyBill(@PathVariable Integer id) {
        return subscriptionRepository.calculateMonthlyBill(id);
    }
}