<?php
# Bot by XMA
# Puzzmosun manga listesindeki bütün mangaları ekler.
# -Mangaku-

header('Content-Type: text/html; charset=utf-8');
set_time_limit(0);

## CONFIG ##
require('../api/config.php');
#########################################################
$data_file = 'xma2.data';

$img_url  = 'http://uploads.im/api?upload=$img';
// $data = json_decode(file_get_contents(str_replace('$img',$img,$url)),true);

if( !file_exists($data_file) )
{
    $f = fopen($data_file,'w');
    if(!$f) die('error'); //dosya açılamadıysa durdur
    fwrite($f,'1');
    fclose($f);

    $last_page = 1;
}
else
{
    $last_page = intval(str_replace([' ','\n'],'',file_get_contents('./'.$data_file)));
}


$f = fopen($data_file,'w');
if(!$f) die('error');
fwrite($f,$last_page+1);
fclose($f);
#########################################################

$url = 'http://puzzmos.com/directory?Sayfa=$no';
$main_page_data = file_get_contents( str_replace('$no',$last_page,$url) );

$pattern = '@<h4 class="media-heading" id="tables"><a (.*?)>(.*?)</a></h4>@si';
//anasayfa manga listesi
preg_match_all($pattern,$main_page_data,$manga_listesi);// isimler - [2][~] | linkler - [1][~]
$manga_listesi_isimler = $manga_listesi[2];
$manga_listesi_linkler = $manga_listesi[1];

for( $i=0; $i < count($manga_listesi_isimler); $i++ ) //count($manga_listesi_isimler)
{
    $manga_isim = trim($manga_listesi_isimler[$i]);
    $manga_link = explode('"',$manga_listesi_linkler[$i])[1];
    $manga_data = file_get_contents($manga_link);

    $q = $db->prepare('SELECT * FROM manga_listesi WHERE manga_listesi_ad = ?');
    $q->execute([$manga_isim]);

    //eğer manga eklenmemiş ise ekleyip bölümleri eklemeye devam etcez
    if( $q->rowCount() < 1 )
    {  
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
        
        $_data = json_decode(file_get_contents(str_replace('$img',$manga_img,$img_url)),true);
        if( $_data['status_code'] != 200 )
            $manga_img = 'error';
        else
            $manga_img = $_data['data']['img_url'];
        
        $q = $db->prepare('INSERT INTO manga_listesi SET manga_listesi_id=NULL,manga_listesi_ad=?,manga_listesi_aciklama=?,manga_listesi_tags=?,manga_listesi_img=?');
        $q->execute([$manga_isim,$manga_aciklama,$kat_list,$manga_img]);

        $manga_id = $db->lastInsertId();
    }
    else
    {
        $r = $q->fetch(PDO::FETCH_ASSOC);
        $manga_id  = $r['manga_listesi_id'];
        $manga_img = $r['manga_listesi_img'];
    }
    
    // bölümleri bulalım
    $pattern = '@<b>(.*?)</b>@si';
    preg_match_all($pattern,$manga_data,$manga_bolumler);//[1][~]
    $manga_bolumler = array_reverse($manga_bolumler[1]);
    $manga_bolum_sayisi = count($manga_bolumler);

    for( $j=0; $j < $manga_bolum_sayisi; $j++ ) //$manga_bolum_sayisi
    {
        $bolum = trim(explode(' ',$manga_bolumler[$j])[ count(explode(' ',$manga_bolumler[$j])) - 1 ]);

        $q = $db->prepare('SELECT * FROM manga_bolumleri WHERE manga_manga_listesi_id=? && manga_bolum_no=?');
        $q->execute([$manga_id,$bolum]);
        
        if( $q->rowCount() > 0 ) //bölüm önceden eklenmiş ise
        {
            continue;
        }
        else
        {
            $bolum_data = file_get_contents($manga_link.'/'.$bolum.'?Sayfa=0');
        
            $pattern = '@<select (.*?)>(.*?)</select>@si';
            preg_match_all($pattern,$bolum_data,$sayfa_sayisi);//[2][1]
            $sayfa_sayisi = count(explode('value',$sayfa_sayisi[2][1]))-1; //bölümler 0 dan başlıyor
    
            $img_list = [];
            for( $z=0; $z < $sayfa_sayisi; $z++ ) //$sayfa_sayisi
            {
                $sayfa_data = file_get_contents($manga_link.'/'.$bolum.'?Sayfa='.$z);
    
                $pattern = '@<img src="(.*?) class="(.*?)">@si';
                preg_match_all($pattern,$sayfa_data,$bolum_img);//[1][1]
                $bolum_img = str_replace(['"',"'"],'',$bolum_img[1][1]);
    
                $_data = json_decode(file_get_contents(str_replace('$img',$bolum_img,$img_url)),true);
                if( $_data['status_code'] != 200 )
                    $bolum_img = 'error';
                else
                    $bolum_img = $_data['data']['img_url'];
    
                array_push($img_list,$bolum_img);
            }
            $img_list = implode(',',$img_list);
            
            $q = $db->prepare('INSERT INTO manga_bolumleri SET manga_id=NULL,manga_manga_listesi_id=?,manga_bolum_no=?,manga_bolum_img_list=?,manga_bolum_img=?,manga_eklenme_tarih=CURRENT_TIMESTAMP');
            $q->execute([$manga_id,$bolum,$img_list,$manga_img]);
        }
    }
}
?>