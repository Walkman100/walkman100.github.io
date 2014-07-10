<?php
//--------------------------------------------------//
# Simple Player List by Flabaliki

# Edit this file.
//--------------------------------------------------//

# Enter your passcode here, this must be the same
# as the one entered in your plugin config.yml file.
$passcode = "HXFwSF7ilfuee7r8";
# generate here: http://www.random.org/strings/?num=1&len=16&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new

# This feature requires PHP GD, it will enable
# the face of a users minecraft skin to display next
# to their name on the list.
$enableFaces = false;

#Number of faces to display on each row of the grid.
#REQUIRES faceGrid set to true;
$faceGridWidth = 5;

#This will allow the use of colours in rank names.
#These are the same colours you use in Minecraft chat.
#Eg &e &f
$enableRankColors = true;

#Size of the user faces in pixels.
$faceSize = 16;

# This will display the online users in a grid format using only their faces, names will popup on hover.
$faceGrid = false;

# The following variables; [Name], [IP], [Players], 
# and [Slots] will be replaced by their respective content.
# Put them in any order you would like, you can even remove
# them completely.
$template = "[Name][IP][Players][Slots]";

# --------------------------------------------------------- #
# DO NOT EDIT ANYTHING BELOW THIS LINE
# --------------------------------------------------------- #
?>