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

// ============================================
// Phase 1: Consent Page
// ============================================

const consent_trial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div class="consent-text">
       <p>
            Please read this consent agreement carefully before deciding whether to
            participate in this experiment. 
          </p><br/>
          <p>
            <strong>Description:</strong> You are invited to participate in a research study about language and communication. The purpose of the research is to understand how you interact and communicate with other people in naturalistic settings as a fluent English speaker. This research will be conducted through the Prolific platform, including participants from the US, UK, and Canada. If you decide to participate in this research, you will learn and use new words. 
          </p> <br/>
          <p>
            <strong>Time Involvement:</strong> The task will last the amount of time advertised on Prolific. You are free to withdraw from the study at any time. 
          </p><br/>
          <p>
            <strong>Risks and Benefits:</strong> You may become frustrated if your partner gets distracted, or experience discomfort if other partici-pants in your group send text that is inappropriate for the task. We ask you to please be respectful of other participants you might be interacting with to mitigate these risks. You may also experience dis-comfort when being asked to discuss or challenge emotionally salient political beliefs. Study data will be stored securely, in compliance with Stanford University standards, minimizing the risk of confiden-tiality breach. This study advances our scientific understanding of how people communication and collaborate in naturalistic settings. This study may lead to further insights about what can go wrong in teamwork, suggest potential interventions to overcome these barriers, and help to develop assistive technologies that collaborate with human partners. We cannot and do not guarantee or promise that you will receive any benefits from this study. 
          </p><br/>
          <p>
            <strong>Compensation:</strong> You will receive payment in the amount advertised on Prolific. If you do not complete this study, you will receive prorated payment based on the time that you have spent. Additionally, you may be eligible for bonus payments as described in the instructions. 
          </p><br/>
          <p>
            <strong>Participant's Rights:</strong> If you have read this form and have decided to participate in this project, please understand your participation is voluntary and you have the right to withdraw your consent or discontinue participation at any time without penalty or loss of benefits to which you are otherwise entitled. The alternative is not to participate. You have the right to refuse to answer particular questions. The results of this research study may be presented at scientific or professional meetings or published in scientific journals. Your individual privacy will be maintained in all published and writ-ten data resulting from the study. In accordance with scientific norms, the data from this study may be used or shared with other researchers for future research (after removing personally identifying information) without additional consent from you. 
          </p><br/>
          <p>
            <strong>Contact Information:</strong> If you have any questions, concerns or complaints about this research, its procedures, risks and benefits, contact the Protocol Director, Robert Hawkins (<a href="mailto:rdhawkins@stanford.edu">rdhawkins@stanford.edu</a>, 217-549-6923).
          </p><br/>
          <p>
            <strong>Independant Contact:</strong> If you are not satisfied with how this study is being conducted, or if you have any concerns, com-plaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at 650-723-2480 or toll free at 1-866-680-2906, or email at irbnonmed@stanford.edu. You can also write to the Stanford IRB, Stanford University, 1705 El Camino Real, Palo Alto, CA 94306. Please save or print a copy of this page for your records. 
          </p><br/>
          <p>
            <strong>If you agree to participate in this research, please click "I agree"</strong>
          </p><br/>
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
        <p class="prompt-text">Press any key to continue</p>
      </div>
    `,
    choices: 'ALL_KEYS',
    data: {
      trial_type: 'introduction'
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
        <p>The Elves use 8 principal directions to navigate. You will use those directions to help them find the treasure. You're about to see the names for each direction, and practice giving directions by typing in the name of the direction.</p>
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
              </div>
            `;
        },
        data: {
            trial_type: 'exposure'
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
  attempted_trials: new Set(),
  block_iteration: 0,
  trial_number: 0
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
      const target = jsPsych.evaluateTimelineVariable('target');
      const angle = jsPsych.evaluateTimelineVariable('angle');
      const leftLabel = jsPsych.evaluateTimelineVariable('leftLabel');
      const rightLabel = jsPsych.evaluateTimelineVariable('rightLabel');
      const response = data.response['familiarization-response'].toLowerCase().trim();
      const isCorrect = response === target.toLowerCase();
      
      const trialId = `${angle}_${target}_${leftLabel}_${rightLabel}`;
      const isFirstAttempt = !familiarization_state.attempted_trials.has(trialId);
      
      if (isFirstAttempt) {
        familiarization_state.attempted_trials.add(trialId);
        familiarization_state.trial_number++;
        if (!isCorrect) {
          familiarization_state.first_attempt_errors++;
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
      data.is_first_attempt = isFirstAttempt ? 1 : 0;
      data.first_attempt_errors_count = familiarization_state.first_attempt_errors;
      data.familiarization_block_iteration = familiarization_state.block_iteration;
      data.familiarization_trial_number = familiarization_state.trial_number;
    }
  }],
  loop_function: function(data) {
    const values = data.values();
    return values.length > 0 && values[values.length - 1].is_correct === 0;
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
    familiarization_state.first_attempt_errors = 0;
    familiarization_state.attempted_trials.clear();
    familiarization_state.trial_number = 0;
  }
};

const familiarization_trials = {
  timeline: [familiarization_reset_trial, familiarization_trials_inner],
  on_timeline_start: function() {
    familiarization_state.block_iteration++;
  },
  loop_function: function(data) {
    const totalTrials = selectedTrainingTrials.length;
    const firstAttemptErrors = familiarization_state.first_attempt_errors;
    const errorRate = firstAttemptErrors / totalTrials;
    const correctRate = 1 - errorRate;
    const shouldLoop = correctRate < EXPERIMENT_CONFIG.TRAINING_THRESHOLD;
    
    console.log(`Familiarization block iteration ${familiarization_state.block_iteration} completed: ${firstAttemptErrors}/${totalTrials} first-attempt errors (${(errorRate * 100).toFixed(1)}% error rate, ${(correctRate * 100).toFixed(1)}% correct rate). Looping: ${shouldLoop}`);
    
    // Store block completion data
    const values = data.values();
    if (values.length > 0) {
      const lastTrial = values[values.length - 1];
      lastTrial.block_first_attempt_errors = firstAttemptErrors;
      lastTrial.block_total_trials = totalTrials;
      lastTrial.block_error_rate = errorRate;
      lastTrial.block_correct_rate = correctRate;
      lastTrial.block_will_loop = shouldLoop ? 1 : 0;
    }
    
    return shouldLoop;
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

const familiarization_trials_outer_loop = {
  timeline: [familiarization_trials, 
    recall_instructions_trial, 
    recall_trials],
  on_timeline_start: function() {
    recall_state.outer_loop_iteration++;
    recall_state.current_iteration_trials = [];
    console.log(`Starting outer loop iteration ${recall_state.outer_loop_iteration}`);
  },
  loop_function: function(data) {
    const expectedTrialCount = angle_label_pairs.length;
    const recallTrials = recall_state.current_iteration_trials;
    
    const totalRecallTrials = recallTrials.length;
    const correctRecallTrials = recallTrials.filter(trial => trial.is_correct === 1).length;
    const requiredCorrect = EXPERIMENT_CONFIG.RECALL_THRESHOLD;
    const thresholdMet = correctRecallTrials >= requiredCorrect && totalRecallTrials === expectedTrialCount;
    const shouldLoop = !thresholdMet;
    
    console.log(`Outer loop iteration ${recall_state.outer_loop_iteration} completed: ${correctRecallTrials}/${totalRecallTrials} recall trials correct (required: ${requiredCorrect}). Threshold met: ${thresholdMet}. Looping: ${shouldLoop}`);
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
  }
}

// Randomly select one of the test trial blocks
const selectedTestBlockIndex = Math.floor(Math.random() * test_trials_data.length);
const selectedTestBlock = test_trials_data[selectedTestBlockIndex];
const selectedTestTrials = selectedTestBlock.trials;

jsPsych.data.addProperties({
  selected_test_block_id: selectedTestBlock.block_id
});

const test_trial = {
  type: jsPsychSurveyHtmlForm,
  html: function() {
    const angle = jsPsych.evaluateTimelineVariable('angle');
    const label = jsPsych.evaluateTimelineVariable('label');
    const compassHTML = createCompassHTML(angle);
    return `
      <div class="compass-container">
        ${compassHTML}    
        <p class="compass-instruction">What is this direction called?</p>
        <input type="text" id="test-response" name="test-response" class="compass-input" autocomplete="off" autofocus />
      </div>
    `;
  },
  autofocus: 'test-response',
  data: {
    trial_type: 'test'
  },
  on_finish: function(data) {
    const label = jsPsych.evaluateTimelineVariable('label');
    const angle = jsPsych.evaluateTimelineVariable('angle');
    const trialId = jsPsych.evaluateTimelineVariable('trial_id');
    const nearestTrainedAngle = jsPsych.evaluateTimelineVariable('nearest_trained_angle');
    const nextNearestLabel = jsPsych.evaluateTimelineVariable('next_nearest_label');
    const nextNearestAngle = jsPsych.evaluateTimelineVariable('next_nearest_angle');
    const trialType = jsPsych.evaluateTimelineVariable('trial_type');
    const isCritical = jsPsych.evaluateTimelineVariable('is_critical');
    const targetFreq = jsPsych.evaluateTimelineVariable('targetFreq');
    const response = data.response['test-response'].toLowerCase().trim();
    const isCorrect = response === label.toLowerCase() ? 1 : 0;
    
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
  }
}

const test_trials = {
  timeline: [test_trial],
  timeline_variables: selectedTestTrials,
  randomize_order: false
}

// ============================================
// Data Saving & Final Trial
// ============================================

const save_data = EXPERIMENT_CONFIG.DATAPIPE_EXPERIMENT_ID ? {
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
  //exposure_instructions_trial,
  //exposure_trials,
  //familiarization_instructions_trial,
  //familiarization_trials_outer_loop,
  test_instructions_trial,
  test_trials
];

if (save_data) {
  timeline.push(save_data);
}

timeline.push(final_trial);

// Start the experiment
jsPsych.run(timeline);