#galaxy.js

##A lightweight library for building modular applications

galaxy.js was written to allow [Knockout][1] developers to inject HTML template fragments into the DOM on an as-needed basis. So instead of having all of the DOM elements downloaded to every client, only the bare minimum is sent to each client on the initial request, and as more views are accessed, only then does the additional DOM get downloaded and injected into the current document.

galaxy.js was born from the stellar nursery of [stackd.io](http://www.stackd.io/). It is a utility I wrote that allows people writing single page applications (SPAs) with Knockout and [Require][2] to have a lightweight solution that gives them a modular application with DOM binding and ad-hoc DOM injection. It also utilizes the [Q](https://github.com/kriskowal/q) library to implement Promises. For it's event system, I chose [Postal.js](https://github.com/postaljs/postal.js) because it combines just the right amount of features while still having a small footprint.

#Getting started

## Running the example application
In the `example` directory, I put together a very quick SPA that displays four different views, each with its own view model, with some minimal data binding.

After you clone the repo, you can serve up the application by first installing Node.js if you don't have it.

    sudo apt-get install nodejs  # For Ubuntu and its ilk
    sudo yum install nodejs      # For CentOS and its ilk
    
This will install `npm`, the Node package manager service as well. Then you can install a basic HTTP server.

	sudo npm install http-server -g

Next, you go to the example application root folder and start the server.

	cd galaxy.js/example
	http-server ./
    
Now you can browse to https://localhost:8081 and you should see a very basic welcome message.

If you inspect the current DOM, you'll notice that only the `<div id="welcome">` element contains child elements. This is because galaxy.js loaded a separate file named `views/welcome.html` and injected its contents into that element.

The other elements `user-list`, `user-detail`, `location-list` and `location-detail` are still empty.

Click on `Show Users` link and you'll be presented with another, very basic view with some additional links. If you inspect the DOM again, you'll see that the `user-list` element now contains child elements, and the `welcome` element is now hidden (but the content is still there).

Building a modular Knockout/Require application this way allows you to build up the DOM for each view (and even child views, or widgets) in separate HTML files and only inject them as needed.

##Building your own application
###Dependencies
First you need to install [Bower](http://bower.io/)

    npm install -g bower

Then use `bower` to pull these dependencies.
    
    bower init    # Follow instructions for initializing your project
    bower install requirejs --save
    bower install knockoutjs --save
    bower install q --save


  [1]: knockoutjs.com
  [2]: requirejs.org
  [3]: http://expressjs.com/