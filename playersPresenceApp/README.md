


# LOCAL DEV SERVER

cd public_dev/
// npm http server
http-server


# Build cache file :

grunt ngtemplates
 => creates cache/templates.js, containing html templates from /public_dev/templates/*.html


# grunt :

 grunt build deals with everything, prepares complete version in public folder.
 
 
# parse deploy :
 
 Go to "players-presence" got root and push. It will build grunt, prepare production version, cleanup dev files, then execute "parse deploy"