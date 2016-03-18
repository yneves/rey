// - -------------------------------------------------------------------- - //

"use strict";

module.exports = function(grunt) {

  grunt.initConfig({
    
    package: grunt.file.readJSON("./package.json"),
    
    browserify: {
      
      development: {
        options: {
          detectGlobals: false,
          browserifyOptions: {
            standalone: "rey"
          },
          alias: [
            "../fluks/:fluks",
            "../rooter/:rooter"
          ]
        },
        files: {
          "./dist/rey.js": "./src/index.js",
        },
      },
      
      distribute: {
        options: {
          detectGlobals: false,
          browserifyOptions: {
            standalone: "rey"
          },
        },
        files: {
          "./dist/rey.js": "./src/index.js",
        },
      }
      
    },

    uglify: {
      
      distribute: {
        src: "./dist/rey.js",
        dest: "./dist/rey.min.js"
      }
      
    }

  });
  
  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.registerTask("development", [
    "browserify:development"
  ]);
  
  grunt.registerTask("distribute", [
    "browserify:distribute",
    "uglify:distribute"
  ]);

};
// - -------------------------------------------------------------------- - //
