var gamePanel = angular.module('gamePanel', ['ngResource','chart.js']);

gamePanel.factory('socket', function($rootScope) {
	var socket = io.connect();
	return {
		on: function(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		}
	};
});

gamePanel.factory('TeamRefresh', function($resource) {
    return $resource("/ranking", {}, {
        query: {
            isArray: true
        }
    });
});

gamePanel.controller('mainController', function($scope, $http, socket, TeamRefresh) {
    $scope.formData = {};
    var getData = function() {
        $http.get('/ranking')
            .success(function(data) {
                $scope.teams = data;
                $scope.labels = [];
                $scope.data = [[]];
                for (var i=0; i<$scope.teams.length; i++) {
                    $scope.labels[i] = $scope.teams[i].local.name;
                    $scope.data[0][i] = ($scope.teams[i].local.flags);
                };

                console.log($scope.labels);
                console.log($scope.data)
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    }
    
    getData();
    
    socket.on('listChange', function(data) {
        getData();
        
	});
});