@echo off
title Redirect Generator
color F0
cd /d %~dp0
SET /P redir=Redirect name: 
set /P dest=Redirect destination: 

echo ---> %redir%.html
echo layout: redirect>> %redir%.html
echo dest: %dest%>> %redir%.html
echo --->> %redir%.html
git add %redir%.html
