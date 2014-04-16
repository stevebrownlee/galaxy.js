requirejs.config({
   paths: {
        'knockout': 'bower_components/knockout.js/knockout',
        'q': 'bower_components/q/q.min',
        'underscore': 'bower_components/underscore/underscore',
        'postal': 'bower_components/postal.js/lib/postal.min',
        'galaxy': 'bower_components/galaxy.js/galaxy.min',
    }
});

require(['galaxy'], function ($galaxy) {

    // Set up navigational routes
    $galaxy.route('').to('welcome').then(function () {
        console.log('routed to welcome');
    });

    $galaxy.route('home').to('welcome');
    $galaxy.route('users').to('user.list');
    $galaxy.route('users/:id').to('user.detail');
    $galaxy.route('users/:id/edit').to('user.edit');
    $galaxy.route('locations').to('location.list');
    $galaxy.route('locations/:id').to('location.detail');
    $galaxy.route('products').to('products/product.list');
    $galaxy.route('products/:id').to('products/product.detail');

    // Initialize the galaxy library
    $galaxy.create({
        viewmodelDirectory: '/viewmodel',
        viewDirectory: '/view'
    });
});
