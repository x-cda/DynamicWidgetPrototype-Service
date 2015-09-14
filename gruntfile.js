
// Gruntfile
/*jslint devel: true, node: true, white:true */

module.exports = function (grunt) {
    'use strict';
    require('load-grunt-tasks')(grunt);

    // Config variables
    var configVars = {
        'build': 'build',
        'dist': 'dist',
        'dist_www': '../gh-pages',
        'dist_bower': '../bower-repo',
        'www_server': 'localhost',
        'www_port': '8008',
        'e2e_port': '8001'
    };


    grunt.initConfig({
        cvars: configVars,
        bower: {
            setup: {
                options: { install: true, copy: false }
            }
        },
        shell: {
            'webdriver-manager-update': {
                command: 'node_modules/protractor/bin/webdriver-manager update',
                options: {
                    async: false
                }
            }
        },
        copy: {
            'build-www': {
                files: [
                    {
                        expand: true, cwd: 'www/',
                        src: ['index.html','css/**', 'views/**', 'js/main.js', 'js/scripts/**'],
                        dest: '<%= cvars.build %>/www/'
                    }
                ]
            }
        },
        connect: {
            // URL should be: http://localhost:9768/www/ to simulate github pages
            options : {
                hostname: '<%= cvars.www_server %>'
            },
            'serve-www': {
                options : {
                    port: '<%= cvars.www_port %>',
                    base: '.',
                    keepalive: true
                }
            },
            'e2e-www': {
                options : {
                    port: '<%= cvars.e2e_port %>',
                    base: './www',
                    keepalive: false
                }
            }
        },
        open: {
            'serve-www': {
                path: 'http://<%= cvars.www_server %>:<%= cvars.www_port %>/',
                app: 'Google Chrome'
            }
        },
        concat: {
            'build': {
                options: {
                    'banner': configVars.proj_banner,
                    'stripBanners': true
                },
                files: {
                    '<%= cvars.build %>/angularAMD.js': ['src/angularAMD.js'],
                    '<%= cvars.build %>/ngload.js': ['src/ngload.js']
                }
            }
        },
        ngAnnotate: {
            'dist-www': {
                files: [{
                    expand: true,
                    cwd: 'www/js/scripts/',
                    src: '**/*.js',
                    dest: '<%= cvars.dist_www %>/js/scripts/'
                }]
            }
        }
    });

    /* Run sample website */
    grunt.registerTask('setup-www', ['copy:setup-www']);
    grunt.registerTask('serve-www', [
        'open',
        'connect:serve-www'
    ]);
};



