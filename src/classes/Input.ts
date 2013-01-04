///<reference path="../constants.ts" />
module Input
{
    export module Keys
    {
        export interface IKey
        {
            keyCode: number;
            keyName: string;
        };

        var _keyLookup = {};

        export var LEFT: IKey = addKey(37, "left");
        export var RIGHT: IKey = addKey(39, "right");
        export var UP: IKey = addKey(38, "up");
        export var DOWN: IKey = addKey(40, "down");
        export var SHIFT: IKey = addKey(16, "shift");
        export var BACKSPACE: IKey = addKey(8, "backspace");
        export var TAB: IKey = addKey(9, "tab");
        export var ENTER: IKey = addKey(13, "enter");
        export var CTRL: IKey = addKey(17, "ctrl");
        export var ALT: IKey = addKey(18, "alt");
        export var PAUSE: IKey = addKey(19, "pause");
        export var CAPSLOCK: IKey = addKey(20, "capslock");
        export var ESCAPE: IKey = addKey(27, "esc");
        export var SPACE: IKey = addKey(32, "space");
        export var PAGEUP: IKey = addKey(33, "pageup");
        export var PAGEDOWN: IKey = addKey(34, "pagedown");
        export var END: IKey = addKey(35, "end");
        export var HOME: IKey = addKey(36, "home");
        export var INSERT: IKey = addKey(45, "insert");
        export var DELETE: IKey = addKey(46, "delete");

        export var SELECT_KEY: IKey = addKey(93, "selectkey");
        export var MULTIPLY: IKey = addKey(106, "multiply");
        export var ADD: IKey = addKey(107, "add");
        export var SUBTRACT: IKey = addKey(109, "subtract");
        export var DECIMAL: IKey = addKey(110, "decimalpoint");
        export var DIVIDE: IKey = addKey(111, "divide");
        export var NUMLOCK: IKey = addKey(144, "numlock");
        export var SCROLLLOCK: IKey = addKey(145, "scrollock");
        export var SEMICOLON: IKey = addKey(186, "semicolon");
        export var EQUALS: IKey = addKey(187, "equalsign");
        export var COMMA: IKey = addKey(188, "comma");
        export var DASH: IKey = addKey(189, "dash");
        export var PERIOD: IKey = addKey(190, "period");
        export var FORWARD_SLASH: IKey = addKey(191, "forwardslash");
        export var GRAVE_ACCENT: IKey = addKey(192, "graveaccent");
        export var OPEN_BRACKET: IKey = addKey(219, "openbracket");
        export var BACK_SLASH: IKey = addKey(220, "backslash");
        export var CLOSE_BRACKET: IKey = addKey(221, "closebracket");
        export var SINGLE_QUOTE: IKey = addKey(222, "singlequote");

        export var A: IKey = addKey(65, "a");
        export var B: IKey = addKey(66, "b");
        export var C: IKey = addKey(67, "c");
        export var D: IKey = addKey(68, "d");
        export var E: IKey = addKey(69, "e");
        export var F: IKey = addKey(70, "f");
        export var G: IKey = addKey(71, "g");
        export var H: IKey = addKey(72, "h");
        export var I: IKey = addKey(73, "i");
        export var J: IKey = addKey(74, "j");
        export var K: IKey = addKey(75, "k");
        export var L: IKey = addKey(76, "l");
        export var M: IKey = addKey(77, "m");
        export var N: IKey = addKey(78, "n");
        export var O: IKey = addKey(79, "o");
        export var P: IKey = addKey(80, "p");
        export var Q: IKey = addKey(81, "q");
        export var R: IKey = addKey(82, "r");
        export var S: IKey = addKey(83, "s");
        export var T: IKey = addKey(84, "t");
        export var U: IKey = addKey(85, "u");
        export var V: IKey = addKey(86, "v");
        export var W: IKey = addKey(87, "w");
        export var X: IKey = addKey(88, "x");
        export var Y: IKey = addKey(89, "y");
        export var Z: IKey = addKey(90, "z");
        export var _0: IKey = addKey(48, "0");
        export var _1: IKey = addKey(49, "1");
        export var _2: IKey = addKey(50, "2");
        export var _3: IKey = addKey(51, "3");
        export var _4: IKey = addKey(52, "4");
        export var _5: IKey = addKey(53, "5");
        export var _6: IKey = addKey(54, "6");
        export var _7: IKey = addKey(55, "7");
        export var _8: IKey = addKey(56, "8");
        export var _9: IKey = addKey(57, "9");
        export var NUMPAD0: IKey = addKey(96, "numpad0");
        export var NUMPAD1: IKey = addKey(97, "numpad1");
        export var NUMPAD2: IKey = addKey(98, "numpad2");
        export var NUMPAD3: IKey = addKey(99, "numpad3");
        export var NUMPAD4: IKey = addKey(100, "numpad4");
        export var NUMPAD5: IKey = addKey(101, "numpad5");
        export var NUMPAD6: IKey = addKey(102, "numpad6");
        export var NUMPAD7: IKey = addKey(103, "numpad7");
        export var NUMPAD8: IKey = addKey(104, "numpad8");
        export var NUMPAD9: IKey = addKey(105, "numpad9");

        function addKey(keyCode: number, keyName: string): IKey
        {
            var key = {
                keyCode: keyCode,
                keyName: keyName
            };
            _keyLookup[keyCode] = key;
            return key;
        }

        export function getKey(keyCode: number)
        {
            return _keyLookup[keyCode];
        }
    }

    export module Mouse
    {
        export interface IButton
        {
            buttonCode: number;
            buttonName: string;
        };
        
        var _buttonLookup = {};

        export var MOUSE_LEFT = addButton((Constants.IS_IE ? 1 : 0), "mouse_left");
        export var MOUSE_MIDDLE = addButton((Constants.IS_IE ? 4 : 1), "mouse_middle");
        export var MOUSE_RIGHT = addButton(2, "mouse_right");

        function addButton(buttonCode: number, buttonName: string): IButton
        {
            var button = {
                buttonCode: buttonCode,
                buttonName: buttonName
            };
            _buttonLookup[buttonCode] = button;
            return button;
        }

        export function getButton(buttonCode: number)
        {
            return _buttonLookup[buttonCode];
        }
    }

    var _pressedKeys = {};
    var _preventKeys: number[] = [];
    var _keyUpHandlers: { [keyCode: string]: (key?: Keys.IKey) => void; } = {};
    var _keyDownHandlers: { [keyCode: string]: (key?: Keys.IKey) => void; } = {};
    var _mouseUpHandlers: { [buttonCode: string]: (button?: Mouse.IButton) => void; } = {};
    var _mouseDownHandlers: { [buttonCode: string]: (button?: Mouse.IButton) => void; } = {};

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown, false);
    window.addEventListener("mouseup", handleMouseUp, false);
    window.addEventListener("blur", handleBlur, false);

    // this turns off the right click context menu which screws up the mouseup event for button 2
    document.oncontextmenu = function () { return false; };

    function preventDefault(keys: Keys.IKey[])
    {
        keys.forEach(function (key)
        {
            _preventKeys.push(key.keyCode);
        });
    }

    function allowDefault(keys: Keys.IKey[])
    {
        keys.forEach(function (key)
        {
            var idx = _preventKeys.indexOf(key.keyCode);
            _preventKeys.splice(idx, 1);
        });
    }

    function handleBlur(e)
    {
        _pressedKeys = {};
    }

    function handleKeyUp(e)
    {
        e = e || window.event;
        var key = Keys.getKey(e.keyCode);
        if (!key) return;
        _pressedKeys[key.keyCode] = false;
        if (_keyUpHandlers[key.keyCode])
            _keyUpHandlers[key.keyCode](key);
        if (_preventKeys[key.keyCode] && e.preventDefault)
            e.preventDefault();
    }

    function handleKeyDown(e)
    {
        e = e || window.event;
        var key = Keys.getKey(e.keyCode);
        if (!key) return;
        _pressedKeys[key.keyCode] = true;
        if (_keyDownHandlers[key.keyCode])
            _keyDownHandlers[key.keyCode](key);
        if (_preventKeys[key.keyCode] && e.preventDefault)
            e.preventDefault();
    }

    function handleMouseUp(e)
    {
        e = e || window.event;
        var button = Mouse.getButton(e.button);
        if (!button) return;
        _pressedKeys[button.buttonCode] = false;
        if (_mouseUpHandlers[button.buttonCode])
            _mouseUpHandlers[button.buttonCode](button);
    }
    
    function handleMouseDown(e)
    {
        e = e || window.event;
        var button = Mouse.getButton(e.button);
        if (!button) return;
        _pressedKeys[button.buttonCode] = false;
        if (_mouseDownHandlers[button.buttonCode])
            _mouseDownHandlers[button.buttonCode](button);
    }

    export function isKeyDown(key: Keys.IKey): bool
    {
        return !!_pressedKeys[key.keyCode];
    }

    export function onKeyDown(key: Keys.IKey, callback: (key?: Keys.IKey) => void )
    {
        _keyDownHandlers[key.keyName] = callback;
    }
    
    export function onKeyUp(key: Keys.IKey, callback: (key?: Keys.IKey) => void )
    {
        _keyUpHandlers[key.keyName] = callback;
    }

    export function onButtonDown(button: Mouse.IButton, callback: (button?: Mouse.IButton) => void )
    {
        _mouseDownHandlers[button.buttonName] = callback;
    }
    
    export function onButtonUp(button: Mouse.IButton, callback: (button?: Mouse.IButton) => void )
    {
        _mouseUpHandlers[button.buttonName] = callback;
    }
}
