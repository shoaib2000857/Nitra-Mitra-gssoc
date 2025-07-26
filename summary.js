// Summary page JavaScript functionality
// Backend URL configuration
const BASE_URL = 'https://nitra-mitra-gssoc.vercel.app';
let selectedFile = null;

// Text Summarization
async function summarizeText() {
    const text = document.getElementById('textInput').value.trim();
    const resultDiv = document.getElementById('textResult');
    const btn = document.getElementById('textSummarizeBtn');

    if (!text) {
        alert('Please enter some text to summarize');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Processing...';
    
    resultDiv.className = 'result-area loading';
    resultDiv.innerHTML = '<div class="spinner"></div> <span>Analyzing and summarizing your text...</span>';

    try {
        const response = await fetch(`${BASE_URL}/api/summarize/text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: text })
        });

        const data = await response.json();

        if (response.ok) {
            resultDiv.className = 'result-area success';
            resultDiv.innerHTML = `
                <h5><i class="fas fa-check-circle"></i> Summary Generated Successfully</h5>
                <div style="margin-top: 1rem;">
                    <strong>Original Length:</strong> ${data.original_length} characters<br>
                    <strong>Summary Length:</strong> ${data.summary.length} characters<br>
                    <strong>Compression Ratio:</strong> ${Math.round((1 - data.summary.length / data.original_length) * 100)}%
                </div>
                <hr>
                <div style="background: white; padding: 1.5rem; border-radius: 10px; margin-top: 1rem; line-height: 1.6;">
                    ${data.summary.replace(/\n/g, '<br>')}
                </div>
            `;
        } else {
            throw new Error(data.error || 'Unknown error');
        }
    } catch (error) {
        resultDiv.className = 'result-area error';
        resultDiv.innerHTML = `
            <h5><i class="fas fa-times-circle"></i> Summarization Failed</h5>
            <p style="margin-top: 1rem;">Error: ${error.message}</p>
            <p>Please try again with different text or check your connection.</p>
        `;
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-magic"></i> Summarize Text';
    }
}

// File handling functions
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFile = file;
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = formatFileSize(file.size);
        document.getElementById('selectedFile').style.display = 'block';
    }
}

function clearFile() {
    selectedFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('selectedFile').style.display = 'none';
    document.getElementById('fileResult').className = 'result-area';
    document.getElementById('fileResult').innerHTML = `
        <p style="text-align: center; color: var(--secondary-text-color); margin: 2rem 0;">
            <i class="fas fa-upload"></i><br>
            Upload a file to see its summary
        </p>
    `;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// File Summarization
async function summarizeFile() {
    if (!selectedFile) {
        alert('Please select a file first');
        return;
    }

    const resultDiv = document.getElementById('fileResult');
    const btn = document.getElementById('fileSummarizeBtn');

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Processing...';
    
    resultDiv.className = 'result-area loading';
    resultDiv.innerHTML = '<div class="spinner"></div> <span>Uploading and processing your file...</span>';

    try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch(`${BASE_URL}/api/summarize/file`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            resultDiv.className = 'result-area success';
            resultDiv.innerHTML = `
                <h5><i class="fas fa-check-circle"></i> File Summarized Successfully</h5>
                <div style="margin-top: 1rem;">
                    <strong>File:</strong> ${data.filename}<br>
                    <strong>Extracted Length:</strong> ${data.extracted_length} characters<br>
                    <strong>Summary Length:</strong> ${data.summary.length} characters<br>
                    <strong>File Type:</strong> ${selectedFile.type || 'Unknown'}
                </div>
                <hr>
                <div style="background: white; padding: 1.5rem; border-radius: 10px; margin-top: 1rem; line-height: 1.6;">
                    ${data.summary.replace(/\n/g, '<br>')}
                </div>
            `;
        } else {
            throw new Error(data.error || 'Unknown error');
        }
    } catch (error) {
        resultDiv.className = 'result-area error';
        resultDiv.innerHTML = `
            <h5><i class="fas fa-times-circle"></i> File Summarization Failed</h5>
            <p style="margin-top: 1rem;">Error: ${error.message}</p>
            <p>Please try with a different file or check your connection.</p>
        `;
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-magic"></i> Summarize File';
    }
}

// Notes Enhancement
async function enhanceNotes() {
    const notes = document.getElementById('notesInput').value.trim();
    const type = document.getElementById('enhanceType').value;
    const resultDiv = document.getElementById('notesResult');
    const btn = document.getElementById('notesEnhanceBtn');

    if (!notes) {
        alert('Please enter some notes to enhance');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Processing...';
    
    resultDiv.className = 'result-area loading';
    resultDiv.innerHTML = '<div class="spinner"></div> <span>Enhancing your notes...</span>';

    try {
        const response = await fetch(`${BASE_URL}/api/notes/enhance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notes: notes, type: type })
        });

        const data = await response.json();

        if (response.ok) {
            resultDiv.className = 'result-area success';
            resultDiv.innerHTML = `
                <h5><i class="fas fa-check-circle"></i> Notes Enhanced Successfully</h5>
                <div style="margin-top: 1rem;">
                    <strong>Enhancement Type:</strong> ${data.type}<br>
                    <strong>Original Length:</strong> ${data.original_length} characters<br>
                    <strong>Enhanced Length:</strong> ${data.enhanced_notes.length} characters<br>
                    <strong>Improvement:</strong> ${data.enhanced_notes.length > data.original_length ? 'Expanded' : 'Condensed'}
                </div>
                <hr>
                <div style="background: white; padding: 1.5rem; border-radius: 10px; margin-top: 1rem; line-height: 1.6;">
                    ${data.enhanced_notes.replace(/\n/g, '<br>')}
                </div>
            `;
        } else {
            throw new Error(data.error || 'Unknown error');
        }
    } catch (error) {
        resultDiv.className = 'result-area error';
        resultDiv.innerHTML = `
            <h5><i class="fas fa-times-circle"></i> Notes Enhancement Failed</h5>
            <p style="margin-top: 1rem;">Error: ${error.message}</p>
            <p>Please try again with different notes or check your connection.</p>
        `;
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-brain"></i> Enhance Notes';
    }
}

// Drag and drop functionality
function initializeDragAndDrop() {
    const fileUploadArea = document.querySelector('.file-upload-area');

    if (fileUploadArea) {
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('dragover');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type === 'application/pdf' || file.type === 'text/plain' || file.name.endsWith('.md')) {
                    selectedFile = file;
                    document.getElementById('fileName').textContent = file.name;
                    document.getElementById('fileSize').textContent = formatFileSize(file.size);
                    document.getElementById('selectedFile').style.display = 'block';
                } else {
                    alert('Please select a PDF, TXT, or MD file');
                }
            }
        });
    }
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// File validation
function validateFile(file) {
    const allowedTypes = ['application/pdf', 'text/plain'];
    const allowedExtensions = ['.pdf', '.txt', '.md'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    // Check file type
    const isValidType = allowedTypes.includes(file.type) || 
                       allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
        alert('Please select a PDF, TXT, or MD file only.');
        return false;
    }

    // Check file size
    if (file.size > maxSize) {
        alert('File size must be less than 10MB.');
        return false;
    }

    return true;
}

// Enhanced file selection with validation
function handleFileSelectWithValidation(event) {
    const file = event.target.files[0];
    if (file && validateFile(file)) {
        handleFileSelect(event);
    } else {
        // Clear the input if validation fails
        event.target.value = '';
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize drag and drop
    initializeDragAndDrop();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Add file validation to file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.removeEventListener('change', handleFileSelect);
        fileInput.addEventListener('change', handleFileSelectWithValidation);
    }
    
    console.log('Summary page JavaScript initialized successfully');
});

// Utility function for error handling
function handleApiError(error, context) {
    console.error(`Error in ${context}:`, error);
    
    let userMessage = 'An unexpected error occurred. Please try again.';
    
    if (error.message.includes('fetch')) {
        userMessage = 'Network error. Please check your internet connection.';
    } else if (error.message.includes('timeout')) {
        userMessage = 'Request timed out. Please try again.';
    } else if (error.message.includes('500')) {
        userMessage = 'Server error. Please try again later.';
    }
    
    return userMessage;
}

// Export functions for global access
window.summarizeText = summarizeText;
window.summarizeFile = summarizeFile;
window.enhanceNotes = enhanceNotes;
window.handleFileSelect = handleFileSelectWithValidation;
window.clearFile = clearFile;
