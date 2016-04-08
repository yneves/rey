// - -------------------------------------------------------------------- - //

'use strict';

module.exports = function (grunt) {

  grunt.initConfig({

    package: grunt.file.readJSON('./package.json'),

    browserify: {

      distribute: {
        options: {
          detectGlobals: false,
          browserifyOptions: {
            standalone: 'rey'
          }
        },
        files: {
          './dist/rey.dev.js': './src/index.js'
        }
      }

    },

    envify: {
      distribute: {
        options: {
          env: {
            NODE_ENV: 'production'
          }
        },
        files: {
          './dist/rey.js': './dist/rey.dev.js'
        }
      }
    },

    uglify: {

      distribute: {
        src: './dist/rey.js',
        dest: './dist/rey.min.js'
      }

    }

  });

  grunt.loadNpmTasks('grunt-envify');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('distribute', [
    'browserify:distribute',
    'envify:distribute',
    'uglify:distribute'
  ]);

  grunt.registerTask('default', [
    'distribute'
  ]);

};
// - -------------------------------------------------------------------- - //
