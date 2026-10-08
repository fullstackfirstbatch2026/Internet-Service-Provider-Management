package com.isp.repository;

import com.isp.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PlanRepository extends JpaRepository<Plan, Integer> {

    @Query(value = """
            SELECT
                p.plan_id AS planId,
                p.plan_name AS planName,
                COUNT(s.subscription_id) AS subscriberCount
            FROM plans p
            LEFT JOIN subscriptions s
                ON p.plan_id = s.plan_id
            GROUP BY p.plan_id, p.plan_name
            HAVING COUNT(s.subscription_id) > (
                SELECT AVG(subscriber_count)
                FROM (
                    SELECT
                        p2.plan_id,
                        COUNT(s2.subscription_id) AS subscriber_count
                    FROM plans p2
                    LEFT JOIN subscriptions s2
                        ON p2.plan_id = s2.plan_id
                    GROUP BY p2.plan_id
                ) AS plan_counts
            )
            """, nativeQuery = true)
    List<AboveAveragePlanProjection> findAboveAveragePlans();
}