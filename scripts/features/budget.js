export function setupPurchaseForm(eventId) {
    const purchaseForm = document.getElementById("purchaseForm");
    if (purchaseForm) {
        purchaseForm.reset(); // Reset form fields
        // Listener logic moved to app.js
    }
    // Store eventId potentially if needed, e.g., data attribute, but app.js already has it.
}

/**
 * Gets all purchases for an event
 * @param {string} eventId - ID of the event
 * @returns {Array} Array of purchases or empty array if none found
 */
export function getPurchasesForEvent(eventId) {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const event = events.find(event => event.id === eventId);
    return event && event.purchases ? event.purchases : [];
}

/**
 * Deletes a purchase from an event
 * @param {string} eventId - ID of the event containing the purchase
 * @param {string} purchaseId - ID of the purchase to delete
 * @returns {boolean} Whether the operation was successful
 */
export function deletePurchase(eventId, purchaseId) {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const eventIndex = events.findIndex(event => event.id === eventId);
    if (eventIndex === -1) return false;

    // Check if purchases array exists
    if (!events[eventIndex].purchases) return false;

    // Filter out the purchase
    events[eventIndex].purchases = events[eventIndex].purchases.filter(purchase => purchase.id !== purchaseId);

    // Save to local storage
    localStorage.setItem("events", JSON.stringify(events));

    return true;
}

/**
 * Adds a purchase to an event
 * @param {string} eventId - ID of the event
 * @param {Object} purchase - Purchase object with name and cost
 * @returns {boolean} Whether the operation was successful
 */
export function addPurchaseToEvent(eventId, purchase) {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const eventIndex = events.findIndex(event => event.id === eventId);
    if (eventIndex === -1) return false;

    // Initialize purchases array if it doesn't exist
    if (!events[eventIndex].purchases) {
        events[eventIndex].purchases = [];
    }

    // Add unique ID to purchase
    purchase.id = Date.now().toString();

    // Add purchase to event
    events[eventIndex].purchases.push(purchase);

    // Save to local storage
    localStorage.setItem("events", JSON.stringify(events));

    return true; // Return true on success
}
