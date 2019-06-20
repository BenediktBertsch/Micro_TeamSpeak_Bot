<p align="center">
  <img src="https://raw.githubusercontent.com/BenediktBertsch/Micro_TeamSpeak_Bot/master/logo.png" width="150">
</p>

# TeamSpeak Bot

TeamSpeak 3 Serverquery Bot to create statistics of registered Users

## Build the project with your data

First you need [NodeJS](https://nodejs.org/en/) its the runtime.
Then go first into the api folder and run `npm install` it will install all the dependencies.

To customize it to yourself you got one main `config.json`.
This File is important for the TeamSpeak Bot and API.

## Run it with Docker

The project was created for Docker. Use the environment variables to customize the Application for yourself. The variables are: 
	`APIport`
	`APIhost`
	`TShost`
	`TSqueryport`
	`TSserverport`
	`TSqueryusername`
	`TSquerypassword`
	`TSnickname`
	`runningPort`

To run it for example: docker run -e APIport=5000 -e APIhost='192.168.2.2' -e TShost='192.168.2.3' -e TSqueryport=10011 -e TSserverport=9987 -e TSqueryusername='RegistrationBot' -e TSquerypassword='asdgasdg' -e TSnickname='Registration Bot' TSBot
