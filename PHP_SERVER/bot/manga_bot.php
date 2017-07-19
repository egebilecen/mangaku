<?php

$url  = 'http://mangadenizi.com/manga/one-piece/867/$no';
$till = 15; 

$dirname = explode('/',$url)[4].'-'.explode('/',$url)[5].'-bolum';

if( !file_exists($dirname) )
{
    $c_dir = mkdir( $dirname );

    if( !$c_dir )
    {
        die('Dizin olusturulurken hata olustu!');
    }
}

$r_dir = chdir($dirname);

if( !$r_dir )
{
    die('Dizin degistirilirken hata olustu!');
}

for( $i=1; $i <= $till; $i++ )
{
    $reg  = '@<img class="(.*?)">@si';
    $data = file_get_contents( str_replace('$no',$i,$url) );

    $img  = preg_match_all($reg,$data,$return); //$return[0][1]
    $src  = str_replace(' ','',explode("'",explode("src='",$return[0][1])[1])[0]);

    $ch   = curl_init($src);
    $file = fopen($i.'.'.explode('.',$src)[count(explode('.',$src))-1],'w');
    curl_setopt($ch,CURLOPT_FILE,$file); 
    curl_exec($ch);
    curl_close($ch);
    fclose($file);

}

echo PHP_EOL.PHP_EOL.'Islem tamamlandi.';

?>