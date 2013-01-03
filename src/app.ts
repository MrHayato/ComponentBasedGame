///<reference path="classes/Game.ts" />
///<reference path="definitions/jquery-1.8.d.ts" />

module App
{
    $(document).ready(function ()
    {
        var canvas = <HTMLCanvasElement>$("#gameCanvas")[0];
        var game = new Game(canvas);
        game.start();
    });
}