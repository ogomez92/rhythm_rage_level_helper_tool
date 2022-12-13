import EventNotification from "@lib/events/interfaces/event_notification";

interface EventSubscriber {
    onNotificationReceived(event: EventNotification): void
}

export default EventSubscriber;
