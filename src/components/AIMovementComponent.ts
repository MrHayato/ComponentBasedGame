///<reference path="../classes/Game.ts" />
///<reference path="../classes/Entity.ts" />
///<reference path="../classes/Input.ts" />
///<reference path="../components/IComponent.ts" />
///<reference path="../components/PhysicsComponent.ts" />

class AIMovementComponent implements IComponent
{
    private _game: Game;
    private _entity: Entity;
    private _target: Point;
    private _speed: number;
    name: string = Components.AI_MOVEMENT;

    constructor (game: Game, entity: Entity)
    {
        this._game = game;
        this._entity = entity;
        this._target = null;
        
        this._game.eventManager.listen("entity_moved", this.entityMoved, this);
    }

    update(ticks: number)
    {
        var physComp = <PhysicsComponent>this._entity.getComponent(Components.PHYSICS);
        var vx = 0;
        var vy = 0;

        if (this._target !== null)
        {
            var position = (<PositionComponent>this._entity.getComponent(Components.POSITION)).getPosition();

            if (Math.abs(position.distanceTo(this._target)) <= 150)
            {
                //Move in the direction of the target
                var dir = new Vector(this._target.x - position.x, this._target.y - position.y);
                dir.setLength(this._speed);
                vx = dir.x;
                vy = dir.y;
            }
        }

        physComp.setVelocity(vx, vy);
    }

    entityMoved(message: EventMessage)
    {
        var location = <Point>message.message;
        this._target = location;
    }

    initialize(key: any)
    {
        this._speed = key.speed;
    }
}