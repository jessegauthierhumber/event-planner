// Import event functions
import {
    handleEventFormSubmit,
    resetEventForm,
    deleteEvent,
    getEventForEdit,
    getAllEvents,
    getEventById,
    addGuestToEvent,
    updateGuest,
    deleteGuest,
    getGuestsForEvent
} from './features/events.js';
import {
    addTaskToEvent,
    deleteTaskFromEvent,
    getTasksForEvent
} from './features/tasks.js';

import {
    setupPurchaseForm,
    getPurchasesForEvent,
    deletePurchase
} from './features/budget.js';

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
const allTasksSection = document.getElementById("all-tasks");
const allTasksList = document.getElementById("allTasksList");
const guestSection = document.getElementById("guest-section");
const guestList = document.getElementById("guestList");
const guestCount = document.getElementById("guestCount");
const guestForm = document.getElementById("guestForm");
const guestEventName = document.getElementById("guestEventName");
const purchaseSection = document.getElementById("purchase-section");
const purchaseEventName = document.getElementById("purchaseEventName");
const allPurchasesSection = document.getElementById("all-purchases");
const allPurchasesList = document.getElementById("allPurchasesList");
const showAllPurchasesBtn = document.getElementById("showAllPurchasesBtn");



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
    renderAllPurchases(); // Ensure this runs on initial load
    renderAllTasks(); // Ensure this runs on initial load


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
            guestSection.classList.add("hidden"); // Hide guest section too
            purchaseSection.classList.add("hidden"); // Hide purchase section too
            renderEvents();
            renderAllPurchases(); // Re-render all purchases after deleting an event
            renderAllTasks(); // Re-render all tasks
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

    // Calculate total cost from tasks and purchases
    let totalTaskCost = 0;
    if (event.tasks) {
        totalTaskCost = event.tasks.reduce(
            (sum, task) => sum + parseFloat(task.cost || 0),
            0
        );
    }

    // Calculate purchase costs
    let totalPurchaseCost = 0;
    const purchases = getPurchasesForEvent(event.id);
    if (purchases && purchases.length > 0) {
        totalPurchaseCost = purchases.reduce(
            (sum, purchase) => sum + parseFloat(purchase.cost || 0),
            0
        );
    }

    // Update total cost in summary (tasks + purchases)
    const totalEventCost = totalTaskCost + totalPurchaseCost;
    document.getElementById("costSummary").textContent = totalEventCost.toFixed(2);

    // Update tasks section
    document.getElementById("currentEventName").textContent = event.name;

    // Display tasks
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    const tasks = getTasksForEvent(event.id);
    if (tasks && tasks.length > 0) {
        tasks.forEach((task) => {
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

            // Add delete handler
            taskItem.querySelector('.delete-task').addEventListener('click', () => {
                deleteTaskFromEvent(event.id, task.id);
                // Reload events from localStorage to get the updated tasks
                events = getAllEvents();
                viewEventDetails();
                renderAllTasks();
            });

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

    // Setup guest form submission for this event
    setupGuestFormForEvent(event.id);

    // Show guest list
    showGuestList(event);

    // Update purchase section title
    if (purchaseEventName) {
        purchaseEventName.textContent = event.name;
    }

    // Setup purchase form for this event - NOW HANDLED HERE
    setupPurchaseFormListener(event.id);

    // Show purchases list
    showPurchaseList(event.id);

    // Show purchase section
    if (purchaseSection) {
        purchaseSection.classList.remove("hidden");
    }
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

        const newTask = {
            name: taskName,
            cost: parseFloat(taskCost),
            deadline: taskDeadline,
        };

        addTaskToEvent(eventId, newTask);

        // Reload events from localStorage to get the updated tasks
        events = getAllEvents();

        // Reset form
        newTaskForm.reset();

        // Refresh view
        viewEventDetails();
        renderAllTasks();
    });
}

// Render all tasks from all events
function renderAllTasks() {
    const events = getAllEvents();
    let allTasks = [];
    events.forEach(event => {
        if (event.tasks && event.tasks.length > 0) {
            event.tasks.forEach(task => {
                allTasks.push({ ...task, eventName: event.name, eventId: event.id });
            });
        }
    });
    allTasksList.innerHTML = "";
    if (allTasks.length === 0) {
        allTasksList.innerHTML = "<p>No tasks found.</p>";
        allTasksSection.classList.remove("hidden");
        return;
    }
    allTasks.forEach(task => {
        const taskDiv = document.createElement("div");
        taskDiv.className = "task-item";
        taskDiv.innerHTML = `
            <div class="task-details">
                <h3>${task.name}</h3>
                <p>Cost: $${task.cost}</p>
                <p>Deadline: ${new Date(task.deadline).toLocaleDateString()}</p>
                <p><em>Event: ${task.eventName}</em></p>
            </div>
            <div class="task-actions">
                <button class="delete-task" data-id="${task.id}" data-event-id="${task.eventId}">Delete</button>
            </div>
        `;
        // Add delete handler
        taskDiv.querySelector('.delete-task').addEventListener('click', () => {
            deleteTaskFromEvent(task.eventId, task.id);
            // Reload events from localStorage before updating UI
            events = getAllEvents();
            renderAllTasks();
            // Optionally refresh event details if visible
            if (!tasksSection.classList.contains('hidden') && currentEventId === task.eventId) {
                viewEventDetails();
            }
        });
        allTasksList.appendChild(taskDiv);
    });
    allTasksSection.classList.remove("hidden");
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

function setupGuestFormForEvent(eventId) {
    // Remove any existing listeners
    const newGuestForm = guestForm.cloneNode(true);
    guestForm.parentNode.replaceChild(newGuestForm, guestForm);

    // Add new listener
    newGuestForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("guestName").value;
        const email = document.getElementById("guestEmail").value;
        const phone = document.getElementById("guestPhone").value;
        const rsvp = document.getElementById("guestRSVP").value;

        // Create guest object
        const newGuest = {
            name: name,
            email: email,
            phone: phone,
            rsvp: rsvp,
        };

        // Add guest using the imported function
        addGuestToEvent(eventId, newGuest);

        // Reload events from localStorage
        events = getAllEvents();

        // Reset form
        newGuestForm.reset();

        // Refresh view directly
        viewEventDetails();
    });
}

function showGuestList(event) {
    guestEventName.textContent = event.name;
    guestSection.classList.remove("hidden");

    // Display guests
    guestList.innerHTML = "";

    // Get guests for the event using our new function
    const guests = getGuestsForEvent(event.id);

    if (guests && guests.length > 0) {
        guests.forEach((guest, index) => {
            const guestItem = document.createElement("div");
            guestItem.className = "guest-item";

            guestItem.innerHTML = `
        <div class="guest-details">
          <h3>${guest.name}</h3>
            <p>Email: ${guest.email}</p>
            <p>Phone: ${guest.phone}</p>
            <p>RSVP: 
              <select class="rsvp-select" data-guest-id="${guest.id}">
                <option value="yes" ${guest.rsvp === "yes" ? "selected" : ""}>Yes</option>
                <option value="no" ${guest.rsvp === "no" ? "selected" : ""}>No</option>
                <option value="maybe" ${guest.rsvp === "maybe" ? "selected" : ""}>Maybe</option>
                <option value="pending" ${guest.rsvp === "pending" ? "selected" : ""}>Pending</option>
                <option value="confirmed" ${guest.rsvp === "confirmed" ? "selected" : ""}>Confirmed</option>
                <option value="notComing" ${guest.rsvp === "notComing" ? "selected" : ""}>Not Coming</option>
              </select>
            </p>
        </div>
        <div class="guest-actions">
            <button class="delete-guest" data-id="${guest.id}">Delete</button>
        </div>
        `;

            guestList.appendChild(guestItem);
        });

        // Update RSVP on change - using our new update function
        guestList.querySelectorAll(".rsvp-select").forEach((select) => {
            select.addEventListener("change", (e) => {
                const guestId = e.target.getAttribute("data-guest-id");
                updateGuest(event.id, guestId, { rsvp: e.target.value });

                // Reload events from localStorage after update
                events = getAllEvents();
            });
        });

        // Add delete functionality for guests
        guestList.querySelectorAll(".delete-guest").forEach((button) => {
            button.addEventListener("click", (e) => {
                const guestId = e.target.getAttribute("data-id");
                if (confirm("Are you sure you want to remove this guest?")) {
                    deleteGuest(event.id, guestId);

                    // Reload events from localStorage
                    events = getAllEvents();

                    // Refresh the view
                    viewEventDetails();
                }
            });
        });
    } else {
        guestList.innerHTML = "<p>No guests added yet.</p>";
    }

    // Update count
    guestCount.textContent = guests ? guests.length : 0;
}

/**
 * Display purchases list for an event and add delete functionality
 * @param {string} eventId - ID of the event
 */
function showPurchaseList(eventId) {
    const purchaseList = document.getElementById("purchaseList");
    const totalPurchasesElement = document.getElementById("totalPurchases");

    if (!purchaseList || !totalPurchasesElement) return;

    // Clear the list
    purchaseList.innerHTML = "";

    // Get purchases for event
    const purchases = getPurchasesForEvent(eventId);

    // Calculate total purchase cost
    let totalPurchaseCost = 0;

    if (purchases && purchases.length > 0) {
        totalPurchaseCost = purchases.reduce(
            (sum, purchase) => sum + parseFloat(purchase.cost || 0),
            0
        );

        // Display each purchase
        purchases.forEach(purchase => {
            const purchaseItem = document.createElement("div");
            purchaseItem.className = "purchase-item";

            purchaseItem.innerHTML = `
                <div class="purchase-details">
                    <h3>${purchase.name}</h3>
                    <p>Cost: $${purchase.cost.toFixed(2)}</p>
                </div>
                <div class="purchase-actions">
                    <button class="delete-purchase" data-id="${purchase.id}">Delete</button>
                </div>
            `;

            // Add delete handler
            purchaseItem.querySelector('.delete-purchase').addEventListener('click', () => {
                if (confirm("Are you sure you want to delete this purchase?")) {
                    deletePurchase(eventId, purchase.id);

                    // Reload events and refresh view
                    events = getAllEvents();
                    viewEventDetails(); // Refresh the current event details view
                    renderAllPurchases(); // Also refresh the 'All Purchases' list
                }
            });

            purchaseList.appendChild(purchaseItem);
        });
    } else {
        purchaseList.innerHTML = "<p>No purchases added yet.</p>";
    }

    // Update total purchases display
    totalPurchasesElement.textContent = totalPurchaseCost.toFixed(2);
}

/**
 * Render all purchases from all events
 */
function renderAllPurchases() {
    if (!allPurchasesList) return;

    const events = getAllEvents();
    let allPurchases = [];
    let totalAllPurchasesCost = 0;

    // Collect all purchases from all events
    events.forEach(event => {
        if (event.purchases && event.purchases.length > 0) {
            event.purchases.forEach(purchase => {
                allPurchases.push({
                    ...purchase,
                    eventName: event.name,
                    eventId: event.id
                });
                totalAllPurchasesCost += parseFloat(purchase.cost || 0);
            });
        }
    });

    // Clear the list
    allPurchasesList.innerHTML = "";

    // Update total cost display
    const totalAllPurchasesElement = document.getElementById("totalAllPurchases");
    if (totalAllPurchasesElement) {
        totalAllPurchasesElement.textContent = totalAllPurchasesCost.toFixed(2);
    }

    // Display no purchases message if empty
    if (allPurchases.length === 0) {
        allPurchasesList.innerHTML = "<p>No purchases found across any events.</p>";
        allPurchasesSection.classList.remove("hidden");
        return;
    }

    // Sort purchases by cost (highest first)
    allPurchases.sort((a, b) => b.cost - a.cost);

    // Display each purchase with event context
    allPurchases.forEach(purchase => {
        const purchaseDiv = document.createElement("div");
        purchaseDiv.className = "purchase-item";

        purchaseDiv.innerHTML = `
            <div class="purchase-details">
                <h3>${purchase.name}</h3>
                <p>Cost: $${purchase.cost.toFixed(2)}</p>
                <p><em>Event: ${purchase.eventName}</em></p>
            </div>
            <div class="purchase-actions">
                <button class="delete-purchase" data-id="${purchase.id}" data-event-id="${purchase.eventId}">Delete</button>
            </div>
        `;

        // Add delete handler
        purchaseDiv.querySelector('.delete-purchase').addEventListener('click', () => {
            if (confirm("Are you sure you want to delete this purchase?")) {
                deletePurchase(purchase.eventId, purchase.id);

                // Reload events and refresh
                events = getAllEvents();
                renderAllPurchases();

                // Also refresh event details if visible
                if (!purchaseSection.classList.contains('hidden') && currentEventId === purchase.eventId) {
                    viewEventDetails();
                }
            }
        });

        allPurchasesList.appendChild(purchaseDiv);
    });

    // Show the all purchases section
    allPurchasesSection.classList.remove("hidden");
}

// NEW function to handle setting up the purchase form listener
function setupPurchaseFormListener(eventId) {
    const purchaseForm = document.getElementById("purchaseForm");
    if (!purchaseForm) return;

    // Remove any existing listeners to prevent duplicates
    const newPurchaseForm = purchaseForm.cloneNode(true);
    purchaseForm.parentNode.replaceChild(newPurchaseForm, purchaseForm);

    // Add new listener
    newPurchaseForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const purchaseName = document.getElementById("purchaseName").value;
        const purchaseCost = document.getElementById("purchaseCost").value;

        const newPurchase = {
            name: purchaseName,
            cost: parseFloat(purchaseCost),
        };

        // Add purchase using the imported function
        if (addPurchaseToEvent(eventId, newPurchase)) {
            // Reload events from localStorage
            events = getAllEvents();

            // Reset form
            newPurchaseForm.reset();

            // Refresh the event details view (which includes purchases)
            viewEventDetails();

            // Also refresh the 'All Purchases' list
            renderAllPurchases();
        } else {
            console.error("Failed to add purchase.");
            // Optionally show an error message to the user
        }
    });
}