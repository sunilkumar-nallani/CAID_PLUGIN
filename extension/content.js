// This script runs on the webpage itself.

const style = document.createElement('style');
style.innerHTML = ` 
  .deepfake-plugin-highlight {
    border: 3px solid #007bff !important;   
    cursor: pointer;
  }
`;
document.head.appendChild(style);

let lastSelectedImage = null;

async function calculateImageHash(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const image = await createImageBitmap(blob);

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const hash = blockhash(imageData, 16);
    return hash;
  } catch (error) {
    console.error("CAID Plugin: Could not hash image.", error);
    return null;
  }
}

document.addEventListener('contextmenu', async function(event) {
  if (event.target.tagName === 'IMG') {
    if (lastSelectedImage) {
      lastSelectedImage.classList.remove('deepfake-plugin-highlight');
    }

    lastSelectedImage = event.target;
    lastSelectedImage.classList.add('deepfake-plugin-highlight');

    const imageHash = await calculateImageHash(lastSelectedImage.src);

    // **DEBUGGING LOG 1**
    console.log("CAID content.js: Hashing complete. Hash is:", imageHash);

    if (imageHash) {
      chrome.storage.local.set({
        selectedImageUrl: lastSelectedImage.src,
        selectedImageHash: imageHash
      }, function() {
        // **DEBUGGING LOG 2**
        console.log("CAID content.js: Image URL and Hash have been saved to storage.");
      });
    }
  }
}, true);