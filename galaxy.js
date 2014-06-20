define(['q', 'knockout', 'postal'], function(Q, ko, postal) {
    var UnregisteredViewWarning = function(message) {
        this.message = message;
        this.name = "UnregisteredViewWarning";
    };

    var MissingViewModelException = function(message) {
        this.message = message;
        this.name = "MissingViewModelException";
    };

    var MissingDOMElementException = function(message) {
        this.message = message;
        this.name = "MissingDOMElementException";
    };

    var MissingOptionException = function(message) {
        this.message = message;
        this.name = "MissingOptionException";
    };

    var $galaxy = function(options) {
        this.network = postal.channel('galaxy');
        this.viewmodelDirectory = '/app/viewmodel';
        this.viewDirectory = '/app/view';
        this.federation = [];
        this.currentLocation = null;
        this.StarChart = this.StarChartConstructor();
    };

    $galaxy.prototype.route = function (pattern) {
        var routeParameters = {
            pattern: pattern,
            viewmodelId: null,
            callback: null
        };

        return {
            to: function (vmId) {
                routeParameters.viewmodelId = vmId;
                this.StarChart.addRoute(routeParameters);
                return {
                    then: function (callback) {
                        routeParameters.callback = callback;
                        this.StarChart.updateRoute(routeParameters);
                    }.bind(this)
                }
            }.bind(this)
        }
    };

    $galaxy.prototype.warp = function () {
        var warpParameters = {};

        var engage = function () {
            this.StarChart.warp(warpParameters);
        }.bind(this);
        
        return {
            to: function (location) {
                warpParameters.location = location;
                return {
                    engage: engage,
                    with: function (payload) {
                        warpParameters.payload = payload;
                        return {
                            engage: engage
                        }
                    }
                }
            }
        }
    };

    $galaxy.prototype.create = function(options) {
        if (options) {
            this.setOptions(options);
        }

        // Handle errors when require tries to load a view model id that is invalid
        requirejs.onError = function RequireErrorHandler (err) {
            console.error(new MissingViewModelException('Unable to find the location of `' + this.currentLocation + '.js`. ' + err.message));
        }.bind(this);

        this.StarChart.scan();

        // Detect when the hash changes
        window.addEventListener('popstate', function PopStateHandler (event) {
            this.StarChart.scan();
        }.bind(this));
    };

    $galaxy.prototype.setOptions = function(options) {
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

    $galaxy.prototype.getDOMElements = function(id) {
        var bindingType = (id.substr(0, 1) === '.') ? 'class' : 'id';
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

        if (elements[elements.length - 1] === null) {
            throw new MissingDOMElementException('The DOM element you specified (' + id + ') for view model `' + this.currentLocation + '` was not found.')
        }

        return elements;
    };


    $galaxy.prototype.loadViewModel = function(id) {
        var deferred = Q.defer();
        var matchFound = this.federation.filter(function(model) {
            return model.id === id;
        })[0];

        if (!matchFound) {
            // Show warning that view model not loaded yet
            console.warn(new UnregisteredViewWarning('Location with id `' + id + '` has not joined the federation. Attempting to join in now.'));

            // Require the view model
            require([this.viewmodelDirectory + '/' + id + '.js'], function requireViewModel (vm) {
                this.join(vm);
                deferred.resolve(vm);
            }.bind(this));
        } else {
            deferred.resolve(matchFound);
        }

        return deferred.promise;
    };

    $galaxy.prototype.join = function (viewmodel) {
        if (!viewmodel.hasOwnProperty('__joined')) {
            // If a view model defined any children, join them first, and mark them as children
            if (viewmodel.hasOwnProperty('children') && viewmodel.children.length > 0) {
                viewmodel.children.map(function(child) {
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
                    this.render(viewModel.id);
                }.bind(this);
            }

            // Add the viewmodel to the internal registry
            viewmodel.__joined = true;
            this.federation.push(viewmodel);
            this.network.publish(viewmodel.id + '.joined');

        } else {
            // View already joined
            if (!viewmodel.hasOwnProperty('__parent')) {
                console.warn('The view model with id `' + viewmodel.id + '` has already joined the federation.');
            }
        }
    };

    $galaxy.prototype.leave = function(id) {
        var exists = _.findWhere(this.federation, {
            id: id
        });

        if (exists) {
            this.federation = _.filter(this.federation, function(vm) {
                vm.id !== id;
            });
        }
    };

    $galaxy.prototype.loadTemplate = function (id) {
        var deferred = Q.defer();
        var viewmodel = this.federation.filter(function (vm) {
            return vm.id === id;
        })[0];

        if (viewmodel) {
            if (!viewmodel.__loaded) {
                var viewTemplate = [this.viewDirectory, '/', viewmodel.templatePath].join('');

                this.getDOMElements(viewmodel.domBindingId).forEach(function (el) {
                    var xhr = new XMLHttpRequest(); // Create XHR object
                    xhr.open('GET', viewTemplate, true); // GET the HTML file for the view model
                    xhr.onloadend = function viewTemplateLoadEnd (evt) { // After it's loaded
                        if (evt.target.status === 200 || evt.target.status === 302) {
                            el.innerHTML = evt.target.responseText; // Inject the HTML
                            ko.applyBindings(viewmodel, el); // Bind view model to DOM
                            viewmodel.__loaded = true; // Flag view model as loaded
                            this.network.publish(viewmodel.id + '.bound'); // Notify subscribers of arrived event
                            deferred.resolve(); // Resolve promise
                        }
                    }.bind(this);

                    xhr.send();
                }.bind(this));
            } else {
                this.network.publish(viewmodel.id + '.bound');
                deferred.resolve();
            }
        }

        return deferred.promise;
    };

    // Capture current view and hide all others (not autoRender views)
    $galaxy.prototype.hideInactiveViews = function (id) {
        this.federation.forEach(function(view) {
            if (!view.autoRender && view.id !== id) {
                this.getDOMElements(view.domBindingId).forEach(function (el) {
                    el.style.display = 'none';
                });
            }
        }.bind(this));
    };

    $galaxy.prototype.render = function (viewmodelId, payload) {
        var currentViewModel = null;

        this.loadViewModel(viewmodelId).then(function (vm) {
            currentViewModel = vm;
            this.hideInactiveViews(viewmodelId);

            return this.loadTemplate(viewmodelId);
        }.bind(this)).then(function () {

            // After view is loaded, ensure it is visible
            this.getDOMElements(currentViewModel.domBindingId).forEach(function (el) {
                el.style.display = '';
            });

            // Publish docked() event
            this.network.publish(currentViewModel.id + '.docked', payload);

            // Render any children views/widgets
            if (currentViewModel.hasOwnProperty('children')) {
                currentViewModel.children.map(function(child) {
                    this.render(child.id);
                });
            }

        }.bind(this)).fail(function(ex) {
            console.error(ex);
        }).
        catch (function(ex) {
            console.error(ex);
        }).
        finally(function() {

        });
    };



    $galaxy.prototype.StarChartConstructor = function() {
        var galaxy = this;

        var SpaceTime = function() {
            this.routes = [];
            this.currentLocation = null;
            this.smuggledPayload = null;
        };

        SpaceTime.prototype.updateRoute = function(routeParameters) {
            var matchedRoute = this.routes.filter(function (route) {
                return route.pattern === routeParameters.pattern;
            })[0];

            matchedRoute.callback = routeParameters.callback;
        };

        SpaceTime.prototype.addRoute = function(routeParameters) {
            this.routes[this.routes.length] = {
                pattern: routeParameters.pattern,
                viewModel: routeParameters.viewmodelId,
                callback: routeParameters.callback
            };

            return this.routes;
        };

        SpaceTime.prototype.warp = function(options) {
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

                match = this.routes.filter(function(route) {
                    return route.pattern === targetLocation;
                })[0];

                hashBuilder[hashBuilder.length] = targetLocation; // Start building the location hash

                if (options.hasOwnProperty('payload') && options.payload) {
                    this.smuggledPayload = options.payload;
                }

                window.location.hash = hashBuilder.join(''); // Set the location hash
            } catch (ex) {
                console.error(ex);
            }

            return match;
        };

        SpaceTime.prototype.scan = function(pattern) {
            var totalPayload = {};
            var moduleId, urlParamArray, currentViewModel;

            // Parse the location.hash to find the view id
            var locationHash = location.hash.split('#')[1] || '';

            // Default the module id to the location hash (overridden below if needed)
            moduleId = locationHash;

            // If there's more than one segment in the hash, parse them all out and
            // redefine the module id as the first segment
            if (locationHash !== '') {
                urlParamArray = locationHash.split('/');
                moduleId = urlParamArray[0];
                urlParamArray.splice(0, 1);
            }

            // Find any registered routes where the module name matches
            var matches = this.routes.filter(function(route) {
                return route.pattern.split('/')[0] === moduleId;
            }) || false;

            // If any module name matches, filter it further to any registered
            // routes with the same pattern length
            if (matches) {
                matches = matches.filter(function(route) {
                    return locationHash.split('/').length === route.pattern.split('/').length;
                }) || false;
            }

            // TODO: If the pattern lengths match, need to compare each segment, ignore
            // the parameterized segments, and then each remaining segment needs to match
            // 1:1 between the route pattern and the hash pattern.

            // Create a data payload from the parameterized segments
            if (matches && matches.length && urlParamArray && urlParamArray.length) {
                var arg, _arguments = matches[0].pattern.split('/');
                _arguments.splice(0, 1);

                for (var i = 0, j = _arguments.length; i <= j, arg = _arguments[i]; i += 1) {
                    if (arg.substr(0, 1) === ':') {
                        totalPayload[arg.substr(1, arg.length - 1)] = urlParamArray[i];
                    }
                }
            }

            if (matches && matches.length) {
                // Combine URL and smuggled payload
                for(var goods in this.smuggledPayload) {
                    totalPayload[goods] = this.smuggledPayload[goods];
                }
                galaxy.render(matches[0].viewModel, totalPayload);
                if (matches[0].callback !== null) {
                    matches[0].callback.call();
                }
            }
        };

        return new SpaceTime();
    };

    $galaxy.prototype.depot = function() {
        var Store = function() {
            this.collection = ko.observableArray();
            this.proxy = null;
            this._dirty = false;
        };

        Store.prototype.populate = function(force) {
            var deferred = Q.defer();

            if (!this._dirty && this.collection().length && !force) { // Already populated and not dirty
                deferred.resolve();
            } else if (!this._dirty || force) { // Not dirty, but client forces population
                this.proxy.load().then(function (models) {
                    this.collection(models);
                    deferred.resolve();
                }.bind(this)).fail(function(err) {
                    console.log('Failed to load from remote proxy. ' + err.toString());
                    deferred.reject();
                }).done();
            } else {
                deferred.reject();
            }

            return deferred.promise;
        };

        Store.prototype.isDirty = function() {
            return this._dirty;
        };

        Store.prototype.sync = function() {
            this.collection.forEach(function(type) {
                if (type.hasOwnProperty("_local") && type._local) {
                    this.proxy.save(type).then(function() {
                        type._local = false;
                    }).fail(function(err) {
                        console.error(err);
                    }).done();
                }
            }.bind(this));
        };

        Store.prototype.add = function(type) {
            if (type instanceof Array) {
                type.forEach(function(item) {
                    this.collection.push(item);
                }.bind(this));
            } else {
                this.collection.push(type);
            }
        };

        Store.prototype.empty = function() {
            this.collection.removeAll();
        };

        Store.prototype.remove = function(item) {
            var filtered = this.collection().filter(function(type) {
                return JSON.stringify(type) !== JSON.stringify(item);
            });

            this.collection(filtered);
        };

        Store.prototype.removeById = function(id) {
            var filtered = this.collection().filter(function(type) {
                return type.id !== id;
            });

            this.collection(filtered);
        };

        return new Store();
    };


    return new $galaxy();
});