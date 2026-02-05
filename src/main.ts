import { generatePassword } from './generatePassword';
import '../style.css'; // Ensure styles are loaded by Vite
import { getOfflineMode, setOfflineMode } from './serviceworker/idb';

// #region DOM Elements
const passwordOutput = document.getElementById('password-output') as HTMLSpanElement;
const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
const lengthSlider = document.getElementById('length-slider') as HTMLInputElement;
const lengthValue = document.getElementById('length-value') as HTMLSpanElement;
const settingsBtn = document.getElementById('settings-btn') as HTMLButtonElement;
const settingsDialog = document.getElementById('settings-dialog') as HTMLDialogElement;
const closeSettingsBtn = document.getElementById('close-settings-btn') as HTMLButtonElement;
const autoCopyCheck = document.getElementById('auto-copy-check') as HTMLInputElement;
const offlineModeCheck = document.getElementById('offline-mode-check') as HTMLInputElement;
// #endregion

// #region State & Constants
const STORAGE_KEY_AUTO_COPY = 'pgen_auto_copy';
const STORAGE_KEY_LENGTH = 'pgen_length';

let state = {
  length: 12,
  autoCopy: false,
};
// #endregion

// #region Initialization
function init() {
  // Auto-copy
  const storedAutoCopy = localStorage.getItem(STORAGE_KEY_AUTO_COPY);
  if (storedAutoCopy !== null) {
    state.autoCopy = storedAutoCopy === 'true';
    autoCopyCheck.checked = state.autoCopy;
  }

  // Length
  const storedLength = localStorage.getItem(STORAGE_KEY_LENGTH);
  if (storedLength !== null) {
    const parsedLength = parseInt(storedLength, 10);
    if (!isNaN(parsedLength)) {
      state.length = parsedLength;
      lengthSlider.value = parsedLength.toString();
      lengthValue.textContent = parsedLength.toString();
    }
  }
  // TODO: skip error checking; values will never be null. 
  // const parsedLength = parseInt(storedLength!, 10);
  // state.length = parsedLength;
  // lengthSlider.value = parsedLength.toString();
  // lengthValue.textContent = parsedLength.toString();


  // Offline Mode
  getOfflineMode().then(isOffline => {
    offlineModeCheck.checked = isOffline;
  });

  registerSW();
  setupEventListeners();
  generate();
}
// #endregion

// #region Core Logic
function generate() {
  try {
    const pwd = generatePassword(state.length);
    passwordOutput.textContent = pwd;

    if (state.autoCopy) {
      copyToClipboard(pwd);
    }
  } catch (error) {
    console.error("Generation failed:", error);
    passwordOutput.textContent = "Error";
  }
}

async function copyToClipboard(text: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    // Visual feedback could go here (e.g., toast or icon change)
    const originalIcon = copyBtn.innerHTML;
    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    setTimeout(() => {
      copyBtn.innerHTML = originalIcon;
    }, 1000);
  } catch (err) {
    console.error('Failed to copy!', err);
  }
}
// #endregion

// #region Event Handlers
function setupEventListeners() {
  // Generate Button
  generateBtn.addEventListener('click', () => generate());

  // Slider
  lengthSlider.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    state.length = val;
    lengthValue.textContent = val.toString();
    localStorage.setItem(STORAGE_KEY_LENGTH, val.toString());
  });

  // Copy Button
  copyBtn.addEventListener('click', () => {
    copyToClipboard(passwordOutput.textContent || '');
  });

  // Settings
  settingsBtn.addEventListener('click', () => {
    settingsDialog.showModal();
  });

  closeSettingsBtn.addEventListener('click', () => {
    settingsDialog.close();
  });

  autoCopyCheck.addEventListener('change', (e) => {
    state.autoCopy = (e.target as HTMLInputElement).checked;
    state.autoCopy = (e.target as HTMLInputElement).checked;
    localStorage.setItem(STORAGE_KEY_AUTO_COPY, state.autoCopy.toString());
  });

  offlineModeCheck.addEventListener('change', (e) => {
    setOfflineMode((e.target as HTMLInputElement).checked);
  });

  // Global Shortcuts
  document.addEventListener('keydown', (e) => {
    // Alt + g
    if (e.altKey && e.key.toLowerCase() === 'g') {
      e.preventDefault();
      generate();
    }
    // Alt + c
    if (e.altKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      copyToClipboard(passwordOutput.textContent || '');
    }
  });
}

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { type: 'module' })
      .then(() => console.log('SW Registered'))
      .catch(e => console.error('SW Registration Failed', e));
  }
}
// #endregion

init();
