/**
 * ~ JS Loader ~
 * @author Black Goblin
 * @version 1.0.0
 * Note: Set your HTML script tag id as 'game-loader'. (ex. <script id="game-loader">)
 */
var __XMASD = {
    basePath : 'js/', //your JS files' path
    scripts  : [ //scripts that gonna be installed (in-order)
        'settings.js',
        'func.js',
        'init.js'
    ]
};

document.addEventListener('deviceready', function(){
    for( var i in __XMASD.scripts )
    {
        var script = document.createElement('script');

        script.src    = __XMASD.basePath + __XMASD.scripts[i];
        script.async  = false;
        script.id     = 'app-file';
        document.body.appendChild(script);
    }

    document.querySelector('script#app-loader').remove();
});