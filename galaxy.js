define(['q', 'knockout', 'postal'], function (Q, ko, postal) {
    var DuplicateViewRegistrationException = function (message) {
       this.message = message;
       this.name = "DuplicateViewRegistrationException";
    };

    var UnregisteredViewWarning = function (message) {
       this.message = message;
       this.name = "UnregisteredViewWarning";
    };

    var MissingViewModelException = function (message) {
       this.message = message;
       this.name = "MissingViewModelException";
    };

    var MissingDOMElementException = function (message) {
       this.message = message;
       this.name = "MissingDOMElementException";
    };

    var ViewLoadedException = function (message) {
       this.message = message;
       this.name = "ViewLoadedException";
    };

    var MissingOptionException = function (message) {
       this.message = message;
       this.name = "MissingOptionException";
    };

    var $galaxy = function (options) {
        var self = this;
        self.network = postal.channel('galaxy');
        self.viewmodelDirectory = '/app/viewmodel';
        self.viewDirectory = '/app/view';
        self.currentPayload = null;
        self.federation = [];
        self.currentLocation = null;
        self.StarChart = self.StarCharter();

    };

    $galaxy.prototype.addRoute = function (pattern, vmId, hash) {
        this.StarChart.addRoute(pattern, vmId, hash);
    };

    $galaxy.prototype.create = function (options) {
        var self = this;

        if (options) {
            self.setOptions(options);
        }

        // Handle errors when require tries to load a view model id that is invalid
        requirejs.onError = function (err) {
            console.error(new MissingViewModelException('Unable to find the location of `' + self.currentLocation + '.js`. ' + err.message));
        };

        self.StarChart.scan();

        // Detect when the hash changes
        window.addEventListener('popstate', function (event) {
            self.StarChart.scan();
        });
    };

    $galaxy.prototype.setOptions = function (options) {
        if (options && options.hasOwnProperty('channel') && options.channel !== '') {
            this.network = postal.channel(options.channel);
        }

        if (options && options.hasOwnProperty('viewmodelDirectory')) {
            this.viewmodelDirectory = options.viewmodelDirectory;
        }

        if (options && options.hasOwnProperty('viewDirectory')) {
            this.viewDirectory = options.viewDirectory;
        }
    };

    $galaxy.prototype.parseHash = function () {
        var self = this;
        var redirectAfterParse = false;

        /*
         *   Parse the location.hash to find the view id and any additional 
         *   key/value pairs in the URL parameters to pass to the view model
         */
        var grabHash = location.hash.split('#')[1];

        if (grabHash && this.currentLocation && (this.currentLocation !== grabHash.split('&')[0])) {
            redirectAfterParse = true;
        }

        if (grabHash) {
            this.currentLocation = grabHash.split('&')[0];
            var urlParamArray = grabHash.split('&');
            urlParamArray.splice(0,1);

            this.currentPayload = urlParamArray.map(function (kv) {
                var a = {}, k = kv.split('=')[0], v = kv.split('=')[1];
                a[k] = v;
                return a;
            }).reduce(function (prev,curr) {
                for (var key in curr) {
                    prev[key] = curr[key];
                }
                return prev;
            }, {});
        }

        // redirectAfterParse should only be true on browser history change
        if (redirectAfterParse) {
            this.render(this.currentLocation);
        }
    };

    $galaxy.prototype.getDOMElements = function (id) {
        var bindingType = (id.substr(0,1) === '.') ? 'class' : 'id';
        var undecoratedDomBindingId = id.replace(/[\.#]/, '');
        var elements = [];

        if (bindingType === 'class') {
            var byClass = document.getElementsByClassName(undecoratedDomBindingId);
            if (byClass.length) {
                for (var el in byClass) {
                    if (typeof byClass[el] === 'object') {
                        elements[elements.length] = byClass[el];
                    }
                }
            }
        } else if (bindingType === 'id') {
            elements[elements.length] = document.getElementById(undecoratedDomBindingId);
        }

        if (elements[elements.length-1] === null) {
            throw new MissingDOMElementException('The DOM element you specified ('+id+') for view model `'+this.currentLocation+'` was not found.')
        }

        return elements;
    };


    $galaxy.prototype.loadViewModel = function (id) {
        var self = this;
        var deferred = Q.defer();
        var matchFound = self.federation.filter(function (model) {
            return model.id === id;
        })[0];

        if (!matchFound) {
            // Show warning that view model not loaded yet
            console.warn(new UnregisteredViewWarning('Location with id `' + id + '` has not joined the federation. Attempting to join in now.'));

            // Require the view model
            require([self.viewmodelDirectory + '/' + id + '.js'], function (vm) {
                self.join(vm);
                deferred.resolve(vm);
            });
        } else {
            deferred.resolve(matchFound);
        }

        return deferred.promise;
    };

    $galaxy.prototype.join = function (viewmodel) {
        var self = this;

        if (!viewmodel.hasOwnProperty('__joined')) {
            // If a view model defined any children, join them first, and mark them as children
            if (viewmodel.hasOwnProperty('children') && viewmodel.children.length > 0) {
                viewmodel.children.map(function (child) {
                    child.__parent = viewmodel.id;
                });
            }

            // Add a __loaded property to keep track of which models have already been bound and loaded into DOM
            if (!viewmodel.hasOwnProperty('__loaded')) {
                viewmodel.__loaded = false;
            }

            // Give each model a show method that delegates to the internal join() function
            if (!viewmodel.hasOwnProperty('show')) {
                viewmodel.show = function () {
                    self.render(this.id);
                };
            }

            // Add the viewmodel to the internal registry
            viewmodel.__joined = true;
            self.federation.push(viewmodel);
            this.network.publish(viewmodel.id + '.joined');

        // View already joined
        } else {
            if (!viewmodel.hasOwnProperty('__parent')) {
                console.warn('The view model with id `' + viewmodel.id + '` has already joined the federation.');
            }
        }
    };

    $galaxy.prototype.leave = function (id) {
        var exists = _.findWhere(this.federation, {id: id});

        if (exists) {
            this.federation = _.filter(this.federation, function (vm) {
                vm.id !== id;
            });
        }
    };

    $galaxy.prototype.loadTemplate = function (id) {
        var self = this;
        var deferred = Q.defer();
        var viewmodel = self.federation.filter(function (vm) {
            return vm.id === id;
        })[0];

        if (viewmodel) {
            if (!viewmodel.__loaded) {
                var viewTemplate = [this.viewDirectory, '/', viewmodel.templatePath].join('');

                self.getDOMElements(viewmodel.domBindingId).forEach(function (el) {
                    var xhr = new XMLHttpRequest();         // Create XHR object
                    xhr.open('GET', viewTemplate, true);    // GET the HTML file for the view model
                    xhr.onloadend = function (evt) {        // After it's loaded
                        if (evt.target.status === 200 || evt.target.status === 302) {
                            el.innerHTML = evt.target.responseText;             // Inject the HTML
                            ko.applyBindings(viewmodel, el);                    // Bind view model to DOM
                            viewmodel.__loaded = true;                            // Flag view model as loaded
                            self.network.publish(viewmodel.id + '.arrived');    // Notify subscribers of arrived event
                            deferred.resolve();                                 // Resolve promise
                        }
                    };

                    xhr.send();
                });
            } else {
                this.network.publish(viewmodel.id + '.arrived');
                deferred.resolve();
            }
        }

        return deferred.promise;
    };

    $galaxy.prototype.hideInactiveViews = function (id) {
        var self = this;

        // Capture current view and hide all others (not autoRender views)
        self.federation.forEach(function (view) {
            if (!view.autoRender && view.id !== id) {
                self.getDOMElements(view.domBindingId).forEach(function (el) {
                    el.style.display = 'none';
                });
            }
        });
    };

    $galaxy.prototype.render = function (viewmodelId, payload) {
        var self = this;
        var currentViewModel = null;

        self.loadViewModel(viewmodelId).then(function (vm) {
            currentViewModel = vm;
            self.hideInactiveViews(viewmodelId);

            return self.loadTemplate(viewmodelId);
        }).then(function () {

            // After view is loaded, ensure it is visible
            self.getDOMElements(currentViewModel.domBindingId).forEach(function (el) {
                el.style.display = '';
            });

            self.network.publish(currentViewModel.id + '.docked', payload);

            // Render any children views/widgets
            if (currentViewModel.hasOwnProperty('children')) {
                currentViewModel.children.map(function (child) {
                    self.render(child.id);
                });
            }

        }).fail(function (ex) {
            console.error(ex);
        }).catch(function (ex) {
            console.error(ex);
        }).finally(function () { });

            // Immediately render any module marked with autoRender (usually navigation elements)
            // if (viewmodel.hasOwnProperty('autoRender') && viewmodel.autoRender) {
            //     self.render(viewmodel.id);
            // }

            // location.hash has a view id in it, and the current view matches it.  Render view.
            // if (self.StarChart.currentLocation !== null && viewmodel.id === self.StarChart.currentLocation) {
            //     self.render(viewmodel.id);
            // }

            // Nothing in the location.hash, and current view marked as default. Render view.
            // if (self.StarChart.currentLocation === null && viewmodel.hasOwnProperty('defaultView') && viewmodel.defaultView) {
            //     self.currentLocation = viewmodel.id;
            //     self.render(viewmodel.id);
            //     window.location.hash = viewmodel.id;
            // }
    };



    $galaxy.prototype.StarCharter = function () {
        var galaxy = this;

        var StarChart = function () {
            this.routes = [];
            this.currentLocation = null;
        };

        StarChart.prototype.getRoutes = function () {
            return this.routes;
        };

        StarChart.prototype.addRoute = function (pattern, vmId, hash) {
            this.routes[this.routes.length] = {
                pattern: pattern,
                viewModel: vmId,
                hash: hash
            };

            return this.routes;
        };

        StarChart.prototype.warp = function (options) {
            var hashBuilder = [];
            var match;
            var targetLocation;

            try {
                // If the argument is a string, assume it's the location for transport 
                if (options && typeof options === 'string') {
                    targetLocation = options;
                } else if (options && typeof options === 'object' && !options.hasOwnProperty('location')) {
                    throw new MissingOptionException('You must provide a location property and a payload property when publishing the `transport` event with an object parameter.');
                } else if (options && typeof options === 'object' && options.hasOwnProperty('location')) {
                    targetLocation = options.location;
                }

                match = this.routes.filter(function (route) {
                    return route.pattern === targetLocation;
                })[0];

                hashBuilder[hashBuilder.length] = targetLocation;   // Start building the location hash

                if (options.hasOwnProperty('payload') && options.payload) {
                    this.currentPayload = options.payload;
                    for (var key in options.payload) {    // Add each k/v pair as a URL hash parameter
                        var param = options.payload[key];
                        hashBuilder[hashBuilder.length] = '&' + key + '=' + param;
                    }
                }

                window.location.hash = hashBuilder.join('');  // Set the location hash
            } catch (ex) {
                console.error(ex);                
            }

            return match;
        };

        StarChart.prototype.scan = function (pattern) {
            var self = this;
            var moduleId, urlParamArray, currentPayload, currentViewModel;

            /*
             *   Parse the location.hash to find the view id and any additional 
             *   key/value pairs in the URL parameters to pass to the view model
             */
            var grabHash = location.hash.split('#')[1] || '';

            if (grabHash !== '') {
                urlParamArray = grabHash.split('/');
                moduleId = urlParamArray[0];
                urlParamArray.splice(0,1);

                currentPayload = urlParamArray.map(function (kv) {
                    var a = {}, k = kv.split('=')[0], v = kv.split('=')[1];
                    a[k] = v;
                    return a;
                }).reduce(function (prev,curr) {
                    for (var key in curr) {
                        prev[key] = curr[key];
                    }
                    return prev;
                }, {});
            } else {
                moduleId = '';
            }

            var match = self.routes.filter(function (route) {
                return route.pattern === moduleId;
            })[0] || false;

            if (match) {
                self.currentLocation = match.viewModel;
                galaxy.render(match.viewModel, urlParamArray);
            }
        };

        return new StarChart();
    };

    $galaxy.prototype.depot = function () {
        var Store = function () {
            this.collection = ko.observableArray();
            this.proxy = null;
            this._dirty = false;
        };

        Store.prototype.populate = function (force) {
            var deferred = Q.defer();
            var self = this;

            if (!self._dirty && self.collection().length && !force) {  // Already populated and not dirty
                deferred.resolve();
            } else if (!self._dirty || force) {              // Not dirty, but client forces population
                self.proxy.load().then(function (models) {
                    self.collection(models);
                    deferred.resolve();
                }).fail(function (err) {
                    console.log('Failed to load from remote proxy. ' + err.toString());
                    deferred.reject();
                }).done();
            } else {
                deferred.reject();
            }

            return deferred.promise;
        };

        Store.prototype.isDirty = function () {
            return this._dirty;
        };

        Store.prototype.sync = function () {
            var self = this;

            self.collection.forEach(function (type) {
                if (type.hasOwnProperty("_local") && type._local) {
                    self.proxy.save(type).then(function () {
                        type._local = false;
                    }).fail(function (err) {
                        console.error(err);
                    }).done();
                }
            });
        };

        Store.prototype.add = function (type) {
            var self = this;

            if (type instanceof Array) {
                type.forEach(function (item) {
                    self.collection.push(item);
                });
            } else {
                self.collection.push(type);
            }
        };

        Store.prototype.empty = function () {
            this.collection.removeAll();
        };

        Store.prototype.remove = function (item) {
            var filtered = this.collection().filter(function (type) {
                return JSON.stringify(type) !== JSON.stringify(item);
            });

            this.collection(filtered);
        };

        Store.prototype.removeById = function (id) {
            var filtered = this.collection().filter(function (type) {
                return type.id !== id;
            });

            this.collection(filtered);
        };

        return new Store();
    };

    return new $galaxy();
});
