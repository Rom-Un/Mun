// MUN Speaking Time Handler

// DOM Elements
const secondsInput = document.getElementById('seconds');
const applyTimeBtn = document.getElementById('apply-time');
const countryNameInput = document.getElementById('country-name');
const addSpeakerBtn = document.getElementById('add-speaker');
const currentSpeakerEl = document.getElementById('current-speaker');
const timerEl = document.getElementById('timer');
const toggleTimerBtn = document.getElementById('toggle-timer');
const resetTimerBtn = document.getElementById('reset-timer');
const nextSpeakerBtn = document.getElementById('next-speaker');
const queueListEl = document.getElementById('queue-list');
const emptyQueueMessage = document.getElementById('empty-queue-message');

// App State
let speakerQueue = [];
let currentSpeaker = null;
let defaultTime = { minutes: 0, seconds: 120 }; // Default time: 120 seconds
let remainingTime = 0; // in seconds
let timerInterval = null;
let isTimerRunning = false;

// Initialize the app
function init() {
  console.log('Initializing MUN Speaking Time Handler...');
  
  // Check if all DOM elements are found
  if (!secondsInput) console.error('Seconds input not found');
  if (!applyTimeBtn) console.error('Apply time button not found');
  if (!countryNameInput) console.error('Country name input not found');
  if (!addSpeakerBtn) console.error('Add speaker button not found');
  if (!currentSpeakerEl) console.error('Current speaker element not found');
  if (!timerEl) console.error('Timer element not found');
  if (!toggleTimerBtn) console.error('Toggle timer button not found');
  if (!resetTimerBtn) console.error('Reset timer button not found');
  if (!nextSpeakerBtn) console.error('Next speaker button not found');
  if (!queueListEl) console.error('Queue list element not found');
  if (!emptyQueueMessage) console.error('Empty queue message not found');
  
  // Set default time
  secondsInput.value = defaultTime.seconds;
  
  // Update timer display
  updateTimerDisplay();
  
  // Add event listeners
  applyTimeBtn.addEventListener('click', applyTimeSettings);
  addSpeakerBtn.addEventListener('click', addSpeakerToQueue);
  toggleTimerBtn.addEventListener('click', toggleTimer);
  resetTimerBtn.addEventListener('click', resetTimer);
  nextSpeakerBtn.addEventListener('click', moveToNextSpeaker);
  
  // Disable timer controls initially
  toggleTimerControls(false);
}

// Apply time settings
function applyTimeSettings() {
  const seconds = parseInt(secondsInput.value) || 0;
  
  if (seconds === 0) {
    alert('Please set a valid time (at least 1 second).');
    return;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  defaultTime = { minutes, seconds: remainingSeconds };
  
  // If there's a current speaker, update their time
  if (currentSpeaker) {
    remainingTime = seconds;
    updateTimerDisplay();
  }
  
  // Show confirmation
  alert(`Time set to ${seconds} seconds (${minutes} minute(s) and ${remainingSeconds} second(s)).`);
}

// Add a speaker to the queue
function addSpeakerToQueue() {
  const countryName = countryNameInput.value.trim();
  
  if (!countryName) {
    alert('Please enter a country or delegate name.');
    return;
  }
  
  // Get the current time setting from the input
  const seconds = parseInt(secondsInput.value) || 120;
  
  // Create new speaker object
  const speaker = {
    id: Date.now(), // Unique ID using timestamp
    name: countryName,
    timeAllotted: seconds // in seconds
  };
  
  // Add to queue
  speakerQueue.push(speaker);
  
  // Clear input
  countryNameInput.value = '';
  
  // Update UI
  renderSpeakerQueue();
  
  // If no current speaker, move to the first one in queue
  if (!currentSpeaker && speakerQueue.length === 1) {
    moveToNextSpeaker();
  }
}

// Render the speaker queue
function renderSpeakerQueue() {
  // Show/hide empty queue message
  emptyQueueMessage.style.display = speakerQueue.length ? 'none' : 'block';
  
  // Clear current queue display
  const queueItems = queueListEl.querySelectorAll('.queue-item');
  queueItems.forEach(item => item.remove());
  
  // Render each speaker in queue
  speakerQueue.forEach((speaker, index) => {
    const queueItem = document.createElement('div');
    queueItem.classList.add('queue-item');
    
    // Convert seconds to minutes and seconds for display
    const minutes = Math.floor(speaker.timeAllotted / 60);
    const seconds = speaker.timeAllotted % 60;
    
    queueItem.innerHTML = `
      <div class="speaker-info">
        <strong>${index + 1}. ${speaker.name}</strong>
        <span class="time-allotted">(${minutes}:${seconds.toString().padStart(2, '0')})</span>
      </div>
      <div class="queue-controls">
        <button class="btn danger remove-btn" data-id="${speaker.id}">
          <i class="fas fa-times"></i> Remove
        </button>
      </div>
    `;
    
    // Add to queue list
    queueListEl.appendChild(queueItem);
    
    // Add event listener for remove button
    const removeBtn = queueItem.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => removeSpeaker(speaker.id));
  });
}

// Remove a speaker from the queue
function removeSpeaker(speakerId) {
  speakerQueue = speakerQueue.filter(speaker => speaker.id !== speakerId);
  renderSpeakerQueue();
}

// Move to the next speaker in queue
function moveToNextSpeaker() {
  // Stop current timer if running
  if (isTimerRunning) {
    isTimerRunning = false;
    clearInterval(timerInterval);
  }
  
  // Get next speaker from queue
  const nextSpeaker = speakerQueue.shift();
  
  if (nextSpeaker) {
    currentSpeaker = nextSpeaker;
    currentSpeakerEl.textContent = nextSpeaker.name;
    remainingTime = nextSpeaker.timeAllotted;
    updateTimerDisplay();
    toggleTimerControls(true);
    renderSpeakerQueue();
  } else {
    // No more speakers in queue
    currentSpeaker = null;
    currentSpeakerEl.textContent = 'No speaker';
    remainingTime = 0;
    updateTimerDisplay();
    toggleTimerControls(false);
  }
}

// Toggle timer (start/pause)
function toggleTimer() {
  if (!currentSpeaker) return;
  
  if (isTimerRunning) {
    // Pause the timer
    isTimerRunning = false;
    clearInterval(timerInterval);
    
    // Update button appearance
    toggleTimerBtn.classList.remove('warning');
    toggleTimerBtn.classList.add('success');
    toggleTimerBtn.innerHTML = '<i class="fas fa-play"></i> Start';
  } else {
    // Start the timer
    isTimerRunning = true;
    
    // Update button appearance
    toggleTimerBtn.classList.remove('success');
    toggleTimerBtn.classList.add('warning');
    toggleTimerBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    
    // Clear any existing interval
    if (timerInterval) clearInterval(timerInterval);
    
    // Start a new interval
    timerInterval = setInterval(() => {
      if (remainingTime > 0) {
        remainingTime--;
        updateTimerDisplay();
        
        // Visual alerts based on remaining time
        if (remainingTime <= 30 && remainingTime > 10) {
          timerEl.classList.add('timer-warning');
          timerEl.classList.remove('timer-danger');
        } else if (remainingTime <= 10) {
          timerEl.classList.remove('timer-warning');
          timerEl.classList.add('timer-danger');
        }
      } else {
        // Time's up
        clearInterval(timerInterval);
        isTimerRunning = false;
        
        // Reset button appearance
        toggleTimerBtn.classList.remove('warning');
        toggleTimerBtn.classList.add('success');
        toggleTimerBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        
        // Play alert sound (optional)
        playAlertSound();
        
        // Show time's up alert
        alert(`Time's up for ${currentSpeaker.name}!`);
      }
    }, 1000);
  }
}

// Reset the timer
function resetTimer() {
  if (!currentSpeaker) return;
  
  // Stop timer if running
  if (isTimerRunning) {
    // Stop the timer
    isTimerRunning = false;
    clearInterval(timerInterval);
    
    // Reset button appearance
    toggleTimerBtn.classList.remove('warning');
    toggleTimerBtn.classList.add('success');
    toggleTimerBtn.innerHTML = '<i class="fas fa-play"></i> Start';
  }
  
  // Reset time to current input value
  const seconds = parseInt(secondsInput.value) || 120;
  remainingTime = seconds;
  updateTimerDisplay();
  
  // Remove alert classes
  timerEl.classList.remove('timer-warning', 'timer-danger');
}

// Update timer display
function updateTimerDisplay() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  
  timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Toggle timer controls
function toggleTimerControls(enabled) {
  toggleTimerBtn.disabled = !enabled;
  resetTimerBtn.disabled = !enabled;
  nextSpeakerBtn.disabled = !enabled;
  
  // Reset button appearance
  if (enabled) {
    toggleTimerBtn.classList.remove('warning');
    toggleTimerBtn.classList.add('success');
    toggleTimerBtn.innerHTML = '<i class="fas fa-play"></i> Start';
  }
}

// Play alert sound (optional)
function playAlertSound() {
  // Create an audio element
  const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
  audio.play().catch(error => {
    // Handle autoplay restrictions
    console.log('Audio playback failed:', error);
  });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);