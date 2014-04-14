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
    
Now you can browse to http://localhost:8081 and you should see a very basic welcome message.

If you inspect the current DOM (right-click anywhere in the view and choose `Inspect Element`), you'll notice that only the `<div id="welcome">` element contains child elements. This is because galaxy.js loaded a separate file named `views/welcome.html` and injected its contents into that element.

The other elements `user-list`, `user-detail`, `location-list` and `location-detail` are still empty.

Click on `Show Users` link and you'll be presented with another, very basic view with some additional links. If you inspect the DOM again, you'll see that the `user-list` element now contains child elements, and the `welcome` element is now hidden, but the content is still there, ready to be shown again when you click the `Home` link.

Building a modular Knockout/Require application this way allows you to build up the DOM for each view (and even child views, or widgets) in separate HTML files and only inject them as needed.

# Quick Start

## Create a project directory
Create a new directory for your application.

    mkdir ~/projects/intergalactic && cd ~/projects/intergalactic

## Install Bower and components

    npm install -g bower

Once Bower installation is complete, you need to use it to grab all the required components. For galaxy.js projects, that's just require.js and knockout.js. 

    bower install requirejs knockoutjs galaxyjs

## Create the base DOM

Now you can start coding. The first step is to create the base DOM that galaxy.js will use to inject the DOM of your views. The only requirement is that you use require.js. So create a `index.html` file and put in the following code.

    <!DOCTYPE HTML>
    <html>
        <head>
            <title>galaxy.js</title>
        </head>

        <body>
            <div id="welcome"></div>
        </body>

        <script data-main="app/application" src="app/bower_components/requirejs/require.js"></script>
    </html>


## Create a view template

## Construct a star base

### The galactic registry

### Listen to galactic communication

## Configuration

### Setting up galactic routes

### Creating your galaxy

## Warping spacetime to visit star bases
In galaxy, there is a function named `StarChartConstructor`

1. Add links to view template
1. Handle link clicks in view model
1. Usage 1 (no payload) `$galaxy.warp().to('users').engage();`
1. Usage 2 (smuggled payload) `$galaxy.warp().to('userdetail').with({user: user}).engage();`
1. Usage 3 (url + smuggled payload) `$galaxy.warp().to('product/'+product.id).with({product: product}).engage();`







  [1]: knockoutjs.com
  [2]: requirejs.org
  [3]: http://expressjs.com/