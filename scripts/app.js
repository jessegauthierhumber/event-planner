// Import event functions
import {
    handleEventFormSubmit,
    resetEventForm,
    deleteEvent,
    getEventForEdit,
    getAllEvents,
    getEventById
} from './features/events.js';

// Store currentEventId in app.js
let currentEventId = null;
let events = [];

// DOM Elements
const eventGrid = document.getElementById("eventGrid");
const emptyState = document.getElementById("emptyState");
const eventForm = document.getElementById("eventForm");
const addEventBtn = document.getElementById("addEventBtn");
const cancelEventBtn = document.getElementById("cancelEventBtn");
const eventSection = document.getElementById("event-section");
const tasksSection = document.getElementById("tasks");
const summarySection = document.getElementById("summary-section");

// Modal Elements
const eventModal = document.getElementById("eventModal");
const closeModal = document.querySelector(".close-modal");
const modalEventName = document.getElementById("modalEventName");
const modalEventDate = document.getElementById("modalEventDate");
const modalEventLocation = document.getElementById("modalEventLocation");
const modalEventBudget = document.getElementById("modalEventBudget");
const modalEventDescription = document.getElementById("modalEventDescription");
const viewDetailsBtn = document.getElementById("viewDetailsBtn");
const editEventBtn = document.getElementById("editEventBtn");
const deleteEventBtn = document.getElementById("deleteEventBtn");

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // Get all events on load
    events = getAllEvents();
    renderEvents();

    // Event form submission
    eventForm.addEventListener("submit", (e) => {
        // Use the imported function to update events in localStorage
        handleEventFormSubmit(e, currentEventId);

        // Always reload events from localStorage to avoid duplicates
        events = getAllEvents();
        currentEventId = null;
        resetEventForm();
        eventSection.classList.add("hidden");
        renderEvents();
    });

    // Add event button
    addEventBtn.addEventListener("click", () => {
        currentEventId = null;
        resetEventForm();
        document.querySelector("#event-section h1").textContent = "Add New Event";
        eventSection.classList.remove("hidden");
    });

    // Cancel button
    cancelEventBtn.addEventListener("click", () => {
        eventSection.classList.add("hidden");
    });

    // Modal controls
    closeModal.addEventListener("click", closeEventModal);
    window.addEventListener("click", (e) => {
        if (e.target === eventModal) {
            closeEventModal();
        }
    });

    // Modal action buttons
    viewDetailsBtn.addEventListener("click", viewEventDetails);
    editEventBtn.addEventListener("click", editEvent);
    deleteEventBtn.addEventListener("click", () => {
        if (deleteEvent(currentEventId)) {
            // Always reload events from localStorage after deletion
            events = getAllEvents();
            closeEventModal();
            tasksSection.classList.add("hidden");
            summarySection.classList.add("hidden");
            renderEvents();
        }
    });
});

// Functions
function renderEvents() {
    // Clear the event grid completely
    while (eventGrid.firstChild) {
        eventGrid.removeChild(eventGrid.firstChild);
    }

    // Add back the empty state
    eventGrid.appendChild(emptyState);

    // Show/hide empty state
    if (events.length === 0) {
        emptyState.style.display = "block";
        return;
    } else {
        emptyState.style.display = "none";
    }

    // Render each event as a card
    events.forEach((event) => {
        const eventCard = document.createElement("div");
        eventCard.className = "event-card";
        eventCard.dataset.id = event.id;

        const formattedDate = new Date(event.date).toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );

        eventCard.innerHTML = `
      <h3>${event.name}</h3>
      <div class="event-date">${formattedDate}</div>
      <div class="event-location">${event.location || "No location"}</div>
      <div class="event-budget">Budget: $${event.budget}</div>
    `;

        eventCard.addEventListener("click", () => openEventModal(event));

        eventGrid.appendChild(eventCard);
    });
}

function openEventModal(event) {
    currentEventId = event.id;

    // Populate modal with event data
    modalEventName.textContent = event.name;

    const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    modalEventDate.textContent = formattedDate;
    modalEventLocation.textContent =
        event.location || "No location specified";
    modalEventBudget.textContent = event.budget;
    modalEventDescription.textContent =
        event.description || "No description available.";

    // Show the modal with proper styling
    eventModal.style.display = "block";
    document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
}

function closeEventModal() {
    eventModal.style.display = "none";
    document.body.style.overflow = "auto"; // Restore page scrolling
}

function viewEventDetails() {
    closeEventModal();

    // Find the current event using imported function
    const event = getEventById(currentEventId);
    if (!event) return;

    // Update summary section
    document.getElementById("eventSummary").textContent = event.name;
    document.getElementById("dateSummary").textContent = new Date(
        event.date
    ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    document.getElementById("locationSummary").textContent =
        event.location || "No location";
    document.getElementById("budgetSummary").textContent = event.budget;

    // Calculate total cost from tasks
    let totalCost = 0;
    if (event.tasks) {
        totalCost = event.tasks.reduce(
            (sum, task) => sum + parseFloat(task.cost || 0),
            0
        );
    }
    document.getElementById("costSummary").textContent =
        totalCost.toFixed(2);

    // Update tasks section
    document.getElementById("currentEventName").textContent = event.name;

    // Display tasks
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    if (event.tasks && event.tasks.length > 0) {
        event.tasks.forEach((task) => {
            const taskItem = document.createElement("div");
            taskItem.className = "task-item";

            taskItem.innerHTML = `
        <div class="task-details">
          <h3>${task.name}</h3>
          <p>Cost: $${task.cost}</p>
          <p>Deadline: ${new Date(task.deadline).toLocaleDateString()}</p>
        </div>
        <div class="task-actions">
          <button class="edit-task" data-id="${task.id}">Edit</button>
          <button class="delete-task" data-id="${task.id}">Delete</button>
        </div>
      `;

            taskList.appendChild(taskItem);
        });
    } else {
        taskList.innerHTML = "<p>No tasks added yet.</p>";
    }

    // Show task and summary sections
    tasksSection.classList.remove("hidden");
    summarySection.classList.remove("hidden");

    // Setup task form submission for this event
    setupTaskFormForEvent(event.id);
}

function setupTaskFormForEvent(eventId) {
    const taskForm = document.getElementById("taskForm");

    // Remove any existing listeners
    const newTaskForm = taskForm.cloneNode(true);
    taskForm.parentNode.replaceChild(newTaskForm, taskForm);

    // Add new listener
    newTaskForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const taskName = document.getElementById("taskName").value;
        const taskCost = document.getElementById("taskCost").value;
        const taskDeadline = document.getElementById("taskDeadline").value;

        // Find the event
        const eventIndex = events.findIndex((event) => event.id === eventId);
        if (eventIndex === -1) return;

        // Create task
        const newTask = {
            id: Date.now().toString(),
            name: taskName,
            cost: parseFloat(taskCost),
            deadline: taskDeadline,
        };

        // Add task to event
        if (!events[eventIndex].tasks) {
            events[eventIndex].tasks = [];
        }

        events[eventIndex].tasks.push(newTask);

        // Save to local storage
        localStorage.setItem("events", JSON.stringify(events));

        // Reset form
        newTaskForm.reset();

        // Refresh view
        viewEventDetails();
    });
}

function editEvent() {
    closeEventModal();

    // Find the current event using the imported function
    const event = getEventForEdit(currentEventId);
    if (!event) return;

    // Change the form title to indicate editing
    document.querySelector("#event-section h1").textContent = "Edit Event";

    // Fill the form with event data
    document.getElementById("eventName").value = event.name;
    document.getElementById("eventDate").value = event.date;
    document.getElementById("eventLocation").value = event.location || "";
    document.getElementById("eventDescription").value = event.description || "";
    document.getElementById("budget").value = event.budget;

    // Show event section
    eventSection.classList.remove("hidden");
}