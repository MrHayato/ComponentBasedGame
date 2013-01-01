///<reference path="../constants.ts" />

module Logger
{
    export var Levels = {
        TRACE: "Trace",
        WARNING: "Warning",
        ERROR: "Error"
    }       

    export function log(level: string, message: string)
    {
        if (!Constants.DEBUG)
            return;

        if (console && console.log)
            console.log(level + ": " + message);
    }

    export function warning(message: string)
    {
        log(Levels.WARNING, message);
    }

    export function error(message: string)
    {
        log(Levels.ERROR, message);
    }

    export function trace(message: string)
    {
        log(Levels.TRACE, message);
    }
}