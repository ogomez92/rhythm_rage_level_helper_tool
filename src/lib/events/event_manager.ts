import EventType from "@lib/events/enums/event_type";
import EventSubscriber from "@lib/events/interfaces/event_subscriber";
import EventNotification from "@lib/events/interfaces/event_notification";

class EventManager {
    private listeners: Map<EventType, EventSubscriber[]> = new Map();

    public subscribe(type: EventType, subscriber: EventSubscriber) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }

        this.listeners.get(type).push(subscriber);
    }

    public unsubscribe(type: EventType, subscriber: EventSubscriber) {
        if (!this.listeners.has(type)) {
            return;
        }

        const index = this.listeners.get(type).indexOf(subscriber);
        if (index > -1) {
            this.listeners.get(type).splice(index, 1);
        }
    }

    public notify(type: EventType, data: never) {
        if (!this.listeners.has(type)) {
            return;
        }

        const formedNotification: EventNotification = {
            type,
            dispatcher: this,
            data
        }

        for (const subscriber of this.listeners.get(type)) {
            subscriber.onNotificationReceived(formedNotification);
        }

    }

    public unsubscribeAll = () => {
        this.listeners.forEach((value, key) => {
            this.listeners.delete(key);
        });
    }
}

export default EventManager;
