<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Simple Player List - Editor</title>
<script language="JavaScript">
  function showhidefield(checkBox, section)
  {
	if (document.getElementById(checkBox).checked){
		showhide('tr', section, 'table-row');	
	} else {
		showhide('tr', section, 'none');
	}

  }
  function showhide(t, id, type) {
			var tags = document.getElementsByTagName(t);
			for (var i = 0; i < tags.length; i++) {
				if (tags[i].id == id) {
					tags[i].style.display = type;
				}
			}
		}
</script>
<style type="text/css">
body {
	background:#f1eade;
	font-family: Verdana, Arial, Sans-Serif;
	font-size:13px;
}
.smalltext {
	font-size:11px;
	color:#666666;
}
.category {
	background:#c1b7a6;
	border-top:1px solid #786d5b;
	border-bottom:1px solid #786d5b;
}
.setting {
	border-bottom:1px solid #786d5b;
}
.green {
	border:1px solid #b2e08a;
	background:#e1ffc7;
	color:#6ac918;
	font-weight:bold;
	padding:5px;
}
</style>
</head>

<body>
<?php
$version = "1.5.0";
include "../config.php";
if($enableRankColors == "true"){$enableRankColors = "checked";} else {$enableRankColors = "";}
if($enableFaces == "true"){$enableFaces = "checked";} else {$enableFaces = "";}
if($faceGrid == "true" && $enableFaces == "checked"){$faceGrid = "checked";} else {$faceGrid = "";}
$configuration = array(
	"template" => array(
					"index" => 2, 
					"name" => "Template", 
					"type" => "string", 
					"description" => "The following variables; [Name], [IP], [Players],  and [Slots] will be replaced by their respective content. Put them in any order you would like, you can even remove them completely.", 
					"value" => $template,
					"oldValue" => $template,
					"defaultValue" => "\"[Name][IP][Players][Slots]\"",
					"varName" => "template",
					"settingLocation" => -1),
	"enableRankColors" => array(
					"index" => 3, 
					"name" => "Enable Rank Colors", 
					"type" => "boolean", 
					"description" => "This will allow the use of colours in rank names.These are the same colours you use in Minecraft chat. Eg &e &f", 
					"value" => $enableRankColors,
					"oldValue" => $enableRankColors,
					"defaultValue" => "true",
					"varName" => "enableRankColors",
					"settingLocation" => -1),
	"enableFaces" => array(
					"index" => 4, 
					"name" => "Enable Faces", 
					"type" => "boolean", 
					"description" => "It will enable the face of a users minecraft skin to display next to their name on the list.", 
					"value" => $enableFaces,
					"oldValue" => $enableFaces,
					"defaultValue" => "false",
					"varName" => "enableFaces",
					"settingLocation" => -1),
	"faceSize" => array(
					"index" => 5, 
					"name" => "Face Size", 
					"type" => "int", 
					"description" => "Size of the user faces in pixels.", 
					"value" => $faceSize,
					"oldValue" => $faceSize,
					"defaultValue" => "16",
					"varName" => "faceSize",
					"settingLocation" => -1),
	"faceGrid" => array(
					"index" => 6, 
					"name" => "Face Grid", 
					"type" => "boolean", 
					"description" => "This will display the online users in a grid format using only their faces, names will popup on hover.", 
					"value" => $faceGrid,
					"oldValue" => $faceGrid,
					"defaultValue" => "false",
					"varName" => "faceGrid",
					"settingLocation" => -1),
	"faceGridWidth" => array(
					"index" => 7, 
					"name" => "Face Grid Row Size", 
					"type" => "int", 
					"description" => "Number of faces to display on each row of the grid.", 
					"value" => $faceGridWidth,
					"oldValue" => $faceGridWidth,
					"defaultValue" => "5",
					"varName" => "faceGridWidth",
					"settingLocation" => -1)
);

if(isset($_POST['passcode'])){
	$enteredPasscode = $_POST['passcode'];
	
	if($enteredPasscode == $passcode){
		if(isset($_POST['editConfig'])){
			printEditor($configuration, $passcode);
		} else {
			printPanel($passcode);
			if(isset($_POST['updateConfig'])) {
				$changeCount = updateConfig($configuration);
				echo "<table width=\"500px\" align=\"center\"><tr><td align=\"center\" class=\"green\">Configuration successfully updated!<br />$changeCount changes made.</td></tr></table>";
			}
			if(isset($_POST['saveConfig'])){
				saveConfig($configuration);
				echo "<table width=\"500px\" align=\"center\"><tr><td align=\"center\" class=\"green\">Configuration Saved!</td></tr></table>";
			} else if(isset($_POST['cancelConfig'])){
				echo "<table width=\"500px\" align=\"center\"><tr><td align=\"center\" class=\"green\">Changes cancelled!</td></tr></table>";
			}
		}
	} else {
		printLogin(false);
	}
} else {
	printLogin(true);
}

function printLogin($firstEnter){
	echo "
	<table align=\"center\"><tr><td align=\"center\">Please enter your passcode</td></tr><tr><td>
	<form action=\"#\" method=\"post\">
	<input type=\"password\" name=\"passcode\" /> <input type=\"submit\" />
	</form></td></tr>";
	if(!$firstEnter){
		echo "<tr><td align=\"center\" style=\"background:#ffc7c7; border:1px solid #e08a8a; padding:2px;\"><table align=\"center\"><tr><td width=\"16px\"><img src=\"../images/server-off.png\"/></td><td><em style=\"color:#c91818;\"><strong>*Wrong passcode!</strong></em></td></tr></table></td></tr>";
	}
	echo "</table>";
}

function printPanel($passcode){
	echo "<form action=\"#\" method=\"post\" id=\"panelTable\">
<table align=\"center\" width=\"500px\" cellpadding=\"5px\" cellspacing=\"0\">
    <tr>
      <td colspan=\"2\"><table width=\"400px\"><tr><td width=\"16px\"><img src=\"../images/server-on.png\"/></td><td><strong>Simple Player List - Panel</strong></td></tr></table></td>
    </tr>
    <tr>
      <td colspan=\"2\" align=\"center\" class=\"category\"><input type=\"submit\" name=\"editConfig\" value=\"Edit Config\" /> <input type=\"submit\" name=\"updateConfig\" value=\"Update Config\" /></td>
    </tr>
    </table>
	<input type=\"hidden\" name=\"passcode\" value=\"" . $passcode . "\" />
</form>";	
printBulletins();
}

function printEditor($configuration, $passcode) {
	echo "<form action=\"#\" method=\"post\" id=\"configTable\">
  <table align=\"center\" width=\"500px\" cellpadding=\"5px\" cellspacing=\"0\">
    <tr>
      <td colspan=\"2\"><table width=\"400px\"><tr><td width=\"16px\"><img src=\"../images/server-on.png\"/></td><td><strong>Simple Player List - Configuration</strong></td></tr></table></td>
    </tr>";
	
	foreach($configuration as $c){
		if($c['varName'] == "faceGrid" || $c['varName'] == "faceSize"){
			echo "<tr id=\"faceSettings\" style=\"" . isEnabled($configuration['enableFaces']['value'], "checked") . "\">";
		} else if($c['varName'] == "faceGridWidth"){
			echo "<tr id=\"faceGridSettings\" style=\"" . isEnabled($configuration['enableFaces']['value'], $configuration['faceGrid']['value']) . "\">";
		} else {
			echo "<tr>";
		}
		 echo "<td width=\"50%\" class=\"setting\">". $c['name'] ."<br />
			<em class=\"smalltext\">". $c['description'] . "</em></td>
		  <td valign=\"top\" class=\"setting\">";
		  
		  //if the input is a boolean
		  if($c['type'] == "boolean"){
			  if($c['varName'] == "enableFaces"){
				  echo "<input id=\"enableFaces\" type=\"checkbox\" name=\"enableFaces\" onClick=\"showhidefield('enableFaces', 'faceSettings');showhidefield('enableFaces', 'faceGridSettings');\" " . $configuration['enableFaces']['value'] . "/>";  
			  } else if ($c['varName'] == "faceGrid"){
				  echo "<input id=\"faceGrid\" type=\"checkbox\" name=\"faceGrid\" onClick=\"showhidefield('faceGrid', 'faceGridSettings')\" " . $configuration['faceGrid']['value'] . "/>";
			  } else {
				  echo "<input type=\"checkbox\" name=\"". $c['varName'] . "\" " . $c['value'] . "/>";
			  }
		  //if the input us an int
		  } else if($c['type'] == "int"){
			  echo "<input type=\"number\" min=\"1\" max=\"999\" style=\"width:40px;\" name=\"". $c['varName'] . "\" value=\"". $c['value'] . "\"/>";
			  
		  //otherwise just use default input.
		  } else {
			  echo "<input type=\"text\" name=\"". $c['varName'] . "\" value=\"". $c['value'] . "\"/>";
		  }
		 
		 echo "</td></tr>";	
		 if($c['varName'] == "enableRankColors"){
			 echo "<tr>
      <td colspan=\"2\" class=\"category\">Face Config</td>
    </tr>";
		 }
	}
	
	echo "<tr>
      <td colspan=\"2\" align=\"center\" class=\"category\"><input type=\"submit\" name=\"saveConfig\" value=\"Save Config\" /> <input type=\"submit\" name=\"cancelConfig\" value=\"Cancel\" /></td>
    </tr></table>
	<input type=\"hidden\" name=\"passcode\" value=\"" . $passcode . "\" /></form>";	
}

function saveConfig($configuration){
	if(isset($_POST['template'])){$configuration['template']['value'] = $_POST['template'];}
	
	$configuration['enableRankColors']['value'] = "false";
	if(isset($_POST['enableRankColors']) && $_POST['enableRankColors'] == "on"){$configuration['enableRankColors']['value'] = "true";}
	
	$configuration['enableFaces']['value'] = "false";
	if(isset($_POST['enableFaces']) && $_POST['enableFaces'] == "on"){$configuration['enableFaces']['value'] = "true";}
	
	if(isset($_POST['faceSize'])){$configuration['faceSize']['value'] = $_POST['faceSize'];}
	
	$configuration['faceGrid']['value'] = "false";
	if(isset($_POST['faceGrid']) && $_POST['faceGrid'] == "on"){$configuration['faceGrid']['value'] = "true";}
	
	if(isset($_POST['faceGridWidth'])){$configuration['faceGridWidth']['value'] = $_POST['faceGridWidth'];}
	
	$fh = fopen("../config.php", 'r') or die("Error: Can't open config.php. On Linux, chmod this file to 664 or 666.");
	$configFile = fread($fh, filesize("../config.php"));
	fclose($fh);
	
	foreach($configuration as $c){
		if($c['type'] == "boolean"){
			$configFile = str_replace("$" . $c['varName'] . " = " . getBoolean($c['oldValue']), "$" . $c['varName'] . " = " . $c['value'], $configFile);
		} else if ($c['type'] != "string"){
			$configFile = str_replace("$" . $c['varName'] . " = " . $c['oldValue'], "$" . $c['varName'] . " = " . $c['value'], $configFile);
		} else {
			$configFile = str_replace("$" . $c['varName'] . " = \"" . $c['oldValue'] . "\"", "$" . $c['varName'] . " = \"" . $c['value'] . "\"", $configFile);
		}
	}
	
	
	//Open file for writing.
	$fh = fopen("../config.php", 'w') or die("Error: Can't open config.php. The file either doesn't exist or the correct permissions. On Linux, chmod this file to 664 or 666.");
		
	//Write to and close the file
	fwrite($fh, $configFile);
	fclose($fh);
}

function isEnabled($var, $var2){
	if($var == "checked" && $var2 == "checked"){
		return "display:table-row;";
	} else {
		return "display:none;";	
	}
}

function getBoolean($boolean){
	if($boolean == ""){
		return "false";	
	} else {
		return "true";	
	}
}

function updateConfig($configuration){
	$lines = file("../config.php") or die("Error: Can't open config.php. The file either doesn't exist or the correct permissions. On Linux, chmod this file to 664 or 666.");
	$newConfig = $lines;
	
	//Find which variables are in the config file.
	foreach($configuration as $c){
		foreach($lines as $lineNum => $line){
			if (preg_match_all ("/(\\$" . $c['varName'] . " = )/is",$line, $matches)){	
				$configuration[$c['varName']]['settingLocation'] = $lineNum;
			}
		}	
	}
	
	//Place the ones that are missing.
	$changeCount = 0;
	$count = 0;
	foreach($configuration as $c){
		if($c['settingLocation'] < 0){
			$newPos = 0;
			if($count > 0){$newPos = $configuration[array_key_index($configuration, $count - 1)]['settingLocation'];}
			array_splice($newConfig, $newPos + 1, 0, array("\n", "# " . $c['description'] . "\n", "$" . $c['varName'] . " = " . $c['defaultValue'] . ";\n"));
			$changeCount++;
		}
		$count++;
	}
	
	if($changeCount != 0) {
		//Convert array into a string
		$stringConfig = "";
		for($i = 0; $i < count($newConfig); $i++){
			$stringConfig .= $newConfig[$i];
		}
		
		//Open file for writing.
		$fh = fopen("../config.php", 'w') or die("Error: Can't open config.php. The file either doesn't exist or the correct permissions. On Linux, chmod this file to 664 or 666.");
		
		//Write to and close the file
		fwrite($fh, $stringConfig);
		fclose($fh);
	}
	
	return $changeCount;	
}

function array_key_index($arr, $index) {
    $i = 0;
    foreach(array_keys($arr) as $k) {
        if($i == $index) return $k;
        $i++;
    }
}

function checkVersion($curVer){
	$lines = file("http://dev.bukkit.org/server-mods/simple-player-list/files.rss");
	$version = "";
	foreach($lines as $lineNum => $line){
		if(preg_match("/(<title>)(v)([+-]?\\d*\\.\\d+)(<\/title>)/is", $line, $matches) || preg_match("/(<title>)(v)([+-]?\\d*\\.\\d+.\\d+)(<\/title>)/is", $line, $matches) ){
			$version = rawVersion($matches[3]);
			break;
		}
	}
	
	$curVer = rawVersion($curVer);
	if($curVer < $version){
		return "<table width=\"500px\" align=\"center\" style=\"background:#fffac7; border:1px solid #e0d98a; color:#9d9111;\"><tr><td align=\"center\"><strong>New version available - <a href=\"http://dev.bukkit.org/server-mods/simple-player-list/\" target=\"_blank\">Click Here</a></strong></td></tr></table>";	
	}
}

function rawVersion($version){
	$version = str_replace(".", "", $version);
	if(strlen($version) == 2){
		$version .= "0";	
	}
	return intval($version);
}
echo checkVersion($version);
echo "<br/><center><em class=\"smalltext\">Simple Player List v$version</em></center>";

function printBulletins(){
	echo "<center>";
	echo "<script charset=\"utf-8\" src=\"http://widgets.twimg.com/j/2/widget.js\"></script>
<script>
new TWTR.Widget({
  version: 2,
  type: 'search',
  search: '#splbukkit from:flabaliki',
  interval: 30000,
  title: '',
  subject: 'Bulletins',
  width: 500,
  height: 300,
  theme: {
    shell: {
      background: '#c1b7a6',
      color: '#000000'
    },
    tweets: {
      background: '#f1eade',
      color: '#000000',
      links: '#786d5b'
    }
  },
  features: {
    scrollbar: false,
    loop: false,
    live: false,
    behavior: 'all'
  }
}).render().start();
</script>";	
}
	echo "</center>";
?>
</body>
</html>