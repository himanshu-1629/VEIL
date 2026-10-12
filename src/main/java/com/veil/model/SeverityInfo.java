package com.veil.model;

import java.io.Serializable;

/**
 * Immutable rule-based evaluation of incident severity.
 */
public class SeverityInfo implements Serializable {
    private static final long serialVersionUID = 1L;

    private final int score;
    private final String classification;
    private final String suggestedResponse;
    private final String badgeColor;

    public SeverityInfo(int score, String classification, String suggestedResponse, String badgeColor) {
        this.score = score;
        this.classification = classification;
        this.suggestedResponse = suggestedResponse;
        this.badgeColor = badgeColor;
    }

    public static SeverityInfo evaluate(int score) {
        if (score < 1 || score > 10) {
            throw new IllegalArgumentException("Severity score must be an integer between 1 and 10.");
        }
        if (score <= 3) {
            return new SeverityInfo(score, "Low", "Record and monitor", "#286747"); // --success
        } else if (score <= 6) {
            return new SeverityInfo(score, "Medium", "Investigate and assess impact", "#285F70"); // --info
        } else if (score <= 8) {
            return new SeverityInfo(score, "High", "Prioritize investigation", "#8A5B13"); // --warning
        } else {
            return new SeverityInfo(score, "Critical", "Immediate attention", "#B83B34"); // --danger
        }
    }

    public int getScore() {
        return score;
    }

    public String getClassification() {
        return classification;
    }

    public String getSuggestedResponse() {
        return suggestedResponse;
    }

    public String getBadgeColor() {
        return badgeColor;
    }
}
