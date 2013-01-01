///<reference path="classes/Game.ts" />

module App
{
    $(document).ready(function ()
    {
        var canvas = <HTMLCanvasElement>$("#gameCanvas")[0];
        Game.setCanvas(canvas);
        Game.start();
    });
}