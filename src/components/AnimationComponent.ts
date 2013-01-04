///<reference path="../classes/Game.ts" />
///<reference path="../classes/Entity.ts" />
///<reference path="../components/IComponent.ts" />
///<reference path="../components/PositionComponent.ts" />

interface IAnimation
{
    loop: bool;
    duration: number;
    frames: HTMLCanvasElement[];
    onComplete?: () => void;
}

class AnimationComponent implements IComponent
{
    private _game: Game;
    private _entity: Entity;
    private _animations: { [key: string]: IAnimation; };
    private _currentAnimation: IAnimation;
    private _currentFrame: number;
    private _frameStartTime: number;
    name: string = Components.ANIMATION;

    constructor(game: Game, entity: Entity)
    {
        this._game = game;
        this._entity = entity;
    }

    update(ticks: number)
    {
        var anim = this._currentAnimation;

        if (!anim)
            return;

        if (ticks - this._frameStartTime > anim.duration)
        {
            this._frameStartTime = ticks;
            this._currentFrame++;

            if (this._currentFrame >= anim.frames.length)
            {
                if (anim.loop)
                {
                    this._currentFrame = 0;
                }
                else if (anim.onComplete)
                {
                    anim.onComplete();
                }
            }
        }
    }

    initialize(animationFrames: any)
    {
        var sprite = this.getSprite();
        var spriteSize = this.getSpriteDimensions(sprite);
        var frameWidth: number = animationFrames.width;
        var frameHeight: number = animationFrames.height;
        var cols = Math.floor(spriteSize[0] / frameWidth);
        var rows = Math.floor(spriteSize[1] / frameHeight);
        this._animations = {};

        for (var frameKey in animationFrames.frames)
        {
            var frame = animationFrames.frames[frameKey];
            var name: string = frameKey;
            var indexes: number[] = frame.indexes;
            var loop: bool = frame.loop;
            var duration: number = frame.duration;
            var frames: HTMLCanvasElement[] = [];

            if (indexes.length !== 2)
            {
                Logger.error("Invalid indexes for '" + name + "' animation specified.");
                continue;
            }

            for (var idx = indexes[0]; idx <= indexes[1]; idx++)
            {
                var row = Math.floor(idx / cols);
                var col = idx % cols;

                var animationFrame = this.cropImage(
                    sprite,
                    col * frameWidth,
                    row * frameHeight,
                    frameWidth,
                    frameHeight);

                frames.push(animationFrame);
            }

            var animation = {
                loop: loop,
                duration: duration,
                frames: frames
            };

            this._animations[name] = animation;
        }

        if (animationFrames.startAnimation)
        {
            this.setAnimation(animationFrames.startAnimation);
        }
    }

    private getSprite(): HTMLCanvasElement
    {
        var renderComponent: RenderComponent = <RenderComponent>this._entity.getComponent(Components.RENDER);
        return renderComponent.getSprite();
    }

    private getSpriteDimensions(sprite: HTMLCanvasElement)
    {
        var spriteWidth: number = sprite.width;
        var spriteHeight: number = sprite.height;

        return [spriteWidth, spriteHeight];
    }

    private cropImage(sprite: HTMLCanvasElement, x: number, y: number, width: number, height: number): HTMLCanvasElement
    {
        var crop = <HTMLCanvasElement>document.createElement("canvas");
        crop.width = width;
        crop.height = height;

        var ctx = crop.getContext("2d");
        ctx.drawImage(sprite, x, y, width, height, 0, 0, crop.width, crop.height);

        return crop;
    }

    getFrame(): HTMLCanvasElement
    {
        if (this._currentFrame >= this._currentAnimation.frames.length)
            this._currentFrame = this._currentAnimation.frames.length - 1;
        return this._currentAnimation.frames[this._currentFrame];
    }

    setAnimation(animationName: string, onAnimationComplete?: () => void)
    {
        var animation: IAnimation = this._animations[animationName];
        if (!animation)
        {
            Logger.error("Animation '" + animationName + "' not found.");
            return;
        }

        if (onAnimationComplete)
            animation.onComplete = onAnimationComplete;
        else
            animation.onComplete = undefined;

        this._currentAnimation = animation;
        this._currentFrame = 0;
        this._frameStartTime = this._game.timer.currentTime();
    }
}