package com.veil.service;

import com.veil.model.SeverityInfo;

/**
 * Service encapsulating the authoritative VEIL severity evaluation matrix.
 */
public class SeverityService {

    public SeverityInfo evaluate(int score) {
        return SeverityInfo.evaluate(score);
    }
}
