<?php
# Bot by XMA
# Son eklenen mangaları çekip paylaşır
# -Mangaku-

header('Content-Type: text/html; charset=utf-8');
require('../config.php');
set_time_limit(0);

$img_url  = 'http://uploads.im/api?upload=$img';
// $data = json_decode(file_get_contents(str_replace('$img',$img,$url)),true);
$url  = 'http://puzzmos.com/';
$data = file_get_contents($url);

$pattern = '@<b><a href="(.*?)">(.*?)</a></b>@si';
preg_match_all($pattern,$data,$manga_datas);
$manga_isimler = $manga_datas[2]; //array
$manga_linkler = $manga_datas[1]; //array

$pattern = '@<a class="deneme" href="(.*?)">(.*?)</a>@si';
preg_match_all($pattern,$data,$manga_bolum_link);//[1][~]
$manga_bolum_linkler = $manga_bolum_link[1];//array

for( $i=0; $i < count($manga_isimler); $i++ )
{
    $manga_isim       = trim($manga_isimler[$i]);
    $manga_link       = trim($manga_linkler[$i]);
    $manga_bolum_link = str_replace(' ','%20',trim($manga_bolum_linkler[$i]));
    $manga_bolum_no   = trim(explode('/',$manga_bolum_link)[ count(explode('/',$manga_bolum_link))-1 ]);
    
    $q = $db->prepare('SELECT * FROM manga_listesi WHERE manga_listesi_ad = ?');
    $q->execute([$manga_isim]);

    if( $q->rowCount() > 0 ) //bu manga eklenmiş ise
    {
        $r = $q->fetch(PDO::FETCH_ASSOC);
        $manga_id  = $r['manga_listesi_id'];
        $manga_img = $r['manga_listesi_img'];
    }
    else //bu manga eklenmemiş
    {
        $manga_data = file_get_contents($manga_link);
        
        $pattern = '@<img class="thumbnail manga-cover" width="100%" src="(.*?)">@si';
        preg_match_all($pattern,$manga_data,$manga_img);//[1][0]
        $manga_img = $manga_img[1][0];

        $pattern = '@<p>(.*?)</p>@si';
        preg_match_all($pattern,$manga_data,$manga_aciklama);//[0][0]
        $manga_aciklama = str_replace(['<p>','</p>'],'',$manga_aciklama[0][0]);

        $pattern = '@<td>(.*?)</td>@si';
        preg_match_all($pattern,$manga_data,$manga_tags);//[0][6]
        $kat_list = [];
        for( $j=0; $j < count(explode(',',$manga_tags[0][6])); $j++ )
        {
            $kat = explode(' ',explode("'",explode('title=',explode(',',$manga_tags[0][6])[$j])[1])[1]);
            unset($kat[0]);
            $kat = implode(' ',$kat);

            array_push($kat_list,$kat);
        }
        $kat_list = str_replace(["'",'"'],'',implode(',',$kat_list));
        
        // $_data = json_decode(file_get_contents(str_replace('$img',$manga_img,$img_url)),true);
        // if( $_data['status_code'] != 200 )
        //     $manga_img = 'error';
        // else
        //     $manga_img = $_data['data']['img_url'];
        
        $q = $db->prepare('INSERT INTO manga_listesi SET manga_listesi_id=NULL,manga_listesi_ad=?,manga_listesi_aciklama=?,manga_listesi_tags=?,manga_listesi_img=?');
        $q->execute([$manga_isim,$manga_aciklama,$kat_list,$manga_img]);

        $manga_id = $db->lastInsertId();
    }

    $q = $db->prepare('SELECT * FROM manga_bolumleri WHERE manga_manga_listesi_id=? && manga_bolum_no=?');
    $q->execute([$manga_id,$manga_bolum_no]);

    if( $q->rowCount() > 0 ) //veri varsa
    {
        continue;//atla
    }
    else
    {
        $bolum_data = file_get_contents($manga_link.'/'.$manga_bolum_no.'?Sayfa=0');
        
        $pattern = '@<select (.*?)>(.*?)</select>@si';
        preg_match_all($pattern,$bolum_data,$sayfa_sayisi);//[2][1]
        $sayfa_sayisi = count(explode('value',$sayfa_sayisi[2][1]))-1; //bölümler 0 dan başlıyor

        $img_list = [];
        for( $z=0; $z < $sayfa_sayisi; $z++ ) //$sayfa_sayisi
        {
            $sayfa_data = file_get_contents($manga_link.'/'.$manga_bolum_no.'?Sayfa='.$z);

            $pattern = '@<img src="(.*?) class="(.*?)">@si';
            preg_match_all($pattern,$sayfa_data,$bolum_img);//[1][1]
            $bolum_img = str_replace(['"',"'"],'',$bolum_img[1][1]);

            // $_data = json_decode(file_get_contents(str_replace('$img',$bolum_img,$img_url)),true);
            // if( $_data['status_code'] != 200 )
            //     $bolum_img = 'error';
            // else
            //     $bolum_img = $_data['data']['img_url'];

            array_push($img_list,$bolum_img);
        }
        $img_list = implode(',',$img_list);
        
        $q = $db->prepare('INSERT INTO manga_bolumleri SET manga_id=NULL,manga_manga_listesi_id=?,manga_bolum_no=?,manga_bolum_img_list=?,manga_bolum_img=?,manga_eklenme_tarih=CURRENT_TIMESTAMP');
        $q->execute([$manga_id,$manga_bolum_no,$img_list,$manga_img]);
    }
}
?>