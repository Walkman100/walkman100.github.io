@echo off
title Redirect Generator
color F0
set redir=%random%
set /P dest=Redirect destination: 

echo ---> r\%redir%.html
echo layout: redirect>> r\%redir%.html
echo dest: %dest%>> r\%redir%.html
echo --->> r\%redir%.html
echo Redirect r\%redir% created, goes to: %dest%
pause
