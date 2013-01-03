///<reference path="../constants.ts" />

interface ITimerSettings
{
    fps?: number;
    tick: () => any;
}

class Timer
{
    _settings: ITimerSettings;
    _timer: number;
    _fps: number;
    _interval: number;
    _initialTime: number;

    constructor (settings: ITimerSettings)
    {
        this._settings = settings;
        this._timer = null;
        this._fps = settings.fps || Constants.DEFAULT_FPS;
        this._interval = Math.floor(1000 / this._fps);
        this._initialTime = null;
    }

    tick()
    {
        var self = this;
        this._settings.tick();
        this._initialTime += this._interval;

        this._timer = setTimeout(
            function () { self.tick() },
            this._initialTime - new Date().getTime()
        );
    }

    start()
    {
        if (this._timer === null)
        {
            this._initialTime = new Date().getTime();
            this.tick();
        }
    }

    stop()
    {
        clearTimeout(this._timer);
        this._timer = null;
    }

    currentTime()
    {
        return this._initialTime;
    }
}