module.exports = function(grunt) {
    grunt.initConfig({
        ngdocs: {
            all: ["./app/scripts/*.js"]
        },
        watch: {
            scripts: {
                files: ["app/scripts/*.js"],
                tasks: ['ngdocs']
            }
        }
    });

    grunt.loadNpmTasks("grunt-ngdocs");
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask("default", "ngdocs");
};
