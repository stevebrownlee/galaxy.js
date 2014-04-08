#galaxy.js

##A lightweight library for building modular browser applications with Require and Knockout

galaxy.js was written to allow [Knockout][1] developers to inject HTML template fragments into the DOM on an as-needed basis. So instead of having all of the DOM elements downloaded to every client, only the bare minimum is sent to each client on the initial request, and as more views are accessed, only then does the additional DOM get downloaded and injected into the current document.

galaxy.js was born from the stellar nursery of [stackd.io](http://www.stackd.io/). It is a utility I wrote that allows people writing single page applications (SPAs) with Knockout and [Require][2] to have a lightweight solution that gives them a modular application with DOM binding and ad-hoc DOM injection. It also utilizes the [Q](https://github.com/kriskowal/q) library to implement Promises. For it's event system, I chose [Postal.js](https://github.com/postaljs/postal.js) because it combines just the right amount of features while still having a small footprint.

# Running the example application
In the `example` directory, I put together a very quick SPA that displays four different views, each with its own view model, with some minimal data binding.

## Clone the repo

    mkdir ~/projects && cd ~/projects
    git clone https://github.com/chortlehoort/galaxy.js.git

## Install Node if you don't have it

    sudo apt-get install nodejs  # For Ubuntu and its ilk
    sudo yum install nodejs      # For CentOS and its ilk
    
This will also install `npm`, the Node package manager service as well. Then you can install a basic HTTP server.

## Install a basic Node HTTP server 
The `http-server` module is just a very basic project that will serve static files from the directory of your choice.

    sudo npm install -g http-server

## Serve the application
Next, you go to the example application root folder and start the server.

    cd ~/projects/galaxy.js/example
    http-server ./
    
Now you can browse to https://localhost:8081 and you should see a very basic welcome message.

If you inspect the current DOM (right-click anywhere in the view and choose `Inspect Element`), you'll notice that only the `<div id="welcome">` element contains child elements. This is because galaxy.js loaded a separate file named `views/welcome.html` and injected its contents into that element.

The other elements `user-list`, `user-detail`, `location-list` and `location-detail` are still empty.

Click on `Show Users` link and you'll be presented with another, very basic view with some additional links. If you inspect the DOM again, you'll see that the `user-list` element now contains child elements, and the `welcome` element is now hidden, but the content is still there, ready to be shown again when you click the `Home` link.

Building a modular Knockout/Require application this way allows you to build up the DOM for each view (and even child views, or widgets) in separate HTML files and only inject them as needed.

## Building your own application
### Create a project directory
Create a new directory for your application.

    mkdir ~/projects/intergalactic && cd ~/projects/intergalactic

### Install [Bower](http://bower.io/)

    npm install -g bower

While in your project's root directory, use `bower` to initialize your project.

    bower init    # Follow instructions for initializing your project

### Dependencies: Method 1 (copy & paste)
To get the bare minimum needs to start working with galaxy.js, you can copy the `galaxy.js\example\app\bower.json` into your project directory and then run the following command.

    cd ~/projects/intergalactic
    cp /{path to galaxy}/galaxy.js/example/app/bower.json .
    bower install

### Dependencies: Method 2 (do it yourself)

#### Install Require, Knockout, Q & Postal
galaxy.js needs the following `bower` packages pulled. Make sure that you grab the `0.9.7` version of Q.

    bower install requirejs knockoutjs q postal.js --save 

#### Compile Q
The Q library does not include a minified version in their Bower package, so I suggest you compile that project to get it.

    cd bower_componenets/q && npm install & cd ../..
    
After running that command you should see the file `bower_components\q\q.min.js`.

  [1]: knockoutjs.com
  [2]: requirejs.org
  [3]: http://expressjs.com/