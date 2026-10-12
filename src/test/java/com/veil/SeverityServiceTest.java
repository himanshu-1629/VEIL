package com.veil;

import com.veil.model.SeverityInfo;
import com.veil.service.SeverityService;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.*;

public class SeverityServiceTest {

    private SeverityService severityService;

    @Before
    public void setUp() {
        severityService = new SeverityService();
    }

    @Test
    public void testLowSeverityBoundaries() {
        for (int score = 1; score <= 3; score++) {
            SeverityInfo info = severityService.evaluate(score);
            assertEquals("Low", info.getClassification());
            assertEquals("Record and monitor", info.getSuggestedResponse());
        }
    }

    @Test
    public void testMediumSeverityBoundaries() {
        for (int score = 4; score <= 6; score++) {
            SeverityInfo info = severityService.evaluate(score);
            assertEquals("Medium", info.getClassification());
            assertEquals("Investigate and assess impact", info.getSuggestedResponse());
        }
    }

    @Test
    public void testHighSeverityBoundaries() {
        for (int score = 7; score <= 8; score++) {
            SeverityInfo info = severityService.evaluate(score);
            assertEquals("High", info.getClassification());
            assertEquals("Prioritize investigation", info.getSuggestedResponse());
        }
    }

    @Test
    public void testCriticalSeverityBoundaries() {
        for (int score = 9; score <= 10; score++) {
            SeverityInfo info = severityService.evaluate(score);
            assertEquals("Critical", info.getClassification());
            assertEquals("Immediate attention", info.getSuggestedResponse());
        }
    }

    @Test(expected = IllegalArgumentException.class)
    public void testUnderflowScoreThrowsException() {
        severityService.evaluate(0);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testOverflowScoreThrowsException() {
        severityService.evaluate(11);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testNegativeScoreThrowsException() {
        severityService.evaluate(-5);
    }
}
