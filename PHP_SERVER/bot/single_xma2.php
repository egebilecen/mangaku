<?php
# Bot by XMA
# İstenen linke gidip resimlerini $result değişkenin yoluna kayıt eder
# -Mangaku-

header('Content-Type: text/html; charset=utf-8');
set_time_limit(0);

## CONFIG ##
require('../config.php');
#########################################################
$img_url  = 'http://uploads.im/api?upload=$img';
// $data = json_decode(file_get_contents(str_replace('$img',$img,$url)),true);

$result = 'result_singlexma2/result.data';

$url = 'http://puzzmos.com/manga/the-fairy-captivity';
$manga_data = file_get_contents($url);
$manga_id   = 139;
$manga_img  = 'http://puzzmos.com/mangalar/cover/the-fairy-captivity.png';

// bölümleri bulalım
$pattern = '@<b>(.*?)</b>@si';
preg_match_all($pattern,$manga_data,$manga_bolumler);//[1][~]
$manga_bolumler = array_reverse($manga_bolumler[1]);
$manga_bolum_sayisi = count($manga_bolumler);
for( $j=0; $j < $manga_bolum_sayisi; $j++ ) //$manga_bolum_sayisi
{
    $bolum = trim(explode(' ',$manga_bolumler[$j])[ count(explode(' ',$manga_bolumler[$j])) - 1 ]);
    $bolum_data = file_get_contents($url.'/'.$bolum.'?Sayfa=0');
    
    $pattern = '@<select (.*?)>(.*?)</select>@si';
    preg_match_all($pattern,$bolum_data,$sayfa_sayisi);//[2][1]
    $sayfa_sayisi = count(explode('value',$sayfa_sayisi[2][1]))-1; //bölümler 0 dan başlıyor

    $img_list = [];
    for( $z=0; $z < $sayfa_sayisi; $z++ ) //$sayfa_sayisi
    {    
        $sayfa_data = file_get_contents($url.'/'.$bolum.'?Sayfa='.$z);

        $pattern = '@<img src="(.*?) class="(.*?)">@si';
        preg_match_all($pattern,$sayfa_data,$bolum_img);//[1][1]
        $bolum_img = str_replace(' ','%20',str_replace(['"',"'"],'',$bolum_img[1][1]));

        array_push($img_list,$bolum_img);
    }
    if( !file_exists($result) )
        touch($result);

    $f = fopen($result,'a');
    fwrite($f,$bolum.PHP_EOL.implode(PHP_EOL,$img_list).PHP_EOL.PHP_EOL);
    fclose($f);
}

echo 'Islem tamamlandi.';
?>