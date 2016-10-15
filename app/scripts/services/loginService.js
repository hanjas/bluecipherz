'use strict';

/**
 * @ngdoc service
 * @name bluroeApp.powerprogress
 * @description
 * # powerprogress
 * Service in the bluroeApp.
 */
angular.module('alFjrApp')
    .service('loginService', function () {
        this.host = 'http://localhost:8000/api';
        // this.host = 'http://api.bluecipherz.com/api';
    });
