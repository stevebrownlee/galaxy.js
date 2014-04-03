requirejs.config({
   paths: {
        'jquery': 'bower_components/jquery/jquery.min',
        'knockout': 'bower_components/knockout.js/knockout',
        'q': 'bower_components/q/q.min',
        'underscore': 'bower_components/underscore/underscore',
        'postal': 'bower_components/postal.js/lib/postal.min',
        'galaxy': 'bower_components/galaxy.js/galaxy',
    }
});

require(['galaxy'], function ($galaxy) {

    $galaxy.addRoute('', 'welcome');
    $galaxy.addRoute('home', 'welcome');
    $galaxy.addRoute('users', 'user.list');
    $galaxy.addRoute('users/:id', 'user.details');
    $galaxy.addRoute('locations', 'location.list');
    $galaxy.addRoute('locations/:id', 'location.detail');
    $galaxy.addRoute('products', 'products/product.list');
    $galaxy.addRoute('products/:id', 'products/product.list');

    $galaxy.create({
        viewmodelDirectory: '/app/viewmodel',
        viewDirectory: '/app/view'
    });
});
