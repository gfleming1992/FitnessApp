document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const currentDateDisplay = document.getElementById('current-date');
    const prevDayButton = document.getElementById('prev-day');
    const nextDayButton = document.getElementById('next-day');

    // Modal elements
    const noteModal = document.getElementById('note-modal');
    const noteModalTitle = document.getElementById('note-modal-title');
    const noteTextarea = document.getElementById('note-textarea');
    const saveNoteButton = document.getElementById('save-note-button');
    const cancelNoteButton = document.getElementById('cancel-note-button');
    const closeButton = noteModal.querySelector('.close-button');

    let currentNoteContext = {
        day: null, // The actual day the note pertains to (e.g., futureDay or pastDay)
        exerciseName: null,
        isEditingNext: false
    };

    let currentDate = new Date();
    let currentDayOfYear = Math.floor((currentDate - new Date(currentDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));

    const exercises = {
        1: [
            { name: 'Pull up', sets: 3 },
            { name: 'Dead Lift', sets: 3 },
            { name: 'Back Rows', sets: 3 },
            { name: 'Bicep Curls', sets: 3 }
        ],
        2: [
            { name: 'Incline Bench Press', sets: 3 },
            { name: 'Shoulder Press', sets: 3 },
            { name: 'Shoulder Flies', sets: 3 },
            { name: 'Tricep Pull Downs', sets: 3 }
        ],
        3: [
            { name: 'Back Squat', sets: 3 },
            { name: 'Hungarian Dead Lift', sets: 3 },
            { name: 'Calf Raises', sets: 3 },
            { name: 'Sprints', sets: 3 }
        ],
        0: [] // Rest day (day 4 % 4 === 0)
    };

    function formatDate(date) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }

    function renderDay(dayNumber) {
        mainContent.innerHTML = ''; // Clear previous content
        currentDateDisplay.textContent = formatDate(currentDate);

        const dayType = dayNumber % 4 === 0 ? 0 : dayNumber % 4;

        if (dayType === 0) {
            const restDiv = document.createElement('div');
            restDiv.className = 'rest-day';
            restDiv.textContent = 'REST.';
            mainContent.appendChild(restDiv);
            return;
        }

        const dayExercises = exercises[dayType];
        dayExercises.forEach(exercise => {
            const section = document.createElement('div');
            section.className = 'exercise-section';

            const title = document.createElement('h3');
            title.textContent = exercise.name;
            // section.appendChild(title);

            const titleContainer = document.createElement('div');
            titleContainer.className = 'exercise-title-container';
            titleContainer.appendChild(title);

            const iconsDiv = document.createElement('div');

            const prevNoteIcon = document.createElement('span');
            prevNoteIcon.className = 'note-icon';
            prevNoteIcon.textContent = '📜'; // Previous note icon
            prevNoteIcon.title = 'View Previous Note';
            prevNoteIcon.addEventListener('click', () => showNoteModal(dayNumber, exercise.name, false));
            iconsDiv.appendChild(prevNoteIcon);

            const nextNoteIcon = document.createElement('span');
            nextNoteIcon.className = 'note-icon';
            nextNoteIcon.textContent = '📝'; // Next note icon
            nextNoteIcon.title = 'Add/Edit Next Note';
            nextNoteIcon.addEventListener('click', () => showNoteModal(dayNumber, exercise.name, true));
            iconsDiv.appendChild(nextNoteIcon);

            titleContainer.appendChild(iconsDiv);
            section.appendChild(titleContainer);

            const table = document.createElement('table');
            table.className = 'data-table';
            const headerRow = table.insertRow();
            ['Set', 'Last Goal', 'Work', 'Next Goal'].forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                if (headerText !== 'Set') {
                    th.colSpan = 2; // Span Weight and Reps columns
                }
                headerRow.appendChild(th);
            });

            const subHeaderRow = table.insertRow();
            subHeaderRow.insertCell(); // Empty for Set
            ['Weight', 'Reps', 'Weight', 'Reps', 'Weight', 'Reps'].forEach(subHeaderText => {
                const th = document.createElement('th');
                th.textContent = subHeaderText;
                subHeaderRow.appendChild(th);
            });


            for (let i = 1; i <= exercise.sets; i++) {
                const dataRow = table.insertRow();
                const setCell = dataRow.insertCell();
                setCell.textContent = i; // Set #
                setCell.rowSpan = 1; // Set number spans one logical row now

                // Previous Goal Weight
                dataRow.insertCell().textContent = ''; // Placeholder for actual data loading (Weight)
                // Previous Goal Reps
                dataRow.insertCell().textContent = ''; // Placeholder for actual data loading (Reps)

                // Work (User Input) Weight
                const workWeightCell = dataRow.insertCell();
                workWeightCell.classList.add('input-cell'); // Add class for specific styling
                const workWeightInput = document.createElement('input');
                workWeightInput.type = 'number';
                workWeightInput.min = '0';
                workWeightInput.dataset.day = dayNumber;
                workWeightInput.dataset.exercise = exercise.name;
                workWeightInput.dataset.set = i;
                workWeightInput.dataset.type = 'work-weight';
                workWeightCell.appendChild(workWeightInput);

                // Work (User Input) Reps
                const workRepsCell = dataRow.insertCell();
                workRepsCell.classList.add('input-cell'); // Add class for specific styling
                const workRepsInput = document.createElement('input');
                workRepsInput.type = 'number';
                workRepsInput.min = '0';
                workRepsInput.dataset.day = dayNumber;
                workRepsInput.dataset.exercise = exercise.name;
                workRepsInput.dataset.set = i;
                workRepsInput.dataset.type = 'work-reps';
                workRepsCell.appendChild(workRepsInput);

                // Next Goal (User Input) Weight
                const nextGoalWeightCell = dataRow.insertCell();
                nextGoalWeightCell.classList.add('input-cell'); // Add class for specific styling
                const nextGoalWeightInput = document.createElement('input');
                nextGoalWeightInput.type = 'number';
                nextGoalWeightInput.min = '0';
                nextGoalWeightInput.dataset.day = dayNumber;
                nextGoalWeightInput.dataset.exercise = exercise.name;
                nextGoalWeightInput.dataset.set = i;
                nextGoalWeightInput.dataset.type = 'next-goal-weight';
                nextGoalWeightCell.appendChild(nextGoalWeightInput);

                // Next Goal (User Input) Reps
                const nextGoalRepsCell = dataRow.insertCell();
                nextGoalRepsCell.classList.add('input-cell'); // Add class for specific styling
                const nextGoalRepsInput = document.createElement('input');
                nextGoalRepsInput.type = 'number';
                nextGoalRepsInput.min = '0';
                nextGoalRepsInput.dataset.day = dayNumber;
                nextGoalRepsInput.dataset.exercise = exercise.name;
                nextGoalRepsInput.dataset.set = i;
                nextGoalRepsInput.dataset.type = 'next-goal-reps';
                nextGoalRepsCell.appendChild(nextGoalRepsInput);
            }
            section.appendChild(table);
            mainContent.appendChild(section);
        });
        loadData(dayNumber);
    }

    function showNoteModal(displayedDay, exerciseName, isEditingNextNote) {
        currentNoteContext.exerciseName = exerciseName;
        currentNoteContext.isEditingNext = isEditingNextNote;

        let targetNoteDay;
        if (isEditingNextNote) {
            targetNoteDay = displayedDay + 4;
            noteModalTitle.textContent = `Note for ${exerciseName} (Next)`;
            noteTextarea.readOnly = false;
            noteTextarea.placeholder = "Enter your note for the next session...";
            saveNoteButton.style.display = 'inline-block';
            cancelNoteButton.textContent = 'Cancel';
        } else {
            targetNoteDay = displayedDay - 4;
            noteModalTitle.textContent = `Note from ${exerciseName} (Previous)`;
            noteTextarea.readOnly = true;
            noteTextarea.placeholder = "No previous note found.";
            saveNoteButton.style.display = 'none';
            cancelNoteButton.textContent = 'Close';
        }
        currentNoteContext.day = targetNoteDay; // Store the day the note actually belongs to

        const noteKey = `fitnessApp-note-${targetNoteDay}-${exerciseName}`;
        const existingNote = localStorage.getItem(noteKey);
        noteTextarea.value = existingNote || '';
        noteModal.style.display = 'block';
    }

    // Modal event listeners
    if (closeButton) {
        closeButton.onclick = () => {
            noteModal.style.display = 'none';
        };
    }

    if (cancelNoteButton) {
        cancelNoteButton.onclick = () => {
            noteModal.style.display = 'none';
        };
    }

    if (saveNoteButton) {
        saveNoteButton.onclick = () => {
            if (currentNoteContext.isEditingNext && currentNoteContext.day !== null && currentNoteContext.exerciseName) {
                const noteKey = `fitnessApp-note-${currentNoteContext.day}-${currentNoteContext.exerciseName}`;
                localStorage.setItem(noteKey, noteTextarea.value);
                noteModal.style.display = 'none';
            }
        };
    }

    window.onclick = (event) => {
        if (event.target == noteModal) {
            noteModal.style.display = 'none';
        }
    };

    function saveData(day, exerciseName, set, type, value) {
        const key = `fitnessApp-${day}-${exerciseName}-${set}-${type}`;
        localStorage.setItem(key, value);
    }

    function loadData(day) {
        const inputs = mainContent.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            const { exercise, set, type } = input.dataset;
            const key = `fitnessApp-${day}-${exercise}-${set}-${type}`;
            const savedValue = localStorage.getItem(key);
            if (savedValue !== null) {
                input.value = savedValue;
            }
            // Load previous day's next goal as current day's previous goal
            if (type.startsWith('work')) { 
                const prevDay = day - 4; // Look 4 days back for the same workout type
                if (prevDay > 0) {
                    const prevGoalWeightKey = `fitnessApp-${prevDay}-${exercise}-${set}-next-goal-weight`;
                    const prevGoalRepsKey = `fitnessApp-${prevDay}-${exercise}-${set}-next-goal-reps`;
                    const prevGoalWeight = localStorage.getItem(prevGoalWeightKey);
                    const prevGoalReps = localStorage.getItem(prevGoalRepsKey);

                    const tableRow = input.closest('tr');
                    if (tableRow) {
                        // Previous Goal Weight is in cell index 1, Reps in cell index 2
                        if (prevGoalWeight !== null) tableRow.cells[1].textContent = prevGoalWeight;
                        if (prevGoalReps !== null) tableRow.cells[2].textContent = prevGoalReps;
                    }
                }
            }
        });
    }

    mainContent.addEventListener('change', (event) => {
        if (event.target.type === 'number') {
            const { day, exercise, set, type } = event.target.dataset;
            saveData(day, exercise, set, type, event.target.value);
        }
    });

    prevDayButton.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        currentDayOfYear = Math.floor((currentDate - new Date(currentDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        renderDay(currentDayOfYear);
    });

    nextDayButton.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDayOfYear = Math.floor((currentDate - new Date(currentDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        renderDay(currentDayOfYear);
    });

    // Initial render
    renderDay(currentDayOfYear);
});
