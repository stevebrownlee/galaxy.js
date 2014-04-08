define(['knockout', 'galaxy'],
    function(ko, $galaxy) {
        var vm = function() {
            var self = this;

            /*
             *  ==================================================================================
             *   R E G I S T R A T I O N   S E C T I O N
             *  ==================================================================================
             */
            self.id = 'user.list';
            self.templatePath = 'users.html';
            self.domBindingId = '#user-list';

            self.UserStore = new $galaxy.depot();

            /*
             *  ==================================================================================
             *   E V E N T   S U B S C R I P T I O N S
             *  ==================================================================================
             */
            $galaxy.network.subscribe(self.id + '.docked', function() {
                if (self.UserStore.collection().length === 0) {
                    self.UserStore.add({
                        id: 1,
                        firstName: 'Nigel',
                        lastName: 'Montgomery'
                    });
                    self.UserStore.add({
                        id: 2,
                        firstName: 'Tricia',
                        lastName: 'Young'
                    });
                    self.UserStore.add({
                        id: 3,
                        firstName: 'Jesus',
                        lastName: 'Gonzalez'
                    });
                    self.UserStore.add({
                        id: 4,
                        firstName: 'Petr',
                        lastName: 'Medvedev'
                    });
                    self.UserStore.add({
                        id: 5,
                        firstName: 'Amelie',
                        lastName: 'Lefebvre'
                    });
                    self.UserStore.add({
                        id: 6,
                        firstName: 'Hans',
                        lastName: 'Brechtel'
                    });
                }
            });

            self.showWelcome = function() {
                $galaxy.warp().to('home').engage();
            };

            self.showLocations = function() {
                $galaxy.warp().to('locations').engage();
            };

            self.showProducts = function() {
                $galaxy.warp().to('products').engage();
            };

            self.showUsers = function() {
                $galaxy.warp().to('users').engage();
            };

            self.showUserDetails = function(user) {
                $galaxy.warp().to('users/' + user.id).with({user: user}).engage();
            };
        };
        return new vm();
    });