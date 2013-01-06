///<reference path="../classes/Game.ts" />
///<reference path="../classes/Entity.ts" />
///<reference path="../classes/Input.ts" />
///<reference path="../components/IComponent.ts" />
///<reference path="../components/PhysicsComponent.ts" />

class InputMovementComponent implements IComponent
{
    private _game: Game;
    private _entity: Entity;
    name: string = Components.INPUT_MOVEMENT;

    constructor (game: Game, entity: Entity)
    {
        this._game = game;
        this._entity = entity;
    }

    update(ticks: number)
    {
        var physComp = <PhysicsComponent>this._entity.getComponent(Components.PHYSICS);
        
        var vx = 0;
        var vy = 0;

        if (Input.isKeyDown(Input.Keys.LEFT))
        {
            vx -= Constants.PLAYER_WALK_SPEED_X;
        }
        if (Input.isKeyDown(Input.Keys.RIGHT))
        {
            vx += Constants.PLAYER_WALK_SPEED_X;
        }
        if (Input.isKeyDown(Input.Keys.UP))
        {
            vy -= Constants.PLAYER_WALK_SPEED_Y;
        }
        if (Input.isKeyDown(Input.Keys.DOWN))
        {
            vy += Constants.PLAYER_WALK_SPEED_Y;
        }

        if (Input.isKeyDown(Input.Keys.SHIFT))
        {
            vx *= Constants.PLAYER_RUN_MULTIPLIER;
            vy *= Constants.PLAYER_RUN_MULTIPLIER;
        }
        
        physComp.setVelocity(vx, vy);
    }

    initialize(key: any)
    {
    }
}