function toggleOtherReasonField() {
    var reason = document.getElementById('warningReason').value;
    var otherReasonDiv = document.getElementById('otherReason');
    if (reason === 'Other') {
        otherReasonDiv.style.display = 'block';
    } else {
        otherReasonDiv.style.display = 'none';
        document.getElementById('otherText').value = ''; // Clear the input if 'Other' is not selected
    }
}

function updateWarningsDisplay() {
    const warningsDisplay = document.getElementById('warningsDisplay');
    warningsDisplay.innerHTML = ''; // Clear the display
    Object.values(warningsList).forEach(child => {
        const warningCount = child.warnings.length; // Get the count of warnings
        const outMessage = child.outUntil ? ` - Out until ${new Date(child.outUntil).toLocaleDateString()}` : '';
        const childElement = document.createElement('div');
        const warningsListText = child.warnings.map((warning, index) => `<li>${warning}</li>`).join('');
        
        // Add a reset button for each child
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset';
        resetButton.onclick = function() { resetChildWarnings(child.name, child.yearGroup); };
        resetButton.classList.add('reset-button'); // Add a class for styling
        
        childElement.innerHTML = `
            <strong>${child.name} (${child.yearGroup}) - Warnings: ${warningCount}${outMessage}</strong>
            <ul>${warningsListText}</ul>
        `;
        childElement.appendChild(resetButton);
        warningsDisplay.appendChild(childElement);
    });
}

function resetChildWarnings(name, yearGroup) {
    const warningKey = `${name.toLowerCase()}|${yearGroup}`;
    delete warningsList[warningKey];
    localStorage.setItem('warningsList', JSON.stringify(warningsList));
    updateWarningsDisplay();
}

function clearWarnings() {
    if (confirm('Are you sure you want to clear all warnings? This cannot be undone.')) {
        localStorage.removeItem('warningsList');
        warningsList = {};
        updateWarningsDisplay();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('warningForm');
    
    // Retrieve warningsList from localStorage if it exists, otherwise initialize as an empty object
    window.warningsList = JSON.parse(localStorage.getItem('warningsList')) || {};

    // Update the warnings display on page load
    updateWarningsDisplay();

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form values
        const childName = document.getElementById('childName').value.trim();
        const yearGroup = document.getElementById('yearGroup').value;
        const warningReason = document.getElementById('warningReason').value;
        const otherText = document.getElementById('otherText').value.trim();

        // Construct warning key and message
        const warningKey = `${childName.toLowerCase()}|${yearGroup}`;
        const warningMessage = (warningReason === 'Other' && otherText) ? otherText : warningReason;

        // Add or update warning for child
        if (!warningsList[warningKey]) {
            warningsList[warningKey] = {
                name: childName,
                yearGroup: yearGroup,
                warnings: [warningMessage],
                outUntil: null
            };
        } else {
            warningsList[warningKey].warnings.push(warningMessage);
        }

        // Check for 3 strikes and mark as out for 2 weeks
        if (warningsList[warningKey].warnings.length >= 3 && !warningsList[warningKey].outUntil) {
            const outDate = new Date();
            outDate.setDate(outDate.getDate() + 14); // Set out for 2 weeks
            warningsList[warningKey].outUntil = outDate.toISOString();
            alert(`${childName} has 3 warnings and is now 'out' for 2 weeks.`);
        }

        // Save the updated warningsList to localStorage
        localStorage.setItem('warningsList', JSON.stringify(warningsList));

        // Update display
        updateWarningsDisplay();

        // Reset form
        form.reset();
    });
});
