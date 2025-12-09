// Experiment Configuration
const EXPERIMENT_CONFIG = {
  // Prolific completion code (same for all participants)
  // TODO: Replace with actual code provided by Prolific
  PROLIFIC_COMPLETION_CODE: 'PLACEHOLDER_CODE',
  
  // DataPipe configuration for OSF integration
  // 
  // SETUP INSTRUCTIONS:
  // 1. Create an OSF project at https://osf.io and note the project ID (from the URL)
  // 2. Generate an OSF Personal Access Token:
  //    - Go to OSF Settings > Personal Access Tokens
  //    - Create a token with 'osf.full_write' scope
  // 3. Link OSF to DataPipe:
  //    - Go to https://pipe.jspsych.org and sign in
  //    - Account > Settings > Set OSF Token (paste your OSF token)
  // 4. Create a DataPipe experiment:
  //    - Click "New Experiment" in DataPipe
  //    - Enter your OSF project ID and a name for the Data component
  //    - Copy the experiment ID that DataPipe provides
  // 5. Set the experiment ID below:
  DATAPIPE_EXPERIMENT_ID: 'XnWHnqtEu5Et', // Replace null with your DataPipe experiment ID (e.g., 'abc123def456')
  
  // Experiment settings
  EXPERIMENT_NAME: 'elves_treasure_hunt',
  EXPERIMENT_VERSION: '1.0.0',
  
  // Timing constants (in milliseconds)
  ITI: 500, // Inter-trial interval
  FEEDBACK_TIME: 500,
  TRAINING_THRESHOLD: .8,
  
  // Recall trial threshold
  // Number of correct recall trials required to proceed (out of total recall trials)
  RECALL_THRESHOLD: 8, // Default: all 8 must be correct
  
  // Test trial time limit (in seconds)
  TEST_TIME: 1, // Time limit for test trials
  TEST_FEEDBACK_TIME: .25, // Time limit for test feedback trials

  // Point to bonus scale
  POINT_TO_BONUS_SCALE: .001, //1 point = $0.01
  // Training trial order file path
  // Set this to match the trial order file you want to use
  TRAINING_TRIALS_PATH: 'stimuli/trial_orders/1_2_training_trials.js',
  TEST_TRIALS_PATH: 'stimuli/trial_orders/1_2_2_test_trials.js'
};

// Set angle and label pairings for all participants 

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
