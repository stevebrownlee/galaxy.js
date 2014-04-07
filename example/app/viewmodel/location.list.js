define(['q', 'knockout', 'galaxy'],
function (Q, ko, $galaxy) {
    var vm = function () {
        var self = this;

        /*
         *  ==================================================================================
         *   R E G I S T R A T I O N   S E C T I O N
         *  ==================================================================================
        */
        self.id = 'location.list';
        self.templatePath = 'locations.html';
        self.domBindingId = '#location-list';

        /*
         *  ==================================================================================
         *   E V E N T   S U B S C R I P T I O N S
         *  ==================================================================================
         */
        $galaxy.network.subscribe(self.id + '.docked', function () {
            
        });

        self.showWelcome = function () {
            $galaxy.StarChart.warp('home');
        };

        self.showLocations = function () {
            $galaxy.StarChart.warp('locations');
        };

        self.showProducts = function () {
            $galaxy.StarChart.warp('products');
        };

        self.showUsers = function () {
            $galaxy.StarChart.warp('users');
        };
    };
    return new vm();
});