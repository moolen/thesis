# Thesis

This is the Project of my Bachelor's Thesis. It is an realtime audience-response system. I'm using node, express, browserify & ampersand.js, aswell as gulp for the build-process.

## Prerequisites

You need a reasonably recent version of node.js (~0.12.X), npm and you need gulp to build the frontend-assets (`npm install gulp`).

## Installation

First, Clone the Repository: `git clone https://github.com/moolen/thesis.git`, copy `config-sample.js` to `config.js` and modify it to your needs. Install the dependencies with `npm install`. And you are ready to go.

Run the app with `node app.js`, for development run `gulp watch` so the styles & js gets compiled on the fly.

Now you can point your browser to `localhost:3000` (or whatever you configured in your config.js) to see that the page is rendering.

You should run the node app behind a reverse-proxy and add an virtual-host entry to your webserver configuration. The following example uses apache2.4 with mod_proxy and mod_proxy_wstunnel. The Application runs at whitedesk.local:80 and forwards the traffic to localhost:3000 (the node instance).


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

### Troubleshooting
If you cant get the app running please open an issue. The Websocket connection might not be working properly if you "speak" to the node instance directly. Please use an Proxy so that the app appears to be running on port 80
