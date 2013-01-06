///<reference path="Entity.ts" />

interface ICallback
{
    callback: (message: EventMessage) => void;
    context?: IComponent;
}

class EventMessage
{
    constructor(
        public source: Entity,
        public message: any)
    { }
}

class EventManager
{
    _events: { [eventName: string]: ICallback[]; };

    constructor ()
    {
        this._events = {};
    }

    listen(eventName: string, callback: (message: EventMessage) => void, context: IComponent)
    {
        if (!this._events[eventName])
            this._events[eventName] = [];
        
        var cb: ICallback = {
            callback: callback,
            context: context
        }
        this._events[eventName].push(cb);
    }

    send(eventName: string, message: EventMessage)
    {
        if (!this._events[eventName])
            Logger.warning("No '" + eventName + "' events found.");

        for (var i = 0; i < this._events[eventName].length; i++)
        {
            var cb = this._events[eventName][i];
            cb.callback.call(cb.context, message);
        }
    }
}