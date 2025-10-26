// Get references to all the new HTML elements
const realButton = document.getElementById('btn-real');
const deepfakeButton = document.getElementById('btn-deepfake');
const statusDiv = document.getElementById('status');
const imagePreviewDiv = document.getElementById('image-preview');
const emptyStateDiv = document.getElementById('empty-state');

let selectedImageUrl = null;
let selectedImageHash = null; // Variable to store the hash

// Function to update the UI when an image is selected
function updateUIForImage(imageUrl, imageHash) { 
    if (!imageUrl || !imageHash) return;

    selectedImageUrl = imageUrl;
    selectedImageHash = imageHash; // stores the passed-in hash

    // Show the selected image as the background of the preview div
    imagePreviewDiv.style.backgroundImage = `url('${imageUrl}')`;
    // Hide the "No image selected" message
    emptyStateDiv.style.display = 'none';

    // Enable the voting buttons
    realButton.disabled = false;
    deepfakeButton.disabled = false;

    // Update the status message
    statusDiv.textContent = 'Ready to tag this image.';
}

// A function to reset the popup to its initial state
function resetUI() {
    selectedImageUrl = null;
    selectedImageHash = null;
    imagePreviewDiv.style.backgroundImage = 'none';
    emptyStateDiv.style.display = 'flex';
    realButton.disabled = true;
    deepfakeButton.disabled = true;
    statusDiv.textContent = 'Waiting for image...';
    // Clear both values from storage
    chrome.storage.local.remove(['selectedImageUrl', 'selectedImageHash']);
}

// When the popup opens, immediately try to get the last selected image from storage.
document.addEventListener('DOMContentLoaded', () => {
    // Get both the URL and the hash
    chrome.storage.local.get(['selectedImageUrl', 'selectedImageHash'], (result) => {
        if (result.selectedImageUrl && result.selectedImageHash) {
            updateUIForImage(result.selectedImageUrl, result.selectedImageHash);
        }
    });
});

// This function sends the vote to your backend server.
async function sendVoteToBackend(vote) {
    if (!selectedImageHash) return;

        console.log("Sending this pHash to backend:", selectedImageHash);

    // Disable buttons immediately to prevent double-clicking
    realButton.disabled = true;
    deepfakeButton.disabled = true;
    
    try {
            const response = await fetch('https://caid-backend.onrender.com/api/tag',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageHash: selectedImageHash,
                vote: vote
            }),
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Success:', result);
            statusDiv.textContent = `Successfully tagged as ${vote === 'real' ? 'Real' : 'Synthetic'}!`;
        } else {
            throw new Error(result.message || 'Unknown error from server');
        }

    } catch (error) {
        console.error('Error:', error);
        statusDiv.textContent = 'Error: Could not submit vote.';
    } finally {
        // Reset the UI after the vote is sent (whether it succeeded or failed)
        setTimeout(resetUI, 1500);
    }
}

// Button listeners are clean and simple.
realButton.addEventListener('click', () => {
    sendVoteToBackend('real');
});

deepfakeButton.addEventListener('click', () => {
    sendVoteToBackend('synthetic');
});