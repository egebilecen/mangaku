<?php
    require('config.php');
    header('Access-Control-Allow-Origin: *');
    error_reporting(1);

    if( $_POST['md_request'] )
    {
        if( $_POST['md_register'] ) //kayit olma istegi
        {
            $username  = trim($_POST['data']['username']);
            $password  = trim($_POST['data']['password']);
            $password2 = trim($_POST['data']['password2']);
            $eposta    = trim($_POST['data']['eposta']);
            
            if( ($username && $password && $password2 && $eposta) && (strlen($username) >= 3 && strlen($password) >= 3) && ($password == $password2) && filter_var($eposta, FILTER_VALIDATE_EMAIL) )
            {
                $kon = $db->prepare('SELECT kullanici_id FROM kullanicilar WHERE kullanici_adi = ?');
                $kon->execute([$username]);
                if( $kon->rowCount() > 0 )
                {
                    $data = [
                        'code' => 0,
                        'msg'  => 'Bu kullanici adi kullanimda!',
                        'data' => []
                    ];
                    
                    echo json_encode($data);
                }
                else
                {
                    $kon2 = $db->prepare('SELECT kullanici_id FROM kullanicilar WHERE kullanici_eposta = ?');
                    $kon2->execute([$eposta]);
                    if( $kon2->rowCount() > 0 )
                    {
                        $data = [
                            'code' => 0,
                            'msg'  => 'Bu eposta adresi kullanimda!',
                            'data' => []
                        ];
                        
                        echo json_encode($data);
                    }
                    else
                    {
                        $md5pw = md5($password);
                        $query = $db->prepare('INSERT INTO kullanicilar SET kullanici_id=NULL,kullanici_adi=?,kullanici_sifre=?,kullanici_eposta=?,kullanici_sifre_sifirlama_kod=?, kullanici_data=?');
                        $res = $query->execute([ $username, $md5pw, $eposta, '', '{"favori_mangalar":[],"okunacak_listesi":[],"manga_son_kaldigi_bolum":[],"manga_takip_listesi":[]}' ]);
                        
                        if( $res )
                        {
                            $data = [
                                'code' => 1,
                                'msg'  => 'Basariyla kayit oldunuz! Artik giris yapabilirsiniz. :)',
                                'data' => []
                            ];
                            
                            echo json_encode($data);
                        }
                        else
                        {
                           $data = [
                                'code' => 0,
                                'msg'  => 'Kayit esnasinda bir hata olustu! Lütfen DAHA SONRA tekrar deneyiniz, eğer aynı sorunu yaşamaya devam ediyorsanız bizimle iletişime geçiniz.',
                                'data' => []
                            ];
                            
                            echo json_encode($data); 
                        }
                    }
                }
            }
            else
            {
                $data = [
                    'code' => 0,
                    'msg'  => 'Hicbir yer bos birakilmamalidir. Kullanici adi ve sifre en az 3 karakter olmalidir. Sifreleriniz birbiri ile eslesmelidir. Eposta adresiniz uygun olmalidir.',
                    'data' => []
                ];
                
                echo json_encode($data);
            }
        }
        else if( $_POST['md_login'] ) //giris yapma istegi
        {
            $username = trim($_POST['data']['username']);
            $password = trim($_POST['data']['password']);
            
            if( ($username && $password) && (strlen($username) >= 3 && strlen($password) >= 3) )
            {
                $md5pw = md5($password);
                $query = $db->prepare('SELECT kullanici_id,kullanici_data FROM kullanicilar WHERE kullanici_adi=? && kullanici_sifre=?');
                $query->execute([$username,$md5pw]);
                
                if( $query->rowCount() > 0 )
                {
                    $row = $query->fetch(PDO::FETCH_ASSOC);
                        
                    $data = [
                        'code' => 1,
                        'msg'  => 'Basariyla giris yaptiniz.',
                        'data' => $row
                    ];
                    
                    echo json_encode($data);
                }
                else
                {
                    $data = [
                        'code' => 0,
                        'msg'  => 'Kullanici adi veya sifre yanlis!',
                        'data' => []
                    ];
                    
                    echo json_encode($data);
                }
            }
            else
            {
                $data = [
                    'code' => 0,
                    'msg'  => 'Hicbir yer bos birakilmamalidir. Kullanici adi ve sifre en az 3 karakter olmalidir.',
                    'data' => []
                ];
                
                echo json_encode($data);
            }
        }
        else if( $_POST['md_change_user_pw'] ) //kullanici - sifre degistir
        {  
            $k_id = trim($_POST['data']['k_id']);
            $pw   = trim($_POST['data']['pw']); 
            $pw2  = trim($_POST['data']['pw2']);
            
            if( ($pw && $pw2) && ($pw == $pw2) && $k_id && (strlen($pw) >= 3 && strlen($pw2) >= 3) )
            {
                $query = $db->prepare('UPDATE kullanicilar SET kullanici_sifre=? WHERE kullanici_id=?');
                $res = $query->execute([md5($pw),$k_id]);
                
                if( $res )
                {
                    $data = [
                        'code' => 1,
                        'msg'  => 'Sifre basariyla guncellendi!',
                        'data' => []
                    ];
                    
                    echo json_encode($data);
                }
                else
                {
                    $data = [
                        'code' => 2,
                        'msg'  => 'Sifre guncellenirken bir hata olustu!',
                        'data' => []
                    ];
                    
                    echo json_encode($data);
                }
            }
            else
            {
                $data = [
                    'code' => 0,
                    'msg'  => 'Hicbir yer bos birakilmamalidir. Sifre uzunlugu 3 karakterden buyuk olmalidir. Sifreler birbiriyle eslesmelidir.',
                    'data' => []
                ];
                
                echo json_encode($data);
            }
        }
        else if( $_POST['md_kullanici_data_change'] ) //kullanıcının favori listesini, takip edilen mangaları falan düzenlicez
        {
            $section = trim($_POST['data']['section']);
            $id      = intval(trim($_POST['data']['id'])); //manga_listesi id
            $k_id    = trim($_POST['data']['k_id']);
            
            $query = $db->prepare('SELECT kullanici_data FROM kullanicilar WHERE kullanici_id = ?');
            $query->execute([intval($k_id)]);
            
            if( $query->rowCount() > 0 )
            {
                $str = get_object_vars(json_decode($query->fetch(PDO::FETCH_ASSOC)['kullanici_data']));
                
                switch( $section )
                {
                    case 'favoriler':
                        $eklendi = null;
                        if( !in_array($id, $str['favori_mangalar']) ) //ekleme
                        {
                            array_push($str['favori_mangalar'],$id);
                            $eklendi = true;
                        }
                        else //cikarma
                        {
                            $index = array_search($id, $str['favori_mangalar']);
                            unset($str['favori_mangalar'][$index]);
                            $str['favori_mangalar'] = array_values($str['favori_mangalar']);
                            $eklendi = false;
                        }
                        $str = json_encode($str);
                    break;
                    
                    case 'okuma-listesi':
                        $eklendi = null;
                        if( !in_array($id, $str['okunacak_listesi']) ) //ekleme
                        {
                            array_push($str['okunacak_listesi'],$id);
                            $eklendi = true;
                        }
                        else //cikarma
                        {
                            $index = array_search($id, $str['okunacak_listesi']);
                            unset($str['okunacak_listesi'][$index]);
                            $str['okunacak_listesi'] = array_values($str['okunacak_listesi']);
                            $eklendi = false;
                        }
                        $str = json_encode($str);
                    break;
                    
                    case 'takip-listesi':
                        //yakinda
                    break;
                }
                
                $query2 = $db->prepare('UPDATE kullanicilar SET kullanici_data=? WHERE kullanici_id=?');
                $res = $query2->execute([$str,intval($k_id)]);
                
                if( $res )
                {
                    $data = [
                        'code' => 1,
                        'msg'  => 'islem basarili',
                        'data' => ['eklendi' => $eklendi]
                    ];
                    
                    echo json_encode($data);
                }
                else
                {
                    $data = [
                        'code' => 2,
                        'msg'  => 'hata',
                        'data' => []
                    ];
                    
                    echo json_encode($data);
                }
            }
            else
            {
                $data = [
                    'code' => 0,
                    'msg'  => 'Bilinmeyen bir hata olustu. (Hata no:API_179)',
                    'data' => []
                ];
                
                echo json_encode($data);
            }
        }
        else if( $_POST['md_check_version'] ) //app version
        {
            $q = $db->query('SELECT * FROM ayarlar');
            $r = $q->fetch(PDO::FETCH_ASSOC);
            
            $data = [
                'code' => 1,
                'msg'  => 'app version',
                'data' => $r
            ];
                
            echo json_encode($data);
        }
        else if( $_POST['md_duyurular'] ) //duyurular
        {
            $query = $db->prepare('SELECT duyuru_baslik,duyuru_icerik,duyuru_zaman,duyuru_durum FROM duyurular ORDER BY duyuru_id DESC LIMIT 1');
            $query->execute();
            
            if( $query->rowCount() > 0 )
            {   
                $row = $query->fetch(PDO::FETCH_ASSOC);
                
                $data = [
                    'code' => 1,
                    'msg'  => 'son duyuru',
                    'data' => $row
                ];
                
                echo json_encode($data);
            }
            else
            {
                $data = [
                    'code' => 2,
                    'msg'  => 'Henuz duyuru paylasilmamis.',
                    'data' => []
                ];
                
                echo json_encode($data);
            }
        }
        else if( $_POST['md_manga_search'] ) //manga arama
        {
            $text = trim($_POST['data']['text']);
            
            if( $text )
            {
                $query = $db->prepare('SELECT * FROM manga_listesi WHERE manga_listesi_ad LIKE ?');
                $query->execute(['%'.$text.'%']);
                
                if( $query->rowCount() > 0 )
                {
                    $sdq = [];
                    while( $row = $query->fetch(PDO::FETCH_ASSOC) )
                    {
                        array_push($sdq,$row);
                    }
                    
                    $data = [
                        'code' => 1,
                        'msg'  => 'manga arama sonuclari',
                        'data' => $sdq
                    ];
                    
                    echo json_encode($data);
                }
                else
                {
                    $data = [
                        'code' => 2,
                        'msg'  => 'sonuc yok',
                        'data' => []
                    ];
                    
                    echo json_encode($data);
                }
            }
            else
            {
                $data = [
                    'code' => 0,
                    'msg'  => 'Hicbir yeri bos birakmayiniz!',
                    'data' => []
                ];
                
                echo json_encode($data);
            }
        }
        else if( $_POST['md_manga_search_id'] )
        {
        	$id = trim($_POST['data']['id']);
            
            if( $id )
            {
                $query = $db->prepare('SELECT * FROM manga_listesi WHERE manga_listesi_id = ?');
                $query->execute([intval($id)]);
                
                if( $query->rowCount() > 0 )
                {
                    $sdq = [];
                    while( $row = $query->fetch(PDO::FETCH_ASSOC) )
                    {
                        array_push($sdq,$row);
                    }
                    
                    $data = [
                        'code' => 1,
                        'msg'  => 'manga arama sonuclari',
                        'data' => $sdq
                    ];
                    
                    echo json_encode($data);
                }
                else
                {
                    $data = [
                        'code' => 2,
                        'msg'  => 'sonuc yok',
                        'data' => []
                    ];
                    
                    echo json_encode($data);
                }
            }
            else
            {
                $data = [
                    'code' => 0,
                    'msg'  => 'Hicbir yeri bos birakmayiniz!',
                    'data' => []
                ];
                
                echo json_encode($data);
            }
        }	
        else if( $_POST['md_get_categories'] ) //kategorileri cek
        {
            $query = $db->prepare('SELECT * FROM manga_tags_list');
            $query->execute();
            
            if( $query->rowCount() > 0 )
            {
                $sdq = [];
                
                while( $row = $query->fetch(PDO::FETCH_ASSOC) )
                {
                    array_push($sdq,$row);
                }
                
                $data = [
                    'code' => 1,
                    'msg'  => 'kategoriler',
                    'data' => $sdq
                ];
                
                echo json_encode($data);
            }
            else
            {
                $data = [
                    'code' => 2,
                    'msg'  => 'kategori yok',
                    'data' => []
                ];
                
                echo json_encode($data);
            }
        }
        else if( $_POST['md_manga_info'] ) //manga info
        {
            $manga_id = intval($_POST['data']['manga_id']);
            
            if( $manga_id )
            {
                $query = $db->prepare( 'SELECT * FROM manga_listesi WHERE manga_listesi_id=?' );
                $query->execute([$manga_id]);
                
                if( $query->rowCount() > 0 )
                {   
                    $episodes = [];
                    
                    $query2 = $db->prepare( 'SELECT manga_bolum_img_list,manga_bolum_no FROM manga_bolumleri WHERE manga_manga_listesi_id=? ORDER BY manga_id ASC' );
                    $query2->execute([$manga_id]);
                    
                    if( $query2->rowCount() > 0 )
                    {
                        while( $row2 = $query2->fetch(PDO::FETCH_ASSOC) )
                        {
                            array_push($episodes, $row2);
                        }
                    }
                    
                    $data = [
                        'code' => 1,
                        'msg'  => 'manga bilgi',
                        'data' => $episodes
                    ];
                    
                    echo json_encode($data);
                }
                else
                {
                    $data = [
                        'code' => 0,
                        'msg'  => 'Manga bulunamadi!',
                        'data' => []
                    ];
                    
                    echo json_encode($data);
                }
            }
            else
            {
                $data = [
                        'code' => 0,
                        'msg'  => 'Bilinmeyen bir hata olustu. (Hata no:API_120)',
                        'data' => []
                    ];
                    
                echo json_encode($data);
            }
        }
        else if( $_POST['md_kategori_arama'] ) //kategori arama
        {
            $text = trim($_POST['data']['text']);
            
            if( !$text )
            {
                $data = [
                        'code' => 0,
                        'msg'  => 'Lutfen bos birakmayiniz!',
                        'data' => []
                    ];
                    
                echo json_encode($data);
            }
            else
            {
                $query = $db->prepare('SELECT * FROM manga_listesi WHERE manga_listesi_tags LIKE ?');
                $query->execute(['%'.$text.'%']);
                
                if( $query->rowCount() > 0 )
                {
                    $sdq = [];
                    
                    while( $row = $query->fetch(PDO::FETCH_ASSOC) )
                    {
                        array_push($sdq, $row);
                    }
                    
                    $data = [
                        'code' => 1,
                        'msg'  => 'kategori arama sonucu',
                        'data' => $sdq
                    ];
                    
                echo json_encode($data);
                }
                else
                {
                    $data = [
                        'code' => 2,
                        'msg'  => 'sonuc yok',
                        'data' => []
                    ];
                    
                echo json_encode($data);
                }
            }
        }
        else if( $_POST['md_son_eklenen_bolumler'] ) //son eklenen bolumler
        {
            $query = $db->prepare('SELECT manga_bolum_no,manga_bolum_img,manga_manga_listesi_id,manga_bolum_img_list,manga_eklenme_tarih FROM manga_bolumleri ORDER BY manga_id DESC LIMIT 6');
            $query->execute();
            
            if( $query->rowCount() > 0 )
            {
                $sdq = [];
                while( $row = $query->fetch(PDO::FETCH_ASSOC) )
                {
                    array_push($sdq,$row);
                }
                
                $counter = 0;
                for( $i=0; $i < count($sdq); $i++ )
                {
                    $elem = $sdq[$i];
                    
                    $query2 = $db->prepare('SELECT manga_listesi_id,manga_listesi_ad FROM manga_listesi WHERE manga_listesi_id=?');
                    $query2->execute([$elem['manga_manga_listesi_id']]);
                    
                    if( $query2->rowCount() > 0 )
                    {
                        $row = $query2->fetch(PDO::FETCH_ASSOC);
                        
                        $sdq[$i]['manga_ad'] = $row['manga_listesi_ad'];
                        $counter++;
                    }
                }
                
                if( $counter == count($sdq) )
                {
                    $data = [
                        'code' => 1,
                        'msg'  => 'son eklenen bolumler',
                        'data' => $sdq
                    ];
                    
                    echo json_encode($data);
                }
                else
                {
                    $data = [
                        'code' => 0,
                        'msg'  => 'Bilinmeyen bir hata olustu. (Hata no:API_121)',
                        'data' => []
                    ];
                    
                    echo json_encode($data);
                }
            }
            else
            {
                $data = [
                    'code' => 0,
                    'msg'  => 'Son eklenen manga bulunamadi.',
                    'data' => []
                ];
                
                echo json_encode($data);
            }
        }
        else if( $_POST['md_son_eklenen_mangalar'] ) //son eklenen mangalar
        {
            $query = $db->prepare('SELECT * FROM manga_listesi ORDER BY manga_listesi_id DESC LIMIT 6');
            $query->execute();
            
            if( $query->rowCount() > 0 )
            {
                $sdq = [];
                while( $row = $query->fetch(PDO::FETCH_ASSOC) )
                {
                    array_push($sdq,$row);
                }
                
                $data = [
                    'code' => 1,
                    'msg'  => 'son eklenen mangalar',
                    'data' => $sdq
                ];
                
                echo json_encode($data);
            }
            else
            {
                $data = [
                    'code' => 0,
                    'msg'  => 'Son eklenen manga bulunamadi.',
                    'data' => []
                ];
                
                echo json_encode($data);
            }
        }
        else if( $_POST['md_editor_tavsiye'] ) //editor tavsiye
        {
            $query = $db->prepare('SELECT manga_editor_tavsiye_manga_liste_id FROM manga_editor_tavsiye ORDER BY manga_editor_tavsiye_id DESC LIMIT 6');
            $query->execute();
            
            if( $query->rowCount() > 0 )
            {
                $sdq = [];
                while( $row = $query->fetch(PDO::FETCH_ASSOC) )
                {
                    array_push($sdq,$row);
                }
                
                $counter = 0;
                for( $i=0; $i < count($sdq); $i++ )
                {
                    $elem = $sdq[$i];
                    
                    $query2 = $db->prepare('SELECT * FROM manga_listesi WHERE manga_listesi_id=?');
                    $query2->execute([$elem['manga_editor_tavsiye_manga_liste_id']]);
                    
                    if( $query2->rowCount() > 0 )
                    {
                        $row = $query2->fetch(PDO::FETCH_ASSOC);
                        
                        $sdq[$i] = $row;
                        $counter++;
                    }
                }
                
                if( $counter == count($sdq) )
                {
                    $data = [
                        'code' => 1,
                        'msg'  => 'editor tavsiye',
                        'data' => $sdq
                    ];
                    
                    echo json_encode($data);
                }
                else
                {
                    $data = [
                        'code' => 0,
                        'msg'  => 'Bilinmeyen bir hata olustu. (Hata no:API_121)',
                        'data' => []
                    ];
                    
                    echo json_encode($data);
                }
            }
            else
            {
                $data = [
                    'code' => 0,
                    'msg'  => 'Hicbir editor tavsiyesi bulunamadi.',
                    'data' => []
                ];
                
                echo json_encode($data);
            }
        }
        else if( $_POST['md_contact'] ) //iletisim
        {
            $bolum  = trim($_POST['data']['bolum']);
            $baslik = trim($_POST['data']['baslik']);
            $icerik = trim($_POST['data']['icerik']);
            
            if( ($bolum && $baslik && $icerik) && (strlen($baslik) >= 10 && (strlen($icerik) >= 10 && strlen($icerik) <= 500))  )
            {
                $query = $db->prepare('INSERT INTO iletisim SET iletisim_id=NULL, iletisim_bolum=?, iletisim_baslik=?, iletisim_icerik=?, iletisim_durum=1');
                $res = $query->execute([$bolum,$baslik,$icerik]);
                
                if( $res )
                {
                    $data = [
                        'code' => 1,
                        'msg'  => 'Mesajiniz basari ile bize iletildi. En kisa surede degerlendirmeye alacagiz. :)',
                        'data' => []
                    ];
                    
                    echo json_encode($data);
                }
                else
                {
                    $data = [
                        'code' => 0,
                        'msg'  => 'Mesajinizin gonderimi esnasinda bir hata olustu. (Hata no:API_941)',
                        'data' => []
                    ];
                    
                    echo json_encode($data);
                }
            }
            else
            {
                $data = [
                    'code' => 0,
                    'msg'  => 'Hicbir yer bos birakilmamalidir. Baslik ve icerik en az 10 karakter olmalidir. Icerik uzunlugu 500 karakterden fazla olamaz.',
                    'data' => []
                ];
                
                echo json_encode($data);
            }
        }
    }
?>