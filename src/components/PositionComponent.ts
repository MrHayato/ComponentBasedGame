///<reference path="../classes/Game.ts" />
///<reference path="../classes/Entity.ts" />
///<reference path="../classes/Point.ts" />
///<reference path="../components/IComponent.ts" />
///<reference path="../components/PhysicsComponent.ts" />

class PositionComponent implements IComponent
{
    private _game: Game;
    private _entity: Entity;
    private _position: Point;
    name: string = Components.POSITION;
    facing: Number;

    constructor(game: Game, entity: Entity)
    {
        this._game = game;
        this._entity = entity;
        this._position = new Point(0, 0);
        this.facing = 1;
    }

    update(ticks: number): void
    {
        var physComp = <PhysicsComponent>this._entity.getComponent(Components.PHYSICS);

        if (physComp)
        {
            var velocity = physComp.getVelocity();
            this._position.x += velocity.x;
            this._position.y += velocity.y;

            if (this._entity.id === 0)
                this._game.eventManager.send("entity_moved", new EventMessage(this._entity, this._position));
        }
    }

    initialize(settings: any): void
    {
        this._position = new Point(settings.x, settings.y);
    }

    getPosition(): Point
    {
        return this._position;
    }

    setPosition(position: Point)
    {
        this._position = position;
    }

    setFacing(direction: Number)
    {
        if (direction < 0) {
            this.facing = -1;
        } else if (direction > 0) {
            this.facing = 1;
        }
    }
}