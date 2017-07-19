<?php
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

function go($url, $sn=0){ //javascript ile yönlendirme yapar
		if( $sn <= 0 )
		{
			echo '
				<script>
					document.location = '; echo '"'.$url.'"'; echo ';
				</script>
			';
		}
		else
		{
			$sn=$sn*1000;
			echo '
				<script>
					setTimeout(function(){
						document.location = '; echo '"'.$url.'"'; echo ';
					},'; echo $sn; echo ')
				</script>
				';
		}
	}

	function go_back($sn=null){
		if( is_numeric($sn) )
		{
			if( $sn <= 0 ){$sn=0;}else{$sn=$sn*1000;}
			echo '
				<script>
					setTimeout(function(){
						window.history.back();
					},'; echo $sn; echo ');
				</script>
			';
		}
		else
		{
			echo '
				<script>
					window.history.back();
				</script>
			';
		}
	}