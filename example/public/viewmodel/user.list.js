define(['knockout', 'galaxy'],
    function(ko, $galaxy) {
        var starbase = {};

        /*
         ***************************************************************
         *********  S T A R B A S E   R E G I S T R A T I O N  *********
         ***************************************************************

                                       U           
                                      /_\          
                                     [___]
                                     :`:':           
                                     `:::'           
                              _       :_:       _    
                            =[ ]      [%]      [ ]=  
                             :=:      :=:      :=:   
                            _|_|_   __| |__   _|_|_  
                           / /XX|\ /__|_|__\ /|XX\ \
                          / /XXX| | _/___\_ | |XXX\ \             
                --===____/--===X|_|/_______\|_|X===--\____===-- 
                 /__| |     /l_\\             //_|\     |_|__\
                /~~.' |    /:'  \\   _____   //  `:\    | `.  \
               /   | .'   / |    \\==|||||==//    | \   `. |   \   
              /   .' |   / .'     |  |||||  |     `. \   | `.   \ 
             /____|__|__/__|______l__|||||__l______|__\__|__|____\ 

         ***************************************************************
         */
        starbase.id = 'user.list';
        starbase.templatePath = 'users.html';
        starbase.domBindingId = '#user-list';

        starbase.UserStore = new $galaxy.depot();

        /*
         *  ==================================================================================
         *   G A L A C T I C   E V E N T   L I S T E N E R S
         *  ==================================================================================
         */
        $galaxy.network.subscribe(starbase.id + '.docked', function(payload) {
            if (starbase.UserStore.collection().length === 0) {
                starbase.UserStore.add({
                    id: 1,
                    firstName: 'Nigel',
                    lastName: 'Montgomery'
                });
                starbase.UserStore.add({
                    id: 2,
                    firstName: 'Tricia',
                    lastName: 'Young'
                });
                starbase.UserStore.add({
                    id: 3,
                    firstName: 'Jesus',
                    lastName: 'Gonzalez'
                });
                starbase.UserStore.add({
                    id: 4,
                    firstName: 'Petr',
                    lastName: 'Medvedev'
                });
                starbase.UserStore.add({
                    id: 5,
                    firstName: 'Amelie',
                    lastName: 'Lefebvre'
                });
                starbase.UserStore.add({
                    id: 6,
                    firstName: 'Hans',
                    lastName: 'Brechtel'
                });
            }
        });

        /*
         *  ==================================================================================
         *   V I E W   M O D E L   F U N C T I O N S
         *  ==================================================================================
         */        
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

        starbase.showUserDetails = function(user) {
            $galaxy.warp().to('users/' + user.id).with({user: user}).engage();
        };

        return starbase;
    }
);
