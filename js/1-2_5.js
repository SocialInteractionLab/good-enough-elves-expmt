// Condition-Specific Configuration
// This file contains only condition-specific settings
// Base experiment settings are loaded from experiment_config.js first

// Merge condition-specific settings into EXPERIMENT_CONFIG
Object.assign(EXPERIMENT_CONFIG, {
  // Condition parameters (for analysis)
  FREQUENCY_RATIO: '1:2',  // Ratio of HF to LF during training (1:2 or 1:4)
  TIME_PRESSURE: 5,        // Time limit in seconds for test trials (5 or 10)
  PAYOFF_STRUCTURE: 'linear',  // Payoff structure: 'linear' (proportional to distance) or 'binary' (correct/incorrect)
  
  // Point to bonus scale
  POINT_TO_BONUS_SCALE: .001, //1 point = $0.01

  // Test trial time limit (in seconds) - condition-specific
  TEST_TIME: 5, // Time limit for test trials
  
  // Trial order file paths - condition-specific
  TRAINING_TRIALS_PATH: 'stimuli/trial_orders/1_2_training_trials.js',
  TEST_TRIALS_PATH: 'stimuli/trial_orders/1_2_test_trials.js'
});
