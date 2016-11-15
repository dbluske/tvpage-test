'use strict';

var app = angular.module('myApp', ['d3', 'ngCookies']);

app.filter('secondDropdown', function () {

    return function (secondSelect, firstSelect) {

        var filtered = [];

        if (firstSelect === null) {
            return filtered;
        }

        angular.forEach(secondSelect, function (s2) {
            if (s2.domain == firstSelect) {
                filtered.push(s2);
            }
        });

        return filtered;
    };
});

app.controller('myController', function($scope, $http, $cookies) {

    var config = { headers: {'Content-Type': 'application/json'}, timeout: 10000};

    $scope.myURL = {url: ""};

    $scope.postDataResponse = [];

    $scope.domains = ["links"];
    $scope.selectedDomain = "links";

    $scope.unique = {}; // histogram
    $scope.distinct = []; // first dropdown

    $scope.dummyData = [
        {name: "Find", score: 98},
        {name: "URLs", score: 96},
        {name: 'per', score: 75},
        {name: "Domain", score: 48}
    ];

    $scope.errorDetails = "";

    $scope.Q = {};

    $scope.isLoading = false;

    $scope.focusState = false;

    $scope.deDupeSearches = function() {

        if($cookies.get('tvpTest')){

            var u = {}, d = [];

            $http.post("/tvpage-test/recent-searches", {lookup: Date.now()}, config)

            .success(function (data, status, headers, config) {
             
                angular.forEach(data, function(value){

                    console.log('value: ' + value);

                    if(typeof(u[value]) == "undefined") {
                        d.push(value);
                        u[value] = 0;
                    }

                    u[value] += 1;

                }); // END forEach()

                console.log('D: ' + d);
                $scope.recentSearches = d;
            
            })
            .error(function (data, status, header, config) {

                $scope.errorDetails = "Data: " + data +
                    "<hr />status: " + status +
                    "<hr />headers: " + header +
                    "<hr />config: " + config;
                console.log(data);
                console.log(status);

            });

        } else { // NO COOKIES

            return;

        }

    };

    $scope.deDupeSearches();

    $scope.getDomains = function(url, json){

        $scope.unique = {};
        $scope.distinct = [];

        angular.forEach(json, function(value, index){

            // DICTIONARY UNIQUE CHECK
            if(typeof($scope.unique[value.domain]) == "undefined") {

                // DISTINCT
                $scope.distinct.push(value.domain);
                $scope.unique[value.domain] = 0;
            }

            // DICTIONARY
            $scope.unique[value.domain] += 1;

        });

        $scope.domains = $scope.distinct;

        console.log("DOMAIN HISTOGRAM");
        console.log($scope.unique);

        $scope.buildHistogram($scope.unique);

        console.log("ADDING TO Q");
        $scope.addToQ(url, $scope.domains, json);

    };

    $scope.addToQ = function(theURL, theDomains, theData){

        if(typeof($scope.Q[theURL]) == "undefined"){
            $scope.Q[theURL] = {"url": theURL, "domains": theDomains,"data": theData};
        } else {
            console.log("URL already in queue");
        }

    }

    $scope.removeFromQ = function(theURL){

        console.log("TRYING to REMOVE: " + theURL);
        delete $scope.Q[theURL];

    }

    $scope.buildHistogram = function(theDictionary){

        var domainCounts = [];

        angular.forEach(theDictionary, function(value, key) {
            this.push({name: key, score: value});
        }, domainCounts);

        $scope.dummyData = domainCounts;
    }

    $scope.sendURL = function(){

        if(typeof($scope.Q[$scope.myURL.url]) == "undefined" && !$scope.isLoading){

            $scope.isLoading = true;

            $http.post("/tvpage-test/url-query", {myURL: $scope.myURL.url}, config)

                .success(function (data, status, headers, config) {

                    $scope.postDataResponse = data;
                    console.log(data);

                    $scope.getDomains($scope.myURL.url, $scope.postDataResponse);

                    $scope.deDupeSearches();

                    $scope.isLoading = false;

                })
                .error(function (data, status, header, config) {

                    $scope.errorDetails = "Data: " + data +
                        "<hr />status: " + status +
                        "<hr />headers: " + header +
                        "<hr />config: " + config;
                    console.log(data);
                    console.log(status);

                    $scope.isLoading = false;

                });

        } else {

            if(!$scope.isLoading){
                console.log("URL already in queue");
            } else {
                console.log("Link loading in progress... Thank you for your patience")
            }

        }

    };

    $scope.loadToggle = function(){

        var catButton = angular.element(document.querySelector('#getLinksBtn'));

        if($scope.isLoading){
            catButton.addClass('buttonLoading');
        } else {
            catButton.removeClass('buttonLoading');
        }

    };

    $scope.$watch('isLoading',function() { $scope.loadToggle(); });

});

app.controller('repeatController', function($scope) {

    $scope.selectedURL = "";
    $scope.selectedDomain = "links";

    $scope.deeperLinks = function(linkObj){

        $scope.$parent.myURL.url = linkObj.linkURL;
        $scope.$parent.sendURL();

    }

});

app.directive('d3Bars', ['$window', '$timeout', 'd3Service', function ($window, $timeout, d3Service) {
    return {
        restrict: 'A',
        scope: {
            data: '=',      // ISOLATE SCAPE FOR BARS
            label: '@',
            onClick: '&'
        },
        link: function (scope, ele, attrs) {

            // SERVICE PROMISE
            d3Service.d3().then(function (d3) {

                var renderTimeout;

                var margin = parseInt(attrs.margin) || 20,
                    barHeight = parseInt(attrs.barHeight) || 20,
                    barPadding = parseInt(attrs.barPadding) || 5;

                var svg = d3.select(ele[0]).append('svg').style('width', '100%');

                $window.onresize = function () {
                    scope.$apply();
                };

                // WINDOW RESIZE WATCHER
                scope.$watch(function () {
                    return angular.element($window)[0].innerWidth;
                }, function () {
                    scope.render(scope.data);
                });

                // DATA CHANGE WATCHER
                scope.$watch('data', function (newData) {
                    scope.render(newData);
                }, true);

                // RENDER

                scope.render = function (data) {

                    svg.selectAll('*').remove();

                    if (!data) return;
                    if (renderTimeout) clearTimeout(renderTimeout);

                    renderTimeout = $timeout(function () {

                        var width = d3.select(ele[0]).node().offsetWidth - margin,
                            height = scope.data.length * (barHeight + barPadding),
                            color = d3.scale.category20(),
                            xScale = d3.scale.linear()
                                .domain([0, //d3.max(d3.values(data))
                                    d3.max(
                                        data, function (d) {
                                            return d.score;
                                        })
                                ])
                                .range([0, width]);

                        svg.attr('height', height);

                        svg.selectAll('rect')
                            .data(data)
                            .enter()
                            .append('rect')
                            .on('click', function (d, i) {
                                return scope.onClick({item: d});
                            })
                            .attr('height', barHeight)
                            .attr('width', 140)
                            .attr('x', Math.round(margin / 2))
                            .attr('y', function (d, i) {
                                return i * (barHeight + barPadding);
                            })
                            .attr('fill', function (d) {
                                return color(d.score);
                            })
                            .transition()
                            .duration(1000)
                            .attr('width', function (d) {
                                return xScale(d.score);
                            });

                        svg.selectAll('text')
                            .data(data)
                            .enter()
                            .append('text')
                            .attr('fill', '#000')
                            .attr('y', function (d, i) {
                                return i * (barHeight + barPadding) + 15;
                            })
                            .attr('x', 15)
                            .text(function (d) {
                                return d.name + " (total links: " + d.score + ")";
                            });

                    }, 200); // END renderTimeout()

                }; // end scope.render

            }); // D3 from service

        } // END link:

    } // RETURN

}]); // bars DIRECTIVE

