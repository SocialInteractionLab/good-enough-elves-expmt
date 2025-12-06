// Main Experiment Script

// Initialize jsPsych
const jsPsych = initJsPsych({
});

// Generate a random subject ID
const subject_id = jsPsych.randomization.randomID(10);
const filename = `${subject_id}.csv`;

// capture info from Prolific
var prolific_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
var study_id = jsPsych.data.getURLVariable('STUDY_ID');
var session_id = jsPsych.data.getURLVariable('SESSION_ID');

jsPsych.data.addProperties({
    subject_id: subject_id,
    prolific_id: prolific_id,
    study_id: study_id,
    session_id: session_id,
    experiment_name: EXPERIMENT_CONFIG.EXPERIMENT_NAME,
    experiment_version: EXPERIMENT_CONFIG.EXPERIMENT_VERSION
});

// Phase 1: Consent Page

const consent_trial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div class="consent-text">
      <p>Please read this consent agreement carefully before deciding whether to participate in this experiment.</p>
    </div>
  `,
  choices: ['I agree', 'I do not agree'],
  button_html: function(choice, choice_index) {
    const buttonClass = choice_index === 0 ? 'consent-button agree' : 'consent-button disagree';
    return `<button class="${buttonClass}">${choice}</button>`;
  },
  data: {
    trial_type: 'consent'
  },
  on_finish: function(data) {
    // Record response
    // response is the index of the button clicked (0 = "I agree", 1 = "I do not agree")
    data.consent_response = data.response === 0 ? 'agree' : 'disagree';
    data.consent_timestamp = new Date().toISOString();
    
    // If participant does not agree, end experiment
    if (data.response === 1) { // "I do not agree" is the second button (index 1)
      jsPsych.abortExperiment(`
        <div class="instruction-text">
          <h2>Thank you</h2>
          <p>You have chosen not to participate. Please close this tab and return the task in Prolific.</p>
        </div>
      `);
    }
  }
};

// Phase 2: Overall Introduction Page/Instructions

const introduction_trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class="instruction-text">
        <h2>Welcome to the Elves Treasure Hunt Experiment</h2>
        <p>Thank you for your participation. In order to complete today's task, you're going to play a game. You've been asked to be a guide for a squad of Elves looking to find buried treasure. Their compass navigator has gone missing and there's not much time before winter makes the hunt impossible. In exchange for your navigating, they'll give you a cut of their prize.</p>
        <p>Here's the situation. The worker elves only know Elvish. It's your job to learn to read the compass as quickly and accurately as possible, and use what you know to guide the Elves to treasure. First you'll learn how to give directions. Just as soon as you pass basic navigating it's off to hunt for treasure. Good luck!</p>
        <p class="prompt-text">Press any key to continue</p>
      </div>
    `,
    choices: 'ALL_KEYS',
    data: {
      trial_type: 'introduction'
    }
  };

//

// Phase 3: First Exposure Trials
// Participants will be shown each of the 8 directions and asked to type the name of the direction

const exposure_instructions_trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class="instruction-text">
        <h2>Practicing Elvish Directions</h2>
        <p>The Elves use 8 principal directions to navigate. You will use those directions to help them find the treasure. You're about to see the names for each direction, and practice giving directions by typing in the name of the direction.</p>
        <p class="prompt-text">Press any key to begin</p>
      </div>
    `,
    choices: 'ALL_KEYS',
    data: {
      trial_type: 'exposure_instructions'
    }
  };

// Shows a direction and asks the participant to type the name
// Loops until the participant gets it correct/types correctly
const exposure_trial = {
    timeline: [{
        type: jsPsychSurveyHtmlForm,
        html: function() {
            // Get angle and label from timeline variables
            const angle = jsPsych.evaluateTimelineVariable('angle');
            const label = jsPsych.evaluateTimelineVariable('label');
            
            const compassHTML = createCompassHTML(angle);
            return `
              <div class="compass-container">
                ${compassHTML}
                <p class="compass-instruction">This direction is called <span class="compass-label">${label}</span></p>
                <p style="font-size: 16px; margin: 20px 0;">Type the name of this direction:</p>
                <input type="text" id="exposure-response" name="exposure-response" class="compass-input" autocomplete="off" autofocus />
              </div>
            `;
        },
        data: {
            trial_type: 'exposure'
        },
        on_finish: function(data) {
            // Get target label from timeline variable
            const target = jsPsych.evaluateTimelineVariable('label');
            const angle = jsPsych.evaluateTimelineVariable('angle');
            
            const response = data.response['exposure-response'].toLowerCase().trim();
            data.is_correct = response === target.toLowerCase() ? 1 : 0;
            data.response_text = response;
            data.target = target;
            data.angle = angle;
        }
    }],
    autofocus: 'exposure-response',
    loop_function: function(data) {
      // Repeat trial if participant got it wrong
      // data.values() returns an array of all trial data in this timeline
      const values = data.values();
      if (values.length === 0) return false;
      const lastTrial = values[values.length - 1];
      return lastTrial.is_correct === 0; // Repeat if incorrect
  }
}

// Creates a timeline with all 8 exposure trials
// Each trial is shown in order
// Each trial is looped until the participant gets it correct/types correctly
const exposure_trials = {
    timeline: [exposure_trial],
    timeline_variables: angle_label_pairs,
    randomize_order: false // Show in order, matching PsychoPy
};


// Phase 4: Blocks of Familiarization Trials
// Blocks of 20-24 trials (depending on the configuration variable)
// Each block has 20-24 trials
// Each trial has a target and a foil
// The target is the direction that the Elves are trying to navigate to
// The foil is the direction that the Elves are trying to avoid
// The target and foil are presented on the screen
// The participant is asked to select the target
// The participant is given feedback on whether they selected the correct target

// Trials loop* until participants get at least 80% of the selections correct within that block
// For now the target foil pairs are hardcoded...todo build in the random trial block selection
// Start with really basic familiarization trial...

// Track first-attempt errors for familiarization trials
// This resets when the familiarization_trials block loops or restarts
let familiarization_first_attempt_errors = 0;
let familiarization_attempted_trials = new Set(); // Track which trials have been attempted

// Track block iteration and trial numbers
let familiarization_block_iteration = 0; // Which iteration of the familiarization_trials block
let familiarization_trial_number = 0; // Trial number within current familiarization block iteration
let recall_trial_number = 0; // Trial number within current recall block

// Track outer loop iteration for recall trials
let outer_loop_iteration = 0;
// Track recall trial results for current iteration
let current_iteration_recall_trials = [];

const familiarization_instructions_trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div class="instruction-text">
      <h2>Learning Elvish Directions</h2>
      <p>Let's start learning to read the compass. You will see a direction and two potential words for that direction. Type the word that you think is correct. We'll keep practicing until you've learned all the directions.'</p>
      <p class="prompt-text">Press any key to begin</p>
    </div>
  `,
  choices: 'ALL_KEYS',
  data: {
    trial_type: 'familiarization_instructions'
  }
};

// Familiarization trial - loops until participant gets it correct
const familiarization_trial = {
  timeline: [{
    type: jsPsychSurveyHtmlForm,
    html: function() {
      const angle = jsPsych.evaluateTimelineVariable('angle');
      const leftLabel = jsPsych.evaluateTimelineVariable('leftLabel');
      const rightLabel = jsPsych.evaluateTimelineVariable('rightLabel');
      const target = jsPsych.evaluateTimelineVariable('target');
      const compassHTML = createCompassHTML(angle);

      return `
        <div class="compass-container">
          ${compassHTML}
          <p class="compass-instruction">Which label? <span class="compass-label">${leftLabel}</span> or <span class="compass-label">${rightLabel}</span></p>
          <p style="font-size: 16px; margin: 20px 0;">Type the name of the correct label:</p>
          <input type="text" id="familiarization-response" name="familiarization-response" class="compass-input" autocomplete="off" autofocus />
        </div>
      `;
    },
    autofocus: 'familiarization-response',
    data: {
      trial_type: 'familiarization'
    },
    on_finish: function(data) {
      // Get target from timeline variables
      const target = jsPsych.evaluateTimelineVariable('target');
      const angle = jsPsych.evaluateTimelineVariable('angle');
      const leftLabel = jsPsych.evaluateTimelineVariable('leftLabel');
      const rightLabel = jsPsych.evaluateTimelineVariable('rightLabel');
      const response = data.response['familiarization-response'].toLowerCase().trim();
      const isCorrect = response === target.toLowerCase();
      
      // Create a unique identifier for this trial
      const trialId = `${angle}_${target}_${leftLabel}_${rightLabel}`;
      
      // Check if this is the first attempt for this trial
      const isFirstAttempt = !familiarization_attempted_trials.has(trialId);
      
      if (isFirstAttempt) {
        // Mark this trial as attempted
        familiarization_attempted_trials.add(trialId);
        
        // Increment trial number for this new unique trial
        familiarization_trial_number++;
        
        // Count first-attempt errors
        if (!isCorrect) {
          familiarization_first_attempt_errors++;
        }
      }
      
      // Play buzz sound if incorrect
      if (!isCorrect) {
        const audio = new Audio('stimuli/audio/buzz.wav');
        audio.play().catch(e => console.log('Audio play failed:', e));
      }
      
      data.is_correct = isCorrect ? 1 : 0;
      data.response_text = response;
      data.target = target;
      data.angle = angle;
      data.leftLabel = leftLabel;
      data.rightLabel = rightLabel;
      data.is_first_attempt = isFirstAttempt ? 1 : 0;
      data.first_attempt_errors_count = familiarization_first_attempt_errors;
      data.familiarization_block_iteration = familiarization_block_iteration;
      data.familiarization_trial_number = familiarization_trial_number;
    }
  }],
  loop_function: function(data) {
    // Repeat trial if participant got it wrong
    // data.values() returns an array of all trial data in this timeline
    const values = data.values();
    if (values.length === 0) return false;
    const lastTrial = values[values.length - 1];
    return lastTrial.is_correct === 0; // Repeat if incorrect
  }
}

// Randomly select one of the 10 trial blocks
const selectedBlockIndex = Math.floor(Math.random() * training_trials_data.length);
const selectedBlock = training_trials_data[selectedBlockIndex];
const selectedTrials = selectedBlock.trials;

// Store the selected block ID in the experiment data
jsPsych.data.addProperties({
  selected_block_id: selectedBlock.block_id
});

// need to nest **this** in a timeline that loops the block until the participant gets 80% of the selections correct
const familiarization_trials_inner = {
  timeline: [familiarization_trial],
  timeline_variables: selectedTrials,
  randomize_order: true
};

// Setup trial to reset first-attempt error tracking at the start of each block iteration
const familiarization_reset_trial = {
  type: jsPsychCallFunction,
  func: function() {
    // Reset first-attempt error tracking when this block starts/restarts
    // This ensures the count resets for each iteration of the block (including when nested in a loop)
    familiarization_first_attempt_errors = 0;
    familiarization_attempted_trials.clear();
    // Reset trial number counter for new block iteration
    familiarization_trial_number = 0;
  }
};

// Wrapper timeline that resets counters at the start of each iteration
const familiarization_trials = {
  timeline: [familiarization_reset_trial, familiarization_trials_inner],
  on_timeline_start: function() {
    // Increment block iteration at the start of each block iteration
    familiarization_block_iteration++;
  },
  loop_function: function(data) {
    // Calculate error rate based on first-attempt errors
    // Check counters BEFORE resetting them
    const totalTrials = selectedTrials.length;
    const firstAttemptErrors = familiarization_first_attempt_errors;
    const errorRate = firstAttemptErrors / totalTrials;
    const correctRate = 1 - errorRate;
    
    // Loop if participant got less than 80% correct (20% or more errors on first attempt)
    // We want to loop until they get fewer than 20% incorrect (at least 80% correct)
    const shouldLoop = correctRate < EXPERIMENT_CONFIG.TRAINING_THRESHOLD;
    
    // Log the results for debugging
    console.log(`Familiarization block iteration ${familiarization_block_iteration} completed: ${firstAttemptErrors}/${totalTrials} first-attempt errors (${(errorRate * 100).toFixed(1)}% error rate, ${(correctRate * 100).toFixed(1)}% correct rate). Looping: ${shouldLoop}`);
    
    // Store block completion data
    const values = data.values();
    if (values.length > 0) {
      // Add block-level data to the last trial
      const lastTrial = values[values.length - 1];
      lastTrial.block_first_attempt_errors = firstAttemptErrors;
      lastTrial.block_total_trials = totalTrials;
      lastTrial.block_error_rate = errorRate;
      lastTrial.block_correct_rate = correctRate;
      lastTrial.block_will_loop = shouldLoop ? 1 : 0;
    }
    
    // Reset first-attempt error tracking when this block loops
    // This ensures the count resets for each iteration of the block
    familiarization_first_attempt_errors = 0;
    familiarization_attempted_trials.clear();
    
    return shouldLoop;
  }
};

// Recall trials - defined before outer loop so they can be referenced
const recall_instructions_trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div class="instruction-text">
      <h2>Recalling Elvish Directions</h2>
      <p>You're getting pretty good at reading the compass! Now you'll practice recalling the directions you've learned. You will see a direction and you'll need to type the name of the direction. Press any key to begin.</p>
    </div>
  `,
  choices: 'ALL_KEYS',
  data: {
    trial_type: 'recall_instructions'
  }
}

const recall_trial = {
  type: jsPsychSurveyHtmlForm,
  html: function() {
    const angle = jsPsych.evaluateTimelineVariable('angle');
    const label = jsPsych.evaluateTimelineVariable('label');
    const compassHTML = createCompassHTML(angle);
    return `
      <div class="compass-container">
        ${compassHTML}
        <p class="compass-instruction">What is this direction called?</p>
        <input type="text" id="recall-response" name="recall-response" class="compass-input" autocomplete="off" autofocus />
      </div>
    `;
  },
  autofocus: 'recall-response',
  data: {
    trial_type: 'recall'
  },
  on_finish: function(data) {
    // Get label and angle from timeline variables
    const label = jsPsych.evaluateTimelineVariable('label');
    const angle = jsPsych.evaluateTimelineVariable('angle');
    const response = data.response['recall-response'].toLowerCase().trim();
    const isCorrect = response === label.toLowerCase() ? 1 : 0;
    
    data.is_correct = isCorrect;
    data.response_text = response;
    data.target = label;
    data.angle = angle;
    data.outer_loop_iteration = outer_loop_iteration;
    data.recall_trial_number = recall_trial_number;
    
    // Track this recall trial result for the current iteration
    current_iteration_recall_trials.push({
      angle: angle,
      target: label,
      is_correct: isCorrect,
      response: response
    });
  }
}

const recall_trials = {
  timeline: [recall_trial],
  timeline_variables: angle_label_pairs,
  randomize_order: true,
  on_timeline_start: function() {
    // Clear recall trials array at the start of recall trials (ensures clean slate)
    current_iteration_recall_trials = [];
    // Reset recall trial number counter
    recall_trial_number = 0;
    console.log('Starting recall trials - cleared tracking array');
  },
  on_trial_start: function() {
    // Increment recall trial number when a new trial starts
    recall_trial_number++;
  }
}

const familiarization_trials_outer_loop = {
  timeline: [familiarization_trials, 
    recall_instructions_trial, 
    recall_trials],
  on_timeline_start: function() {
    // Increment iteration counter and reset recall trials tracking at the start of each iteration
    outer_loop_iteration++;
    current_iteration_recall_trials = [];
    console.log(`Starting outer loop iteration ${outer_loop_iteration}`);
  },
  loop_function: function(data) {
    // Use the tracked recall trials array
    // Only take the most recent 8 trials (from current iteration)
    // This handles cases where the array might contain trials from previous iterations
    const expectedTrialCount = angle_label_pairs.length;
    const allRecallTrials = current_iteration_recall_trials;
    const recallTrials = allRecallTrials.slice(-expectedTrialCount);
    
    // Check if enough recall trials were correct based on threshold
    const totalRecallTrials = recallTrials.length;
    const correctRecallTrials = recallTrials.filter(trial => trial.is_correct === 1).length;
    const requiredCorrect = EXPERIMENT_CONFIG.RECALL_THRESHOLD;
    const thresholdMet = correctRecallTrials >= requiredCorrect && totalRecallTrials === expectedTrialCount;
    
    // Loop if threshold not met (restart familiarization)
    const shouldLoop = !thresholdMet;
    
    // Log the results for debugging
    console.log(`Outer loop iteration ${outer_loop_iteration} completed: ${correctRecallTrials}/${totalRecallTrials} recall trials correct (required: ${requiredCorrect}). Threshold met: ${thresholdMet}. Looping: ${shouldLoop}`);
    if (allRecallTrials.length !== recallTrials.length) {
      console.log(`Note: Total trials in array: ${allRecallTrials.length}, Using last ${recallTrials.length} trials`);
    }
    console.log('Recall trials from this iteration:', recallTrials.map(t => ({angle: t.angle, target: t.target, is_correct: t.is_correct})));
    
    // Store loop completion data in the last trial
    const values = data.values();
    if (values.length > 0) {
      const lastTrial = values[values.length - 1];
      lastTrial.outer_loop_recall_correct = correctRecallTrials;
      lastTrial.outer_loop_recall_total = totalRecallTrials;
      lastTrial.outer_loop_recall_threshold = requiredCorrect;
      lastTrial.outer_loop_threshold_met = thresholdMet ? 1 : 0;
      lastTrial.outer_loop_will_loop = shouldLoop ? 1 : 0;
      lastTrial.outer_loop_iteration = outer_loop_iteration;
    }
    
    return shouldLoop;
  }
}

// Save data to DataPipe using jsPsychPipe plugin
// Only add this trial if DataPipe is configured
const save_data = EXPERIMENT_CONFIG.DATAPIPE_EXPERIMENT_ID ? {
  type: jsPsychPipe,
  action: "save",
  experiment_id: EXPERIMENT_CONFIG.DATAPIPE_EXPERIMENT_ID,
  filename: filename,
  data_string: () => jsPsych.data.get().csv()
} : null;

// End/Final Trial
var final_trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p>You've finished the last task. Thanks for participating!</p>
      <p><a href="https://app.prolific.co/submissions/complete?cc=${EXPERIMENT_CONFIG.PROLIFIC_COMPLETION_CODE}">Click here to return to Prolific and complete the study</a>.</p>`,
    choices: "NO_KEYS"
  }


// push to timeline
const timeline = [
  consent_trial,
  introduction_trial,
  exposure_instructions_trial,
  exposure_trials,
  familiarization_instructions_trial,
  familiarization_trials_outer_loop
];

// Add DataPipe save trial to timeline if configured (before final trial)
if (save_data) {
  timeline.push(save_data);
}

// Add final trial at the end
timeline.push(final_trial);
// Start the experiment
jsPsych.run(timeline);