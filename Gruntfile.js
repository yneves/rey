// - -------------------------------------------------------------------- - //

'use strict';

module.exports = (grunt) => {

  grunt.initConfig({

    package: grunt.file.readJSON('./package.json'),

    babel: {
      distribute: {
        options: {
          presets: ['es2015']
        },
        files: [{
          src: ['./dist/rey.browserify.js'],
          dest: './dist/rey.babel.js'
        }]
      }
    },

    browserify: {

      distribute: {
        options: {
          detectGlobals: false,
          browserifyOptions: {
            standalone: 'rey'
          }
        },
        files: {
          './dist/rey.browserify.js': './index.js'
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
          './dist/rey.js': './dist/rey.babel.js'
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

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-envify');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('distribute', [
    'browserify:distribute',
    'babel:distribute',
    'envify:distribute',
    'uglify:distribute'
  ]);

  grunt.registerTask('default', [
    'distribute'
  ]);

};
// - -------------------------------------------------------------------- - //
