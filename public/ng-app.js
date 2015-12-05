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
    
    $http.get('/ranking')
        .success(function(data) {
            $scope.teams = data;
            console.log($scope.teams);
            $scope.labels = $scope.teams.local.name;
            $scope.data = $scope.teams.local.flags.length;
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    
    
    
    //For each Team, get team name and size of flag array and save to scope.
    
    // when landing on the page, get all games and show them
    $http.get('/api/games')
        .success(function(data) {
            $scope.games = data;
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    
    $http.get('/api/queue')
        .success(function(data) {
            $scope.queue = data;
        })
        .error(function(data) {
            console.log('Error: ' + data)
        });
    

    // when submitting the add form, send the text to the node API
    $scope.createGame = function() {
        $scope.formData.user = true;
        console.log($scope.formData);
        $http.post('/api/games', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.games = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    // delete a game after checking it
    $scope.deleteGame = function(id) {
        $http.delete('/api/games/' + id)
            .success(function(data) {
                $scope.games = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };
    
    
    
//    var getGames = function() {
//        var games = GameRefresh.query();
//        games.$promise.then(function(promiseData) {
//            $scope.games = promiseData;
//        });
//    };
    
    socket.on('listChange', function(data) {
        var games = GameRefresh.query();
        games.$promise.then(function(promiseData) {
            $scope.games = promiseData;
        });
        var queue = QueueRefresh.query();
        queue.$promise.then(function(promiseData) {
            $scope.queue = promiseData;
        });
	});
});