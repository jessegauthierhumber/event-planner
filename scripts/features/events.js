// Store events in local storage
let events = JSON.parse(localStorage.getItem("events")) || [];

/**
 * Handles event form submission for creating or updating an event
 * @param {Event} e - Form submission event
 * @param {string|null} currentEventId - ID of event being edited, or null for new event
 * @returns {Array} Updated events array
 */
export function handleEventFormSubmit(e, currentEventId) {
    e.preventDefault();

    const eventName = document.getElementById("eventName").value;
    const eventDate = document.getElementById("eventDate").value;
    const eventLocation = document.getElementById("eventLocation").value;
    const eventDescription = document.getElementById("eventDescription").value;
    const budget = document.getElementById("budget").value;

    if (currentEventId) {
        // Update existing event
        const eventIndex = events.findIndex(
            (event) => event.id === currentEventId
        );
        if (eventIndex !== -1) {
            events[eventIndex] = {
                ...events[eventIndex],
                name: eventName,
                date: eventDate,
                location: eventLocation,
                description: eventDescription,
                budget: parseFloat(budget),
            };
        }
    } else {
        // Create new event
        const newEvent = {
            id: Date.now().toString(),
            name: eventName,
            date: eventDate,
            location: eventLocation,
            description: eventDescription,
            budget: parseFloat(budget),
            tasks: [],
        };

        events.push(newEvent);
    }

    // Save to local storage
    localStorage.setItem("events", JSON.stringify(events));

    // Return updated events
    return events;
}

/**
 * Resets the event form fields
 */
export function resetEventForm() {
    const eventForm = document.getElementById("eventForm");
    eventForm.reset();
    document.getElementById("eventName").value = "";
    document.getElementById("eventDate").value = "";
    document.getElementById("eventLocation").value = "";
    document.getElementById("eventDescription").value = "";
    document.getElementById("budget").value = "";
}

/**
 * Deletes an event by ID
 * @param {string} eventId - ID of event to delete
 * @returns {boolean} Whether deletion was confirmed
 */
export function deleteEvent(eventId) {
    if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
        // Remove event from array
        events = events.filter((event) => event.id !== eventId);

        // Save to local storage
        localStorage.setItem("events", JSON.stringify(events));

        return true;
    }
    return false;
}

/**
 * Gets event data for editing
 * @param {string} eventId - ID of event to edit
 * @returns {Object|undefined} Event object if found
 */
export function getEventForEdit(eventId) {
    return events.find((e) => e.id === eventId);
}

/**
 * Gets all events
 * @returns {Array} All events
 */
export function getAllEvents() {
    return JSON.parse(localStorage.getItem("events")) || [];
}

/**
 * Gets an event by ID
 * @param {string} eventId - ID of event to get
 * @returns {Object|undefined} Event object if found
 */
export function getEventById(eventId) {
    return events.find((e) => e.id === eventId);
}