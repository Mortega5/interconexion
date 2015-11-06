module.exports = function(grunt) {
  grunt.initConfig({
    ngdocs: {
      all: ["./app/scripts/*.js"]
    }
  });


  grunt.loadNpmTasks("grunt-ngdocs");

  grunt.registerTask("default", "ngdocs");
};
