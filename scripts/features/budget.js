export function setupPurchaseForm(eventId) {
    const purchaseForm = document.getElementById("purchaseForm");

    // Remove any existing listeners
    const newPurchaseForm = purchaseForm.cloneNode(true);
    purchaseForm.parentNode.replaceChild(newPurchaseForm, purchaseForm);

    newPurchaseForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const purchaseName = document.getElementById("purchaseName").value;
        const purchaseCost = document.getElementById("purchaseCost").value;

        // Find the event
        const events = JSON.parse(localStorage.getItem("events")) || [];
        const eventIndex = events.findIndex((event) => event.id === eventId);
        if (eventIndex === -1) return;

        // Create new purchase
        const newPurchase = {
            id: Date.now().toString(),
            name: purchaseName,
            cost: parseFloat(purchaseCost),
        };

        // Add purchase to event
        if (!events[eventIndex].purchases) {
            events[eventIndex].purchases = [];
        }

        events[eventIndex].purchases.push(newPurchase);

        // Save to local storage
        localStorage.setItem("events", JSON.stringify(events));

        // Reset form
        newPurchaseForm.reset();

        // Dispatch a custom event instead of directly calling viewEventDetails
        document.dispatchEvent(new CustomEvent('purchase-added', { detail: { eventId } }));
    });
}
