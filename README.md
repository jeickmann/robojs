# roboJS
## Introduction
roboJS is a clone of the popular robocode program to JavaScript. You can code your own robot in JavaScript and have it fight other bots. If robocode itself is unfamiliar to you, head over to http://robowiki.net/ to learn more about it.

roboJS tries to mirror the behaviour of robocode as closely as possible.

## Setup
Just clone the repository and get it served from an http server. The easiest way (if you have node.js installed) is to install http-server
> npm install http-server
and then run http-server in the directory of roboJS
> http-server

You can then start roboJS by simply using your favorite webbrowser and open http://localhost:8080

## Starting roboJS
the battle runner is started using by simply opening the roboJS-Folder via http in a Webbrowser (please note that you need a webbrowser that supports HTML5 Webworkers, a recent Chrome, Firefox or Safari should do the job).

You can control the battle running using Get-Parameters. The most important ones are bot1 and bot2 which determine what oppponents the runner will load. The values can be simply robot-names. The runner will then load the file main.js in the appropriate subfolder of the "bots"-subfolder.

Example:
To load a battle between the two bots "tracker" and "walls", simply open

> http://localhost:8080/?bot1=tracker&bot2=walls

Each battle lasts 10 rounds by default. You can change the number of rounds by specifying the parameter rounds

> http://localhost:8080/?bot1=tracker&bot2=walls&rounds=20

In order to create your own robot, it is easiest to copy the folder bots/template to a new folder in the "bots"-directory and make changes there. The bots/template/main.js contains all the necessary code to get a robot running and a short documentation to the methods you can use to control your robot. Don't forget to change your robots name.

I will add a more in-depth documentation in the future.