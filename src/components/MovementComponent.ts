///<reference path="../classes/Game.ts" />
///<reference path="../classes/Entity.ts" />
///<reference path="../classes/Input.ts" />
///<reference path="../components/IComponent.ts" />
///<reference path="../components/PhysicsComponent.ts" />
///<reference path="../components/PositionComponent.ts" />
///<reference path="../components/AnimationComponent.ts" />

class MovementComponent implements IComponent
{
    private _game: Game;
    private _entity: Entity;
    private _flipped: bool;
    name: string = Components.MOVEMENT;

    constructor (game: Game, entity: Entity)
    {
        this._game = game;
        this._entity = entity;
        this._flipped = false;
    }

    update(ticks: number)
    {
        var physComp = <PhysicsComponent>this._entity.getComponent(Components.PHYSICS);
        var animComp = <AnimationComponent>this._entity.getComponent(Components.ANIMATION);
        var rendComp = <RenderComponent>this._entity.getComponent(Components.RENDER);
        var animation = "idle";

        var vx = 0;
        var vy = 0;

        if (Input.isKeyDown(Input.Keys.LEFT))
        {
            this._flipped = true;
            vx -= Constants.PLAYER_WALK_SPEED_X;
            animation = "walk";
        }
        if (Input.isKeyDown(Input.Keys.RIGHT))
        {
            this._flipped = false;
            vx += Constants.PLAYER_WALK_SPEED_X;
            animation = "walk";
        }
        if (Input.isKeyDown(Input.Keys.UP))
        {
            vy -= Constants.PLAYER_WALK_SPEED_Y;
            animation = "walk";
        }
        if (Input.isKeyDown(Input.Keys.DOWN))
        {
            vy += Constants.PLAYER_WALK_SPEED_Y;
            animation = "walk";
        }

        if (Input.isKeyDown(Input.Keys.SHIFT))
        {
            vx *= Constants.PLAYER_RUN_MULTIPLIER;
            vy *= Constants.PLAYER_RUN_MULTIPLIER;

            if (animation === "walk")
                animation = "run";
        }
        
        animComp.setAnimation(animation);
        physComp.setVelocity({ x: vx, y: vy });
        rendComp.setFlipped(this._flipped);
    }

    initialize(key: any)
    {
    }
}