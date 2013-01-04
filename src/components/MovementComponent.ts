///<reference path="../classes/Game.ts" />
///<reference path="../classes/Entity.ts" />
///<reference path="../components/IComponent.ts" />
///<reference path="../components/PositionComponent.ts" />
///<reference path="../components/AnimationComponent.ts" />

class MovementComponent implements IComponent
{
    private _game: Game;
    private _entity: Entity;
    name: string = Components.MOVEMENT;

    constructor(game: Game, entity: Entity)
    {
        this._game = game;
        this._entity = entity;
    }

    update(ticks: number)
    {
        var posComp = <PositionComponent>this._entity.getComponent(Components.POSITION);
        var animComp = <AnimationComponent>this._entity.getComponent(Components.ANIMATION);
    }

    initialize(key: any)
    {
    }
}