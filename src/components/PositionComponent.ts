///<reference path="../classes/Game.ts" />
///<reference path="../classes/Entity.ts" />
///<reference path="../components/IComponent.ts" />

interface IPosition
{
    x: number;
    y: number;
}

class PositionComponent implements IComponent
{
    private _game: Game;
    private _entity: Entity;
    private _x: number;
    private _y: number;
    name: string = Components.POSITION;

    constructor(game: Game, entity: Entity)
    {
        this._game = game;
        this._entity = entity;
        this._x = 0;
        this._y = 0;
    }

    update(ticks: number): void
    {
    }

    initialize(settings: any): void
    {
        this._x = settings.x;
        this._y = settings.y;
    }

    getPosition(): IPosition
    {
        return { x: this._x, y: this._y };
    }
}