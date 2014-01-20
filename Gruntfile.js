module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        es3: true,
        immed: true,
        indent: 2,
        latedef: true,
        newcap: true,
        noarg: true,
        quotmark: true,
        undef: true,
        unused: true,
        strict: true,
        trailing: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      grunt: {
        src: ['Gruntfile.js'],
        options: {
          node: true
        }
      },
      src: {
        src: ['selector-observer.js']
      },
      test: {
        options: {
          globals: {
            'SelectorObserver': false,
            'QUnit': false,
            'module': false,
            'test': false,
            'asyncTest': false,
            'expect': false,
            'start': false,
            'stop': false,
            'ok': false,
            'equal': false
          }
        },
        src: ['test/**/*.js']
      }
    },
    qunit: {
      all: ['test/test-model.html']
    },
    connect: {
      server: {
        options: {
          base: '',
          port: 9999
        }
      }
    },
    'saucelabs-qunit': {
      all: {
        options: {
          urls: ['http://127.0.0.1:9999/test/test.html'],
          tunnelTimeout: 5,
          build: process.env.TRAVIS_JOB_ID,
          concurrency: 1,
          browsers: [
            { browserName: 'safari', platform: 'OS X 10.9' },
            { browserName: 'chrome', platform: 'Linux' },
            { browserName: 'firefox', platform: 'Windows 8.1' },
            { browserName: 'internet explorer', version: '11', platform: 'Windows 8.1' },
            { browserName: 'internet explorer', version: '10', platform: 'Windows 8' },
            { browserName: 'internet explorer', version: '9', platform: 'Windows 7' }
          ]
        }
      }
    },
    watch: {
      grunt: {
        files: ['<%= jshint.grunt.src %>'],
        tasks: ['jshint:grunt']
      },
      src: {
        files: ['<%= jshint.src.src %>'],
        tasks: ['jshint:src', 'qunit:all']
      },
      test: {
        files: ['<%= jshint.test.src %>', 'test/*.html'],
        tasks: ['jshint:test', 'qunit:all']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-saucelabs');

  grunt.registerTask('test', ['jshint', 'qunit:all']);
  grunt.registerTask('sauce', ['connect', 'saucelabs-qunit']);
  grunt.registerTask('default', ['jshint']);
};
