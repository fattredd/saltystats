
# Salty Stats

This project intends to keep track of fights on SaltyBet and track win ratios for the fighters.

This is really a way of me learning how node/expressjs/socket.io/jade interact. Consider it something of a basics playground. As such I'll be including links to basic resources and tools.

# Installation

Install should be pretty straightforward. First install [NodeJs](https://nodejs.org/en/), then clone the repo.  
Then you'll need to install yarn via the command line with ```npm install -g yarn```. Note that you may need to
restart VScode for the commands to work in the internal terminal.  
  
From there, you should cd into the repo and install the modules we're using with ```yarn install```. Then ```npm start``` will start everything up.
The web server is located at <http://localhost:3000>, and the api (currently nonfuctional) can be found at <http://localhost:3000/api>.

## Tools used

I used VSCode as an editor, and DBeaver as a convenient way of watching/editting the sqlite db. Most development was done on linux due to convenience, but nothing I used trapped me there. You should be able to do the same on any platform.

## Resources

- [Node Intro](https://codeburst.io/the-only-nodejs-introduction-youll-ever-need-d969a47ef219)
- [Jade syntax](https://naltatis.github.io/jade-syntax-docs/)
- [Node web scraping](https://blog.bitsrc.io/https-blog-bitsrc-io-how-to-perform-web-scraping-using-node-js-5a96203cb7cb)
- [Socket.io](https://markrabey.com/2014/05/05/real-time-analytics-with-node-js-socket-io/)
- [Node structure](https://stackoverflow.com/questions/5778245/expressjs-how-to-structure-an-appication)
- [Promises](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-a-promise-27fc71e77261)
- [Puppeteer](https://medium.com/stink-studios/real-time-scraping-using-puppeteer-40495b5fc270)

## Considerations

- NoSQL instead of SQL
- Sockets or reactjs?
- Crop scrots for player images?
- ```Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0```
