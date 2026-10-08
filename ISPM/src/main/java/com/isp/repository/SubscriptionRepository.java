package com.isp.repository;

import com.isp.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Integer> {

    @Query(value = """
            SELECT
                s.subscription_id AS subscriptionId,
                c.name AS customerName,
                c.email AS email,
                p.plan_name AS planName,
                p.speed AS speed,
                p.monthly_price AS monthlyPrice,
                s.start_date AS startDate,
                s.status AS status
            FROM subscriptions s
            JOIN customers c
                ON s.customer_id = c.customer_id
            JOIN plans p
                ON s.plan_id = p.plan_id
            """, nativeQuery = true)
    List<SubscriptionDetailsProjection> findSubscriptionDetails();
    @Query(value = "SELECT calculate_monthly_bill(:id)", nativeQuery = true)
    BigDecimal calculateMonthlyBill(@Param("id") Integer id);
}