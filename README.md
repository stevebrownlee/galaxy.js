# galaxy.js

**A lightweight library for building modular browser applications with Require and Knockout**

galaxy.js was written to allow [Knockout][1] developers to inject HTML template fragments into the DOM on an as-needed basis. So instead of having all of the DOM elements downloaded to every client, only the bare minimum is sent to each client on the initial request, and as more views are accessed, only then does the additional DOM get downloaded and injected into the current document.

galaxy.js is a utility I wrote that allows people writing single page applications (SPAs) with Knockout and [Require][2] to have a lightweight solution that gives them a modular application with DOM binding and ad-hoc DOM injection. It also utilizes the [Q](https://github.com/kriskowal/q) library to implement Promises. For it's event system, I chose [Postal.js](https://github.com/postaljs/postal.js) because it combines just the right amount of features while still having a small footprint.

## Running the example application
In the `example` directory, I put together a very quick SPA that displays four different views, each with its own view model, with some minimal data binding.

### Clone the repo

```
mkdir ~/projects && cd ~/projects
git clone https://github.com/chortlehoort/galaxy.js.git
```

### Install Node if you don't have it

```
sudo apt-get install nodejs  # For Ubuntu and its ilk
sudo yum install nodejs      # For CentOS and its ilk
```
    
This will also install `npm`, the Node package manager service as well. Then you can install a basic HTTP server.

### Install a basic Node HTTP server 
The `http-server` module is just a very basic project that will serve static files from the directory of your choice.

    sudo npm install -g http-server

### Serve the application
Next, you go to the example application root folder and start the server.

    cd ~/projects/galaxy.js/example/public
    http-server ./ 

Now you can browse to http://localhost:8081 (or whichever port it reports it is using) and you should see a very basic welcome message.

If you inspect the current DOM (right-click anywhere in the view and choose `Inspect Element`), you'll notice that only the `<div id="welcome">` element contains child elements. This is because galaxy.js loaded a separate file named `views/welcome.html` and injected its contents into that element.

The other elements `user-list`, `user-detail`, `location-list` and `location-detail` are still empty.

Click on `Show Users` link and you'll be presented with another, very basic view with some additional links. If you inspect the DOM again, you'll see that the `user-list` element now contains child elements, and the `welcome` element is now hidden, but the content is still there, ready to be shown again when you click the `Home` link.

Building a modular Knockout/Require application this way allows you to build up the DOM for each view (and even child views, or widgets) in separate HTML files and only inject them as needed.

## Quick Start

### Create a project directory
Create a new directory for your application.

```
mkdir ~/projects/intergalactic
cd ~/projects/intergalactic
```

### Install Bower

```
npm install -g bower
```

### Install galaxy.js

```
bower install galaxy.js --save    
```

If you're not familiar with Bower, the `--save` flag will automatically create a `bower.json` file with the name and version of each Bower component you installed.

### Create the base DOM

Now you can start coding. The first step is to create the base DOM that galaxy.js will use to inject the DOM of your views. The only requirement is that you use require.js. So create a file in your directory named `index.html`. Paste in the following code.

```
<!DOCTYPE HTML>
<html>
  <head>
      <title>galaxy.js</title>
  </head>

  <body>
    <div id="welcome"></div>
  </body>

  <script data-main="application" src="app/bower_components/requirejs/require.js"></script>
</html>
```
    
### Create require.js application file

Create a file named `application.js` in the same directory as your HTML file. This is needed by require.js so that it knows where all the libraries that you want to use are located. For galaxy.js, we need Knockout, Underscore (used by require), postal.js, Q, and of course galaxy.js. Here's an example application file, but you can suit to your environment and needs.

---

###### File: public/application.js

```
requirejs.config({
  paths: {
    'knockout': 'bower_components/knockoutjs/dist/knockout',
    'q': 'bower_components/q/q',
    'lodash': 'bower_components/lodash/lodash.min',
    'postal': 'bower_components/postal.js/lib/postal.min',
    'galaxy': 'bower_components/galaxy.js/dist/galaxy.min'
  }
});

require(['galaxy'], function () {
  // This is where we will configure galaxy.js
});
```

---

### Create a dynamic view

First, create some basic directories for use later on.

```
mkdir views
mkdir viewmodels
```

Now we can create some HTML in a new file named `views/welcome.html` and it will contain the markup that we want to be visible when the user is on the Welcome page.

So create that file and put the following simple code in it.

###### File: public/view/welcome.html

```
<h1>Welcome to galaxy.js</h1>
<div>
  <a href='#' data-bind='click: showUsers'>Show Users</a>
</div>
```

### Create a view model (a.k.a. a Star Base)

Now, the way Knockout works is having view models that control what the user sees on each view, and what will happen when the user interacts with elements on a particular view. The view model can be a simple object, or function, that returns some properties and methods.

Galaxy.js also is modular by default, using the require.js library to break the application up into modules. So let's create a basic module.

---
###### File: viewmodel/welcome.js

    define(function() {
        var starbase = {};

        starbase.showUsers = function() {
            console.log('User clicked on user link');
        };

        return starbase;
    });
    
As you can see this view model returns a very simple object. It has one function that will log a message to the console. This `starbase.showUsers` function, for those who are familiar with Knockout already know, is bound by Knockout to the `data-bind='click: showUsers'` directive in our `welcome.html` template.

When the user clicks on that link, a message will be logged to the console.

### Create a static view

Static views are ones that you will want to be rendered on every page the user sees. For example, the navigation or the footer information. All views that will controlled by galaxy will be in directory named `views` so go ahead and create that now.

For the quick start, we'll just create a simple navigation view. Create a `navigation.html` file in your `views` directory and put in the following code.

---
###### File: views/navigation.html

```
<nav>
  <span>Home</span>
  <span>Users</span>
  <span>Products</span>
</nav>
```

Then we need to tell galaxy.js that this view should **always** be rendered. Open your `application.js` file and make the main require statement look like this.

```
require(['galaxy'], function () {
  $galaxy.static('navigation');
});
```

### Create the navigation star base

Now create a `viewmodels/navigation.js` file and put in the following code. It's basic for now since we're just rendering the view.

---
###### File: viewmodels/navigation.js
```
define(['knockout', 'galaxy'],
  function(ko, $galaxy) {
    var starbase = {};
    
    return starbase;
  }
);
```

### The galactic registry

To work within galaxy.js, each view model  needs to have three (3) properties set on it that are required in order for each it to be successfully registered in the Galactic Federation - which is just an array used internally by galaxy.js to keep track of which view models have already been identified.

1. **id** - This is the unique identifier for the view model for galaxy.js to use
2. **templatePath** - This is the path to the file containing the HTML for the view that this model is bound to. In this example case, it would be `welcome.html`.
3. **domBindingId** - This specified which DOM element id that the HTML contained in the bound template will be injected into. In this example case, it would be `#welcome`. This means that once `welcome.html` is loaded, its contents will be put inside of the `<div id="welcome">` element that we put in `index.html`.

Here's what the view model should looks like to have it work with galaxy.js.

```
define(['galaxy'],
  function ($galaxy) {
    var starbase = {};

    /*
      Galactic Registration
    */
    starbase.id = 'welcome';
    starbase.templatePath = 'welcome.html';
    starbase.domBindingId = '#welcome';

    /*
      View model functions
    */
    starbase.showUsers = function() {
      console.log('User clicked on user link');
    };

    return starbase;
  }
);
```

### Listen to galactic communication

galaxy.js uses [postal.js][3] to set up an event channel for your application to listen for specific events that happen during the lifetime of your view model. Also, you can use this channel to broadcast your own, custom events for your application. This channel is exposed to view models as the `network` property on the galaxy library.

#### .joined() standard event

Once your view model has been added to the Galactic Federation, galaxy.js will broadcast the `joined()` event, prepended withe the view model's id that you can subscribe to. Here's how to subscribe to that event for a view model with an id of **welcome**.

    $galaxy.network.subscribe('welcome.joined', function () {
        
    });

#### .bound() standard event

After the template for a view model is loaded, and bound to the view model by Knockout, galaxy.js will broadcast the `bound()` event, prepended withe the view model's id that you can subscribe to. Here's how to subscribe to that event for a view model with an id of **welcome**.

```
$galaxy.network.subscribe('welcome.bound', function () {
    
});
```

#### .docked() standard event

The event that you will be using most often is `docked()`. This event is broadcast after the entire life cycle is complete for showing a view. The view exists in the Federation, the corresponding HTML template has been loaded and bound to the view model, the current view has been made visible, and all other views have been hidden.

This event also carries the entire data payload for the view. The payload will be discussed more below in the routing and warping sections, but, briefly, the payload will contain any URL parameter data, and any further data that you specify when navigating to a specific view.

So let's look at an updated Star Base (view model) that listens for when it's been rendered and made visible to the user.

---

```
define(['galaxy'],       // Use require.js to import galaxy.js
  function($galaxy) {  // Add the argument to the import function
    var starbase = {};

   /*
     *********************************************************
     ******  S T A R B A S E   R E G I S T R A T I O N  ******
     *********************************************************
    */
    starbase.id = 'welcome';
    starbase.templatePath = 'welcome.html';
    starbase.domBindingId = '#welcome';

    /*
     *  ======================================================
     *   G A L A C T I C   E V E N T   L I S T E N E R S
     *  ======================================================
     */
    $galaxy.network.subscribe('welcome.docked', function (payload) {
      if (payload.hasOwnProperty('user') && payload.user.hasOwnProperty('id')) {
        starbase.showWelcomeMessage();
      }
    });
    
   /*
    *  =======================================================
    *   V I E W   M O D E L   F U N C T I O N S
    *  =======================================================
    */        
    starbase.showUsers = function() {
      console.log('User clicked on user link');
    };

    starbase.showWelcomeMessage = function() {
      // Do something more interesting than log to console
      console.log('Welcome to galaxy.js');
    };

    return starbase;
  }
);
```

---

## Configuration

Now that you have a basic view, and a view model that handles interactions and data binding, it's time to start configuring your Galaxy so that it will start working.

### Setting up galactic routes

The routing in galaxy.js is straightforward and simple. You define what string patterns to look for in the URL hash, and when any of those patterns are detected by galaxy.js, the corresponding view model is loaded, if it hasn't been already, and the view is made visible and the `viewModelId.docked()` method is fired.

#### Basic route
Here's how to set up a basic route.

```
$galaxy.route('home').to('welcome');
```
    
For this route, when galaxy.js detects a URL hash value like `http://localhost/#home`, then it will try to load and register a view model named `welcome.js` from your view model directory (see below for defining that).

You may also specify a callback function in the routing directive, using the `.then()` chained function, if you want something specific to happen every time that a particular view is docked.

```
$galaxy.route('users').to('user.list').then(function () {
  console.log('User list has been docked into the viewport');
});
```

#### Route with parameters

You can also specify some variable route segments by prepending them with a colon. For example, if you want a URL hash in the format of `#users/1/` to mean "show a user profile whose `id` value is 1", you can set up parameterized route segments like this.

```
$galaxy.route('users/:id').to('user.details');
```

So anytime the string `users` is detected, following by another segment, whatever string is in that segment will be assigned to an `id` key and delivered as a payload to the view model when the `docked()` event is published. Here's how you would access that variable in the view model.

```
$galaxy.network.subscribe('user.details.docked', function (payload) {
  console.log(payload.id);  // This would output '1' in the console
});
```

#### Example
        
The best place to set your base routes is in your Require initialization file. Here's what it would look like with some basic routes set up.

---

###### File: application.js

```
requirejs.config({
  paths: {
   'knockout': 'bower_components/knockout.js/knockout',
   'q': 'bower_components/q/q.min',
   'underscore': 'bower_components/underscore/underscore',
   'postal': 'bower_components/postal.js/lib/postal.min',
   'galaxy': 'bower_components/galaxy.js/galaxy.min'
   }
});

require(['galaxy'], function ($galaxy) {
  // Set up static views
  $galaxy.static('navigation');

  // Add some routing directives
  $galaxy.route('home').to('welcome');
  $galaxy.route('users').to('user.list');        

  $galaxy.route('users').to('user.list');
  $galaxy.route('users/:id').to('user.detail');
  $galaxy.route('users/:id/edit').to('user.edit');
});
```

---

### Creating your galaxy

Now you're ready to have a working galaxy. The only configuration parameters that galaxy.js needs is the location for the views, and view models. Once you call the `create()` method with these parameters, galaxy.js is ready to go.  Again, the best place to start your galaxy is in the Require application file, so here's what it would look like.

---

###### File: application.js

```
requirejs.config({
 paths: {
    'knockout': 'bower_components/knockout.js/knockout',
    'q': 'bower_components/q/q.min',
    'underscore': 'bower_components/underscore/underscore',
    'postal': 'bower_components/postal.js/lib/postal.min',
    'galaxy': 'bower_components/galaxy.js/galaxy.min'
  }
});

require(['galaxy'], function ($galaxy) {
  // Set up your application route handlers
  $galaxy.route('home').to('welcome');
  $galaxy.route('users').to('user.list');
  $galaxy.route('users/:id').to('user.detail');
  $galaxy.route('users/:id/edit').to('user.edit');
  
  // Initialize the galaxy library
  $galaxy.create({
    viewmodelDirectory: '/viewmodels',
    viewDirectory: '/views'
  });
});
```

---

Now you have a basic, working galaxy, meaning you can now type something like `http://localhost:8081/#welcome` into the address bar and it will properly load the `welcome.js` view model, the `welcome.html` view, and then inject the HTML into your base DOM and make it visible. The last piece of the puzzle is how to navigate programmatically between the views. You do this by warping spacetime to travel between star bases.

## Warping spacetime to visit star bases

To move between views in galaxy.js, you use the `warp()` method.

### Basic navigation

To show/load a different view when a user clicks on a link, or some other interaction, you specify which star base you want to travel to by providing the corresponding route pattern you set up to direct travellers to the star base, and then engage your warp engines.

    $galaxy.warp().to('home').engage();

### Navigation with a payload

If you want to pass in data to the target star base, you add the optional method of `with()`, and the data as the argument, before engaging your warp engine.

Let's assume you set up a route like this.

    $galaxy.route('users/:id').to('user.detail');
    
You could then warp to that destination with a payload.

```
var user = {
  id: 1,
  firstname: 'James',
  lastname: 'Kirk'
};
$galaxy.warp().to('users/' + user.id).with({user: user}).engage();
```

Then the target star base can accept that payload when it subscribes to the docked() event. Also, remember that URL parameters are also captured and put in the data payload for the docked() event. So in addition to the user object being in the payload, there will also be an additional key named id with a value of 1. Here's what the payload would look like from the above example.

```
{
  id: 1,
  user: {
    id: 1,
    firstname: 'James',
    lastname: 'Kirk'
  }
}
```

So here's a basic example of how to capture that data and log it to the console.

###### File: user.detail.js
---

```
define(['galaxy'],
  function($galaxy) {
    var starbase = {};

   /*
     *********************************************************
     ******  S T A R B A S E   R E G I S T R A T I O N  ******
     *********************************************************
    */
    starbase.id = 'users';
    starbase.templatePath = 'user.detail.html';
    starbase.domBindingId = '#user-detail';

    /*
     *  ======================================================
     *   G A L A C T I C   E V E N T   L I S T E N E R S
     *  ======================================================
     */
    $galaxy.network.subscribe('users.docked', function (payload) {
      // This is the object you specified in with() above
      console.log(payload.user);

      // This is the captured URL parameter
      console.log(payload.id);
    });

    return starbase;
  }
);
```

---



  [1]: knockoutjs.com
  [2]: requirejs.org
  [3]: https://github.com/postaljs/postal.js
