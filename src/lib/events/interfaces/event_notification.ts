import EventType from "../enums/event_type";
import EventManager from "../event_manager";

interface EventNotification {
    type: EventType;
    dispatcher: EventManager;
    data?: never;
}

export default EventNotification;
