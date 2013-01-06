///<reference path="../classes/Game.ts" />
///<reference path="../classes/Entity.ts" />
///<reference path="../classes/Vector.ts" />
///<reference path="../components/IComponent.ts" />

class PhysicsComponent implements IComponent
{
    private _game: Game;
    private _entity: Entity;
    private _velocity: Vector;
    name: string = Components.PHYSICS;

    constructor(game: Game, entity: Entity)
    {
        this._game = game;
        this._entity = entity;
        this._velocity = new Vector(0, 0);
    }

    update(ticks: number): void
    {
    }

    initialize(settings: any): void
    {
        this._velocity.setVelocity(settings.x, settings.y);
    }

    getVelocity(): Vector
    {
        return this._velocity;
    }

    setVelocity(x: number, y: number)
    {
        this._velocity.setVelocity(x, y);
    }
}