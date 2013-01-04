///<reference path="../classes/Game.ts" />
///<reference path="../classes/Entity.ts" />
///<reference path="../components/IComponent.ts" />
///<reference path="../components/PhysicsComponent.ts" />

interface IPosition
{
    x: number;
    y: number;
}

class PositionComponent implements IComponent
{
    private _game: Game;
    private _entity: Entity;
    private _position: IPosition;
    name: string = Components.POSITION;

    constructor(game: Game, entity: Entity)
    {
        this._game = game;
        this._entity = entity;
        this._position = {
            x: 0,
            y: 0
        };
    }

    update(ticks: number): void
    {
        var physComp = <PhysicsComponent>this._entity.getComponent(Components.PHYSICS);

        if (physComp)
        {
            var velocity = physComp.getVelocity();
            this._position.x += velocity.x;
            this._position.y += velocity.y;
        }
    }

    initialize(settings: any): void
    {
        this._position = {
            x: settings.x,
            y: settings.y
        };
    }

    getPosition(): IPosition
    {
        return this._position;
    }

    setPosition(position: IPosition)
    {
        this._position = position;
    }
}