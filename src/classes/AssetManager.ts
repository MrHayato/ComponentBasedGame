///<reference path="Logger.ts" />
///<reference path="../definitions/jquery-1.8.d.ts" />
///<reference path="../constants.ts" />

declare var Audio;

class AssetManager
{
    private _assets: any;

    loading: any;
    loaded: any;

    constructor ()
    {
        this._assets = {};
        this.loading = {};
        this.loaded = {};
    }

    get(key: string): HTMLCanvasElement
    {
        if (this._assets[key])
        {
            return this._assets[key];
        }
        else
        {
            Logger.error("Asset Key not found: " + key);
            return undefined;
        }
    }

    getFileType(file: string)
    {
        var filename = file.toLowerCase();

        if (filename.indexOf(".json") >= 0)
            return FileTypes.JSON;
        else if (filename.indexOf(".png") >= 0)
            return FileTypes.IMAGE;
        else if (filename.indexOf(".mp3") >= 0)
            return FileTypes.AUDIO;
        else
            return FileTypes.UNKNOWN;
    }

    loadAsset(file: string, key: string, callback: (asset: any) => void)
    {
        var fileType = this.getFileType(file);
        var self = this;

        this.loading[key] = true;
        this.loaded[key] = false;

        switch (fileType)
        {
            case FileTypes.IMAGE:
                var image = new Image();
                image.onload = function () { 
                    self.processImage(key, image);
                    if ($.isFunction(callback))
                        callback(image);
                };
                image.onerror = this.assetError;
                image.src = file;
                break;
            case FileTypes.AUDIO:
                var audio = new Audio();
                audio.addEventListener("canplay", function () { 
                    self.processAudio(key, audio);
                    if ($.isFunction(callback))
                        callback(audio);
                }, false);
                audio.addEventListener("error", this.assetError, false);
                audio.src = file;
                audio.load();
                break;
        }
    }

    loadJSON(file: string, callback: (asset: any) => void )
    {
        var self = this;

        $.ajax({
            url: file,
            dataType: "json",
            success: function (data)
            {
                //Load all assets in the json file
                if (data && data.assets)
                {
                    var assetsLoaded = 0;
                    var onAssetLoaded = function() {
                        assetsLoaded++;

                        if (assetsLoaded >= data.assets.length && $.isFunction(callback))
                        {
                            callback(data);
                        }
                    };

                    for (var i = 0; i < data.assets.length; i++)
                    {
                        var asset = data.assets[i];
                        self.loadAsset(asset.src, asset.key, onAssetLoaded);
                    }
                }
            }
        });
    }
    
    processImage(key: string, asset: any)
    {
        this.loading[key] = false;
        this.loaded[key] = true;

        var canvas = <HTMLCanvasElement>document.createElement("canvas");
        canvas.width = asset.width;
        canvas.height = asset.height;
        var context = canvas.getContext("2d");
        context.drawImage(asset, 0, 0, asset.width, asset.height);
        this._assets[key] = canvas;
    }

    processAudio(key: string, asset: any)
    {
        this.loading[key] = false;
        this.loaded[key] = true;

        asset.removeEventListener("canplay", this.processAudio, false);
        this._assets[key] = asset;
    }

    assetError()
    {
        Logger.error("Oh Noes! The file failed to load!");
    }
}