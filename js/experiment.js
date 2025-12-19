// Main Experiment Script

// Function to dynamically load a script
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Function to randomly select and load config, then load trial orders
async function initializeExperiment() {
  // List of available config files
  const configFiles = [
    'js/1-2_5.js',
    'js/1-2_10.js',
    'js/1-4_5.js',
    'js/1-4_10.js'
  ];
  
  // Randomly select one config file
  const selectedConfigIndex = Math.floor(Math.random() * configFiles.length);
  const selectedConfigFile = configFiles[selectedConfigIndex];
  
  console.log(`Loading config file: ${selectedConfigFile}`);
  
  // Load the selected config file
  await loadScript(selectedConfigFile);
  
  // Store which config was selected for data logging
  const selectedConfigName = selectedConfigFile.replace('js/', '').replace('.js', '');
  
  // Load trial order files based on the config
  const trainingTrialsPath = EXPERIMENT_CONFIG.TRAINING_TRIALS_PATH;
  const testTrialsPath = EXPERIMENT_CONFIG.TEST_TRIALS_PATH;
  
  console.log(`Loading training trials: ${trainingTrialsPath}`);
  console.log(`Loading test trials: ${testTrialsPath}`);
  
  await loadScript(trainingTrialsPath);
  await loadScript(testTrialsPath);
  
  // Now that config and trial orders are loaded, start the experiment
  startExperiment(selectedConfigName);
}

// Main experiment function (moved from global scope)
function startExperiment(selectedConfigName) {
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
      experiment_version: EXPERIMENT_CONFIG.EXPERIMENT_VERSION,
      selected_config: selectedConfigName
  });

  // ============================================
  // Phase 1: Consent Page
  // ============================================

  const consent_trial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
        <div class="consent-text">
        <h2>Consent Agreement</h2>
       <p>
            Please read this consent agreement carefully before deciding whether to participate in this experiment. 
          </p>
          <p>
            <strong>Description:</strong> You are invited to participate in a research study about language and language learning. The purpose of the research is to understand how people learn new words. This research will be conducted through the Prolific platform, including participants from the US, UK, and Canada. If you decide to participate in this research, you will learn and use new words. 
          </p> 
          <p>
            <strong>Time Involvement:</strong> The task will last the amount of time advertised on Prolific. You are free to withdraw from the study at any time. 
          </p>
          <p>
            <strong>Risks and Benefits:</strong> Study data will be stored securely, in compliance with Stanford University standards, minimizing the risk of confiden-tiality breach. This study advances our scientific understanding of how people learn new languages. We cannot and do not guarantee or promise that you will receive any benefits from this study. 
          </p>
          <p>
            <strong>Compensation:</strong> You will receive payment in the amount advertised on Prolific. If you do not complete this study, you will receive prorated payment based on the time that you have spent. Additionally, you may be eligible for bonus payments as described in the instructions. 
          </p>
          <p>
            <strong>Participant's Rights:</strong> If you have read this form and have decided to participate in this project, please understand your participation is voluntary and you have the right to withdraw your consent or discontinue participation at any time without penalty or loss of benefits to which you are otherwise entitled. The alternative is not to participate. You have the right to refuse to answer particular questions. The results of this research study may be presented at scientific or professional meetings or published in scientific journals. Your individual privacy will be maintained in all published and writ-ten data resulting from the study. In accordance with scientific norms, the data from this study may be used or shared with other researchers for future research (after removing personally identifying information) without additional consent from you. 
          </p>
          <p>
            <strong>Contact Information:</strong> If you have any questions, concerns or complaints about this research, its procedures, risks and benefits, contact the Protocol Director, Robert Hawkins (<a href="mailto:rdhawkins@stanford.edu">rdhawkins@stanford.edu</a>, 217-549-6923).
            </p>
          <p>
            <strong>Independant Contact:</strong> If you are not satisfied with how this study is being conducted, or if you have any concerns, com-plaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at 650-723-2480 or toll free at 1-866-680-2906, or email at irbnonmed@stanford.edu. You can also write to the Stanford IRB, Stanford University, 1705 El Camino Real, Palo Alto, CA 94306. Please save or print a copy of this page for your records. 
          </p>
          <p>
            <strong>If you agree to participate in this research, please click "I agree"</strong>
          </p></br>
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
    data.consent_response = data.response === 0 ? 'agree' : 'disagree';
    data.consent_timestamp = new Date().toISOString();
    
    if (data.response === 1) {
      jsPsych.abortExperiment(`
        <div class="instruction-text">
          <h2>Thank you</h2>
          <p>You have chosen not to participate. Please close this tab and return the task in Prolific.</p>
        </div>
      `);
    }
  }
};

// ============================================
// Phase 2: Overall Introduction
// ============================================

const introduction_trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class="instruction-text">
        <h2>Welcome to the Elves Treasure Hunt Experiment</h2>
        <p>Thank you for your participation. In order to complete today's task, you're going to play a game. You've been asked to be a guide for a squad of Elves looking to find buried treasure. Their compass navigator has gone missing and there's not much time before winter makes the hunt impossible. In exchange for your navigating, they'll give you a cut of their prize.</p>
        <p>Here's the situation. The worker elves only know Elvish. It's your job to learn to read the compass as quickly and accurately as possible, and use what you know to guide the Elves to treasure. First you'll learn how to give directions. Just as soon as you pass basic navigating it's off to hunt for treasure. Good luck!</p>
        <p><strong>Important:</strong> Please do NOT write things down during this experiment. We want to understand how you naturally remember and learn the words without any assistance. Also, please do NOT use AI or AI tools (such as ChatGPT, Google Bard, or any other AI assistants) to help you with this task.</p>
        <p class="prompt-text">Press any key to continue</p>
      </div>
    `,
    choices: 'ALL_KEYS',
    data: {
      trial_type: 'introduction'
    }
  };

// ============================================
// Phase 2.5: Compliance Checkboxes
// ============================================

const compliance_checkboxes_trial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div class="instruction-text">
      <h2>Important Instructions</h2>
      <p>Before we begin, please confirm that you understand and agree to the following:</p>
      <div style="text-align: left; max-width: 600px; margin: 20px auto; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
        <label style="display: block; margin: 15px 0; font-size: 16px; cursor: pointer;">
          <input type="checkbox" id="checkbox-no-writing" style="margin-right: 10px; width: 18px; height: 18px; cursor: pointer;">
          <span>I will NOT write things down during this experiment. I understand that the researchers want to know how I naturally remember and learn the words without assistance.</span>
        </label>
        <label style="display: block; margin: 15px 0; font-size: 16px; cursor: pointer;">
          <input type="checkbox" id="checkbox-no-ai" style="margin-right: 10px; width: 18px; height: 18px; cursor: pointer;">
          <span>I will NOT use AI or AI tools (such as ChatGPT, Google Bard, or any other AI assistants) to help me with this task.</span>
        </label>
      </div>
    </div>
  `,
  choices: ['Continue'],
  button_html: function(choice, choice_index) {
    return `<button id="compliance-continue-btn" class="jspsych-btn" disabled style="
      padding: 12px 30px;
      font-size: 18px;
      background-color: #ccc;
      color: #666;
      border: none;
      border-radius: 5px;
      cursor: not-allowed;
      margin-top: 20px;
    ">${choice}</button>`;
  },
  data: {
    trial_type: 'compliance_checkboxes'
  },
  on_load: function() {
    const checkboxNoWriting = document.getElementById('checkbox-no-writing');
    const checkboxNoAI = document.getElementById('checkbox-no-ai');
    const continueBtn = document.getElementById('compliance-continue-btn');
    
    if (!continueBtn) return;
    
    function updateButtonState() {
      const bothChecked = checkboxNoWriting && checkboxNoAI && checkboxNoWriting.checked && checkboxNoAI.checked;
      if (bothChecked) {
        continueBtn.disabled = false;
        continueBtn.style.backgroundColor = '#2196F3';
        continueBtn.style.color = 'white';
        continueBtn.style.cursor = 'pointer';
      } else {
        continueBtn.disabled = true;
        continueBtn.style.backgroundColor = '#ccc';
        continueBtn.style.color = '#666';
        continueBtn.style.cursor = 'not-allowed';
      }
    }
    
    if (checkboxNoWriting) {
      checkboxNoWriting.addEventListener('change', updateButtonState);
    }
    if (checkboxNoAI) {
      checkboxNoAI.addEventListener('change', updateButtonState);
    }
    
    // Initial state
    updateButtonState();
  },
  on_finish: function(data) {
    const checkboxNoWriting = document.getElementById('checkbox-no-writing');
    const checkboxNoAI = document.getElementById('checkbox-no-ai');
    data.compliance_no_writing = checkboxNoWriting ? checkboxNoWriting.checked : false;
    data.compliance_no_ai = checkboxNoAI ? checkboxNoAI.checked : false;
  }
};

// ============================================
// Phase 3: Exposure Trials
// ============================================

const exposure_instructions_trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div class="instruction-text">
        <h2>Practicing Elvish Directions</h2>
        <p>The Elves use 8 principal directions to navigate. You're about to see the names for each direction, and practice giving directions by typing in the name of the direction.</p>
        <p class="prompt-text">Press any key to begin</p>
      </div>
    `,
    choices: 'ALL_KEYS',
    data: {
      trial_type: 'exposure_instructions'
    }
  };

// Exposure trial - loops until participant gets it correct
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
                <div id="exposure-feedback" style="display: none; margin-top: 20px; font-size: 16px; color: #d32f2f;"></div>
              </div>
            `;
        },
        data: {
            trial_type: 'exposure'
        },
        on_load: function() {
            // Hide feedback when trial loads
            const feedbackDiv = document.getElementById('exposure-feedback');
            if (feedbackDiv) {
                feedbackDiv.style.display = 'none';
            }
            
            // Wait for jsPsych to set up the form, then add our handler
            setTimeout(function() {
                const form = document.getElementById('jspsych-survey-html-form');
                const target = jsPsych.evaluateTimelineVariable('label');
                const responseInput = document.getElementById('exposure-response');
                const feedbackDiv = document.getElementById('exposure-feedback');
                
                if (form && responseInput && feedbackDiv) {
                    // Intercept form submission
                    form.addEventListener('submit', function(e) {
                        // If feedback is already visible, allow submission to proceed
                        if (feedbackDiv.style.display === 'block') {
                            return;
                        }
                        
                        const response = responseInput.value.toLowerCase().trim();
                        const isCorrect = response === target.toLowerCase();
                        
                        // If incorrect, prevent submission and show feedback
                        if (!isCorrect && response !== '') {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            
                            const originalResponse = responseInput.value.trim();
                            feedbackDiv.textContent = `You entered: ${originalResponse}`;
                            feedbackDiv.style.display = 'block';
                        }
                        // If correct, allow normal submission (don't prevent default)
                    }, true); // Use capture phase to intercept before jsPsych
                }
            }, 100);
        },
        on_finish: function(data) {
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
      const values = data.values();
      return values.length > 0 && values[values.length - 1].is_correct === 0;
  }
}

const exposure_trials = {
    timeline: [exposure_trial],
    timeline_variables: angle_label_pairs,
    randomize_order: false
};


// ============================================
// Phase 4: Familiarization Trials
// ============================================

// Track familiarization block state
let familiarization_state = {
  first_attempt_errors: 0,
  attempted_trial_indices: new Set(), // Track by trial index within block iteration, not word combination
  block_iteration: 0,
  current_trial_index: 0, // Track the current trial's position in the block iteration (actual trial number)
  seen_trial_keys: null // Map of trial keys to trial indices (reset each block)
};

// Track recall block state
let recall_state = {
  outer_loop_iteration: 0,
  trial_number: 0,
  current_iteration_trials: []
};

const familiarization_instructions_trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div class="instruction-text">
      <h2>Learning Elvish Directions</h2>
      <p>Let's start learning to read the compass. You will see a direction and two potential words for that direction. Type the word that you think is correct. We'll keep practicing until you've learned all the directions. A buzz will play if you got the trial incorrect.</p>
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
      // Get trial variables from the timeline_variables (from the JS trial list)
      // leftLabel and rightLabel are set in the trial data and represent the left and right positions
      const angle = jsPsych.evaluateTimelineVariable('angle');
      const leftLabel = jsPsych.evaluateTimelineVariable('leftLabel'); // Left position label from trial data
      const rightLabel = jsPsych.evaluateTimelineVariable('rightLabel'); // Right position label from trial data
      const target = jsPsych.evaluateTimelineVariable('target');
      const compassHTML = createCompassHTML(angle);

      return `
        <div class="compass-container">
          ${compassHTML}
          <p class="compass-instruction">Which label?</p>
          <div style="display: flex; justify-content: space-around; align-items: center; margin: 20px 0; max-width: 600px; margin-left: auto; margin-right: auto;">
            <div style="text-align: center; flex: 1;">
              <span class="compass-label" style="font-size: 20px; font-weight: bold; display: block;">${leftLabel}</span>
            </div>
            <div style="padding: 0 20px; font-size: 18px; color: #666;">or</div>
            <div style="text-align: center; flex: 1;">
              <span class="compass-label" style="font-size: 20px; font-weight: bold; display: block;">${rightLabel}</span>
            </div>
          </div>
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
      const target = jsPsych.evaluateTimelineVariable('target');
      const angle = jsPsych.evaluateTimelineVariable('angle');
      const leftLabel = jsPsych.evaluateTimelineVariable('leftLabel');
      const rightLabel = jsPsych.evaluateTimelineVariable('rightLabel');
      const trial_id = jsPsych.evaluateTimelineVariable('trial_id');
      const response = data.response['familiarization-response'].toLowerCase().trim();
      const isCorrect = response === target.toLowerCase();
      
      // Check if this is the first time we're seeing this trial (by checking if current_trial_index needs incrementing)
      // We increment the index when we encounter a new trial from timeline_variables
      // If this trial has already been attempted, current_trial_index should already be set
      // We need to detect if this is a new trial vs a loop of the same trial
      // Strategy: Use trial_id as the unique identifier (each trial has a unique trial_id)
      
      // Check if we've seen this trial_id before in this block iteration
      // If not, it's a new trial, so increment the index
      if (!familiarization_state.seen_trial_keys) {
        familiarization_state.seen_trial_keys = new Map(); // Maps trial_id to trial index
      }
      
      let currentIndex;
      if (familiarization_state.seen_trial_keys.has(trial_id)) {
        // This is a loop of a trial we've seen before - use the existing index
        currentIndex = familiarization_state.seen_trial_keys.get(trial_id);
      } else {
        // This is a new trial - increment index and map it
        familiarization_state.current_trial_index++;
        currentIndex = familiarization_state.current_trial_index;
        familiarization_state.seen_trial_keys.set(trial_id, currentIndex);
      }
      
      // Check if this is the first attempt for this trial instance (by index within block iteration)
      const isFirstAttempt = !familiarization_state.attempted_trial_indices.has(currentIndex);
      
      // Debug logging
      console.log(`Familiarization trial finish: trial_id=${trial_id}, current_trial_index=${currentIndex}, isFirstAttempt=${isFirstAttempt}, isCorrect=${isCorrect}, attempted_indices=[${Array.from(familiarization_state.attempted_trial_indices).join(',')}]`);
      
      // If this is the first attempt, mark it and update counters
      if (isFirstAttempt) {
        familiarization_state.attempted_trial_indices.add(currentIndex);
        // Count errors only on first attempts
        if (!isCorrect) {
          familiarization_state.first_attempt_errors++;
          console.log(`First attempt error! Total first_attempt_errors now: ${familiarization_state.first_attempt_errors}`);
        }
      }
      
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
      data.trial_id = trial_id;
      data.is_first_attempt = isFirstAttempt ? 1 : 0;
      data.first_attempt_errors_count = familiarization_state.first_attempt_errors;
      data.familiarization_block_iteration = familiarization_state.block_iteration;
      // Use current_trial_index as the actual trial number in the block (not just first attempts)
      data.familiarization_trial_number = currentIndex;
      data.trial_index = currentIndex;
    }
  }],
  loop_function: function(data) {
    // Get all trial data from this loop iteration
    const values = Array.from(data.values());
    if (values.length === 0) {
      return false;
    }
    // Get the most recent trial (last in the array)
    const lastTrial = values[values.length - 1];
    // Only loop if the last trial was incorrect
    // Ensure is_correct exists and is 0 (incorrect)
    const shouldLoop = lastTrial.hasOwnProperty('is_correct') && 
                       (lastTrial.is_correct === 0 || lastTrial.is_correct === false);
    return shouldLoop;
  }
}

// Randomly select one of the trial blocks
const selectedTrainingBlockIndex = Math.floor(Math.random() * training_trials_data.length);
const selectedTrainingBlock = training_trials_data[selectedTrainingBlockIndex];
const selectedTrainingTrials = selectedTrainingBlock.trials;

jsPsych.data.addProperties({
  selected_training_block_id: selectedTrainingBlock.block_id
});

const familiarization_trials_inner = {
  timeline: [familiarization_trial],
  timeline_variables: selectedTrainingTrials,
  randomize_order: true
};

// Reset state at the start of each block iteration
const familiarization_reset_trial = {
  type: jsPsychCallFunction,
  func: function() {
    // Increment block iteration at the START of each block iteration
    // This ensures all trials in this block have the correct iteration number
    familiarization_state.block_iteration++;
    console.log(`[FAMILIARIZATION] Starting block iteration ${familiarization_state.block_iteration}`);
    
    // Reset other state for this new block
    familiarization_state.first_attempt_errors = 0;
    familiarization_state.attempted_trial_indices.clear();
    familiarization_state.current_trial_index = 0;
    familiarization_state.seen_trial_keys = new Map();
    console.log(`Reset complete: first_attempt_errors=0, current_trial_index=0, seen_trial_keys cleared`);
  }
};

const familiarization_trials = {
  timeline: [familiarization_reset_trial, familiarization_trials_inner],
  on_timeline_start: function() {
    // Clear recall trials tracking at start of outer loop
    recall_state.current_iteration_trials = [];
    console.log(`[FAMILIARIZATION] on_timeline_start`);
  },
  loop_function: function(data) {
    const totalTrials = selectedTrainingTrials.length;
    const firstAttemptErrors = familiarization_state.first_attempt_errors;
    const errorRate = firstAttemptErrors / totalTrials;
    const correctRate = 1 - errorRate;
    const shouldLoopByThreshold = correctRate < EXPERIMENT_CONFIG.TRAINING_THRESHOLD;
    
    console.log(`Familiarization block iteration ${familiarization_state.block_iteration} completed: ${firstAttemptErrors}/${totalTrials} first-attempt errors (${(errorRate * 100).toFixed(1)}% error rate, ${(correctRate * 100).toFixed(1)}% correct rate). Training threshold met: ${!shouldLoopByThreshold}`);
    
    // Check if we've reached 10 familiarization block loops (safety limit)
    // If so, force exit to proceed to recall/test phase
    if (familiarization_state.block_iteration >= 10) {
      console.log(`Familiarization block iteration reached maximum (10). Forcing exit to proceed to recall/test phase.`);
      return false;
    }
    
    // Store block completion data
    const values = data.values();
    if (values.length > 0) {
      const lastTrial = values[values.length - 1];
      lastTrial.block_first_attempt_errors = firstAttemptErrors;
      lastTrial.block_total_trials = totalTrials;
      lastTrial.block_error_rate = errorRate;
      lastTrial.block_correct_rate = correctRate;
      lastTrial.block_will_loop = shouldLoopByThreshold ? 1 : 0;
    }
    
    // Use normal training threshold logic
    return shouldLoopByThreshold;
  }
};

// ============================================
// Phase 5: Recall Trials
// ============================================

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
    const label = jsPsych.evaluateTimelineVariable('label');
    const angle = jsPsych.evaluateTimelineVariable('angle');
    const response = data.response['recall-response'].toLowerCase().trim();
    const isCorrect = response === label.toLowerCase() ? 1 : 0;
    
    data.is_correct = isCorrect;
    data.response_text = response;
    data.target = label;
    data.angle = angle;
    data.outer_loop_iteration = recall_state.outer_loop_iteration;
    data.recall_trial_number = recall_state.trial_number;
    
    recall_state.current_iteration_trials.push({
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
    recall_state.current_iteration_trials = [];
    recall_state.trial_number = 0;
    console.log('Starting recall trials - cleared tracking array');
  },
  on_trial_start: function() {
    recall_state.trial_number++;
  }
}

// Message trial showing "Saving your data and checking answers. Please do not close this page."
const saving_message_trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div class="instruction-text">
      <h2>Saving your data and checking answers.</h2>
      <p>Please do not close this page.</p>
    </div>
  `,
  choices: "NO_KEYS",
  trial_duration: 2000, // Show for 2 seconds while saving
  data: {
    trial_type: 'saving_message'
  },
  on_finish: function(data) {
    data.recall_iteration = recall_state.outer_loop_iteration;
  }
};

// Data saving trial after each recall test
const save_data_recall = EXPERIMENT_CONFIG.DATAPIPE_EXPERIMENT_ID ? {
  type: jsPsychPipe,
  action: "save",
  experiment_id: EXPERIMENT_CONFIG.DATAPIPE_EXPERIMENT_ID,
  filename: `training_${filename}`,
  data_string: () => jsPsych.data.get().csv(),
  data: {
    trial_type: 'save_data_recall'
  },
  on_finish: function(data) {
    data.recall_iteration = recall_state.outer_loop_iteration;
  }
} : null;

// Continue trial showing feedback based on recall performance
const continue_after_save_trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function() {
    // Calculate recall performance
    const expectedTrialCount = angle_label_pairs.length;
    const recallTrials = recall_state.current_iteration_trials;
    const totalRecallTrials = recallTrials.length;
    const correctRecallTrials = recallTrials.filter(trial => trial.is_correct === 1).length;
    const requiredCorrect = EXPERIMENT_CONFIG.RECALL_THRESHOLD;
    const thresholdMet = correctRecallTrials >= requiredCorrect && totalRecallTrials === expectedTrialCount;
    
    // Determine message based on performance
    let message;
    if (thresholdMet) {
      message = "Great! You're ready to give the elves some directions!";
    } else {
      message = `You got ${correctRecallTrials}/${totalRecallTrials} directions correct. Please keep practicing!`;
    }
    
    return `
      <div class="instruction-text">
        <p class="prompt-text">${message}</p>
        <p class="prompt-text" style="margin-top: 20px;">Press any key to continue</p>
      </div>
    `;
  },
  choices: 'ALL_KEYS',
  data: {
    trial_type: 'continue_after_save'
  },
  on_finish: function(data) {
    // Store recall performance data
    const expectedTrialCount = angle_label_pairs.length;
    const recallTrials = recall_state.current_iteration_trials;
    const totalRecallTrials = recallTrials.length;
    const correctRecallTrials = recallTrials.filter(trial => trial.is_correct === 1).length;
    const requiredCorrect = EXPERIMENT_CONFIG.RECALL_THRESHOLD;
    const thresholdMet = correctRecallTrials >= requiredCorrect && totalRecallTrials === expectedTrialCount;
    
    data.recall_correct = correctRecallTrials;
    data.recall_total = totalRecallTrials;
    data.recall_threshold_met = thresholdMet ? 1 : 0;
    data.recall_iteration = recall_state.outer_loop_iteration;
  }
};

// Build the timeline for saving after recall
const save_after_recall_timeline = [];
if (EXPERIMENT_CONFIG.DATAPIPE_EXPERIMENT_ID) {
  save_after_recall_timeline.push(saving_message_trial);
  if (save_data_recall) {
    save_after_recall_timeline.push(save_data_recall);
  }
  save_after_recall_timeline.push(continue_after_save_trial);
}

const familiarization_trials_outer_loop = {
  timeline: [familiarization_trials, 
    recall_instructions_trial, 
    recall_trials,
    ...save_after_recall_timeline],
  on_timeline_start: function() {
    // Increment for the first iteration (on_timeline_start only runs once)
    recall_state.outer_loop_iteration++;
    recall_state.current_iteration_trials = [];
    console.log(`[OUTER LOOP] Starting iteration ${recall_state.outer_loop_iteration}`);
  },
  loop_function: function(data) {
    const expectedTrialCount = angle_label_pairs.length;
    const recallTrials = recall_state.current_iteration_trials;
    
    const totalRecallTrials = recallTrials.length;
    const correctRecallTrials = recallTrials.filter(trial => trial.is_correct === 1).length;
    const requiredCorrect = EXPERIMENT_CONFIG.RECALL_THRESHOLD;
    const thresholdMet = correctRecallTrials >= requiredCorrect && totalRecallTrials === expectedTrialCount;
    
    // Check if we've reached 10 familiarization block loops (safety limit)
    // If so, force exit to proceed to test phase
    if (familiarization_state.block_iteration >= 10) {
      console.log(`Familiarization block iteration reached maximum (10) in outer loop. Stopping outer loop and proceeding to test phase.`);
      return false;
    }
    
    const shouldLoop = !thresholdMet;
    
    console.log(`[OUTER LOOP] Iteration ${recall_state.outer_loop_iteration} completed: ${correctRecallTrials}/${totalRecallTrials} recall trials correct (required: ${requiredCorrect}). Threshold met: ${thresholdMet}. Looping: ${shouldLoop}`);
    console.log('Recall trials from this iteration:', recallTrials.map(t => ({angle: t.angle, target: t.target, is_correct: t.is_correct})));
    
    // Store loop completion data
    const values = data.values();
    if (values.length > 0) {
      const lastTrial = values[values.length - 1];
      lastTrial.outer_loop_recall_correct = correctRecallTrials;
      lastTrial.outer_loop_recall_total = totalRecallTrials;
      lastTrial.outer_loop_recall_threshold = requiredCorrect;
      lastTrial.outer_loop_threshold_met = thresholdMet ? 1 : 0;
      lastTrial.outer_loop_will_loop = shouldLoop ? 1 : 0;
      lastTrial.outer_loop_iteration = recall_state.outer_loop_iteration;
    }
    
    // Increment for the next iteration (if we're looping)
    if (shouldLoop) {
      recall_state.outer_loop_iteration++;
      recall_state.current_iteration_trials = [];
      console.log(`[OUTER LOOP] Incrementing to iteration ${recall_state.outer_loop_iteration} for next loop`);
    }
    
    return shouldLoop;
  }
}

// ============================================
// Phase 6: Test Trials
// ============================================

const test_instructions_trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div class="instruction-text">
      <h2>Treasure Hunt</h2>
      <p>Now that you've learned the names of the directions, you'll use them to guide the Elves to the treasure! 
      <p>You'll be given a series of directions and you'll need to type the name of the direction. </p>
      <p><b>The closer the Elves get to the treasure based on your directions, the larger your bonus.</b> </p>
      <p>You'll have <span class="test-time">${EXPERIMENT_CONFIG.TEST_TIME}</span> seconds to give the Elf a direction. If you don't give a direction in time, you'll lose the bonus. </p>
      <p>Press any key to begin the treasure hunt!</p>
    </div>
  `,
  choices: 'ALL_KEYS',
  data: {
    trial_type: 'test_instructions'
  },
  on_finish: function() {
    // Initialize points display when test trials begin
    totalPoints = 0;
    initializePointsDisplay();
  }
}

// Randomly select one of the test trial blocks
const selectedTestBlockIndex = Math.floor(Math.random() * test_trials_data.length);
const selectedTestBlock = test_trials_data[selectedTestBlockIndex];
const selectedTestTrials = selectedTestBlock.trials;

jsPsych.data.addProperties({
  selected_test_block_id: selectedTestBlock.block_id
});

// Track total points across test trials
let totalPoints = 0;
let currentTrialNumber = 0;
let totalTestTrials = 0;

// Function to initialize the points display at the top of the screen
function initializePointsDisplay() {
  totalTestTrials = selectedTestTrials.length;
  currentTrialNumber = 0;
  
  const pointsDisplay = document.createElement('div');
  pointsDisplay.id = 'total-points-display';
  pointsDisplay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #2196F3;
    color: white;
    padding: 15px 20px;
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    z-index: 9999;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    display: flex;
    justify-content: space-around;
    align-items: center;
  `;
  pointsDisplay.innerHTML = `
    <div>Trial: <span id="trial-counter-value">0</span> / <span id="total-trials-value">${totalTestTrials}</span></div>
    <div>Total Bonus: <span id="total-points-value">$0.00</span></div>
  `;
  document.body.insertBefore(pointsDisplay, document.body.firstChild);
  
  // Add padding to body to account for fixed header
  document.body.style.paddingTop = '60px';
}

// Function to update the trial counter
function updateTrialCounter() {
  currentTrialNumber++;
  const trialCounterEl = document.getElementById('trial-counter-value');
  if (trialCounterEl) {
    trialCounterEl.textContent = currentTrialNumber;
  }
}

// Function to update the points display
function updatePointsDisplay(pointsToAdd) {
  totalPoints += pointsToAdd;
  const pointsValueEl = document.getElementById('total-points-value');
  if (pointsValueEl) {
    // Format as currency (bonusPoints already includes POINT_TO_BONUS_SCALE conversion)
    const dollarAmount = totalPoints;
    pointsValueEl.textContent = '$' + dollarAmount.toFixed(2);
  }
}

// Helper function to calculate angular distance (handling wrap-around)
// Returns the minimum angular distance in either direction (clockwise or counterclockwise)
// Examples: angularDistance(0, 10) = 10, angularDistance(0, 350) = 10, angularDistance(0, 180) = 180
function angularDistance(a1, a2) {
  const diff = Math.abs(a1 - a2);
  return Math.min(diff, 360 - diff);
}

// Helper function to find angle for a given label
function findAngleForLabel(label) {
  const pair = angle_label_pairs.find(p => p.label.toLowerCase() === label.toLowerCase());
  return pair ? pair.angle : null;
}

// Helper function to calculate bonus points based on distance
// Points range from 0 to 45 based on distance between tested angle and entered word's angle
function calculateBonusPoints(enteredAngle, testedAngle) {
  if (enteredAngle === null) {
    return 0; // Invalid response
  }
  
  const distance = angularDistance(enteredAngle, testedAngle);
  
  // Maximum points for correct answer (distance = 0)
  const maxPoints = 45;
  
  // Calculate raw points
  let points;
  if (distance === 0) {
    points = maxPoints;
  } else {
    // Decrease points based on distance
    // At 45 degrees (halfway between adjacent directions), give 0 points
    // Linear interpolation: points = maxPoints * (1 - distance / 45)
    points = Math.max(0, maxPoints * (1 - distance / 45));
  }
  
  // Convert to dollars using the scale
  const scale = EXPERIMENT_CONFIG.POINT_TO_BONUS_SCALE || 0.001;
  const bonusDollars = points * scale;
  console.log('Bonus calculation:', { points, scale, bonusDollars });
  return Math.round(bonusDollars * 100) / 100; // Round to 2 decimal places
}

// Helper function to show feedback
function showTestTrialFeedback(enteredAngle, testedAngle, bonusPoints) {
  // Found treasure if entered label is valid (on the list) AND within 45 degrees of tested angle (in either direction)
  // Missed if entered label is not on the list OR more than 45 degrees away (in either direction)
  const distance = enteredAngle !== null ? angularDistance(enteredAngle, testedAngle) : Infinity;
  const foundTreasure = enteredAngle !== null && distance <= 45;
  const imageSrc = foundTreasure ? 'stimuli/images/treasure.png' : 'stimuli/images/hole.png';
  
  const feedbackArea = document.getElementById('test-feedback-area');
  if (!feedbackArea) return;
  
  // Create feedback HTML
  const feedbackHTML = `
    <div style="
      text-align: center;
      padding: 20px;
    ">
      <img src="stimuli/images/elf.png" alt="Elf" style="width: 100px; height: auto; margin-bottom: 15px;" />
      <img src="${imageSrc}" alt="${foundTreasure ? 'Treasure' : 'Hole'}" style="width: 100px; height: auto; margin-bottom: 15px;" />
      <h3 style="margin: 15px 0; font-size: 24px; color: #333;">
        ${foundTreasure ? 'Treasure Found!' : 'Missed!'}
      </h3>
      <p style="font-size: 18px; color: #666; margin: 10px 0;">
        Bonus: <strong style="color: #2196F3; font-size: 20px;">$${(bonusPoints || 0).toFixed(2)}</strong>
      </p>
    </div>
  `;
  
  // Show feedback in the feedback area
  feedbackArea.innerHTML = feedbackHTML;
  feedbackArea.style.visibility = 'visible';
  feedbackArea.style.opacity = '1';
  feedbackArea.style.transition = 'opacity 0.3s';
  
  // Hide feedback after TEST_FEEDBACK_TIME
  setTimeout(function() {
    const area = document.getElementById('test-feedback-area');
    if (area) {
      area.style.transition = 'opacity 0.2s';
      area.style.opacity = '0';
      // Wait for the fade-out transition to complete (0.3s = 300ms)
      setTimeout(function() {
        const area2 = document.getElementById('test-feedback-area');
        if (area2) {
          area2.style.visibility = 'hidden';
          area2.innerHTML = '';
        }
      }, 300); // Wait for transition duration, not feedback time
    }
  }, EXPERIMENT_CONFIG.TEST_FEEDBACK_TIME * 1000);
}

// Store trial data for feedback
let lastTrialData = null;
// Store timeout timer reference
let testTrialTimeout = null;
// Store countdown interval reference
let testTrialCountdownInterval = null;
// Track if current trial timed out
let currentTrialTimedOut = false;

const test_trial = {
  type: jsPsychSurveyHtmlForm,
  html: function() {
    const angle = jsPsych.evaluateTimelineVariable('angle');
    const label = jsPsych.evaluateTimelineVariable('label');
    const compassHTML = createCompassHTML(angle);
    return `
      <div class="compass-container" style="display: flex; align-items: flex-start; justify-content: center; gap: 40px; max-width: 1000px; margin: 0 auto;">
        <div style="flex: 0 0 auto; width: 300px;">
          ${compassHTML}    
          <p class="compass-instruction">What is this direction called?</p>
          <div id="test-countdown" style="
            text-align: center;
            font-size: 16px;
            font-weight: normal;
            color: #666;
            margin: 10px 0;
            min-height: 25px;
          "></div>
          <input type="text" id="test-response" name="test-response" class="compass-input" autocomplete="off" autofocus />
        </div>
        <div style="flex: 0 0 300px; min-height: 300px;">
          <!-- Placeholder to keep compass in same position -->
        </div>
      </div>
    `;
  },
  autofocus: 'test-response',
  data: {
    trial_type: 'test'
  },
  on_load: function() {
    // Reset timeout flag for new trial
    currentTrialTimedOut = false;
    
    // Clear any existing timeout and countdown interval
    if (testTrialTimeout) {
      clearTimeout(testTrialTimeout);
      testTrialTimeout = null;
    }
    if (testTrialCountdownInterval) {
      clearInterval(testTrialCountdownInterval);
      testTrialCountdownInterval = null;
    }
    
    // Initialize countdown display
    const countdownElement = document.getElementById('test-countdown');
    const totalSeconds = EXPERIMENT_CONFIG.TEST_TIME;
    let remainingSeconds = totalSeconds;
    
    // Update countdown display immediately
    if (countdownElement) {
      countdownElement.textContent = `Time remaining: ${remainingSeconds}s`;
    }
    
    // Update countdown every second
    testTrialCountdownInterval = setInterval(function() {
      remainingSeconds--;
      if (countdownElement) {
        if (remainingSeconds > 0) {
          countdownElement.textContent = `Time remaining: ${remainingSeconds}s`;
        } else {
          countdownElement.textContent = 'Time\'s up!';
        }
      }
    }, 1000);
    
    // Start timer - convert TEST_TIME from seconds to milliseconds
    const timeoutMs = EXPERIMENT_CONFIG.TEST_TIME * 1000;
    testTrialTimeout = setTimeout(function() {
      // Clear countdown interval
      if (testTrialCountdownInterval) {
        clearInterval(testTrialCountdownInterval);
        testTrialCountdownInterval = null;
      }
      
      // Timeout expired - mark trial as timed out and finish it
      currentTrialTimedOut = true;
      const form = document.querySelector('#jspsych-survey-html-form');
      if (form) {
        // Clear the input field to ensure empty response
        const inputField = form.querySelector('#test-response');
        if (inputField) {
          inputField.value = '';
        }
        // Submit the form with empty response
        const submitButton = form.querySelector('input[type="submit"]');
        if (submitButton) {
          submitButton.click();
        } else {
          // Fallback: trigger form submission directly
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
    }, timeoutMs);
  },
  on_finish: function(data) {
    // Clear the timeout and countdown interval if they're still running (user submitted before timeout)
    if (testTrialTimeout) {
      clearTimeout(testTrialTimeout);
      testTrialTimeout = null;
    }
    if (testTrialCountdownInterval) {
      clearInterval(testTrialCountdownInterval);
      testTrialCountdownInterval = null;
    }
    
    // Check if this trial timed out
    const timedOut = currentTrialTimedOut;
    
    // Update trial counter
    updateTrialCounter();
    
    const label = jsPsych.evaluateTimelineVariable('label');
    const angle = jsPsych.evaluateTimelineVariable('angle');
    const trialId = jsPsych.evaluateTimelineVariable('trial_id');
    const nearestTrainedAngle = jsPsych.evaluateTimelineVariable('nearest_trained_angle');
    const nextNearestLabel = jsPsych.evaluateTimelineVariable('next_nearest_label');
    const nextNearestAngle = jsPsych.evaluateTimelineVariable('next_nearest_angle');
    const trialType = jsPsych.evaluateTimelineVariable('trial_type');
    const isCritical = jsPsych.evaluateTimelineVariable('is_critical');
    const targetFreq = jsPsych.evaluateTimelineVariable('targetFreq');
    
    // Safely get response with null checks
    const responseValue = (data.response && data.response['test-response']) || '';
    const response = responseValue.toLowerCase ? responseValue.toLowerCase().trim() : '';
    const labelLower = label ? label.toLowerCase() : '';
    const isCorrect = response === labelLower ? 1 : 0;
    
    // If timed out, set bonus points to 0 and empty response
    let enteredAngle = null;
    let bonusPoints = 0;
    let distanceToTreasure = null;
    
    if (timedOut) {
      // Timeout - no points
      bonusPoints = 0;
    } else {
      // Calculate bonus points based on distance between tested angle and entered word's angle
      enteredAngle = findAngleForLabel(response);
      bonusPoints = calculateBonusPoints(enteredAngle, angle);
      distanceToTreasure = enteredAngle !== null 
        ? angularDistance(enteredAngle, angle) 
        : null;
    }
    
    // Debug logging
    console.log('=== Test Trial Debug ===');
    console.log('Trial ID:', trialId);
    console.log('Timed out:', timedOut);
    console.log('Entered response:', response);
    console.log('Target label:', label);
    console.log('Tested angle (target):', angle);
    console.log('Entered angle:', enteredAngle !== null ? enteredAngle : 'NOT FOUND (invalid label)');
    console.log('Distance from target angle:', distanceToTreasure !== null ? distanceToTreasure + ' degrees' : 'N/A (invalid label)');
    console.log('Bonus points:', bonusPoints);
    console.log('Found treasure:', enteredAngle !== null && distanceToTreasure !== null && distanceToTreasure <= 45);
    console.log('=======================');
    
    // Update total points display
    updatePointsDisplay(bonusPoints);
    
    // Store trial data for feedback trial
    lastTrialData = {
      angle: angle,
      label: label,
      response: response,
      enteredAngle: enteredAngle,
      bonusPoints: bonusPoints,
      distanceToTreasure: distanceToTreasure,
      isCorrect: isCorrect,
      trialId: trialId,
      nearestTrainedAngle: nearestTrainedAngle,
      nextNearestLabel: nextNearestLabel,
      nextNearestAngle: nextNearestAngle,
      trialType: trialType,
      isCritical: isCritical,
      targetFreq: targetFreq,
      timedOut: timedOut
    };
    
    data.is_correct = isCorrect;
    data.response_text = response;
    data.target = label;
    data.angle = angle;
    data.trial_id = trialId;
    data.nearest_trained_angle = nearestTrainedAngle;
    data.next_nearest_label = nextNearestLabel;
    data.next_nearest_angle = nextNearestAngle;
    data.trial_type = trialType;
    data.is_critical = isCritical;
    data.targetFreq = targetFreq;
    data.bonus_points = bonusPoints;
    data.distance_to_treasure = distanceToTreasure;
    data.entered_angle = enteredAngle;
    data.total_points = totalPoints;
    data.timed_out = timedOut ? 1 : 0;
  }
}

// Feedback trial that shows compass and feedback
const test_feedback_trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function() {
    if (!lastTrialData) {
      return '<p>Loading feedback...</p>';
    }
    
    const compassHTML = createCompassHTML(lastTrialData.angle);
    const timedOut = lastTrialData.timedOut === true;
    
    // If timed out, show timeout message
    if (timedOut) {
      return `
        <div class="compass-container" style="display: flex; align-items: flex-start; justify-content: center; gap: 40px; max-width: 1000px; margin: 0 auto;">
          <div style="flex: 0 0 auto; width: 300px;">
            ${compassHTML}
            <p class="compass-instruction" style="visibility: hidden; margin: 20px 0;">What is this direction called?</p>
            <input type="text" style="visibility: hidden; font-size: 18px; padding: 10px; width: 200px; margin: 20px auto; display: block;" />
          </div>
          <div style="
            flex: 0 0 300px;
            text-align: center;
            padding: 20px;
          ">
            <img src="stimuli/images/elf.png" alt="Elf" style="width: 100px; height: auto; margin-bottom: 15px;" />
            <img src="stimuli/images/hole.png" alt="Hole" style="width: 100px; height: auto; margin-bottom: 15px;" />
            <h3 style="margin: 15px 0; font-size: 24px; color: #d32f2f;">
              Oops, you didn't answer in time!
            </h3>
            <p style="font-size: 18px; color: #666; margin: 10px 0;">
              Bonus: <strong style="color: #2196F3; font-size: 20px;">$${(lastTrialData.bonusPoints || 0).toFixed(2)}</strong>
            </p>
          </div>
        </div>
      `;
    }
    
    // Normal feedback (not timed out)
    const distance = lastTrialData.enteredAngle !== null 
      ? angularDistance(lastTrialData.enteredAngle, lastTrialData.angle) 
      : Infinity;
    const foundTreasure = lastTrialData.enteredAngle !== null && distance <= 45;
    const imageSrc = foundTreasure ? 'stimuli/images/treasure.png' : 'stimuli/images/hole.png';
    
    return `
      <div class="compass-container" style="display: flex; align-items: flex-start; justify-content: center; gap: 40px; max-width: 1000px; margin: 0 auto;">
        <div style="flex: 0 0 auto; width: 300px;">
          ${compassHTML}
          <p class="compass-instruction" style="visibility: hidden; margin: 20px 0;">What is this direction called?</p>
          <input type="text" style="visibility: hidden; font-size: 18px; padding: 10px; width: 200px; margin: 20px auto; display: block;" />
        </div>
        <div style="
          flex: 0 0 300px;
          text-align: center;
          padding: 20px;
        ">
          <img src="stimuli/images/elf.png" alt="Elf" style="width: 100px; height: auto; margin-bottom: 15px;" />
          <img src="${imageSrc}" alt="${foundTreasure ? 'Treasure' : 'Hole'}" style="width: 100px; height: auto; margin-bottom: 15px;" />
          <h3 style="margin: 15px 0; font-size: 24px; color: #333;">
            ${foundTreasure ? 'Treasure Found!' : 'Missed!'}
          </h3>
          <p style="font-size: 18px; color: #666; margin: 10px 0;">
            Bonus: <strong style="color: #2196F3; font-size: 20px;">$${(lastTrialData.bonusPoints || 0).toFixed(2)}</strong>
          </p>
        </div>
      </div>
    `;
  },
  choices: "NO_KEYS",
  trial_duration: 2000,
  data: {
    trial_type: 'test_feedback'
  }
}

// Break trial to show after every 40 test trials
const test_break_trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div class="instruction-text">
      <h2>Take a Break</h2>
      <p>Please take a break to rest your eyes and hands.</p>
      <p class="prompt-text">Press any key when you're ready to continue</p>
    </div>
  `,
  choices: 'ALL_KEYS',
  data: {
    trial_type: 'test_break'
  }
};

// Conditional break: only show after every N test trials (configured in EXPERIMENT_CONFIG.TEST_BREAK_INTERVAL)
const conditional_test_break = {
  timeline: [test_break_trial],
  conditional_function: function() {
    // Show break after every TEST_BREAK_INTERVAL trials (trial numbers 40, 80, 120, etc.)
    // currentTrialNumber is incremented in updateTrialCounter() after each trial
    // So we check if it's a multiple of TEST_BREAK_INTERVAL
    const breakInterval = EXPERIMENT_CONFIG.TEST_BREAK_INTERVAL || 40;
    const shouldShow = currentTrialNumber > 0 && currentTrialNumber % breakInterval === 0;
    return shouldShow;
  }
};

// Create a timeline with test trial, feedback trial, and conditional break
const test_trial_with_feedback_and_break = {
  timeline: [test_trial, test_feedback_trial, conditional_test_break]
}

const test_trials = {
  timeline: [test_trial_with_feedback_and_break],
  timeline_variables: selectedTestTrials,
  randomize_order: false
}

// ============================================
// Phase 7: Exit Survey
// ============================================

const survey_trial = {
  type: jsPsychSurveyHtmlForm,
  preamble: `
    <div class="instruction-text">
      <h2>Training Complete!</h2>
      <p>Thank you for completing the training. Please answer a few brief questions about your experience.</p>
    </div>
  `,
  html: `
    <div style="text-align: left; max-width: 600px; margin: 0 auto;">
      <p><label>How difficult did you find the training task? (1 = Very Easy, 7 = Very Difficult)</label><br/>
      <input type="number" name="difficulty" min="1" max="7" required /></p>
      
      <p><label>How confident are you in your ability to recall the direction names? (1 = Not at all confident, 7 = Very confident)</label><br/>
      <input type="number" name="confidence" min="1" max="7" required /></p>
      
      <p><label>What did you think this study was about?</label><br/>
      <textarea name="study_purpose" rows="4" cols="50" style="width: 100%;" required></textarea></p>
      
      <p><label>Did you have any strategies for learning the words?</label><br/>
      <textarea name="learning_strategies" rows="4" cols="50" style="width: 100%;" required></textarea></p>
      
      <p><label>Any additional comments or feedback?</label><br/>
      <textarea name="comments" rows="4" cols="50" style="width: 100%;"></textarea></p>
    </div>
  `,
  data: {
    trial_type: 'survey'
  },
  on_finish: function(data) {
    // Store survey responses
    data.survey_difficulty = data.response.difficulty;
    data.survey_confidence = data.response.confidence;
    data.survey_study_purpose = data.response.study_purpose || '';
    data.survey_learning_strategies = data.response.learning_strategies || '';
    data.survey_comments = data.response.comments || '';
  }
};

// ============================================
// Phase 8: Demographics Survey (Optional)
// ============================================

const demographics_trial = {
  type: jsPsychSurveyHtmlForm,
  preamble: `
    <div class="instruction-text">
      <h2>Demographics (Optional)</h2>
      <p>The following questions are optional. You may skip any question you prefer not to answer.</p>
    </div>
  `,
  html: `
    <div style="text-align: left; max-width: 600px; margin: 0 auto;">
      <p><label>What is your age?</label><br/>
      <input type="number" name="age" min="18" max="120" placeholder="Enter your age" style="width: 150px; padding: 8px; font-size: 16px;" /></p>
      
      <p><label>What is your gender?</label><br/>
      <input type="text" name="gender" placeholder="Enter your gender" style="width: 200px; padding: 8px; font-size: 16px;" /></p>
      
      <p style="margin-top: 10px; font-size: 14px; color: #666;">
        <em>Note: These questions are completely optional. Leave blank if you prefer not to answer.</em>
      </p>
    </div>
  `,
  data: {
    trial_type: 'demographics'
  },
  on_finish: function(data) {
    // Store demographics responses (may be empty strings if not answered)
    data.demographics_age = data.response.age || '';
    data.demographics_gender = data.response.gender || '';
  }
};

// ============================================
// Data Saving & Final Trial
// ============================================

const save_data_end = EXPERIMENT_CONFIG.DATAPIPE_EXPERIMENT_ID ? {
  type: jsPsychPipe,
  action: "save",
  experiment_id: EXPERIMENT_CONFIG.DATAPIPE_EXPERIMENT_ID,
  filename: filename,
  data_string: () => jsPsych.data.get().csv()
} : null;

const final_trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p>You've finished the last task. Thanks for participating!</p>
      <p><a href="https://app.prolific.co/submissions/complete?cc=${EXPERIMENT_CONFIG.PROLIFIC_COMPLETION_CODE}">Click here to return to Prolific and complete the study</a>.</p>`,
    choices: "NO_KEYS"
  };

// ============================================
// Build Timeline
// ============================================

const timeline = [
  consent_trial,
  introduction_trial,
  compliance_checkboxes_trial,
  exposure_instructions_trial,
  exposure_trials,
  familiarization_instructions_trial,
  familiarization_trials_outer_loop,
  test_instructions_trial,
  test_trials,
  survey_trial,
  demographics_trial
];

if (save_data_end) {
  timeline.push(save_data_end);
}

timeline.push(final_trial);

  // Start the experiment
  jsPsych.run(timeline);
}

// Initialize and start the experiment
initializeExperiment();