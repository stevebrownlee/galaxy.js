define(['q', 'knockout', 'galaxy'],
function (Q, ko, $galaxy) {
    var vm = function () {
        var self = this;

        /*
         *  ==================================================================================
         *   R E G I S T R A T I O N   S E C T I O N
         *  ==================================================================================
        */
        self.id = 'welcome';
        self.templatePath = 'welcome.html';
        self.domBindingId = '#welcome';
        self.defaultView = true;

        // try {
            $galaxy.join(self);
        // } catch (ex) {
        //     console.log(ex);            
        // }

        /*
         *  ==================================================================================
         *   E V E N T   S U B S C R I P T I O N S
         *  ==================================================================================
         */
        $galaxy.network.subscribe(self.id + '.docked', function () {
            console.log('welcome page docked');
        });

        self.showUsers = function () {
            $galaxy.transport('user.list');
        };
    };
    return new vm();
});
