function toggleMenu(){
    var menu   = $('div#left-menu');
    var status = menu.attr('status');

    switch( parseFloat(status) )
    {
        case 0: //kapalı
            menu.css({left:'0'});
            menu.attr('status','1');
            admob.hideBanner();
        break;

        case 1: //açık
            menu.css({left:'-999px'});
            menu.attr('status','0');
            admob.showBanner(admob.BannerSize.BANNER,admob.Position.BOTTOM_APP);
        break;
    }
}

function loadPage( where ){
    admob.showBanner(admob.BannerSize.BANNER,admob.Position.BOTTOM_APP);
    if( APP_LOADED == 1 )
        saveLastPage();

    if( APP_LOCK.status == true )
    {
        if( APP_LOCK.msg.trim() )
            alert( APP_LOCK.msg );
        return false;
    }
        
    if( APP_LOADED == 0 )
    {
        APP_LOADED = 1;
        setAppLock(true,'Uygulama yükleniyor. Lütfen bekleyiniz!');
    }

    if( typeof where == "undefined" ) where = null;

    var main = $('div#app-main');
    document.body.scrollTop = 0;

    switch(where)
    {
        default: //load anasayfa

            if( !MEMORY.mainpage ) //önceden hafızaya alınmadı ise
            {

                CONNECTION_ERROR = false;
                $('#app-main').hide();
                $('div#loading').fadeIn(350);
                $.ajax({
                    url  : SETTINGS.pageMainPath + 'main.html',
                    type : 'get',
                    success : function(data){
                        var check_count = 3;
                        var counter = 0;

                        $.ajax({ //son eklenen bolumler
                            url  : SETTINGS.API.url,
                            type : 'post',
                            data : {
                                'md_request':true,
                                'md_son_eklenen_bolumler':true
                            },
                            success : function(_data){
                                _data = JSON.parse(_data);

                                for( var i=0; i < _data.data.length; i++ )
                                {
                                    var pushdata = _data.data[i];
                                    MEMORY.son_eklenen_manga_bolumleri.push(pushdata);
                                }
                                counter++;
                            },
                            error : function(){
                                if( !CONNECTION_ERROR )
                                    writeMain('Sunucuya bağlanırken hata oluştu. (Hata no: 323)');
                                CONNECTION_ERROR = true;
                            }
                        });

                        $.ajax({ //son eklenen mangalar
                            url  : SETTINGS.API.url,
                            type : 'post',
                            data : {
                                'md_request':true,
                                'md_son_eklenen_mangalar':true
                            },
                            success : function(_data){
                                _data = JSON.parse(_data);

                                for( var i=0; i < _data.data.length; i++ )
                                {
                                    var pushdata = _data.data[i];
                                    MEMORY.son_eklenen_mangalar.push(pushdata);
                                }

                                counter++;
                            },
                            error : function(){
                                if( !CONNECTION_ERROR )
                                    writeMain('Sunucuya bağlanırken hata oluştu. (Hata no: 324)');
                                CONNECTION_ERROR = true;
                            }
                        });

                        $.ajax({ //editorlerin tavsiyeleri
                            url  : SETTINGS.API.url,
                            type : 'post',
                            data : {
                                'md_request':true,
                                'md_editor_tavsiye':true
                            },
                            success : function(_data){
                                _data = JSON.parse(_data);
                                for( var i=0; i < _data.data.length; i++ )
                                {
                                    var pushdata = _data.data[i];
                                    MEMORY.editor_tavsiye.push(pushdata);
                                }

                                counter++;
                            },
                            error : function(){
                                if( !CONNECTION_ERROR )
                                    writeMain('Sunucuya bağlanırken hata oluştu. (Hata no: 325)');
                                CONNECTION_ERROR = true;
                            }
                        });

                        var interval = setInterval(function(){
                            if( counter == check_count )
                            {
                                delay(function(){ //BU KISIM ANDROID 4.4 VE 5.0'DA SIKINTI ÇIKARABILIR!
                                    main.html(data);

                                    //son eklenen manga bolumleri
                                    if( MEMORY.son_eklenen_manga_bolumleri.length > 0 ) //veri varsa
                                    {
                                        for( var i=0; i < MEMORY.son_eklenen_manga_bolumleri.length; i++ )
                                        {
                                            var _data = MEMORY.son_eklenen_manga_bolumleri[i];
                                            
                                            var dom = '<div id="item" db-id="'+_data['manga_manga_listesi_id']+'" img-list="'+_data['manga_bolum_img_list']+'" target-id="'+i+'"><img src="'+_data['manga_bolum_img']+'" alt="" id="manga-kapak"></div><script>$(\'div.manga-show#son-eklenen-bolumler > div#item[target-id="'+i+'"]\').on(\'click\',function(){ showMangaRead({ad:"'+_data['manga_ad']+'",bolum:"'+_data['manga_bolum_no']+'",img_list:this.getAttribute(\'img-list\'),db_id:this.getAttribute(\'db-id\')}); });</script>';
                                            $('div.manga-show#son-eklenen-bolumler').append(dom);
                                        }
                                    }
                                    else //veri yoksa
                                    {
                                        var dom = '<span class="block f-align-center">En son hiç manga bölümü eklenmemiş.</span>';
                                        $('div.manga-show#son-eklenen-bolumler').append(dom);
                                    }

                                    //son eklenen mangalar
                                    if( MEMORY.son_eklenen_mangalar.length > 0 ) //veri varsa
                                    {
                                        for( var i=0; i < MEMORY.son_eklenen_mangalar.length; i++ )
                                        {
                                            var _data = MEMORY.son_eklenen_mangalar[i];
                                            var dom = '<div id="item" target-id="'+i+'" db-id="'+_data['manga_listesi_id']+'" db-img="'+_data['manga_listesi_img']+'" db-title="'+_data['manga_listesi_ad']+'" db-kategori="'+_data['manga_listesi_tags']+'" db-aciklama="'+_data['manga_listesi_aciklama'].split('"').join("'")+'"><img src="'+_data['manga_listesi_img']+'" alt="" id="manga-kapak"></div><script>$(\'div.manga-show#son-eklenen-mangalar > div#item[target-id="'+i+'"]\').on(\'click\',function(){ mangaInfoView(this); });</script>';
                                            
                                            $('div.manga-show#son-eklenen-mangalar').append(dom);
                                        }
                                    }
                                    else //veri yoksa
                                    {
                                        var dom = '<span class="block f-align-center">En son hiç manga eklenmemiş.</span>';
                                        $('div.manga-show#son-eklenen-mangalar').append(dom);
                                    }

                                    //editor tavsiyeleri
                                    if( MEMORY.editor_tavsiye.length > 0 )
                                    {
                                        for( var i=0; i < MEMORY.editor_tavsiye.length; i++ )
                                        {
                                            var _data = MEMORY.editor_tavsiye[i];

                                            var dom = '<div id="item" target-id="'+i+'" db-id="'+_data['manga_listesi_id']+'" db-img="'+_data['manga_listesi_img']+'" db-title="'+_data['manga_listesi_ad']+'" db-kategori="'+_data['manga_listesi_tags']+'" db-aciklama="'+_data['manga_listesi_aciklama'].split('"').join("'")+'"><img src="'+_data['manga_listesi_img']+'" alt="" id="manga-kapak"></div><script>$(\'div.manga-show#editor-tavsiye > div#item[target-id="'+i+'"]\').on(\'click\',function(){ mangaInfoView(this); });</script>';
                                            $('div.manga-show#editor-tavsiye').append(dom);
                                        }
                                    }
                                    else
                                    {
                                        var dom = '<span class="block f-align-center">Henüz bir editör tavsiyesi eklenmemiş.</span>';
                                        $('div.manga-show#editor-tavsiye').append(dom);
                                    }

                                    //hafizaya yukle sayfanin son halini
                                    MEMORY.mainpage = $('div#app-main').html();

                                    $('div#app-main > * img').hide().after('<span class="block f-align-center" style="margin-bottom:30px;color:#888;"><img src="img/loading.gif" style="margin:0 auto;" class="block">Resim Yükleniyor..</span>').error(function(){
                                        this.src = 'img/no-img.png';
                                    }).load(function(){
                                        $(this).fadeIn(350).next().remove();
                                    });

                                    $('div#loading').fadeOut();
                                    main.fadeIn(500);
                                }, 500);

                                clearInterval(interval);
                                setAppLock(false);
                                getNews(); //duyurulari çek
                            }
                        },500);
                    },
                    error   : function(){
                        if( !CONNECTION_ERROR )
                            writeMain('Bilinmeyen bir hata oluştu. (Hata no: 132)');
                        CONNECTION_ERROR = true;
                    }
                });
            }
            else
            {
                main.html(MEMORY.mainpage);

                $('div#app-main > * img').hide().after('<span class="block f-align-center" style="margin-bottom:30px;color:#888;"><img src="img/loading.gif" style="margin:0 auto;" class="block">Resim Yükleniyor..</span>').error(function(){
                    this.src = 'img/no-img.png';
                }).load(function(){
                    $(this).fadeIn(350).next().remove();
                });
            }

        break;

        case 'contact': //load iletisim

            if( !MEMORY.contact ) //önceden hafızaya alınmadı ise
            {
                $('#app-main').hide();
                $('div#loading').fadeIn(350);
                $.ajax({
                    url  : SETTINGS.pageMainPath + 'contact.html',
                    type : 'get',
                    success : function(data){
                        $('div#loading').fadeOut(500);
                        MEMORY.contact = data;

                        delay(function(){ //BU KISIM ANDROID 4.4 VE 5.0'DA SIKINTI ÇIKARABILIR!
                            main.html(data);
                            main.fadeIn(500);
                        }, 500);
                    },
                    error   : function(){
                        if( !CONNECTION_ERROR )
                            writeMain('Bilinmeyen bir hata oluştu. (Hata no: 211)');
                        CONNECTION_ERROR = true;
                    }
                });
            }
            else
            {
                main.html(MEMORY.contact);
            }

        break;

        case 'category':
            if( !MEMORY.category ) //önceden hafızaya alınmadı ise
            {
                $('#app-main').hide();
                $('div#loading').fadeIn(350);
                $.ajax({
                    url  : SETTINGS.pageMainPath + 'category.html',
                    type : 'get',
                    success : function(data){
                        $('div#loading').fadeOut(500);
                        MEMORY.category = data;

                        delay(function(){ //BU KISIM ANDROID 4.4 VE 5.0'DA SIKINTI ÇIKARABILIR!
                            main.html(data);
                            main.fadeIn(500);
                        }, 500);
                    },
                    error   : function(){
                    if( !CONNECTION_ERROR )
                        writeMain('Bilinmeyen bir hata oluştu. (Hata no: 203)');
                    CONNECTION_ERROR = true;
                    }
                });
            }
            else
            {
                main.html(MEMORY.category);
            }
        break;

        case 'credit':
            if( !MEMORY.credit ) //önceden hafızaya alınmadı ise
            {
                $('#app-main').hide();
                $('div#loading').fadeIn(350);
                $.ajax({
                    url  : SETTINGS.pageMainPath + 'credit.html',
                    type : 'get',
                    success : function(data){
                        $('div#loading').fadeOut(500);
                        MEMORY.credit = data;

                        delay(function(){ //BU KISIM ANDROID 4.4 VE 5.0'DA SIKINTI ÇIKARABILIR!
                            main.html(data);
                            main.fadeIn(500);
                        }, 500);
                    },
                    error   : function(){
                    if( !CONNECTION_ERROR )
                        writeMain('Bilinmeyen bir hata oluştu. (Hata no: 203)');
                    CONNECTION_ERROR = true;
                    }
                });
            }
            else
            {
                main.html(MEMORY.credit);
            }
        break;
    }
}

function sendRegisterRequest(){
    var username  = $('input[name=register_kadi]').val();
    var password  = $('input[name=register_sifre]').val();
    var password2 = $('input[name=register_sifre2]').val();
    var eposta    = $('input[name=register_eposta]').val();

    username  = username.trim();
    password  = password.trim();
    password2 = password2.trim();
    eposta    = eposta.trim();

    //denetlemeler
    if( !username || !password || !password2 || !eposta ) //herhangi bir yer bos birakildi ise
    {
        alert('Lütfen hiçbir yeri boş bırakmayınız!');
    }
    else
    {
        if( username.length < 3 || password.length < 3 ) //uzunluk kontrolu -> kadi,sifre
        {
            alert('Kullanıcı adı ve şifre en az 3 karakter olmak zorundadır!');
        }
        else
        {
            if( password != password2 ) //şifreler eşleşmiyor ise
            {
                alert('Lütfen şifrelerinizin eşleştiğinden emin olunuz!');
            }
            else
            {
                if( !validateEmail(eposta) ) //eposta adresi uygun mu kontrol et
                {   
                    alert('Lütfen geçerli bir eposta adresi giriniz!');
                }
                else
                {
                    //kayıt için api ile istek gönder
                    $.ajax({
                        url  : SETTINGS.API.url,
                        type : 'post',
                        data : {
                            'md_request' :'true',
                            'md_register':'true',
                            'data':{
                                'username' :username,
                                'password' :password,
                                'password2':password2,
                                'eposta'   :eposta
                            }
                        },
                        success : function(data){
                            data = JSON.parse(data); //BU KISIM ANDROID 4.4 VE 5.0'DA SIKINTI ÇIKARABILIR!
                            
                            if( data.code == 0 ) //hata
                                alert(data.msg);
                            else if( data.code == 1 ) //basari
                            {
                                alert(data.msg);

                                $('div#right-user-popup').fadeToggle(300); //popup menuyu gizle
                                
                                //inputlari temizle
                                $('input[name=register_kadi]').val('');
                                $('input[name=register_sifre]').val('');
                                $('input[name=register_sifre2]').val('');
                                $('input[name=register_eposta]').val('');
                            }
                        },
                        error   : function(){
                            alert('Kayıt olurken bir hata oluştu. (Hata no:912)');
                        }
                    });
                }
            }
        }
    }
}

var login_block = false;
function sendLoginRequest(obj){
    var username;
    var password;

    if( typeof obj == "undefined" ) obj = {}

    if( login_block == false )
    {
        if( typeof obj['username'] != "undefined" && typeof obj['password'] != "undefined" )
        {
            username = obj['username'];
            password = obj['password'];

            if( typeof obj['alert'] == "undefined" )  _alert = true;
            else if( obj['alert']   == true )         _alert = true;
            else if( obj['alert']   == false )        _alert = false

        }
        else
        {
            username = $('input[name=login_kadi]').val();
            password = $('input[name=login_sifre]').val();

            username = username.trim();
            password = password.trim();

            _alert = true;
        }

        if( !username || !password )
        {
            alert('Lütfen hiçbir yeri boş bırakmayınız!');
        }
        else
        {
            if( username.length < 3 || password.length < 3 )
            {
                alert('Kullanıcı adı ve şifre en az 3 karakter olmak zorundadır!');
            }
            else
            {
                login_block = true;
                $('div#login').hide().parent().append('<img id="loader" src="img/loading.gif" style="display:block;margin:0 auto;margin-top:60px;">');
                $.ajax({
                    url  : SETTINGS.API.url,
                    type : 'post',
                    data : {
                        'md_request' : true,
                        'md_login'   : true,
                        'data'       : {
                            'username':username,
                            'password':password
                        }
                    },
                    success : function(data){
                        login_block = false;
                        $('div#right-user-popup > #loader').remove();
                        $('div#right-user-popup > #login').show();
                        data = JSON.parse(data); //BU KISIM ANDROID 4.4 VE 5.0'DA SIKINTI ÇIKARABILIR!

                        if( data.code == 0 ) //hata
                        {
                            alert(data.msg);
                            $('#right-user-popup > div#login > #forgot-password').fadeIn(350);
                        }
                        else if( data.code == 1 ) //basari
                        {
                            if( _alert )
                                alert(data.msg);
                            
                            //okunacak listesi    -> okumak istenilen mangalar eklenecek
                            //manga_takip_listesi -> mangayı takip eder yani okuduğu manganın yeni bölümü gelirse bildirim gelir
                            var k_data = JSON.parse(data.data.kullanici_data);

                            //hafızaya al
                            MEMORY.user = data.data;
                            MEMORY.user.username = username;
                            MEMORY.user.password = password;
                            MEMORY.user.kullanici_data = k_data;

                            var dom = '<span class="block f-align-center" style="font-size:19px; margin-bottom:10px;">Merhaba, <span style="color:orangered;">'+username+'</span>.</span><button class="spe width-full" id="favoriler">Favori Mangalarım('+k_data['favori_mangalar'].length+')</button><button class="spe width-full" id="okunacak-listesi">Okunacak Mangalar('+k_data['okunacak_listesi'].length+')</button><button class="spe width-full" id="takip-listesi">Takip Ettiğim Mangalar('+k_data['manga_takip_listesi'].length+')</button><button class="spe width-full" id="ayarlar">Ayarlar</button>';
                            $('#right-user-popup').html(dom);

                            //////////
                            //EVENTS//
                            //////////

                            //favori mangalarım
                            $('div#right-user-popup > button#favoriler').on('click',function(){
                                $('div#right-user-popup').fadeOut(300);
                                //ekranı temizle
                                $('#app-main').html('<span class="block f-align-center m-bottom-10" style="font-size:26px;">Favori Mangalarım</span>');
                                
                                if( MEMORY['user']['kullanici_data']['favori_mangalar'].length > 0 )
                                {
                                    for( var i=0; i < MEMORY['user']['kullanici_data']['favori_mangalar'].length; i++ )
                                    {
                                        var id = MEMORY['user']['kullanici_data']['favori_mangalar'][i];

                                        $.ajax({
                                            url : SETTINGS.API.url,
                                            type : "post",
                                            data : {
                                                "md_request":true,
                                                "md_manga_search_id":true,
                                                "data":{
                                                    "id":id
                                                }
                                            },
                                            success:function(data){
                                                data = JSON.parse(data);
                                                
                                                var elem = data.data[0];
                                                if( !elem.manga_listesi_tags ) elem.manga_listesi_tags = 'Kategori eklenmemiş.';
                                                var dom = '<div class="manga-search"><div id="first"><img src="'+elem.manga_listesi_img+'" id="manga-img"><span id="title">'+elem.manga_listesi_ad+'</span><span class="block">Kategoriler: <span class="manga-data">'+elem.manga_listesi_tags+'</span></span></div><span id="content"><span class="block" style="margin-bottom:5px;">Hikaye:</span>'+elem.manga_listesi_aciklama+'</span><div id="zz"><button id="go" class="spe" db-id="'+elem.manga_listesi_id+'" db-img="'+elem.manga_listesi_img+'" db-title="'+elem.manga_listesi_ad+'" db-kategori="'+elem.manga_listesi_tags+'" db-aciklama="'+elem['manga_listesi_aciklama'].split('"').join("'")+'" onclick="mangaInfoView(this)">Görüntüle</button></div></div>';

                                                $('#app-main').append(dom);

                                                $('div#app-main > * img').hide().after('<span class="block f-align-center" style="margin-bottom:30px;color:#888;"><img src="img/loading.gif" style="margin:0 auto;" class="block">Resim Yükleniyor..</span>').error(function(){
                                                    this.src = 'img/no-img.png';
                                                }).load(function(){
                                                    $(this).fadeIn(350).next().remove();
                                                });
                                            },
                                            error : function(){
                                                if( !CONNECTION_ERROR )
                                                    alert('Bilinmeyen bir hata oluştu! (Hata no:199)');
                                                CONNECTION_ERROR = true;
                                            }
                                        });
                                    }
                                }
                                else
                                {
                                    $('#app-main').append('<span class="block f-align-center">Henüz favorilerinize bir manga eklememişsiniz.</span>');
                                }
                            });

                            //okunacak manga listesi
                            $('div#right-user-popup > button#okunacak-listesi').on('click',function(){
                                $('div#right-user-popup').fadeOut(300);
                                //ekranı temizle
                                $('#app-main').html('<span class="block f-align-center m-bottom-10" style="font-size:26px;">Okunacaklar Listesi</span>');
                                
                                if( MEMORY['user']['kullanici_data']['okunacak_listesi'].length > 0 )
                                {
                                    for( var i=0; i < MEMORY['user']['kullanici_data']['okunacak_listesi'].length; i++ )
                                    {
                                        var id = MEMORY['user']['kullanici_data']['okunacak_listesi'][i];

                                        $.ajax({
                                            url : SETTINGS.API.url,
                                            type : "post",
                                            data : {
                                                "md_request":true,
                                                "md_manga_search_id":true,
                                                "data":{
                                                    "id":id
                                                }
                                            },
                                            success:function(data){
                                                data = JSON.parse(data);
                                                
                                                var elem = data.data[0];
                                                if( !elem.manga_listesi_tags ) elem.manga_listesi_tags = 'Kategori eklenmemiş.';
                                                var dom = '<div class="manga-search"><div id="first"><img src="'+elem.manga_listesi_img+'" id="manga-img"><span id="title">'+elem.manga_listesi_ad+'</span><span class="block">Kategoriler: <span class="manga-data">'+elem.manga_listesi_tags+'</span></span></div><span id="content"><span class="block" style="margin-bottom:5px;">Hikaye:</span>'+elem.manga_listesi_aciklama+'</span><div id="zz"><button id="go" class="spe" db-id="'+elem.manga_listesi_id+'" db-img="'+elem.manga_listesi_img+'" db-title="'+elem.manga_listesi_ad+'" db-kategori="'+elem.manga_listesi_tags+'" db-aciklama="'+elem['manga_listesi_aciklama'].split('"').join("'")+'" onclick="mangaInfoView(this)">Görüntüle</button></div></div>';

                                                $('#app-main').append(dom);
                                                
                                                $('div#app-main > * img').hide().after('<span class="block f-align-center" style="margin-bottom:30px;color:#888;"><img src="img/loading.gif" style="margin:0 auto;" class="block">Resim Yükleniyor..</span>').error(function(){
                                                    this.src = 'img/no-img.png';
                                                }).load(function(){
                                                    $(this).fadeIn(350).next().remove();
                                                });
                                            },
                                            error : function(){
                                                if( !CONNECTION_ERROR )
                                                    alert('Bilinmeyen bir hata oluştu! (Hata no:299)');
                                                CONNECTION_ERROR = true;
                                            }
                                        });
                                    }
                                }
                                else
                                {
                                    $('#app-main').append('<span class="block f-align-center">Henüz okuma listesine bir manga eklememişsiniz.</span>');
                                }
                            });

                            //manga takip listesi
                            $('div#right-user-popup > button#takip-listesi').on('click',function(){
                                alert("Takip Listesi - YAKINDA");
                            });

                            $('#right-user-popup > button#ayarlar').on('click',function(){
                                $('div#right-user-popup').fadeOut(300);
                                delay(function(){
                                    //ekranı temizle
                                    $('#app-main').html('<span class="block f-align-center" style="font-size:26px;margin-bottom:10px;">Ayarlar</span>');

                                    var status = ( localStorage.getItem('userAutoLogin') == 0 ) ? 'Aç' : 'Kapat';
                                    var dom = '<span class="block" style="margin-bottom:8px;color:orangered;">Şifre Değişikliği:</span><div class="logged-show"><span class="block" style="margin-bottom:5px;">Yeni Şifre:</span><input type="password" name="sifre" class="spe no-margin" /><br/><span class="block" style="margin-bottom:5px;">Yeni Şifre<span style="color:#444;font-size:80%">(Tekrar)</span>:</span><input type="password" name="sifre2" class="spe no-margin" /><br/><button class="spe no-margin" id="pass-change">Değiştir</button></div><span class="block" style="margin-bottom:8px;color:orangered;">Otomatik Giriş Yap:</span><div class="logged-show"><button class="spe m-top-10 m-bottom-10" id="auto-login">'+ status +'</button><span class="block f-align-center" style="color:#444;">"Otomatik Giriş Yap" özelliğini açarsanız uygulama açıldığında otomatik hesabınıza giriş yaparsınız.</span></div><span class="block" style="margin-bottom:8px;color:orangered;">Okuma Verilerini Temizle:</span><div class="logged-show"><button class="spe m-top-10 m-bottom-10" id="readed-manga-clear">Temizle</button><span class="block f-align-center" style="color:#444;">Eğer bütün mangalardaki "Okundu" yazılarını temizlemek istiyorsanız doğru yerdesiniz.</span></div>';
                                    $('#app-main').append(dom);

                                    $('div.logged-show > button#readed-manga-clear').on('click',function(){
                                        var a = confirm('Okuma verilerini temizlemek istediğinizden emin misiniz?');

                                        if( a )
                                        {
                                            if( checkDataFile() )
                                            {
                                                clearFile(SETTINGS.dataFile,function(){
                                                    //success
                                                    MEMORY.fileData.app = defaultWriteData;
                                                    saveDataFile(SETTINGS.dataFile,'app',function(){
                                                        //success
                                                        alert('Okuma verileri başarıyla temizlendi!');
                                                    },function(){
                                                        //error
                                                        alert('Okuma verileri temizlenirken bir hata oluştu!(No:2)');
                                                    });
                                                },function(){
                                                    //error
                                                    alert('Okuma verileri temizlenirken bir hata oluştu!(No:1)');
                                                });
                                            }
                                        }
                                    });

                                    $('div.logged-show > button#pass-change').on('click',function(){
                                        var pass  = $('div.logged-show > input[name=sifre]').val();
                                        var pass2 = $('div.logged-show > input[name=sifre2]').val();

                                        pass  = pass.trim();
                                        pass2 = pass2.trim();

                                        if( !pass || !pass2 )
                                        {
                                            alert('Lütfen hiçbir yeri boş bırakmayınız!');
                                        }
                                        else
                                        {
                                            if( pass.length < 3 || pass2.length < 3 )
                                            {
                                                alert('Şifre uzunluğu en az 3 karakter olmalıdır!');
                                            }
                                            else
                                            {
                                                if( pass != pass2 )
                                                {
                                                    alert('Şifreleriniz uyuşmuyor!');
                                                }
                                                else
                                                {
                                                    $.ajax({
                                                        url  : SETTINGS.API.url,
                                                        type : 'post',
                                                        data : {
                                                            'md_request' : true,
                                                            'md_change_user_pw' : true,
                                                            'data':{
                                                                'k_id':parseInt( MEMORY['user']['kullanici_id'] ),
                                                                'pw'  : pass,
                                                                'pw2' : pass2
                                                            }
                                                        },
                                                        success : function( data ){
                                                            data = JSON.parse(data);

                                                            if( data.code == 1 )
                                                            {
                                                                alert('Şifre başarıyla güncellendi.');

                                                                $('div.logged-show > input[name=sifre]').val('');
                                                                $('div.logged-show > input[name=sifre2]').val('');

                                                                
                                                                if( localStorage.getItem('userAutoLogin') == 1 )
                                                                {
                                                                    localStorage.setItem('password',pass);
                                                                }
                                                            }
                                                            else if( data.code == 2 )
                                                                alert('Şifre güncellenirken bir hata oluştu! Lütfen DAHA SONRA tekrar deneyiniz, eğer aynı sorunu yaşamaya devam ediyorsanız bizimle iletişime geçiniz.');
                                                            else if( data.code == 0 )
                                                                alert(data.msg);
                                                        },
                                                        error  : function(){
                                                            if( !CONNECTION_ERROR )
                                                                alert('Bilinmeyen bir hata oluştu! (Hata no:198)');
                                                            CONNECTION_ERROR = true;
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    });

                                    $('div.logged-show > button#auto-login').on('click',function(){
                                        switch( parseInt(localStorage.getItem('userAutoLogin')) )
                                        {
                                            case 1: //kapat
                                                localStorage.setItem('userAutoLogin','0');
                                                localStorage.setItem('username','');
                                                localStorage.setItem('password','');

                                                this.innerHTML='Aç';

                                                alert('Otomatik giriş yapma özelliği kapatıldı!');
                                            break;

                                            case 0: //aç
                                                localStorage.setItem('userAutoLogin','1');
                                                localStorage.setItem('username',MEMORY.user.username);
                                                localStorage.setItem('password',MEMORY.user.password);

                                                this.innerHTML='Kapat';

                                                alert('Otomatik giriş yapma özelliği açıldı!');
                                            break;
                                        }
                                    });
                                },300);
                            });
                        }
                    },
                    error   : function(){
                        login_block = false;
                        $('div#right-user-popup > #loader').remove();
                        $('div#right-user-popup > #login').show();
                        if( _alert )
                            alert('Giriş yapılırken bir hata oluştu! (Hata no:251)');
                    }
                });
            }
        }
    }
    else
    {
        alert('İşleminiz devam etmektedir. Lütfen bekleyiniz!');
    }
}

var contact_block = false;
function sendContact(){
    if( contact_block == false )
    {
        var bolum  = $('select[name=bolum]').val();
        var baslik = $('input[name=baslik]').val();
        var icerik = $('textarea[name=icerik]').val();

        bolum  = bolum.trim();
        baslik = baslik.trim();
        icerik = icerik.trim();

        if( !bolum || !baslik || !icerik )
        {
            alert('Lütfen hiçbir yeri boş bırakmayınız!');
        }
        else
        {
            if( baslik.length < 10 && icerik.length < 10 )
            {
                alert('Başlık ve içerik en az 10 karakter olmalıdır!');
            }
            else
            {
                if( icerik.length > 500 )
                {  
                    alert('İçerik uzunluğu 500 karakterden fazla olamaz!');
                }
                else
                {
                    contact_block = true;
                    $('div#contact > button').html('<img id="loader" src="img/loading.gif" width="25" height="25">');
                    $.ajax({
                        url  : SETTINGS.API.url,
                        type : 'post',
                        data : { 
                            'md_request' : true,
                            'md_contact' : true,
                            'data'       : {
                                'bolum' :bolum,
                                'baslik':baslik,
                                'icerik':icerik
                            }
                        },
                        success : function(data){
                            contact_block = false;
                            $('div#contact > button').html('Gönder');
                            data = JSON.parse(data);

                            if( data.code == 0 )
                                alert(data.msg);
                            else
                            {
                                alert(data.msg);
                                
                                //inputlari temizle
                                $('select[name=bolum]').val('');
                                $('input[name=baslik]').val('');
                                $('textarea[name=icerik]').val('');
                            }
                        },
                        error   : function(){
                            contact_block = false;
                            $('div#contact > button').html('Gönder');

                            if( !CONNECTION_ERROR )
                                alert('Bilinmeyen bir hata olustu. (Hata no:837)');
                            CONNECTION_ERROR = true;
                        }
                    });
                }
            }
        }
    }
    else
    {
        alert('İşleminiz devam etmektedir. Lütfen bekleyiniz!');
    }
}

function getNews(){
    $.ajax({
        url  : SETTINGS.API.url,
        type : 'post',
        data : {
            'md_request'  : true,
            'md_duyurular': true
        },
        success : function(data){
            data = JSON.parse(data);
            
            if( data.code == 1 && data.data.duyuru_durum == 1 ) //duyuru var ve durumu aktif ise
            {
                showPopupMessage(data.data.duyuru_baslik, data.data.duyuru_icerik, data.data.duyuru_zaman);
            }
            else if( data.code == 2 ) //duruyu yapilmamis
            {
                //zz
            }
        },
        error   : function(){
            if( !CONNECTION_ERROR )
                    alert('Yeni duyurular sunucudan çekilirken bir hata oluştu. (Hata no:192)');
            CONNECTION_ERROR = true;
        }
    });
}

var search_block = false;
function mangaSearch(){
    if( APP_LOCK.status == true )
    {
        if( APP_LOCK.msg.trim() )
            alert( APP_LOCK.msg );
        return false;
    }

    if( search_block == false )
    {
        var text = $('input[name=manga_search]').val();
        text = text.trim();

        if( !text )
        {
            alert('Lütfen boş bırakmayınız!');
        }
        else
        {
            delay(function(){toggleMenu();$('input[name=manga_search]').val('');},250);
            $('div#app-main').html('<img src="img/loading.gif" class="block" style="margin:0 auto;">');
            search_block = true;
            $.ajax({
                url  : SETTINGS.API.url,
                type : 'post',
                data : {
                    'md_request'      : true,
                    'md_manga_search' : true,
                    'data' : {
                        'text' : text
                    }
                },
                success : function(data){
                    search_block = false;
                    data = JSON.parse(data);

                    //en son sayfalama indexini ve datayı sıfırla
                    showOptions.mangaSearch.startIndex = 0;
                    showOptions.mangaSearch.data = null;

                    //arama sayfasını goster
                    if( data.data.length > 0 ) //sonuc varsa
                    {
                        //datayı ata
                        showOptions.mangaSearch.data = data['data'];
                        
                        //sayfayı temizle
                        $('#app-main').html('<div id="data"><span class="block f-align-center" style="font-size:26px; margin-bottom:5px;">Manga Arama Sonuçları</span><span class="block f-align-center" style="font-size:18px; margin-bottom:10px;">(Toplam '+data['data'].length+' sonuç bulundu)</span></div>');
                        
                        //limite kadar olan ilk verileri göster
                        for( var i=showOptions.mangaSearch.startIndex; i < (showOptions.mangaSearch.startIndex+showOptions.mangaSearch.limit); i++ )
                        {
                            if( typeof data['data'][i] == 'undefined' ) break;
                            
                            var elem = data.data[i];
                            if( !elem.manga_listesi_tags ) elem.manga_listesi_tags = 'Kategori eklenmemiş.';
                            var dom = '<div class="manga-search"><div id="first"><img src="'+elem.manga_listesi_img+'" id="manga-img"><span id="title">'+elem.manga_listesi_ad+'</span><span class="block">Kategoriler: <span class="manga-data">'+elem.manga_listesi_tags+'</span></span></div><span id="content"><span class="block" style="margin-bottom:5px;">Hikaye:</span>'+elem.manga_listesi_aciklama+'</span><div id="zz"><button id="go" class="spe" db-id="'+elem.manga_listesi_id+'" db-img="'+elem.manga_listesi_img+'" db-title="'+elem.manga_listesi_ad+'" db-kategori="'+elem.manga_listesi_tags+'" db-aciklama="'+elem['manga_listesi_aciklama'].split('"').join("'")+'" onclick="mangaInfoView(this)">Görüntüle</button></div></div>';

                            $('#app-main > div#data').append(dom);

                            $('div#app-main > * img').hide().after('<span class="block f-align-center" style="margin-bottom:30px;color:#888;"><img src="img/loading.gif" style="margin:0 auto;" class="block">Resim Yükleniyor..</span>').error(function(){
                                this.src = 'img/no-img.png';
                            }).load(function(){
                                $(this).fadeIn(350).next().remove();
                            });
                        }
                        document.body.scrollTop = 0;

                        //eğer sonuç sayısı limitten fazla ise "devamını göster" butonunu aktif et
                        if( data['data'].length > showOptions.mangaSearch.limit )
                        {
                            //daha fazla yükle butonunu ekle sayfaya
                            $('#app-main').append('<button class="spe width-auto" id="d-g" onclick="showMore(\'manga-search\')">Devamını Göster</button>');
                        }
                    }
                    else //sonuç yoksa
                    {
                        var dom = '<span class="block f-align-center">Herhangi bir sonuç bulunamadı.</span>';
                        $('#app-main').html(dom);

                        document.body.scrollTop = 0;
                    }
                },
                error   : function(){
                    search_block = false;
                    alert('Arama yapılırken bir hata oluştu!');
                }
            });
        }
    }
    else
    {
        alert('İşleminiz devam etmektedir. Lütfen bekleyiniz!');
    }
}

function showMore(where){
    switch( where )
    {
        case 'manga-search':
            var lastP = document.body.scrollTop;
            showOptions.mangaSearch.startIndex = showOptions.mangaSearch.startIndex + showOptions.mangaSearch.limit;

            for( var i=showOptions.mangaSearch.startIndex; i < (showOptions.mangaSearch.startIndex+showOptions.mangaSearch.limit); i++ )
            {
                if( typeof showOptions.mangaSearch.data[i] == 'undefined' ) //artık hepsini gösterdi demekki
                { //o zaman butonu gizle ve döngüyü sonlandır
                    $('#app-main > button#d-g').hide();
                    break;
                }
                
                var elem = showOptions.mangaSearch.data[i];
                if( !elem.manga_listesi_tags ) elem.manga_listesi_tags = 'Kategori eklenmemiş.';
                var dom = '<div class="manga-search"><div id="first"><img src="'+elem.manga_listesi_img+'" id="manga-img"><span id="title">'+elem.manga_listesi_ad+'</span><span class="block">Kategoriler: <span class="manga-data">'+elem.manga_listesi_tags+'</span></span></div><span id="content"><span class="block" style="margin-bottom:5px;">Hikaye:</span>'+elem.manga_listesi_aciklama+'</span><div id="zz"><button id="go" class="spe" db-id="'+elem.manga_listesi_id+'" db-img="'+elem.manga_listesi_img+'" db-title="'+elem.manga_listesi_ad+'" db-kategori="'+elem.manga_listesi_tags+'" db-aciklama="'+elem['manga_listesi_aciklama'].split('"').join("'")+'" onclick="mangaInfoView(this)">Görüntüle</button></div></div>';

                $('#app-main > #data').append(dom);
            }

            document.body.scrollTop = lastP;

            if( showOptions.mangaSearch.startIndex + showOptions.mangaSearch.limit == showOptions.mangaSearch.data.length )
                $('#app-main > button#d-g').hide();
        break;

        case 'categories':
            var lastP = document.body.scrollTop;
            showOptions.categories.startIndex = showOptions.categories.startIndex + showOptions.categories.limit;

            for( var i=showOptions.categories.startIndex; i < (showOptions.categories.startIndex+showOptions.categories.limit); i++ )
            {
                if( typeof showOptions.categories.data[i] == 'undefined' ) //artık hepsini gösterdi demekki
                { //o zaman butonu gizle ve döngüyü sonlandır
                    $('#app-main > button#d-g').hide();
                    break;
                }
                
                var elem = showOptions.categories.data[i];
                var dom = '<div class="manga-search"><div id="first"><img src="'+elem.manga_listesi_img+'" id="manga-img"><span id="title">'+elem.manga_listesi_ad+'</span><span class="block">Kategoriler: <span class="manga-data">'+elem.manga_listesi_tags+'</span></span></div><span id="content"><span class="block" style="margin-bottom:5px;">Hikaye:</span>'+elem.manga_listesi_aciklama+'</span><div id="zz"><button id="go" class="spe" db-id="'+elem.manga_listesi_id+'" db-img="'+elem.manga_listesi_img+'" db-title="'+elem.manga_listesi_ad+'" db-toplam-bolum="'+elem.manga_listesi_eklenen_bolum+'" db-kategori="'+elem.manga_listesi_tags+'" onclick="mangaInfoView(this)">Görüntüle</button></div></div>';

                $('#app-main > div#data').append(dom);
            }
            document.body.scrollTop = lastP;

            if( showOptions.categories.startIndex + showOptions.categories.limit == showOptions.categories.data.length )
                $('#app-main > button#d-g').hide();
        break;
    }
}

function mangaInfoView( elem ){
    saveLastPage();

    if( APP_LOCK.status == true )
    {
        if( APP_LOCK.msg.trim() )
            alert( APP_LOCK.msg );
        return false;
    }

    toggleFullLoader();

    var manga_id    = parseInt(elem.getAttribute('db-id'));
    var manga_title = elem.getAttribute('db-title');
    var manga_img   = elem.getAttribute('db-img');
    var manga_toplam_bolum = elem.getAttribute('db-toplam-bolum');
    var manga_kategori     = elem.getAttribute('db-kategori');
    var manga_aciklama     = elem.getAttribute('db-aciklama');
    if( manga_kategori.trim() == "" ) manga_kategori = '-';

    $.ajax({
        url  : SETTINGS.API.url,
        type : 'post',
        data : {
            'md_request'   : true,
            'md_manga_info': true,
            'data':{
                'manga_id':manga_id
            }
        },
        success : function(data){
            toggleFullLoader();
            delay(function(){ //BU KISIM ANDROID 4.4 VE 5.0'DA SIKINTI ÇIKARABILIR!
                data = JSON.parse(data);
                var question_favori = ( MEMORY['user'] && MEMORY['user']['kullanici_data']['favori_mangalar'].indexOf(manga_id) == -1 ) ? 'Favorilere eklemek istediğinizden emin misiniz?' : 'Favorilerden çıkartmak istediğinize emin misiniz?';
                var question_okuma  = ( MEMORY['user'] && MEMORY['user']['kullanici_data']['okunacak_listesi'].indexOf(manga_id) == -1 ) ? 'Okuma listesine eklemek istediğinizden emin misiniz?' : 'Okuma listesinden çıkartmak istediğinize emin misiniz?';
                var lyr = ( MEMORY.user ) ? 'var area = this.getAttribute(\'target-text\'); switch( area ){ case \'favoriler\': var _qw = confirm("'+question_favori+'"); if( _qw == true ){$.ajax({url:SETTINGS.API.url,type:\'post\',data:{\'md_request\':true,\'md_kullanici_data_change\':true,\'data\':{\'section\':this.getAttribute(\'target-text\'),\'id\':\''+manga_id+'\',\'k_id\':\''+MEMORY.user.kullanici_id+'\'}},success:function(data){data=JSON.parse(data);if( data.code == 1 && data.data.eklendi == true){ alert(\'Favorilere başarıyla eklendi.\'); MEMORY["user"]["kullanici_data"]["favori_mangalar"].push('+manga_id+'); }else if( data.code == 1 && data.data.eklendi == false ){ alert(\'Favorilerden başarıyla çıkartıldı.\'); MEMORY["user"]["kullanici_data"]["favori_mangalar"].splice(MEMORY["user"]["kullanici_data"]["favori_mangalar"].indexOf('+manga_id+'), 1); }else if( data.code == 2 ){alert(\'İşlem sırasında bir hata oluştu! (Hata no:111)\');}},error:function(){alert(\'Bilinmeyen bir hata oluştu!(Hatano:777)\');}});} break; case \'okuma-listesi\': var _qw = confirm("'+question_okuma+'"); if(_qw == true){$.ajax({url:SETTINGS.API.url,type:\'post\',data:{\'md_request\':true,\'md_kullanici_data_change\':true,\'data\':{\'section\':this.getAttribute(\'target-text\'),\'id\':\''+manga_id+'\',\'k_id\':\''+MEMORY.user.kullanici_id+'\'}},success:function(data){data=JSON.parse(data);if( data.code == 1 && data.data.eklendi == true){ alert(\'Okuma listesine başarıyla eklendi.\'); MEMORY["user"]["kullanici_data"]["okunacak_listesi"].push('+manga_id+'); }else if( data.code == 1 && data.data.eklendi == false ){ alert(\'Okuma listesinden başarıyla çıkartıldı.\'); MEMORY["user"]["kullanici_data"]["okunacak_listesi"].splice(MEMORY["user"]["kullanici_data"]["okunacak_listesi"].indexOf('+manga_id+'), 1); }else if( data.code == 2 ){alert(\'İşlem sırasında bir hata oluştu! (Hata no:112)\');}},error:function(){alert(\'Bilinmeyen bir hata oluştu!(Hatano:778)\');}});}  break; case \'takip-listesi\': alert(\'Takip Listesi - YAKINDA\'); break; }' : 'alert(\'Bu işlemi gerçekleştirmek için giriş yapmalısınız! Giriş yaptıktan sonra buraya tekrar giriniz.\');';

                var dom = '<div class="manga-search" id="manga-info"><div id="first"><img src="'+manga_img+'" id="manga-img"><span id="title">'+manga_title+'</span><span class="block">Eklenen Bölüm Sayısı: <span class="manga-data">'+data.data.length+'</span></span><span class="block">Kategoriler: <span class="manga-data">'+manga_kategori+'</span></span></div><span id="content"><span class="block" style="margin-bottom:5px;">Hikaye:</span>'+manga_aciklama+'</span><div id="tools"><img id="ind" src="img/search-engine.png" target-text="bolum-ara"><img id="ind" src="img/hearts.png" target-text="favoriler"><img id="ind" src="img/bookshelf.png" target-text="okuma-listesi"><img id="ind" src="img/garbage.png" target-text="okuma-verilerini-temizle"><img id="ind" src="img/visibility.png" target-text="takip-listesi"></div><ul id="ep-list"></ul></div><script>$(\'div.manga-search#manga-info > div#tools > img\').on(\'click\',function(){ if(this.getAttribute("target-text") != "bolum-ara" && this.getAttribute("target-text") != "okuma-verilerini-temizle")'+lyr+' });$("div.manga-search#manga-info > div#tools > img[target-text=\'bolum-ara\']").on("click",function(){var p = prompt("Hangi bölümü aramak istiyorsunuz?"); if(p){p=p.trim();} if(p){ var t_ep = document.querySelector(\'ul#ep-list > li[episode="\'+p+\'"]\'); if(!t_ep){alert("Aradığınız bölüm bulunamadı! Lütfen doğru bir bölüm girdiğinizden emin olunuz.");}else{var off = t_ep.offsetTop-50; document.body.scrollTop = off; t_ep.style.color="orangered"; } }});$("div.manga-search#manga-info > div#tools > img[target-text=\'okuma-verilerini-temizle\']\").on("click",function(e){var a = confirm("Okuma verilerini temizlemek istediğinizden emin misiniz?");if(a){var manga_id = '+manga_id+';if(checkDataFile()){if(typeof MEMORY.fileData.app.okunan_mangalar[manga_id]!="undefined"&&Array.isArray(MEMORY.fileData.app.okunan_mangalar[manga_id])){delete MEMORY.fileData.app.okunan_mangalar[manga_id];var packet=JSON.stringify(MEMORY.fileData.app);clearFile(SETTINGS.dataFile,function(){writeFile(SETTINGS.dataFile,packet,"app",function(){MEMORY.fileData.app=JSON.parse(MEMORY.fileData.app);alert("Okuma verileri başarıyla temizlendi!");},function(){alert("Okuma verileri temizlenirken bir hata oluştu!(No:2)");});},function(){alert("Okuma verileri temizlenirken bir hata oluştu!(No:1)");MEMORY.fileData.app="error";});}}else{alert(SETTINGS.dataFile+" dosyası bulunamadı.");}}});</script>'; 

                $('#app-main').html(dom); 
                document.body.scrollTop = 0;

                $('div.manga-search#manga-info > div#first > img')
                .hide()
                .after('<span class="block f-align-center" style="margin-bottom:30px;color:#888;"><img src="img/loading.gif" style="margin:0 auto;" class="block">Resim Yükleniyor..</span>')
                .error(function(){
                    this.src = 'img/no-img.png';
                }).load(function(){
                    $(this).fadeIn(350).next().remove();
                });

                if( data['data'].length > 0 ) //bolum var ise
                {
                    for( var i=0; i < data['data'].length; i++ )
                    {
                        var res   = data.data[i];
                        
                        var style = (i+1 == data['data'].length) ? 'border-bottom:2px solid black;' : '';
                        var dob   = '<li db-id="'+manga_id+'" img-list="'+res['manga_bolum_img_list']+'" style="position:relative;'+style+'" target-id="'+i+'" episode="'+res['manga_bolum_no']+'">Bölüm - '+res['manga_bolum_no']+'</li>';
                        var dobik = '<script>$(\'div.manga-search#manga-info > ul#ep-list > li[target-id="'+i+'"]\').on(\'click\',function(){ showMangaRead({ad:"'+manga_title+'",bolum:"'+res['manga_bolum_no']+'",img_list:this.getAttribute(\'img-list\'),db_id:this.getAttribute(\'db-id\')}); });</script>'; 

                        $('div.manga-search#manga-info > ul#ep-list').append(dob);
                        $('div.manga-search#manga-info').append(dobik);

                        //okunmuş mu kontrol et
                        if( checkDataFile() && Array.isArray(MEMORY.fileData.app.okunan_mangalar[manga_id]) && MEMORY.fileData.app.okunan_mangalar[manga_id].length > 0 )
                        {
                            if( MEMORY.fileData.app.okunan_mangalar[manga_id].indexOf(String(res['manga_bolum_no'])) != -1 ) //okunmuş demek
                            {
                                $('li[episode="'+res['manga_bolum_no']+'"]').append('<span style="position:absolute;right:5px;top:12px;font-size:16px;color:#444;" id="okundu">Okundu</span>');
                            }
                        }
                    }
                }
                else
                {
                    $('div.manga-search#manga-info').append('<span class="block f-align-center">Henüz bölüm eklenmemiş.</span>');
                }
            },350);
        },
        error : function(){
            toggleFullLoader();
            if( !CONNECTION_ERROR )
                alert('Bilinmeyen bir hata oluştu. (Hata no:177)');
            CONNECTION_ERROR = true;
        }
    });
}
var a_block = false;
function showMangaRead( obj ){
    saveLastPage();
    
    if( APP_LOCK.status == true )
    {
        if( APP_LOCK.msg.trim() )
            alert( APP_LOCK.msg );
        return false;
    }

    admob.hideBanner();
    admob.showInterstitial();
    delay(function(){ admob.cacheInterstitial(); },2000);

    //bu bölümü artık okundu olarak kayıt et
    if( checkDataFile() )//data varsa
    {
        if( typeof MEMORY.fileData.app.okunan_mangalar[obj.db_id] == 'undefined' || !Array.isArray(MEMORY.fileData.app.okunan_mangalar[obj.db_id]) )
        {
            MEMORY.fileData.app.okunan_mangalar[obj.db_id] = [];
            MEMORY.fileData.app.okunan_mangalar[obj.db_id].push(String(obj.bolum));
        }
        else
        {
            //önceden okundu listesine eklenmedi ise ekleyelim
            if( MEMORY.fileData.app.okunan_mangalar[obj.db_id].indexOf(String(obj.bolum)) == -1 )
                MEMORY.fileData.app.okunan_mangalar[obj.db_id].push(String(obj.bolum));
        }

        saveDataFile(undefined,undefined,function(){
            if( typeof MEMORY.fileData.app != 'object' )
                MEMORY.fileData.app = JSON.parse(MEMORY.fileData.app);
        });
    }

    delay(function(){ //BU KISIM ANDROID 4.4 VE 5.0'DA SIKINTI ÇIKARABILIR!
        //sayfayı temizle
        $('#app-main').html('<div id="manga-read-bar"><span class="block" id="zoom">Zoom: <button class="spe no-margin m-left-10 inline-block" onclick="zoomAllImg(\'+\')">Büyüt</button><button class="spe no-margin m-left-10 inline-block" onclick="zoomAllImg(\'-\')">Küçült</button><button class="spe no-margin m-left-10 inline-block" onclick="zoomAllImg(\'0\')">Sıfırla</button></span><img src="img/unlem.png" id="bolum-bildir"></div><div id="manga-read-main"><span class="block f-align-center" style="font-size:26px;padding-bottom:5px;border-bottom:1px solid black;margin-bottom:10px;">'+obj['ad']+'<br/>Bölüm - '+obj['bolum']+'</span></div>');

        $('div#manga-read-bar > img#bolum-bildir').on('click',function(){
           if( a_block == false )
           {
                 var a = confirm('Bu bölümü bildirmek istiyor musunuz?\n(Eğer bu bölümde bazı sorunlar yaşıyorsanız lütfen bize bildiriniz.)');

                if( a )
                {
                    var b = prompt('Sorunu kısaca açıklar mısınız?');
                    b = b.trim();

                    if( !b ) b = '---';

                    a_block = true;
                    $.ajax({
                            url  : SETTINGS.API.url,
                            type : 'post',
                            data : { 
                                'md_request' : true,
                                'md_contact' : true,
                                'data'       : {
                                    'bolum' :'Manga Sorunlu Bölüm Bildirimi',
                                    'baslik':obj['ad']+' - '+obj['bolum']+'. Bölüm',
                                    'icerik':b
                                }
                            },
                            success : function(data){
                                a_block = false;
                                alert('Sorunu bize bildirdiğiniz için teşekkür ederiz. En kısa sürede ilgileneceğiz!');
                            },
                            error   : function(){
                                a_block = false;
                                $('div#contact > button').html('Gönder');

                                    alert('Sorun bildirimi esnasında bir hata oluştu!(Hata no:190)');
                            }
                        });
                }
           }
           else
           {
                alert('İşleminiz devam etmektedir. Lütfen bekleyiniz!');
           }
        });

        var img_list = obj['img_list'].split(',');

        for( var i=0; i < img_list.length; i++ )
        {
            var img = img_list[i];
            var dom = '<img id="manga" src="'+img+'" target-id="'+i+'" style="width:100%;">';
            $('div#manga-read-main').append(dom);

            document.body.scrollTop = 0;

            $('div#app-main > #manga-read-main > img[target-id="'+i+'"]')
            .hide()
            .after('<span class="block f-align-center" style="margin-bottom:30px;color:#888;"><img src="img/loading.gif" style="margin:0 auto;" class="block">Resim Yükleniyor..</span>')
            .error(function(){
                this.src = 'img/no-img.png';
            }).load(function(){
                $(this).fadeIn(350).next().remove();
            });
        }
    },350);
}

function zoomAllImg( za ){
    var img_list = document.querySelectorAll('#manga-read-main > img');
    var zoom_increase = 10;
    switch( za )
    {
        case '+': //büyüt
            for( var i=0; i < img_list.length; i++ )
            {
                var img = img_list[i];
                var current_width = parseInt(img['style']['width'].replace('%',''));

                img['style']['width'] = (current_width + zoom_increase) + '%';
            }
        break;

        case '-': //küçült
            for( var i=0; i < img_list.length; i++ )
            {
                var img = img_list[i];
                var current_width = parseInt(img['style']['width'].replace('%',''));

                if( current_width > 100 )
                    img['style']['width'] = (current_width - zoom_increase) + '%';
            }
        break;

        case '0': //sıfırla
            for( var i=0; i < img_list.length; i++ )
            {
                var img = img_list[i];
                img['style']['width'] = '100%';
            }
        break;
    }
}

function checkAppVersion(){
    $.ajax({
        url  : SETTINGS.API.url,
        type : 'post',
        data : {
            "md_request":true,
            "md_check_version":true
        },
        success:function(data){
            data = JSON.parse(data);

            if( data.code == 1 )
            {
                var version    = data['data']['ayar_current_version'];
                var link       = data['data']['ayar_current_apk'];
                var yenilikler = data['data']['ayar_yenilikler'];
                if( SETTINGS.version != version )
                {
                    $('div#loading').hide();
                    showPopupMessage('Yeni Güncelleme Mevcut!','Uygulama sürümünüz güncel değil. Lütfen uygulamayı kullanmaya devam etmek için güncel sürümü indiriniz.<br/><br/><span style="color:red;">Güncelleme Linki:</span><br/>'+link+'<br/><br/><span style="color:red;">Yenilikler: (v'+version+')</span><br/>'+yenilikler,'',false);

                    APP_STATUS = false;
                    
                    //kill some functions
                    toggleMenu          = function(){}
                    sendLoginRequest    = function(){}
                    sendRegisterRequest = function(){}
                    $('div#right-user-popup').remove();
                    
                }
                else APP_STATUS = true;
            }
            else APP_STATUS = true;
        }
    });
}
/***************************************************************/

function delay(func,time){ //time = ms
    setTimeout( function(){
        func();
    }, time );
}

function validateEmail(email) { //BU KISIM ANDROID 4.4 VE 5.0'DA SIKINTI ÇIKARABILIR!
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function writeMain(text){
    $('#loading').fadeOut();
    $('#app-main').html('<span class="block f-align-center">'+text+'</span>').fadeIn(350);
}

function showPopupMessage( title, text, time, dismiss ){
    if( typeof time != 'undefined' && time.trim() != "" )
    {
        time = time.split(' ')[0].split('-');
        time = time[2]+'/'+time[1]+'/'+time[0];
    }
    else time = '';

    if( typeof dismiss == 'undefined' || typeof dismiss != 'boolean' )
        dismiss = true;
    
    var q   = ( dismiss == true ) ? 'block' : 'none';
    var dom = '<div class="popup-msg"><div id="main"><span id="close" style="display:'+ q +';" ></span><span id="baslik">'+title+'</span><span id="icerik">'+text+'</span><span id="tarih">'+time+'</span></div></div>';
    if( dismiss == true )
        dom += '<script>$(".popup-msg > #main > #close").on("click",function(){$(".popup-msg").fadeOut(500);delay(function(){$(".popup-msg").remove();},500);});</script>';

    $('body').append(dom);
}

function setAppLock( status, msg ){
    if( typeof msg    == 'undefined' ) msg    = '';
    if( typeof status != 'boolean' )   status = false;

    APP_LOCK.status = status;
    APP_LOCK.msg    = msg;
}

function toggleFullLoader(){
    $('#full-loader > img.loader').css('margin-top',window.innerHeight/2-60);
    $('#full-loader').fadeToggle(350);
}

function saveLastPage( selector ){ //html selector
    var data = { html:null, scrollTop:null }
    if( typeof selector == 'undefined' )
        data['html'] = $('#app-main').html();
    else 
        data['html'] = $(selector).html();
    data['scrollTop'] = document.body.scrollTop;

    MEMORY['lastPage'].push(data);

    //eğer 10dan fazla sayfa hafızaya alınırsa uygulama performansı düşer
    //o yuzden 10 dan fazla sayfa kayıt edildiğinde baştakileri silelim artık
    // if( MEMORY['lastPage'].length > 10 )
    //     MEMORY['lastPage'].splice(0,1);
}
function checkDataFile(){
    //eğer data dosyası okunup hafızaya alındı ise TRUE döndürür aksi halde FALSE döndürür
    if( MEMORY.fileData.app != 'error' ) return true;
    else return false;
}
function saveDataFile(file,save,successFunc,errorFunc){
    if( typeof file == 'undefined' )
        file = SETTINGS.dataFile;
    if( typeof save == 'undefined' )
        save = 'app';
    if( typeof successFunc != 'function' ||  typeof successFunc == 'undefined' )
        successFunc = function(){ if(SETTINGS.debug){console.log('success - saveDataFile');} }
    if( typeof errorFunc != 'function'   ||  typeof errorFunc == 'undefined' )
        errorFunc = function(){ if(SETTINGS.debug){console.log('error - saveDataFile');} }
    if( checkDataFile() )
    {
        var writeData;
        if( typeof MEMORY.fileData[save] != 'object' )
            writeData = MEMORY.fileData[save];
        else
            writeData = JSON.stringify(MEMORY.fileData[save]);
            
        writeFile(file,writeData,save,function(){
            //success
            MEMORY.fileData[save] = JSON.parse(MEMORY.fileData[save]);
            successFunc();
        },function(){
            //error
            errorFunc();
        });
    }
}
///////////////////
//DOSYA ISLEMLERI//
///////////////////
function getFile( name, save,successFunc, errorFunc ){
    if( typeof name == 'undefined' )
        return false;
    if( typeof save == 'undefined' )
        save = 'temporary';
    if( typeof successFunc != 'function' ||  typeof successFunc == 'undefined' )
        successFunc = function(){ if(SETTINGS.debug){console.log('success - getFile');} }
    if( typeof errorFunc != 'function'   ||  typeof errorFunc == 'undefined' )
        errorFunc = function(){ if(SETTINGS.debug){console.log('error - getFile');} }
    
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        fs.root.getFile(name, { create: false, exclusive: false }, function (fileEntry) {
            if(SETTINGS.debug){console.info('file - file found, reading');}
            readFile(fileEntry, save, successFunc, errorFunc);
        }, function(){if(SETTINGS.debug){console.info('file - error2 file not exist');} FILE_RETURN=false;errorFunc();});
    }, function(){if(SETTINGS.debug){console.info('file - error1 - cannot load filesystem');} FILE_RETURN=false;errorFunc();});
}

function readFile(fileEntry, save, successFunc, errorFunc) {
    if( typeof save == 'undefined' )
        save = 'temporary';
    if( typeof successFunc != 'function' ||  typeof successFunc == 'undefined' )
        successFunc = function(){ if(SETTINGS.debug){console.log('success - readFile');} }
    if( typeof errorFunc != 'function'   ||  typeof errorFunc == 'undefined' )
        errorFunc = function(){ if(SETTINGS.debug){console.log('error - readFile');} }

    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.readAsText(file);

        reader.onloadend = function() {
            if(SETTINGS.debug){console.info('file - file readed and saved');}
            MEMORY.fileData[save] = this.result;
            FILE_RETURN=true;

            successFunc();
        };
    }, function(){ if(SETTINGS.debug){console.info('file - error3 - cannot read file');} FILE_RETURN=false; errorFunc(); });
}

function writeFile(name, text, save,successFunc, errorFunc) {
    if( typeof name == 'undefined' )
        return false;
    if( typeof save == 'undefined' )
        save = 'temporary';
    if( typeof text == 'undefined' )
        text = '';
    if( typeof successFunc != 'function' ||  typeof successFunc == 'undefined' )
        successFunc = function(){ if(SETTINGS.debug){console.log('success - writeFile');} }
    if( typeof errorFunc != 'function'   ||  typeof errorFunc == 'undefined' )
        errorFunc = function(){ if(SETTINGS.debug){console.log('error - writeFile');} }

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        fs.root.getFile(name, { create: false, exclusive: false }, function (fileEntry) {
            
            fileEntry.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function() {
                if(SETTINGS.debug){console.info("file - successfully writed");}
                readFile(fileEntry, save, successFunc, errorFunc);
            };

            fileWriter.onerror = function (e) {
                if(SETTINGS.debug){console.info("file - error - write failed to "+e.toString());}
                FILE_RETURN=false;
                errorFunc();
            };

            // If data object is not passed in,
            // create a new Blob instead.
            dataObj = new Blob([text], { type: 'text/plain' });

            fileWriter.write(dataObj);
        });

        }, function(){if(SETTINGS.debug){console.info('file - error2 file not exist');} FILE_RETURN=false;errorFunc();});
    }, function(){if(SETTINGS.debug){console.info('file - error1 - cannot load filesystem');} FILE_RETURN=false;errorFunc();});
    
}

function createFile(name, successFunc, errorFunc){
    if( typeof name == 'undefined' )
        return false;
    if( typeof successFunc != 'function' ||  typeof successFunc == 'undefined' )
        successFunc = function(){ if(SETTINGS.debug){console.log('success - createFile');} }
    if( typeof errorFunc != 'function'   ||  typeof errorFunc == 'undefined' )
        errorFunc = function(){ if(SETTINGS.debug){console.log('error - createFile');} }

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        fs.root.getFile(name, { create: true, exclusive: false }, function (fileEntry) {
            if(SETTINGS.debug){console.info('file - file created');}
            FILE_RETURN=true;
            successFunc();
        }, function(){if(SETTINGS.debug){console.info('file - error2 file not exist');} FILE_RETURN=false; errorFunc();});
    }, function(){if(SETTINGS.debug){console.info('file - error1 - cannot load filesystem');} FILE_RETURN=false;errorFunc();});
}

function clearFile(name, successFunc, errorFunc){
    if( typeof name == 'undefined' )
        return false;
    if( typeof successFunc != 'function' ||  typeof successFunc == 'undefined' )
        successFunc = function(){ if(SETTINGS.debug){console.log('success - createFile');} }
    if( typeof errorFunc != 'function'   ||  typeof errorFunc == 'undefined' )
        errorFunc = function(){ if(SETTINGS.debug){console.log('error - createFile');} }

    getFile(name,'temporary',function(){
        var a = '';
        for( var i=1; i <= MEMORY.fileData.temporary.length; i++ )
        { a += ' '; }
        writeFile(name,a,'temporary',function(){ successFunc(); },function(){ errorFunc(); });
    });
}