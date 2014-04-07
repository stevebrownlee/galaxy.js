define(['q', 'knockout', 'galaxy'],
function (Q, ko, $galaxy) {
    var vm = function () {
        var self = this;

        /*
         *  ==================================================================================
         *   R E G I S T R A T I O N   S E C T I O N
         *  ==================================================================================
        */
        self.id = 'user.detail';
        self.templatePath = 'userdetail.html';
        self.domBindingId = '#user-detail';

        self.UserStore = new $galaxy.depot();

        /*
         *  ==================================================================================
         *   E V E N T   S U B S C R I P T I O N S
         *  ==================================================================================
         */
        $galaxy.network.subscribe(self.id + '.docked', function () {
            if (self.UserStore.collection().length === 0) {
                self.UserStore.add({id: 1, firstName: 'Nigel', lastName: 'Montgomery'});
                self.UserStore.add({id: 2, firstName: 'Tricia', lastName: 'Young'});
                self.UserStore.add({id: 3, firstName: 'Jesus', lastName: 'Gonzalez'});
                self.UserStore.add({id: 4, firstName: 'Petr', lastName: 'Medvedev'});
                self.UserStore.add({id: 5, firstName: 'Amelie', lastName: 'Lefebvre'});
                self.UserStore.add({id: 6, firstName: 'Hans', lastName: 'Brechtel'});
            }
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

        self.showUserDetails = function (user) {
            console.log('show user details', user);
            $galaxy.StarChart.warp('users/'+user.id);
        };
    };
    return new vm();
});
