<?php
//--------------------------------------------------//
# Simple Player List by Flabaliki

# You do not need to edit this file
//--------------------------------------------------//

//Global Variables
include "config.php";

//New variables that old versions may not have set
if(!isset($enableRankColors)){
	$enableRankColors = true;
}

//--------------------------------------------------//
//  The following sections writes data to the file  //
//--------------------------------------------------//

//Checks to make sure all data required was sent.
if(isset($_POST['data'])){
	$data = getValues($_POST['data']);
	if($data[7] == $passcode){
		saveData($data);
	} else {
		die("Error: Passcodes do not match.");
	}
	
	//Stop executing the file after writing data.
	die();
}

function getValues($data){
	$data = explode(",", $data);
	return $data;
}

function saveData($data){
	$saveFile = "data.txt";
	$serverName = $data[0];
	
	$dataToWrite = $serverName . "=";
	for($i = 1; $i < count($data); $i++){
		if($i != 7){
			if($i == count($data) - 1){
				$dataToWrite .= $data[$i];
			} else {
				$dataToWrite .= $data[$i] . ",";	
			}
		}
		
	}
	
	//Try to create the save file if it doesn't exist.
	if (!file_exists($saveFile)) {
		$fh = fopen($saveFile, 'w') or die("Error: Can't open $saveFile. On Linux, chmod this file to 664 or 666.");
		fclose($fh);
	} 
	
	$fh = fopen($saveFile, 'r') or die("Error: Can't open $saveFile. On Linux, chmod this file to 664 or 666.");;
	$currentData = fread($fh, filesize($saveFile));
	fclose($fh);
	
	$servers = explode("\n", $currentData);
	$exists = false;
	for($i = 0; $i < count($servers); $i++){
		if(strlen($servers[$i]) > 0){
			$s = explode($serverName . "=", $servers[$i]);	
			if(count($s) == 2){
				$servers[$i] = $dataToWrite;
				$exists = true;
			}
		} else {
			unset($servers[$i]);	
		}
	}
	
	if(!$exists){
		array_push($servers, $dataToWrite);	
	}
	
	$currentData = implode("\n", $servers);
	
	//Write to and close the file
	$fh = fopen($saveFile, 'w') or die("Error: Can't open $saveFile. On Linux, chmod this file to 664 or 666.");
	fwrite($fh, $currentData);
	fclose($fh);
	$connectArray = getLastConnect($serverName);
	setLastConnect($connectArray[0], $connectArray[1], $serverName);
}

function getLastConnect($serverName){
	//Read the last connect time
	$fh = fopen("config.php", 'r') or die("Error: Can't open config.php. On Linux, chmod this file to 664 or 666.");
	$configFile = fread($fh, filesize("config.php"));
	fclose($fh);
	
	$connectTime = 0;
	$serverName = explode(" ", $serverName);
	$serverName = implode("",$serverName);
	$match='(\\$LC' . $serverName . ' = \\d+;)';	# Word 1
	if ($c=preg_match_all ("/".$match."/is",$configFile, $matches)){
		$connectTime = substr($matches[0][0], strlen($serverName) + 6, strlen(substr($matches[0][0], strlen($serverName) + 6)) - 1);
	}  else {
		$configFile = explode("\n", $configFile);
		$l= count($configFile);
		for($i = 0; $i < $l; $i++){
			if(strpos($configFile[$i], ">")){
				$configFile[$i] = "";
			}
		}
		$l= count($configFile);
		$configFile[$l - 1] = "$" . "LC" . $serverName . " = " . strtotime("now") . ";";
		$configFile[$l] = "?>";
		$configFile = implode("\n", $configFile);
		writeToFile("config.php", $configFile);
	}
	
	return array($configFile, $connectTime);
}

function setLastConnect($configFile, $connectTime, $serverName){
	$serverName = explode(" ", $serverName);
	$serverName = implode("",$serverName);
	$search = "$" . "LC" . $serverName . " = " . $connectTime . ";";
	$replace = "$" . "LC" . $serverName . " = " . strtotime("now") . ";";
	writeToFile("config.php", str_replace($search, $replace, $configFile));
}

function writeToFile($file, $data){
	$fh = fopen($file, 'w') or die("Error: Can't open $file. On Linux, chmod this file to 664 or 666.");
	fwrite($fh, $data);
	fclose($fh);
}

//--------------------------------------------------//
//  The following sections reads and displays data  //
//                   from the file                  //
//--------------------------------------------------//

$saveFile = "data.txt";
$fh = fopen($saveFile, 'r') or die("Error: Can't open $saveFile. On Linux, chmod this file to 664 or 666.");;
$currentData = fread($fh, filesize($saveFile));
fclose($fh);
$servers = explode("\n", $currentData);
for ($i = 0; $i < count($servers); $i++){
	if(strlen($servers[$i]) < 1){
		unset($servers[$i]);	
	}
}



//PRINT OUT DISPLAY
echo "<table><tr>";
foreach ($servers as $s){
	echo "<td valign=\"top\">";
	//Extract all the information from the servers data line.
	$serverName = explode("=", $s);
	$serverName = $serverName[0];
	$data = explode($serverName . "=", $s);
	$data = explode(",",$data[1]);
	$serverIP = $data[0];
	$port = $data[1];
	$slots = $data[2];
	$delay = $data[3];
	$players = $data[4];
	$players = explode("|",$players);
	unset($players[count($players) - 1]);
	$ranks = $data[5];
	$ranks = explode("|",$ranks);
	unset($ranks[count($ranks) - 1]);
	$status = $data[6];
	
	//Display all this info in a visual form.
	echo "<table cellspacing=\"0\">\n";
	if (preg_match_all ("/(\\[.*?\\])/is", $template, $matches))
	  {
		  foreach($matches[0] as $c){
			  switch ($c) {
				case "[Name]":
					printName($serverName, $delay, $status);
					break;
				case "[IP]":
					printIP($port, $serverIP);
					break;
				case "[Players]":
					printPlayers($players, $ranks, $enableFaces, $faceSize, $enableRankColors, $faceGrid, $faceGridWidth);
					break;
				case "[Slots]":
					printSlots($players, $slots);
					break;
			  }
		  }
	  }
	
	echo "</table>";
	echo "</td>";
}
echo "</tr></table>";
//END PRINTING DISPLAY


function printName($serverName, $delay, $status){
	//Display server status and name.
	if(serverOnline($serverName, $delay, $status)){
		echo "\t<tr><td colspan=\"2\" class=\"name\"><table align=\"center\"><tr><td><img src=\"images/server-on.png\" title=\"" . $serverName . " is online\"/></td><td><strong>" . $serverName . "</strong></td></tr></table></td></tr>\n";	
	} else {
		echo "\t<tr><td colspan=\"2\" class=\"name\"><table align=\"center\"><tr><td><img src=\"images/server-off.png\" title=\"" . $serverName . " is offline\"/></td><td><strong>" . $serverName . "</strong></td></tr></table></td></tr>\n";	
	}
}

function serverOnline($serverName, $delay, $status){	
	if($status == "off"){
		return false;
	}

	$connectArray = getLastConnect($serverName);
	if($connectArray[1] < strtotime("-" . $delay . "seconds")){	
		return false;
	}
	
	
	return true;
}

function printIP($port, $serverIP){
	//Displays the servers IP and port.
	if($port != "25565"){
	echo "\t<tr><td colspan=\"2\" class=\"ip\" align=\"center\"><em>" . $serverIP . ":" . $port . "</em></td></tr>\n";
	} else {
		echo "\t<tr><td colspan=\"2\" class=\"ip\" align=\"center\"><em>" . $serverIP . "</em></td></tr>\n";
	}	
}

function printPlayers($players, $ranks, $enableFaces, $faceSize, $enableRankColors, $faceGrid, $faceGridWidth){
	if(count($players) > 0 && $enableFaces && $faceGrid){
		$numPlayers = 0;
		foreach($players as $p){
			$numPlayers++;
		}
		
		faceGrid($faceGridWidth, $numPlayers, $players, $faceSize);
		return;
	}
	//List out all of the players
	$count = 0;
	foreach($players as $p){
		$tag = "";
		if($ranks[$count] != ""){
			$tag = $ranks[$count] . " ";
			if($enableRankColors){
				if (preg_match_all ("/(§([A-Fa-f0-9]))/is", $tag, $matches)){
					$colorCount = 0;
					foreach($matches[2] as $m){
						$m = strtolower($m);
						switch ($m) {
							case "0":
								$tag = str_replace("§0", "<span style=\"color:#000000;\">", $tag);
								break;
							case "1":
								$tag = str_replace("§1", "<span style=\"color:#0000aa;\">", $tag);
								break;
							case "2":
								$tag = str_replace("§2", "<span style=\"color:#00aa00;\">", $tag);
								break;
							case "3":
								$tag = str_replace("§3", "<span style=\"color:#00aaaa;\">", $tag);
								break;
							case "4":
								$tag = str_replace("§4", "<span style=\"color:#aa0000;\">", $tag);
								break;
							case "5":
								$tag = str_replace("§5", "<span style=\"color:#aa00aa;\">", $tag);
								break;
							case "6":
								$tag = str_replace("§6", "<span style=\"color:#ffaa00;\">", $tag);
								break;
							case "7":
								$tag = str_replace("§7", "<span style=\"color:#aaaaaa;\">", $tag);
								break;
							case "8":
								$tag = str_replace("§8", "<span style=\"color:#555555;\">", $tag);
								break;
							case "9":
								$tag = str_replace("§9", "<span style=\"color:#5555ff;\">", $tag);
								break;
							case "a":
								$tag = str_ireplace("§a", "<span style=\"color:#55ff55;\">", $tag);
								break;
							case "b":
								$tag = str_ireplace("§b", "<span style=\"color:#55ffff;\">", $tag);
								break;
							case "c":
								$tag = str_ireplace("§c", "<span style=\"color:#ff5555;\">", $tag);
								break;
							case "d":
								$tag = str_ireplace("§d", "<span style=\"color:#ff55ff;\">", $tag);
								break;
							case "e":
								$tag = str_ireplace("§e", "<span style=\"color:#ffff55;\">", $tag);
								break;
							case "f":
								$tag = str_ireplace("§f", "<span style=\"color:#ffffff;\">", $tag);
								break;
						}
						$colorCount++;
					}
					for($i = 0; $i < $colorCount; $i++){
						$tag = $tag . "</span>";	
					}
					
				}
			}
			
		}
		if($players[0] != "" && $enableFaces){
			echo "\t<tr><td colspan=\"2\" class=\"players\"><table align=\"center\"><tr><td align=\"center\"><img src=\"https://minotar.net/helm/" . $p . "/" . $faceSize . ".png\" width=\"" . $faceSize . "px\" height=\"" . $faceSize . "px\"  title=\"" . $p . "\" /></td><td>" . $tag . $p . "</td></tr></table></td></tr>\n";
		} else {
			echo "\t<tr><td colspan=\"2\" class=\"players\" align=\"center\">" . $tag . $p . "</td></tr>\n";
		}
		$count++;
	}	
}

function printSlots($players, $slots){
	//Displays the servers current number of online users and the total number of slots
	if(count($players) > 0){
	echo "\t<tr><td colspan=\"2\" class=\"slots\" align=\"center\">" . count($players) . "/" . $slots . "</td></tr>\n";
	} else {
		echo "\t<tr><td colspan=\"2\" class=\"slots\" align=\"center\">0/" . $slots . "</td></tr>\n";
	}	
}

//Print the online uses in a grid format.
function faceGrid($width, $numPlayers, $player, $faceSize){
	
	//The height of the grid is equal to the number of players online, divided by the width
	//of the rows.
	$height = $numPlayers / $width;
	$count = 0;
	echo "<tr><td class=\"players\"><table align=\"center\">";
	for ($i = 0; $i < $height; $i++){
		if($count == $numPlayers){break;}
		echo "<tr>";
			for($j = 0; $j < $width; $j++){
				if($count == $numPlayers){break;}
				echo "<td align=\"center\"><img src=\"https://minotar.net/helm/" . $player[$count] ."/" . $faceSize . ".png\" width=\"" . $faceSize . "px\" height=\"" . $faceSize . "px\"  title=\"" . $player[$count] . "\" /></td>";
				
				$count++;
			}
		echo "</tr>";
	}
	echo "</table></td></tr>";
}
?>

<!--[ajax]a1[/ajax]-->