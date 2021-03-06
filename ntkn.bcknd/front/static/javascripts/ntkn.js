(function(){
	"use strict";
	angular.module('ntkn', ['ui.router', 'ngMaterial', 'http-auth-interceptor', 'md.data.table'])
	.config(function ($stateProvider, $urlRouterProvider, USER_ROLES, $mdThemingProvider) {
		$mdThemingProvider.theme('default')
    		.primaryPalette('blue')
    		.accentPalette('orange')
			.warnPalette('red');
			//.backgroundPalette('white');




		$stateProvider
		.state('login', {
			url: '/login',
			templateUrl: '/static/views/authentication/login.html',
			controller: 'LoginCtrl'
		})
		.state('dashboard', {//Main Aplications. Login Required
	    		url: '/dashboard',
			abstract: true,
			template: "<ui-view/>",
			resolve:{
				authenticated: function(AuthService){
					return AuthService.authenticationStatus();
				}
			}
	  	})
	  	.state('dashboard.profile', {
    			url: '/profile',
 			templateUrl: '/static/views/profile.html',
  			controller: 'ProfileCtrl'

  		})
  		.state('dashboard.student',{
  			url: '/student',
  			templateUrl: '/static/views/student.html',
  			controller: 'StudentDashCtrl',
  			data: {
	      		authorizedRoles: [USER_ROLES.student]
		     }
  		})

		//Administrator routes
  		.state('dashboard.administrator', {
  			url: '/administrator',
  			templateUrl: '/static/views/administrator.html',
			controller: 'AdministratorCtrl',
  			data: {
	      		authorizedRoles: [USER_ROLES.administrator]
		    }
  		}).state('dashboard.administrator.school_years', {
			controller: 'AdminSchoolYearCtrl',
			url: '/school-years',
			templateUrl: '/static/views/administrator.school_years.html',
		}).state('dashboard.administrator.school_years.create', {
			controller: 'AdminCreateSchoolYearCtrl',
			url: '/create',
			templateUrl: '/static/views/administrator.school_years.details.html',
		}).state('dashboard.administrator.school_years.edit', {
			controller: 'AdminEditSchoolYearCtrl',
			url: '/edit',
			templateUrl: '/static/views/administrator.school_years.details.html',
		}).state('dashboard.administrator.educative_programs',{
			controller: 'AdminEducativeProgramsCtrl',
			controllerAs: 'ctrl',
			url: '/educative-programs',
			templateUrl: '/static/views/administrator.educative_programs.html'
		})

  		.state('dashboard.teacher', {

  			url: '/teacher',
  			templateUrl: '/static/views/teacher.html',
  			controller: 'TeacherDashCtrl',
  			data: {
	      		authorizedRoles: [USER_ROLES.teacher]
		    }
  		});
  		//$urlRouterProvider.otherwise('/dashboard/profile');
	})

	.run(function ($http, $rootScope, $state, AuthService, AUTH_EVENTS){
		$http.defaults.xsrfHeaderName = 'X-CSRFToken';
		$http.defaults.xsrfCookieName = 'csrftoken';

		$rootScope.$on('$stateChangeError',
			function (event, toState, toParams, fromState, fromParams, error){
				console.log(error);
				if (error && error.error === "not-authenticated") {
		  			console.log("No authenticated. Redirect to login");
      				$state.go('login', {reload: true});
		  		}
			});

		$rootScope.$on('$stateChangeStart', 
			function(event,next, nextParams, fromState){
				//console.log('$stateChangeStart');
				if('data' in next && 'authorizedRoles' in next.data){
					var authorizedRoles = next.data.authorizedRoles;
					if (!AuthService.isAuthorized(authorizedRoles)){
						event.preventDefault();
						console.log("No authorized. Redirect to previous page");
						$state.go($state.current, {}, {reload: true});
						//$rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
					}
				}
			});
		//Authentication.initialize('//localhost:8000/rest-auth', false);
	})

})();
