define(['galaxy'], function($galaxy) {

  $galaxy.network.subscribe('viewChange', function (payload) {

  });


    starbase.showWelcome = function() {
        $galaxy.warp().to('home').engage();
    };

    starbase.showLocations = function() {
        $galaxy.warp().to('locations').engage();
    };

    starbase.showProducts = function() {
        $galaxy.warp().to('products').engage();
    };

    starbase.showUsers = function() {
        $galaxy.warp().to('users').engage();
    };

    return starbase;
  }
);
