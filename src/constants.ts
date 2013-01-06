///<reference path="definitions/jquery-1.8.d.ts" />

//filetypes
module FileTypes 
{
    export var UNKNOWN = "unknown";
    export var JSON = "json";
    export var IMAGE = "image";
    export var AUDIO = "audio";
}

module Constants
{
    var ie = (function(){
        var undef, v = 3, div = document.createElement('div');

        // the while loop is used without an associated block: {}
        // so, only the condition within the () is executed.

        // semicolons arent allowed within the condition,
        //   so a comma is used to stand in for one
        // basically allowing the two separate statements 
        //   to be evaluated sequentially.

        while (
            div.innerHTML = '<!--[if gt IE '+(++v)+']><i></i><![endif]-->',
            div.getElementsByTagName('i')[0]
        );

        // each time it's evaluated, v gets incremented and
        //   tossed into the DOM as a conditional comment
        // the i element is then a child of the div.

        // the return value of the getEBTN call is used as 
        //   the final condition expression
        // if there is an i element (the IE conditional
        //   succeeded), then getEBTN's return is truthy
        // and the loop continues until there is no 
        //   more i elements.

        // In other words:  ** MAGIC**

        return v > 4 ? v : undef;
    }());

    export var IS_IE = !!ie;

    //game
    export var DEBUG = true;
    export var DEFAULT_FPS = 60;
    export var VIEWPORT_WIDTH = 900;
    export var VIEWPORT_HEIGHT = 500;

    //entities
    export var FRICTION = 0.85;
    export var GRAVITY = 0.7;

    //player
    export var PLAYER_JUMP_HEIGHT = 10;
    export var PLAYER_WALK_SPEED_X = 1;
    export var PLAYER_WALK_SPEED_Y = 0.85;
    export var PLAYER_RUN_MULTIPLIER = 2.25;
    export var PLAYER_RUNNING_JUMP_MULTIPLIER = 1.25;
    export var PLAYER_LANDING_DELAY = 125;
}

//Components
module Components
{
    export var RENDER = "sprite";
    export var POSITION = "position";
    export var ANIMATION = "animation";
    export var AI_MOVEMENT = "ai_movement";
    export var INPUT_MOVEMENT = "input_movement";
    export var MOVEMENT_ANIMATION = "movement_animation";
    export var PHYSICS = "physics";
}
