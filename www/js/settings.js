var SETTINGS = {
    appName : 'Mangaku',
    version : '1.1.1-re',
    creator : 'BGG',
    pageMainPath : 'pages/', // /android_asset/www/
    API : {
        url  : 'http://md.egebilecen.tk/api/api.php'
    },
    dataFile : 'app6.data',
    debug    : 0
}

var MEMORY = {
    mainpage : null,
    contact  : null,
    category : null,
    credit   : null,
    son_eklenen_manga_bolumleri : [],
    son_eklenen_mangalar : [],
    editor_tavsiye : [],
    user : null,
    lastPage : [],
    fileData : {
        app : "",
        temporary : ""
    }
}

//son dosya isleminin dondurdugu sonuc
var FILE_RETURN;

var showOptions = {
    mangaSearch:{
        limit: 5, //5 tane veri gösterilecek,
        startIndex : 0,
        data : null
    },
    categories:{
        limit: 5, //5 tane veri gösterilecek,
        startIndex : 0,
        data : null
    }
}

var CONNECTION_ERROR = false;
var APP_LOCK = {
    status : false,
    msg    : ''
}
var APP_STATUS = null;
var APP_LOADED = 0;