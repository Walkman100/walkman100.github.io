#@echo off
#title Redirect Generator
#color F0
#cd /d %~dp0
#SET /P redir=Redirect name:
#set /P dest=Redirect destination:

echo ---> $REDIR.html
echo layout: redirect>> $REDIR.html
echo dest: $DEST>> $REDIR.html
echo --->> $REDIR.html
git add $REDIR.html
