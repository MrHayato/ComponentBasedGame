///<reference path="../classes/Game.ts" />
///<reference path="../classes/Entity.ts" />
///<reference path="../classes/Input.ts" />
///<reference path="../components/IComponent.ts" />
///<reference path="../components/PhysicsComponent.ts" />
///<reference path="../components/PositionComponent.ts" />
///<reference path="../components/AnimationComponent.ts" />

class MovementAnimationComponent implements IComponent
{
    private _game: Game;
    private _entity: Entity;
    private _flipped: bool;
    name: string = Components.MOVEMENT_ANIMATION;

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
        var velocity = physComp.getVelocity();
        var animation = "idle";
        
        if (Math.abs(velocity.x) >= Constants.PLAYER_WALK_SPEED_X * Constants.PLAYER_RUN_MULTIPLIER ||
            Math.abs(velocity.y) >= Constants.PLAYER_WALK_SPEED_Y * Constants.PLAYER_RUN_MULTIPLIER)
        {
            animation = "run";
        }
        else if (Math.abs(velocity.x) > 0 || Math.abs(velocity.y) > 0)
        {
            animation = "walk";
        }

        if (velocity.x < 0)
            this._flipped = true;
        else if (velocity.x > 0)
            this._flipped = false;

        animComp.setAnimation(animation);
        rendComp.setFlipped(this._flipped);
    }

    initialize(key: any)
    {
    }
}