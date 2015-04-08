# Thesis

This is going to be the Project for my Bachelor's Thesis. It will be an realtime audience-response system. I'm using node, express, browserify & ampersand.js, aswell as gulp for the build-process.

Watch my quick demo on [YouTube](https://www.youtube.com/watch?v=BX8_fiTgHqM):

[![White Desk demo](http://img.youtube.com/vi/BX8_fiTgHqM/0.jpg)](http://www.youtube.com/watch?v=BX8_fiTgHqM) 

## Prerequisites

You need a reasonably recent version of node.js (~0.10.X) and npm. For the development setup you need gulp (`npm install gulp`).

## Installation

First, Clone the Repository: `git clone https://github.com/moolen/thesis.git`, copy `config-sample.js` to `config.js` and modify it if you need to. Install the dependencies with `npm install`. And you are ready to go.

Run the app with `node app.js`, for development run `gulp watch` so the styles & js gets compiled on the fly.

Now you can point your browser to `localhost:3000` (or whatever you configured in your config.js).

### Known issues

#### Running behind Reverse-Proxy
We're using Websockets and we have to proxy the request to the node-instance.
He're is a sample configuration for Apache using `whitedesk.local` as our domain.
Be sure to have the `mod_proxy` and `mod_proxy_wstunnel` modules enabled.

```
<VirtualHost whitedesk.local:80>

	ServerName whitedesk.local

	RewriteEngine On
	RewriteCond %{REQUEST_URI}  ^/socket.io            [NC]
	RewriteCond %{QUERY_STRING} transport=websocket    [NC]
	RewriteRule /(.*)           ws://127.0.0.1:3000/$1 [P,L]

	ProxyPass / http://127.0.0.1:3000/
	ProxyPassReverse / http://127.0.0.1:3000/

	<Location />
		ProxyPass http://127.0.0.1:3000/
		ProxyPassReverse http://127.0.0.1:3000/
	</Location>

</VirtualHost>
```