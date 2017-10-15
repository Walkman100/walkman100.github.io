#!/usr/bin/env bash
cd `dirname $0`

read -r -p "Redirect name: " REDIR;
read -r -p "Redirect destination: " DEST;

echo ---> $REDIR.html
echo layout: redirect>> $REDIR.html
echo dest: $DEST>> $REDIR.html
echo --->> $REDIR.html
git add $REDIR.html
