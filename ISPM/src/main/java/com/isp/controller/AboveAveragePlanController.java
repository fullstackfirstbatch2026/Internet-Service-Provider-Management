package com.isp.controller;

import com.isp.repository.AboveAveragePlanProjection;
import com.isp.repository.PlanRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
public class AboveAveragePlanController {

    private final PlanRepository planRepository;

    public AboveAveragePlanController(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    @GetMapping("/above-average-subscribers")
    public List<AboveAveragePlanProjection> getAboveAveragePlans() {
        return planRepository.findAboveAveragePlans();
    }
}