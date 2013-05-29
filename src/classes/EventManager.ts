///<reference path="Entity.ts" />

class EventMessage
{
    constructor(
        public source: Entity,
        public message: any)
    { }
}

class EventManager
{
    _events: { [eventName: string]: any[]; };

    constructor ()
    {
        this._events = {};
    }

    listen(eventName: string, callback: (message: EventMessage) => void, context: IComponent)
    {
        if (!this._events[eventName])
            this._events[eventName] = [];
        
        this._events[eventName].push(function ()
        {
            callback.apply(context, arguments);
        });
    }

    send(eventName: string, message: EventMessage)
    {
        if (!this._events[eventName]) {
            return;
        }

        for (var i = 0; i < this._events[eventName].length; i++)
        {
            this._events[eventName][i](message);
        }
    }
}