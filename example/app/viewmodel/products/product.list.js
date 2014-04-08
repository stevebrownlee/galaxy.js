define(['knockout', 'galaxy'],
    function(ko, $galaxy) {
        var starbase = {};

        /*
         *  ==================================================================================
         *   S T A R B A S E   R E G I S T R A T I O N 
         *  ==================================================================================

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
         */
        starbase.id = 'products/product.list';
        starbase.templatePath = 'products/products.html';
        starbase.domBindingId = '#product-list';

        /*
         *  ==================================================================================
         *   G A L A C T I C   E V E N T   L I S T E N E R S
         *  ==================================================================================
         */
        $galaxy.network.subscribe(starbase.id + '.docked', function() {

        });

        /*
         *  ==================================================================================
         *   V I E W   M O D E L   F U N C T I O N S
         *  ==================================================================================
         */        
        starbase.showWelcome = function() {
            $galaxy.StarChart.warp('home');
        };

        starbase.showLocations = function() {
            $galaxy.StarChart.warp('locations');
        };

        starbase.showProducts = function() {
            $galaxy.StarChart.warp('products');
        };

        starbase.showUsers = function() {
            $galaxy.StarChart.warp('users');
        };

        return starbase;
    }    
);