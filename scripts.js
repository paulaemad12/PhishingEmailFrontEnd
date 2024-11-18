// Initialize Firebase
const firebaseConfig = {
    // Your Firebase configuration
    apiKey: "AIzaSyCGaGf4uJUSovXITxL2leFauR6vFnTuX1E",
    authDomain: "phishingemail-d49c7.firebaseapp.com",
    projectId: "phishingemail-d49c7",
    storageBucket: "phishingemail-d49c7.appspot.com",
    messagingSenderId: "1087478287980",
    appId: "1:1087478287980:web:845f7b54fce51d030c9249",
    measurementId: "G-F85CL25KL4"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Event listener for the phishing check form
document.getElementById('phishing-check-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const emailContent = document.getElementById('email-content').value.trim();
    const errorDiv = document.getElementById('phishing-error');
    const resultDiv = document.getElementById('phishing-result');
    errorDiv.innerText = '';
    resultDiv.innerHTML = '';

    if (emailContent === '') {
        errorDiv.innerText = 'Please enter the email content.';
        return;
    }

    try {
        // Send the email content to the server for phishing detection
        const response = await axios.post('https://38cc4357-e1d4-4cee-a533-6a8a8570c93b-00-35ngej3s33r0j.picard.replit.dev/api/detect-phishing', { content: emailContent });
        const { isPhishing, reasons } = response.data;

        if (isPhishing) {
            // Display the reasons
            resultDiv.innerHTML = `
                <p><strong>This email is likely a phishing email.</strong></p>
                <p><strong>Reason(s):</strong></p>
                <ul>${reasons.map(reason => `<li>${reason}</li>`).join('')}</ul>
                <button id="report-phishing" class="btn report-btn">Report Phishing</button>
                <button id="mark-safe" class="btn safe-btn">Mark as Safe</button>
            `;

            // Add event listeners to the buttons
            document.getElementById('report-phishing').addEventListener('click', () => {
                handleReportPhishing(emailContent, reasons);
            });
            document.getElementById('mark-safe').addEventListener('click', () => {
                handleMarkSafe();
            });
        } else {
            resultDiv.innerHTML = `
                <p><strong>This email appears to be safe.</strong></p>
                <button id="disagree" class="btn disagree-btn">I think it's Phishing</button>
            `;
            document.getElementById('disagree').addEventListener('click', () => {
                handleDisagree(emailContent);
            });
        }
    } catch (error) {
        console.error('Error detecting phishing:', error);
        errorDiv.innerText = 'An error occurred while checking the email. Please try again later.';
    }
});

// Function to handle reporting phishing emails
function handleReportPhishing(emailContent, reasons) {
    // Save the phishing email to Firestore for further analysis
    db.collection('reportedPhishingEmails').add({
        content: emailContent,
        reasons: reasons,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showToast('Phishing email reported. Thank you!');
        document.getElementById('phishing-result').innerHTML = '';
    }).catch((error) => {
        console.error("Error reporting phishing email: ", error);
        showToast('Error reporting phishing email.');
    });
}

// Function to handle marking an email as safe
function handleMarkSafe() {
    document.getElementById('phishing-result').innerText = 'Email marked as safe.';
    showToast('Email marked as safe.');
}

// Function to handle user disagreement
function handleDisagree(emailContent) {
    // Allow user to report the email as phishing
    handleReportPhishing(emailContent, ['User reported as phishing']);
}

// Function to show toast notifications
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.className = 'show';
    setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
}

// Password Strength Checker
document.getElementById('password-check-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const password = document.getElementById('password-input').value;
    const { strength, suggestions } = calculatePasswordStrength(password);
    let resultHtml = `<p><strong>Password Strength:</strong> ${strength}</p>`;
    if (suggestions.length > 0) {
        resultHtml += `<p><strong>Suggestions:</strong></p><ul>${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}</ul>`;
    }
    document.getElementById('password-result').innerHTML = resultHtml;
});

// Function to calculate password strength
function calculatePasswordStrength(password) {
    let strength = 'Weak';
    let suggestions = [];

    // Check length
    if (password.length < 8) {
        suggestions.push('Use at least 8 characters');
    }

    // Check character types
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[^A-Za-z0-9]/.test(password);

    if (!hasUpperCase) suggestions.push('Include uppercase letters');
    if (!hasLowerCase) suggestions.push('Include lowercase letters');
    if (!hasNumbers) suggestions.push('Include numbers');
    if (!hasSpecialChars) suggestions.push('Include special characters');

    // Check common passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'letmein'];
    if (commonPasswords.includes(password.toLowerCase())) {
        suggestions.push('Avoid common passwords');
    }

    // Calculate entropy
    let charsetSize = 0;
    if (hasUpperCase) charsetSize += 26;
    if (hasLowerCase) charsetSize += 26;
    if (hasNumbers) charsetSize += 10;
    if (hasSpecialChars) charsetSize += 32; // Approximate number of special characters

    const entropy = Math.log2(Math.pow(charsetSize, password.length));

    if (entropy >= 100) {
        strength = 'Very Strong';
    } else if (entropy >= 60) {
        strength = 'Strong';
    } else if (entropy >= 40) {
        strength = 'Moderate';
    }

    return { strength, suggestions };
}

// Function to play game levels
function playLevel(level) {
    showToast(`Starting ${level} quiz...`);
    let content = renderQuiz(level);
    document.getElementById('quiz-container').innerHTML = content;
    openModal();
    startQuiz(level);
}

// Quiz data
const passwordSecurityQuiz = [
    {
        question: 'Which of the following is the strongest password?',
        options: ['Password123', 'P@ssw0rd!', '12345678', 'abcdefgh'],
        answer: 'P@ssw0rd!'
    },
    {
        question: 'True or False: You should use the same password for multiple accounts.',
        options: ['True', 'False'],
        answer: 'False'
    },
    {
        question: 'What is a good practice when creating passwords?',
        options: [
            'Use personal information like your birthday',
            'Use a mix of letters, numbers, and symbols',
            'Keep it short for easy remembrance',
            'Use common words'
        ],
        answer: 'Use a mix of letters, numbers, and symbols'
    },
    {
        question: 'Why is it important to use unique passwords for different accounts?',
        options: [
            'It’s not important',
            'To prevent multiple accounts being compromised',
            'To make passwords harder to remember',
            'Because websites require it'
        ],
        answer: 'To prevent multiple accounts being compromised'
    },
    {
        question: 'What is a password manager?',
        options: [
            'A tool to generate and store passwords securely',
            'A person who manages passwords',
            'An antivirus software',
            'A type of malware'
        ],
        answer: 'A tool to generate and store passwords securely'
    },
    {
        question: 'What is two-factor authentication?',
        options: [
            'Using two passwords',
            'A security process requiring two forms of identification',
            'Logging in from two devices',
            'A type of encryption'
        ],
        answer: 'A security process requiring two forms of identification'
    },
    {
        question: 'Which of these is an example of a strong password?',
        options: ['john1990', '12345678', 'P@$$w0rd2021!', 'qwerty'],
        answer: 'P@$$w0rd2021!'
    },
    {
        question: 'How often should you change your passwords?',
        options: ['Every week', 'Never', 'Periodically or if compromised', 'Only when you forget them'],
        answer: 'Periodically or if compromised'
    },
    {
        question: 'What should you do if you suspect your password has been compromised?',
        options: [
            'Ignore it',
            'Change it immediately',
            'Share it with friends',
            'Use it on more websites'
        ],
        answer: 'Change it immediately'
    },
    {
        question: 'Which of the following is NOT recommended for password security?',
        options: [
            'Sharing your passwords with others',
            'Using a password manager',
            'Enabling two-factor authentication',
            'Using complex passwords'
        ],
        answer: 'Sharing your passwords with others'
    }
];

const socialEngineeringQuiz = [
    {
        question: 'What is social engineering in cybersecurity?',
        options: [
            'A software development methodology',
            'A tactic that manipulates people into giving up confidential information',
            'A type of firewall',
            'A way to enhance user interface design'
        ],
        answer: 'A tactic that manipulates people into giving up confidential information'
    },
    {
        question: 'Which of the following is a common type of social engineering attack?',
        options: ['Phishing', 'DDoS attack', 'SQL injection', 'Brute-force attack'],
        answer: 'Phishing'
    },
    {
        question: 'What is pretexting in the context of social engineering?',
        options: [
            'Sending mass emails to users',
            'Creating a fabricated scenario to steal information',
            'Scanning networks for vulnerabilities',
            'Encrypting data without permission'
        ],
        answer: 'Creating a fabricated scenario to steal information'
    },
    {
        question: 'How can you protect yourself from social engineering attacks?',
        options: [
            'By sharing passwords with colleagues',
            'By ignoring security updates',
            'By being cautious of unsolicited requests for information',
            'By using the same password everywhere'
        ],
        answer: 'By being cautious of unsolicited requests for information'
    },
    {
        question: 'What is baiting in social engineering?',
        options: [
            'Offering something enticing to lure victims',
            'Threatening to harm unless information is given',
            'Monitoring network traffic',
            'Installing antivirus software'
        ],
        answer: 'Offering something enticing to lure victims'
    },
    {
        question: 'Tailgating is a physical security breach where an unauthorized person:',
        options: [
            'Follows an authorized person into a restricted area',
            'Sends phishing emails',
            'Intercepts network traffic',
            'Uses malware to access data'
        ],
        answer: 'Follows an authorized person into a restricted area'
    },
    {
        question: 'Which behavior might indicate a social engineering attempt?',
        options: [
            'A request for sensitive information via email',
            'An official update from known software',
            'A scheduled maintenance notification',
            'A receipt from a recent purchase'
        ],
        answer: 'A request for sensitive information via email'
    },
    {
        question: 'What should you do if you suspect a social engineering attack?',
        options: [
            'Provide the information to avoid conflict',
            'Ignore it and proceed as normal',
            'Report it to the appropriate security personnel',
            'Forward it to friends'
        ],
        answer: 'Report it to the appropriate security personnel'
    },
    {
        question: 'Dumpster diving is a technique where attackers:',
        options: [
            'Search through trash to find confidential information',
            'Hack into databases',
            'Send malicious attachments',
            'Install spyware on devices'
        ],
        answer: 'Search through trash to find confidential information'
    },
    {
        question: 'Which of the following is NOT a social engineering technique?',
        options: ['Phishing', 'Smishing', 'Vishing', 'Firewalking'],
        answer: 'Firewalking'
    }
];

const secureBrowsingQuiz = [
    {
        question: 'What does "HTTPS" stand for?',
        options: [
            'HyperText Transfer Protocol Secure',
            'HyperText Transfer Protocol Standard',
            'High Transfer Protocol Secure',
            'HyperText Transfer Procedure Secure'
        ],
        answer: 'HyperText Transfer Protocol Secure'
    },
    {
        question: 'Which of the following is a safe practice while browsing the internet?',
        options: [
            'Clicking on pop-up ads',
            'Using strong and unique passwords',
            'Downloading files from unknown sources',
            'Sharing personal information on unsecured websites'
        ],
        answer: 'Using strong and unique passwords'
    },
    {
        question: 'Why should you keep your browser updated?',
        options: [
            'For new features only',
            'To change the interface',
            'To fix security vulnerabilities',
            'To increase download speed'
        ],
        answer: 'To fix security vulnerabilities'
    },
    {
        question: 'What is a VPN used for?',
        options: [
            'Enhancing graphics performance',
            'Securing your internet connection by encrypting data',
            'Increasing internet speed',
            'Accessing local network resources remotely without security'
        ],
        answer: 'Securing your internet connection by encrypting data'
    },
    {
        question: 'Which symbol indicates a secure connection in a web browser?',
        options: [
            'An open lock icon',
            'A broken chain icon',
            'A padlock icon',
            'A warning triangle'
        ],
        answer: 'A padlock icon'
    },
    {
        question: 'What should you do if you receive a warning about an invalid certificate when visiting a website?',
        options: [
            'Proceed without concern',
            'Ignore the warning and continue',
            'Close the website immediately',
            'Enter personal information quickly'
        ],
        answer: 'Close the website immediately'
    },
    {
        question: 'What is the risk of using public Wi-Fi without protection?',
        options: [
            'Slow internet speed',
            'Higher data costs',
            'Increased vulnerability to attackers',
            'Nothing; it is completely safe'
        ],
        answer: 'Increased vulnerability to attackers'
    },
    {
        question: 'Which of these is a method to ensure secure browsing?',
        options: [
            'Disabling browser updates',
            'Clearing cache regularly',
            'Using incognito mode for all browsing',
            'Avoiding security software'
        ],
        answer: 'Clearing cache regularly'
    },
    {
        question: 'What is phishing?',
        options: [
            'A way to catch fish',
            'A cyberattack that tricks users into revealing personal information',
            'A method to improve browser speed',
            'A type of firewall'
        ],
        answer: 'A cyberattack that tricks users into revealing personal information'
    },
    {
        question: 'Why should you avoid clicking on suspicious links?',
        options: [
            'They can slow down your internet',
            'They might lead to unwanted ads',
            'They can lead to malware infections or phishing sites',
            'They consume more data'
        ],
        answer: 'They can lead to malware infections or phishing sites'
    }
];

// Function to render the quiz
function renderQuiz(level) {
    return `
        <h2>${level} Quiz</h2>
        <div id="quiz-content"></div>
    `;
}

// Function to open the modal
function openModal() {
    const modal = document.getElementById('quiz-modal');
    modal.style.display = 'block';
    modal.classList.add('fade-in');
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('quiz-modal');
    modal.style.display = 'none';
    document.getElementById('quiz-container').innerHTML = '';
}

// Function to start the quiz
function startQuiz(level) {
    let quizData;
    switch(level) {
        case 'Password Security':
            quizData = passwordSecurityQuiz;
            break;
        case 'Social Engineering':
            quizData = socialEngineeringQuiz;
            break;
        case 'Secure Browsing':
            quizData = secureBrowsingQuiz;
            break;
        default:
            quizData = [];
    }

    let currentQuestionIndex = 0;
    let score = 0;
    let userAnswers = [];

    function showQuestion() {
        if (currentQuestionIndex < quizData.length) {
            const questionObj = quizData[currentQuestionIndex];
            let optionsHtml = '';
            questionObj.options.forEach((option, index) => {
                optionsHtml += `
                    <label class="quiz-option">
                        <input type="radio" id="option${index}" name="quiz-option" value="${option}" required>
                        ${option}
                    </label>
                `;
            });

            document.getElementById('quiz-content').innerHTML = `
                <p>Question ${currentQuestionIndex + 1} of ${quizData.length}</p>
                <p>${questionObj.question}</p>
                <form id="quiz-form">
                    ${optionsHtml}
                    <button type="submit" class="quiz-button">Submit</button>
                </form>
                <div id="quiz-result" class="result-message"></div>
            `;

            document.getElementById('quiz-form').addEventListener('submit', function(event) {
                event.preventDefault();
                const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
                if (selectedOption) {
                    const answer = selectedOption.value;
                    const isCorrect = answer === questionObj.answer;
                    if (isCorrect) {
                        score++;
                        document.getElementById('quiz-result').innerHTML = '<span class="success-message">Correct!</span>';
                    } else {
                        document.getElementById('quiz-result').innerHTML = `<span class="error-message">Incorrect. The correct answer is "${questionObj.answer}".</span>`;
                    }
                    userAnswers.push({
                        question: questionObj.question,
                        selected: answer,
                        correct: questionObj.answer,
                        isCorrect: isCorrect
                    });
                    currentQuestionIndex++;
                    setTimeout(showQuestion, 2000);
                } else {
                    document.getElementById('quiz-result').innerHTML = '<span class="error-message">Please select an option.</span>';
                }
            });
        } else {
            // Provide summary
            let summaryHtml = `
                <h3>Quiz Summary</h3>
                <p>You scored ${score} out of ${quizData.length}.</p>
                <ul>
            `;
            userAnswers.forEach((answer, index) => {
                summaryHtml += `
                    <li class="${answer.isCorrect ? 'correct' : 'incorrect'}">
                        <strong>Q${index + 1}:</strong> ${answer.question}<br>
                        <strong>Your Answer:</strong> ${answer.selected}<br>
                        ${!answer.isCorrect ? `<strong>Correct Answer:</strong> ${answer.correct}` : ''}
                    </li>
                `;
            });
            summaryHtml += `
                </ul>
                <button onclick="retakeQuiz('${level}')" class="quiz-button">Retake Quiz</button>
                <button onclick="closeModal()" class="quiz-button">Close</button>
            `;
            document.getElementById('quiz-content').innerHTML = summaryHtml;
        }
    }

    showQuestion();
}

// Function to retake the quiz
function retakeQuiz(level) {
    // Reset variables
    document.getElementById('quiz-content').innerHTML = '';
    startQuiz(level);
}

// Close modal when clicking outside of the modal content
window.onclick = function(event) {
    const modal = document.getElementById('quiz-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
        document.getElementById('quiz-container').innerHTML = '';
    }
}
