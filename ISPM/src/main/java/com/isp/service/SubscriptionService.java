package com.isp.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubscriptionService {

    private final EntityManager entityManager;

    public SubscriptionService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    // Calls MySQL Procedure
    @Transactional
    public void activateSubscription(Integer subscriptionId) {

        StoredProcedureQuery query =
                entityManager.createStoredProcedureQuery("activate_subscription");

        query.registerStoredProcedureParameter(
                "p_subscription_id",
                Integer.class,
                jakarta.persistence.ParameterMode.IN
        );

        query.setParameter("p_subscription_id", subscriptionId);

        query.execute();
    }

    // Calls MySQL Function
    public Double calculateMonthlyBill(Integer subscriptionId) {

        Object result = entityManager
                .createNativeQuery(
                        "SELECT calculate_monthly_bill(:subscriptionId)"
                )
                .setParameter("subscriptionId", subscriptionId)
                .getSingleResult();

        return ((Number) result).doubleValue();
    }
}