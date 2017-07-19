<?php
# Bot by XMA
# single_xma2.php nin olusturdugu result daki resimleri uygun mangaya göre veritabanına kayıt eder
# -Mangaku-

header('Content-Type: text/html; charset=utf-8');
set_time_limit(0);

## CONFIG ##
require('../config.php');
#########################################################

$result = 'result_singlexma2/result.data';
$manga_id = 139;

$file_data = explode(PHP_EOL,file_get_contents($result));

$q = $db->prepare('SELECT manga_id,manga_bolum_no,manga_bolum_img_list FROM manga_bolumleri WHERE manga_manga_listesi_id=? ORDER BY manga_id ASC');
$q->execute([$manga_id]);

if( $q->rowCount() > 0 )
{
    while( $r = $q->fetch(PDO::FETCH_ASSOC) )
    {
        $id = $r['manga_id'];
        $no = $r['manga_bolum_no'];
        $count = count(explode(',',$r['manga_bolum_img_list']));

        if( in_array($no,$file_data) )
        {
            $index = array_search($no,$file_data) + 1;

            $img_list = [];
            for( $i=$index; $i < $index+$count; $i++ )
            {
                if( trim($file_data[$i]) != $no )
                    array_push($img_list,$file_data[$i]);
                else continue;
            }

            $img_list = implode(',',$img_list);

            $w = $db->prepare('UPDATE manga_bolumleri SET manga_bolum_img_list=? WHERE manga_id=?');
            $w->execute([$img_list,$id]);
        }
        else continue;
    }
}
else die('Manga IDsi bulunamadi!');
?>