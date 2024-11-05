// Load the audio file for cue sounds
const audioCue = new Audio('cue.mp3');

function playAudioCue() {
  audioCue.currentTime = 0; // Reset audio to start in case it's already playing
  audioCue.play();
}

const warmupExercises = [
  { name: 'March in Place', duration: 60 },
  { name: 'Arm Circles Forward', duration: 30 },
  { name: 'Arm Circles Backward', duration: 30 },
  { name: 'Side Steps', duration: 60 },
  { name: 'Butt Kicks', duration: 60 },
  { name: 'Knee Raises', duration: 60 }
];

const mainWorkoutExercises = [
  { name: 'Jumping Jacks', duration: 60 },
  { name: 'Bodyweight Squats', duration: 60 },
  { name: 'Mountain Climbers', duration: 30 },
  { name: 'Step Touch with Punches', duration: 60 },
  { name: 'High Knees', duration: 30 }
];

const coolDownExercises = [
  { name: 'Walking in Place', duration: 60 },
  { name: 'Standing Hamstring Stretch (Right)', duration: 30 },
  { name: 'Standing Hamstring Stretch (Left)', duration: 30 },
  { name: 'Quad Stretch (Right)', duration: 30 },
  { name: 'Quad Stretch (Left)', duration: 30 },
  { name: 'Calf Stretch (Right)', duration: 30 },
  { name: 'Calf Stretch (Left)', duration: 30 },
  { name: 'Deep Breaths', duration: 60 }
];

let workoutPhase = 'warmup';
let currentExerciseIndex = 0;
let circuit = 2;
let isPaused = true;
let isRest = false;
let timer;
let countdown;
let totalCountdown;

const playPauseButton = document.getElementById('play-pause');
const resetButton = document.getElementById('reset');
const skipButton = document.getElementById('skip');
const exerciseTimerDisplay = document.getElementById('exercise-timer');
const totalTimerDisplay = document.getElementById('total-timer');
const exerciseDisplay = document.getElementById('current-exercise');
const nextExerciseDisplay = document.getElementById('next-exercise');
const phaseHeader = document.getElementById('phase-header');
const circuitsInput = document.getElementById('circuits');
const restInput = document.getElementById('rest-time');

playPauseButton.addEventListener('click', togglePlayPause);
resetButton.addEventListener('click', resetWorkout);
skipButton.addEventListener('click', skipExercise);

function togglePlayPause() {
  if (isPaused) {
    isPaused = false;
    playPauseButton.innerText = 'Pause';
    startWorkout();
  } else {
    isPaused = true;
    playPauseButton.innerText = 'Play';
    clearInterval(timer);
  }
}

function startWorkout() {
  if (isPaused) return;
  if (workoutPhase === 'warmup' && currentExerciseIndex === 0 && circuit === 1) {
    totalCountdown = calculateTotalTime();
    updateTotalTimerDisplay();
  }
  startPhase();
}

function resetWorkout() {
  clearInterval(timer);
  isPaused = true;
  playPauseButton.innerText = 'Play';
  workoutPhase = 'warmup';
  currentExerciseIndex = 0;
  circuit = 1;
  totalCountdown = calculateTotalTime();
  exerciseDisplay.innerText = 'Get Ready!';
  nextExerciseDisplay.innerText = 'Next: -';
  exerciseTimerDisplay.innerText = 'Exercise Time: 0:00';
  totalTimerDisplay.innerText = 'Total Time Left: 0:00';
  updatePhaseHeader();
}

function calculateTotalTime() {
  const restTime = parseInt(restInput.value);
  let totalTime = warmupExercises.reduce((acc, ex) => acc + ex.duration, 0);
  totalTime += mainWorkoutExercises.reduce((acc, ex) => acc + ex.duration + restTime, 0) * parseInt(circuitsInput.value);
  totalTime += coolDownExercises.reduce((acc, ex) => acc + ex.duration, 0);
  return totalTime; // Removed 1-minute rest
}

function startPhase() {
  updatePhaseHeader();
  if (workoutPhase === 'warmup') {
    setExercise(warmupExercises[currentExerciseIndex]);
  } else if (workoutPhase === 'main') {
    setExercise(mainWorkoutExercises[currentExerciseIndex]);
  } else if (workoutPhase === 'cooldown') {
    setExercise(coolDownExercises[currentExerciseIndex]);
  }
}

function setExercise(exercise) {
  playAudioCue(); // Play audio cue at the start of each exercise
  exerciseDisplay.innerText = exercise.name;
  startTimer(exercise.duration);
  updateNextExercise();
}

function startTimer(duration) {
  countdown = duration;
  updateExerciseTimerDisplay();
  timer = setInterval(() => {
    if (!isPaused) {
      countdown--;
      totalCountdown--;
      updateExerciseTimerDisplay();
      updateTotalTimerDisplay();
      if (countdown <= 0) {
        clearInterval(timer);
        moveToNextExercise();
      }
    }
  }, 1000);
}

function moveToNextExercise() {
  if (workoutPhase === 'main' && !isRest) {
    setExercise({ name: 'Rest', duration: parseInt(restInput.value) });
    isRest = true;
  } else {
    isRest = false;
    currentExerciseIndex++;
    
    if (workoutPhase === 'warmup' && currentExerciseIndex >= warmupExercises.length) {
      workoutPhase = 'main';
      currentExerciseIndex = 0;
    } else if (workoutPhase === 'main' && currentExerciseIndex >= mainWorkoutExercises.length) {
      if (circuit < parseInt(circuitsInput.value)) {
        circuit++;
        currentExerciseIndex = 0;
        setExercise({ name: 'Rest Break', duration: 60 });
      } else {
        workoutPhase = 'cooldown';
        currentExerciseIndex = 0;
        startPhase();
      }
    } else if (workoutPhase === 'cooldown' && currentExerciseIndex >= coolDownExercises.length) {
      exerciseDisplay.innerText = 'Workout Complete!';
      exerciseTimerDisplay.innerText = '';
      nextExerciseDisplay.innerText = '';
      totalTimerDisplay.innerText = '';
    } else {
      startPhase();
    }
  }
}

function updatePhaseHeader() {
  phaseHeader.innerText = workoutPhase === 'warmup' ? 'Warm-Up' : workoutPhase === 'main' ? 'Main Workout' : 'Cool Down';
}

function updateExerciseTimerDisplay() {
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  exerciseTimerDisplay.innerText = `Exercise Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updateTotalTimerDisplay() {
  const minutes = Math.floor(totalCountdown / 60);
  const seconds = totalCountdown % 60;
  totalTimerDisplay.innerText = `Total Time Left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updateNextExercise() {
  let nextExercise;
  if (workoutPhase === 'warmup' && currentExerciseIndex + 1 < warmupExercises.length) {
    nextExercise = warmupExercises[currentExerciseIndex + 1];
  } else if (workoutPhase === 'main' && currentExerciseIndex + 1 < mainWorkoutExercises.length) {
    nextExercise = mainWorkoutExercises[currentExerciseIndex + 1];
  } else if (workoutPhase === 'cooldown' && currentExerciseIndex + 1 < coolDownExercises.length) {
    nextExercise = coolDownExercises[currentExerciseIndex + 1];
  }
  nextExerciseDisplay.innerText = nextExercise ? `Next: ${nextExercise.name}` : 'Next: -';
}

function skipExercise() {
  clearInterval(timer);
  // Subtract the remaining time from the total countdown
  totalCountdown -= countdown; // Subtract the time left on the skipped exercise
  moveToNextExercise();
  updateTotalTimerDisplay(); // Update total time left when skipping
}
