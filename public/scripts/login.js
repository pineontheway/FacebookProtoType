var facebookApplication = angular.module('facebookApplication', []);
		facebookApplication.controller('loginController',function($scope, $http) {
			$scope.submit = function() {
				var username=document.getElementById('username');
				$http({ 
					method : "POST", 
					url : '/userLogin', 
					data : {"email" : $scope.email , "password": $scope.password} }) 
				.success(function(data) {
					alert("success"); 
					if (data.statusCode == 401) {
						$scope.invalid_login = false;
						$scope.unexpected_error = true;
					}
					else
						//Making a get call to the '/redirectToHomepage' API
						window.location.assign("/homepage"); 
				}) 
				.error(function(error) { 
					alert("error"); 
				}); 
			}; 
		});
		
		facebookApplication.controller('signUpController',function($scope, $http) {
			$scope.submit = function() {
			var username=document.getElementById('firstName');	
				$http({ 
					method : "POST", 
					url : '/userSignup', 
					data : {"firstName" : $scope.firstName , "lastName": $scope.lastName,"email":$scope.email,"confirmEmail":$scope.confirmEmail,"signupPassword":$scope.signupPassword,"date":$scope.date,"month":$scope.month,"year":$scope.year,"gender":$scope.gender} }) 
				.success(function(data) { 
					if(data.failure=="Details found in database. Email id already exists"){
						alert(data.failure);
						$scope.accountExixtsMessage = data.failure;
					}
					else if(data.success=="Account Created"){
						location.href = "http://www.example.com/ThankYou.html"
					}
				}) 
				.error(function(error) { 
					alert("error"); 
				}); 
			}; 
		});