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

require(['underscore', 'viewmodel/welcome'], function (_, welcome) { });
