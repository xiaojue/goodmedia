set htdocs=E:/apache/htdocs/gm/
java -jar %htdocs%tool/jsdoc/jsrun.jar %htdocs%tool/jsdoc/app/run.js -r=10 -x=js,css -d=%htdocs%doc %htdocs%src/ -t=%htdocs%tool/jsdoc/templates/jsdoc
pause
exit
