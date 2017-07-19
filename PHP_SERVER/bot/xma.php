<?php
set_time_limit(0);

## CONFIG ##
$vt_kadi  = 'root';
$vt_sifre = '123456';
$vt_host  = 'localhost';
$vt_name  = 'manga_dunyasi';

try
{
    $db = new PDO('mysql:host='.$vt_host.';dbname='.$vt_name.';',$vt_kadi,$vt_sifre);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
    
    ## CHARSET ##
	$db->query("SET NAMES utf8");
	$db->query("SET CHARACTER SET utf8");
}
catch( PDOException $e )
{
    $data = [
        'code' => 0,
        'msg'  => 'Veritabanina baglanilamadi!'
    ];
    die( json_encode($data) );
}
#########################################################

$url  = 'http://uploads.im/api?upload=$img';
// $data = json_decode(file_get_contents(str_replace('$img',$img,$url)),true);

$ch = curl_init('http://www.serimanga.com/random');
curl_setopt($ch,CURLOPT_FOLLOWLOCATION,1);
curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
$res = curl_exec($ch);
curl_close($ch);

$pattern = '@<img class="(.*?)">@si';//[0][1]
preg_match_all($pattern,$res,$manga_resim); //[3][0]
$manga_resim = explode("'",explode('"',$manga_resim[0][1])[2])[1];

$pattern = '@<h2 class="(.*?)" style="(.*?)">(.*?)</h2>@si';
preg_match_all($pattern,$res,$manga_baslik); //[3][0]
$manga_baslik = $manga_baslik[3][0];

$pattern = '@<p>(.*?)</p>@si';
preg_match_all($pattern,$res,$manga_konu);//[0][0]
$manga_konu = str_replace(array('<p>','</p>'),'',$manga_konu[0][0]);

$pattern = '@<h5 class="chapter-title-rtl">(.*?)</h5>@si';
preg_match_all($pattern,$res,$manga_bolumler);//[1][~]
$manga_bolumler = array_reverse($manga_bolumler[1]);

//bu manga ekli mi kontrol et
$q = $db->prepare('SELECT * FROM manga_listesi WHERE manga_listesi_ad=?');
$q->execute([$manga_baslik]);

if( $q->rowCount() > 0 ) //eklendi ise
{
    $r = $q->fetch(PDO::FETCH_ASSOC);
    $manga_id = $r['manga_listesi_id'];
}
else //eklenmedi ise ekle
{
    $data = json_decode(file_get_contents(str_replace('$img',$manga_resim,$url)),true);
    if( $data['status_code'] != 200 )
        $manga_resim = '';
    else 
        $manga_resim = $data['data']['img_url'];
    
    $q = $db->prepare('INSERT INTO manga_listesi SET 
    manga_listesi_id=NULL,
    manga_listesi_ad=?,
    manga_listesi_aciklama=?,
    manga_listesi_tags_id=?,
    manga_listesi_img=?,
    manga_listesi_eklenen_bolum=?');

    $q->execute([$manga_baslik,$manga_konu,'',$manga_resim,0]);   

    $manga_id = $db->lastInsertId();
}
for( $i=0; $i < count($manga_bolumler); $i++ )
{
    $bolum     = $manga_bolumler[$i];
    $bolum_url = explode('"',explode('href="',$bolum)[1])[0];
    $bolum_no  = explode('/',$bolum_url)[count(explode('/',$bolum_url))-1]; 

    //bölüm önceden eklendi mi kontrol et
    $q = $db->prepare('SELECT * FROM manga_bolumleri WHERE manga_bolum_no=? && manga_manga_listesi_id=?');
    $q->execute([$bolum_no,$manga_id]);

    if( $q->rowCount() > 0 ) //önceden eklendi ise
    {
        //zzz
    }
    else
    {
        /*
            bu sayfaya gidip kaç sayfalık manga olduğunu bulacağız daha sonra
            sayfa sayısı kadar for döngüsü yapıp bütün resimleri sunucuya kayıt edeceğiz
            daha da sonra bunu bizim uygulamamızda paylaşacağız
        */
        $res = file_get_contents($bolum_url.'/1');
        $pattern = '@<option (.*?)>(.*?)</option>@si';
        preg_match_all($pattern,$res,$bolum_sayisi);//[2]
        $bolum_sayisi = count($bolum_sayisi[2]);
        
        $bolum_img_list = [];
        for( $j=1; $j <= $bolum_sayisi; $j++ )
        {
            $t_url   = file_get_contents($bolum_url.'/'.$j);
            $pattern = '@<img class="(.*?)">@si';
            preg_match_all($pattern,$t_url,$img);
            $img  = str_replace(' ','',explode("'",explode("src='",$img[0][1])[1])[0]);

            $data = json_decode(file_get_contents(str_replace('$img',$img,$url)),true);
            if( $data['status_code'] != 200 )
            {
                array_push($bolum_img_list,'error');
            }
            else
            {
                array_push($bolum_img_list,$data['data']['img_url']);
            }
        }
        $bolum_img_list = implode(',',$bolum_img_list);

        $q = $db->prepare('INSERT INTO manga_bolumleri SET 
        manga_id=NULL,
        manga_manga_listesi_id=?,
        manga_bolum_no=?,
        manga_bolum_img_list=?,
        manga_bolum_img=?,
        manga_eklenme_tarih=CURRENT_TIMESTAMP');
        $q->execute([$manga_id,$bolum_no,$bolum_img_list,$manga_resim]);
    }
}
?>