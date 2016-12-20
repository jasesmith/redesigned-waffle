angular
    .module('app', ['ui.sortable'])
    .controller('appController', ['$scope', '$timeout', function($scope, $timeout) {

        // var colors = [
        //     {name: 'apple', color: '#fc1770'},
        //     {name: 'tangerine', color: '#ff7f36'},
        //     {name: 'banana', color: '#fff261'},
        //     {name: 'kermit', color: '#94ca3d'},
        //     {name: 'sky', color: '#15c5ec'},
        //     {name: 'berry', color: '#c657af'},
        //     {name: 'light', color: '#E3E9EC'},
        //     {name: 'dark', color: '#23292C'}
        // ];

        $scope.headline = 'Resource Share';
        $scope.icon = 'bars fa-rotate-90';
        $scope.search = '';

        $scope.dragControlListeners = {
            accept: function () {
                return true; //override to determine drag is allowed or not. default is true.
            },
            dragEnd: function(item){
                if(item.source.index !== item.dest.index) {
                    var navs = angular.copy($scope.navs);
                    navs.move(navs[item.source.index], navs[item.dest.index]);
                }
            },
            containment: '.omni-nav-grid'
        };

        var fakeNames = 'Viral Bitters Crucifix Lomo Forage Listicle Migas Polaroid XOXO Quinoa Cray Freegan Kale Chips Fashion Axe Taxidermy Narwhal'.split(" "); // Crucifix Pug Master Cleanse Whatever Literally Food Truck Banh Mi Roof Party You Probably Havent Heard Of Them Thundercats Brooklyn Flannel Stumptown Church-Key Fashion Axe Banjo Banksy Retro Pinterest Kickstarter Listicle Schlitz Wayfarers Drinking Vinegar Pop-Up Salvia Skateboard Four Loko Diy Taxidermy Thundercats Williamsburg Meditation Freegan Craft Beer Cred Small Batch Helvetica Viral Letterpress Flannel Next Level Hoodie Try-Hard Banksy Brooklyn Plaid Fingerstache Drinking Vinegar Mustache Stumptown Whatever Pour-Over Vhs Tilde Retro Distillery'.split(" ");

        var buildFakeName = function(count){
            count = count || _.random(1,3);
            var name = _.compact(_.times(count, function(){return fakeNames[_.random(1, fakeNames.length)];}));
            return name.length > 0 ? name.join(' ') : buildFakeName();
        };

        var bytesToSize = function(bytes, precision){
            precision = precision || 0;

            var kilobyte = 1024;
            var megabyte = kilobyte * 1024;
            var gigabyte = megabyte * 1024;
            var terabyte = gigabyte * 1024;
            var petabyte = terabyte * 1024;
            var exabyte = petabyte * 1024;

            if ((bytes >= 0) && (bytes < kilobyte)) {
                return bytes + ' B';

            } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
                return (bytes / kilobyte).toFixed(precision) + 'K';

            } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
                return (bytes / megabyte).toFixed(precision) + 'M';

            } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
                return (bytes / gigabyte).toFixed(precision) + 'G';

            } else if ((bytes >= terabyte) && (bytes < petabyte)) {
                return (bytes / terabyte).toFixed(precision) + 'T';

            } else if ((bytes >= petabyte) && (bytes < exabyte)) {
                return (bytes / petabyte).toFixed(precision) + 'P';

            } else if (bytes >= exabyte) {
                return (bytes / exabyte).toFixed(precision) + 'E';

            } else {
                return bytes + 'B';
            }
        };

        $scope.getNumber = function(num, math){
            num = Math.ceil(num);
            if(!math) {
                math = 0;
            }
            return new Array(num + math);
        };

        $scope.clearCurrent = function() {
            $scope.current = {
                id: null,
                grids: []
            };
            $scope.find = {};
            $scope.count = [];
            $scope.clearSearch();
        };

        $scope.clearSearch = function(){
            $scope.search = '';
            _.each($scope.grids, function(grid){
                grid.hits = [];
                _.each(grid.resources, function(resource){
                    resource.found = false;
                    resource.active = false;
                });
            });
            $('.grid-item-wrapper').scrollTo(110, 0);
        };

        $timeout(function(){
            $scope.clearCurrent();
        }, 80);

        $scope.grids = _.range(8);

        $scope.grids = _.each($scope.grids, function(grid, i){
            var size = _.random(1e8, 999e8);

            grid = {
                id: i+1
            };
            grid.bytesize = size * 100;
            grid.size = bytesToSize(grid.bytesize);
            grid.resources = _.range(_.random(100));

            grid.used = 0;

            _.each(grid.resources, function(resource, ii){
                resource = {};

                var name = buildFakeName();

                // ew
                if(_.findWhere(grid.resources, {name: name})) {
                    name = buildFakeName();
                    if(_.findWhere(grid.resources, {name: name})) {
                        name = buildFakeName();
                        if(_.findWhere(grid.resources, {name: name})) {
                            name = buildFakeName();
                        }
                    }
                }

                resource.name = name;

                resource.id = resource.name.toLowerCase().replace(/\s/g, '-');
                resource.allocated = parseInt(_.random(0, grid.bytesize/100));
                resource.used = parseInt(_.random(0, resource.allocated));

                resource.humanAllocated = bytesToSize(resource.allocated);
                resource.humanUsed = bytesToSize(resource.used);

                resource.percentAllocated = ((resource.allocated/grid.bytesize)*100).toFixed(2);
                resource.percentUsed = ((resource.used/resource.allocated)*100).toFixed(2);
                resource.height = (resource.percentAllocated*10) < 2.2 ? 2.2 : (resource.percentAllocated*10);

                grid.used = grid.used + resource.allocated;

                grid.resources[ii] = resource;
            });

            grid.humanUsed = bytesToSize(grid.used);
            grid.percentUsed = ((grid.used/grid.bytesize)*100).toFixed(2);

            $scope.grids[i] = grid;
        });

        var findResourceByGridId = function(gridId){
            return _.findWhere($scope.grids[gridId].resources, {id: $scope.find.id});
        };

        $scope.doTheSlotMachineThing = function(resource) {

            $scope.find = resource;
            $scope.count = [];
            $scope.resources = [];
            $scope.search = '';
            $scope.current = {
                id: resource.id,
                grids: []
            };

            var wrappers = angular.element('.grid-item-wrapper');
            var e = [];

            _.each($scope.grids, function(grid, i){
                $scope.current.grids[i] = {};
                var el = angular.element('.grid-' + grid.id + ' .' + resource.id);
                if(el.length) {
                    e.push(el);
                } else {
                    e.push('100');
                }

                _.each(grid.resources, function(res){
                    res.active = false;
                    res.found = false;
                });

                _.filter(grid.resources, function(res){
                    if(res.id === resource.id) {
                        $scope.current.grids[i].hit = true;
                        res.active = true;
                        $scope.count.push(1);
                    }
                });

            });

            _.each($scope.current.grids, function(grid, i){
                var data = findResourceByGridId(i);
                $scope.resources[i] = {data: data};
                $(wrappers[i]).scrollTo(e[i], 300, {offset:-90});
            });
        };

        $scope.doSearch = function(str){
            var wrappers = angular.element('.grid-item-wrapper');
            var e = [];

            if(str.length > 2) {
                $timeout(function() {
                    _.each($scope.grids, function(grid, i){
                        grid.hits = [];
                        var el = angular.element('.grid-' + grid.id + ' .found');
                        if(el.length) {
                            e.push(el[0]);
                        } else {
                            e.push(110);
                        }
                        _.each(grid.resources, function(resource){
                            resource.found = false;
                            resource.active = false;
                            if(str && str.length > 1 && resource.name.toLowerCase().indexOf(str.toLowerCase()) > -1) {
                                resource.found = true;
                                grid.hits.push(resource.id);
                                $(wrappers[i]).scrollTo(e[i], 80, {offset:-90});
                            }
                        });
                    });
                }, 300);
            } else {
                $('.grid-item-wrapper').scrollTo(110, 80, {offset:-90});
            }
        };

        $scope.meterColor = function(pct, pfx) {
            var color = 'ok';
            if(pct > 95) {
                color = 'alert';
            } else if(pct > 80) {
                color = 'warning';
            } else if(pct > 50) {
                color = 'fine';
            }
            return pfx ? pfx + '-' + color : color;
        };

    }])

    .directive('scrollTo', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            scope: {
                delay: '@scrollToDelay'
            },
            link: function(scope, $element, $attrs) {
                var delay = scope.delay ? scope.delay : 0;
                $element.on('click', function() { // $event
                    $timeout(function(){
                        $($attrs.scrollIn).scrollTo($($attrs.scrollTo), 80, {offset:-90});
                    }, delay);
                });
            }
        };
    }])

    .factory('StorageService', function () {
        return {
            /**
             * get item out of local storage and if it's a string, turn it into a json object
             * @param key
             * @returns {*}
             */
            get: function (key) {
                var item = localStorage.getItem(key);
                if (item && _.isString(item) && _.isEmpty(item) === false) {
                    return angular.fromJson(item);
                } else {
                    return item;
                }
            },

            /**
             * save object as a json string
             * @param key
             * @param data
             */
            save: function (key, data) {
                localStorage.setItem(key, JSON.stringify(data));
            },

            /**
             * remove a specific item
             * @param key
             */
            remove: function (key) {
                localStorage.removeItem(key);
            },

            /**
             * blow them all away
             */
            clearAll : function () {
                localStorage.clear();
            }
        };
    });
