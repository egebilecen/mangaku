checkAppVersion();

var starter = setInterval(function(){

    if( APP_STATUS != null && APP_STATUS == true )
    {
        clearInterval(starter);

        /**
         * ADMOB
         * admob.hideBanner();
         * admob.cacheInterstitial(); //request
         * admob.showInterstitial(); //show
         */
        admob.initAdmob('ca-app-pub-3169633196689345/1006814510','ca-app-pub-3169633196689345/2483547717');//banner/gecis
        admob.cacheInterstitial();

        /**
         * EVENTS
         */
        document.addEventListener('backbutton',function(){
            if( MEMORY['lastPage'].length > 0 )
            {
                $('#app-main').html( MEMORY['lastPage'][ MEMORY['lastPage'].length - 1 ]['html'] );
                document.body.scrollTop = MEMORY['lastPage'][ MEMORY['lastPage'].length - 1 ]['scrollTop'];

                //en sondaki sayfayı artık kaldırıyoruz
                MEMORY['lastPage'].splice(-1,1);
            }
        });

        //init HTML
        document.title = SETTINGS.appName;
        document.body.style.padding = parseFloat($('div#header').css('height').replace('px'))+10+'px'+' 0';
        $('#app-title').html(SETTINGS.appName);
        $('#app-version').html('v'+SETTINGS.version);

        $('div#left-menu').css({
            width:'60%',
            height:window.innerHeight - parseFloat($('div#header').css('height').replace('px','')),
            top:$('div#header').css('height')
        });
        $('div#right-user-popup').css({
            top:parseFloat($('div#header').css('height').replace('px',''))+20
        });

        //init localstorage
        //BU KISIM ANDROID 4.4 VE 5.0'DA SIKINTI ÇIKARABILIR!
        if( !localStorage.getItem('userAutoLogin') ) localStorage.setItem('userAutoLogin','0');

        loadPage(); //anasayfayı yükle

        //otomatik giriş yap aktif ise yap
        if( localStorage.getItem('userAutoLogin') == 1 )
        {
            sendLoginRequest({
                username : localStorage.getItem('username').trim() || '',
                password : localStorage.getItem('password').trim() || '',
                alert    : false
            });
        }

        /**
         * Dosya Sistemi
         */
        defaultWriteData = '{"okunan_mangalar":{}}';
        getFile(SETTINGS.dataFile, 'app',function(){
            //success
            MEMORY.fileData.app = JSON.parse(MEMORY.fileData.app);
        },function(){
            //error
            createFile(SETTINGS.dataFile,function(){
                //success
                writeFile(SETTINGS.dataFile,defaultWriteData,'app',function(){
                    //success
                    MEMORY.fileData.app = JSON.parse(MEMORY.fileData.app);
                },function(){
                    //error
                    MEMORY.fileData.app = 'error';
                });
            },function(){ 
                //error
                MEMORY.fileData.app = 'error'; 
            });
        });
    }

},350);