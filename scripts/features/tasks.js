// Add a task to a specific event/project by eventId
export function addTaskToEvent(eventId, task) {
    let events = JSON.parse(localStorage.getItem("events")) || [];
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return false;
    if (!events[eventIndex].tasks) {
        events[eventIndex].tasks = [];
    }
    // Assign a unique id to the task if not present
    if (!task.id) {
        task.id = Date.now().toString();
    }
    events[eventIndex].tasks.push(task);
    localStorage.setItem("events", JSON.stringify(events));
    return true;
}

// Optionally, get all tasks for an event
export function getTasksForEvent(eventId) {
    let events = JSON.parse(localStorage.getItem("events")) || [];
    const event = events.find(e => e.id === eventId);
    return event && event.tasks ? event.tasks : [];
}

// Optionally, delete a task from an event
export function deleteTaskFromEvent(eventId, taskId) {
    let events = JSON.parse(localStorage.getItem("events")) || [];
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return false;
    events[eventIndex].tasks = (events[eventIndex].tasks || []).filter(t => t.id !== taskId);
    localStorage.setItem("events", JSON.stringify(events));
    return true;
}
