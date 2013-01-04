///<reference path="../classes/Game.ts" />
///<reference path="../classes/Entity.ts" />
///<reference path="../components/IComponent.ts" />

interface IVelocity
{
    x: number;
    y: number;
}

class PhysicsComponent implements IComponent
{
    private _game: Game;
    private _entity: Entity;
    private _velocity: IVelocity;
    name: string = Components.PHYSICS;

    constructor(game: Game, entity: Entity)
    {
        this._game = game;
        this._entity = entity;
        this._velocity = {
            x: 0,
            y: 0
        };
    }

    update(ticks: number): void
    {
    }

    initialize(settings: any): void
    {
        this._velocity = {
            x: settings.x,
            y: settings.y
        };
    }

    getVelocity(): IPosition
    {
        return this._velocity;
    }

    setVelocity(velocity: IVelocity)
    {
        this._velocity = velocity;
    }
}