// Base Experiment Configuration
// This file contains all experiment-level settings that are shared across all conditions
// Condition-specific settings are in separate condition config files

const EXPERIMENT_CONFIG = {
  // Prolific completion code (same for all participants)
  PROLIFIC_COMPLETION_CODE: 'C1G4BSWV',
  
  // DataPipe experiment ID
  DATAPIPE_EXPERIMENT_ID: 'eKOGpN4qj0M3', 
  
  // Experiment settings
  EXPERIMENT_NAME: 'elves_treasure_hunt',
  EXPERIMENT_VERSION: '1.2.1',
  
  // Timing constants (in milliseconds) - same for all conditions
  ITI: 500, // Inter-trial interval
  FEEDBACK_TIME: 500,
  TRAINING_THRESHOLD: .8,
  
  // Recall trial threshold
  // Number of correct recall trials required to proceed (out of total recall trials)
  RECALL_THRESHOLD: 8, // Default: all 8 must be correct
  
  // Test trial feedback time (in seconds)
  TEST_FEEDBACK_TIME: .5, // Time limit for test feedback trials
  
  // Test trial break interval
  TEST_BREAK_INTERVAL: 40, // Show break after every N test trials

};

// Set angle and label pairings for all participants (same across all conditions)
const angle_label_pairs = [
  { angle: 15, label: 'blit', frequency: 'HF' },
  { angle: 60, label: 'grah', frequency: 'HF' },
  { angle: 105, label: 'pim', frequency: 'LF' },
  { angle: 150, label: 'gorm', frequency: 'LF' },
  { angle: 195, label: 'clate', frequency: 'HF' },
  { angle: 240, label: 'noobda', frequency: 'HF' },
  { angle: 285, label: 'gled', frequency: 'LF' },
  { angle: 330, label: 'noom', frequency: 'LF' }
];

// DataPipe endpoint helper function
// Returns the DataPipe endpoint URL if DATAPIPE_EXPERIMENT_ID is set, otherwise null
EXPERIMENT_CONFIG.getDataPipeEndpoint = function() {
  if (!this.DATAPIPE_EXPERIMENT_ID) {
    return null;
  }
  return `https://pipe.jspsych.org/api/data?experiment_id=${this.DATAPIPE_EXPERIMENT_ID}`;
};
